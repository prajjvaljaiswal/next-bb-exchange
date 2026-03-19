"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

export default function AdminsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", designation: "", mobile: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  const bankId = user?.bloodBankId;

  const fetchAdmins = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const data = await apiGet(`/blood-banks/${bankId}/admins`, { token: accessToken });
      setAdmins(data);
    } catch (err) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  async function updateStatus(adminId, authStatus) {
    try {
      await apiPatch(`/blood-banks/${bankId}/admins/${adminId}/auth-status`, { authStatus }, { token: accessToken });
      toast.success("Status updated");
      fetchAdmins();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await apiPost(`/blood-banks/${bankId}/admins`, createForm, { token: accessToken });
      toast.success("Admin created");
      setShowCreateModal(false);
      setCreateForm({ name: "", designation: "", mobile: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin Management</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Manage blood bank staff accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Add Admin</button>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : admins.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No admins found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Status</th>
                <th>Primary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td style={{ fontWeight: 600 }}>{admin.name}</td>
                  <td style={{ color: "var(--color-ink-muted)", fontSize: 13 }}>{admin.designation}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{admin.mobile}</td>
                  <td style={{ fontSize: 13 }}>{admin.user?.email}</td>
                  <td><Badge status={admin.authStatus.toLowerCase()}>{admin.authStatus}</Badge></td>
                  <td>{admin.isPrimary ? <Badge status="info">Primary</Badge> : "—"}</td>
                  <td>
                    {!admin.isPrimary && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {admin.authStatus !== "ACTIVE" && (
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(admin.id, "ACTIVE")}>Activate</button>
                        )}
                        {admin.authStatus === "ACTIVE" && (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => updateStatus(admin.id, "SUSPENDED")}>Suspend</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Admin">
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Designation *</label>
              <input className="form-input" value={createForm.designation} onChange={e => setCreateForm({...createForm, designation: e.target.value})} required />
            </div>
            <div>
              <label className="form-label">Mobile *</label>
              <input className="form-input" value={createForm.mobile} onChange={e => setCreateForm({...createForm, mobile: e.target.value})} maxLength={10} required />
            </div>
          </div>
          <div>
            <label className="form-label">Login Email *</label>
            <input className="form-input" type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required />
          </div>
          <div>
            <label className="form-label">Temporary Password *</label>
            <input className="form-input" type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} minLength={8} required />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
