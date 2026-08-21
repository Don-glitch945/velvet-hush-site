import React from "react";
import { ArrowLeft, Package } from "lucide-react";
import { OrderRow } from "../lib/orderFormat.jsx";

export default function OrderHistory({ orders, ordersLoading, onBack }) {
  return (
    <section className="max-w-3xl mx-auto px-5 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Package size={18} style={{ color: "var(--brass)" }} />
        <h2 className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif" }}>Order History</h2>
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
