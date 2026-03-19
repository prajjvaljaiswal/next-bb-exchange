"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({ navItems, brandTitle = "Bloodexchange.in" }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="platform-sidebar">
      {/* Brand */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--color-sidebar-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "var(--color-blood)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18
          }}>🩸</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-sidebar-text)", fontFamily: "var(--font-display)" }}>
              {brandTitle}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-sidebar-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Blood Exchange
            </div>
          </div>
        </div>

        {user && (
          <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-sidebar-text)" }}>{user.email}</div>
            <div style={{ fontSize: 10, color: "var(--color-blood)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              {user.role?.replace("_", " ")}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 0" }}>
        {navItems.map((section, si) => (
          <div key={si} style={{ marginBottom: 8 }}>
            {section.label && (
              <div style={{ padding: "6px 24px", fontSize: 10, fontWeight: 700, color: "var(--color-sidebar-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Live indicator */}
      <div style={{ padding: "12px 24px", borderTop: "1px solid var(--color-sidebar-border)", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-sidebar-muted)" }}>
          <span className="live-dot" />
          System Online
        </div>
      </div>
    </aside>
  );
}
