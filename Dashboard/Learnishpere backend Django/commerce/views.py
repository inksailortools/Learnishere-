import hashlib
import json
import logging
import mimetypes
import re
import uuid
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from functools import wraps

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.http import FileResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import payments
from .models import (
    Course,
    CourseLesson,
    CourseModule,
    Coupon,
    Enrollment,
    Order,
    OrderItem,
    Payment,
    Refund,
    WebhookEvent,
)

logger = logging.getLogger(__name__)
User = get_user_model()
CENT = Decimal("0.01")


def error(message, status=400):
    return JsonResponse({"detail": message}, status=status)


def json_body(request):
    try:
        body = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return body if isinstance(body, dict) else None


def authenticated_student(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated or not user.is_active or not user.is_email_verified:
            return error("Authentication required.", 401)
        if user.role != User.Role.STUDENT:
            return error("A student account is required.", 403)
        return view(request, *args, **kwargs)

    return wrapped


def super_admin(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated or not user.is_active:
            return error("Authentication required.", 401)
        if user.role != User.Role.SUPER_ADMIN or not user.is_staff:
            return error("Super Admin access is required.", 403)
        return view(request, *args, **kwargs)

    return wrapped


def money(value):
    return format(value, ".2f") if value is not None else None


def pricing_data(course):
    price = course.current_price()
    list_price = course.list_price
    discount = max(list_price - price, Decimal("0.00")) if price is not None and list_price else Decimal("0.00")
    discount_percent = (
        int((discount * Decimal("100") / list_price).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        if list_price and discount
        else 0
    )
    return {
        "price": money(price),
        "selling_price": money(price),
        "list_price": money(list_price),
        "promotional_price": money(course.promotional_price),
        "currency": course.currency,
        "discount_amount": money(discount),
        "discount_percent": discount_percent,
        "price_available": price is not None,
        "available": course.available,
        "purchase_eligible": course.purchase_eligible,
        "purchasable": course.can_purchase,
    }


def lesson_data(lesson):
    return {
        "id": lesson.pk,
        "title": lesson.title,
        "description": lesson.description,
        "type": lesson.lesson_type,
        "duration": lesson.duration,
        "is_preview": lesson.is_preview,
        "is_required": lesson.is_required,
        "download_allowed": lesson.download_allowed,
        "completion_rule": lesson.completion_rule,
        "preview_available": lesson.is_preview and lesson.published,
        "preview_content": lesson.preview_content if lesson.is_preview else "",
    }


def course_data(course, *, detail=False):
    data = {
        "id": course.pk,
        "slug": course.slug,
        "title": course.title,
        "category": course.category,
        "qualification": course.qualification,
        "type": course.qualification,
        "description": course.description,
        "image": course.cover_image_url,
        "cover_image_url": course.cover_image_url,
        "duration": course.duration,
        "level": course.difficulty,
        "difficulty": course.difficulty,
        "published": course.published,
        "featured": course.featured,
        **pricing_data(course),
    }
    if detail:
        data.update(
            {
                "overview": course.overview or course.description,
                "outcomes": course.learning_outcomes,
                "learning_outcomes": course.learning_outcomes,
                "skills": course.skills,
                "benefits": course.benefits,
                "prerequisites": course.prerequisites,
                "certificate_information": course.certificate_information,
                "instructor": {
                    "name": course.instructor_name,
                    "bio": course.instructor_bio,
                    "image": course.instructor_image_url,
                },
                "modules": [
                    {
                        "id": module.pk,
                        "title": module.title,
                        "description": module.description,
                        "learning_objectives": module.learning_objectives,
                        "thumbnail_url": module.thumbnail_url,
                        "lessons": [
                            lesson_data(lesson)
                            for lesson in module.lessons.filter(published=True)
                        ],
                    }
                    for module in course.modules.all()
                ],
            }
        )
    return data


def admin_course_data(course):
    data = course_data(course, detail=True)
    data.update(
        {
            "published": course.published,
            "available": course.available,
            "purchase_eligible": course.purchase_eligible,
            "selling_price": money(course.selling_price),
            "list_price": money(course.list_price),
            "promotional_price": money(course.promotional_price),
            "promotion_starts_at": course.promotion_starts_at.isoformat() if course.promotion_starts_at else None,
            "promotion_ends_at": course.promotion_ends_at.isoformat() if course.promotion_ends_at else None,
            "instructor_name": course.instructor_name,
            "instructor_bio": course.instructor_bio,
            "instructor_image_url": course.instructor_image_url,
            "certificate_information": course.certificate_information,
            "editor_data": course.editor_data,
            "prerequisites": course.prerequisites,
            "overview": course.overview,
            "enrollment_count": course.enrollments.filter(active=True).count(),
            "updated_at": course.updated_at.isoformat(),
        }
    )
    data["modules"] = [
        {
            "id": module.pk,
            "title": module.title,
            "description": module.description,
            "learning_objectives": module.learning_objectives,
            "thumbnail_url": module.thumbnail_url,
            "position": module.position,
            "lessons": [
                {
                    "id": lesson.pk,
                    "title": lesson.title,
                    "description": lesson.description,
                    "type": lesson.lesson_type,
                    "duration": lesson.duration,
                    "position": lesson.position,
                    "is_preview": lesson.is_preview,
                    "is_required": lesson.is_required,
                    "download_allowed": lesson.download_allowed,
                    "completion_rule": lesson.completion_rule,
                    "published": lesson.published,
                    "preview_content": lesson.preview_content,
                    "preview_resource_url": lesson.preview_resource_url,
                    "protected_resource_url": lesson.protected_resource_url,
                }
                for lesson in module.lessons.all()
            ],
        }
        for module in course.modules.all()
    ]
    return data


@require_POST
@super_admin
def admin_upload(request):
    uploaded = request.FILES.get("file")
    kind = request.POST.get("kind")
    if uploaded is None or kind not in {"image", "video", "document"}:
        return error("Choose a supported course image, video, or PDF file.")

    max_size = {
        "image": 10 * 1024 * 1024,
        "video": 100 * 1024 * 1024,
        "document": 50 * 1024 * 1024,
    }[kind]
    if uploaded.size > max_size:
        return error(f"The {kind} file must be no larger than {max_size // (1024 * 1024)} MB.")

    header = uploaded.read(12)
    uploaded.seek(0)
    file_type = None
    if kind == "image":
        if header.startswith(b"\xff\xd8\xff"):
            file_type = ("jpg", "image/jpeg")
        elif header.startswith(b"\x89PNG\r\n\x1a\n"):
            file_type = ("png", "image/png")
        elif header.startswith(b"RIFF") and header[8:12] == b"WEBP":
            file_type = ("webp", "image/webp")
    elif header[4:8] == b"ftyp":
        file_type = ("mp4", "video/mp4")
    elif header.startswith(b"\x1a\x45\xdf\xa3"):
        file_type = ("webm", "video/webm")
    elif kind == "document" and header.startswith(b"%PDF-"):
        file_type = ("pdf", "application/pdf")

    if file_type is None:
        expected = "JPEG, PNG, or WebP" if kind == "image" else "MP4 or WebM" if kind == "video" else "PDF"
        return error(f"Upload a valid {expected} file.")
    if uploaded.content_type not in {"", "application/octet-stream", file_type[1]}:
        return error("The uploaded file type does not match its content.")

    storage_path = default_storage.save(f"courses/{uuid.uuid4().hex}.{file_type[0]}", uploaded)
    url = request.build_absolute_uri(f"{settings.MEDIA_URL}{storage_path}")
    return JsonResponse({"url": url}, status=201)


@require_GET
def course_media(request, storage_path):
    if not re.fullmatch(r"courses/[a-f0-9]{32}\.(?:jpg|png|webp|mp4|webm|pdf)", storage_path):
        return error("Media file not found.", 404)
    if not default_storage.exists(storage_path):
        return error("Media file not found.", 404)
    content_type = mimetypes.guess_type(storage_path)[0] or "application/octet-stream"
    response = FileResponse(default_storage.open(storage_path, "rb"), content_type=content_type)
    response["Cache-Control"] = "public, max-age=31536000, immutable"
    response["X-Content-Type-Options"] = "nosniff"
    return response


def _admin_module_data(module):
    return {
        "id": module.pk,
        "title": module.title,
        "description": module.description,
        "learning_objectives": module.learning_objectives,
        "thumbnail_url": module.thumbnail_url,
        "position": module.position,
        "lessons": [
            {
                "id": lesson.pk,
                "title": lesson.title,
                "description": lesson.description,
                "type": lesson.lesson_type,
                "duration": lesson.duration,
                "position": lesson.position,
                "is_preview": lesson.is_preview,
                "is_required": lesson.is_required,
                "download_allowed": lesson.download_allowed,
                "completion_rule": lesson.completion_rule,
                "published": lesson.published,
                "preview_content": lesson.preview_content,
                "preview_resource_url": lesson.preview_resource_url,
                "protected_resource_url": lesson.protected_resource_url,
            }
            for lesson in module.lessons.all()
        ],
    }


def order_data(order):
    payment = getattr(order, "payment", None)
    return {
        "id": str(order.pk),
        "status": order.status,
        "currency": order.currency,
        "subtotal": money(order.subtotal),
        "discount_amount": money(order.discount_amount),
        "tax_rate": money(order.tax_rate),
        "tax_amount": money(order.tax_amount),
        "total_amount": money(order.total_amount),
        "coupon_code": order.coupon_code,
        "created_at": order.created_at.isoformat(),
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "payment": (
            {
                "provider": payment.provider,
                "provider_order_id": payment.provider_order_id,
                "status": payment.status,
            }
            if payment
            else None
        ),
        "items": [
            {
                "course_id": item.course_id,
                "slug": item.course.slug,
                "title": item.course_title,
                "image": item.course.cover_image_url,
                "unit_price": money(item.unit_price),
                "list_price": money(item.list_price),
                "currency": item.currency,
            }
            for item in order.items.select_related("course").all()
        ],
    }


def _decimal_setting(value, label):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f"{label} is not configured correctly.") from exc


def _coupon_discount(coupon, subtotal, student, now):
    if not coupon.is_active:
        raise ValueError("This coupon is not active.")
    if coupon.starts_at and coupon.starts_at > now:
        raise ValueError("This coupon is not active yet.")
    if coupon.expires_at and coupon.expires_at <= now:
        raise ValueError("This coupon has expired.")
    if coupon.currency != "INR":
        raise ValueError("This coupon is not valid for this currency.")
    if coupon.max_uses is not None:
        used = Order.objects.filter(
            coupon=coupon,
            status__in=(Order.Status.PAID, Order.Status.REFUNDED, Order.Status.PARTIALLY_REFUNDED),
        ).count()
        if used >= coupon.max_uses:
            raise ValueError("This coupon has reached its usage limit.")
    if coupon.max_uses_per_user is not None:
        used_by_student = Order.objects.filter(
            coupon=coupon,
            student=student,
            status__in=(Order.Status.PAID, Order.Status.REFUNDED, Order.Status.PARTIALLY_REFUNDED),
        ).count()
        if used_by_student >= coupon.max_uses_per_user:
            raise ValueError("You have already used this coupon the maximum number of times.")
    if coupon.discount_type == Coupon.DiscountType.PERCENT:
        amount = (subtotal * coupon.discount_value / Decimal("100")).quantize(CENT, rounding=ROUND_HALF_UP)
    else:
        amount = coupon.discount_value
    return min(amount, subtotal)


def _quote(courses, coupon, student):
    if not courses:
        raise ValueError("Add at least one course before checkout.")
    currencies = {course.currency for course in courses}
    if len(currencies) != 1:
        raise ValueError("Courses with different currencies cannot be checked out together.")
    currency = currencies.pop()
    if currency != "INR":
        raise ValueError("Only INR checkout is currently enabled.")
    prices = []
    now = timezone.now()
    for course in courses:
        price = course.current_price(now)
        if not course.published or not course.available or not course.purchase_eligible:
            raise ValueError(f"{course.title} is not currently available for purchase.")
        if price is None:
            raise ValueError(f"{course.title} does not have a published price yet.")
        prices.append((course, price))
    subtotal = sum((price for _, price in prices), Decimal("0.00")).quantize(CENT)
    discount = _coupon_discount(coupon, subtotal, student, now) if coupon else Decimal("0.00")
    try:
        tax_rate = _decimal_setting(settings.COMMERCE_TAX_RATE, "Tax rate")
    except ValueError as exc:
        raise ValueError("Checkout is temporarily unavailable.") from exc
    if tax_rate < 0 or tax_rate > 100:
        raise ValueError("Tax rate must be between 0 and 100.")
    tax = ((subtotal - discount) * tax_rate / Decimal("100")).quantize(CENT, rounding=ROUND_HALF_UP)
    return {
        "currency": currency,
        "prices": prices,
        "subtotal": subtotal,
        "discount": discount,
        "tax_rate": tax_rate,
        "tax": tax,
        "total": (subtotal - discount + tax).quantize(CENT),
    }


def _minor_units(amount):
    return int((amount * Decimal("100")).to_integral_exact())


def _checkout_courses(data):
    course_ids = data.get("course_ids")
    if (
        not isinstance(course_ids, list)
        or not 1 <= len(course_ids) <= 10
        or any(not isinstance(course_id, int) or isinstance(course_id, bool) for course_id in course_ids)
        or len(set(course_ids)) != len(course_ids)
    ):
        raise ValueError("Select valid courses for checkout.")
    courses = list(
        Course.objects.filter(pk__in=course_ids, published=True)
        .prefetch_related("modules__lessons")
    )
    if len(courses) != len(course_ids):
        raise ValueError("One or more selected courses are no longer available.")
    return courses


@require_POST
@authenticated_student
def checkout_quote(request):
    data = json_body(request)
    if data is None:
        return error("Invalid checkout request.")
    coupon_code = data.get("coupon_code", "")
    if not isinstance(coupon_code, str) or len(coupon_code) > 40:
        return error("Enter a valid coupon code.")
    try:
        courses = _checkout_courses(data)
        if Enrollment.objects.filter(student=request.user, course__in=courses, active=True).exists():
            raise ValueError("You already own one or more selected courses.")
        coupon = None
        if coupon_code.strip():
            coupon = Coupon.objects.filter(code=coupon_code.strip().upper()).first()
            if coupon is None:
                raise ValueError("This coupon code is invalid.")
        quote = _quote(courses, coupon, request.user)
    except ValueError as exc:
        return error(str(exc), 409)
    return JsonResponse(
        {
            "currency": quote["currency"],
            "items": [
                {
                    "course_id": course.pk,
                    "title": course.title,
                    "unit_price": money(price),
                    "currency": course.currency,
                }
                for course, price in quote["prices"]
            ],
            "subtotal": money(quote["subtotal"]),
            "discount_amount": money(quote["discount"]),
            "tax_rate": money(quote["tax_rate"]),
            "tax_amount": money(quote["tax"]),
            "total_amount": money(quote["total"]),
            "coupon_code": coupon.code if coupon else "",
        }
    )


def _confirm_paid(order_id, payment_id, provider_data):
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order_id)
        payment = Payment.objects.select_for_update().get(order=order)
        expected_amount = _minor_units(order.total_amount)
        if (
            provider_data.get("id") != payment_id
            or provider_data.get("order_id") != payment.provider_order_id
            or provider_data.get("amount") != expected_amount
            or provider_data.get("currency") != order.currency
            or provider_data.get("status") != "captured"
        ):
            raise ValueError("The payment could not be verified.")
        if order.status == Order.Status.REFUNDED:
            raise ValueError("This order has already been refunded.")
        if payment.provider_payment_id not in (None, payment_id):
            raise ValueError("A different payment is already recorded for this order.")
        payment.provider_payment_id = payment_id
        payment.status = Payment.Status.CAPTURED
        payment.failure_reason = ""
        payment.save(update_fields=("provider_payment_id", "status", "failure_reason", "updated_at"))
        if order.status != Order.Status.PAID and order.status != Order.Status.PARTIALLY_REFUNDED:
            order.status = Order.Status.PAID
            order.paid_at = timezone.now()
            order.save(update_fields=("status", "paid_at", "updated_at"))
        for item in order.items.select_related("course").all():
            Enrollment.objects.get_or_create(
                student=order.student,
                course=item.course,
                defaults={"order_item": item},
            )
        return order


@require_GET
def course_list(request):
    courses = Course.objects.filter(published=True).prefetch_related("modules__lessons")
    return JsonResponse({"results": [course_data(course) for course in courses]})


@require_GET
def course_detail(request, slug):
    course = Course.objects.filter(published=True).prefetch_related("modules__lessons").filter(slug=slug).first()
    if course is None:
        return error("Course not found.", 404)
    return JsonResponse({"course": course_data(course, detail=True)})


@require_GET
def course_pricing(request, slug):
    course = Course.objects.filter(published=True, slug=slug).first()
    if course is None:
        return error("Course not found.", 404)
    return JsonResponse({"course": {"id": course.pk, "slug": course.slug, **pricing_data(course)}})


@require_GET
def lesson_preview(request, slug, lesson_id):
    lesson = (
        Course.objects.filter(published=True, slug=slug, modules__lessons__pk=lesson_id)
        .values("modules__lessons__title", "modules__lessons__description",
                "modules__lessons__is_preview", "modules__lessons__published",
                "modules__lessons__preview_content", "modules__lessons__preview_resource_url")
        .first()
    )
    if lesson is None or not lesson["modules__lessons__is_preview"] or not lesson["modules__lessons__published"]:
        return error("Preview lesson not found.", 404)
    return JsonResponse(
        {
            "lesson": {
                "title": lesson["modules__lessons__title"],
                "description": lesson["modules__lessons__description"],
                "content": lesson["modules__lessons__preview_content"],
                "resource_url": lesson["modules__lessons__preview_resource_url"],
            }
        }
    )


@require_POST
@authenticated_student
def checkout(request):
    if not payments.configured():
        return error("Online payments are not configured yet.", 503)
    data = json_body(request)
    if data is None or data.get("terms_accepted") is not True:
        return error("Accept the purchase terms before continuing.")
    course_ids = data.get("course_ids")
    if (
        not isinstance(course_ids, list)
        or not 1 <= len(course_ids) <= 10
        or any(not isinstance(course_id, int) or isinstance(course_id, bool) for course_id in course_ids)
        or len(set(course_ids)) != len(course_ids)
    ):
        return error("Select valid courses for checkout.")
    idempotency_key = request.headers.get("Idempotency-Key", "")
    try:
        checkout_key = uuid.UUID(idempotency_key) if idempotency_key else None
    except (ValueError, AttributeError):
        return error("Invalid checkout request.")
    coupon_code = data.get("coupon_code", "")
    if not isinstance(coupon_code, str) or len(coupon_code) > 40:
        return error("Enter a valid coupon code.")
    coupon_code = coupon_code.strip().upper()
    fingerprint = hashlib.sha256(
        json.dumps({"course_ids": sorted(course_ids), "coupon_code": coupon_code}, sort_keys=True).encode()
    ).hexdigest()

    try:
        with transaction.atomic():
            student = User.objects.select_for_update().get(pk=request.user.pk)
            existing = (
                Order.objects.filter(student=student, checkout_key=checkout_key)
                .prefetch_related("items__course")
                .first()
                if checkout_key
                else None
            )
            if existing:
                if existing.request_fingerprint != fingerprint:
                    return error("This checkout key was already used for a different cart.", 409)
                if hasattr(existing, "payment"):
                    return JsonResponse(
                        {
                            "order": order_data(existing),
                            "gateway": {
                                "key_id": settings.RAZORPAY_KEY_ID,
                                "order_id": existing.payment.provider_order_id,
                                "amount": _minor_units(existing.total_amount),
                                "currency": existing.currency,
                            },
                        },
                        status=200,
                    )
                return error("This checkout is no longer available. Start checkout again.", 409)

            courses = list(
                Course.objects.select_for_update()
                .filter(pk__in=course_ids, published=True)
                .prefetch_related("modules__lessons")
            )
            if len(courses) != len(course_ids):
                raise ValueError("One or more selected courses are no longer available.")
            if Enrollment.objects.filter(student=student, course__in=courses, active=True).exists():
                raise ValueError("You already own one or more selected courses.")
            pending_items = OrderItem.objects.filter(
                order__student=student,
                order__status=Order.Status.PENDING,
                course__in=courses,
            ).exists()
            if pending_items:
                raise ValueError("A checkout for one of these courses is already pending.")

            coupon = None
            if coupon_code:
                coupon = Coupon.objects.select_for_update().filter(code=coupon_code).first()
                if coupon is None:
                    raise ValueError("This coupon code is invalid.")
            quote = _quote(courses, coupon, student)
            order = Order.objects.create(
                student=student,
                checkout_key=checkout_key,
                request_fingerprint=fingerprint,
                currency=quote["currency"],
                subtotal=quote["subtotal"],
                discount_amount=quote["discount"],
                tax_rate=quote["tax_rate"],
                tax_amount=quote["tax"],
                total_amount=quote["total"],
                coupon=coupon,
                coupon_code=coupon.code if coupon else "",
                terms_accepted_at=timezone.now(),
            )
            for course, price in quote["prices"]:
                OrderItem.objects.create(
                    order=order,
                    course=course,
                    course_title=course.title,
                    unit_price=price,
                    list_price=course.list_price,
                    currency=course.currency,
                )
    except ValueError as exc:
        return error(str(exc), 409)
    except IntegrityError:
        if checkout_key:
            existing = Order.objects.filter(student=request.user, checkout_key=checkout_key).first()
            if existing and existing.request_fingerprint == fingerprint and hasattr(existing, "payment"):
                return JsonResponse({"order": order_data(existing)}, status=200)
        return error("This checkout could not be created. Please try again.", 409)

    try:
        provider_order_id = payments.create_order(order)
    except payments.PaymentGatewayError as exc:
        Order.objects.filter(pk=order.pk, status=Order.Status.PENDING).update(status=Order.Status.FAILED)
        return error(str(exc), 502)
    Payment.objects.create(
        order=order,
        provider_order_id=provider_order_id,
        amount=order.total_amount,
        currency=order.currency,
    )
    return JsonResponse(
        {
            "order": order_data(order),
            "gateway": {
                "key_id": settings.RAZORPAY_KEY_ID,
                "order_id": provider_order_id,
                "amount": _minor_units(order.total_amount),
                "currency": order.currency,
            },
        },
        status=201,
    )


@require_POST
@authenticated_student
def verify_payment(request):
    data = json_body(request)
    if data is None:
        return error("Invalid payment response.")
    try:
        order_id = uuid.UUID(str(data.get("order_id", "")))
    except (ValueError, TypeError, AttributeError):
        return error("Invalid payment response.")
    provider_payment_id = data.get("payment_id")
    signature = data.get("signature")
    if not isinstance(provider_payment_id, str) or len(provider_payment_id) > 100:
        return error("Invalid payment response.")
    order = (
        Order.objects.filter(pk=order_id, student=request.user)
        .select_related("payment")
        .first()
    )
    if order is None or not hasattr(order, "payment"):
        return error("Order not found.", 404)
    payment = order.payment
    if not payments.verify_checkout_signature(payment.provider_order_id, provider_payment_id, signature):
        return error("The payment signature is invalid.", 400)
    try:
        provider_data = payments.fetch_payment(provider_payment_id)
        _confirm_paid(order.pk, provider_payment_id, provider_data)
    except payments.PaymentGatewayError as exc:
        return error(str(exc), 502)
    except (ValueError, Payment.DoesNotExist) as exc:
        return error(str(exc), 400)
    order.refresh_from_db()
    return JsonResponse({"order": order_data(order), "detail": "Payment verified and course access granted."})


@csrf_exempt
@require_POST
def payment_webhook(request):
    signature = request.headers.get("X-Razorpay-Signature", "")
    if not payments.verify_webhook_signature(request.body, signature):
        return error("Invalid webhook signature.", 400)
    try:
        event = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return error("Invalid webhook event.", 400)
    if not isinstance(event, dict) or not isinstance(event.get("event"), str):
        return error("Invalid webhook event.", 400)
    event_id = request.headers.get("X-Razorpay-Event-Id") or hashlib.sha256(request.body).hexdigest()
    event_type = event["event"]
    entity = (
        event.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )
    refund_entity = event.get("payload", {}).get("refund", {}).get("entity", {})
    if not isinstance(entity, dict) or not isinstance(refund_entity, dict):
        return error("Invalid webhook event.", 400)
    try:
        with transaction.atomic():
            WebhookEvent.objects.create(event_id=event_id, event_type=event_type)
            if event_type in ("payment.captured", "payment.failed"):
                provider_order_id = entity.get("order_id")
                payment = Payment.objects.select_for_update().filter(provider_order_id=provider_order_id).first()
                if payment is None:
                    raise ValueError("Payment order not found.")
                if event_type == "payment.captured":
                    _confirm_paid(payment.order_id, entity.get("id"), entity)
                elif payment.order.status != Order.Status.PAID:
                    payment.status = Payment.Status.FAILED
                    payment.failure_reason = str(entity.get("error_description", ""))[:500]
                    payment.save(update_fields=("status", "failure_reason", "updated_at"))
                    payment.order.status = Order.Status.FAILED
                    payment.order.save(update_fields=("status", "updated_at"))
            elif event_type in ("refund.processed", "refund.failed"):
                refund = Refund.objects.select_for_update().filter(
                    provider_refund_id=refund_entity.get("id")
                ).first()
                if refund is not None:
                    refund.status = (
                        Refund.Status.PROCESSED
                        if event_type == "refund.processed"
                        else Refund.Status.FAILED
                    )
                    refund.processed_at = timezone.now() if event_type == "refund.processed" else None
                    refund.save(update_fields=("status", "processed_at"))
                    _refresh_refund_status(refund.order)
    except IntegrityError:
        return JsonResponse({"detail": "Webhook already processed."})
    except (ValueError, Payment.DoesNotExist) as exc:
        return error(str(exc), 400)
    return JsonResponse({"detail": "Webhook processed."})


def _refresh_refund_status(order):
    refunded = order.refunds.filter(status=Refund.Status.PROCESSED).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    if refunded >= order.total_amount:
        order.status = Order.Status.REFUNDED
        order.enrollments.update(active=False)
    elif refunded > 0:
        order.status = Order.Status.PARTIALLY_REFUNDED
    order.save(update_fields=("status", "updated_at"))


@require_GET
@authenticated_student
def order_list(request):
    orders = Order.objects.filter(student=request.user).prefetch_related("items__course").select_related("payment")
    return JsonResponse({"results": [order_data(order) for order in orders]})


@require_GET
@authenticated_student
def order_detail(request, order_id):
    order = Order.objects.filter(
        pk=order_id,
        student=request.user,
    ).prefetch_related("items__course").select_related("payment").first()
    if order is None:
        return error("Order not found.", 404)
    return JsonResponse({"order": order_data(order)})


@require_POST
@authenticated_student
def cancel_order(request, order_id):
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(
            pk=order_id,
            student=request.user,
        ).first()
        if order is None:
            return error("Order not found.", 404)
        if order.status != Order.Status.PENDING:
            return error("Only pending orders can be cancelled.", 409)
        order.status = Order.Status.CANCELLED
        order.save(update_fields=("status", "updated_at"))
    return JsonResponse({"detail": "Order cancelled."})


@require_GET
@authenticated_student
def my_courses(request):
    enrollments = (
        Enrollment.objects.filter(student=request.user, active=True)
        .select_related("course")
        .prefetch_related("course__modules__lessons")
    )
    results = []
    for enrollment in enrollments:
        course = enrollment.course
        serialized = course_data(course, detail=True)
        serialized.update(
            {
                "enrollment_id": enrollment.pk,
                "enrolled_at": enrollment.enrolled_at.isoformat(),
                "modules": [
                    {
                        "id": module.pk,
                        "title": module.title,
                        "description": module.description,
                        "lessons": [lesson_data(lesson) for lesson in module.lessons.filter(published=True)],
                    }
                    for module in course.modules.all()
                ],
            }
        )
        results.append(serialized)
    return JsonResponse({"results": results})


@require_GET
@authenticated_student
def enrolled_lesson(request, enrollment_id, lesson_id):
    enrollment = Enrollment.objects.filter(
        pk=enrollment_id,
        student=request.user,
        active=True,
    ).first()
    if enrollment is None:
        return error("Course access not found.", 404)
    lesson = CourseLesson.objects.filter(
        pk=lesson_id,
        module__course=enrollment.course,
        published=True,
    ).first()
    if lesson is None:
        return error("Lesson not found.", 404)
    return JsonResponse(
        {
            "lesson": {
                "id": lesson.pk,
                "title": lesson.title,
                "description": lesson.description,
                "type": lesson.lesson_type,
                "duration": lesson.duration,
                "resource_url": lesson.protected_resource_url,
                "available": bool(lesson.protected_resource_url),
            }
        }
    )


def _parse_decimal(value, label, *, optional=False):
    if optional and value in (None, ""):
        return None
    if not isinstance(value, (str, int, Decimal)) or isinstance(value, bool):
        raise ValueError(f"Enter a valid {label}.")
    try:
        number = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"Enter a valid {label}.") from exc
    if not number.is_finite() or number < 0:
        raise ValueError(f"Enter a valid {label}.")
    return number.quantize(CENT)


