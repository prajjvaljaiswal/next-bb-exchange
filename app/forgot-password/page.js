"use client";
import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email }, { skipAuth: true });
      setSent(true);
    } catch {
      setSent(true); // Show same message to prevent email enumeration
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>Forgot Password?</h1>
        </div>

        <div className="panel" style={{ padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <p style={{ color: "var(--color-ink-muted)", fontSize: 14 }}>
                If that email is registered, a password reset link has been sent. Check your inbox.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex", justifyContent: "center" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ color: "var(--color-ink-muted)", fontSize: 13, margin: 0 }}>
                Enter your registered email to receive a password reset link.
              </p>
              <div>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "var(--color-ink-muted)", textDecoration: "none" }}>
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
