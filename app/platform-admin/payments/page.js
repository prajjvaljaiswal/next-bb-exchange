"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const TYPE_LABEL = {
  PATIENT_REGISTRATION: "Patient Reg",
  TRANSFER_FEE: "Transfer Fee",
  CYCLE_REFUND: "Cycle Refund",
  PRBC_FEE: "PRBC Fee",
  SERVICE_CHARGE: "Service Charge",
};

const STATUS_COLOR = { CREATED: "warning", CAPTURED: "success", REFUNDED: "info", FAILED: "danger" };

export default function AdminPaymentsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [refundModal, setRefundModal] = useState(null);
  const [refunding, setRefunding] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 25;

  const fetchPayments = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (filterType) params.set("paymentType", filterType);
      if (filterStatus) params.set("status", filterStatus);
      const data = await apiGet(`/payments?${params}`, { token: accessToken });
      setPayments(data.data || data);
      setTotal(data.meta?.total || (data.data || data).length);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, filterType, filterStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  async function handleRefund(paymentId) {
    setRefunding(true);
    try {
      await apiPost(`/payments/${paymentId}/refund`, {}, { token: accessToken });
      toast.success("Refund initiated");
      setRefundModal(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRefunding(false);
    }
  }

  const captured = payments.filter(p => p.status === "CAPTURED").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>All Payments</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Platform-wide payment ledger</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Total Captured</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)" }}>₹{(captured / 100).toLocaleString("en-IN")}</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select className="form-input" style={{ width: 200 }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="form-input" style={{ width: 160 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {["CREATED","CAPTURED","REFUNDED","FAILED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterType(""); setFilterStatus(""); setPage(1); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No payment records</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Razorpay ID</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.paymentDisplayId}</td>
                  <td><Badge status="info">{TYPE_LABEL[p.paymentType] || p.paymentType}</Badge></td>
                  <td style={{ fontWeight: 700 }}>₹{((p.amount || 0) / 100).toLocaleString("en-IN")}</td>
                  <td><Badge status={STATUS_COLOR[p.status] || "info"}>{p.status}</Badge></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink-muted)" }}>{p.razorpayPaymentId || "—"}</td>
                  <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    {p.status === "CAPTURED" && (
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => setRefundModal(p)}>Refund</button>
                    )}
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

      {refundModal && (
        <Modal open={!!refundModal} onClose={() => setRefundModal(null)} title="Issue Refund">
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Issue refund for payment <strong style={{ fontFamily: "var(--font-mono)" }}>{refundModal.paymentDisplayId}</strong>?</p>
            <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 800 }}>₹{((refundModal.amount || 0) / 100).toLocaleString("en-IN")}</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-ink-muted)" }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setRefundModal(null)}>Cancel</button>
            <button className="btn btn-primary" style={{ background: "var(--color-danger)" }} disabled={refunding} onClick={() => handleRefund(refundModal.id)}>
              {refunding ? "Processing..." : "Confirm Refund"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