ADMIN_COURSE_FIELDS = {
    "slug", "title", "category", "qualification", "description", "overview",
    "cover_image_url", "duration", "difficulty", "prerequisites",
    "learning_outcomes", "skills", "benefits", "certificate_information",
    "editor_data",
    "instructor_name", "instructor_bio", "instructor_image_url", "published", "featured",
    "available", "purchase_eligible", "currency", "promotion_starts_at",
    "promotion_ends_at",
}


def _apply_course_fields(course, data):
    allowed = ADMIN_COURSE_FIELDS | {"selling_price", "list_price", "promotional_price"}
    for key, value in data.items():
        if key not in allowed:
            continue
        if key in {"selling_price", "list_price", "promotional_price"}:
            setattr(course, key, _parse_decimal(value, key.replace("_", " "), optional=True))
        elif key in {"published", "featured", "available", "purchase_eligible"}:
            if not isinstance(value, bool):
                raise ValueError(f"{key.replace('_', ' ').capitalize()} must be true or false.")
            setattr(course, key, value)
        elif key in {"learning_outcomes", "skills", "benefits"}:
            if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
                raise ValueError(f"{key.replace('_', ' ').capitalize()} must be a list of text.")
            setattr(course, key, value)
        elif key == "editor_data":
            if not isinstance(value, dict):
                raise ValueError("Course editor data must be an object.")
            try:
                encoded = json.dumps(value, allow_nan=False)
            except (TypeError, ValueError) as exc:
                raise ValueError("Course editor data must contain valid JSON values.") from exc
            if len(encoded) > 65536:
                raise ValueError("Course editor data must be smaller than 64 KB.")
            setattr(course, key, value)
        elif key in {"promotion_starts_at", "promotion_ends_at"}:
            if value in (None, ""):
                setattr(course, key, None)
            elif isinstance(value, str):
                from django.utils.dateparse import parse_datetime

                parsed = parse_datetime(value)
                if parsed is None:
                    raise ValueError(f"Enter a valid {key.replace('_', ' ')}.")
                setattr(course, key, parsed)
            else:
                raise ValueError(f"Enter a valid {key.replace('_', ' ')}.")
        elif not isinstance(value, str):
            raise ValueError(f"{key.replace('_', ' ').capitalize()} must be text.")
        else:
            setattr(course, key, value)
    course.currency = course.currency.strip().upper()
    if len(course.currency) != 3 or not re.fullmatch(r"[A-Z]{3}", course.currency):
        raise ValueError("Currency must be a three-letter ISO code.")
    try:
        course.full_clean()
    except ValidationError as exc:
        return JsonResponse({"detail": "Course validation failed.", "errors": exc.message_dict}, status=400)
    return None


