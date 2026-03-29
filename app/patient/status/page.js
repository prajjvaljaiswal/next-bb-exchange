"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Timeline from "@/components/ui/Timeline";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";

export default function PatientStatusPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patientId;

  const fetchPatient = useCallback(async () => {
    if (!patientId || !accessToken) return;
    try {
      const data = await apiGet(`/patients/${patientId}`, { token: accessToken });
      setPatient(data.data || data);
    } catch {
      toast.error("Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [patientId, accessToken]);

  useEffect(() => { fetchPatient(); }, [fetchPatient]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>;
  }

  const p = patient || {};
  const status = p.status || "PENDING_PAYMENT";

  const timelineSteps = [
    {
      label: "Registration Submitted",
      description: "Your registration details have been submitted.",
      status: "done",
    },
    {
      label: "Registration Fee Paid",
      description: "₹100 registration fee required to activate your request.",
      status: status === "PENDING_PAYMENT" ? "active" : "done",
    },
    {
      label: "Request Active",
      description: "Blood bank network is being alerted. Donors are being matched.",
      status: status === "ACTIVE" ? "active" : status === "PENDING_PAYMENT" ? "pending" : "done",
    },
    {
      label: "Donor Chains Forming",
      description: "Blood banks in the recommendation list have active donor chains.",
      status: status === "ACTIVE" ? "active" : status === "PENDING_PAYMENT" ? "pending" : "done",
    },
    {
      label: "Blood Requirement Fulfilled",
      description: "Your blood requirement has been met. All balance sheet entries settled.",
      status: status === "FULFILLED" ? "done" : "pending",
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Blood Request Status</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Track your blood request journey</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Patient info card */}
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Your Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Patient ID", value: p.patientDisplayId, mono: true },
              { label: "Name", value: p.name },
              { label: "Blood Group", value: p.bloodGroup, isBloodTag: true },
              { label: "Units Required", value: p.unitsRequired },
              { label: "Hospital", value: p.hospitalName },
              { label: "Doctor", value: p.doctorName },
              { label: "Condition", value: p.disease || "Not specified" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span style={{ color: "var(--color-ink-muted)" }}>{f.label}</span>
                {f.isBloodTag
                  ? <BloodTag group={f.value} />
                  : <span style={{ fontWeight: 600, fontFamily: f.mono ? "var(--font-mono)" : undefined }}>{f.value || "—"}</span>}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "var(--color-ink-muted)" }}>Status</span>
              <Badge status={{ PENDING_PAYMENT: "warning", ACTIVE: "success", FULFILLED: "info", EXPIRED: "danger" }[status] || "info"}>{status}</Badge>
            </div>
          </div>
        </div>

        {/* Contact persons */}
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Contact Persons</h3>
          {[p.contactPerson1, p.contactPerson2, p.contactPerson3].filter(Boolean).length === 0 ? (
            <div style={{ color: "var(--color-ink-muted)", fontSize: 13 }}>No contact persons added</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[p.contactPerson1, p.contactPerson2, p.contactPerson3].filter(Boolean).map((name, i) => (
                <div key={i} style={{ background: "var(--color-bg)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Contact {i + 1}:</span> {name}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Payment Info</h3>
            <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-muted)" }}>Mode</span>
                <span style={{ fontWeight: 600 }}>{p.modeOfPayment || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-muted)" }}>Reg Fee</span>
                <Badge status={status === "PENDING_PAYMENT" ? "warning" : "success"}>
                  {status === "PENDING_PAYMENT" ? "₹100 Pending" : "₹100 Paid"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="panel" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Request Timeline</h3>
        <Timeline steps={timelineSteps} />
      </div>
    </>
  );
}
