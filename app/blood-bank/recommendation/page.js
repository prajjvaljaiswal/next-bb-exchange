"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import BloodTag from "@/components/ui/BloodTag";
import Badge from "@/components/ui/Badge";

export default function RecommendationPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPatient, setFilterPatient] = useState("");

  const bankId = user?.bloodBankId;

  const fetchNodes = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const data = await apiGet(`/blood-banks/${bankId}/recommendations`, { token: accessToken });
      setNodes(data.data || data);
    } catch {
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  // Group nodes by patient
  const byPatient = nodes.reduce((acc, node) => {
    const pid = node.forPatient?.patientDisplayId || node.forPatientId;
    if (!acc[pid]) acc[pid] = { patient: node.forPatient, nodes: [] };
    acc[pid].nodes.push(node);
    return acc;
  }, {});

  const patientGroups = Object.entries(byPatient).filter(([pid]) =>
    !filterPatient || pid.toLowerCase().includes(filterPatient.toLowerCase())
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Recommendation List</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Donor chains leading to patients registered with this bank</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16, padding: "12px 16px" }}>
        <input
          className="form-input"
          placeholder="Filter by patient ID..."
          value={filterPatient}
          onChange={e => setFilterPatient(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
      ) : patientGroups.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No recommendation entries found</div>
      ) : (
        patientGroups.map(([pid, group]) => (
          <div key={pid} className="panel" style={{ marginBottom: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{group.patient?.name || "Patient"}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-muted)" }}>{pid}</span>
                  {group.patient?.bloodGroup && <BloodTag group={group.patient.bloodGroup} />}
                  <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{group.patient?.hospitalName}</span>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge status="info">{group.nodes.length} chain{group.nodes.length !== 1 ? "s" : ""}</Badge>
              </div>
            </div>

            {/* Horizontal chain visualization */}
            <div style={{ overflowX: "auto" }}>
              {group.nodes.sort((a, b) => a.displayOrder - b.displayOrder).map((node, i) => (
                <div key={node.id} style={{ display: "inline-flex", alignItems: "center", gap: 0, marginBottom: 8 }}>
                  <div style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    display: "inline-block",
                    minWidth: 120,
                  }}>
                    <div style={{ fontWeight: 700, color: "var(--color-blood)", marginBottom: 2 }}>
                      {node.hops === 0 ? "Direct Donor" : `Hop ${node.hops}`}
                    </div>
                    <div style={{ color: "var(--color-ink-muted)" }}>{node.forBloodBank?.name || "Blood Bank"}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 2 }}>{node.donorCard?.bloodUnitNo}</div>
                  </div>
                  {i < group.nodes.length - 1 && (
                    <div style={{ padding: "0 8px", color: "var(--color-ink-muted)", fontSize: 18 }}>→</div>
                  )}
                </div>
              ))}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
                <div style={{ padding: "0 8px", color: "var(--color-ink-muted)", fontSize: 18 }}>→</div>
                <div style={{
                  background: "var(--color-blood)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  display: "inline-block",
                }}>
                  <div style={{ fontWeight: 700 }}>Patient</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>{pid}</div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