@require_GET
@super_admin
def admin_course_list(request):
    courses = Course.objects.all().prefetch_related("modules__lessons")
    return JsonResponse({"results": [admin_course_data(course) for course in courses]})


@require_POST
@super_admin
def admin_course_list_post(request):
    data = json_body(request)
    if data is None:
        return error("Invalid course details.")
    course = Course()
    try:
        validation_error = _apply_course_fields(course, data)
    except ValueError as exc:
        return error(str(exc))
    if validation_error:
        return validation_error
    course.save()
    return JsonResponse({"course": admin_course_data(course)}, status=201)


@require_POST
@super_admin
def admin_course_detail(request, course_id):
    data = json_body(request)
    if data is None:
        return error("Invalid course details.")
    course = Course.objects.filter(pk=course_id).first()
    if course is None:
        return error("Course not found.", 404)
    try:
        validation_error = _apply_course_fields(course, data)
    except ValueError as exc:
        return error(str(exc))
    if validation_error:
        return validation_error
    course.save()
    return JsonResponse({"course": admin_course_data(course)})


@require_POST
@super_admin
def admin_course_modules(request, course_id):
    course = Course.objects.filter(pk=course_id).first()
    if course is None:
        return error("Course not found.", 404)
    data = json_body(request)
    title = data.get("title") if data else None
    description = data.get("description", "") if data else ""
    learning_objectives = data.get("learning_objectives", []) if data else []
    thumbnail_url = data.get("thumbnail_url", "") if data else ""
    if not isinstance(title, str) or not title.strip() or len(title) > 200:
        return error("Enter a valid module title.")
    if not isinstance(description, str) or not isinstance(thumbnail_url, str):
        return error("Enter valid module details.")
    if not isinstance(learning_objectives, list) or any(not isinstance(item, str) for item in learning_objectives):
        return error("Module learning objectives must be a list of text.")
    position = (course.modules.order_by("-position").values_list("position", flat=True).first() or 0) + 1
    module = CourseModule(
        course=course,
        title=title.strip(),
        description=description,
        learning_objectives=learning_objectives,
        thumbnail_url=thumbnail_url,
        position=position,
    )
    try:
        module.full_clean()
        module.save()
    except ValidationError as exc:
        return JsonResponse({"detail": "Module validation failed.", "errors": exc.message_dict}, status=400)
    return JsonResponse({"module": _admin_module_data(module)}, status=201)


