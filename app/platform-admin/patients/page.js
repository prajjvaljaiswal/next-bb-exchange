"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";

const STATUS_COLOR = { PENDING_PAYMENT: "warning", ACTIVE: "success", FULFILLED: "info", EXPIRED: "danger" };

export default function AdminPatientsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchPatients = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      const data = await apiGet(`/patients?${params}`, { token: accessToken });
      setPatients(data.data || data);
      setTotal(data.meta?.total || (data.data || data).length);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, filterStatus]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>All Patients</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Platform-wide patient registry</p>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            className="form-input"
            placeholder="Search by name or patient ID..."
            style={{ flex: 1, minWidth: 200 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="form-input" style={{ width: 200 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {["PENDING_PAYMENT","ACTIVE","FULFILLED","EXPIRED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterStatus(""); setPage(1); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : patients.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No patients found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.patientDisplayId}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><BloodTag group={p.bloodGroup} /></td>
                  <td style={{ textAlign: "center" }}>{p.unitsRequired}</td>
                  <td style={{ fontSize: 13 }}>{p.hospitalName}</td>
                  <td><Badge status={STATUS_COLOR[p.status] || "info"}>{p.status}</Badge></td>
                  <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, alignSelf: "center" }}>Page {page} of {Math.ceil(total / PER_PAGE)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / PER_PAGE)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </>
  );
}
