"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Link from "next/link";

const STATUS_COLOR = { PENDING_PAYMENT: "warning", ACTIVE: "success", FULFILLED: "success", EXPIRED: "danger" };
const STATUS_DESC = {
  PENDING_PAYMENT: "Complete payment to activate your blood request.",
  ACTIVE: "Your blood request is active. Donors are being matched.",
  FULFILLED: "Your blood requirement has been fulfilled.",
  EXPIRED: "Your request has expired. Please register again.",
};

export default function PatientDashboard() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const toast = useToast();
  const [patient, setPatient] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patientId;

  const fetchData = useCallback(async () => {
    if (!patientId || !accessToken) return;
    try {
      const [patData, recData] = await Promise.all([
        apiGet(`/patients/${patientId}`, { token: accessToken }),
        apiGet(`/patients/${patientId}/recommendation`, { token: accessToken }),
      ]);
      setPatient(patData.data || patData);
      setRecommendations(recData.data || recData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [patientId, accessToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken || !patientId) { setLoading(false); return; }
    fetchData();
  }, [fetchData, authLoading, accessToken, patientId]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>;
  }

  const p = patient || {};
  const status = p.status || "PENDING_PAYMENT";

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Welcome, {p.name || user?.name || "Patient"}</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>
          {p.patientDisplayId || "—"} · {p.hospitalName}
        </p>
      </div>

      {/* Status Banner */}
      <div style={{
        background: status === "ACTIVE" ? "var(--color-success-bg, #f0fdf4)" : status === "PENDING_PAYMENT" ? "var(--color-warning-bg, #fffbeb)" : "var(--color-bg)",
        border: `1px solid ${status === "ACTIVE" ? "var(--color-success)" : status === "PENDING_PAYMENT" ? "var(--color-warning)" : "var(--color-border)"}`,
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{ fontSize: 28 }}>
          {status === "ACTIVE" ? "✅" : status === "PENDING_PAYMENT" ? "⏳" : status === "FULFILLED" ? "🎉" : "❌"}
        </div>
        <div>
          <Badge status={STATUS_COLOR[status]}>{status}</Badge>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-ink-muted)" }}>{STATUS_DESC[status]}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Blood Group" value={p.bloodGroup || "—"} variant="red" icon="💉" />
        <StatCard label="Units Needed" value={p.unitsRequired ?? "—"} variant="blue" icon="🩸" />
        <StatCard label="Donor Chains" value={recommendations.length} variant="green" icon="🔗" />
        <StatCard label="Hospital" value={p.hospitalName ? p.hospitalName.split(" ")[0] + "..." : "—"} variant="orange" icon="🏥" />
      </div>

      {/* Recommendation list */}
      {status === "ACTIVE" && (
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>
            Recommendation List ({recommendations.length} chains)
          </h3>
          {recommendations.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--color-ink-muted)", padding: 24 }}>
              No donor chains identified yet. Blood banks are being notified.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recommendations.map((node, i) => (
                <div key={node.id} style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-blood)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{node.forBloodBank?.name || "Blood Bank"}</div>
                    <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
                      {node.hops === 0 ? "Direct donor available" : `${node.hops}-hop chain`}
                      {node.forBloodBank?.city ? ` · ${node.forBloodBank.city}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12 }}>
                    <div style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-muted)" }}>{node.donorCard?.bloodUnitNo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--color-ink-muted)" }}>
            Share this list with your family — ask them to visit these blood banks and mention your Patient ID: <strong style={{ fontFamily: "var(--font-mono)" }}>{p.patientDisplayId}</strong>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link href="/patient/status" className="btn btn-ghost">View Full Status Timeline →</Link>
      </div>
    </>
  );
}