@require_POST
@super_admin
def admin_module_detail(request, module_id):
    module = CourseModule.objects.filter(pk=module_id).first()
    if module is None:
        return error("Module not found.", 404)
    data = json_body(request)
    if data is None:
        return error("Invalid module details.")
    if data.get("delete") is True:
        module.delete()
        return JsonResponse({"deleted": True})
    for key in ("title", "description", "thumbnail_url"):
        if key in data:
            if not isinstance(data[key], str):
                return error(f"{key.capitalize()} must be text.")
            setattr(module, key, data[key].strip() if key == "title" else data[key])
    if "learning_objectives" in data:
        if not isinstance(data["learning_objectives"], list) or any(not isinstance(item, str) for item in data["learning_objectives"]):
            return error("Module learning objectives must be a list of text.")
        module.learning_objectives = data["learning_objectives"]
    try:
        module.full_clean()
        module.save()
    except ValidationError as exc:
        return JsonResponse({"detail": "Module validation failed.", "errors": exc.message_dict}, status=400)
    return JsonResponse({"module": _admin_module_data(module)})


@require_POST
@super_admin
def admin_course_module_order(request, course_id):
    course = Course.objects.filter(pk=course_id).first()
    if course is None:
        return error("Course not found.", 404)
    data = json_body(request)
    module_ids = data.get("module_ids") if data else None
    modules = list(course.modules.order_by("position", "id"))
    if (
        not isinstance(module_ids, list)
        or any(not isinstance(module_id, int) or isinstance(module_id, bool) for module_id in module_ids)
        or len(module_ids) != len(set(module_ids))
        or set(module_ids) != {module.pk for module in modules}
    ):
        return error("Provide each course module exactly once in the requested order.")
    offset = max((module.position for module in modules), default=0) + len(modules) + 1
    with transaction.atomic():
        for index, module_id in enumerate(module_ids):
            CourseModule.objects.filter(pk=module_id, course=course).update(position=offset + index)
        for position, module_id in enumerate(module_ids, start=1):
            CourseModule.objects.filter(pk=module_id, course=course).update(position=position)
    ordered = course.modules.order_by("position", "id")
    return JsonResponse({"modules": [_admin_module_data(module) for module in ordered]})


