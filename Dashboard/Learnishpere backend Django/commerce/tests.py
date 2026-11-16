import json
import tempfile
import uuid
from decimal import Decimal
from urllib.parse import urlparse
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from django.utils import timezone

from .models import Course, CourseLesson, CourseModule, Coupon, Enrollment, Order

User = get_user_model()


@override_settings(
    RAZORPAY_KEY_ID="rzp_test_key",
    RAZORPAY_KEY_SECRET="test-secret",
    RAZORPAY_WEBHOOK_SECRET="test-webhook-secret",
    COMMERCE_TAX_RATE="0",
)
class CommerceTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email="student@example.com",
            full_name="Student",
            password="Secure-Learning-Password-938!",
            is_email_verified=True,
        )
        self.course = Course.objects.create(
            slug="business-analysis",
            title="Business Analysis",
            category="Business",
            qualification=Course.Qualification.CERTIFICATION,
            description="A course description.",
            published=True,
            selling_price=Decimal("40.00"),
            list_price=Decimal("50.00"),
            currency="INR",
        )
        CourseModule.objects.create(course=self.course, title="Foundations", position=1)
        self.client.force_login(self.student)

    def start_checkout(self, *, payload=None, key=None):
        request = {
            "course_ids": [self.course.pk],
            "terms_accepted": True,
            "total": "0.01",
        }
        request.update(payload or {})
        with patch("commerce.views.payments.create_order", return_value="order_gateway_1") as create_order:
            response = self.client.post(
                "/api/checkout/",
                data=json.dumps(request),
                content_type="application/json",
                HTTP_IDEMPOTENCY_KEY=key or str(uuid.uuid4()),
            )
        return response, create_order

    def test_public_catalogue_returns_real_price_or_unavailable_without_placeholder_copy(self):
        response = self.client.get("/api/courses/")
        self.assertEqual(response.status_code, 200)
        course = next(
            item for item in response.json()["results"] if item["slug"] == self.course.slug
        )
        self.assertEqual(course["price"], "40.00")
        self.assertEqual(course["list_price"], "50.00")
        self.assertEqual(course["discount_percent"], 20)

        self.course.selling_price = None
        self.course.list_price = None
        self.course.save(update_fields=("selling_price", "list_price"))
        course = next(
            item
            for item in self.client.get("/api/courses/").json()["results"]
            if item["slug"] == self.course.slug
        )
        self.assertIsNone(course["price"])
        self.assertFalse(course["purchasable"])
        self.assertNotIn("Pricing available on enquiry", json.dumps(course))

    def test_checkout_uses_database_price_and_verifies_payment_before_enrollment(self):
        response, create_order = self.start_checkout()
        self.assertEqual(response.status_code, 201)
        order_payload = response.json()["order"]
        order = Order.objects.get(pk=order_payload["id"])
        self.assertEqual(order.total_amount, Decimal("40.00"))
        self.assertEqual(create_order.call_args.args[0].total_amount, Decimal("40.00"))
        self.assertEqual(Enrollment.objects.count(), 0)

        provider_payment = {
            "id": "payment_gateway_1",
            "order_id": "order_gateway_1",
            "amount": 4000,
            "currency": "INR",
            "status": "captured",
        }
        with (
            patch("commerce.views.payments.verify_checkout_signature", return_value=True),
            patch("commerce.views.payments.fetch_payment", return_value=provider_payment),
        ):
            verified = self.client.post(
                "/api/payments/verify/",
                {
                    "order_id": str(order.pk),
                    "payment_id": provider_payment["id"],
                    "signature": "valid",
                },
                content_type="application/json",
            )
        self.assertEqual(verified.status_code, 200)
        self.assertEqual(Enrollment.objects.count(), 1)
        self.assertEqual(Order.objects.get(pk=order.pk).status, Order.Status.PAID)

        with (
            patch("commerce.views.payments.verify_checkout_signature", return_value=True),
            patch("commerce.views.payments.fetch_payment", return_value=provider_payment),
        ):
            repeated = self.client.post(
                "/api/payments/verify/",
                {
                    "order_id": str(order.pk),
                    "payment_id": provider_payment["id"],
                    "signature": "valid",
                },
                content_type="application/json",
            )
        self.assertEqual(repeated.status_code, 200)
        self.assertEqual(Enrollment.objects.count(), 1)

    def test_checkout_rejects_unavailable_or_already_owned_courses(self):
        self.course.selling_price = None
        self.course.save(update_fields=("selling_price",))
        response, _ = self.start_checkout()
        self.assertEqual(response.status_code, 409)
        self.assertEqual(Order.objects.count(), 0)

        self.course.selling_price = Decimal("40.00")
        self.course.save(update_fields=("selling_price",))
        Enrollment.objects.create(
            student=self.student,
            course=self.course,
            order_item=self._paid_order_item(),
        )
        response, _ = self.start_checkout()
        self.assertEqual(response.status_code, 409)

    def _paid_order_item(self):
        order = Order.objects.create(
            student=self.student,
            currency="INR",
            subtotal=Decimal("40.00"),
            total_amount=Decimal("40.00"),
            terms_accepted_at=timezone.now(),
        )
        from .models import OrderItem

        return OrderItem.objects.create(
            order=order,
            course=self.course,
            course_title=self.course.title,
            unit_price=Decimal("40.00"),
            currency="INR",
        )

    def test_invalid_payment_signature_never_grants_access(self):
        response, _ = self.start_checkout()
        order_id = response.json()["order"]["id"]
        with patch("commerce.views.payments.verify_checkout_signature", return_value=False):
            rejected = self.client.post(
                "/api/payments/verify/",
                {"order_id": order_id, "payment_id": "payment_gateway_1", "signature": "invalid"},
                content_type="application/json",
            )
        self.assertEqual(rejected.status_code, 400)
        self.assertEqual(Enrollment.objects.count(), 0)
        self.assertEqual(Order.objects.get(pk=order_id).status, Order.Status.PENDING)

    def test_paid_resources_are_only_returned_to_an_active_enrolled_student(self):
        module = self.course.modules.first()
        lesson = CourseLesson.objects.create(
            module=module,
            title="Paid lesson",
            published=True,
            protected_resource_url="https://media.example.test/private-video.mp4",
        )
        endpoint = f"/api/enrollments/my-courses/{self.student.pk}/lessons/{lesson.pk}/"
        anonymous = Client().get(endpoint)
        self.assertEqual(anonymous.status_code, 401)

        other_student = User.objects.create_user(
            email="other@example.com",
            full_name="Other Student",
            password="Secure-Learning-Password-948!",
            is_email_verified=True,
        )
        other_client = Client()
        other_client.force_login(other_student)
        self.assertEqual(other_client.get(endpoint).status_code, 404)

        enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            order_item=self._paid_order_item(),
        )
        endpoint = f"/api/enrollments/my-courses/{enrollment.pk}/lessons/{lesson.pk}/"
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["lesson"]["resource_url"], lesson.protected_resource_url)

    def test_public_course_detail_only_exposes_enabled_preview_resources(self):
        module = self.course.modules.first()
        preview = CourseLesson.objects.create(
            module=module,
            title="Free preview",
            published=True,
            is_preview=True,
            preview_content="Preview text",
            preview_resource_url="https://media.example.test/preview.mp4",
            protected_resource_url="https://media.example.test/private-video.mp4",
        )
        paid = CourseLesson.objects.create(
            module=module,
            title="Paid lesson",
            published=True,
            protected_resource_url="https://media.example.test/private-video.mp4",
            position=1,
        )
        response = self.client.get(f"/api/courses/{self.course.slug}/")
        serialized = json.dumps(response.json())
        self.assertIn("Preview text", serialized)
        self.assertNotIn(preview.preview_resource_url, serialized)
        self.assertNotIn(paid.protected_resource_url, serialized)

        private_preview = self.client.get(
            f"/api/courses/{self.course.slug}/lessons/{paid.pk}/preview/"
        )
        self.assertEqual(private_preview.status_code, 404)
        public_preview = self.client.get(
            f"/api/courses/{self.course.slug}/lessons/{preview.pk}/preview/"
        )
        self.assertEqual(public_preview.status_code, 200)
        self.assertEqual(public_preview.json()["lesson"]["resource_url"], preview.preview_resource_url)

    def test_admin_commerce_api_rejects_student_accounts(self):
        response = self.client.get("/api/admin/courses/")
        self.assertEqual(response.status_code, 403)

    def test_super_admin_can_manage_curriculum_without_exposing_paid_resources(self):
        create_module = self.client.post(
            f"/api/admin/courses/{self.course.pk}/modules/",
            {"title": "New module", "description": "Module overview"},
            content_type="application/json",
        )
        self.assertEqual(create_module.status_code, 403)

        admin = User.objects.create_user(
            email="superadmin@example.com",
            full_name="Super Admin",
            password="Secure-Learning-Password-948!",
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_email_verified=True,
        )
        admin_client = Client()
        admin_client.force_login(admin)
        course_data = next(
            item
            for item in admin_client.get("/api/admin/courses/").json()["results"]
            if item["id"] == self.course.pk
        )
        self.assertEqual(course_data["enrollment_count"], 0)
        self.assertTrue(course_data["updated_at"])

        create_module = admin_client.post(
            f"/api/admin/courses/{self.course.pk}/modules/",
            {
                "title": "New module",
                "description": "Module overview",
                "learning_objectives": ["Plan an analysis"],
                "thumbnail_url": "https://media.example.test/module.jpg",
            },
            content_type="application/json",
        )
        self.assertEqual(create_module.status_code, 201)
        module_id = create_module.json()["module"]["id"]
        self.assertEqual(create_module.json()["module"]["learning_objectives"], ["Plan an analysis"])
        update_module = admin_client.post(
            f"/api/admin/modules/{module_id}/",
            {"title": "Updated module", "description": "Revised module overview"},
            content_type="application/json",
        )
        self.assertEqual(update_module.status_code, 200)
        self.assertEqual(update_module.json()["module"]["title"], "Updated module")
        reorder_modules = admin_client.post(
            f"/api/admin/courses/{self.course.pk}/modules/reorder/",
            {"module_ids": [module_id, self.course.modules.first().pk]},
            content_type="application/json",
        )
        self.assertEqual(reorder_modules.status_code, 200)
        self.assertEqual(reorder_modules.json()["modules"][0]["id"], module_id)
        create_lesson = admin_client.post(
            f"/api/admin/modules/{module_id}/lessons/",
            {
                "title": "Draft lesson",
                "type": "video",
                "duration": "12 minutes",
                "published": True,
                "is_required": False,
                "download_allowed": True,
                "completion_rule": "watch",
                "protected_resource_url": "https://media.example.test/private-video.mp4",
            },
            content_type="application/json",
        )
        self.assertEqual(create_lesson.status_code, 201)
        lesson_id = create_lesson.json()["lesson"]["id"]
        self.assertTrue(create_lesson.json()["lesson"]["download_allowed"])
        second_lesson = admin_client.post(
            f"/api/admin/modules/{module_id}/lessons/",
            {"title": "Second lesson", "type": "reading"},
            content_type="application/json",
        )
        self.assertEqual(second_lesson.status_code, 201)
        second_lesson_id = second_lesson.json()["lesson"]["id"]
        reorder_lessons = admin_client.post(
            f"/api/admin/modules/{module_id}/lessons/reorder/",
            {"lesson_ids": [second_lesson_id, lesson_id]},
            content_type="application/json",
        )
        self.assertEqual(reorder_lessons.status_code, 200)
        self.assertEqual(reorder_lessons.json()["lessons"][0]["id"], second_lesson_id)
        update_lesson = admin_client.post(
            f"/api/admin/lessons/{lesson_id}/",
            {"title": "Published lesson"},
            content_type="application/json",
        )
        self.assertEqual(update_lesson.status_code, 200)
        self.assertEqual(update_lesson.json()["lesson"]["title"], "Published lesson")
        Enrollment.objects.create(
            student=self.student,
            course=self.course,
            order_item=self._paid_order_item(),
        )
        course_data = next(
            item
            for item in admin_client.get("/api/admin/courses/").json()["results"]
            if item["id"] == self.course.pk
        )
        self.assertEqual(course_data["enrollment_count"], 1)

        public_detail = self.client.get(f"/api/courses/{self.course.slug}/")
        self.assertEqual(public_detail.status_code, 200)
        self.assertNotIn(
            "https://media.example.test/private-video.mp4",
            json.dumps(public_detail.json()),
        )
        delete_module = admin_client.post(
            f"/api/admin/modules/{module_id}/",
            {"delete": True},
            content_type="application/json",
        )
        self.assertEqual(delete_module.status_code, 200)
        self.assertFalse(CourseModule.objects.filter(pk=module_id).exists())

    def test_course_editor_metadata_is_admin_only(self):
        admin = User.objects.create_user(
            email="editor@example.com",
            full_name="Course Editor",
            password="Secure-Learning-Password-948!",
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_email_verified=True,
        )
        admin_client = Client()
        admin_client.force_login(admin)
        metadata = {
            "fields": {
                "SEO title": "Business Analysis Course",
                "Passing percentage": "75%",
                "Enable quizzes": True,
            },
            "course_type": "Self-paced",
        }
        response = admin_client.post(
            f"/api/admin/courses/{self.course.pk}/",
            {"editor_data": metadata},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["course"]["editor_data"], metadata)

        public_detail = self.client.get(f"/api/courses/{self.course.slug}/")
        self.assertEqual(public_detail.status_code, 200)
        self.assertNotIn("editor_data", public_detail.json())

        invalid = admin_client.post(
            f"/api/admin/courses/{self.course.pk}/",
            {"editor_data": ["not", "an", "object"]},
            content_type="application/json",
        )
        self.assertEqual(invalid.status_code, 400)

    def test_admin_can_create_featured_course_with_boolean_value(self):
        admin = User.objects.create_user(
            email="featured-editor@example.com",
            full_name="Featured Course Editor",
            password="Secure-Learning-Password-949!",
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_email_verified=True,
        )
        admin_client = Client()
        admin_client.force_login(admin)

        response = admin_client.post(
            "/api/admin/courses/create/",
            {
                "title": "Featured Course",
                "slug": "featured-course",
                "category": "Business",
                "qualification": Course.Qualification.CERTIFICATION,
                "description": "A test course description.",
                "featured": True,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201, response.content.decode())
        self.assertTrue(response.json()["course"]["featured"])
        self.assertTrue(Course.objects.get(slug="featured-course").featured)

    def test_admin_course_upload_accepts_valid_images_and_rejects_other_content(self):
        forbidden = self.client.post("/api/admin/uploads/", {"kind": "image"})
        self.assertEqual(forbidden.status_code, 403)

        admin = User.objects.create_user(
            email="upload-admin@example.com",
            full_name="Upload Admin",
            password="Secure-Learning-Password-948!",
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_email_verified=True,
        )
        admin_client = Client()
        admin_client.force_login(admin)
        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            image_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 8
            response = admin_client.post(
                "/api/admin/uploads/",
                {
                    "kind": "image",
                    "file": SimpleUploadedFile("cover.png", image_bytes, content_type="image/png"),
                },
            )
            self.assertEqual(response.status_code, 201)
            media_url = urlparse(response.json()["url"]).path
            media = admin_client.get(media_url)
            self.assertEqual(media.status_code, 200)
            self.assertEqual(b"".join(media.streaming_content), image_bytes)

            pdf_response = admin_client.post(
                "/api/admin/uploads/",
                {
                    "kind": "document",
                    "file": SimpleUploadedFile("lesson.pdf", b"%PDF-1.4\ncontent", content_type="application/pdf"),
                },
            )
            self.assertEqual(pdf_response.status_code, 201)

            rejected = admin_client.post(
                "/api/admin/uploads/",
                {
                    "kind": "image",
                    "file": SimpleUploadedFile("not-an-image.png", b"<script>", content_type="image/png"),
                },
            )
            self.assertEqual(rejected.status_code, 400)

    def test_coupon_discount_and_tax_are_calculated_server_side(self):
        Coupon.objects.create(
            code="SAVE10",
            discount_type=Coupon.DiscountType.PERCENT,
            discount_value=Decimal("10.00"),
            currency="INR",
            is_active=True,
        )
        with override_settings(COMMERCE_TAX_RATE="18"):
            response, _ = self.start_checkout(
                payload={"coupon_code": "save10"},
            )
        self.assertEqual(response.status_code, 201)
        order = Order.objects.get(pk=response.json()["order"]["id"])
        self.assertEqual(order.subtotal, Decimal("40.00"))
        self.assertEqual(order.discount_amount, Decimal("4.00"))
        self.assertEqual(order.tax_amount, Decimal("6.48"))
        self.assertEqual(order.total_amount, Decimal("42.48"))

    def test_checkout_requires_authenticated_verified_student(self):
        self.client.logout()
        response, _ = self.start_checkout()
        self.assertEqual(response.status_code, 401)

    def test_signed_webhook_is_idempotent(self):
        response, _ = self.start_checkout()
        order = Order.objects.get(pk=response.json()["order"]["id"])
        event = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "payment_gateway_2",
                        "order_id": "order_gateway_1",
                        "amount": 4000,
                        "currency": "INR",
                        "status": "captured",
                    }
                }
            },
        }
        with patch("commerce.views.payments.verify_webhook_signature", return_value=True):
            first = self.client.post(
                "/api/payments/webhook/",
                data=json.dumps(event),
                content_type="application/json",
                HTTP_X_RAZORPAY_EVENT_ID="evt_1",
                HTTP_X_RAZORPAY_SIGNATURE="valid",
            )
            duplicate = self.client.post(
                "/api/payments/webhook/",
                data=json.dumps(event),
                content_type="application/json",
                HTTP_X_RAZORPAY_EVENT_ID="evt_1",
                HTTP_X_RAZORPAY_SIGNATURE="valid",
            )
        self.assertEqual(first.status_code, 200)
        self.assertEqual(duplicate.status_code, 200)
        self.assertEqual(Enrollment.objects.filter(student=self.student, course=self.course).count(), 1)
        self.assertEqual(Order.objects.get(pk=order.pk).status, Order.Status.PAID)
