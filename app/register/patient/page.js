"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { BLOOD_GROUPS, INDIAN_STATES, FEES } from "@/lib/constants";

const STEPS = ["Patient Details", "Address & Hospital", "Contact & Pay"];

const HOSPITAL_TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
];

export default function PatientRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", age: "", sex: "Male", bloodGroup: "O+", unitsRequired: "1",
    disease: "",
    address: "", district: "", state: "", nationality: "Indian",
    hospitalName: "", hospitalType: "", doctorName: "",
    contactPerson1: "", contactPerson2: "", contactPerson3: "",
    mobile: "", email: "",
    bankAccountName: "", bankAccountNo: "", bankAccountIFSC: "", bankAccountUPI: "",
    password: "", confirmPassword: "",
  });

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  function validateStep() {
    setError("");
    if (step === 0) {
      if (!form.name || !form.age || !form.bloodGroup || !form.unitsRequired) {
        setError("Please fill all required fields"); return false;
      }
    }
    if (step === 1) {
      if (!form.address || !form.district || !form.state || !form.hospitalName || !form.hospitalType) {
        setError("Please fill all required fields"); return false;
      }
    }
    if (step === 2) {
      if (!form.mobile) { setError("Mobile number is required"); return false; }
      if (!form.email) { setError("Email is required to create your login account"); return false; }
      if (!form.password) { setError("Password is required"); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setLoading(true);
    setError("");
    try {
      await apiPost("/auth/register/patient", {
        name: form.name,
        age: parseInt(form.age),
        sex: form.sex,
        bloodGroup: form.bloodGroup,
        unitsRequired: parseInt(form.unitsRequired),
        disease: form.disease || undefined,
        address: form.address,
        district: form.district,
        state: form.state,
        nationality: form.nationality || undefined,
        hospitalName: form.hospitalName,
        hospitalType: form.hospitalType || undefined,
        doctorName: form.doctorName || undefined,
        contactPerson1: form.contactPerson1 || undefined,
        contactPerson2: form.contactPerson2 || undefined,
        contactPerson3: form.contactPerson3 || undefined,
        mobile: form.mobile,
        email: form.email,
        modeOfPayment: "ONLINE",
        bankAccountName: form.bankAccountName || undefined,
        bankAccountNo: form.bankAccountNo || undefined,
        bankAccountIFSC: form.bankAccountIFSC || undefined,
        bankAccountUPI: form.bankAccountUPI || undefined,
        password: form.password,
      }, { skipAuth: true });
      router.push("/login?registered=patient&pay=true");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "40px 16px", fontFamily: "var(--font-body)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", margin: 0 }}>Register as Patient</h1>
          <p style={{ color: "var(--color-ink-muted)", margin: "8px 0 0", fontSize: 14 }}>
            Registration fee: <strong style={{ color: "var(--color-blood)" }}>₹{FEES.PATIENT_REGISTRATION}</strong> (one-time, non-refundable)
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

          {/* Step 0 — Patient Details */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Patient Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Patient's full name" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="Age" min="0" />
                </div>
                <div>
                  <label className="form-label">Sex *</label>
                  <select className="form-input" value={form.sex} onChange={e => set("sex", e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Units Required *</label>
                  <input className="form-input" type="number" value={form.unitsRequired} onChange={e => set("unitsRequired", e.target.value)} min="1" />
                </div>
              </div>
              <div>
                <label className="form-label">Blood Group Required *</label>
                <select className="form-input" value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Condition / Disease (Optional)</label>
                <input className="form-input" value={form.disease} onChange={e => set("disease", e.target.value)} placeholder="e.g., Thalassemia, Surgery, Accident" />
              </div>
              <div>
                <label className="form-label">Nationality</label>
                <input className="form-input" value={form.nationality} onChange={e => set("nationality", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1 — Address & Hospital */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Address *</label>
                <textarea className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full address" rows={2} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">District *</label>
                  <input className="form-input" value={form.district} onChange={e => set("district", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">State/UT *</label>
                  <select className="form-input" value={form.state} onChange={e => set("state", e.target.value)}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Hospital Name *</label>
                <input className="form-input" value={form.hospitalName} onChange={e => set("hospitalName", e.target.value)} placeholder="Name of treating hospital" />
              </div>
              <div>
                <label className="form-label">Hospital Type *</label>
                <select className="form-input" value={form.hospitalType} onChange={e => set("hospitalType", e.target.value)}>
                  <option value="">Select type</option>
                  {HOSPITAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Doctor's Name (Optional)</label>
                <input className="form-input" value={form.doctorName} onChange={e => set("doctorName", e.target.value)} placeholder="Treating doctor's name" />
              </div>
            </div>
          )}

          {/* Step 2 — Contact & Payment */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="Required for contact" maxLength={10} />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="For login and updates" />
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", padding: "4px 0" }}>Emergency contacts (optional)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["contactPerson1", "contactPerson2", "contactPerson3"].map((field, i) => (
                  <input key={field} className="form-input" value={form[field]} onChange={e => set(field, e.target.value)} placeholder={`Emergency contact ${i + 1} name`} />
                ))}
              </div>

              <div style={{ background: "var(--color-blood-light)", border: "1px solid var(--color-blood)", borderRadius: 6, padding: 16 }}>
                <div style={{ fontWeight: 700, color: "var(--color-blood)", marginBottom: 4 }}>Registration Fee: ₹{FEES.PATIENT_REGISTRATION}</div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                  One-time, non-refundable. Your Patient ID is activated after payment.
                </div>
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
              </div>

              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", fontWeight: 600, paddingTop: 4 }}>Bank Account for Transfer-fee Refund (Optional)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="form-label">Name of Bank</label>
                  <input className="form-input" value={form.bankAccountName} onChange={e => set("bankAccountName", e.target.value)} placeholder="Bank / account holder name" />
                </div>
                <div>
                  <label className="form-label">Account No.</label>
                  <input className="form-input" value={form.bankAccountNo} onChange={e => set("bankAccountNo", e.target.value)} placeholder="Bank account number" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="form-label">IFSC Code</label>
                    <input className="form-input" value={form.bankAccountIFSC} onChange={e => set("bankAccountIFSC", e.target.value)} placeholder="IFSC" />
                  </div>
                  <div>
                    <label className="form-label">UPI ID</label>
                    <input className="form-input" value={form.bankAccountUPI} onChange={e => set("bankAccountUPI", e.target.value)} placeholder="UPI ID" />
                  </div>
                </div>
              </div>
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
              {loading ? "Processing..." : step < STEPS.length - 1 ? "Next →" : "Register & Pay →"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--color-ink-muted)" }}>
          Already registered? <Link href="/login" style={{ color: "var(--color-blood)", textDecoration: "none", fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