@require_POST
@super_admin
def admin_module_lessons(request, module_id):
    module = CourseModule.objects.filter(pk=module_id).first()
    if module is None:
        return error("Module not found.", 404)
    data = json_body(request)
    if data is None:
        return error("Invalid lesson details.")
    title = data.get("title")
    lesson_type = data.get("type", CourseLesson.LessonType.VIDEO)
    description = data.get("description", "")
    duration = data.get("duration", "")
    is_preview = data.get("is_preview", False)
    is_required = data.get("is_required", True)
    download_allowed = data.get("download_allowed", False)
    completion_rule = data.get("completion_rule", CourseLesson.CompletionRule.MARK_COMPLETE)
    published = data.get("published", False)
    if not isinstance(title, str) or not title.strip() or len(title) > 200:
        return error("Enter a valid lesson title.")
    if lesson_type not in CourseLesson.LessonType.values:
        return error("Choose a valid lesson type.")
    if not isinstance(description, str) or not isinstance(duration, str):
        return error("Enter valid lesson details.")
    if not all(isinstance(value, bool) for value in (is_preview, is_required, download_allowed, published)):
        return error("Lesson preview, requirement, download, and publication settings must be true or false.")
    if completion_rule not in CourseLesson.CompletionRule.values:
        return error("Choose a valid lesson completion rule.")
    position = (module.lessons.order_by("-position").values_list("position", flat=True).first() or 0) + 1
    lesson = CourseLesson(
        module=module,
        title=title.strip(),
        description=description,
        lesson_type=lesson_type,
        duration=duration,
        position=position,
        is_preview=is_preview,
        is_required=is_required,
        download_allowed=download_allowed,
        completion_rule=completion_rule,
        published=published,
        preview_content=data.get("preview_content", ""),
        preview_resource_url=data.get("preview_resource_url", ""),
        protected_resource_url=data.get("protected_resource_url", ""),
    )
    if not isinstance(lesson.preview_content, str):
        return error("Preview content must be text.")
    if not isinstance(lesson.preview_resource_url, str) or not isinstance(lesson.protected_resource_url, str):
        return error("Lesson resource URLs must be text.")
    try:
        lesson.full_clean()
        lesson.save()
    except ValidationError as exc:
        return JsonResponse({"detail": "Lesson validation failed.", "errors": exc.message_dict}, status=400)
    return JsonResponse({"lesson": _admin_module_data(module)["lessons"][-1]}, status=201)


