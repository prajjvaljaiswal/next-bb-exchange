"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import BloodTag from "@/components/ui/BloodTag";

export default function AdminDonorsPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const toast = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchDonors = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (search) params.set("search", search);
      if (filterGroup) params.set("bloodGroup", filterGroup);
      const data = await apiGet(`/donors?${params}`, { token: accessToken });
      setDonors(data.data || data);
      setTotal(data.meta?.total || (data.data || data).length);
    } catch {
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, filterGroup]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) { setLoading(false); return; }
    fetchDonors();
  }, [fetchDonors, authLoading, accessToken]);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>All Donors</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Platform-wide donor registry</p>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            className="form-input"
            placeholder="Search by name or mobile..."
            style={{ flex: 1, minWidth: 200 }}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="form-input" style={{ width: 160 }} value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setPage(1); }}>
            <option value="">All Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterGroup(""); setPage(1); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : donors.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No donors found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mobile</th>
                <th>State</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {donors.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td><BloodTag group={d.bloodGroup} /></td>
                  <td style={{ textAlign: "center" }}>{d.age}</td>
                  <td style={{ fontSize: 13 }}>{d.sex}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{d.mobile}</td>
                  <td style={{ fontSize: 13 }}>{d.state}</td>
                  <td style={{ fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
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
