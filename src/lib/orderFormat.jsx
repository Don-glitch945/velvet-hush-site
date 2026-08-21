import React from "react";

export function StatusBadge({ status }) {
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

export function formatDate(ts) {
  // Firestore Timestamp has .toDate(); fall back gracefully otherwise.
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function OrderRow({ order }) {
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
