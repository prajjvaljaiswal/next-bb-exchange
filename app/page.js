import Link from "next/link";

function BloodDrop({ size = 32 }) {
  return (
    <svg width={size} height={Math.round(size * 1.25)} viewBox="0 0 28 36" fill="none" aria-hidden="true">
      <path
        d="M14 2C14 2 1 18 1 25C1 31.6274 6.92487 37 14 37C21.0751 37 27 31.6274 27 25C27 18 14 2 14 2Z"
        fill="#B91C1C"
      />
      <path
        d="M14 10C14 10 6 21 6 26C6 29.3137 8.68629 32 12 32"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FeatureIcon({ children }) {
  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: 12,
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 14,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  );
}

const FEATURES = [
  {
    icon: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    title: "Cycle Detection",
    desc: "Our BFS algorithm automatically detects donation loops and settles debts with zero transfer fees.",
  },
  {
    icon: <><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></>,
    title: "Digital Donor Cards",
    desc: "Donors receive a paperless digital card for every donation — trackable and shareable instantly.",
  },
  {
    icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    title: "Integrated Payments",
    desc: "Razorpay-powered transfer fees and patient registration with automatic refunds on cycle settlement.",
  },
  {
    icon: <><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></>,
    title: "Transfer Forms A & B",
    desc: "Structured inter-bank transfer workflow with digital Form A requests and Form B dispatch confirmations.",
  },
  {
    icon: <><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></>,
    title: "Digital Exchange",
    desc: "Bilateral and unilateral digital exchange of blood bank obligations without moving physical units.",
  },
  {
    icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    title: "Real-time Dashboard",
    desc: "Live KPIs, inventory levels, Socket.IO event feed, and nightly balance sheet email reports.",
  },
];

const ROLES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path d="M12 7v7"/><path d="M9 10.5h6"/>
      </svg>
    ),
    label: "Blood Banks",
    desc: "Register your blood bank. Manage inventory, log donations, process TTI tests, and exchange blood digitally with partner banks.",
    cta: "Register Blood Bank",
    href: "/register/blood-bank",
    badge: "Approval required",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    ),
    label: "Donors",
    desc: "Register as a blood donor. Choose a patient to donate for, receive a digital donor card, and track your donation history.",
    cta: "Register as Donor",
    href: "/register/donor",
    badge: "Free to join",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    label: "Patients",
    desc: "Register your blood requirement. Pay a small fee, get matched with compatible donors through our network algorithm.",
    cta: "Find Blood Now",
    href: "/register/patient",
    badge: "₹100 registration",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <header style={{
        padding: "0 48px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(8px)",
        boxShadow: "var(--shadow-xs)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BloodDrop size={26} />
          <div>
            <div style={{
              fontSize: 16, fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              lineHeight: 1,
            }}>
              Bloodexchange.in
            </div>
            <div style={{
              fontSize: 10, color: "var(--color-blood)",
              textTransform: "uppercase", letterSpacing: "0.07em",
              marginTop: 2,
            }}>
              India&apos;s Blood Exchange Network
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="#how-it-works" style={{ fontSize: 13.5, color: "var(--color-ink-muted)", textDecoration: "none", padding: "6px 12px" }}>
            How it works
          </a>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13.5 }}>
            Sign in
          </Link>
          <Link href="/register/donor" className="btn btn-primary" style={{ fontSize: 13.5 }}>
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        padding: "80px 48px 72px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 80,
        alignItems: "center",
      }}>
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-blood-light)",
            border: "1px solid #FECACA",
            color: "var(--color-blood)",
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 600,
            marginBottom: 24,
          }}>
            <span className="live-dot" />
            India-wide Network · Now live
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 4.5vw, 54px)",
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.02em",
          }}>
            Paperless blood exchange.<br />
            <span style={{ color: "var(--color-blood)" }}>Lives saved.</span>
          </h1>

          <p style={{
            fontSize: 17,
            color: "var(--color-ink-muted)",
            lineHeight: 1.65,
            marginBottom: 36,
            maxWidth: 520,
          }}>
            Bloodexchange.in connects blood banks, donors, and patients across India.
            Our cycle-detection algorithm enables zero-fee exchanges when donation chains form a loop.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/register/patient" className="btn btn-primary btn-lg">
              Find blood now
            </Link>
            <Link href="/register/blood-bank" className="btn btn-ghost btn-lg">
              Register blood bank
            </Link>
          </div>

          <div style={{
            marginTop: 36,
            display: "flex",
            gap: 28,
            paddingTop: 28,
            borderTop: "1px solid var(--color-border)",
          }}>
            {[
              { value: "500+", label: "Blood banks" },
              { value: "12,000+", label: "Active donors" },
              { value: "45,000+", label: "Units exchanged" },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-ink)",
                  letterSpacing: "-0.02em",
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Blood Banks",     value: "500+",    variant: "red" },
            { label: "Active Donors",   value: "12,000+", variant: "blue" },
            { label: "Units Exchanged", value: "45,000+", variant: "green" },
            { label: "Cycles Detected", value: "3,200+",  variant: "orange" },
          ].map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.variant}`} style={{ padding: 20 }}>
              <div className="stat-value" style={{ fontSize: 26 }}>{stat.value}</div>
              <div className="stat-label" style={{ marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        padding: "72px 48px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{
              display: "inline-block",
              background: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
              borderRadius: 999,
              padding: "4px 14px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--color-ink-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}>
              Three roles. One network.
            </div>
            <h2 style={{
              fontSize: "clamp(26px, 3vw, 36px)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
              color: "var(--color-ink)",
            }}>
              Built for every participant
            </h2>
            <p style={{ color: "var(--color-ink-muted)", fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
              Whether you run a blood bank, want to donate, or need blood — there&apos;s a portal built for you.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {ROLES.map((role) => (
              <div key={role.label} className="panel" style={{ padding: 28 }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: "var(--color-blood-light)",
                  border: "1px solid #FECACA",
                  color: "var(--color-blood)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  {role.icon}
                </div>
                <div style={{
                  display: "inline-block",
                  background: "var(--color-surface-alt)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-ink-muted)",
                  marginBottom: 10,
                }}>
                  {role.badge}
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700,
                  marginBottom: 10, margin: "0 0 10px",
                  color: "var(--color-ink)",
                }}>
                  {role.label}
                </h3>
                <p style={{
                  color: "var(--color-ink-muted)",
                  fontSize: 14, lineHeight: 1.65,
                  margin: "0 0 20px",
                }}>
                  {role.desc}
                </p>
                <Link
                  href={role.href}
                  style={{
                    fontSize: 13.5, fontWeight: 600,
                    color: "var(--color-blood)",
                    textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {role.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: "72px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{
            fontSize: "clamp(24px, 2.8vw, 34px)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            margin: "0 0 12px",
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
          }}>
            Everything built in
          </h2>
          <p style={{ color: "var(--color-ink-muted)", fontSize: 15, maxWidth: 440, margin: "0 auto" }}>
            No integrations needed. Every feature ships as part of the platform.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: 24,
              boxShadow: "var(--shadow-xs)",
            }}>
              <FeatureIcon>{f.icon}</FeatureIcon>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--color-ink)" }}>
                {f.title}
              </div>
              <p style={{ fontSize: 13.5, color: "var(--color-ink-muted)", lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section style={{
        background: "var(--color-sidebar-bg)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "72px 48px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <BloodDrop size={40} />
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 3vw, 38px)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            color: "#F0EDE8",
            margin: "16px 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            Be part of India&apos;s<br />blood exchange network
          </h2>
          <p style={{ color: "#6B6460", fontSize: 15, lineHeight: 1.65, marginBottom: 36 }}>
            Join thousands of blood banks, donors, and patients already on the platform.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register/donor" className="btn btn-primary btn-lg">
              Register as Donor
            </Link>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "12px 24px",
              borderRadius: "var(--radius)",
              fontSize: 15, fontWeight: 600,
              color: "#A89F97",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "color 0.15s, border-color 0.15s",
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#0A0908",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "24px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BloodDrop size={18} />
          <span style={{ fontSize: 12.5, color: "#6B6460" }}>
            © 2024 Bloodexchange.in
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#4A4642" }}>
          Regulated under Indian Blood Banking Guidelines
        </div>
      </footer>
    </div>
  );
}
