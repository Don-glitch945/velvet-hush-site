import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * ActionToast
 * Animated notification box with an icon "pop", a slide/scale entrance,
 * optional auto-dismiss (with a countdown progress bar) and up to two
 * action buttons. Used for "signed in" and "added to cart" confirmations.
 */
export default function ActionToast({
  icon: Icon,
  iconTone = "brass", // "brass" | "oxblood"
  iconAnim = "pop", // "pop" | "bounce"
  title,
  subtitle,
  actions = [], // [{ label, onClick, primary, closesToast }]
  autoCloseMs,
  onAutoClose,
  onClose,
  stackIndex = 0,
}) {
  const [progress, setProgress] = useState(100);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!autoCloseMs) return undefined;
    const start = Date.now();
    const id = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / autoCloseMs) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(id);
        onAutoClose?.();
      }
    }, 40);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCloseMs]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 200);
  };

  const tone = iconTone === "oxblood" ? "var(--oxblood)" : "var(--brass)";

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ top: `${88 + stackIndex * 104}px` }}
    >
      <div
        role="status"
        aria-live="polite"
        className={`toast-box pointer-events-auto w-full max-w-sm rounded-xl border overflow-hidden ${
          closing ? "toast-out" : "toast-in"
        }`}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        }}
      >
        <div className="p-4 flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              iconAnim === "bounce" ? "toast-icon-bounce" : "toast-icon-pop"
            }`}
            style={{ background: "var(--surface-2)" }}
          >
            {Icon && <Icon size={20} style={{ color: tone }} />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            )}
            {actions.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      a.onClick?.();
                      if (a.closesToast !== false) handleClose();
                    }}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-transform active:scale-95"
                    style={
                      a.primary
                        ? { background: "var(--brass)", color: "#1A1520" }
                        : {
                            background: "var(--surface-2)",
                            color: "var(--ink)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Dismiss notification"
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={15} style={{ color: "var(--muted)" }} />
          </button>
        </div>
        {autoCloseMs != null && (
          <div className="h-0.5 w-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full"
              style={{ width: `${progress}%`, background: tone, transition: "width 40ms linear" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
