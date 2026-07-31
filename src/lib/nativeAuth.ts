"use client";

import { supabase } from "@/lib/supabase";
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  VALID_GOOGLE_AUDIENCES,
  googleConfigIsPlaceholder,
} from "@/lib/authConfig";

// ─── Nonce helpers ───────────────────────────────────────────
//
// Google Sign-In receives the SHA-256 hash of the nonce and embeds
// that hash in the ID token. Supabase receives the raw nonce, hashes
// it itself, and compares. So the two sides get different values on
// purpose. Mixing them up is the most common cause of a silent
// "Invalid token" from Supabase.

function randomHexNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function makeNoncePair() {
  const rawNonce = randomHexNonce();
  const nonceDigest = await sha256Hex(rawNonce);
  return { rawNonce, nonceDigest };
}

// ─── JWT inspection ──────────────────────────────────────────

type JwtPayload = {
  aud?: string;
  nonce?: string;
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function validateGoogleToken(
  idToken: string,
  expectedNonceDigest: string
): { valid: boolean; error?: string } {
  const payload = decodeJwtPayload(idToken);
  if (!payload) return { valid: false, error: "Could not read the Google token." };

  if (!payload.aud || !VALID_GOOGLE_AUDIENCES.includes(payload.aud)) {
    return {
      valid: false,
      error:
        "Google token audience did not match a configured client ID. Check GOOGLE_IOS_CLIENT_ID and GOOGLE_WEB_CLIENT_ID in src/lib/authConfig.ts.",
    };
  }

  // A cached token from a previous session can carry a stale nonce.
  // The caller handles this by logging out and retrying once.
  if (payload.nonce && payload.nonce !== expectedNonceDigest) {
    return { valid: false, error: "Nonce mismatch (likely a cached Google token)." };
  }

  return { valid: true };
}

// ─── Google ──────────────────────────────────────────────────

export async function signInWithGoogleNative(
  isRetry = false
): Promise<{ error: string | null }> {
  if (googleConfigIsPlaceholder()) {
    return {
      error:
        "Google sign-in is not configured. Fill in the client IDs in src/lib/authConfig.ts.",
    };
  }

  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");

    const { rawNonce, nonceDigest } = await makeNoncePair();

    await SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
        mode: "online",
      },
    });

    const response = await SocialLogin.login({
      provider: "google",
      options: {
        scopes: ["email", "profile"],
        nonce: nonceDigest,
      },
    });

    const result = response.result as {
      responseType?: string;
      idToken?: string | null;
    };

    if (result.responseType !== "online" || !result.idToken) {
      return { error: "Google did not return an ID token." };
    }

    const idToken = result.idToken;
    const check = validateGoogleToken(idToken, nonceDigest);

    if (!check.valid) {
      if (!isRetry) {
        // Clear the cached Google session and try once more so a fresh
        // token is minted with the nonce we just generated.
        try {
          await SocialLogin.logout({ provider: "google" });
        } catch {}
        return signInWithGoogleNative(true);
      }
      return { error: check.error ?? "Google token failed validation." };
    }

    const payload = decodeJwtPayload(idToken);

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      ...(payload?.nonce ? { nonce: rawNonce } : {}),
    });

    return { error: error?.message ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The user tapping "Cancel" on the Google sheet is not an error worth showing.
    if (/cancel/i.test(message)) return { error: null };
    return { error: message || "Google sign-in failed." };
  }
}

// ─── Apple ───────────────────────────────────────────────────

export async function signInWithAppleNative(): Promise<{ error: string | null }> {
  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");

    // On iOS the plugin uses the app's bundle ID (co.givetime.app) as the
    // Apple client ID automatically, so nothing is passed here. That means
    // the resulting ID token has aud = co.givetime.app, NOT the Services ID.
    // The Supabase Apple provider must list co.givetime.app as an authorized
    // client ID or it will reject the token.
    await SocialLogin.initialize({ apple: {} });

    const response = await SocialLogin.login({
      provider: "apple",
      options: {},
    });

    const result = response.result as { idToken?: string | null };

    if (!result.idToken) {
      return { error: "Apple did not return an ID token." };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: result.idToken,
    });

    return { error: error?.message ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/cancel/i.test(message)) return { error: null };
    return { error: message || "Apple sign-in failed." };
  }
}
