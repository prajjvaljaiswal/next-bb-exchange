"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const ROLE_REDIRECTS = {
  PLATFORM_ADMIN: "/platform-admin/dashboard",
  BLOOD_BANK_ADMIN: "/blood-bank/dashboard",
  DONOR: "/donor/dashboard",
  PATIENT: "/patient/dashboard",
};

const REGISTER_MESSAGES = {
  donor: "Registration successful! Please verify your email, then login.",
  patient: "Registration successful! Please verify your email and then login to complete payment.",
  "blood-bank": "Blood bank registration submitted! Awaiting platform approval. Please verify your email.",
};

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
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🩸</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--color-ink)", margin: 0 }}>
            Bloodexchange.in
          </h1>
          <p style={{ color: "var(--color-ink-muted)", margin: "8px 0 0", fontSize: 14 }}>
            Sign in to your account
          </p>
        </div>

        {registeredAs && REGISTER_MESSAGES[registeredAs] && (
          <div style={{
            background: "var(--color-success-bg)", border: "1px solid var(--color-success)",
            borderRadius: 6, padding: "12px 16px", marginBottom: 20, fontSize: 13,
            color: "var(--color-success)",
          }}>
            ✓ {REGISTER_MESSAGES[registeredAs]}
          </div>
        )}

        <div className="panel" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--color-blood)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--color-ink-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register/donor" style={{ color: "var(--color-blood)", textDecoration: "none", fontWeight: 600 }}>
            Register here
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
          <Link href="/register/donor" style={{ fontSize: 12, color: "var(--color-ink-muted)", textDecoration: "none" }}>As Donor</Link>
          <span style={{ color: "var(--color-border)" }}>·</span>
          <Link href="/register/patient" style={{ fontSize: 12, color: "var(--color-ink-muted)", textDecoration: "none" }}>As Patient</Link>
          <span style={{ color: "var(--color-border)" }}>·</span>
          <Link href="/register/blood-bank" style={{ fontSize: 12, color: "var(--color-ink-muted)", textDecoration: "none" }}>Blood Bank</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
