import React, { useState } from "react";
import { X, Lock, User, Mail, MapPin, Phone, Globe } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { COUNTRIES } from "../data/countries.js";

function friendlyError(err) {
  const code = err?.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Current password is incorrect.";
  if (code.includes("weak-password")) return "New password should be at least 6 characters.";
  if (code.includes("requires-recent-login")) return "Please sign out and back in, then try again.";
  if (code.includes("too-many-requests")) return "Too many attempts — please wait a bit and try again.";
  return err?.message || "Something went wrong. Please try again.";
}

const inputWrapStyle = { borderColor: "var(--border)", background: "var(--surface-2)" };
const inputStyle = { color: "var(--ink)" };

function FieldRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 px-3 rounded-md border" style={inputWrapStyle}>
      {Icon && <Icon size={15} style={{ color: "var(--muted)" }} />}
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="font-serif text-base mb-3" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
      {children}
    </h3>
  );
}

function ProfileSection() {
  const { user, profile, updateDisplayName } = useAuth();
  const [username, setUsername] = useState(profile?.displayName || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await updateDisplayName(username);
      setSuccess(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeading>Profile</SectionHeading>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Username</label>
          <FieldRow icon={User}>
            <input
              required
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setSuccess(false); }}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Email</label>
          <FieldRow icon={Mail}>
            <input
              disabled
              type="email"
              value={user?.email || ""}
              className="flex-1 py-3 bg-transparent text-sm outline-none cursor-not-allowed"
              style={{ color: "var(--muted)" }}
            />
          </FieldRow>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Your email can't be changed here.</p>
        </div>

        {error && <p className="text-xs" style={{ color: "var(--oxblood)" }}>{error}</p>}
        {success && <p className="text-xs" style={{ color: "var(--brass)" }}>Username updated.</p>}

        <button
          type="submit"
          disabled={loading || !username.trim() || username.trim() === (profile?.displayName || "")}
          className="w-full py-2.5 rounded-md font-medium text-sm"
          style={{ background: "var(--brass)", color: "#1A1520", opacity: (loading || !username.trim() || username.trim() === (profile?.displayName || "")) ? 0.6 : 1 }}
        >
          {loading ? "Saving…" : "Save username"}
        </button>
      </form>
    </div>
  );
}

function AddressSection() {
  const { profile, updateDeliveryAddress } = useAuth();
  const existing = profile?.address || {};
  const [line1, setLine1] = useState(existing.line1 || "");
  const [line2, setLine2] = useState(existing.line2 || "");
  const [city, setCity] = useState(existing.city || "");
  const [state, setState] = useState(existing.state || "");
  const [zip, setZip] = useState(existing.zip || "");
  const [country, setCountry] = useState(existing.country || "");
  const [phone, setPhone] = useState(existing.phone || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!line1.trim() || !city.trim() || !phone.trim() || !country.trim()) {
      setError("Address, city, phone number, and country are required.");
      return;
    }
    setLoading(true);
    try {
      await updateDeliveryAddress({
        line1: line1.trim(),
        line2: line2.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
        phone: phone.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeading>Delivery Address</SectionHeading>
      <form onSubmit={submit} className="space-y-3">
        <FieldRow icon={MapPin}>
          <input
            required
            type="text"
            placeholder="Street address"
            value={line1}
            onChange={(e) => { setLine1(e.target.value); setSuccess(false); }}
            className="flex-1 py-3 bg-transparent text-sm outline-none"
            style={inputStyle}
          />
        </FieldRow>
        <FieldRow>
          <input
            type="text"
            placeholder="Apt, suite, etc. (optional)"
            value={line2}
            onChange={(e) => { setLine2(e.target.value); setSuccess(false); }}
            className="flex-1 py-3 bg-transparent text-sm outline-none"
            style={inputStyle}
          />
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow>
            <input
              required
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => { setCity(e.target.value); setSuccess(false); }}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
          <FieldRow>
            <input
              type="text"
              placeholder="State / Region"
              value={state}
              onChange={(e) => { setState(e.target.value); setSuccess(false); }}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow>
            <input
              type="text"
              placeholder="ZIP / Postal code"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setSuccess(false); }}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
          <FieldRow icon={Globe}>
            <select
              required
              value={country}
              onChange={(e) => { setCountry(e.target.value); setSuccess(false); }}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={{ ...inputStyle, colorScheme: "dark" }}
            >
              <option value="" disabled style={{ color: "#000" }}>Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} style={{ color: "#000" }}>{c}</option>
              ))}
            </select>
          </FieldRow>
        </div>
        <FieldRow icon={Phone}>
          <input
            required
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setSuccess(false); }}
            className="flex-1 py-3 bg-transparent text-sm outline-none"
            style={inputStyle}
          />
        </FieldRow>

        {error && <p className="text-xs" style={{ color: "var(--oxblood)" }}>{error}</p>}
        {success && <p className="text-xs" style={{ color: "var(--brass)" }}>Delivery address saved.</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-md font-medium text-sm"
          style={{ background: "var(--brass)", color: "#1A1520", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Saving…" : "Save address"}
        </button>
      </form>
    </div>
  );
}

function PasswordSection() {
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
    <div>
      <SectionHeading>Password</SectionHeading>
      {isGoogleOnly ? (
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Your account signs in with Google, so your password is managed through your Google account, not here.
        </p>
      ) : success ? (
        <p className="text-sm" style={{ color: "var(--brass)" }}>Your password has been updated.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <FieldRow icon={Lock}>
            <input
              required
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
          <FieldRow icon={Lock}>
            <input
              required
              type="password"
              placeholder="New password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>
          <FieldRow icon={Lock}>
            <input
              required
              type="password"
              placeholder="Confirm new password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              style={inputStyle}
            />
          </FieldRow>

          {error && <p className="text-xs" style={{ color: "var(--oxblood)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md font-medium text-sm"
            style={{ background: "var(--brass)", color: "#1A1520", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function SettingsModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl border p-6 max-h-[88vh] overflow-y-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4" aria-label="Close">
          <X size={18} style={{ color: "var(--muted)" }} />
        </button>

        <h2 className="font-serif text-2xl mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>Settings</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Manage your profile, delivery address, and password.</p>

        <div className="space-y-7">
          <ProfileSection />
          <div className="border-t" style={{ borderColor: "var(--border)" }} />
          <AddressSection />
          <div className="border-t" style={{ borderColor: "var(--border)" }} />
          <PasswordSection />
        </div>
      </div>
    </div>
  );
}
