from urllib.parse import parse_qs, urlparse
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AuthenticationTests(TestCase):
    def test_registration_always_assigns_student_and_requires_verification(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "full_name": "A Learner",
                "email": "LEARNER@example.com",
                "password": "Secure-Learning-Password-938!",
                "accepted_terms": True,
                "role": "super_admin",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="learner@example.com")
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertFalse(user.is_email_verified)
        self.assertTrue(user.check_password("Secure-Learning-Password-938!"))
        self.assertEqual(len(mail.outbox), 1)

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            email="learner@example.com",
            full_name="A Learner",
            password="Secure-Learning-Password-938!",
        )
        response = self.client.post(
            "/api/auth/register/",
            data={
                "full_name": "Another Learner",
                "email": "LEARNER@example.com",
                "password": "Another-Secure-Password-938!",
                "accepted_terms": True,
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

    def test_unverified_user_cannot_login_and_verified_user_can_logout(self):
        user = User.objects.create_user(
            email="learner@example.com",
            full_name="A Learner",
            password="Secure-Learning-Password-938!",
        )
        login_payload = {
            "email": user.email,
            "password": "Secure-Learning-Password-938!",
        }
        response = self.client.post("/api/auth/login/", login_payload, content_type="application/json")
        self.assertEqual(response.status_code, 403)

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])
        response = self.client.post("/api/auth/login/", login_payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["role"], "student")
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)
        self.client.post("/api/auth/logout/")
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_email_verification_token_is_required_and_works(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "full_name": "A Learner",
                "email": "learner@example.com",
                "password": "Secure-Learning-Password-938!",
                "accepted_terms": True,
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        link = mail.outbox[0].body.splitlines()[0].split(": ", 1)[1]
        token = parse_qs(urlparse(link).query)["token"][0]
        response = self.client.post(
            "/api/auth/verify-email/",
            {"token": token},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.get(email="learner@example.com").is_email_verified)

    def test_me_requires_authentication_and_role_is_not_client_controlled(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)
        user = User.objects.create_user(
            email="admin@example.com",
            full_name="Admin",
            password="Secure-Learning-Password-938!",
            role=User.Role.SUPER_ADMIN,
            is_email_verified=True,
        )
        self.client.force_login(user)
        self.assertEqual(self.client.get("/api/auth/me/").json()["user"]["role"], "super_admin")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client")
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_link_requires_matching_verified_email(self, verify_token):
        user = User.objects.create_user(
            email="learner@example.com",
            full_name="A Learner",
            password="Secure-Learning-Password-938!",
            is_email_verified=True,
        )
        self.client.force_login(user)
        verify_token.return_value = {
            "sub": "google-subject-1",
            "email": "different@example.com",
            "email_verified": True,
        }
        response = self.client.post(
            "/api/auth/google/link/",
            {"credential": "verified-token"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        user.refresh_from_db()
        self.assertIsNone(user.google_sub)

        verify_token.return_value["email"] = user.email
        response = self.client.post(
            "/api/auth/google/link/",
            {"credential": "verified-token"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.google_sub, "google-subject-1")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client")
    @patch("accounts.views.id_token.verify_oauth2_token")
    def test_google_registration_creates_verified_student(self, verify_token):
        verify_token.return_value = {
            "sub": "google-new-student",
            "email": "google@example.com",
            "email_verified": True,
            "name": "Google Learner",
        }
        response = self.client.post(
            "/api/auth/google/",
            {
                "credential": "verified-token",
                "intent": "register",
                "accepted_terms": True,
                "role": "super_admin",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        user = User.objects.get(email="google@example.com")
        self.assertEqual(user.role, User.Role.STUDENT)
        self.assertTrue(user.is_email_verified)
        self.assertEqual(verify_token.call_args.args[2], "test-client")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client")
    @patch("accounts.views.id_token.verify_oauth2_token", side_effect=ValueError)
    def test_invalid_google_token_is_rejected(self, verify_token):
        response = self.client.post(
            "/api/auth/google/",
            {"credential": "invalid", "intent": "register", "accepted_terms": True},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(User.objects.count(), 0)

    def test_password_reset_token_can_only_be_used_once(self):
        user = User.objects.create_user(
            email="learner@example.com",
            full_name="A Learner",
            password="Secure-Learning-Password-938!",
            is_email_verified=True,
        )
        payload = {
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user),
            "password": "Another-Secure-Password-948!",
        }
        response = self.client.post("/api/auth/reset-password/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password(payload["password"]))
        response = self.client.post("/api/auth/reset-password/", payload, content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_state_changing_auth_requests_require_csrf(self):
        client = Client(enforce_csrf_checks=True)
        csrf_response = client.get("/api/auth/csrf/")
        token = csrf_response.json()["csrfToken"]
        response = client.post(
            "/api/auth/register/",
            {
                "full_name": "A Learner",
                "email": "learner@example.com",
                "password": "Secure-Learning-Password-938!",
                "accepted_terms": True,
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        response = client.post(
            "/api/auth/register/",
            {
                "full_name": "A Learner",
                "email": "learner@example.com",
                "password": "Secure-Learning-Password-938!",
                "accepted_terms": True,
            },
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 201)
