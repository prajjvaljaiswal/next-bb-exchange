"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";

export default function UnilateralExchangePage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [pending, setPending] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropose, setShowPropose] = useState(false);
  const [proposing, setProposing] = useState(false);

  const [propose, setPropose] = useState({ deliverableId: "", takerBankId: "" });

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [hist, deliv, banksData] = await Promise.all([
        apiGet(`/digital-exchange/history/${bankId}?type=UNILATERAL`, { token: accessToken }),
        apiGet(`/balance-sheet/blood-banks/${bankId}/deliverables`, { token: accessToken }),
        apiGet("/blood-banks?approved=true", { token: accessToken }),
      ]);
      const allHist = hist.data || hist;
      setHistory(allHist.filter(e => e.status === "EXECUTED"));
      setPending(allHist.filter(e => e.status === "PROPOSED" || e.status === "CONSENTED"));
      setDeliverables((deliv.data || deliv).filter(d => d.status === "ACTIVE"));
      setBanks((banksData.data || banksData).filter(b => b.id !== bankId));
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
      const result = await apiPost("/digital-exchange/unilateral/propose", {
        initiatedByBankId: bankId,
        deliverableEntryId: propose.deliverableId,
        takerBankId: propose.takerBankId,
      }, { token: accessToken });
      toast.success("Transfer proposed — awaiting consent");
      setShowPropose(false);
      setPropose({ deliverableId: "", takerBankId: "" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProposing(false);
    }
  }

  async function consent(eventId) {
    try {
      await apiPost(`/digital-exchange/unilateral/consent/${eventId}`, {}, { token: accessToken });
      toast.success("Consent given");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function execute(eventId) {
    try {
      await apiPost(`/digital-exchange/unilateral/execute/${eventId}`, {}, { token: accessToken });
      toast.success("Transfer executed");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const STATUS_COLOR = { PROPOSED: "warning", CONSENTED: "info", EXECUTED: "success", REJECTED: "danger" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Unilateral Digital Exchange</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Transfer a liability to another blood bank with their consent</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPropose(true)}>Propose Transfer</button>
      </div>

      <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13 }}>
        <strong>How it works:</strong> Bank F1 can transfer its obligation to Bank L1 to Bank F2, if F2 consents. After execution, F2 owes blood to L1 instead of F1.
      </div>

      {/* Pending actions */}
      {pending.length > 0 && (
        <div className="panel" style={{ marginBottom: 20, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--color-warning)", textTransform: "uppercase" }}>Pending ({pending.length})</h4>
          {pending.map(ev => (
            <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <Badge status={STATUS_COLOR[ev.status]}>{ev.status}</Badge>
                <span style={{ marginLeft: 10, fontSize: 13, color: "var(--color-ink-muted)" }}>Created {new Date(ev.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {ev.status === "PROPOSED" && ev.participantBankIds?.includes(bankId) && ev.initiatedByBankId !== bankId && (
                  <button className="btn btn-primary btn-sm" onClick={() => consent(ev.id)}>Give Consent</button>
                )}
                {ev.status === "CONSENTED" && ev.initiatedByBankId === bankId && (
                  <button className="btn btn-success btn-sm" onClick={() => execute(ev.id)}>Execute</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Executed Transfers</h3>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--color-ink-muted)" }}>No unilateral transfers yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Participants</th><th>Status</th></tr>
            </thead>
            <tbody>
              {history.map(ev => (
                <tr key={ev.id}>
                  <td style={{ fontSize: 13 }}>{new Date(ev.createdAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ fontSize: 13 }}>{ev.participantBankIds?.length || 3} banks</td>
                  <td><Badge status="success">EXECUTED</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showPropose} onClose={() => setShowPropose(false)} title="Propose Liability Transfer">
        <form onSubmit={handlePropose} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="form-label">Select Deliverable to Transfer *</label>
            <select className="form-input" value={propose.deliverableId} onChange={e => setPropose({ ...propose, deliverableId: e.target.value })} required>
              <option value="">Select deliverable...</option>
              {deliverables.map(d => (
                <option key={d.id} value={d.id}>We owe {d.units}u {d.bloodGroup} to {d.creditorBank?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Transfer Obligation To *</label>
            <select className="form-input" value={propose.takerBankId} onChange={e => setPropose({ ...propose, takerBankId: e.target.value })} required>
              <option value="">Select bank...</option>
              {banks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
            </select>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-muted)" }}>The selected bank will be notified and must give consent before the transfer is executed.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowPropose(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={proposing}>{proposing ? "Proposing..." : "Send Proposal"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
