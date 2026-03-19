import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <header style={{
        padding: "16px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🩸</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
              Bloodexchange.in
            </div>
            <div style={{ fontSize: 11, color: "var(--color-blood)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              India's Blood Exchange Network
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" className="btn btn-ghost">Login</Link>
          <Link href="/register/donor" className="btn btn-primary">Register as Donor</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        padding: "80px 48px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        alignItems: "center",
      }}>
        <div>
          <div style={{ display: "inline-block", background: "var(--color-blood-light)", color: "var(--color-blood)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
            India-wide Network
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-ink)", lineHeight: 1.1, margin: "0 0 20px" }}>
            Paperless blood exchange.<br />
            <span style={{ color: "var(--color-blood)" }}>Lives saved.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--color-ink-muted)", lineHeight: 1.6, marginBottom: 32 }}>
            Bloodexchange.in connects blood banks, donors, and patients across India.
            Our cycle-detection algorithm enables zero-fee blood exchanges when donation chains form a loop.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/register/patient" className="btn btn-primary btn-lg">Find Blood Now</Link>
            <Link href="/register/blood-bank" className="btn btn-ghost btn-lg">Register Blood Bank</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Blood Banks", value: "500+", variant: "red" },
            { label: "Active Donors", value: "12,000+", variant: "blue" },
            { label: "Units Exchanged", value: "45,000+", variant: "green" },
            { label: "Cycles Detected", value: "3,200+", variant: "orange" },
          ].map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.variant}`} style={{ padding: 24 }}>
              <div className="stat-value" style={{ fontSize: 28 }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--color-surface)", padding: "64px 48px", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
            How it works
          </h2>
          <p style={{ textAlign: "center", color: "var(--color-ink-muted)", marginBottom: 48 }}>
            Three roles. One network. Zero paper.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { icon: "🏥", title: "Blood Banks", desc: "Register your blood bank. Manage inventory, process donations, and exchange blood digitally with other banks." },
              { icon: "🩸", title: "Donors", desc: "Register as a donor. Select a patient to donate for. Receive a digital donor card and track your impact." },
              { icon: "👤", title: "Patients", desc: "Register your blood requirement. Pay a small registration fee and let our network find compatible donors." },
            ].map((item) => (
              <div key={item.title} className="panel" style={{ padding: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "var(--color-ink-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 48px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg)", textAlign: "center", color: "var(--color-ink-muted)", fontSize: 13 }}>
        © 2024 Bloodexchange.in — Connecting India's blood ecosystem | Regulated under Indian Blood Banking Guidelines
      </footer>
    </div>
  );
}