@require_POST
@super_admin
def admin_module_lesson_order(request, module_id):
    module = CourseModule.objects.filter(pk=module_id).first()
    if module is None:
        return error("Module not found.", 404)
    data = json_body(request)
    lesson_ids = data.get("lesson_ids") if data else None
    lessons = list(module.lessons.order_by("position", "id"))
    if (
        not isinstance(lesson_ids, list)
        or any(not isinstance(lesson_id, int) or isinstance(lesson_id, bool) for lesson_id in lesson_ids)
        or len(lesson_ids) != len(set(lesson_ids))
        or set(lesson_ids) != {lesson.pk for lesson in lessons}
    ):
        return error("Provide each module lesson exactly once in the requested order.")
    offset = max((lesson.position for lesson in lessons), default=0) + len(lessons) + 1
    with transaction.atomic():
        for index, lesson_id in enumerate(lesson_ids):
            CourseLesson.objects.filter(pk=lesson_id, module=module).update(position=offset + index)
        for position, lesson_id in enumerate(lesson_ids, start=1):
            CourseLesson.objects.filter(pk=lesson_id, module=module).update(position=position)
    return JsonResponse({"lessons": _admin_module_data(module)["lessons"]})


@require_POST
@super_admin
def admin_lesson_detail(request, lesson_id):
    lesson = CourseLesson.objects.filter(pk=lesson_id).select_related("module").first()
    if lesson is None:
        return error("Lesson not found.", 404)
    data = json_body(request)
    if data is None:
        return error("Invalid lesson details.")
    for key, field in (
        ("title", "title"),
        ("description", "description"),
        ("type", "lesson_type"),
        ("duration", "duration"),
        ("preview_content", "preview_content"),
        ("preview_resource_url", "preview_resource_url"),
        ("protected_resource_url", "protected_resource_url"),
        ("completion_rule", "completion_rule"),
    ):
        if key in data:
            value = data[key]
            if not isinstance(value, str):
                return error(f"{key.replace('_', ' ').capitalize()} must be text.")
            if key == "type":
                if value not in CourseLesson.LessonType.values:
                    return error("Choose a valid lesson type.")
            if key == "completion_rule" and value not in CourseLesson.CompletionRule.values:
                return error("Choose a valid lesson completion rule.")
            setattr(lesson, field, value)
    for key in ("is_preview", "is_required", "download_allowed", "published"):
        if key in data:
            if not isinstance(data[key], bool):
                return error(f"{key.replace('_', ' ').capitalize()} must be true or false.")
            setattr(lesson, key, data[key])
    try:
        lesson.full_clean()
        lesson.save()
    except ValidationError as exc:
        return JsonResponse({"detail": "Lesson validation failed.", "errors": exc.message_dict}, status=400)
    lesson_data_value = next(
        item for item in _admin_module_data(lesson.module)["lessons"] if item["id"] == lesson.pk
    )
    return JsonResponse({"lesson": lesson_data_value})


