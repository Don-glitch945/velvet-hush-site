import React, { useState, useMemo, useRef, useEffect } from "react";
import { ShoppingBag, Flame, ChevronRight, X, Minus, Plus, Search, ArrowLeft, CreditCard, Wallet, Smartphone, Mail, Phone, MapPin, Clock, Send, User, LogOut, ShieldCheck, Ban, CheckCircle2, Menu, Package, Settings } from "lucide-react";
import { useAuth } from "./contexts/AuthContext.jsx";
import { useProducts } from "./hooks/useProducts.js";
import { useCart } from "./hooks/useCart.js";
import { useCategories } from "./hooks/useCategories.js";
import { useSiteContent } from "./hooks/useSiteContent.js";
import { useOrders } from "./hooks/useOrders.js";
import { DEFAULT_CATEGORIES } from "./data/defaultCategories.js";
import { resolveIcon } from "./lib/icons.js";
import AuthModal from "./components/AuthModal.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import AccountPanel from "./components/AccountPanel.jsx";
import ActionToast from "./components/ActionToast.jsx";
import SideMenu from "./components/SideMenu.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

/* ---------------------------------------------------------
   TOKENS
   bg:        #14111A  deep aubergine-black
   surface:   #1E1926
   surface-2: #262030
   border:    #342C40
   brass:     #C9A15B  (primary accent — cigars/glass/vape warmth)
   oxblood:   #9C4B4B  (secondary accent — intimacy line)
   ink:       #F3EDE4  (primary text)
   muted:     #9B93A3  (secondary text)
   Display face: Fraunces (serif, warm, a little eccentric)
   Body face:    Inter
--------------------------------------------------------- */

function Pattern({ type, tone }) {
  const stroke = tone === "brass" ? "var(--brass)" : "var(--oxblood)";
  if (type === "dots") {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {[...Array(6)].map((_, r) =>
          [...Array(6)].map((_, c) => (
            <circle key={`${r}-${c}`} cx={12 + c * 20} cy={12 + r * 20} r="2.2" fill={stroke} opacity="0.55" />
          ))
        )}
      </svg>
    );
  }
  if (type === "grid") {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {[...Array(7)].map((_, i) => (
          <line key={"v" + i} x1={i * 20} y1="0" x2={i * 20} y2="120" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
        ))}
        {[...Array(7)].map((_, i) => (
          <line key={"h" + i} x1="0" y1={i * 20} x2="120" y2={i * 20} stroke={stroke} strokeWidth="0.6" opacity="0.4" />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {[...Array(10)].map((_, i) => (
        <line key={i} x1={-20 + i * 16} y1="120" x2={i * 16} y2="0" stroke={stroke} strokeWidth="2" opacity="0.35" />
      ))}
    </svg>
  );
}

function ProductCard({ product, categories, onOpen, onZoom }) {
  const cat = categories.find(c => c.id === product.cat);
  const tone = cat?.tone === "oxblood" ? "oxblood" : "brass";
  const CatIcon = cat?.icon;
  const outOfStock = (product.stock ?? 0) <= 0 || product.available === false;
  return (
    <button onClick={() => onOpen(product)} className="group text-left rounded-lg overflow-hidden border transition-all duration-300"
      style={{ borderColor: "var(--border)", background: "var(--surface)", opacity: outOfStock ? 0.6 : 1 }}>
      <div className="h-36 relative flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, var(--surface-2), var(--bg))" }}>
        {product.imageUrl ? (
          <div
            role="button"
            aria-label={`View larger image of ${product.name}`}
            tabIndex={0}
            className="w-full h-full cursor-zoom-in"
            onClick={(e) => { e.stopPropagation(); onZoom?.(product); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onZoom?.(product); } }}
          >
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 opacity-80 group-hover:opacity-100 transition-opacity"><Pattern type={product.pattern || "dots"} tone={tone} /></div>
        )}
        {CatIcon && (
          <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(20,17,26,0.6)" }}>
            <CatIcon size={13} style={{ color: tone === "brass" ? "var(--brass)" : "var(--oxblood)" }} />
          </div>
        )}
        {outOfStock && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-medium" style={{ background: "rgba(20,17,26,0.8)", color: "var(--muted)" }}>
            Out of stock
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>{cat?.name}</p>
        <h3 className="font-serif text-lg mb-1" style={{ color: "var(--ink)" }}>{product.name}</h3>
        <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{product.note}</p>
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg" style={{ color: tone === "brass" ? "var(--brass)" : "var(--oxblood)" }}>${product.price}</span>
          <ChevronRight size={16} style={{ color: "var(--muted)" }} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

function Lightbox({ src, alt, onClose }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10,8,13,0.92)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "var(--surface)", color: "var(--ink)" }}
        aria-label="Close"
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt={alt || ""}
        className="max-w-full max-h-full object-contain rounded-md"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function SmokeWisp() {
  return (
    <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wispGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--brass)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--brass)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--brass)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="wisp wisp-1" d="M -50 220 C 100 180, 150 260, 300 200 S 500 140, 650 190" fill="none" stroke="url(#wispGrad)" strokeWidth="2" />
      <path className="wisp wisp-2" d="M -50 160 C 120 140, 160 90, 320 130 S 480 200, 650 120" fill="none" stroke="url(#wispGrad)" strokeWidth="1.4" />
      <path className="wisp wisp-3" d="M -50 90 C 90 60, 210 110, 340 70 S 520 30, 650 70" fill="none" stroke="url(#wispGrad)" strokeWidth="1" />
    </svg>
  );
}

