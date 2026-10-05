// Display name rules, kept in one place so sign-in, the edit screen, and
// the one-time prompt all agree.

// The handle_new_user database trigger writes this exact text into
// profiles.display_name when a new account arrives with no name in its
// sign-in metadata. Sign in with Apple is the common case: Apple never
// puts the name in the ID token, so Supabase has nothing to copy.
// If the trigger's fallback text ever changes, change it here too.
export const FALLBACK_DISPLAY_NAME = "Volunteer";

export const MAX_DISPLAY_NAME_LENGTH = 40;

// True when the profile has no real name yet.
export function isFallbackName(name: string | null | undefined): boolean {
  const trimmed = (name ?? "").trim();
  return trimmed === "" || trimmed === FALLBACK_DISPLAY_NAME;
}

// Tidies what the user typed and checks it. Any future rule for names
// (for example a word filter) belongs in this function.
export function cleanDisplayName(raw: string): {
  value: string;
  error: string | null;
} {
  const value = raw.replace(/\s+/g, " ").trim();

  if (!value) {
    return { value, error: "Please enter your name." };
  }
  if (value.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      value,
      error: `Please keep your name to ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`,
    };
  }
  return { value, error: null };
}

// Builds "First Last" from the two parts Apple hands back. Either part
// can be missing or an empty string. Returns null when there is no name.
export function nameFromParts(
  givenName: string | null | undefined,
  familyName: string | null | undefined
): string | null {
  const joined = [givenName, familyName]
    .map((part) => (part ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, MAX_DISPLAY_NAME_LENGTH)
    .trim();

  return joined || null;
}