@require_GET
@super_admin
def admin_coupon_list(request):
    return JsonResponse(
        {
            "results": [
                {
                    "id": coupon.pk,
                    "code": coupon.code,
                    "discount_type": coupon.discount_type,
                    "discount_value": money(coupon.discount_value),
                    "currency": coupon.currency,
                    "starts_at": coupon.starts_at.isoformat() if coupon.starts_at else None,
                    "expires_at": coupon.expires_at.isoformat() if coupon.expires_at else None,
                    "max_uses": coupon.max_uses,
                    "max_uses_per_user": coupon.max_uses_per_user,
                    "is_active": coupon.is_active,
                }
                for coupon in Coupon.objects.all()
            ]
        }
    )


@require_POST
@super_admin
def admin_coupon_list_post(request):
    data = json_body(request)
    if data is None:
        return error("Invalid coupon details.")
    code = data.get("code")
    discount_type = data.get("discount_type")
    active = data.get("is_active", True)
    if not isinstance(code, str) or not code.strip() or len(code) > 40:
        return error("Enter a valid coupon code.")
    if discount_type not in Coupon.DiscountType.values or not isinstance(active, bool):
        return error("Choose a valid coupon type and status.")
    try:
        value = _parse_decimal(data.get("discount_value"), "discount value")
        coupon = Coupon(
            code=code.strip().upper(),
            discount_type=discount_type,
            discount_value=value,
            currency=str(data.get("currency", "INR")).upper(),
            is_active=active,
        )
        for field in ("starts_at", "expires_at"):
            raw = data.get(field)
            if raw:
                from django.utils.dateparse import parse_datetime

                parsed = parse_datetime(raw) if isinstance(raw, str) else None
                if parsed is None:
                    raise ValueError(f"Enter a valid {field.replace('_', ' ')}.")
                setattr(coupon, field, parsed)
        for field in ("max_uses", "max_uses_per_user"):
            value = data.get(field)
            if value not in (None, ""):
                if not isinstance(value, int) or isinstance(value, bool) or value < 1:
                    raise ValueError(f"Enter a valid {field.replace('_', ' ')}.")
                setattr(coupon, field, value)
        coupon.full_clean()
        coupon.save()
    except ValueError as exc:
        return error(str(exc))
    except ValidationError as exc:
        return JsonResponse({"detail": "Coupon validation failed.", "errors": exc.message_dict}, status=400)
    except IntegrityError:
        return error("A coupon with this code already exists.", 409)
    return JsonResponse({"detail": "Coupon created.", "id": coupon.pk}, status=201)


