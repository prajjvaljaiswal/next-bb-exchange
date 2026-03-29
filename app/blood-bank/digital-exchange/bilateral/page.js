"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";

export default function BilateralExchangePage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropose, setShowPropose] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [executing, setExecuting] = useState(null);

  const [propose, setPropose] = useState({ receivableId: "", deliverableId: "" });

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [hist, recv, deliv] = await Promise.all([
        apiGet(`/digital-exchange/history/${bankId}?type=BILATERAL`, { token: accessToken }),
        apiGet(`/balance-sheet/blood-banks/${bankId}/receivables`, { token: accessToken }),
        apiGet(`/balance-sheet/blood-banks/${bankId}/deliverables`, { token: accessToken }),
      ]);
      setHistory(hist.data || hist);
      setReceivables((recv.data || recv).filter(r => r.status === "ACTIVE"));
      setDeliverables((deliv.data || deliv).filter(d => d.status === "ACTIVE"));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handlePropose(e) {
    e.preventDefault();
    setProposing(true);
    try {
      const result = await apiPost("/digital-exchange/bilateral/propose", {
        initiatedByBankId: bankId,
        receivableEntryId: propose.receivableId,
        deliverableEntryId: propose.deliverableId,
      }, { token: accessToken });
      // Auto-execute
      await apiPost(`/digital-exchange/bilateral/execute/${result.id}`, {}, { token: accessToken });
      toast.success("Bilateral exchange executed");
      setShowPropose(false);
      setPropose({ receivableId: "", deliverableId: "" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProposing(false);
    }
  }

  const STATUS_COLOR = { PROPOSED: "warning", CONSENTED: "info", EXECUTED: "success", REJECTED: "danger" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Bilateral Digital Exchange</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Swap mutual liabilities with another blood bank digitally</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPropose(true)}>Propose Exchange</button>
      </div>

      <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13 }}>
        <strong>How it works:</strong> If Bank A owes blood to Bank B and Bank B owes blood to Bank A, this swap cancels the mutual obligations without any physical transfer. No fee is charged.
      </div>

      {/* Balance positions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="panel" style={{ padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Active Receivables ({receivables.length})</h4>
          {receivables.length === 0 ? <div style={{ color: "var(--color-ink-muted)", fontSize: 13 }}>None</div> : receivables.slice(0, 5).map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 13 }}>{r.debtorBank?.name}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <BloodTag group={r.bloodGroup} />
                <span style={{ fontSize: 12, color: "var(--color-success)", fontWeight: 700 }}>+{r.units}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="panel" style={{ padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Active Deliverables ({deliverables.length})</h4>
          {deliverables.length === 0 ? <div style={{ color: "var(--color-ink-muted)", fontSize: 13 }}>None</div> : deliverables.slice(0, 5).map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 13 }}>{d.creditorBank?.name}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <BloodTag group={d.bloodGroup} />
                <span style={{ fontSize: 12, color: "var(--color-danger)", fontWeight: 700 }}>-{d.units}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Exchange History</h3>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--color-ink-muted)" }}>No bilateral exchanges yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Participants</th><th>Entries Swapped</th><th>Status</th></tr>
            </thead>
            <tbody>
              {history.map(ev => (
                <tr key={ev.id}>
                  <td style={{ fontSize: 13 }}>{new Date(ev.createdAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ fontSize: 13 }}>{ev.participantBankIds?.length || 2} banks</td>
                  <td style={{ fontSize: 13 }}>{ev.balanceSheetChanges?.length || "—"} entries</td>
                  <td><Badge status={STATUS_COLOR[ev.status] || "info"}>{ev.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showPropose} onClose={() => setShowPropose(false)} title="Propose Bilateral Exchange">
        <form onSubmit={handlePropose} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-ink-muted)" }}>Select a receivable and a deliverable of equal blood group to swap.</p>
          <div>
            <label className="form-label">Receivable (owed to us) *</label>
            <select className="form-input" value={propose.receivableId} onChange={e => setPropose({ ...propose, receivableId: e.target.value })} required>
              <option value="">Select receivable...</option>
              {receivables.map(r => (
                <option key={r.id} value={r.id}>{r.debtorBank?.name} owes {r.units}u {r.bloodGroup}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Deliverable (we owe) *</label>
            <select className="form-input" value={propose.deliverableId} onChange={e => setPropose({ ...propose, deliverableId: e.target.value })} required>
              <option value="">Select deliverable...</option>
              {deliverables.map(d => (
                <option key={d.id} value={d.id}>We owe {d.units}u {d.bloodGroup} to {d.creditorBank?.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowPropose(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={proposing}>{proposing ? "Executing..." : "Execute Exchange"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