export default function Storefront() {
  const [verified, setVerified] = useState(false);
  const [dobCheck, setDobCheck] = useState(false);
  const [page, setPage] = useState("home");
  const [activeCat, setActiveCat] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const [authToast, setAuthToast] = useState(false);
  const [cartToast, setCartToast] = useState(null); // holds the product just added
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { user, profile, isAdmin, logOut } = useAuth();
  const { cart, setCart } = useCart(user);
  const { products } = useProducts();
  const { categories: fsCategories } = useCategories();
  const { content: contactContent } = useSiteContent("contact");
  const { content: aboutContent } = useSiteContent("about");
  const { content: footerContent } = useSiteContent("footer");
  const { orders, loading: ordersLoading } = useOrders(user);

  // Firestore categories win once the admin has added any; until then,
  // fall back to the built-in defaults so the storefront isn't empty.
  const CATEGORIES = useMemo(() => {
    const source = fsCategories.length > 0 ? fsCategories : DEFAULT_CATEGORIES;
    return source.map(c => ({ ...c, icon: resolveIcon(c.icon) }));
  }, [fsCategories]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.note?.toLowerCase().includes(q) ||
      CATEGORIES.find(c => c.id === p.cat)?.name?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, products, CATEGORIES]);

  // Close the search dropdown on outside click.
  useEffect(() => {
    if (!searchOpen) return;
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = useMemo(
    () => Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find(p => p.id === id)?.price || 0) * qty, 0),
    [cart, products]
  );

  // Cigars/vapes/glass can't run through Stripe (see README) — they'd
  // route through the separate high-risk gateway once that's built.
  const RESTRICTED_CATS = ["cigars", "vapes", "glass"];
  const cartEntries = Object.entries(cart).map(([id, qty]) => ({ id, qty, product: products.find(p => p.id === id) })).filter(e => e.product);
  const payableEntries = cartEntries.filter(e => !RESTRICTED_CATS.includes(e.product.cat));
  const restrictedEntries = cartEntries.filter(e => RESTRICTED_CATS.includes(e.product.cat));

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (payableEntries.length === 0) {
      setCheckoutError("Nothing in your cart can be paid for through this checkout yet.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payableEntries.map(({ id, qty }) => ({ id, qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message || "Something went wrong reaching checkout. Is the payment server running?");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const addToCart = (id, qty = 1) => {
    const product = products.find(p => p.id === id);
    if (!product || product.available === false || (product.stock ?? 0) <= 0) return;
    setCart(c => ({ ...c, [id]: (c[id] || 0) + qty }));
    setCartToast(product);
  };
  const setQty = (id, qty) => setCart(c => {
    const next = { ...c };
    if (qty <= 0) delete next[id]; else next[id] = qty;
    return next;
  });

  const goCategory = (id) => { setActiveCat(id); setPage("category"); window.scrollTo?.(0, 0); };
  const goProduct = (p) => { setActiveProduct(p); setPage("product"); window.scrollTo?.(0, 0); setSearchOpen(false); setSearchQuery(""); setMobileSearchOpen(false); };
  const goHome = () => { setPage("home"); window.scrollTo?.(0, 0); };
  const goShop = () => { setPage("shop"); window.scrollTo?.(0, 0); };
  const goContact = () => { setPage("contact"); window.scrollTo?.(0, 0); };
  const goAbout = () => { setPage("about"); window.scrollTo?.(0, 0); };
  const goAdmin = () => { setPage("admin"); setUserMenuOpen(false); window.scrollTo?.(0, 0); };
  const goAccount = () => { setPage("account"); setUserMenuOpen(false); setMenuOpen(false); window.scrollTo?.(0, 0); };
  const [payment, setPayment] = useState("card");

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setAuthToast(true);
  };

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div className="max-w-sm w-full text-center rounded-xl p-8 border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
            <Flame size={22} style={{ color: "var(--brass)" }} />
          </div>
          <h1 className="font-serif text-2xl mb-2" style={{ color: "var(--ink)", fontFamily: "Fraunces, serif" }}>Velvet Hush</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            This shop sells age-restricted products, including tobacco, vape, and adult items. You must be 21 or older to enter.
          </p>
          <label className="flex items-start gap-2 text-left text-sm mb-6 cursor-pointer" style={{ color: "var(--muted)" }}>
            <input type="checkbox" checked={dobCheck} onChange={e => setDobCheck(e.target.checked)} className="mt-1" />
            I confirm I am at least 21 years old and legally permitted to purchase these products in my location.
          </label>
          <button
            disabled={!dobCheck}
            onClick={() => setVerified(true)}
            className="w-full py-3 rounded-md font-medium transition-opacity"
            style={{ background: dobCheck ? "var(--brass)" : "var(--surface-2)", color: dobCheck ? "#1A1520" : "var(--muted)", cursor: dobCheck ? "pointer" : "not-allowed" }}>
            Enter Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", fontFamily: "Inter, sans-serif", color: "var(--ink)" }}>
      <style>{FONT_IMPORT + KEYFRAMES}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur border-b" style={{ borderColor: "var(--border)", background: "rgba(20,17,26,0.85)" }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          {/* Left cluster: menu + logo + nav, pinned together top-left */}
          <div className="flex items-center gap-8 min-w-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-md shrink-0 md:hidden"
              style={{ background: "var(--surface)" }}
              aria-label="Open menu"
            >
              <Menu size={18} style={{ color: "var(--ink)" }} />
            </button>
            <button onClick={goHome} className="font-serif text-xl tracking-wide shrink-0" style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}>
              Velvet <span style={{ color: "var(--brass)" }}>Hush</span>
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => goCategory(c.id)} className="hover:opacity-70 transition-opacity" style={{ color: "var(--muted)" }}>{c.name}</button>
              ))}
              <button onClick={goAbout} className="hover:opacity-70 transition-opacity" style={{ color: "var(--muted)" }}>About</button>
              <button onClick={goContact} className="hover:opacity-70 transition-opacity" style={{ color: "var(--muted)" }}>Contact</button>
            </nav>
          </div>
          {/* Right cluster: search, profile icon, cart */}
          <div className="flex items-center gap-2">
            <div ref={searchBoxRef} className="relative hidden sm:block">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: "var(--surface)" }}>
                <Search size={14} style={{ color: "var(--muted)" }} />
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => searchQuery && setSearchOpen(true)}
                  placeholder="Search products…"
                  className="w-36 md:w-48 bg-transparent text-sm outline-none"
                  style={{ color: "var(--ink)" }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} aria-label="Clear search">
                    <X size={13} style={{ color: "var(--muted)" }} />
                  </button>
                )}
              </div>
              {searchOpen && searchQuery.trim() && (
                <div className="absolute right-0 mt-2 w-72 rounded-md border z-30 overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  {searchResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>No products match "{searchQuery}".</p>
                  ) : (
                    searchResults.map(p => (
                      <button key={p.id} onClick={() => goProduct(p)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-80 border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-6 h-6"><Pattern type={p.pattern} tone="brass" /></div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate" style={{ color: "var(--ink)" }}>{p.name}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>${p.price}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setMobileSearchOpen(o => !o)} className="p-2 rounded-md sm:hidden" style={{ background: "var(--surface)" }} aria-label="Search">
              <Search size={16} style={{ color: "var(--ink)" }} />
            </button>
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 px-2.5 py-2 rounded-md" style={{ background: "var(--surface)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    <User size={13} style={{ color: "var(--brass)" }} />
                  </div>
                  <span className="hidden sm:inline text-sm max-w-[8rem] truncate" style={{ color: "var(--ink)" }}>{profile?.displayName || user.email}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-md border z-30 overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="text-sm truncate" style={{ color: "var(--ink)" }}>{profile?.displayName || "Customer"}</p>
                        <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--brass)" }}>Balance: ${(profile?.balance ?? 0).toFixed(2)}</p>
                      </div>
                      <button onClick={goAccount} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
                        <Package size={14} style={{ color: "var(--brass)" }} /> My Account &amp; Orders
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
                        <Settings size={14} style={{ color: "var(--muted)" }} /> Settings
                      </button>
                      {isAdmin && (
                        <button onClick={goAdmin} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
                          <ShieldCheck size={14} style={{ color: "var(--brass)" }} /> Admin Panel
                        </button>
                      )}
                      <button onClick={() => { logOut(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:opacity-80" style={{ color: "var(--ink)" }}>
                        <LogOut size={14} style={{ color: "var(--muted)" }} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="px-3 py-2 rounded-md text-sm font-medium" style={{ background: "var(--surface)", color: "var(--ink)" }}>
                Sign In
              </button>
            )}
            {user && (
              <button
                onClick={() => logOut()}
                title="Log out"
                aria-label="Log out"
                className="hidden sm:flex p-2 rounded-md hover:opacity-80 transition-opacity"
                style={{ background: "var(--surface)" }}
              >
                <LogOut size={16} style={{ color: "var(--muted)" }} />
              </button>
            )}
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-md" style={{ background: "var(--surface)" }}>
              <ShoppingBag size={18} style={{ color: "var(--ink)" }} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--brass)", color: "#1A1520" }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
        {mobileSearchOpen && (
          <div className="sm:hidden px-5 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: "var(--surface)" }}>
              <Search size={14} style={{ color: "var(--muted)" }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--ink)" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <X size={13} style={{ color: "var(--muted)" }} />
                </button>
              )}
            </div>
            {searchQuery.trim() && (
              <div className="mt-2 rounded-md border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>No products match "{searchQuery}".</p>
                ) : (
                  searchResults.map(p => (
                    <button key={p.id} onClick={() => goProduct(p)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left border-b last:border-b-0" style={{ borderColor: "var(--border)" }}>
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-6 h-6"><Pattern type={p.pattern} tone="brass" /></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" style={{ color: "var(--ink)" }}>{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>${p.price}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={CATEGORIES}
        onCategoryClick={(id) => { setMenuOpen(false); goCategory(id); }}
        onAbout={() => { setMenuOpen(false); goAbout(); }}
        onContact={() => { setMenuOpen(false); goContact(); }}
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onAdmin={() => { setMenuOpen(false); goAdmin(); }}
        onAccount={() => { setMenuOpen(false); goAccount(); }}
        onSettings={() => { setMenuOpen(false); setSettingsOpen(true); }}
        onLogout={() => { logOut(); setMenuOpen(false); }}
        onSignIn={() => { setMenuOpen(false); setAuthModalOpen(true); }}
      />

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      )}

      {authToast && (
        <ActionToast
          icon={CheckCircle2}
          iconTone="brass"
          iconAnim="pop"
          title="Successfully signed in"
          subtitle="Automatically redirecting to the dashboard…"
          autoCloseMs={4000}
          onAutoClose={() => { setAuthToast(false); isAdmin ? goAdmin() : goShop(); }}
          onClose={() => setAuthToast(false)}
          actions={[
            {
              label: "Go to the shop",
              primary: true,
              onClick: () => { setAuthToast(false); goShop(); },
              closesToast: false,
            },
          ]}
        />
      )}

      {cartToast && (
        <ActionToast
          icon={ShoppingBag}
          iconTone="oxblood"
          iconAnim="bounce"
          title="Added successfully to the cart"
          subtitle={cartToast.name}
          stackIndex={authToast ? 1 : 0}
          autoCloseMs={5000}
          onAutoClose={() => setCartToast(null)}
          onClose={() => setCartToast(null)}
          actions={[
            {
              label: "View Cart",
              primary: true,
              onClick: () => { setCartOpen(true); setCartToast(null); },
              closesToast: false,
            },
            {
              label: "Continue Shopping",
              primary: false,
              onClick: () => setCartToast(null),
              closesToast: false,
            },
          ]}
        />
      )}
      {lightboxProduct && (
        <Lightbox
          src={lightboxProduct.imageUrl}
          alt={lightboxProduct.name}
          onClose={() => setLightboxProduct(null)}
        />
      )}

      {page === "home" && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
            <SmokeWisp />
            <div className="max-w-6xl mx-auto px-5 py-24 relative">
              <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "var(--brass)" }}>21+ · Curated · Discreet Shipping</p>
              <h1 className="font-serif text-5xl md:text-6xl max-w-2xl leading-[1.05] mb-5" style={{ fontFamily: "Fraunces, serif" }}>
                Slow evenings, considered pleasures.
              </h1>
              <p className="max-w-md text-base mb-8" style={{ color: "var(--muted)" }}>
                Cigars, glass, vape, and intimacy — sourced from small makers who care about the last detail as much as the first.
              </p>
              <button onClick={goShop} className="px-6 py-3 rounded-md font-medium" style={{ background: "var(--brass)", color: "#1A1520" }}>
                Browse the Shop
              </button>
            </div>
          </section>

          {/* Categories */}
          <section className="max-w-6xl mx-auto px-5 py-16">
            <h2 className="font-serif text-2xl mb-8" style={{ fontFamily: "Fraunces, serif" }}>Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CATEGORIES.map(c => {
                const Icon = c.icon;
                return (
                  <button key={c.id} onClick={() => goCategory(c.id)} className="group p-5 rounded-lg border text-left transition-colors"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <Icon size={20} style={{ color: "var(--brass)" }} className="mb-3" />
                    <h3 className="font-serif text-base mb-1" style={{ fontFamily: "Fraunces, serif" }}>{c.name}</h3>
                    <p className="text-xs leading-snug" style={{ color: "var(--muted)" }}>{c.blurb}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured */}
          <section className="max-w-6xl mx-auto px-5 pb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl" style={{ fontFamily: "Fraunces, serif" }}>New This Week</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} categories={CATEGORIES} onOpen={goProduct} onZoom={setLightboxProduct} />)}
            </div>
          </section>
        </>
      )}

      {page === "shop" && (
        <section className="max-w-6xl mx-auto px-5 py-12">
          <button onClick={goHome} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="font-serif text-3xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>Shop All</h2>
          <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>Every category, all in one place.</p>
          <div className="space-y-14">
            {CATEGORIES.map(c => {
              const catProducts = products.filter(p => p.cat === c.id);
              const Icon = c.icon;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Icon size={18} style={{ color: c.tone === "oxblood" ? "var(--oxblood)" : "var(--brass)" }} />
                      <h3 className="font-serif text-xl" style={{ fontFamily: "Fraunces, serif" }}>{c.name}</h3>
                    </div>
                    <button onClick={() => goCategory(c.id)} className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: "var(--muted)" }}>
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  {catProducts.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>No products in this category yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {catProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} categories={CATEGORIES} onOpen={goProduct} onZoom={setLightboxProduct} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {page === "category" && activeCat && (
        <section className="max-w-6xl mx-auto px-5 py-12">
          <button onClick={goHome} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="font-serif text-3xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>{CATEGORIES.find(c => c.id === activeCat)?.name}</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{CATEGORIES.find(c => c.id === activeCat)?.blurb}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter(p => p.cat === activeCat).map(p => <ProductCard key={p.id} product={p} categories={CATEGORIES} onOpen={goProduct} onZoom={setLightboxProduct} />)}
          </div>
        </section>
      )}

      {page === "product" && activeProduct && (
        <section className="max-w-4xl mx-auto px-5 py-12">
          <button onClick={() => goCategory(activeProduct.cat)} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back to {CATEGORIES.find(c => c.id === activeProduct.cat)?.name}
          </button>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="h-72 rounded-lg relative flex items-center justify-center border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              {activeProduct.imageUrl ? (
                <div
                  role="button"
                  aria-label={`View larger image of ${activeProduct.name}`}
                  tabIndex={0}
                  className="w-full h-full cursor-zoom-in"
                  onClick={() => setLightboxProduct(activeProduct)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxProduct(activeProduct); } }}
                >
                  <img src={activeProduct.imageUrl} alt={activeProduct.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-40 h-40"><Pattern type={activeProduct.pattern} tone={CATEGORIES.find(c => c.id === activeProduct.cat)?.tone === "oxblood" ? "oxblood" : "brass"} /></div>
              )}
              {(() => {
                const CatIcon = CATEGORIES.find(c => c.id === activeProduct.cat)?.icon;
                const tone = CATEGORIES.find(c => c.id === activeProduct.cat)?.tone === "oxblood" ? "oxblood" : "brass";
                return CatIcon ? (
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    <CatIcon size={16} style={{ color: tone === "brass" ? "var(--brass)" : "var(--oxblood)" }} />
                  </div>
                ) : null;
              })()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>{CATEGORIES.find(c => c.id === activeProduct.cat)?.name}</p>
              <h1 className="font-serif text-3xl mb-3" style={{ fontFamily: "Fraunces, serif" }}>{activeProduct.name}</h1>
              <p className="text-base mb-4" style={{ color: "var(--muted)" }}>{activeProduct.note}</p>
              <p className="font-serif text-2xl mb-8" style={{ fontFamily: "Fraunces, serif", color: "var(--brass)" }}>${activeProduct.price}</p>
              {(() => {
                const live = products.find(p => p.id === activeProduct.id) || activeProduct;
                const outOfStock = (live.stock ?? 0) <= 0 || live.available === false;
                return (
                  <button
                    onClick={() => addToCart(live.id)}
                    disabled={outOfStock}
                    className="px-6 py-3 rounded-md font-medium"
                    style={{ background: outOfStock ? "var(--surface-2)" : "var(--brass)", color: outOfStock ? "var(--muted)" : "#1A1520", cursor: outOfStock ? "not-allowed" : "pointer" }}>
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                );
              })()}
              <p className="text-xs mt-6" style={{ color: "var(--muted)" }}>Ships in unmarked packaging. Age verification required at delivery.</p>
            </div>
          </div>
        </section>
      )}

      {page === "contact" && (
        <section className="max-w-5xl mx-auto px-5 py-12">
          <button onClick={goHome} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="font-serif text-3xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>Get in Touch</h2>
          <p className="text-sm mb-10 max-w-md" style={{ color: "var(--muted)" }}>Questions about an order, a product, or wholesale? We answer everything ourselves — no bots.</p>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin size={18} style={{ color: "var(--brass)" }} className="mt-0.5" />
                <div>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>{contactContent?.address1 || "118 Lantern Row, Suite 4"}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{contactContent?.address2 || "Austin, TX 78701"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} style={{ color: "var(--brass)" }} className="mt-0.5" />
                <p className="text-sm" style={{ color: "var(--ink)" }}>{contactContent?.email || "hello@velvethush.shop"}</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} style={{ color: "var(--brass)" }} className="mt-0.5" />
                <p className="text-sm" style={{ color: "var(--ink)" }}>{contactContent?.phone || "(512) 555-0148"}</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} style={{ color: "var(--brass)" }} className="mt-0.5" />
                <div>
                  <p className="text-sm" style={{ color: "var(--ink)" }}>{contactContent?.hoursLine1 || "Mon–Fri, 10am–6pm CT"}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{contactContent?.hoursLine2 || "Replies within one business day"}</p>
                </div>
              </div>
            </div>
            <form className="space-y-3" onSubmit={e => e.preventDefault()}>
              <input placeholder="Name" className="w-full px-4 py-3 rounded-md text-sm outline-none border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
              <input placeholder="Email" type="email" className="w-full px-4 py-3 rounded-md text-sm outline-none border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
              <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 rounded-md text-sm outline-none border resize-none" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
              <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-md font-medium" style={{ background: "var(--brass)", color: "#1A1520" }}>
                <Send size={14} /> Send Message
              </button>
            </form>
          </div>
        </section>
      )}

      {page === "about" && (
        <section className="max-w-3xl mx-auto px-5 py-12">
          <button onClick={goHome} className="flex items-center gap-1 text-sm mb-6" style={{ color: "var(--muted)" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h2 className="font-serif text-3xl mb-6" style={{ fontFamily: "Fraunces, serif" }}>
            {aboutContent?.heading || "About Velvet Hush"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {(aboutContent?.body || "Velvet Hush started as a small, considered alternative to the fluorescent-lit shops we grew up with. Every product on this site is chosen by hand — from small-batch glassblowers to formulators who actually read the label before they sell it. We ship everything in unmarked packaging, because what you buy is nobody's business but yours.")
              .split("\n")
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </section>
      )}

      {page === "account" && (
        user ? (
          <AccountPanel
            user={user}
            profile={profile}
            orders={orders}
            ordersLoading={ordersLoading}
            onBack={goHome}
            onSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <section className="max-w-lg mx-auto px-5 py-24 text-center">
            <User size={28} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
            <h2 className="font-serif text-2xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>Sign in to view your account</h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Your balance and order history live here once you're signed in.</p>
            <button onClick={() => setAuthModalOpen(true)} className="px-5 py-2.5 rounded-md text-sm font-medium" style={{ background: "var(--brass)", color: "#1A1520" }}>
              Sign In
            </button>
          </section>
        )
      )}

      {page === "admin" && (
        isAdmin ? (
          <AdminPanel onBack={goHome} />
        ) : (
          <section className="max-w-lg mx-auto px-5 py-24 text-center">
            <Ban size={28} className="mx-auto mb-4" style={{ color: "var(--oxblood)" }} />
            <h2 className="font-serif text-2xl mb-2" style={{ fontFamily: "Fraunces, serif" }}>Admins only</h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              {user ? "Your account doesn't have admin access." : "Sign in with an admin account to view this page."}
            </p>
            <button onClick={goHome} className="px-5 py-2.5 rounded-md text-sm font-medium" style={{ background: "var(--brass)", color: "#1A1520" }}>
              Back to shop
            </button>
          </section>
        )
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm h-full flex flex-col border-l" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-serif text-lg" style={{ fontFamily: "Fraunces, serif" }}>Your Cart</h3>
              <button onClick={() => setCartOpen(false)}><X size={18} style={{ color: "var(--muted)" }} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartCount === 0 && <p className="text-sm" style={{ color: "var(--muted)" }}>Your cart is empty.</p>}
              {Object.entries(cart).map(([id, qty]) => {
                const p = products.find(pr => pr.id === id);
                if (!p) return null;
                return (
                  <div key={id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-md flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "var(--surface-2)" }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-8 h-8"><Pattern type={p.pattern} tone={CATEGORIES.find(c => c.id === p.cat)?.tone === "oxblood" ? "oxblood" : "brass"} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>${p.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(id, qty - 1)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--surface-2)" }}><Minus size={12} /></button>
                      <span className="text-sm w-4 text-center">{qty}</span>
                      <button onClick={() => setQty(id, qty + 1)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--surface-2)" }}><Plus size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-5 border-t" style={{ borderColor: "var(--border)" }}>
              {cartCount > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "card", label: "Card", icon: CreditCard },
                      { id: "paypal", label: "PayPal", icon: Wallet },
                      { id: "walletpay", label: "Mobile Pay", icon: Smartphone },
                    ].map(m => {
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
                </div>
              )}
              {restrictedEntries.length > 0 && (
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--oxblood)" }}>
                  {restrictedEntries.map(e => e.product.name).join(", ")} can't be paid for here — cigars, vapes, and glass need a separate checkout (card networks don't allow those categories through this one). They'll stay in your cart but won't be included in this payment.
                </p>
              )}
              {checkoutError && (
                <p className="text-xs mb-3" style={{ color: "var(--oxblood)" }}>{checkoutError}</p>
              )}
              <div className="flex justify-between text-sm mb-4" style={{ color: "var(--muted)" }}>
                <span>Subtotal {restrictedEntries.length > 0 ? "(payable items)" : ""}</span>
                <span style={{ color: "var(--ink)" }}>
                  ${payableEntries.reduce((s, e) => s + e.product.price * e.qty, 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cartCount === 0 || checkoutLoading}
                className="w-full py-3 rounded-md font-medium"
                style={{ background: cartCount ? "var(--brass)" : "var(--surface-2)", color: cartCount ? "#1A1520" : "var(--muted)", opacity: checkoutLoading ? 0.7 : 1 }}>
                {checkoutLoading ? "Redirecting to checkout…" : `Checkout with ${cartCount > 0 ? { card: "Card", paypal: "PayPal", walletpay: "Mobile Pay" }[payment] : "—"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t mt-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-wrap gap-8 mb-8 text-xs" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-2"><MapPin size={13} style={{ color: "var(--brass)" }} /> {contactContent?.address2 || "Austin, TX"}</span>
            <span className="flex items-center gap-2"><Mail size={13} style={{ color: "var(--brass)" }} /> {contactContent?.email || "hello@velvethush.shop"}</span>
            <span className="flex items-center gap-2"><Phone size={13} style={{ color: "var(--brass)" }} /> {contactContent?.phone || "(512) 555-0148"}</span>
            <button onClick={goAbout} className="underline hover:opacity-70">About</button>
            <button onClick={goContact} className="underline hover:opacity-70">Contact page</button>
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            <p className="mb-2">{footerContent?.disclaimer || "Must be 21+ to purchase tobacco, vape, and adult products; ID checked on delivery. Not for sale where prohibited by law."}</p>
            <p>{footerContent?.copyright || "© 2026 Velvet Hush. All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');
:root {
  --bg: #14111A;
  --surface: #1E1926;
  --surface-2: #262030;
  --border: #342C40;
  --brass: #C9A15B;
  --oxblood: #9C4B4B;
  --ink: #F3EDE4;
  --muted: #9B93A3;
}
`;

const KEYFRAMES = `
.wisp { stroke-dasharray: 6 10; animation: drift 18s linear infinite; }
.wisp-2 { animation-duration: 24s; animation-direction: reverse; }
.wisp-3 { animation-duration: 30s; }
@keyframes drift {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -400; }
}
@media (prefers-reduced-motion: reduce) {
  .wisp { animation: none; }
}

/* Toast notifications */
@keyframes toastIn {
  0% { opacity: 0; transform: translateY(-18px) scale(0.95); }
  60% { opacity: 1; transform: translateY(3px) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-12px) scale(0.95); }
}
.toast-in { animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.toast-out { animation: toastOut 0.2s ease-in both; }

@keyframes iconPop {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
  75% { transform: scale(0.92); }
  100% { transform: scale(1); }
}
.toast-icon-pop { animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }

@keyframes iconBounce {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  45% { transform: scale(1.25) rotate(10deg); opacity: 1; }
  70% { transform: scale(0.9) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.toast-icon-bounce { animation: iconBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }

@media (prefers-reduced-motion: reduce) {
  .toast-in, .toast-out, .toast-icon-pop, .toast-icon-bounce { animation: none; }
}
`;
