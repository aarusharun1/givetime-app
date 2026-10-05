"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import EditNameModal from "./EditNameModal";

// Asks for a name once when the account has none on file. That happens
// when Sign in with Apple did not hand one over: on the web, where Apple
// never sends it, and for returning users, since Apple only sends the name
// the first time someone authorizes the app.
//
// "Skip for now" is remembered per account on this device, so nobody is
// asked twice. The name can always be set later from the profile menu.

const promptHandledKey = (userId: string) => `givetime-name-prompt-${userId}`;

export default function NamePrompt() {
  const { user, needsName } = useAuth();
  const userId = user?.id ?? null;

  // Start as "handled" so nothing flashes before localStorage is read.
  // (Reading it during render would also cause a hydration mismatch.)
  const [handled, setHandled] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHandled(true);
      return;
    }
    let alreadyHandled = false;
    try {
      alreadyHandled =
        window.localStorage.getItem(promptHandledKey(userId)) === "true";
    } catch {}
    setHandled(alreadyHandled);
  }, [userId]);

  if (!userId || !needsName || handled) return null;

  // Runs after a save and after "Skip for now".
  const handleClose = () => {
    try {
      window.localStorage.setItem(promptHandledKey(userId), "true");
    } catch {}
    setHandled(true);
  };

  return <EditNameModal isOpen variant="prompt" onClose={handleClose} />;
}
