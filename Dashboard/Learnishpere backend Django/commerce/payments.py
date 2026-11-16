import hashlib
import hmac
import logging
from decimal import Decimal

import requests
from django.conf import settings

logger = logging.getLogger(__name__)
RAZORPAY_API = "https://api.razorpay.com/v1"


class PaymentGatewayError(Exception):
    pass


def configured():
    return (
        settings.PAYMENT_PROVIDER == "razorpay"
        and bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)
    )


def _request(method, path, *, payload=None):
    if not configured():
        raise PaymentGatewayError("Payment processing is not configured.")
    try:
        response = requests.request(
            method,
            f"{RAZORPAY_API}{path}",
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
            json=payload,
            timeout=10,
        )
    except requests.RequestException as exc:
        logger.exception("Razorpay API request failed.")
        raise PaymentGatewayError("The payment provider is temporarily unavailable.") from exc
    if not response.ok:
        logger.error("Razorpay API returned HTTP %s for %s.", response.status_code, path)
        raise PaymentGatewayError("The payment provider could not process this request.")
    try:
        result = response.json()
    except ValueError as exc:
        raise PaymentGatewayError("The payment provider returned an invalid response.") from exc
    if not isinstance(result, dict):
        raise PaymentGatewayError("The payment provider returned an invalid response.")
    return result


def create_order(order):
    amount = int((order.total_amount * Decimal("100")).to_integral_exact())
    result = _request(
        "POST",
        "/orders",
        payload={
            "amount": amount,
            "currency": order.currency,
            "receipt": str(order.pk),
            "notes": {"learnisphere_order_id": str(order.pk)},
        },
    )
    provider_order_id = result.get("id")
    if not isinstance(provider_order_id, str) or not provider_order_id:
        raise PaymentGatewayError("The payment provider returned an invalid order.")
    if result.get("amount") != amount or result.get("currency") != order.currency:
        raise PaymentGatewayError("The payment provider returned a mismatched order.")
    return provider_order_id


def fetch_payment(payment_id):
    return _request("GET", f"/payments/{payment_id}")


def create_refund(payment, amount, reason):
    payload = {"notes": {"reason": reason[:200]}} if reason else {}
    if amount is not None:
        payload["amount"] = int((amount * Decimal("100")).to_integral_exact())
    return _request("POST", f"/payments/{payment.provider_payment_id}/refund", payload=payload)


def verify_checkout_signature(provider_order_id, payment_id, signature):
    if not configured() or not isinstance(signature, str):
        return False
    message = f"{provider_order_id}|{payment_id}".encode()
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(body, signature):
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or not isinstance(signature, str):
        return False
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
