"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setAgeConfirmed(false);
    setError("");
    setSignUpSuccess(false);
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError("Please enter your name.");
        setSubmitting(false);
        return;
      }
      if (!ageConfirmed) {
        setError("You must confirm you are 13 or older to create an account.");
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setSubmitting(false);
        return;
      }
      const { error: signUpError } = await signUpWithEmail(
        email,
        password,
        displayName.trim()
      );
      if (signUpError) {
        setError(signUpError);
      } else {
        setSignUpSuccess(true);
      }
    } else {
      const { error: signInError } = await signInWithEmail(email, password);
      if (signInError) {
        setError(signInError);
      } else {
        resetForm();
        onClose();
      }
    }

    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    const { error: appleError } = await signInWithApple();
    if (appleError) {
      setError(appleError);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {signUpSuccess ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--green-light)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              Check your email
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
            </p>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-sm font-medium"
              style={{ color: "var(--green-primary)" }}
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Sora', sans-serif", color: "var(--text-primary)" }}
            >
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              {mode === "signin"
                ? "Sign in to log hours and track your progress."
                : "Start tracking your volunteer hours with GiveTime."}
            </p>

            {/* Google sign-in button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-4"
              style={{
                backgroundColor: "var(--bg-filter)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Apple sign-in button */}
            <button
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors mb-4"
              style={{
                backgroundColor: "var(--bg-filter)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-color)" }} />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--bg-filter)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-filter)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                required
              />
              <input
                type="password"
                placeholder={mode === "signup" ? "Create a password (6+ characters)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-filter)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                required
              />

              {mode === "signup" && (
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-green-600"
                  />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    I confirm that I am 13 years of age or older
                  </span>
                </label>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--green-primary)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {submitting
                  ? "..."
                  : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-sm text-center mt-5" style={{ color: "var(--text-secondary)" }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium"
                style={{ color: "var(--green-primary)" }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
