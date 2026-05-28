"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";

export default function DonorPatientsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmPatient, setConfirmPatient] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(null);

  const donorId = user?.donorId;

  const fetchPatients = useCallback(async () => {
    if (!donorId || !accessToken) return;
    try {
      const data = await apiGet(`/donors/${donorId}/eligible-patients`, { token: accessToken });
      setPatients(data.data || data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [donorId, accessToken]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  async function handleSelect(patient) {
    setSelecting(true);
    try {
      await apiPost(`/donors/${donorId}/select-patient`, { patientId: patient.id }, { token: accessToken });
      setSelected(patient);
      setConfirmPatient(null);
      toast.success(`You've indicated intent to donate for ${patient.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to select patient");
    } finally {
      setSelecting(false);
    }
  }

  if (selected) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-success)" }}>Intent Registered</h2>
          <p style={{ color: "var(--color-ink-muted)" }}>
            You&apos;ve indicated your intent to donate for <strong>{selected.name}</strong>.
          </p>
          <div style={{ background: "var(--color-bg)", borderRadius: 8, padding: 16, margin: "16px 0", fontSize: 14, textAlign: "left" }}>
            <div><strong>Next step:</strong></div>
            <div style={{ marginTop: 6, color: "var(--color-ink-muted)" }}>
              Visit a registered blood bank. Staff will look up your name and log the donation for <strong>{selected.patientDisplayId}</strong>.
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => { setSelected(null); fetchPatients(); }}>
            Browse More Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Patients Needing Blood</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>
          Patients compatible with your blood group ({user?.bloodGroup})
        </p>
      </div>

      {!loading && patients.length === 0 && (
        <div className="panel" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
          <h3 style={{ margin: "0 0 8px" }}>No eligible patients right now</h3>
          <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 14 }}>
            Patients with blood group compatible with {user?.bloodGroup} will appear here when registered.
          </p>
        </div>
      )}

      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
      ) : patients.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {patients.map(p => (
            <div key={p.id} className="panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>{p.patientDisplayId}</div>
                </div>
                <BloodTag group={p.bloodGroup} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>Hospital</div>
                  <div style={{ fontWeight: 600 }}>{p.hospitalName}{p.hospitalType ? ` (${p.hospitalType === "GOVERNMENT" ? "Govt" : "Pvt"})` : ""}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>Units Needed</div>
                  <div style={{ fontWeight: 600 }}>{p.unitsRequired}</div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>Address / Location</div>
                  <div style={{ fontWeight: 600 }}>
                    {[p.district, p.state].filter(Boolean).join(", ") || p.registeredBloodBank?.city || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>Contact No.</div>
                  <div style={{ fontWeight: 600 }}>{p.mobile || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>Condition</div>
                  <div style={{ fontWeight: 600 }}>{p.disease || "—"}</div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setConfirmPatient(p)}>
                Donate for this Patient
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmPatient && (
        <Modal open={!!confirmPatient} onClose={() => setConfirmPatient(null)} title="Confirm Donation Intent">
          <p style={{ fontSize: 14, margin: "0 0 16px" }}>
            You are indicating intent to donate blood for <strong>{confirmPatient.name}</strong> ({confirmPatient.patientDisplayId}).
          </p>
          <div style={{ background: "var(--color-bg)", borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 16, color: "var(--color-ink-muted)" }}>
            This does <strong>not</strong> obligate you. The actual donation must be logged by blood bank staff when you visit.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setConfirmPatient(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={selecting} onClick={() => handleSelect(confirmPatient)}>
              {selecting ? "Registering..." : "Confirm Intent"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
