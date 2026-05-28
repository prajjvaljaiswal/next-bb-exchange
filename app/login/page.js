"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const ROLE_REDIRECTS = {
  PLATFORM_ADMIN:  "/platform-admin/dashboard",
  BLOOD_BANK_ADMIN: "/blood-bank/dashboard",
  DONOR:           "/donor/dashboard",
  PATIENT:         "/patient/dashboard",
};

const REGISTER_MESSAGES = {
  donor:        "Registration successful! Please verify your email, then sign in.",
  patient:      "Registration successful! Verify your email, then sign in to complete payment.",
  "blood-bank": "Blood bank registration submitted. Awaiting platform approval. Please verify your email.",
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

const BRAND_BULLETS = [
  "Cycle-detection algorithm — zero-fee exchanges",
  "Real-time Socket.IO event feed across all banks",
  "Integrated Razorpay payments with auto-refunds",
  "Digital donor cards & balance sheet management",
];

function BrandPanel() {
  return (
    <div style={{
      width: "42%",
      minHeight: "100vh",
      background: "var(--color-sidebar-bg)",
      borderRight: "1px solid var(--color-sidebar-border)",
      display: "flex",
      flexDirection: "column",
      padding: "48px 44px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle background circle */}
      <div style={{
        position: "absolute",
        bottom: -120, right: -120,
        width: 400, height: 400,
        borderRadius: "50%",
        background: "rgba(185,28,28,0.05)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" }}>
        <svg width="32" height="40" viewBox="0 0 28 36" fill="none">
          <path d="M14 2C14 2 1 18 1 25C1 31.6274 6.92487 37 14 37C21.0751 37 27 31.6274 27 25C27 18 14 2 14 2Z" fill="#B91C1C"/>
          <path d="M14 10C14 10 6 21 6 26C6 29.3137 8.68629 32 12 32" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{
            fontSize: 17, fontWeight: 800,
            fontFamily: "var(--font-display)",
            color: "#F0EDE8",
            letterSpacing: "-0.01em",
          }}>
            Bloodexchange.in
          </div>
          <div style={{
            fontSize: 10.5, color: "#F87171",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginTop: 2,
          }}>
            Blood Exchange Network
          </div>
        </div>
      </div>

      {/* Main copy */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 32 }}>
        <h2 style={{
          fontSize: "clamp(24px, 2.8vw, 32px)",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          color: "#F0EDE8",
          lineHeight: 1.15,
          margin: "0 0 14px",
          letterSpacing: "-0.02em",
        }}>
          India&apos;s paperless<br />blood exchange platform.
        </h2>
        <p style={{
          fontSize: 14,
          color: "#6B6460",
          lineHeight: 1.65,
          margin: "0 0 32px",
          maxWidth: 320,
        }}>
          Connecting blood banks, donors, and patients with a fully digital, automated exchange network.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {BRAND_BULLETS.map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "#9B9087" }}>
              <span style={{
                color: "#F87171",
                marginTop: 1, flexShrink: 0,
              }}>
                <CheckIcon />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Trust note */}
      <div style={{
        fontSize: 11.5,
        color: "#4A4642",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 20,
      }}>
        Trusted by 500+ blood banks · Regulated under Indian Blood Banking Guidelines
      </div>
    </div>
  );
}

function LoginPageInner() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registeredAs = searchParams.get("registered");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push(ROLE_REDIRECTS[user.role] || "/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "var(--font-body)",
    }}>
      <BrandPanel />

      {/* Right: form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "48px 32px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800,
              color: "var(--color-ink)",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--color-ink-muted)", margin: 0, fontSize: 14 }}>
              Sign in to your account to continue.
            </p>
          </div>

          {/* Success message after registration */}
          {registeredAs && REGISTER_MESSAGES[registeredAs] && (
            <div style={{
              background: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              borderRadius: "var(--radius)",
              padding: "12px 14px",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--color-success)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}>
              <CheckIcon />
              {REGISTER_MESSAGES[registeredAs]}
            </div>
          )}

          {/* Form card */}
          <div className="panel" style={{ padding: 28, marginBottom: 20 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <Link href="/forgot-password" style={{
                    fontSize: 12.5, color: "var(--color-blood)",
                    textDecoration: "none", fontWeight: 600,
                  }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "11px 16px", fontSize: 14, marginTop: 4 }}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Register links */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "0 0 10px" }}>
              Don&apos;t have an account?
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {[
                { href: "/register/donor",      label: "As Donor" },
                { href: "/register/patient",    label: "As Patient" },
                { href: "/register/blood-bank", label: "Blood Bank" },
              ].map((reg, i, arr) => (
                <span key={reg.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href={reg.href} style={{
                    fontSize: 13, fontWeight: 600,
                    color: "var(--color-blood)", textDecoration: "none",
                  }}>
                    {reg.label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span style={{ color: "var(--color-border)", fontSize: 16, lineHeight: 1 }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading…
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
