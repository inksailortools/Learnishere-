from django.contrib import admin

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


class CourseLessonInline(admin.TabularInline):
    model = CourseLesson
    extra = 0


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "qualification", "selling_price", "currency", "published", "available", "purchase_eligible")
    list_filter = ("published", "available", "purchase_eligible", "qualification", "category")
    search_fields = ("title", "slug", "category")
    prepopulated_fields = {"slug": ("title",)}
    inlines = (CourseModuleInline,)


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "position")
    list_filter = ("course",)
    inlines = (CourseLessonInline,)


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "currency", "is_active", "expires_at")
    list_filter = ("is_active", "discount_type", "currency")
    search_fields = ("code",)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("course", "course_title", "unit_price", "list_price", "currency")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "status", "total_amount", "currency", "created_at", "paid_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("id", "student__email", "student__full_name")
    readonly_fields = (
        "student", "checkout_key", "request_fingerprint", "currency", "subtotal",
        "discount_amount", "tax_rate", "tax_amount", "total_amount", "coupon",
        "coupon_code", "terms_accepted_at", "created_at", "updated_at", "paid_at",
    )
    inlines = (OrderItemInline,)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("provider_order_id", "order", "status", "amount", "currency", "updated_at")
    list_filter = ("provider", "status", "currency")
    search_fields = ("provider_order_id", "provider_payment_id", "order__student__email")
    readonly_fields = tuple(field.name for field in Payment._meta.fields)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "active", "enrolled_at")
    list_filter = ("active", "course")
    search_fields = ("student__email", "student__full_name", "course__title")
    readonly_fields = tuple(field.name for field in Enrollment._meta.fields)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("order", "amount", "status", "created_at", "processed_at")
    list_filter = ("status",)
    readonly_fields = tuple(field.name for field in Refund._meta.fields)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ("event_id", "event_type", "processed_at")
    search_fields = ("event_id", "event_type")
    readonly_fields = tuple(field.name for field in WebhookEvent._meta.fields)
