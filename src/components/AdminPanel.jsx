import React, { useState } from "react";
import { ArrowLeft, Trash2, Plus, Save, Database, ShieldCheck, Package, Users as UsersIcon, Tags, FileText } from "lucide-react";
import { useProducts, createProduct, updateProduct, deleteProduct, seedDemoCatalog } from "../hooks/useProducts.js";
import { useUsers, setUserBalance, setUserRole } from "../hooks/useUsers.js";
import { useCategories, createCategory, updateCategory, deleteCategory, seedDefaultCategories } from "../hooks/useCategories.js";
import { useSiteContent, updateSiteContent } from "../hooks/useSiteContent.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ICON_OPTIONS, resolveIcon } from "../lib/icons.js";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories.js";

const inputStyle = {
  background: "var(--surface-2)",
  borderColor: "var(--border)",
  color: "var(--ink)",
};

function ProductRow({ product, categories }) {
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
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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

function NewProductForm({ categories }) {
  const [open, setOpen] = useState(false);
  const firstCat = categories[0]?.id || "";
  const [form, setForm] = useState({ name: "", cat: firstCat, price: "", note: "", stock: "0", imageUrl: "", pattern: "dots" });
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
      setForm({ name: "", cat: firstCat, price: "", note: "", stock: "0", imageUrl: "", pattern: "dots" });
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
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
  const { categories: fsCategories } = useCategories();
  const categories = fsCategories.length > 0 ? fsCategories : DEFAULT_CATEGORIES;
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
      {fsCategories.length === 0 && (
        <p className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
          Using default categories — add your own in the Categories tab to replace them everywhere on the site.
        </p>
      )}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <NewProductForm categories={categories} />
        {!loading && products.length === 0 && (
          <button onClick={loadDemo} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--brass)", border: "1px solid var(--border)" }}>
            <Database size={14} /> {seeding ? "Loading…" : "Load starter catalog (19 items)"}
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Loading products…</p>}
      {!loading && products.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No products yet. Add one above, or load the starter catalog to get started.</p>
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
              {products.map((p) => <ProductRow key={p.id} product={p} categories={categories} />)}
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

function CategoryRow({ category }) {
  const [draft, setDraft] = useState({
    name: category.name,
    blurb: category.blurb || "",
    icon: category.icon || "Package",
    tone: category.tone === "oxblood" ? "oxblood" : "brass",
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const Icon = resolveIcon(draft.icon);

  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      await updateCategory(category.id, draft);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete category "${category.name}"? Products already using it will keep their category id but it won't show in menus anymore.`)) return;
    await deleteCategory(category.id);
  };

  return (
    <tr className="border-b align-top" style={{ borderColor: "var(--border)" }}>
      <td className="py-3 pr-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
          <Icon size={15} style={{ color: draft.tone === "oxblood" ? "var(--oxblood)" : "var(--brass)" }} />
        </div>
      </td>
      <td className="py-3 pr-3">
        <input value={draft.name} onChange={(e) => set({ name: e.target.value })}
          className="w-32 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
        <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>id: {category.id}</p>
      </td>
      <td className="py-3 pr-3">
        <input value={draft.blurb} onChange={(e) => set({ blurb: e.target.value })}
          placeholder="Short description"
          className="w-48 px-2 py-1.5 rounded border text-sm" style={inputStyle} />
      </td>
      <td className="py-3 pr-3">
        <select value={draft.icon} onChange={(e) => set({ icon: e.target.value })}
          className="px-2 py-1.5 rounded border text-sm" style={inputStyle}>
          {ICON_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </td>
      <td className="py-3 pr-3">
        <select value={draft.tone} onChange={(e) => set({ tone: e.target.value })}
          className="px-2 py-1.5 rounded border text-sm" style={inputStyle}>
          <option value="brass">Brass</option>
          <option value="oxblood">Oxblood</option>
        </select>
      </td>
      <td className="py-3 pr-3">
        <button onClick={save} disabled={!dirty || saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: dirty ? "var(--brass)" : "var(--surface-2)", color: dirty ? "#1A1520" : "var(--muted)" }}>
          <Save size={12} /> {saving ? "Saving…" : "Save"}
        </button>
      </td>
      <td className="py-3">
        <button onClick={remove} aria-label="Delete category">
          <Trash2 size={15} style={{ color: "var(--oxblood)" }} />
        </button>
      </td>
    </tr>
  );
}

function NewCategoryForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", blurb: "", icon: "Package", tone: "brass" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory(form);
      setForm({ name: "", blurb: "", icon: "Package", tone: "brass" });
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
        <Plus size={14} /> Add category
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-lg border grid md:grid-cols-4 gap-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input placeholder="Short description" value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        className="px-3 py-2 rounded border text-sm md:col-span-2" style={inputStyle} />
      <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle}>
        {ICON_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}
        className="px-3 py-2 rounded border text-sm" style={inputStyle}>
        <option value="brass">Brass</option>
        <option value="oxblood">Oxblood</option>
      </select>
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

function CategoriesTab() {
  const { categories, loading } = useCategories();
  const [seeding, setSeeding] = useState(false);

  const loadDefaults = async () => {
    setSeeding(true);
    try {
      await seedDefaultCategories();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <NewCategoryForm />
        {!loading && categories.length === 0 && (
          <button onClick={loadDefaults} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--surface-2)", color: "var(--brass)", border: "1px solid var(--border)" }}>
            <Database size={14} /> {seeding ? "Loading…" : "Load default categories"}
          </button>
        )}
      </div>
      {loading && <p className="text-sm" style={{ color: "var(--muted)" }}>Loading categories…</p>}
      {!loading && categories.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No categories yet — the storefront is showing built-in defaults. Add one above, or load the defaults to start from those.
        </p>
      )}
      {!loading && categories.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                <th className="pb-2 pr-3 font-medium"></th>
                <th className="pb-2 pr-3 font-medium">Name</th>
                <th className="pb-2 pr-3 font-medium">Description</th>
                <th className="pb-2 pr-3 font-medium">Icon</th>
                <th className="pb-2 pr-3 font-medium">Color</th>
                <th className="pb-2 pr-3 font-medium"></th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => <CategoryRow key={c.id} category={c} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ContactContentForm() {
  const { content, loading } = useSiteContent("contact");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const draft = form || {
    address1: content?.address1 || "118 Lantern Row, Suite 4",
    address2: content?.address2 || "Austin, TX 78701",
    email: content?.email || "hello@velvethush.shop",
    phone: content?.phone || "(512) 555-0148",
    hoursLine1: content?.hoursLine1 || "Mon–Fri, 10am–6pm CT",
    hoursLine2: content?.hoursLine2 || "Replies within one business day",
  };
  const set = (patch) => setForm({ ...draft, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      await updateSiteContent("contact", draft);
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div className="p-4 rounded-lg border grid md:grid-cols-2 gap-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <input value={draft.address1} onChange={(e) => set({ address1: e.target.value })} placeholder="Address line 1"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input value={draft.address2} onChange={(e) => set({ address2: e.target.value })} placeholder="City, state, zip"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="Email"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Phone"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input value={draft.hoursLine1} onChange={(e) => set({ hoursLine1: e.target.value })} placeholder="Hours line 1"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <input value={draft.hoursLine2} onChange={(e) => set({ hoursLine2: e.target.value })} placeholder="Hours line 2"
        className="px-3 py-2 rounded border text-sm" style={inputStyle} />
      <button onClick={save} disabled={saving}
        className="md:col-span-2 py-2 rounded text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: "var(--brass)", color: "#1A1520" }}>
        <Save size={13} /> {saving ? "Saving…" : "Save contact info"}
      </button>
    </div>
  );
}

function AboutContentForm() {
  const { content, loading } = useSiteContent("about");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const draft = form || {
    heading: content?.heading || "About Velvet Hush",
    body: content?.body || "Velvet Hush started as a small, considered alternative to the fluorescent-lit shops we grew up with. Every product on this site is chosen by hand — from small-batch glassblowers to formulators who actually read the label before they sell it. We ship everything in unmarked packaging, because what you buy is nobody's business but yours.",
  };
  const set = (patch) => setForm({ ...draft, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      await updateSiteContent("about", draft);
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div className="p-4 rounded-lg border space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <input value={draft.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="Heading"
        className="w-full px-3 py-2 rounded border text-sm" style={inputStyle} />
      <textarea value={draft.body} onChange={(e) => set({ body: e.target.value })} placeholder="Body text — separate paragraphs with a blank line"
        rows={6} className="w-full px-3 py-2 rounded border text-sm resize-none" style={inputStyle} />
      <button onClick={save} disabled={saving}
        className="py-2 px-5 rounded text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: "var(--brass)", color: "#1A1520" }}>
        <Save size={13} /> {saving ? "Saving…" : "Save About Us"}
      </button>
    </div>
  );
}

function FooterContentForm() {
  const { content, loading } = useSiteContent("footer");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const draft = form || {
    disclaimer: content?.disclaimer || "Must be 21+ to purchase tobacco, vape, and adult products; ID checked on delivery. Not for sale where prohibited by law.",
    copyright: content?.copyright || "© 2026 Velvet Hush. All rights reserved.",
  };
  const set = (patch) => setForm({ ...draft, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      await updateSiteContent("footer", draft);
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div className="p-4 rounded-lg border space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div>
        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Disclaimer line</label>
        <textarea value={draft.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })}
          rows={3} className="w-full px-3 py-2 rounded border text-sm resize-none" style={inputStyle} />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Copyright line</label>
        <input value={draft.copyright} onChange={(e) => set({ copyright: e.target.value })}
          className="w-full px-3 py-2 rounded border text-sm" style={inputStyle} />
      </div>
      <button onClick={save} disabled={saving}
        className="py-2 px-5 rounded text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: "var(--brass)", color: "#1A1520" }}>
        <Save size={13} /> {saving ? "Saving…" : "Save footer text"}
      </button>
    </div>
  );
}

function ContentTab() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="font-serif text-lg mb-3" style={{ fontFamily: "Fraunces, serif" }}>Contact section</h3>
        <ContactContentForm />
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3" style={{ fontFamily: "Fraunces, serif" }}>About Us page</h3>
        <AboutContentForm />
      </div>
      <div>
        <h3 className="font-serif text-lg mb-3" style={{ fontFamily: "Fraunces, serif" }}>Footer text</h3>
        <FooterContentForm />
      </div>
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
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Manage the product catalog, categories, site content, and customer balances.</p>

      <div className="flex gap-2 mb-8 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
        <button onClick={() => setTab("products")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap"
          style={{ borderColor: tab === "products" ? "var(--brass)" : "transparent", color: tab === "products" ? "var(--brass)" : "var(--muted)" }}>
          <Package size={14} /> Products
        </button>
        <button onClick={() => setTab("categories")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap"
          style={{ borderColor: tab === "categories" ? "var(--brass)" : "transparent", color: tab === "categories" ? "var(--brass)" : "var(--muted)" }}>
          <Tags size={14} /> Categories
        </button>
        <button onClick={() => setTab("content")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap"
          style={{ borderColor: tab === "content" ? "var(--brass)" : "transparent", color: tab === "content" ? "var(--brass)" : "var(--muted)" }}>
          <FileText size={14} /> Content
        </button>
        <button onClick={() => setTab("users")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap"
          style={{ borderColor: tab === "users" ? "var(--brass)" : "transparent", color: tab === "users" ? "var(--brass)" : "var(--muted)" }}>
          <UsersIcon size={14} /> Users & Balances
        </button>
      </div>

      {tab === "products" && <ProductsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "content" && <ContentTab />}
      {tab === "users" && <UsersTab />}
    </section>
  );
}
