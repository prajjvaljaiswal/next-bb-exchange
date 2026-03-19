"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { INDIAN_STATES, DESIGNATION_OPTIONS } from "@/lib/constants";

const STEPS = ["Bank Details", "Location & Contact", "Admin Account", "Submit"];

export default function BloodBankRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    bankName: "", registrationNo: "", registrationValidUpto: "",
    gstNo: "",
    address: "", city: "", district: "", state: "", pincode: "",
    contactMobile: "", bankEmail: "",
    bankAccountName: "", bankAccountIFSC: "", bankAccountUPI: "",
    adminName: "", adminDesignation: "Blood Bank Officer", adminMobile: "",
    email: "", password: "", confirmPassword: "",
  });

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!form.bankName || !form.registrationNo || !form.registrationValidUpto) {
        setError("Please fill all required fields"); return false;
      }
    }
    if (step === 1) {
      if (!form.address || !form.city || !form.district || !form.state || !form.pincode || !form.contactMobile || !form.bankEmail) {
        setError("Please fill all required fields"); return false;
      }
    }
    if (step === 2) {
      if (!form.adminName || !form.adminMobile || !form.email || !form.password) {
        setError("Please fill all required fields"); return false;
      }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      await apiPost("/auth/register/blood-bank", {
        bankName: form.bankName,
        registrationNo: form.registrationNo,
        registrationValidUpto: new Date(form.registrationValidUpto).toISOString(),
        gstNo: form.gstNo || undefined,
        address: form.address,
        city: form.city,
        district: form.district,
        state: form.state,
        pincode: form.pincode,
        contactMobile: form.contactMobile,
        bankEmail: form.bankEmail,
        adminName: form.adminName,
        adminDesignation: form.adminDesignation,
        adminMobile: form.adminMobile,
        email: form.email,
        password: form.password,
      }, { skipAuth: true });
      router.push("/login?registered=blood-bank");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "40px 16px", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>Register Blood Bank</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: "8px 0 0", fontSize: 14 }}>
            Subject to platform admin approval. Already registered?{" "}
            <Link href="/login" style={{ color: "var(--color-blood)", textDecoration: "none", fontWeight: 600 }}>Login</Link>
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", margin: "0 auto 6px",
                background: i <= step ? "var(--color-blood)" : "var(--color-border)",
                color: i <= step ? "#fff" : "var(--color-ink-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{i < step ? "✓" : i + 1}</div>
              <div style={{ fontSize: 10, color: i === step ? "var(--color-blood)" : "var(--color-ink-muted)", fontWeight: i === step ? 700 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 28 }}>
          {error && (
            <div style={{ background: "var(--color-danger-bg)", border: "1px solid var(--color-danger)", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Blood Bank / Hospital Name *</label>
                <input className="form-input" value={form.bankName} onChange={e => set("bankName", e.target.value)} placeholder="Official registered name" />
              </div>
              <div>
                <label className="form-label">License / Registration Number *</label>
                <input className="form-input" value={form.registrationNo} onChange={e => set("registrationNo", e.target.value)} placeholder="State blood bank license number" />
              </div>
              <div>
                <label className="form-label">Registration Valid Until *</label>
                <input className="form-input" type="date" value={form.registrationValidUpto} onChange={e => set("registrationValidUpto", e.target.value)} />
              </div>
              <div>
                <label className="form-label">GST Number (Optional)</label>
                <input className="form-input" value={form.gstNo} onChange={e => set("gstNo", e.target.value)} placeholder="15-digit GST number" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Address *</label>
                <textarea className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full registered address" rows={3} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">City *</label>
                  <input className="form-input" value={form.city} onChange={e => set("city", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">District *</label>
                  <input className="form-input" value={form.district} onChange={e => set("district", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">State *</label>
                  <select className="form-input" value={form.state} onChange={e => set("state", e.target.value)}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" value={form.pincode} onChange={e => set("pincode", e.target.value)} maxLength={6} />
                </div>
              </div>
              <div>
                <label className="form-label">Contact Mobile *</label>
                <input className="form-input" value={form.contactMobile} onChange={e => set("contactMobile", e.target.value)} maxLength={10} placeholder="Blood bank main contact" />
              </div>
              <div>
                <label className="form-label">Blood Bank Email *</label>
                <input className="form-input" type="email" value={form.bankEmail} onChange={e => set("bankEmail", e.target.value)} placeholder="Official blood bank email" />
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", paddingTop: 4 }}>Bank Account (optional — for financial transactions)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="form-input" value={form.bankAccountName} onChange={e => set("bankAccountName", e.target.value)} placeholder="Account holder name" />
                <input className="form-input" value={form.bankAccountIFSC} onChange={e => set("bankAccountIFSC", e.target.value)} placeholder="IFSC code" />
                <input className="form-input" value={form.bankAccountUPI} onChange={e => set("bankAccountUPI", e.target.value)} placeholder="UPI ID" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 6, fontSize: 12, color: "var(--color-ink-muted)" }}>
                You will be the <strong>Primary Admin</strong> of this blood bank account.
              </div>
              <div>
                <label className="form-label">Your Full Name *</label>
                <input className="form-input" value={form.adminName} onChange={e => set("adminName", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Designation *</label>
                  <select className="form-input" value={form.adminDesignation} onChange={e => set("adminDesignation", e.target.value)}>
                    {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Your Mobile *</label>
                  <input className="form-input" value={form.adminMobile} onChange={e => set("adminMobile", e.target.value)} maxLength={10} />
                </div>
              </div>
              <div>
                <label className="form-label">Login Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Review &amp; Submit</div>
              {[
                ["Blood Bank", form.bankName],
                ["License No.", form.registrationNo],
                ["City", `${form.city}, ${form.district}, ${form.state}`],
                ["Contact", form.contactMobile],
                ["Bank Email", form.bankEmail],
                ["Admin", `${form.adminName} (${form.adminDesignation})`],
                ["Login Email", form.email],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid var(--color-border)", paddingBottom: 8 }}>
                  <span style={{ color: "var(--color-ink-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val || "—"}</span>
                </div>
              ))}
              <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: 0 }}>
                Your registration will be reviewed by the platform admin. You will receive an email when approved.
              </p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
            {step > 0 ? (
              <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>
            ) : (
              <Link href="/login" className="btn btn-ghost">Cancel</Link>
            )}
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={loading}
              style={{ minWidth: 140, justifyContent: "center" }}
            >
              {loading ? "Submitting..." : step < STEPS.length - 1 ? "Next →" : "Submit Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
