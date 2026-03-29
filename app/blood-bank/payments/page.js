"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";

const TYPE_LABEL = {
  PATIENT_REGISTRATION: "Patient Reg",
  TRANSFER_FEE: "Transfer Fee",
  CYCLE_REFUND: "Cycle Refund",
  PRBC_FEE: "PRBC Fee",
  SERVICE_CHARGE: "Service Charge",
};

const STATUS_COLOR = { CREATED: "warning", CAPTURED: "success", REFUNDED: "info", FAILED: "danger" };

export default function PaymentsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const bankId = user?.bloodBankId;

  const fetchPayments = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const params = new URLSearchParams({ bloodBankId: bankId });
      if (filterType) params.set("paymentType", filterType);
      if (filterStatus) params.set("status", filterStatus);
      const data = await apiGet(`/payments?${params}`, { token: accessToken });
      setPayments(data.data || data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken, filterType, filterStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const total = payments.filter(p => p.status === "CAPTURED").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Payments</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Payment history for this blood bank</p>
        </div>
        {total > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Total Captured</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)" }}>₹{(total / 100).toLocaleString("en-IN")}</div>
          </div>
        )}
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select className="form-input" style={{ width: 200 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="form-input" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["CREATED","CAPTURED","REFUNDED","FAILED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterType(""); setFilterStatus(""); }}>Clear</button>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
