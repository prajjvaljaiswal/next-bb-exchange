"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";

const STATUS_COLOR = { PENDING_PAYMENT: "warning", ACTIVE: "success", FULFILLED: "info", EXPIRED: "danger" };

export default function PatientsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const bankId = user?.bloodBankId;

  const fetchPatients = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const params = new URLSearchParams({ bloodBankId: bankId });
      if (filterStatus) params.set("status", filterStatus);
      const data = await apiGet(`/patients?${params}`, { token: accessToken });
      setPatients(data.data || data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken, filterStatus]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Patients</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Patients registered with this blood bank</p>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{patients.length} patients</div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <select className="form-input" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["PENDING_PAYMENT","ACTIVE","FULFILLED","EXPIRED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilterStatus("")}>Clear</button>
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
                <th>Doctor</th>
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
                  <td style={{ fontSize: 13 }}>{p.doctorName}</td>
                  <td><Badge status={STATUS_COLOR[p.status] || "info"}>{p.status}</Badge></td>
                  <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
