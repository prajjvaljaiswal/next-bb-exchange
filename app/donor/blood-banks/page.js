"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { INDIAN_STATES } from "@/lib/constants";

function PRBCSummary({ bankId, accessToken }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/inventory/blood-banks/${bankId}/prbc/summary`, { token: accessToken })
      .then(d => setSummary(d.data || d))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [bankId, accessToken]);

  if (loading) return <div style={{ fontSize: 12, color: "var(--color-ink-muted)", padding: "8px 0" }}>Loading inventory...</div>;

  const groupMap = summary?.summary || {};
  const available = Object.entries(groupMap)
    .map(([group, statuses]) => ({ group, count: statuses.AVAILABLE || 0 }))
    .filter(g => g.count > 0);

  if (available.length === 0) return <div style={{ fontSize: 12, color: "var(--color-ink-muted)", padding: "8px 0" }}>No PRBC units currently available</div>;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 6 }}>Available PRBC Units</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {available.map(({ group, count }) => (
          <div key={group} style={{
            background: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: 6, padding: "3px 10px",
            fontSize: 12, fontWeight: 700,
            color: "var(--color-blood)",
          }}>
            {group}: {count}
          </div>
        ))}
      </div>
      {summary?.expiryWarning > 0 && (
        <div style={{ fontSize: 11, color: "#C2410C", marginTop: 6 }}>
          ⚠ {summary.expiryWarning} unit(s) expiring within 7 days
        </div>
      )}
    </div>
  );
}

export default function DonorBloodBanksPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [expandedBank, setExpandedBank] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchBanks = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ isActive: "true", page, limit: "20" });
      if (search) params.set("search", search);
      if (stateFilter) params.set("state", stateFilter);
      const data = await apiGet(`/blood-banks?${params}`, { token: accessToken });
      setBanks(data.data || data.items || data);
      setMeta(data.meta || null);
    } catch {
      toast.error("Failed to load blood banks");
    } finally {
      setLoading(false);
    }
  }, [accessToken, search, stateFilter, page]);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchBanks();
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Search Blood Banks</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>
          Find registered blood banks — view their location, contact, and available PRBC inventory
        </p>
      </div>

      {/* Search + Filter */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>Search by Name or City</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. City Blood Bank, Mumbai..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>State / UT</label>
            <select className="form-input" value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1); }}>
              <option value="">All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => { setSearch(""); setStateFilter(""); setPage(1); }}>
            Clear
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
          Searching blood banks...
        </div>
      ) : banks.length === 0 ? (
        <div className="panel" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
          <h3 style={{ margin: "0 0 8px" }}>No blood banks found</h3>
          <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 14 }}>Try a different search term or state filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {banks.map(bank => (
            <div key={bank.id} className="panel" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{bank.name}</div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--color-ink-muted)" }}>
                    <span>
                      <strong style={{ color: "var(--color-ink)" }}>City:</strong> {bank.city || "—"}
                    </span>
                    <span>
                      <strong style={{ color: "var(--color-ink)" }}>State:</strong> {bank.state || "—"}
                    </span>
                    <span>
                      <strong style={{ color: "var(--color-ink)" }}>Contact:</strong>{" "}
                      <a href={`tel:${bank.contactMobile}`} style={{ color: "var(--color-blood)", textDecoration: "none", fontWeight: 600 }}>
                        {bank.contactMobile}
                      </a>
                    </span>
                    <span>
                      <strong style={{ color: "var(--color-ink)" }}>Email:</strong>{" "}
                      <a href={`mailto:${bank.email}`} style={{ color: "var(--color-blood)", textDecoration: "none" }}>
                        {bank.email}
                      </a>
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                    Reg. No: {bank.registrationNo}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setExpandedBank(expandedBank === bank.id ? null : bank.id)}
                  style={{ flexShrink: 0 }}
                >
                  {expandedBank === bank.id ? "Hide Inventory" : "View Inventory"}
                </button>
              </div>

              {expandedBank === bank.id && (
                <PRBCSummary bankId={bank.id} accessToken={accessToken} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: "var(--color-ink-muted)", display: "flex", alignItems: "center" }}>
            Page {page} of {meta.totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
