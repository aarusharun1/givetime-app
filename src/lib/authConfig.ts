// ─────────────────────────────────────────────────────────────
// Native sign-in configuration
//
// These are Google OAuth *client IDs*, not secrets. They are safe
// to commit. The iOS one also appears in ios/App/App/Info.plist
// in reversed form, so it is already in the repo either way.
//
// TO FILL IN:
//
// GOOGLE_IOS_CLIENT_ID
//   Google Cloud Console > APIs & Services > Credentials
//   > Create credentials > OAuth client ID > Application type: iOS
//   > Bundle ID: co.givetime.app
//   Copy the "Client ID" value. Ends in .apps.googleusercontent.com
//
// GOOGLE_WEB_CLIENT_ID
//   The Web application client ID you already created for the
//   Supabase Google provider. Same value that is pasted into
//   Supabase > Authentication > Providers > Google > Client ID.
// ─────────────────────────────────────────────────────────────

export const GOOGLE_IOS_CLIENT_ID = "928916741121-h04evq1lcvrdu33dlk1hbd3cjddmfh5i.apps.googleusercontent.com";

export const GOOGLE_WEB_CLIENT_ID = "928916741121-ounshpbm2g8aptf78ua71k46r0ninh98.apps.googleusercontent.com";

// Client IDs that are allowed to appear in the "aud" claim of a
// Google ID token. Used as a sanity check before handing the token
// to Supabase.
export const VALID_GOOGLE_AUDIENCES = [
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
];

export function googleConfigIsPlaceholder(): boolean {
  return (
    GOOGLE_IOS_CLIENT_ID.startsWith("REPLACE_WITH") ||
    GOOGLE_WEB_CLIENT_ID.startsWith("REPLACE_WITH")
  );
}
