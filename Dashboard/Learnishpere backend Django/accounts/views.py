import hashlib
import json
import logging
import re
import secrets
import smtplib
from functools import wraps
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.core.validators import validate_email
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token

logger = logging.getLogger(__name__)
User = get_user_model()
TOKEN_TTL = 60 * 60


def rate_limited(limit=10, period=900):
    def decorate(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            client_ip = request.META.get("HTTP_X_REAL_IP") or request.META.get("REMOTE_ADDR", "")
            key = hashlib.sha256(f"{client_ip}:{view.__name__}".encode()).hexdigest()
            cache_key = f"auth-rate:{key}"
            if cache.add(cache_key, 1, period):
                count = 1
            else:
                try:
                    count = cache.incr(cache_key)
                except ValueError:
                    cache.add(cache_key, 1, period)
                    count = 1
            if count > limit:
                return JsonResponse({"detail": "Too many attempts. Please wait and try again."}, status=429)
            return view(request, *args, **kwargs)
        return wrapped
    return decorate


def json_body(request):
    try:
        body = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return body if isinstance(body, dict) else None


def error(message, status=400):
    return JsonResponse({"detail": message}, status=status)


def csrf_failure(request, reason=""):
    return error("CSRF verification failed. Refresh the page and try again.", 403)


def public_user(user):
    return {
        "id": user.pk,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }


def verification_link(user):
    token = signing.dumps({"user_id": user.pk, "nonce": secrets.token_urlsafe(16)}, salt="accounts.email-verification")
    return f"{settings.PUBLIC_SITE_ORIGIN}/verify-email?{urlencode({'token': token})}"


def send_verification(user):
    send_mail(
        "Verify your LearnIsphere account",
        f"Confirm your email address: {verification_link(user)}\n\nThis link expires in one hour.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
@rate_limited(limit=5)
def register(request):
    data = json_body(request)
    if data is None:
        return error("Invalid request.")
    full_name_value = data.get("full_name")
    email_value = data.get("email")
    password = data.get("password")
    if (
        not isinstance(full_name_value, str)
        or not isinstance(email_value, str)
        or not isinstance(password, str)
    ):
        return error("Enter your name, email address, and password.")
    full_name = full_name_value.strip()
    email = email_value.strip().lower()
    if not full_name or len(full_name) > 200 or not email or len(email) > 254:
        return error("Enter a valid name and email address.")
    if data.get("accepted_terms") is not True:
        return error("Accept the Terms and Privacy Policy before creating an account.")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return error("Enter a valid email address.")
    if User.objects.filter(email__iexact=email).exists():
        return error("An account with this email address already exists.")
    candidate = User(email=email, full_name=full_name, role=User.Role.STUDENT)
    try:
        validate_password(password, candidate)
    except ValidationError as exc:
        return error(" ".join(exc.messages))
    try:
        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=full_name,
                role=User.Role.STUDENT,
                terms_accepted_at=timezone.now(),
            )
    except IntegrityError:
        return error("An account with this email address already exists.")
    try:
        send_verification(user)
    except (OSError, smtplib.SMTPException):
        logger.exception("Could not send account verification email.")
        return error("We could not send a verification email. Please try again later.", 503)
    return JsonResponse({"detail": "Check your email to verify your account."}, status=201)


@require_POST
@rate_limited(limit=10)
def login_view(request):
    data = json_body(request)
    if data is None:
        return error("Invalid email or password.", 401)
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password")
    user = authenticate(request, username=email, password=password) if isinstance(password, str) else None
    if user is None or not user.is_active:
        return error("Invalid email or password.", 401)
    if not user.is_email_verified:
        return error("Verify your email address before signing in.", 403)
    login(request, user)
    request.session.set_expiry(60 * 60 * 24 * 14 if data.get("remember_me") else 0)
    return JsonResponse({"user": public_user(user)})


@require_POST
@rate_limited(limit=10)
def google_login(request):
    data = json_body(request)
    credential = data.get("credential") if data else None
    intent = data.get("intent") if data else None
    if not isinstance(credential, str) or not settings.GOOGLE_OAUTH_CLIENT_ID:
        return error("Google sign-in is unavailable.")
    try:
        payload = id_token.verify_oauth2_token(credential, GoogleRequest(), settings.GOOGLE_OAUTH_CLIENT_ID)
    except (ValueError, GoogleAuthError, requests.exceptions.RequestException):
        return error("Google sign-in could not be verified.", 401)
    subject = payload.get("sub")
    email = str(payload.get("email", "")).strip().lower()
    if not subject or not email or payload.get("email_verified") is not True:
        return error("Google sign-in could not be verified.", 401)
    try:
        validate_email(email)
    except ValidationError:
        return error("Google sign-in could not be verified.", 401)
    user = User.objects.filter(google_sub=subject).first()
    if user is None:
        if User.objects.filter(email__iexact=email).exists():
            return error("This email is already registered. Sign in with your password to link Google.", 409)
        if intent != "register":
            return error("No account is linked to this Google identity.", 401)
        if data.get("accepted_terms") is not True:
            return error("Accept the Terms and Privacy Policy before creating an account.")
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    full_name=str(payload.get("name", email.split("@", 1)[0]))[:200],
                    role=User.Role.STUDENT,
                    is_email_verified=True,
                    terms_accepted_at=timezone.now(),
                    google_sub=subject,
                )
        except IntegrityError:
            return error("This Google account could not be linked. Sign in and try again.", 409)
    if not user.is_active or not user.is_email_verified:
        return error("This account cannot sign in.", 403)
    login(request, user)
    request.session.set_expiry(0)
    return JsonResponse({"user": public_user(user)})


