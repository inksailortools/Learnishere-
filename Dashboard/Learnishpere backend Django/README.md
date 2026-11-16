# LearnIsphere Django authentication API

This folder bootstraps the Django API because no backend source or migration history was present here. It uses Django sessions, an email-based custom user model, and PostgreSQL when `DB_NAME` is configured. SQLite is the local fallback. Locally set `PUBLIC_SITE_ORIGIN=http://localhost:8443` for email links.

## Local setup

1. Create a virtual environment and install `pip install -r requirements.txt`.
2. Set `DJANGO_SECRET_KEY` and the optional database/email/Google values from `env.example`. For local testing, `DEBUG` defaults to true and verification messages are printed to the console.
3. Run `python manage.py migrate`, `python manage.py createsuperuser`, then `python manage.py runserver`.
4. Start the Public Website on port 8443 (Vite's configured default) and Dashboard on port 3000. Vite proxies `/api/` to Django and `/dashboard` to Next.js, so browser auth requests stay same-origin and the localhost session cookie is shared.
5. Run `python manage.py test` and `python manage.py check`.

For browser testing, open `http://localhost:8443/login` or `http://localhost:8443/register`. The development email backend prints verification and reset links in the Django terminal. Click those links on the same localhost origin; after signing in, `/dashboard` routes to the role-specific Next.js page.

The first migration creates `accounts.User`. Do not switch `AUTH_USER_MODEL` after deploying it or after creating other migrations that depend on the built-in user.

## Browser API

All endpoints are same-origin under `/api/` and use Django's CSRF middleware. Obtain a CSRF token from `GET /api/auth/csrf/`; send it as `X-CSRFToken` on every POST. Session cookies are HttpOnly, SameSite=Lax, and Secure when `DJANGO_DEBUG=false`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/auth/csrf/` | Start CSRF flow and return token |
| POST | `/api/auth/register/` | Create Student account; sends email verification |
| POST | `/api/auth/login/` | Create session after verified email/password |
| POST | `/api/auth/google/` | Verify GIS ID token; `intent=register` creates a Student with accepted terms, `intent=login` only signs in existing Google accounts |
| POST | `/api/auth/google/link/` | Link a verified Google identity to the matching signed-in email account |
| POST | `/api/auth/logout/` | Invalidate session |
| GET | `/api/auth/me/` | Return the current safe user profile and role |
| POST | `/api/auth/verify-email/` | Verify using `{ "token": "..." }` |
| POST | `/api/auth/resend-verification/` | Resend verification without disclosing account existence |
| POST | `/api/auth/forgot-password/` | Send a generic reset response |
| POST | `/api/auth/reset-password/` | Reset using `uid`, `token`, and `password` |

Public registration always assigns `student`. Create Super Admins only with the Django management command or a separately authorized operator workflow. Commerce APIs independently require a verified student session for checkout, orders, and enrolments, and a staff-enabled Super Admin session for administration.

## Course catalogue and purchasing

The commerce migrations create the course, curriculum, coupon, order, payment, refund, and enrolment records. The seed migration moves the existing public catalogue entries into Django without inventing prices. These seeded courses are published but have no selling price, so the public site shows **Price currently unavailable** and disables purchase until an authorized administrator configures a real price.

Use the existing Next.js Admin Dashboard at `/dashboard/admin`:

- **Courses** opens the eight-step course wizard for basic information, curriculum, learning outcomes, instructor details, pricing, assessments, SEO, and publication. Course data and the wizard's additional settings are saved to Django.
- Course thumbnails accept JPEG, PNG, or WebP uploads (10 MB maximum); promotional and lesson videos accept MP4 or WebM (100 MB maximum); lesson resources accept PDF (50 MB maximum). Uploads are restricted to Super Admins and served from `/api/media/`. The default `MEDIA_ROOT` is `media/` in this project; set a durable `MEDIA_ROOT` or configure shared object storage before production use.
- **Coupons & Discounts** creates INR coupon codes.
- **Payments & Revenue** lists backend orders and requests Razorpay refunds.
- **Enrolments** lists enrolments created after verified payment.

The publication date and time are retained in the course settings, but automatic scheduled publishing requires a background scheduler and is not enabled by this project.
Per-course tax, access expiry, enrolment caps, quiz/assignment execution, and automatic certificate issuance are retained as course settings but are not enforced by the current checkout or learner workflows. Checkout tax remains server-wide.

The backend defaults to INR and `COMMERCE_TAX_RATE=0`. Configure a legally reviewed tax rate before charging tax; the rate is a percentage and checkout totals are recalculated by Django. The browser never supplies a trusted price or payable total.

Set `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` on the Django server to enable checkout. Use Razorpay test credentials and the matching webhook secret for testing; never expose the secret in either frontend. Razorpay callbacks are signature-checked and the payment is fetched from Razorpay to confirm captured status, amount, order, and currency before creating an enrolment. Signed webhooks are idempotent. Card numbers and CVVs are not stored.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/courses/` | Published courses and server-calculated prices |
| GET | `/api/courses/{slug}/` | Public course details and curriculum; no paid-resource URLs |
| GET | `/api/courses/{slug}/lessons/{id}/preview/` | Explicitly enabled public lesson preview |
| POST | `/api/admin/uploads/` | Super Admin-only course thumbnail or promotional-video upload |
| GET | `/api/media/{path}` | Publicly serve validated course media uploads |
| POST | `/api/checkout/quote/` | Authenticated server-side coupon, tax, and total quote |
| POST | `/api/checkout/` | Revalidate courses and create a pending Razorpay order |
| POST | `/api/payments/verify/` | Verify a student payment and create enrolments |
| POST | `/api/payments/webhook/` | Verify Razorpay webhook signature and process payment/refund events |
| GET | `/api/orders/` | Student's own orders |
| GET | `/api/enrollments/my-courses/` | Student's active purchased courses |
| GET | `/api/enrollments/my-courses/{enrollment_id}/lessons/{lesson_id}/` | Protected lesson resource for an active enrolment |

Course prices remain unavailable until configured by an administrator. Configure course content and protected resources before publishing learning materials. This repository does not include production course media, legal tax settings, an approved live Razorpay account, or live payment credentials. Passing local tests is not a production-readiness claim.

## Production setup

- Set `DJANGO_DEBUG=false`, a unique high-entropy secret, PostgreSQL credentials, exact allowed hosts, trusted CSRF origin, HTTPS public origin, email transport values, and Google OAuth client ID.
- Configure `REDIS_URL` for the shared authentication rate-limit cache; keep Django reachable only through the trusted Nginx proxy, which overwrites `X-Real-IP`.
- Configure Google Identity Services with an OAuth Web Client ID restricted to `https://www.learnisphere.com`; set the same ID in `Public Website/env.example` as `VITE_GOOGLE_CLIENT_ID` and Django's `GOOGLE_OAUTH_CLIENT_ID`. Never put a client secret in either frontend.
- In Google Cloud Console, create an OAuth 2.0 Web application client, add `https://www.learnisphere.com` and the local Vite origin (`http://localhost:8443`) as authorized JavaScript origins, and use the client ID only. No OAuth client secret is needed in the browser or this ID-token verification flow.
- Configure SMTP credentials through secret management, not source control. Verify DNS, sender domain, and email delivery before enabling registration.
- Set up the SMTP host, port, TLS, sender identity, and credentials using `EMAIL_*` settings; test verification and reset delivery end-to-end before launch.
- Apply migrations using `python manage.py migrate` during deployment. Back up PostgreSQL first. Collect Django static files if Django admin is exposed.
- Serve `Public Website/dist`, Next.js on localhost:3000 with `basePath: "/dashboard"`, and Django on localhost:8000 behind the supplied Nginx routing. Keep all three on the same HTTPS origin.
- Set up monitoring for email failures, rate limits, auth errors, session expiration, database backups, and dependency updates. Do not claim production readiness until proxy, mail, Google, PostgreSQL, CSRF, and browser end-to-end checks pass in the target environment.
