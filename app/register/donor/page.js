"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { BLOOD_GROUPS, INDIAN_STATES } from "@/lib/constants";

const STEPS = ["Personal Info", "Medical Details", "Account Setup"];

export default function DonorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", age: "", sex: "Male", nationality: "Indian", mobile: "", email: "",
    weight: "", bloodGroup: "O+", address: "", state: "", pincode: "",
    bankAccountName: "", bankAccountNo: "", bankAccountIFSC: "", bankAccountUPI: "",
    password: "", confirmPassword: "",
  });

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!form.name || !form.age || !form.mobile || !form.email) {
        setError("Please fill all required fields"); return false;
      }
      if (parseInt(form.age) < 18 || parseInt(form.age) > 65) {
        setError("Age must be between 18 and 65"); return false;
      }
    }
    if (step === 1) {
      if (!form.weight || !form.bloodGroup || !form.address || !form.state || !form.pincode) {
        setError("Please fill all required fields"); return false;
      }
      if (parseFloat(form.weight) < 50) {
        setError("Minimum weight requirement is 50kg"); return false;
      }
    }
    if (step === 2) {
      if (!form.email || !form.password) {
        setError("Please fill all required fields"); return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match"); return false;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters"); return false;
      }
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    // Submit
    setLoading(true);
    try {
      await apiPost("/auth/register/donor", {
        name: form.name,
        age: parseInt(form.age),
        sex: form.sex,
        nationality: form.nationality || "Indian",
        mobile: form.mobile,
        email: form.email,
        weight: parseFloat(form.weight),
        bloodGroup: form.bloodGroup,
        address: form.address,
        state: form.state,
        pincode: form.pincode,
        bankAccountName: form.bankAccountName || undefined,
        bankAccountNo: form.bankAccountNo || undefined,
        bankAccountIFSC: form.bankAccountIFSC || undefined,
        bankAccountUPI: form.bankAccountUPI || undefined,
        password: form.password,
      }, { skipAuth: true });
      router.push("/login?registered=donor");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-body)", padding: "40px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🩸</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>Register as Donor</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: "8px 0 0", fontSize: 14 }}>
            Already have an account? <Link href="/login" style={{ color: "var(--color-blood)", textDecoration: "none", fontWeight: 600 }}>Login</Link>
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", margin: "0 auto 6px",
                background: i <= step ? "var(--color-blood)" : "var(--color-border)",
                color: i <= step ? "#fff" : "var(--color-ink-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{i < step ? "✓" : i + 1}</div>
              <div style={{ fontSize: 11, color: i === step ? "var(--color-blood)" : "var(--color-ink-muted)", fontWeight: i === step ? 700 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 28 }}>
          {error && (
            <div style={{ background: "var(--color-danger-bg)", border: "1px solid var(--color-danger)", borderRadius: 6, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          {/* Step 0 — Personal */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="As per government ID" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="18–65" min="18" max="65" />
                </div>
                <div>
                  <label className="form-label">Sex *</label>
                  <select className="form-input" value={form.sex} onChange={e => set("sex", e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Nationality</label>
                <input className="form-input" value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="Indian" />
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
          )}

          {/* Step 1 — Medical */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Weight (kg) *</label>
                  <input className="form-input" type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="Min. 50kg" min="50" />
                </div>
                <div>
                  <label className="form-label">Blood Group *</label>
                  <select className="form-input" value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Address *</label>
                <textarea className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full address" rows={3} style={{ resize: "vertical" }} />
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
                  <input className="form-input" value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="6-digit pincode" maxLength={6} />
                </div>
              </div>
              <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 6, fontSize: 12, color: "var(--color-ink-muted)" }}>
                <strong>Bank Account (Optional)</strong> — Required to receive cycle refunds (₹400)
              </div>
              <div>
                <label className="form-label">Name of Bank</label>
                <input className="form-input" value={form.bankAccountName} onChange={e => set("bankAccountName", e.target.value)} placeholder="As per bank records" />
              </div>
              <div>
                <label className="form-label">Account No.</label>
                <input className="form-input" value={form.bankAccountNo} onChange={e => set("bankAccountNo", e.target.value)} placeholder="Bank account number" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">IFSC Code</label>
                  <input className="form-input" value={form.bankAccountIFSC} onChange={e => set("bankAccountIFSC", e.target.value)} placeholder="IFSC code" />
                </div>
                <div>
                  <label className="form-label">UPI ID</label>
                  <input className="form-input" value={form.bankAccountUPI} onChange={e => set("bankAccountUPI", e.target.value)} placeholder="yourname@upi" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Account */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "var(--color-bg)", padding: 12, borderRadius: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Registration Summary</div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{form.name} • {form.bloodGroup} • {form.age}y • {form.weight}kg</div>
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Repeat password" />
              </div>
              <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: 0 }}>
                By registering, you agree to Bloodexchange.in&apos;s terms. A verification email will be sent to <strong>{form.email}</strong>.
              </p>
            </div>
          )}

          {/* Navigation */}
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
              style={{ minWidth: 120, justifyContent: "center" }}
            >
              {loading ? "Registering..." : step < STEPS.length - 1 ? "Next →" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
