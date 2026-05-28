"use client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/constants";

function UserBadge({ user, onLogout }) {
  const initial = user?.email ? user.email[0].toUpperCase() : "?";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: "var(--color-ink)",
          maxWidth: 180,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {user?.email}
        </div>
        <div style={{
          fontSize: 11, color: "var(--color-ink-muted)",
          marginTop: 1,
        }}>
          {ROLE_LABELS[user?.role]}
        </div>
      </div>
      <div style={{
        width: 32, height: 32,
        borderRadius: 8,
        background: "var(--color-blood-light)",
        border: "1.5px solid #FECACA",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        color: "var(--color-blood)",
        fontFamily: "var(--font-mono)",
        flexShrink: 0,
      }}>
        {initial}
      </div>
      <button
        className="btn btn-ghost btn-sm"
        onClick={onLogout}
        style={{ marginLeft: 4 }}
      >
        Sign out
      </button>
    </div>
  );
}

export default function Topbar({ title, breadcrumbs = [], actions }) {
  const { user, logout } = useAuth();

  return (
    <div className="platform-topbar">
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumbs.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            color: "var(--color-ink-faint)",
            marginBottom: 2,
            fontWeight: 500,
          }}>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && (
                  <span style={{ opacity: 0.5 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </span>
                )}
                <span>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h1 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: "var(--color-ink)",
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}>
          {title}
        </h1>
      </div>

      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {actions}
        </div>
      )}

      <div style={{
        width: 1,
        height: 28,
        background: "var(--color-border)",
        marginLeft: 8,
      }} />

      <UserBadge user={user} onLogout={logout} />
    </div>
  );
}
