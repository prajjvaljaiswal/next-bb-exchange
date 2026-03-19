"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, password: form.password }, { skipAuth: true });
      router.push("/login?reset=success");
    } catch (err) {
      setError(err.message || "Reset failed. Link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>Reset Password</h1>
        </div>
        <div className="panel" style={{ padding: 28 }}>
          {error && (
            <div style={{ background: "var(--color-danger-bg)", border: "1px solid var(--color-danger)", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--color-danger)" }}>
              {error}
            </div>
          )}
          {!token ? (
            <div style={{ textAlign: "center", color: "var(--color-danger)" }}>
              Invalid reset link. <Link href="/forgot-password" style={{ color: "var(--color-blood)" }}>Request new one</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 8 characters" required />
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
