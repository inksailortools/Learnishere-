type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "super_admin";
};

type AuthResponse = {
  user?: AuthUser;
  detail?: string;
  csrfToken?: string;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function csrfToken() {
  const response = await fetch("/api/auth/csrf/", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Unable to start a secure session. Please try again.");
  const body = (await response.json()) as AuthResponse;
  if (!body.csrfToken) throw new Error("Unable to start a secure session. Please try again.");
  return body.csrfToken;
}

async function post(path: string, values: Record<string, unknown>) {
  const token = await csrfToken();
  const response = await fetch(`/api/auth/${path}/`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token,
    },
    body: JSON.stringify(values),
  });
  const body = (await response.json().catch(() => ({}))) as AuthResponse;
  if (!response.ok) {
    throw new AuthApiError(
      body.detail || "We couldn’t complete your request. Please try again.",
      response.status,
    );
  }
  return body;
}

export const authApi = {
  me: async () => {
    const response = await fetch("/api/auth/me/", { credentials: "same-origin" });
    const body = (await response.json().catch(() => ({}))) as AuthResponse;
    if (!response.ok) {
      throw new AuthApiError(
        body.detail || "Authentication is required.",
        response.status,
      );
    }
    if (!body.user) throw new AuthApiError("Could not read the current account.", response.status);
    return body.user;
  },
  login: (email: string, password: string, rememberMe: boolean) =>
    post("login", { email, password, remember_me: rememberMe }),
  register: (fullName: string, email: string, password: string) =>
    post("register", { full_name: fullName, email, password, accepted_terms: true }),
  forgotPassword: (email: string) => post("forgot-password", { email }),
  resendVerification: (email: string) => post("resend-verification", { email }),
  google: (credential: string, register: boolean, acceptedTerms: boolean) =>
    post("google", {
      credential,
      intent: register ? "register" : "login",
      accepted_terms: acceptedTerms,
    }),
  googleLink: (credential: string) => post("google/link", { credential }),
  verifyEmail: (token: string) => post("verify-email", { token }),
  resetPassword: (uid: string, token: string, password: string) =>
    post("reset-password", { uid, token, password }),
};

export type { AuthUser };
