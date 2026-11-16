async function csrfToken() {
  const response = await fetch("/api/auth/csrf/", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not start a secure request.");
  const body = (await response.json()) as { csrfToken?: string };
  if (!body.csrfToken) throw new Error("Could not start a secure request.");
  return body.csrfToken;
}

export async function logout() {
  const token = await csrfToken();
  const response = await fetch("/api/auth/logout/", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-CSRFToken": token },
  });
  if (!response.ok) throw new Error("Sign out failed. Please try again.");
  const publicOrigin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8443"
      : window.location.origin;
  window.location.assign(`${publicOrigin}/login`);
}
