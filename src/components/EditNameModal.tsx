"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { MAX_DISPLAY_NAME_LENGTH, isFallbackName } from "@/lib/displayName";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * "edit" is opened on purpose from the profile menu.
   * "prompt" is shown once, automatically, when no name is on file. It can
   * be skipped but not dismissed by tapping outside, so it is never skipped
   * by accident.
   */
  variant?: "edit" | "prompt";
}

export default function EditNameModal({
  isOpen,
  onClose,
  variant = "edit",
}: EditNameModalProps) {
  const { profile, updateDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isPrompt = variant === "prompt";
  const currentName = profile?.display_name ?? "";

  // Start from the current name each time the modal opens. The "Volunteer"
  // placeholder is not a real name, so the field starts empty for it.
  // This runs on open only, on purpose: if the profile reloads in the
  // background it must not wipe out what the user is typing.
  useEffect(() => {
    if (!isOpen) return;
    setName(isFallbackName(currentName) ? "" : currentName);
    setError("");
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    const { error: saveError } = await updateDisplayName(name);
    if (saveError) {
      setError(saveError);
      setSaving(false);
      return;
    }
    onClose();
  };

  const canSave = name.trim().length > 0 && !saving;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      onClick={isPrompt || saving ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-name-title"
      >
        <h3
          id="edit-name-title"
          className="text-lg font-bold mb-2"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: "var(--text-primary)",
          }}
        >
          {isPrompt ? "What should we call you?" : "Edit name"}
        </h3>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {isPrompt
            ? "Your name shows on your profile and on the hour reports you export. You can change it later from your profile."
            : "Your name shows on your profile and on the hour reports you export."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            enterKeyHint="done"
            autoFocus={!isPrompt}
            className="w-full px-4 py-2.5 rounded-xl text-sm mb-4"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              fontSize: "16px",
            }}
          />

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              {isPrompt ? "Skip for now" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{
                backgroundColor: canSave ? "var(--green-primary)" : "#9CA3AF",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
