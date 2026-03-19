"use client";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/constants";

export default function Topbar({ title, breadcrumbs = [], actions }) {
  const { user, logout } = useAuth();

  return (
    <div className="platform-topbar">
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-ink-muted)" }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>{title}</h1>
      </div>

      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>{ROLE_LABELS[user?.role]}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
