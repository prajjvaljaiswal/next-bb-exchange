"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";
import Timeline from "@/components/ui/Timeline";

const STATUS_COLOR = { ISSUED: "warning", IN_TRANSIT: "info", DELIVERED: "success", DISCREPANCY: "danger" };

export default function FormBPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [forms, setForms] = useState([]);
  const [acceptedFormAs, setAcceptedFormAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [issuing, setIssuing] = useState(false);

  const [createForm, setCreateForm] = useState({
    formAId: "", unitDetails: "", transportMode: "", dispatchDate: "", expectedArrivalDate: "",
  });

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [bData, aData] = await Promise.all([
        apiGet(`/transfers/form-b?bloodBankId=${bankId}`, { token: accessToken }),
        apiGet(`/transfers/form-a?bloodBankId=${bankId}&status=ACCEPTED`, { token: accessToken }),
      ]);
      setForms(bData.data || bData);
      // Only Form As where this bank is the supplier (needs to dispatch)
      const accepted = (aData.data || aData).filter(f => f.supplierBankId === bankId && f.status === "ACCEPTED");
      setAcceptedFormAs(accepted);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleIssue(e) {
    e.preventDefault();
    setIssuing(true);
    try {
      const unitIds = createForm.unitDetails.split(",").map(s => s.trim()).filter(Boolean);
      await apiPost("/transfers/form-b", {
        formAId: createForm.formAId,
        supplierBankId: bankId,
        unitDetails: unitIds,
        transportDetails: { mode: createForm.transportMode },
        dispatchDate: createForm.dispatchDate,
        expectedArrivalDate: createForm.expectedArrivalDate,
      }, { token: accessToken });
      toast.success("Form B issued");
      setShowCreate(false);
      setCreateForm({ formAId: "", unitDetails: "", transportMode: "", dispatchDate: "", expectedArrivalDate: "" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIssuing(false);
    }
  }

  async function confirmReceipt(formId) {
    try {
      await apiPatch(`/transfers/form-b/${formId}/receive`, { unitsReceived: selectedForm?.unitCount || 1 }, { token: accessToken });
      toast.success("Receipt confirmed");
      setSelectedForm(null);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Transfer Form B</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Dispatch notes for physical blood unit transfers</p>
        </div>
        {acceptedFormAs.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Issue Form B</button>
        )}
      </div>

      {acceptedFormAs.length > 0 && (
        <div style={{ background: "var(--color-warning-bg, #fffbeb)", border: "1px solid var(--color-warning)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <strong>Action required:</strong> {acceptedFormAs.length} accepted Form A{acceptedFormAs.length !== 1 ? "s" : ""} awaiting dispatch.
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : forms.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No Form B records yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Form ID</th>
                <th>Direction</th>
                <th>Other Bank</th>
                <th>Blood Group</th>
                <th>Dispatch</th>
                <th>ETA</th>
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
                    <td><Badge status={isRecipient ? "info" : "warning"}>{isRecipient ? "Incoming" : "Outgoing"}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{isRecipient ? form.supplierBank?.name : form.recipientBank?.name}</td>
                    <td><BloodTag group={form.formA?.bloodGroup} /></td>
                    <td style={{ fontSize: 13 }}>{new Date(form.dispatchDate).toLocaleDateString("en-IN")}</td>
                    <td style={{ fontSize: 13 }}>{new Date(form.expectedArrivalDate).toLocaleDateString("en-IN")}</td>
                    <td><Badge status={STATUS_COLOR[form.status] || "info"}>{form.status}</Badge></td>
                    <td>
                      {isRecipient && form.status === "IN_TRANSIT" && (
                        <button className="btn btn-success btn-sm" onClick={() => { setSelectedForm(form); confirmReceipt(form.id); }}>Confirm Receipt</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Issue Form B — Dispatch Note">
        <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="form-label">Form A Reference *</label>
            <select className="form-input" value={createForm.formAId} onChange={e => setCreateForm({ ...createForm, formAId: e.target.value })} required>
              <option value="">Select accepted Form A...</option>
              {acceptedFormAs.map(f => (
                <option key={f.id} value={f.id}>{f.formDisplayId} — {f.recipientBank?.name} ({f.bloodGroup}, {f.unitsRequested} units)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">PRBC Unit IDs (comma-separated) *</label>
            <textarea className="form-input" rows={3} placeholder="UNIT-001, UNIT-002..." value={createForm.unitDetails} onChange={e => setCreateForm({ ...createForm, unitDetails: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Transport Mode</label>
            <input className="form-input" placeholder="e.g. Refrigerated Van, Ambulance" value={createForm.transportMode} onChange={e => setCreateForm({ ...createForm, transportMode: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Dispatch Date *</label>
              <input className="form-input" type="date" value={createForm.dispatchDate} onChange={e => setCreateForm({ ...createForm, dispatchDate: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Expected Arrival *</label>
              <input className="form-input" type="date" value={createForm.expectedArrivalDate} onChange={e => setCreateForm({ ...createForm, expectedArrivalDate: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={issuing}>{issuing ? "Issuing..." : "Issue Form B"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
