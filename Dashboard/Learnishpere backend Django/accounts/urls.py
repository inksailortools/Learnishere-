from django.urls import path
from . import views

urlpatterns = [
    path("csrf/", views.csrf_token, name="auth-csrf"),
    path("register/", views.register, name="auth-register"),
    path("login/", views.login_view, name="auth-login"),
    path("google/", views.google_login, name="auth-google"),
    path("google/link/", views.google_link, name="auth-google-link"),
    path("logout/", views.logout_view, name="auth-logout"),
    path("me/", views.me, name="auth-me"),
    path("verify-email/", views.verify_email, name="auth-verify-email"),
    path("resend-verification/", views.resend_verification, name="auth-resend-verification"),
    path("forgot-password/", views.forgot_password, name="auth-forgot-password"),
    path("reset-password/", views.reset_password, name="auth-reset-password"),
]
