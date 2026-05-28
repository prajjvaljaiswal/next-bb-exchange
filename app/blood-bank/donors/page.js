"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";
import { BLOOD_GROUPS, INDIAN_STATES } from "@/lib/constants";

const EMPTY_FORM = {
  name: "", age: "", sex: "Male", nationality: "Indian",
  mobile: "", email: "",
  weight: "", bloodGroup: "O_POS",
  address: "", state: "", pincode: "",
  bankAccountName: "", bankAccountNo: "", bankAccountIFSC: "", bankAccountUPI: "",
};

const SEX_OPTIONS = ["Male", "Female", "Other"];

export default function BloodBankDonorsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Register modal
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Edit modal
  const [editDonor, setEditDonor] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  const bankId = user?.bloodBankId;

  const fetchDonors = useCallback(async () => {
    if (!bankId || !accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ bankId });
      if (search) params.set("search", search);
      const data = await apiGet(`/donors?${params}`, { token: accessToken });
      setDonors(data.data || data);
    } catch {
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken, search]);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  function setReg(field, val) { setRegForm(p => ({ ...p, [field]: val })); }
  function setEdit(field, val) { setEditForm(p => ({ ...p, [field]: val })); }

  async function handleRegister() {
    if (!regForm.name || !regForm.age || !regForm.mobile || !regForm.weight || !regForm.bloodGroup || !regForm.address || !regForm.state || !regForm.pincode) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    try {
      await apiPost("/donors", regForm, { token: accessToken });
      toast.success("Donor registered. Authenticate to activate their account.");
      setShowRegister(false);
      setRegForm(EMPTY_FORM);
      fetchDonors();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(donor) {
    setEditDonor(donor);
    setEditForm({
      name: donor.name || "",
      age: String(donor.age || ""),
      sex: donor.sex || "Male",
      nationality: donor.nationality || "Indian",
      mobile: donor.mobile || "",
      email: donor.email || "",
      weight: String(donor.weight || ""),
      bloodGroup: donor.bloodGroup || "O_POS",
      address: donor.address || "",
      state: donor.state || "",
      pincode: donor.pincode || "",
      bankAccountName: donor.bankAccountName || "",
      bankAccountNo: donor.bankAccountNo || "",
      bankAccountIFSC: donor.bankAccountIFSC || "",
      bankAccountUPI: donor.bankAccountUPI || "",
    });
  }

  async function handleEdit() {
    if (!editForm.name || !editForm.age || !editForm.mobile || !editForm.weight) {
      toast.error("Please fill all required fields"); return;
    }
    setEditing(true);
    try {
      await apiPatch(`/donors/${editDonor.id}`, editForm, { token: accessToken });
      toast.success("Donor details updated");
      setEditDonor(null);
      fetchDonors();
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setEditing(false);
    }
  }

  async function handleAuthStatus(donor, isActive) {
    try {
      await apiPatch(`/donors/${donor.id}/auth-status`, { isActive }, { token: accessToken });
      toast.success(isActive ? "Donor authenticated and activated" : "Donor suspended");
      fetchDonors();
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  }

  const DonorForm = ({ form, setField, label }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Personal Details</div>
      <div>
        <label className="form-label">Full Name *</label>
        <input className="form-input" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="As per government ID" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div>
          <label className="form-label">Age *</label>
          <input className="form-input" type="number" value={form.age} onChange={e => setField("age", e.target.value)} placeholder="18–65" min="18" max="65" />
        </div>
        <div>
          <label className="form-label">Sex *</label>
          <select className="form-input" value={form.sex} onChange={e => setField("sex", e.target.value)}>
            {SEX_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Nationality</label>
          <input className="form-input" value={form.nationality} onChange={e => setField("nationality", e.target.value)} placeholder="Indian" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="form-label">Contact Mobile No. *</label>
          <input className="form-input" value={form.mobile} onChange={e => setField("mobile", e.target.value)} placeholder="10-digit" maxLength={10} />
        </div>
        <div>
          <label className="form-label">Email ID</label>
          <input className="form-input" type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="donor@email.com" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="form-label">Weight (kg) *</label>
          <input className="form-input" type="number" value={form.weight} onChange={e => setField("weight", e.target.value)} placeholder="Min. 50" min="50" />
        </div>
        <div>
          <label className="form-label">Blood Group *</label>
          <select className="form-input" value={form.bloodGroup} onChange={e => setField("bloodGroup", e.target.value)}>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Address</div>
      <div>
        <label className="form-label">Address *</label>
        <textarea className="form-input" value={form.address} onChange={e => setField("address", e.target.value)} placeholder="Full address" rows={2} style={{ resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="form-label">State/UT *</label>
          <select className="form-input" value={form.state} onChange={e => setField("state", e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Pincode *</label>
          <input className="form-input" value={form.pincode} onChange={e => setField("pincode", e.target.value)} placeholder="6-digit" maxLength={6} />
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Bank Account Details</div>
      <div>
        <label className="form-label">Name of Bank</label>
        <input className="form-input" value={form.bankAccountName} onChange={e => setField("bankAccountName", e.target.value)} placeholder="Bank name" />
      </div>
      <div>
        <label className="form-label">Account No.</label>
        <input className="form-input" value={form.bankAccountNo} onChange={e => setField("bankAccountNo", e.target.value)} placeholder="Account number" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label className="form-label">IFSC Code</label>
          <input className="form-input" value={form.bankAccountIFSC} onChange={e => setField("bankAccountIFSC", e.target.value)} placeholder="IFSC code" />
        </div>
        <div>
          <label className="form-label">UPI ID</label>
          <input className="form-input" value={form.bankAccountUPI} onChange={e => setField("bankAccountUPI", e.target.value)} placeholder="name@upi" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Donors</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Register and manage donors for this blood bank</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRegister(true)}>+ Register New Donor</button>
      </div>

      <div className="panel" style={{ marginBottom: 16, padding: 16 }}>
        <input
          className="form-input"
          placeholder="Search by name, mobile, email or Donor ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div className="panel" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : donors.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--color-ink-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
            <div>No donors registered yet. Click &quot;Register New Donor&quot; to add one.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Mobile</th>
                <th>Nationality</th>
                <th>State</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map(d => {
                const isActive = d.user?.isActive;
                return (
                  <tr key={d.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{d.donorDisplayId || `D-${d.id.slice(0, 8).toUpperCase()}`}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><BloodTag group={d.bloodGroup} /></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{d.mobile}</td>
                    <td style={{ fontSize: 13 }}>{d.nationality || "Indian"}</td>
                    <td style={{ fontSize: 13 }}>{d.state}</td>
                    <td>
                      <Badge status={isActive ? "success" : "warning"}>
                        {isActive ? "Active" : "Pending Auth"}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>Edit</button>
                        {isActive ? (
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => handleAuthStatus(d, false)}>Suspend</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAuthStatus(d, true)}>Authenticate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <Modal open={showRegister} onClose={() => setShowRegister(false)} title="Register New Donor" width={560}>
          <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
            <DonorForm form={regForm} setField={setReg} label="Register" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
            <button className="btn btn-ghost" onClick={() => setShowRegister(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleRegister}>
              {saving ? "Registering..." : "Register Donor"}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editDonor && (
        <Modal open={!!editDonor} onClose={() => setEditDonor(null)} title={`Edit Donor — ${editDonor.name}`} width={560}>
          <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
            <DonorForm form={editForm} setField={setEdit} label="Update" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
            <button className="btn btn-ghost" onClick={() => setEditDonor(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={editing} onClick={handleEdit}>
              {editing ? "Saving..." : "Save & Update"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
