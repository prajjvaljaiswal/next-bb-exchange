"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Link from "next/link";

export default function DeliverablesPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [deliverables, setDeliverables] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [deliv, summ] = await Promise.all([
        apiGet(`/balance-sheet/blood-banks/${bankId}/deliverables`, { token: accessToken }),
        apiGet(`/balance-sheet/blood-banks/${bankId}/summary`, { token: accessToken }),
      ]);
      setDeliverables(deliv.data || deliv);
      setSummary(summ.data || summ);
    } catch {
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const netOwed = summary.filter(s => s.net < 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Deliverables</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Blood units this bank owes to others</p>
        </div>
        <Link href="/blood-bank/balance-sheet/receivables" className="btn btn-ghost btn-sm">← View Receivables</Link>
      </div>

      {netOwed.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {netOwed.map(s => (
            <div key={s.bloodGroup} style={{ background: "var(--color-danger-bg, #fff5f5)", border: "1px solid var(--color-danger)", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <BloodTag group={s.bloodGroup} />
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-danger)", margin: "4px 0 0" }}>{s.net}</div>
              <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>units owed out</div>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : deliverables.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No active deliverables</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Creditor Bank</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Donor Card</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deliverables.map(entry => (
                <tr key={entry.id}>
                  <td style={{ fontWeight: 600 }}>{entry.creditorBank?.name || "—"}</td>
                  <td><BloodTag group={entry.bloodGroup} /></td>
                  <td style={{ textAlign: "center" }}>{entry.units}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{entry.donorCard?.bloodUnitNo || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{entry.patient?.patientDisplayId || "—"}</td>
                  <td><Badge status={entry.status === "ACTIVE" ? "warning" : entry.status === "SETTLED" ? "info" : "danger"}>{entry.status}</Badge></td>
                  <td style={{ fontSize: 13 }}>{new Date(entry.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
