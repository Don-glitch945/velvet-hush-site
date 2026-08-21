import React, { useState } from "react";
import { X, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function friendlyError(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Current password is incorrect.";
  if (code.includes("weak-password")) return "New password should be at least 6 characters.";
  if (code.includes("requires-recent-login")) return "Please sign out and back in, then try again.";
  if (code.includes("too-many-requests")) return "Too many attempts — please wait a bit and try again.";
  return err?.message || "Something went wrong. Please try again.";
}

export default function SettingsModal({ onClose }) {
  const { user, changePassword } = useAuth();
  const isGoogleOnly =
    user?.providerData?.some((p) => p.providerId === "google.com") &&
    !user?.providerData?.some((p) => p.providerId === "password");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button onClick={onClose} className="absolute top-4 right-4" aria-label="Close">
          <X size={18} style={{ color: "var(--muted)" }} />
        </button>

        <h2 className="font-serif text-2xl mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>Settings</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Change your password.</p>

        {isGoogleOnly ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            Your account signs in with Google, so your password is managed through your Google account, not here.
          </p>
        ) : success ? (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--ink)" }}>Your password has been updated.</p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-md font-medium"
              style={{ background: "var(--brass)", color: "#1A1520" }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <Lock size={15} style={{ color: "var(--muted)" }} />
              <input
                required
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex-1 py-3 bg-transparent text-sm outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>
            <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <Lock size={15} style={{ color: "var(--muted)" }} />
              <input
                required
                type="password"
                placeholder="New password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 py-3 bg-transparent text-sm outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>
            <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <Lock size={15} style={{ color: "var(--muted)" }} />
              <input
                required
                type="password"
                placeholder="Confirm new password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 py-3 bg-transparent text-sm outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>

            {error && <p className="text-xs" style={{ color: "var(--oxblood)" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-medium"
              style={{ background: "var(--brass)", color: "#1A1520", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
