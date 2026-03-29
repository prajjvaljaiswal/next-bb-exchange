"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Link from "next/link";

export default function ReceivablesPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [receivables, setReceivables] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [recv, summ] = await Promise.all([
        apiGet(`/balance-sheet/blood-banks/${bankId}/receivables`, { token: accessToken }),
        apiGet(`/balance-sheet/blood-banks/${bankId}/summary`, { token: accessToken }),
      ]);
      setReceivables(recv.data || recv);
      setSummary(summ.data || summ);
    } catch {
      toast.error("Failed to load receivables");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const netByGroup = summary.filter(s => s.net > 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Receivables</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Blood units owed TO this bank</p>
        </div>
        <Link href="/blood-bank/balance-sheet/deliverables" className="btn btn-ghost btn-sm">View Deliverables →</Link>
      </div>

      {netByGroup.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {netByGroup.map(s => (
            <div key={s.bloodGroup} style={{ background: "var(--color-success-bg, #f0fdf4)", border: "1px solid var(--color-success)", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <BloodTag group={s.bloodGroup} />
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-success)", margin: "4px 0 0" }}>+{s.net}</div>
              <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>net units owed</div>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : receivables.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No active receivables</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Debtor Bank</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Donor Card</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map(entry => (
                <tr key={entry.id}>
                  <td style={{ fontWeight: 600 }}>{entry.debtorBank?.name || "—"}</td>
                  <td><BloodTag group={entry.bloodGroup} /></td>
                  <td style={{ textAlign: "center" }}>{entry.units}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{entry.donorCard?.bloodUnitNo || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{entry.patient?.patientDisplayId || "—"}</td>
                  <td><Badge status={entry.status === "ACTIVE" ? "success" : entry.status === "SETTLED" ? "info" : "warning"}>{entry.status}</Badge></td>
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
