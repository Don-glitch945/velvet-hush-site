import React from "react";
import { ArrowLeft, User, Wallet, Package, Settings } from "lucide-react";

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  const tone =
    s === "fulfilled" || s === "delivered" || s === "completed" ? "brass" :
    s === "cancelled" || s === "refunded" || s === "failed" ? "oxblood" :
    "muted";
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide"
      style={{
        color: tone === "muted" ? "var(--muted)" : `var(--${tone})`,
        background: "var(--surface-2)",
        border: `1px solid ${tone === "muted" ? "var(--border)" : `var(--${tone})`}`,
      }}
    >
      {label}
    </span>
  );
}

function formatDate(ts) {
  // Firestore Timestamp has .toDate(); fall back gracefully otherwise.
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function OrderRow({ order }) {
  const items = order.items || [];
  const itemSummary = items.length
    ? items.map((it) => `${it.name}${it.qty > 1 ? ` ×${it.qty}` : ""}`).join(", ")
    : "—";
  return (
    <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm truncate" style={{ color: "var(--ink)" }}>
            {order.id ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Order"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-sm mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>{itemSummary}</p>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: "var(--muted)" }}>{order.paymentMethod ? { card: "Card", paypal: "PayPal", walletpay: "Mobile Pay" }[order.paymentMethod] || order.paymentMethod : ""}</span>
        <span className="font-serif" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>${Number(order.total ?? 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function AccountPanel({ user, profile, orders, ordersLoading, onBack, onSettings }) {
  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)" }}>
            <User size={20} style={{ color: "var(--brass)" }} />
          </div>
          <div>
            <h2 className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif" }}>{profile?.displayName || "Customer"}</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{user?.email}</p>
          </div>
        </div>
        {onSettings && (
          <button onClick={onSettings} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm" style={{ background: "var(--surface)" }}>
            <Settings size={14} style={{ color: "var(--muted)" }} /> Settings
          </button>
        )}
      </div>

      <div className="p-5 rounded-lg border flex items-center justify-between mb-10" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <Wallet size={16} style={{ color: "var(--brass)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Account Balance</p>
        </div>
        <p className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>
          ${Number(profile?.balance ?? 0).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Package size={16} style={{ color: "var(--brass)" }} />
        <h3 className="font-serif text-lg" style={{ fontFamily: "Fraunces, serif" }}>Order History</h3>
      </div>

      {ordersLoading ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading your orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <OrderRow key={o.id} order={o} />)}
        </div>
      )}
    </section>
  );
}
