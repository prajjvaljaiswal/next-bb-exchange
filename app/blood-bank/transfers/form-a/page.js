"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";

const URGENCY_OPTS = ["ROUTINE","URGENT","EMERGENCY"];
const STATUS_COLOR = { SENT: "warning", ACKNOWLEDGED: "info", ACCEPTED: "success", REJECTED: "danger", CANCELLED: "danger", FULFILLED: "info" };

export default function FormAPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [forms, setForms] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [responding, setResponding] = useState(false);

  const [createForm, setCreateForm] = useState({
    recipientBankId: "", patientId: "", bloodGroup: "A+",
    unitsRequested: 1, urgencyLevel: "ROUTINE",
  });
  const [creating, setCreating] = useState(false);

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [formsData, banksData] = await Promise.all([
        apiGet(`/transfers/form-a?bloodBankId=${bankId}`, { token: accessToken }),
        apiGet("/blood-banks?approved=true", { token: accessToken }),
      ]);
      setForms(formsData.data || formsData);
      setBanks((banksData.data || banksData).filter(b => b.id !== bankId));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await apiPost("/transfers/form-a", { ...createForm, supplierBankId: bankId }, { token: accessToken });
      toast.success("Form A sent");
      setShowCreate(false);
      setCreateForm({ recipientBankId: "", patientId: "", bloodGroup: "A+", unitsRequested: 1, urgencyLevel: "ROUTINE" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function respond(formId, status, unitsCommitted = 0, rejectionReason = "") {
    setResponding(true);
    try {
      await apiPatch(`/transfers/form-a/${formId}/respond`, { status, unitsCommitted, rejectionReason }, { token: accessToken });
      toast.success("Response submitted");
      setSelectedForm(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResponding(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Transfer Form A</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Blood unit transfer requests sent and received</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Send Form A</button>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : forms.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No Form A requests yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Form ID</th>
                <th>Direction</th>
                <th>Other Bank</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(form => {
                const isRecipient = form.recipientBankId === bankId;
                return (
                  <tr key={form.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{form.formDisplayId}</td>
                    <td>
                      <Badge status={isRecipient ? "info" : "warning"}>{isRecipient ? "Incoming" : "Outgoing"}</Badge>
                    </td>
                    <td style={{ fontWeight: 600 }}>{isRecipient ? form.supplierBank?.name : form.recipientBank?.name}</td>
                    <td><BloodTag group={form.bloodGroup} /></td>
                    <td style={{ textAlign: "center" }}>{form.unitsRequested}</td>
                    <td><Badge status={form.urgencyLevel === "EMERGENCY" ? "danger" : form.urgencyLevel === "URGENT" ? "warning" : "info"}>{form.urgencyLevel}</Badge></td>
                    <td><Badge status={STATUS_COLOR[form.status] || "info"}>{form.status}</Badge></td>
                    <td>
                      {isRecipient && form.status === "SENT" && (
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedForm(form)}>Respond</button>
                      )}
                      {!isRecipient && form.status === "SENT" && (
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => respond(form.id, "CANCELLED")}>Cancel</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Send Form A — Request Blood">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="form-label">Supplier Blood Bank *</label>
            <select className="form-input" value={createForm.recipientBankId} onChange={e => setCreateForm({ ...createForm, recipientBankId: e.target.value })} required>
              <option value="">Select bank...</option>
              {banks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Blood Group *</label>
              <select className="form-input" value={createForm.bloodGroup} onChange={e => setCreateForm({ ...createForm, bloodGroup: e.target.value })}>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Units *</label>
              <input className="form-input" type="number" min={1} max={50} value={createForm.unitsRequested} onChange={e => setCreateForm({ ...createForm, unitsRequested: parseInt(e.target.value) })} required />
            </div>
          </div>
          <div>
            <label className="form-label">Urgency Level</label>
            <select className="form-input" value={createForm.urgencyLevel} onChange={e => setCreateForm({ ...createForm, urgencyLevel: e.target.value })}>
              {URGENCY_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Patient ID (optional)</label>
            <input className="form-input" placeholder="PAT-..." value={createForm.patientId} onChange={e => setCreateForm({ ...createForm, patientId: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? "Sending..." : "Send Form A"}</button>
          </div>
        </form>
      </Modal>

      {/* Respond Modal */}
      {selectedForm && (
        <Modal open={!!selectedForm} onClose={() => setSelectedForm(null)} title={`Respond to ${selectedForm.formDisplayId}`}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <div><span style={{ color: "var(--color-ink-muted)", fontSize: 12 }}>Requested by</span><div style={{ fontWeight: 600 }}>{selectedForm.supplierBank?.name}</div></div>
              <div><span style={{ color: "var(--color-ink-muted)", fontSize: 12 }}>Blood Group</span><div><BloodTag group={selectedForm.bloodGroup} /></div></div>
              <div><span style={{ color: "var(--color-ink-muted)", fontSize: 12 }}>Units</span><div style={{ fontWeight: 600 }}>{selectedForm.unitsRequested}</div></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} disabled={responding} onClick={() => respond(selectedForm.id, "REJECTED", 0, "Cannot fulfill at this time")}>Reject</button>
            <button className="btn btn-primary" disabled={responding} onClick={() => respond(selectedForm.id, "ACCEPTED", selectedForm.unitsRequested)}>{responding ? "Submitting..." : "Accept"}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