@require_GET
@super_admin
def admin_order_list(request):
    orders = Order.objects.select_related("student", "payment").prefetch_related("items__course", "refunds")
    results = []
    for order in orders:
        data = order_data(order)
        data.update(
            {
                "student": {"email": order.student.email, "full_name": order.student.full_name},
                "refunded_amount": money(
                    order.refunds.filter(status=Refund.Status.PROCESSED).aggregate(total=Sum("amount"))["total"]
                    or Decimal("0.00")
                ),
            }
        )
        results.append(data)
    return JsonResponse({"results": results})


@require_POST
@super_admin
def admin_refund(request, order_id):
    data = json_body(request) or {}
    order = Order.objects.filter(pk=order_id).select_related("payment").first()
    if order is None:
        return error("Order not found.", 404)
    if order.status not in (Order.Status.PAID, Order.Status.PARTIALLY_REFUNDED):
        return error("Only paid orders can be refunded.", 409)
    payment = getattr(order, "payment", None)
    if payment is None or not payment.provider_payment_id:
        return error("The provider payment cannot be refunded.", 409)
    try:
        amount = _parse_decimal(data.get("amount"), "refund amount", optional=True)
        processed = order.refunds.filter(status=Refund.Status.PROCESSED).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        pending = order.refunds.filter(status=Refund.Status.PENDING).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        refundable = order.total_amount - processed - pending
        amount = amount if amount is not None else refundable
        if amount <= 0 or amount > refundable:
            raise ValueError("Refund amount exceeds the remaining refundable balance.")
        reason = data.get("reason", "")
        if not isinstance(reason, str) or len(reason) > 500:
            raise ValueError("Enter a valid refund reason.")
        result = payments.create_refund(payment, amount, reason)
    except ValueError as exc:
        return error(str(exc))
    except payments.PaymentGatewayError as exc:
        return error(str(exc), 502)
    refund_id = result.get("id")
    provider_status = result.get("status", "pending")
    status_map = {
        "pending": Refund.Status.PENDING,
        "processed": Refund.Status.PROCESSED,
        "failed": Refund.Status.FAILED,
    }
    if not isinstance(refund_id, str) or provider_status not in status_map:
        return error("The payment provider returned an invalid refund.", 502)
    with transaction.atomic():
        refund = Refund.objects.create(
            order=order,
            provider_refund_id=refund_id,
            amount=amount,
            reason=reason,
            status=status_map[provider_status],
            processed_at=timezone.now() if provider_status == "processed" else None,
        )
        if refund.status == Refund.Status.PROCESSED:
            _refresh_refund_status(order)
    return JsonResponse({"refund_id": refund.provider_refund_id, "status": refund.status}, status=201)


@require_GET
@super_admin
def admin_enrollment_list(request):
    enrollments = Enrollment.objects.select_related("student", "course").order_by("-enrolled_at")
    return JsonResponse(
        {
            "results": [
                {
                    "id": enrollment.pk,
                    "student_email": enrollment.student.email,
                    "student_name": enrollment.student.full_name,
                    "course_id": enrollment.course_id,
                    "course_title": enrollment.course.title,
                    "active": enrollment.active,
                    "enrolled_at": enrollment.enrolled_at.isoformat(),
                }
                for enrollment in enrollments
            ]
        }
    )
