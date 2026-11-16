import re
import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Course(models.Model):
    class Qualification(models.TextChoices):
        CERTIFICATION = "Certification", "Certification"
        DIPLOMA = "Diploma", "Diploma"
        MASTERS = "Master's", "Master's"
        SHORT_COURSE = "Short course", "Short course"
        MODULE = "Module", "Module"

    slug = models.SlugField(unique=True, max_length=160)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=120)
    qualification = models.CharField(max_length=30, choices=Qualification.choices)
    description = models.TextField()
    overview = models.TextField(blank=True)
    cover_image_url = models.URLField(max_length=1000, blank=True)
    duration = models.CharField(max_length=80, blank=True)
    difficulty = models.CharField(max_length=40, blank=True)
    prerequisites = models.TextField(blank=True)
    learning_outcomes = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    certificate_information = models.TextField(blank=True)
    editor_data = models.JSONField(default=dict, blank=True)
    instructor_name = models.CharField(max_length=160, blank=True)
    instructor_bio = models.TextField(blank=True)
    instructor_image_url = models.URLField(max_length=1000, blank=True)
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    available = models.BooleanField(default=True)
    purchase_eligible = models.BooleanField(default=True)
    selling_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    list_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    promotional_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    promotion_starts_at = models.DateTimeField(null=True, blank=True)
    promotion_ends_at = models.DateTimeField(null=True, blank=True)
    currency = models.CharField(max_length=3, default="INR")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("title",)

    def __str__(self):
        return self.title

    def current_price(self, now=None):
        now = now or timezone.now()
        promotion_active = (
            self.promotional_price is not None
            and (self.promotion_starts_at is None or self.promotion_starts_at <= now)
            and (self.promotion_ends_at is None or self.promotion_ends_at > now)
        )
        return self.promotional_price if promotion_active else self.selling_price

    @property
    def can_purchase(self):
        return (
            self.published
            and self.available
            and self.purchase_eligible
            and self.current_price() is not None
        )

    def clean(self):
        super().clean()
        from django.core.exceptions import ValidationError

        if not re.fullmatch(r"[A-Z]{3}", self.currency):
            raise ValidationError({"currency": "Currency must be a three-letter ISO code."})
        if self.selling_price is not None and self.list_price is not None:
            if self.list_price < self.selling_price:
                raise ValidationError({"list_price": "List price cannot be lower than the selling price."})
        if self.promotional_price is not None:
            if self.selling_price is None:
                raise ValidationError({"promotional_price": "Set a selling price before adding a promotion."})
            if self.promotional_price > self.selling_price:
                raise ValidationError({"promotional_price": "Promotional price cannot exceed the selling price."})
        if self.promotion_starts_at and self.promotion_ends_at:
            if self.promotion_ends_at <= self.promotion_starts_at:
                raise ValidationError({"promotion_ends_at": "Promotion end must be after its start."})


class CourseModule(models.Model):
    course = models.ForeignKey(Course, related_name="modules", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    learning_objectives = models.JSONField(default=list, blank=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("position", "id")
        constraints = [
            models.UniqueConstraint(fields=("course", "position"), name="unique_course_module_position")
        ]

    def __str__(self):
        return f"{self.course}: {self.title}"


class CourseLesson(models.Model):
    class CompletionRule(models.TextChoices):
        VIEW = "view", "View lesson"
        WATCH = "watch", "Watch video"
        MARK_COMPLETE = "mark_complete", "Mark complete"

    class LessonType(models.TextChoices):
        VIDEO = "video", "Video"
        READING = "reading", "Reading"
        RESOURCE = "resource", "Resource"
        QUIZ = "quiz", "Quiz"
        ASSIGNMENT = "assignment", "Assignment"

    module = models.ForeignKey(CourseModule, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=20, choices=LessonType.choices, default=LessonType.VIDEO)
    duration = models.CharField(max_length=40, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)
    is_required = models.BooleanField(default=True)
    download_allowed = models.BooleanField(default=False)
    completion_rule = models.CharField(max_length=20, choices=CompletionRule.choices, default=CompletionRule.MARK_COMPLETE)
    published = models.BooleanField(default=False)
    preview_content = models.TextField(blank=True)
    preview_resource_url = models.URLField(max_length=1000, blank=True)
    protected_resource_url = models.URLField(max_length=1000, blank=True)

    class Meta:
        ordering = ("position", "id")
        constraints = [
            models.UniqueConstraint(fields=("module", "position"), name="unique_module_lesson_position")
        ]

    def __str__(self):
        return f"{self.module}: {self.title}"


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENT = "percent", "Percent"
        FIXED = "fixed", "Fixed amount"

    code = models.CharField(max_length=40, unique=True)
    discount_type = models.CharField(max_length=10, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    currency = models.CharField(max_length=3, default="INR")
    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    max_uses_per_user = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("code",)

    def __str__(self):
        return self.code

    def clean(self):
        super().clean()
        self.code = self.code.strip().upper()
        from django.core.exceptions import ValidationError

        if not re.fullmatch(r"[A-Z]{3}", self.currency):
            raise ValidationError({"currency": "Currency must be a three-letter ISO code."})
        if self.discount_type == self.DiscountType.PERCENT and self.discount_value > 100:
            raise ValidationError({"discount_value": "Percentage discounts cannot exceed 100."})


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.PROTECT)
    checkout_key = models.UUIDField(null=True, blank=True)
    request_fingerprint = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    currency = models.CharField(max_length=3)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_rate = models.DecimalField(max_digits=6, decimal_places=3, default=Decimal("0.000"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL)
    coupon_code = models.CharField(max_length=40, blank=True)
    terms_accepted_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("student", "checkout_key"),
                condition=models.Q(checkout_key__isnull=False),
                name="unique_student_checkout_key",
            )
        ]

    def __str__(self):
        return f"{self.id} · {self.student.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="order_items", on_delete=models.PROTECT)
    course_title = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    list_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("order", "course"), name="unique_course_per_order")
        ]


class Payment(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        AUTHORIZED = "authorized", "Authorized"
        CAPTURED = "captured", "Captured"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order = models.OneToOneField(Order, related_name="payment", on_delete=models.PROTECT)
    provider = models.CharField(max_length=20, default="razorpay")
    provider_order_id = models.CharField(max_length=100, unique=True)
    provider_payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CREATED)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    failure_reason = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider_order_id} · {self.status}"


class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="enrollments", on_delete=models.PROTECT)
    course = models.ForeignKey(Course, related_name="enrollments", on_delete=models.PROTECT)
    order_item = models.OneToOneField(OrderItem, related_name="enrollment", on_delete=models.PROTECT)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-enrolled_at",)
        constraints = [
            models.UniqueConstraint(fields=("student", "course"), name="unique_student_course_enrollment")
        ]

    def __str__(self):
        return f"{self.student.email} · {self.course.title}"


class Refund(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSED = "processed", "Processed"
        FAILED = "failed", "Failed"

    order = models.ForeignKey(Order, related_name="refunds", on_delete=models.PROTECT)
    provider_refund_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    reason = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)


class WebhookEvent(models.Model):
    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100)
    processed_at = models.DateTimeField(auto_now_add=True)
