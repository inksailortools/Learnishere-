import { headers } from "next/headers";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "super_admin";
};

const apiBase =
  process.env.DJANGO_API_INTERNAL_URL || "http://127.0.0.1:8000/api";
const publicOrigin =
  process.env.PUBLIC_SITE_ORIGIN ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8443"
    : "https://www.learnisphere.com");

export async function getCurrentUser(): Promise<AuthUser | null> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  if (!cookie) return null;

  const response = await fetch(`${apiBase}/auth/me/`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) {
    throw new Error(`Session validation failed with status ${response.status}`);
  }
  const body = (await response.json()) as { user?: AuthUser };
  return body.user ?? null;
}

export function loginLocation(returnTo: string) {
  const params = new URLSearchParams({ next: returnTo });
  return `${publicOrigin}/login?${params.toString()}`;
}

export function dashboardLocation(role: "student" | "admin") {
  return `${publicOrigin}/dashboard/${role}`;
}
