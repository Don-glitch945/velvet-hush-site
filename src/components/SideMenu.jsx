import React, { useEffect, useState } from "react";
import { X, ChevronDown, Tag, Info, Mail, Settings, LogOut, LogIn, ShieldCheck, Package } from "lucide-react";

// Slides in from the right edge of the screen, opened via the hamburger
// icon in the top-left of the header. Mirrors the cart drawer's layout
// so the two feel like the same UI language.
export default function SideMenu({
  open,
  onClose,
  categories,
  onCategoryClick,
  onAbout,
  onContact,
  user,
  profile,
  isAdmin,
  onAdmin,
  onSettings,
  onLogout,
  onSignIn,
  onAccount,
}) {
  const [visible, setVisible] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    setCategoriesOpen(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(0,0,0,0.5)", opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xs h-full flex flex-col border-l transition-transform duration-300 ease-out"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-serif text-lg" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>Menu</h3>
          <button onClick={onClose} aria-label="Close menu">
            <X size={18} style={{ color: "var(--muted)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <button
            onClick={() => setCategoriesOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:opacity-80"
            style={{ color: "var(--ink)" }}
            aria-expanded={categoriesOpen}
          >
            <span className="flex items-center gap-3">
              <Tag size={16} style={{ color: "var(--brass)" }} /> Product Categories
            </span>
            <ChevronDown
              size={15}
              style={{ color: "var(--muted)", transform: categoriesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: categoriesOpen ? `${categories.length * 44 + 8}px` : "0px" }}
          >
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className="w-full flex items-center gap-3 pl-11 pr-5 py-2.5 text-sm text-left hover:opacity-80"
                  style={{ color: "var(--muted)" }}
                >
                  {Icon && <Icon size={14} style={{ color: c.tone === "oxblood" ? "var(--oxblood)" : "var(--brass)" }} />}
                  {c.name}
                </button>
              );
            })}
          </div>

          <button onClick={onAbout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
            <Info size={16} style={{ color: "var(--brass)" }} /> About Us
          </button>
          <button onClick={onContact} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
            <Mail size={16} style={{ color: "var(--brass)" }} /> Contact Us
          </button>
        </div>

        <div className="border-t p-2" style={{ borderColor: "var(--border)" }}>
          {user ? (
            <>
              <div className="px-3 py-2">
                <p className="text-sm truncate" style={{ color: "var(--ink)" }}>{profile?.displayName || "Customer"}</p>
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
                <p className="text-xs mt-1" style={{ color: "var(--brass)" }}>Balance: ${(profile?.balance ?? 0).toFixed(2)}</p>
              </div>
              <button onClick={onAccount} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:opacity-80" style={{ color: "var(--ink)" }}>
                <Package size={15} style={{ color: "var(--brass)" }} /> My Account &amp; Orders
              </button>
              {isAdmin && (
                <button onClick={onAdmin} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:opacity-80" style={{ color: "var(--ink)" }}>
                  <ShieldCheck size={15} style={{ color: "var(--brass)" }} /> Admin Panel
                </button>
              )}
              <button onClick={onSettings} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:opacity-80" style={{ color: "var(--ink)" }}>
                <Settings size={15} style={{ color: "var(--muted)" }} /> Settings
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:opacity-80" style={{ color: "var(--ink)" }}>
                <LogOut size={15} style={{ color: "var(--muted)" }} /> Log out
              </button>
            </>
          ) : (
            <button onClick={onSignIn} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:opacity-80" style={{ color: "var(--ink)" }}>
              <LogIn size={15} style={{ color: "var(--brass)" }} /> Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