@require_POST
@rate_limited(limit=10)
def google_link(request):
    if not request.user.is_authenticated or not request.user.is_active or not request.user.is_email_verified:
        return error("Sign in before linking a Google account.", 401)
    data = json_body(request)
    credential = data.get("credential") if data else None
    if not isinstance(credential, str) or not settings.GOOGLE_OAUTH_CLIENT_ID:
        return error("Google sign-in is unavailable.")
    try:
        payload = id_token.verify_oauth2_token(credential, GoogleRequest(), settings.GOOGLE_OAUTH_CLIENT_ID)
    except (ValueError, GoogleAuthError, requests.exceptions.RequestException):
        return error("Google sign-in could not be verified.", 401)
    subject = payload.get("sub")
    email = str(payload.get("email", "")).strip().lower()
    if (
        not subject
        or payload.get("email_verified") is not True
        or email != request.user.email
    ):
        return error("The verified Google email must match your signed-in account.", 403)
    if User.objects.exclude(pk=request.user.pk).filter(google_sub=subject).exists():
        return error("This Google account is already linked to another account.", 409)
    if request.user.google_sub and request.user.google_sub != subject:
        return error("A different Google account is already linked.", 409)
    try:
        User.objects.filter(pk=request.user.pk, google_sub__isnull=True).update(google_sub=subject)
    except IntegrityError:
        return error("This Google account could not be linked.", 409)
    return JsonResponse({"user": public_user(request.user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Signed out."})


@require_GET
def me(request):
    if not request.user.is_authenticated or not request.user.is_active or not request.user.is_email_verified:
        return error("Authentication required.", 401)
    return JsonResponse({"user": public_user(request.user)})


@require_POST
@rate_limited(limit=10)
def verify_email(request):
    data = json_body(request)
    token = data.get("token") if data else None
    try:
        payload = signing.loads(token, salt="accounts.email-verification", max_age=TOKEN_TTL)
        user = User.objects.get(pk=payload["user_id"])
    except (signing.BadSignature, signing.SignatureExpired, User.DoesNotExist, KeyError, TypeError):
        return error("This verification link is invalid or has expired.", 400)
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    return JsonResponse({"detail": "Your email is verified. You can now sign in."})


@require_POST
@rate_limited(limit=5)
def resend_verification(request):
    data = json_body(request)
    email = str(data.get("email", "")).strip().lower() if data else ""
    user = User.objects.filter(email__iexact=email, is_email_verified=False, is_active=True).first()
    if user:
        try:
            send_verification(user)
        except (OSError, smtplib.SMTPException):
            logger.exception("Could not resend account verification email.")
            return error("We could not send a verification email. Please try again later.", 503)
    return JsonResponse({"detail": "If the account can be verified, an email will be sent shortly."})


@require_POST
@rate_limited(limit=5)
def forgot_password(request):
    data = json_body(request)
    email = str(data.get("email", "")).strip().lower() if data else ""
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"{settings.PUBLIC_SITE_ORIGIN}/reset-password?{urlencode({'uid': uid, 'token': token})}"
        try:
            send_mail(
                "Reset your LearnIsphere password",
                f"Reset your password using this link: {link}\n\nThis link can only be used once.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except (OSError, smtplib.SMTPException):
            logger.exception("Could not send password reset email.")
            return error("We could not send reset instructions. Please try again later.", 503)
    return JsonResponse({"detail": "If an account exists for this address, reset instructions will be sent."})


@require_POST
@rate_limited(limit=10)
def reset_password(request):
    data = json_body(request)
    if data is None:
        return error("This reset link is invalid or has expired.")
    try:
        user_id = force_str(urlsafe_base64_decode(data.get("uid", "")))
        user = User.objects.get(pk=user_id, is_active=True)
    except (ValueError, TypeError, User.DoesNotExist):
        return error("This reset link is invalid or has expired.")
    token = data.get("token")
    password = data.get("password")
    if not isinstance(token, str) or not default_token_generator.check_token(user, token):
        return error("This reset link is invalid or has expired.")
    if not isinstance(password, str):
        return error("Enter a new password.")
    try:
        validate_password(password, user)
    except ValidationError as exc:
        return error(" ".join(exc.messages))
    user.set_password(password)
    user.save(update_fields=["password"])
    return JsonResponse({"detail": "Password updated. You can now sign in."})
