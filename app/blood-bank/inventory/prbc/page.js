"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import InventoryBar from "@/components/ui/InventoryBar";

export default function PRBCInventoryPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [unitsData, summaryData] = await Promise.all([
        apiGet(`/inventory/blood-banks/${bankId}/prbc`, { token: accessToken }),
        apiGet(`/inventory/blood-banks/${bankId}/prbc/summary`, { token: accessToken }),
      ]);
      setUnits(unitsData.data || unitsData);
      setSummary(summaryData.data || summaryData);
    } catch (err) {
      toast.error("Failed to load PRBC inventory");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = units.filter(u => {
    if (filterGroup && u.bloodGroup !== filterGroup) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  });

  const statusColor = { AVAILABLE: "success", RESERVED: "warning", TRANSFERRED: "info", USED: "info", DAMAGED: "danger", EXPIRED: "danger" };

  function daysLeft(expiry) {
    const d = Math.ceil((new Date(expiry) - new Date()) / 86400000);
    return d;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>PRBC Inventory</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Packed Red Blood Cells ready for use or transfer</p>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{filtered.length} units</div>
      </div>

      {summary.length > 0 && (
        <div className="panel" style={{ marginBottom: 20, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Inventory by Blood Group</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {summary.map(s => (
              <InventoryBar key={s.bloodGroup} bloodGroup={s.bloodGroup} available={s.available} total={s.total} />
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select className="form-input" style={{ width: 160 }} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="">All Blood Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="form-input" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["AVAILABLE","RESERVED","TRANSFERRED","USED","DAMAGED","EXPIRED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterGroup(""); setFilterStatus(""); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No PRBC units found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit No</th>
                <th>Blood Group</th>
                <th>Collected</th>
                <th>Expires</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(unit => {
                const days = daysLeft(unit.dateOfExpiration);
                return (
                  <tr key={unit.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{unit.bloodUnitNo}</td>
                    <td><BloodTag group={unit.bloodGroup} /></td>
                    <td style={{ fontSize: 13 }}>{new Date(unit.dateOfDonation).toLocaleDateString("en-IN")}</td>
                    <td style={{ fontSize: 13 }}>{new Date(unit.dateOfExpiration).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? "var(--color-danger)" : days <= 14 ? "var(--color-warning)" : "var(--color-success)" }}>
                        {days > 0 ? `${days}d` : "Expired"}
                      </span>
                    </td>
                    <td><Badge status={statusColor[unit.status] || "info"}>{unit.status}</Badge></td>
                    <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{unit.remarks || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
