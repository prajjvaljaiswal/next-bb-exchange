"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";

const STATUS_COLOR = { true: "success", false: "danger" };

export default function BloodBanksPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const toast = useToast();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState("");
  const [filterApproved, setFilterApproved] = useState("");

  const fetchBanks = useCallback(async () => {
    if (!accessToken) return;
    try {
      const params = new URLSearchParams();
      if (filterState) params.set("state", filterState);
      if (filterApproved !== "") params.set("approved", filterApproved);
      const data = await apiGet(`/blood-banks?${params}`, { token: accessToken });
      setBanks(data.data || data);
    } catch {
      toast.error("Failed to load blood banks");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filterState, filterApproved, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) { setLoading(false); return; }
    fetchBanks();
  }, [fetchBanks, authLoading, accessToken]);

  async function approve(bankId) {
    try {
      await apiPatch(`/blood-banks/${bankId}/approve`, {}, { token: accessToken });
      toast.success("Blood bank approved");
      fetchBanks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleStatus(bankId, isActive) {
    try {
      await apiPatch(`/blood-banks/${bankId}/status`, { isActive: !isActive }, { token: accessToken });
      toast.success(isActive ? "Blood bank suspended" : "Blood bank reactivated");
      fetchBanks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const pendingCount = banks.filter(b => !b.approvedBy).length;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Blood Banks</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Manage all registered blood banks</p>
      </div>

      {pendingCount > 0 && (
        <div style={{ background: "var(--color-warning-bg, #fffbeb)", border: "1px solid var(--color-warning)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <strong>{pendingCount} blood bank{pendingCount !== 1 ? "s" : ""}</strong> pending approval.
        </div>
      )}

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select className="form-input" style={{ width: 180 }} value={filterApproved} onChange={e => setFilterApproved(e.target.value)}>
            <option value="">All Banks</option>
            <option value="false">Pending Approval</option>
            <option value="true">Approved</option>
          </select>
          <input className="form-input" placeholder="Filter by state..." style={{ width: 180 }} value={filterState} onChange={e => setFilterState(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterState(""); setFilterApproved(""); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : banks.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No blood banks found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>City</th>
                <th>State</th>
                <th>Contact</th>
                <th>Approved</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banks.map(bank => (
                <tr key={bank.id}>
                  <td style={{ fontWeight: 600 }}>{bank.name}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{bank.registrationNo}</td>
                  <td style={{ fontSize: 13 }}>{bank.city}</td>
                  <td style={{ fontSize: 13 }}>{bank.state}</td>
                  <td style={{ fontSize: 12 }}>{bank.contactMobile}</td>
                  <td>
                    {bank.approvedBy
                      ? <Badge status="success">Approved</Badge>
                      : <Badge status="warning">Pending</Badge>}
                  </td>
                  <td>
                    <Badge status={bank.isActive ? "success" : "danger"}>{bank.isActive ? "Active" : "Suspended"}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!bank.approvedBy && (
                        <button className="btn btn-success btn-sm" onClick={() => approve(bank.id)}>Approve</button>
                      )}
                      {bank.approvedBy && (
                        <button
                          className={`btn btn-sm ${bank.isActive ? "btn-ghost" : "btn-success"}`}
                          style={bank.isActive ? { color: "var(--color-danger)" } : {}}
                          onClick={() => toggleStatus(bank.id, bank.isActive)}
                        >
                          {bank.isActive ? "Suspend" : "Reactivate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
