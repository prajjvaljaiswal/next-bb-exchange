"use client";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        {title && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid var(--color-border)",
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                cursor: "pointer",
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-ink-muted)",
                fontSize: 16,
                lineHeight: 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--color-border)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--color-surface-alt)"}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
