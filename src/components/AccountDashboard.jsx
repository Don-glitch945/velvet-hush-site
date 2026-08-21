import React from "react";
import { ArrowLeft, User, Wallet, Package, Settings, ChevronRight, PlusCircle } from "lucide-react";
import { StatusBadge, formatDate } from "../lib/orderFormat.jsx";

// Landing view for the signed-in account area. Just identity, balance,
// and quick links out to Order History / Add Balance — those live on
// their own routes now instead of being inlined here.
export default function AccountDashboard({ user, profile, orders, ordersLoading, onBack, onSettings, onOrders, onAddBalance }) {
  const recentOrders = (orders || []).slice(0, 3);

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

      <div className="p-5 rounded-lg border flex items-center justify-between mb-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <Wallet size={16} style={{ color: "var(--brass)" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Account Balance</p>
            <p className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>
              ${Number(profile?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={onAddBalance}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shrink-0"
          style={{ background: "var(--brass)", color: "#1A1520" }}
        >
          <PlusCircle size={14} /> Add Balance
        </button>
      </div>

      <button
        onClick={onOrders}
        className="w-full p-5 rounded-lg border flex items-center justify-between mb-10 text-left hover:opacity-90 transition-opacity"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <Package size={16} style={{ color: "var(--brass)" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "var(--ink)" }}>Order History</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {ordersLoading ? "Loading…" : `${orders?.length || 0} order${orders?.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: "var(--muted)" }} />
      </button>

      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg" style={{ fontFamily: "Fraunces, serif" }}>Recent Orders</h3>
            <button onClick={onOrders} className="text-xs" style={{ color: "var(--brass)" }}>View all</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-4 rounded-lg border flex items-center justify-between gap-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--ink)" }}>
                    {o.id ? `Order #${o.id.slice(0, 8).toUpperCase()}` : "Order"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={o.status} />
                  <span className="font-serif text-sm" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>${Number(o.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
