from django.urls import path

from . import views

urlpatterns = [
    path("admin/uploads/", views.admin_upload, name="admin-course-upload"),
    path("media/<path:storage_path>", views.course_media, name="course-media"),
    path("courses/", views.course_list, name="course-list"),
    path("courses/<slug:slug>/", views.course_detail, name="course-detail"),
    path("courses/<slug:slug>/pricing/", views.course_pricing, name="course-pricing"),
    path("courses/<slug:slug>/lessons/<int:lesson_id>/preview/", views.lesson_preview, name="lesson-preview"),
    path("checkout/quote/", views.checkout_quote, name="checkout-quote"),
    path("checkout/", views.checkout, name="checkout"),
    path("payments/verify/", views.verify_payment, name="payment-verify"),
    path("payments/webhook/", views.payment_webhook, name="payment-webhook"),
    path("orders/", views.order_list, name="order-list"),
    path("orders/<uuid:order_id>/", views.order_detail, name="order-detail"),
    path("orders/<uuid:order_id>/cancel/", views.cancel_order, name="order-cancel"),
    path("enrollments/my-courses/", views.my_courses, name="my-courses"),
    path("enrollments/my-courses/<int:enrollment_id>/lessons/<int:lesson_id>/", views.enrolled_lesson, name="enrolled-lesson"),
    path("admin/courses/", views.admin_course_list, name="admin-course-list"),
    path("admin/courses/create/", views.admin_course_list_post, name="admin-course-create"),
    path("admin/courses/<int:course_id>/", views.admin_course_detail, name="admin-course-detail"),
    path("admin/courses/<int:course_id>/modules/", views.admin_course_modules, name="admin-course-modules"),
    path("admin/courses/<int:course_id>/modules/reorder/", views.admin_course_module_order, name="admin-course-module-order"),
    path("admin/modules/<int:module_id>/", views.admin_module_detail, name="admin-module-detail"),
    path("admin/modules/<int:module_id>/lessons/reorder/", views.admin_module_lesson_order, name="admin-module-lesson-order"),
    path("admin/modules/<int:module_id>/lessons/", views.admin_module_lessons, name="admin-module-lessons"),
    path("admin/lessons/<int:lesson_id>/", views.admin_lesson_detail, name="admin-lesson-detail"),
    path("admin/coupons/", views.admin_coupon_list, name="admin-coupon-list"),
    path("admin/orders/", views.admin_order_list, name="admin-order-list"),
    path("admin/orders/<uuid:order_id>/refunds/", views.admin_refund, name="admin-order-refund"),
    path("admin/enrollments/", views.admin_enrollment_list, name="admin-enrollment-list"),
]
