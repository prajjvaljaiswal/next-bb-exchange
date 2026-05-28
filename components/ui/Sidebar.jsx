"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function NavIcon({ name }) {
  const p = {
    width: 16, height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: { flexShrink: 0 },
  };
  switch (name) {
    case "dashboard":
      return <svg {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
    case "users":
      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "user":
      return <svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "droplet":
      return <svg {...p}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>;
    case "beaker":
      return <svg {...p}><path d="M4.5 3h15"/><path d="M6 3v13a6 6 0 0 0 12 0V3"/><path d="M6 14h12"/></svg>;
    case "plus-circle":
      return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>;
    case "clipboard":
      return <svg {...p}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
    case "id-card":
      return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M12 11h6"/><path d="M12 15h4"/></svg>;
    case "hospital":
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 7v7"/><path d="M9 10.5h6"/></svg>;
    case "target":
      return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case "inbox":
      return <svg {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
    case "send":
      return <svg {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
    case "file-text":
      return <svg {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
    case "package":
      return <svg {...p}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>;
    case "switch":
      return <svg {...p}><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>;
    case "arrow-right":
      return <svg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
    case "credit-card":
      return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
    case "bar-chart":
      return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "search":
      return <svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
    case "activity":
      return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "link":
      return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case "user":
      return <svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "user-plus":
      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="4"/></svg>;
  }
}

function BloodDropLogo() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 36" fill="none" aria-hidden="true">
      <path
        d="M14 2C14 2 1 18 1 25C1 31.6274 6.92487 37 14 37C21.0751 37 27 31.6274 27 25C27 18 14 2 14 2Z"
        fill="#B91C1C"
      />
      <path
        d="M14 12C14 12 6 22 6 26.5C6 30.0899 9.13401 33 13 33"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserAvatar({ email, role }) {
  const initial = email ? email[0].toUpperCase() : "?";
  return (
    <div style={{
      marginTop: 12,
      padding: "10px 12px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        width: 30, height: 30,
        borderRadius: 8,
        background: "rgba(185,28,28,0.35)",
        border: "1px solid rgba(185,28,28,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        color: "#F87171",
        flexShrink: 0,
        fontFamily: "var(--font-mono)",
      }}>
        {initial}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: "var(--color-sidebar-text)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {email}
        </div>
        <div style={{
          fontSize: 10, color: "#F87171",
          marginTop: 1, fontFamily: "var(--font-mono)",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {role?.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ navItems, brandTitle = "Bloodexchange.in" }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="platform-sidebar">
      {/* Brand */}
      <div style={{ padding: "18px 16px 16px", borderBottom: "1px solid var(--color-sidebar-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BloodDropLogo />
          <div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: "var(--color-sidebar-text)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}>
              {brandTitle}
            </div>
            <div style={{
              fontSize: 10, color: "#F87171",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginTop: 1,
            }}>
              Blood Exchange
            </div>
          </div>
        </div>

        {user && <UserAvatar email={user.email} role={user.role} />}
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 0", flex: 1 }}>
        {navItems.map((section, si) => (
          <div key={si} style={{ marginBottom: 4 }}>
            {section.label && (
              <div className="nav-section-label">{section.label}</div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <span className="nav-icon">
                    <NavIcon name={item.icon} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer status */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid var(--color-sidebar-border)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        color: "var(--color-sidebar-muted)",
      }}>
        <span className="live-dot" />
        <span>System Online</span>
      </div>
    </aside>
  );
}
