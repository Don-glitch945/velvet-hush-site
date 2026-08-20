import React, { useState } from "react";
import { ArrowLeft, Trash2, Plus, Save, Database, ShieldCheck, Package, Users as UsersIcon } from "lucide-react";
import { useProducts, createProduct, updateProduct, deleteProduct, seedDemoCatalog } from "../hooks/useProducts.js";
import { useUsers, setUserBalance, setUserRole } from "../hooks/useUsers.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const CATEGORY_IDS = ["cigars", "vapes", "glass", "lubricants", "intimacy", "tools"];

const inputStyle = {
  background: "var(--surface-2)",
  borderColor: "var(--border)",
  color: "var(--ink)",
};

function ProductRow({ product }) {
  const [draft, setDraft] = useState({
    name: product.name,
    cat: product.cat,
    price: product.price,
    note: product.note || "",
    stock: product.stock ?? 0,
    available: product.available !== false,
    imageUrl: product.imageUrl || "",
    pattern: product.pattern || "dots",
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      await updateProduct(product.id, {
        ...draft,
        price: Number(draft.price) || 0,
        stock: Number(draft.stock) || 0,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    await deleteProduct(product.id);
  };

  return (
    <tr className="border-b align-top" style={{ borderColor: "var(--border)" }}>
      <td className="py-3 pr-3">
        <input value={draft.name} onChange={(e) => set({ name: e.target.value })}
          className="w-40 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
        <input value={draft.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })}
          placeholder="Image URL (optional)"
          className="w-40 mt-1 px-2 py-1.5 rounded border text-xs" style={inputStyle} />
      </td>
      <td className="py-3 pr-3">
        <select value={draft.cat} onChange={(e) => set({ cat: e.target.value })}
          className="px-2 py-1.5 rounded border text-sm" style={inputStyle}>
          {CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ color: "var(--muted)" }}>$</span>
          <input type="number" min="0" step="0.01" value={draft.price}
            onChange={(e) => set({ price: e.target.value })}
            className="w-20 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
        </div>
      </td>
      <td className="py-3 pr-3">
        <input type="number" min="0" value={draft.stock}
          onChange={(e) => set({ stock: e.target.value })}
          className="w-20 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
      </td>
      <td className="py-3 pr-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={draft.available} onChange={(e) => set({ available: e.target.checked })} />
          Listed
        </label>
      </td>
      <td className="py-3 pr-3">
        <button onClick={save} disabled={!dirty || saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: dirty ? "var(--brass)" : "var(--surface-2)", color: dirty ? "#1A1520" : "var(--muted)" }}>
          <Save size={12} /> {saving ? "Saving…" : "Save"}
        </button>
      </td>
      <td className="py-3">
        <button onClick={remove} aria-label="Delete product">
          <Trash2 size={15} style={{ color: "var(--oxblood)" }} />
        </button>
      </td>
    </tr>
  );
}

function NewProductForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", cat: "cigars", price: "", note: "", stock: "0", imageUrl: "", pattern: "dots" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProduct({
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        available: true,
      });
      setForm({ name: "", cat: "cigars", price: "", note: "", stock: "0", imageUrl: "", pattern: "dots" });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
        style={{ background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)" }}>
        <Plus size={14} /> Add product
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-lg border grid md:grid-cols-3 gap-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle}>
        {CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input placeholder="Short description" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
        className="px-3 py-2 rounded border text-sm md:col-span-2" style={inputStyle} />
      <input type="number" min="0" placeholder="Stock" value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        className="px-3 py-2 rounded border text-sm md:col-span-2" style={inputStyle} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="flex-1 py-2 rounded text-sm font-medium" style={{ background: "var(--brass)", color: "#1A1520" }}>
          {saving ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded text-sm" style={{ color: "var(--muted)" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProductsTab() {
  const { products, loading } = useProducts();
  const [seeding, setSeeding] = useState(false);

  const loadDemo = async () => {
    setSeeding(true);
    try {
      await seedDemoCatalog();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <NewProductForm />
        {!loading && products.length === 0 && (
          <button onClick={loadDemo} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--brass)", border: "1px solid var(--border)" }}>
            <Database size={14} /> {seeding ? "Loading…" : "Load demo catalog (19 items)"}
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Loading products…</p>}
      {!loading && products.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No products yet. Add one above, or load the demo catalog to get started.</p>
      )}
      {!loading && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                <th className="pb-2 pr-3 font-medium">Product</th>
                <th className="pb-2 pr-3 font-medium">Category</th>
                <th className="pb-2 pr-3 font-medium">Price</th>
                <th className="pb-2 pr-3 font-medium">Stock</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium"></th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => <ProductRow key={p.id} product={p} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({ u }) {
  const { user: me } = useAuth();
  const [balance, setBalance] = useState(u.balance ?? 0);
  const [saving, setSaving] = useState(false);
  const dirty = Number(balance) !== Number(u.balance ?? 0);

  const saveBalance = async () => {
    setSaving(true);
    try {
      await setUserBalance(u.id, balance);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = async () => {
    const next = u.role === "admin" ? "customer" : "admin";
    if (u.id === me?.uid && next !== "admin") {
      if (!confirm("This removes your own admin access. Continue?")) return;
    }
    await setUserRole(u.id, next);
  };

  return (
    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
      <td className="py-3 pr-3">
        <p className="text-sm" style={{ color: "var(--ink)" }}>{u.displayName || "—"}</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</p>
      </td>
      <td className="py-3 pr-3">
        <button onClick={toggleRole}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: u.role === "admin" ? "rgba(201,161,91,0.15)" : "var(--surface-2)",
            color: u.role === "admin" ? "var(--brass)" : "var(--muted)",
            border: `1px solid ${u.role === "admin" ? "var(--brass)" : "var(--border)"}`,
          }}>
          <ShieldCheck size={12} /> {u.role === "admin" ? "Admin" : "Customer"}
        </button>
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-1">
          <span className="text-sm" style={{ color: "var(--muted)" }}>$</span>
          <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)}
            className="w-24 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
        </div>
      </td>
      <td className="py-3">
        <button onClick={saveBalance} disabled={!dirty || saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: dirty ? "var(--brass)" : "var(--surface-2)", color: dirty ? "#1A1520" : "var(--muted)" }}>
          <Save size={12} /> {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}

function UsersTab() {
  const { users, loading } = useUsers();
  return (
    <div>
      {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Loading users…</p>}
      {!loading && users.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No registered users yet.</p>
      )}
      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                <th className="pb-2 pr-3 font-medium">User</th>
                <th className="pb-2 pr-3 font-medium">Role</th>
                <th className="pb-2 pr-3 font-medium">Balance</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => <UserRow key={u.id} u={u} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({ onBack }) {
  const [tab, setTab] = useState("products");

  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
        <ArrowLeft size={14} /> Back to shop
      </button>
      <h2 className="font-serif text-3xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>Admin Panel</h2>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Manage the product catalog and customer balances.</p>

      <div className="flex gap-2 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
        <button onClick={() => setTab("products")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px"
          style={{ borderColor: tab === "products" ? "var(--brass)" : "transparent", color: tab === "products" ? "var(--brass)" : "var(--muted)" }}>
          <Package size={14} /> Products
        </button>
        <button onClick={() => setTab("users")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px"
          style={{ borderColor: tab === "users" ? "var(--brass)" : "transparent", color: tab === "users" ? "var(--brass)" : "var(--muted)" }}>
          <UsersIcon size={14} /> Users & Balances
        </button>
      </div>

      {tab === "products" ? <ProductsTab /> : <UsersTab />}
    </section>
  );
}
