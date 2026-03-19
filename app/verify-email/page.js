"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import Link from "next/link";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    apiPost("/auth/verify-email", { token }, { skipAuth: true })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div className="panel" style={{ maxWidth: 400, width: "100%", padding: 40, textAlign: "center" }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontFamily: "var(--font-display)" }}>Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-success)" }}>Email Verified!</h2>
            <p style={{ color: "var(--color-ink-muted)" }}>Your account is now active. You can sign in.</p>
            <Link href="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-danger)" }}>Verification Failed</h2>
            <p style={{ color: "var(--color-ink-muted)" }}>The link is invalid or has expired.</p>
            <Link href="/login" className="btn btn-ghost" style={{ marginTop: 16 }}>Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}
