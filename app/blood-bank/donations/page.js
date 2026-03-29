"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Link from "next/link";

export default function DonationsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const bankId = user?.bloodBankId;
  const PER_PAGE = 20;

  const fetchDonations = useCallback(async () => {
    if (!bankId || !accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ bloodBankId: bankId, page, limit: PER_PAGE });
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      if (filterGroup) params.set("bloodGroup", filterGroup);
      const data = await apiGet(`/donations?${params}`, { token: accessToken });
      setDonations(data.data || data);
      setTotal(data.meta?.total || (data.data || data).length);
    } catch (err) {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken, page, filterFrom, filterTo, filterGroup]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Donation History</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>All recorded donations at this blood bank</p>
        </div>
        <Link href="/blood-bank/donations/new" className="btn btn-primary">+ Log Donation</Link>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>From</label>
            <input className="form-input" type="date" style={{ width: 160 }} value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>To</label>
            <input className="form-input" type="date" style={{ width: 160 }} value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>Blood Group</label>
            <select className="form-input" style={{ width: 140 }} value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setPage(1); }}>
              <option value="">All</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterFrom(""); setFilterTo(""); setFilterGroup(""); setPage(1); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : donations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
            No donations found.{" "}
            <Link href="/blood-bank/donations/new" style={{ color: "var(--color-blood)" }}>Log the first one</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Blood Group</th>
                <th>Patient</th>
                <th>Beneficiary Bank</th>
                <th>Unit No</th>
                <th>Cycle</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: 13 }}>{new Date(d.donationDate).toLocaleDateString("en-IN")}</td>
                  <td style={{ fontWeight: 600 }}>{d.donor?.name || "—"}</td>
                  <td><BloodTag group={d.donorCard?.bloodGroup} /></td>
                  <td style={{ fontSize: 13 }}>{d.patient?.name || "—"}</td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{d.beneficiaryBank?.name || "—"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{d.donorCard?.bloodUnitNo || "—"}</td>
                  <td>
                    {d.cycleDetected
                      ? <Badge status="success">Cycle ✓</Badge>
                      : <Badge status="info">Open</Badge>}
                  </td>
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
