"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const STATUS_BADGE = {
  PENDING_TESTING: "pending",
  READY_FOR_SEPARATION: "info",
  SEPARATED: "active",
  FAILED_TTI: "suspended",
  EXPIRED: "inactive",
};

export default function WholeBloodPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ttiModal, setTtiModal] = useState(null);
  const [ttiForm, setTtiForm] = useState({ ttiSyphilis: "PENDING", ttiMalaria: "PENDING", ttiHIV: "PENDING", ttiHBV: "PENDING", ttiHCV: "PENDING" });
  const [submitting, setSubmitting] = useState(false);

  const bankId = user?.bloodBankId;

  const fetchItems = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const data = await apiGet(`/inventory/blood-banks/${bankId}/whole-blood`, { token: accessToken });
      setItems(data);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function submitTTI() {
    setSubmitting(true);
    try {
      await apiPatch(`/inventory/blood-banks/${bankId}/whole-blood/${ttiModal.id}/tti-results`, ttiForm, { token: accessToken });
      toast.success("TTI results recorded");
      setTtiModal(null);
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function separate(unitId) {
    try {
      await apiPatch(`/inventory/blood-banks/${bankId}/whole-blood/${unitId}/separate`, {}, { token: accessToken });
      toast.success("Blood separated to PRBC inventory");
      fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const TTI_FIELDS = ["ttiSyphilis", "ttiMalaria", "ttiHIV", "ttiHBV", "ttiHCV"];
  const TTI_LABELS = { ttiSyphilis: "Syphilis", ttiMalaria: "Malaria", ttiHIV: "HIV", ttiHBV: "HBV", ttiHCV: "HCV" };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Whole Blood Inventory</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>
          Collected donations awaiting TTI testing and component separation
        </p>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit No</th>
                <th>Donor Card</th>
                <th>Blood Group</th>
                <th>Collection Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{item.bloodUnitNo}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{item.donorCard?.donorCardDisplayId || "—"}</td>
                  <td><span className="blood-tag">{item.bloodGroup}</span></td>
                  <td style={{ fontSize: 13 }}>{new Date(item.dateOfCollection).toLocaleDateString("en-IN")}</td>
                  <td style={{ fontSize: 13 }}>{new Date(item.dateOfExpiration).toLocaleDateString("en-IN")}</td>
                  <td><Badge status={STATUS_BADGE[item.status] || "inactive"}>{item.status.replace(/_/g, " ")}</Badge></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {item.status === "PENDING_TESTING" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => {
                          setTtiModal(item);
                          setTtiForm({ ttiSyphilis: "PENDING", ttiMalaria: "PENDING", ttiHIV: "PENDING", ttiHBV: "PENDING", ttiHCV: "PENDING" });
                        }}>
                          Record TTI
                        </button>
                      )}
                      {item.status === "READY_FOR_SEPARATION" && (
                        <button className="btn btn-primary btn-sm" onClick={() => separate(item.id)}>Separate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--color-ink-muted)" }}>No whole blood units</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!ttiModal} onClose={() => setTtiModal(null)} title={`TTI Results — ${ttiModal?.bloodUnitNo}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-ink-muted)" }}>
            Record the TTI (Transfusion Transmissible Infections) test results for this unit.
          </p>
          {TTI_FIELDS.map(field => (
            <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>{TTI_LABELS[field]}</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["PENDING", "PASSED", "FAILED"].map(status => (
                  <label key={status} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={field}
                      value={status}
                      checked={ttiForm[field] === status}
                      onChange={() => setTtiForm(prev => ({ ...prev, [field]: status }))}
                    />
                    <span style={{ color: status === "PASSED" ? "var(--color-success)" : status === "FAILED" ? "var(--color-danger)" : "var(--color-ink-muted)" }}>
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setTtiModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitTTI} disabled={submitting}>
              {submitting ? "Saving..." : "Save Results"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
