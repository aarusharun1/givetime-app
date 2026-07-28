"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import AuthModal from "./AuthModal";

interface HeaderProps {
  activeTab?: "browse" | "hours";
  onTabChange?: (tab: "browse" | "hours") => void;
}

export default function Header({ activeTab = "browse", onTabChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, deleteAccount, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setDeleting(false);
    } else {
      setShowDeleteConfirm(false);
    }
  };

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-md safe-top"
        style={{
          backgroundColor:
            theme === "dark"
              ? "rgba(18, 18, 18, 0.9)"
              : "rgba(253, 252, 250, 0.9)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src={
                theme === "dark"
                  ? "/images/logo-nav-dark.png"
                  : "/images/logo-nav-light.png"
              }
              alt="GiveTime"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </a>

          {/* Tab navigation (center) */}
          {user && onTabChange && (
            <nav className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-filter)" }}>
              <button
                onClick={() => onTabChange("browse")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === "browse" ? "var(--bg-card)" : "transparent",
                  color: activeTab === "browse" ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: activeTab === "browse" ? "var(--shadow-card)" : "none",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Browse
              </button>
              <button
                onClick={() => onTabChange("hours")}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === "hours" ? "var(--bg-card)" : "transparent",
                  color: activeTab === "hours" ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: activeTab === "hours" ? "var(--shadow-card)" : "none",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                My Hours
              </button>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://givetime.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-inter hidden md:block"
              style={{ color: "var(--text-secondary)" }}
            >
              Our Website
            </a>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor:
                  theme === "dark" ? "var(--green-primary)" : "#D1D5DB",
              }}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span
                className="absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{
                  transform:
                    theme === "dark" ? "translateX(30px)" : "translateX(2px)",
                }}
              >
                {theme === "dark" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </span>
            </button>

            {/* Auth button / user menu */}
            {!authLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--green-primary)" }}
                      aria-label="User menu"
                    >
                      {initials}
                    </button>
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div
                          className="absolute right-0 top-10 z-50 w-52 rounded-xl py-2 shadow-lg"
                          style={{
                            backgroundColor: "var(--bg-card)",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border-color)" }}>
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {profile?.display_name}
                            </p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                              {user.email}
                            </p>
                          </div>
                          {/* Mobile tab links */}
                          {onTabChange && (
                            <div className="sm:hidden border-b" style={{ borderColor: "var(--border-color)" }}>
                              <button
                                onClick={() => { onTabChange("browse"); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                                style={{ color: activeTab === "browse" ? "var(--green-primary)" : "var(--text-primary)" }}
                              >
                                Browse
                              </button>
                              <button
                                onClick={() => { onTabChange("hours"); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                                style={{ color: activeTab === "hours" ? "var(--green-primary)" : "var(--text-primary)" }}
                              >
                                My Hours
                              </button>
                            </div>
                          )}
                          <a
                            href="/submit"
                            onClick={() => setShowUserMenu(false)}
                            className="block w-full text-left px-4 py-2 text-sm hover:opacity-70"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Submit an organization
                          </a>
                          <a
                            href="/info"
                            onClick={() => setShowUserMenu(false)}
                            className="block w-full text-left px-4 py-2 text-sm hover:opacity-70"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Info
                          </a>
                          <a
                            href="/summary"
                            onClick={() => setShowUserMenu(false)}
                            className="block w-full text-left px-4 py-2 text-sm hover:opacity-70"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Monthly summary
                          </a>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setDeleteInput("");
                              setDeleteError("");
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                            style={{ color: "#EF4444" }}
                          >
                            Delete account
                          </button>
                          <button
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:opacity-70"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-colors"
                    style={{
                      backgroundColor: "var(--green-primary)",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Sign in
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "#EF4444",
              }}
            >
              Delete your account?
            </h3>
            <p
              className="text-sm mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              This will permanently delete your account and all your data, including:
            </p>
            <ul
              className="text-sm mb-4 list-disc pl-5"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>Your profile information</li>
              <li>All volunteer hour logs</li>
              <li>Your analytics and export history</li>
            </ul>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              This action cannot be undone. Type{" "}
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                DELETE
              </span>{" "}
              to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-4 py-2.5 rounded-xl text-sm mb-4"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
            {deleteError && (
              <p className="text-sm text-red-500 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{
                  backgroundColor:
                    deleteInput === "DELETE" && !deleting
                      ? "#EF4444"
                      : "#9CA3AF",
                }}
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
