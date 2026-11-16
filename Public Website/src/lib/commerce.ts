export type CourseLesson = {
  id: number;
  title: string;
  description: string;
  type: "video" | "reading" | "resource" | "quiz" | "assignment";
  duration: string;
  is_preview: boolean;
  preview_available: boolean;
  preview_content: string;
};

export type CourseModule = {
  id: number;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export type CommerceCourse = {
  id: number;
  slug: string;
  title: string;
  category: string;
  qualification: string;
  type: string;
  description: string;
  overview: string;
  image: string;
  duration: string;
  level: string;
  difficulty: string;
  featured: boolean;
  price: string | null;
  selling_price: string | null;
  list_price: string | null;
  currency: string;
  discount_amount: string;
  discount_percent: number;
  price_available: boolean;
  available: boolean;
  purchase_eligible: boolean;
  purchasable: boolean;
  outcomes: string[];
  learning_outcomes: string[];
  skills: string[];
  benefits: string[];
  prerequisites: string;
  certificate_information: string;
  instructor: { name: string; bio: string; image: string };
  modules?: CourseModule[];
};

export type CheckoutQuote = {
  currency: string;
  items: { course_id: number; title: string; unit_price: string; currency: string }[];
  subtotal: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  coupon_code: string;
};

type ApiErrorBody = { detail?: string };

export class CommerceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CommerceApiError";
  }
}

async function csrfToken() {
  const response = await fetch("/api/auth/csrf/", { credentials: "same-origin" });
  if (!response.ok) throw new CommerceApiError("Unable to start a secure session.", response.status);
  const body = (await response.json()) as { csrfToken?: string };
  if (!body.csrfToken) throw new CommerceApiError("Unable to start a secure session.", response.status);
  return body.csrfToken;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body) {
    headers.set("Content-Type", "application/json");
    headers.set("X-CSRFToken", await csrfToken());
  }
  const response = await fetch(`/api/${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!response.ok) {
    throw new CommerceApiError(body.detail || "The request could not be completed.", response.status);
  }
  return body;
}

export type CheckoutOrder = {
  id: string;
  status: string;
  currency: string;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
};

export const commerceApi = {
  listCourses: async () => {
    const body = await request<{ results: CommerceCourse[] }>("courses/");
    return body.results;
  },
  getCourse: async (slug: string) => {
    const body = await request<{ course: CommerceCourse }>(`courses/${encodeURIComponent(slug)}/`);
    return body.course;
  },
  quote: (courseIds: number[], couponCode: string) =>
    request<CheckoutQuote>("checkout/quote/", {
      method: "POST",
      body: JSON.stringify({ course_ids: courseIds, coupon_code: couponCode }),
    }),
  checkout: (courseIds: number[], couponCode: string, idempotencyKey: string) =>
    request<{
      order: CheckoutOrder;
      gateway: { key_id: string; order_id: string; amount: number; currency: string };
    }>("checkout/", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        course_ids: courseIds,
        coupon_code: couponCode,
        terms_accepted: true,
      }),
    }),
  verifyPayment: (orderId: string, paymentId: string, signature: string) =>
    request<{ order: CheckoutOrder; detail: string }>("payments/verify/", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, payment_id: paymentId, signature }),
    }),
  cancelOrder: (orderId: string) =>
    request<{ detail: string }>(`orders/${encodeURIComponent(orderId)}/cancel/`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  previewLesson: (slug: string, lessonId: number) =>
    request<{
      lesson: { title: string; description: string; content: string; resource_url: string };
    }>(`courses/${encodeURIComponent(slug)}/lessons/${lessonId}/preview/`),
};

export function formatCoursePrice(amount: string | null, currency: string) {
  if (amount === null) return "Price currently unavailable";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function readCart() {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem("learnisphere-cart") || "[]");
    if (Array.isArray(value) && value.every((slug) => typeof slug === "string")) return value as string[];
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }
  return [];
}

export async function loadRazorpay() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Secure payment checkout could not be loaded."));
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      order_id: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      prefill?: { name?: string; email?: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
    }) => { open: () => void; on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void };
  }
}
