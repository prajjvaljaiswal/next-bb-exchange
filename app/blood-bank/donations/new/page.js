"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import BloodTag from "@/components/ui/BloodTag";
import Badge from "@/components/ui/Badge";

const STEPS = ["Donor Lookup", "Select Patient", "Confirm"];

export default function NewDonationPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [donorQuery, setDonorQuery] = useState("");
  const [donorResults, setDonorResults] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cycleResult, setCycleResult] = useState(null);

  const bankId = user?.bloodBankId;

  async function searchDonor() {
    if (!donorQuery.trim()) return;
    setSearching(true);
    try {
      const data = await apiGet(`/donors?search=${encodeURIComponent(donorQuery)}`, { token: accessToken });
      setDonorResults(data.data || data);
    } catch {
      toast.error("Donor search failed");
    } finally {
      setSearching(false);
    }
  }

  async function selectDonor(donor) {
    setSelectedDonor(donor);
    try {
      const data = await apiGet(`/donors/${donor.id}/eligible-patients`, { token: accessToken });
      setPatients(data.data || data);
    } catch {
      toast.error("Could not fetch patients");
    }
    setStep(1);
  }

  function selectPatient(patient) {
    setSelectedPatient(patient);
    setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await apiPost("/donations", {
        donorId: selectedDonor.id,
        patientId: selectedPatient.id,
        bloodBankId: bankId,
      }, { token: accessToken });
      setCycleResult(result);
      toast.success(result.cycleDetected ? "Donation logged — cycle detected!" : "Donation logged successfully");
    } catch (err) {
      toast.error(err.message || "Failed to log donation");
    } finally {
      setSubmitting(false);
    }
  }

  if (cycleResult) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          {cycleResult.cycleDetected ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
              <h2 style={{ color: "var(--color-success)", fontFamily: "var(--font-display)" }}>Cycle Detected!</h2>
              <p style={{ color: "var(--color-ink-muted)" }}>A donation chain closed. All balance sheet entries have been settled automatically.</p>
              <div style={{ background: "var(--color-success-bg, #f0fdf4)", border: "1px solid var(--color-success)", borderRadius: 8, padding: 16, margin: "16px 0", fontSize: 14 }}>
                ₹400 refunds will be triggered to the donor and patient.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: "var(--color-success)", fontFamily: "var(--font-display)" }}>Donation Logged</h2>
              <p style={{ color: "var(--color-ink-muted)" }}>The donor card and inventory entry have been created.</p>
            </>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button className="btn btn-ghost" onClick={() => router.push("/blood-bank/donations")}>View All Donations</button>
            <button className="btn btn-primary" onClick={() => { setCycleResult(null); setStep(0); setSelectedDonor(null); setSelectedPatient(null); setDonorQuery(""); setDonorResults([]); }}>Log Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Log Donation</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>3-step donation entry wizard</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: i < step ? "var(--color-success)" : i === step ? "var(--color-blood)" : "var(--color-border)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, marginBottom: 6,
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 12, color: i === step ? "var(--color-blood)" : "var(--color-ink-muted)", fontWeight: i === step ? 700 : 400 }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 0, width: 40, height: 2, background: i < step ? "var(--color-success)" : "var(--color-border)", marginBottom: 20 }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Donor Lookup */}
      {step === 0 && (
        <div className="panel" style={{ padding: 28 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Search for Donor</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              className="form-input"
              placeholder="Search by name or mobile..."
              value={donorQuery}
              onChange={e => setDonorQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchDonor()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={searchDonor} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {donorResults.length > 0 && (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Blood Group</th><th>Mobile</th><th>Last Donation</th><th></th></tr>
              </thead>
              <tbody>
                {donorResults.map(donor => (
                  <tr key={donor.id}>
                    <td style={{ fontWeight: 600 }}>{donor.name}</td>
                    <td><BloodTag group={donor.bloodGroup} /></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{donor.mobile}</td>
                    <td style={{ fontSize: 13 }}>{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString("en-IN") : "Never"}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => selectDonor(donor)}>Select</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {donorResults.length === 0 && donorQuery && !searching && (
            <div style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 20 }}>No donors found</div>
          )}
        </div>
      )}

      {/* Step 1: Select Patient */}
      {step === 1 && (
        <div className="panel" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "var(--color-bg)", borderRadius: 8 }}>
            <div style={{ fontSize: 20 }}>👤</div>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedDonor?.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{selectedDonor?.mobile} · <BloodTag group={selectedDonor?.bloodGroup} /></div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setStep(0)}>Change</button>
          </div>

          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Select Patient to Donate For</h3>

          {patients.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 32 }}>
              No eligible patients found for blood group {selectedDonor?.bloodGroup}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Patient ID</th><th>Name</th><th>Blood Group</th><th>Hospital</th><th>Units Needed</th><th></th></tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.patientDisplayId}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><BloodTag group={p.bloodGroup} /></td>
                    <td style={{ fontSize: 13 }}>{p.hospitalName}</td>
                    <td style={{ textAlign: "center" }}>{p.unitsRequired}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => selectPatient(p)}>Select</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && (
        <div className="panel" style={{ padding: 28 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16 }}>Confirm Donation</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "var(--color-bg)", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Donor</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedDonor?.name}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}><BloodTag group={selectedDonor?.bloodGroup} /></div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 4 }}>{selectedDonor?.mobile}</div>
            </div>
            <div style={{ background: "var(--color-bg)", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedPatient?.name}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}><BloodTag group={selectedPatient?.bloodGroup} /></div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 4 }}>{selectedPatient?.hospitalName}</div>
            </div>
          </div>

          <div style={{ background: "var(--color-danger-bg, #fff5f5)", border: "1px solid var(--color-danger)", borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 13 }}>
            <strong>Note:</strong> This action will create a Donor Card, add to Whole Blood Inventory, and create a balance sheet entry. Cycle detection will run automatically.
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Logging..." : "Confirm Donation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
