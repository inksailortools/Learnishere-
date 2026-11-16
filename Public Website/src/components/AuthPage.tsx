import { FormEvent, useEffect, useRef, useState } from "react";
import { authApi, AuthApiError } from "../lib/auth";

type AuthPageName = "login" | "register" | "forgot-password" | "verify-email" | "reset-password";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

function postLoginDestination() {
  const candidate =
    new URLSearchParams(window.location.search).get("next") ||
    window.localStorage.getItem("learnisphere:return-to");
  if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) {
    const target = new URL(candidate, window.location.origin);
    if (
      target.origin === window.location.origin &&
      (target.pathname === "/checkout" ||
        target.pathname === "/cart" ||
        target.pathname === "/dashboard" ||
        target.pathname.startsWith("/dashboard/"))
    ) {
      window.localStorage.removeItem("learnisphere:return-to");
      return `${target.pathname}${target.search}${target.hash}`;
    }
  }
  window.localStorage.removeItem("learnisphere:return-to");
  return "/dashboard";
}

export function AuthPage({
  page,
  navigate,
}: {
  page: AuthPageName;
  navigate: (to: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const acceptedTermsRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const googleButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (page !== "login" && page !== "register") return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButton.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (page === "register" && !acceptedTermsRef.current) {
            setError("Accept the Terms and Privacy Policy before creating an account.");
            return;
          }
          setBusy(true);
          setError("");
          try {
            try {
              await authApi.google(credential, page === "register", page === "register");
            } catch (reason) {
              if (!(reason instanceof AuthApiError) || reason.status !== 409) throw reason;
              await authApi.googleLink(credential);
            }
            window.location.assign(postLoginDestination());
          } catch (reason) {
            setError(
              reason instanceof Error ? reason.message : "Google sign-in could not be completed.",
            );
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: "320",
        text: page === "register" ? "signup_with" : "signin_with",
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => setError("Google sign-in is currently unavailable.");
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [page]);

  useEffect(() => {
    if (page !== "verify-email") return;
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("This verification link is invalid or has expired.");
      return;
    }
    let active = true;
    authApi.verifyEmail(token).then(
      (result) => {
        if (active) setMessage(result.detail || "Your email is verified. You can now sign in.");
      },
      (reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Verification failed.");
      },
    );
    return () => {
      active = false;
    };
  }, [page]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (page === "login") {
        await authApi.login(email, password, rememberMe);
        window.location.assign(postLoginDestination());
      } else if (page === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 12) {
          throw new Error("Use a password with at least 12 characters.");
        }
        const result = await authApi.register(fullName, email, password);
        setMessage(result.detail || "Check your email to verify your account.");
      } else if (page === "reset-password") {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        const params = new URLSearchParams(window.location.search);
        const uid = params.get("uid");
        const token = params.get("token");
        if (!uid || !token) throw new Error("This reset link is invalid or has expired.");
        const result = await authApi.resetPassword(uid, token, password);
        setMessage(result.detail || "Password updated. You can now sign in.");
      } else {
        const result = await authApi.forgotPassword(email);
        setMessage(
          result.detail ||
            "If an account exists for this address, we’ll send instructions to reset its password.",
        );
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const title =
    page === "login"
      ? "Welcome back"
      : page === "register"
        ? "Create your account"
        : page === "verify-email"
          ? "Verify your email"
          : "Reset your password";
  const description =
    page === "login"
      ? "Sign in to continue your learning journey."
      : page === "register"
        ? "Build practical skills with learning designed around you."
        : page === "verify-email"
          ? "We’re checking your verification link."
          : page === "reset-password"
            ? "Choose a new password for your account."
            : "Enter your email and we’ll send reset instructions if an account exists.";

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <button className="auth-brand" onClick={() => navigate("/")} aria-label="LearnIsphere home">
          <img className="brand-logo-image" src="/learnisphere-logo.png" alt="" aria-hidden="true" />
          <span>Learn<span>Isphere</span></span>
        </button>
        <p className="eyebrow">LEARNISPHERE ACCOUNT</p>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>

        {(page === "login" || page === "register") && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="google-signin" ref={googleButton} />
            <div className="auth-divider"><span>or use your email</span></div>
          </>
        )}

        {page !== "verify-email" && (
        <form
          className={`auth-form ${page === "login" || page === "register" ? "auth-form-compact" : ""}`}
          onSubmit={submit}
        >
          {page === "register" && (
            <label>
              Full name
              <input
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
              />
            </label>
          )}
          {(page === "login" || page === "register" || page === "forgot-password") && <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>}
          {(page === "login" || page === "register" || page === "reset-password") && (
            <label>
              Password
              <span className="auth-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={page === "login" ? "current-password" : "new-password"}
                  required
                  minLength={page !== "login" ? 12 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={page === "login" ? "Your password" : "At least 12 characters"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>
          )}
          {(page === "register" || page === "reset-password") && (
            <>
              <label>
                Confirm password
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                />
              </label>
              {page === "register" && <label className="auth-terms">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(event) => {
                    acceptedTermsRef.current = event.target.checked;
                    setAcceptedTerms(event.target.checked);
                  }}
                />
                <span>I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span>
              </label>}
            </>
          )}
          {page === "login" && (
            <div className="auth-form-meta">
              <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <button type="button" className="auth-text-button" onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </button>
            </div>
          )}
          {error && <p className="auth-feedback error" role="alert">{error}</p>}
          {page === "login" && error.startsWith("Verify your email") && (
            <button
              className="auth-text-button"
              type="button"
              onClick={async () => {
                try {
                  const result = await authApi.resendVerification(email);
                  setMessage(result.detail || "If the account can be verified, an email will be sent.");
                } catch (reason) {
                  setError(reason instanceof Error ? reason.message : "Could not resend verification.");
                }
              }}
            >
              Resend verification email
            </button>
          )}
          {message && <p className="auth-feedback success" role="status">{message}</p>}
          <button className="button auth-submit" type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : page === "login"
                ? "Sign in"
                : page === "register"
                  ? "Create account"
                  : page === "reset-password"
                    ? "Save new password"
                  : "Send reset link"}
          </button>
        </form>
        )}

        {page !== "verify-email" && <p className="auth-switch">
          {page === "login" ? (
            <>New to LearnIsphere? <button onClick={() => navigate("/register")}>Create an account</button></>
          ) : page === "register" ? (
            <>Already have an account? <button onClick={() => navigate("/login")}>Sign in</button></>
          ) : (
            <>Remembered your password? <button onClick={() => navigate("/login")}>Back to sign in</button></>
          )}
        </p>}
        {page === "verify-email" && <p className="auth-switch"><button onClick={() => navigate("/login")}>Continue to sign in</button></p>}
      </section>
    </main>
  );
}
