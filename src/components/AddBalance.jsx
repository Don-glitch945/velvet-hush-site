import React, { useState } from "react";
import { ArrowLeft, Wallet, CreditCard, Wallet as WalletIcon, Smartphone } from "lucide-react";

const PRESETS = [20, 50, 100, 200];

// Balance can't be written directly from the client — firestore.rules
// only lets a non-admin update their own user doc when `balance` stays
// unchanged, on purpose, so nobody can just gift themselves credit from
// devtools. A top-up has to go through the same trusted, server-side
// path as checkout: create a session here, and once payment actually
// completes the backend (Admin SDK, same as the order webhook) credits
// the user's balance and the live profile subscription picks it up.
export default function AddBalance({ profile, apiUrl, onBack }) {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [payment, setPayment] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const validAmount = Number.isFinite(effectiveAmount) && effectiveAmount > 0;

  const submit = async () => {
    setError(null);
    if (!validAmount) {
      setError("Enter an amount greater than $0.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/create-balance-topup-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount, paymentMethod: payment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start the top-up.");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Something went wrong reaching checkout. Is the payment server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto px-5 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Wallet size={18} style={{ color: "var(--brass)" }} />
        <h2 className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif" }}>Add Balance</h2>
      </div>

      <div className="p-5 rounded-lg border flex items-center justify-between mb-8" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Current Balance</p>
        <p className="font-serif text-xl" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>
          ${Number(profile?.balance ?? 0).toFixed(2)}
        </p>
      </div>

      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Amount</p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESETS.map((p) => {
          const active = !customAmount && amount === p;
          return (
            <button
              key={p}
              onClick={() => { setAmount(p); setCustomAmount(""); }}
              className="py-2.5 rounded-md border text-sm font-medium"
              style={{
                borderColor: active ? "var(--brass)" : "var(--border)",
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--brass)" : "var(--ink)",
              }}
            >
              ${p}
            </button>
          );
        })}
      </div>
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted)" }}>$</span>
        <input
          type="number"
          min="1"
          step="1"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Custom amount"
          className="w-full pl-7 pr-3 py-2.5 rounded-md border text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--ink)" }}
        />
      </div>

      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Payment Method</p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { id: "card", label: "Card", icon: CreditCard },
          { id: "paypal", label: "PayPal", icon: WalletIcon },
          { id: "walletpay", label: "Mobile Pay", icon: Smartphone },
        ].map((m) => {
          const MIcon = m.icon;
          const active = payment === m.id;
          return (
            <button key={m.id} onClick={() => setPayment(m.id)}
              className="flex flex-col items-center gap-1 py-2 rounded-md border text-[11px]"
              style={{ borderColor: active ? "var(--brass)" : "var(--border)", background: active ? "var(--surface-2)" : "transparent", color: active ? "var(--brass)" : "var(--muted)" }}>
              <MIcon size={15} />
              {m.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs mb-4" style={{ color: "var(--oxblood)" }}>{error}</p>}

      <button
        onClick={submit}
        disabled={!validAmount || loading}
        className="w-full py-3 rounded-md font-medium"
        style={{ background: validAmount ? "var(--brass)" : "var(--surface-2)", color: validAmount ? "#1A1520" : "var(--muted)", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Redirecting to checkout…" : `Add $${validAmount ? effectiveAmount.toFixed(2) : "0.00"} to Balance`}
      </button>
    </section>
  );
}
