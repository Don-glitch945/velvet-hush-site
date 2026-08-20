import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email already has an account — try signing in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is incorrect.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before finishing.";
  return err?.message || "Something went wrong. Please try again.";
}

export default function AuthModal({ onClose }) {
  const { signIn, signUp, signInGoogle } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button onClick={onClose} className="absolute top-4 right-4" aria-label="Close">
          <X size={18} style={{ color: "var(--muted)" }} />
        </button>

        <h2 className="font-serif text-2xl mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          {mode === "signup" ? "Takes about 10 seconds." : "Welcome back to Velvet Hush."}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <UserIcon size={15} style={{ color: "var(--muted)" }} />
              <input
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 py-3 bg-transparent text-sm outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>
          )}
          <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <Mail size={15} style={{ color: "var(--muted)" }} />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <div className="flex items-center gap-2 px-3 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <Lock size={15} style={{ color: "var(--muted)" }} />
            <input
              required
              type="password"
              placeholder="Password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <button
          onClick={google}
          disabled={loading}
          className="w-full py-3 rounded-md font-medium border flex items-center justify-center gap-2"
          style={{ borderColor: "var(--border)", color: "var(--ink)", background: "var(--surface-2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.9l6.2 5.2C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <p className="text-xs text-center mt-6" style={{ color: "var(--muted)" }}>
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
            className="underline"
            style={{ color: "var(--brass)" }}
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
