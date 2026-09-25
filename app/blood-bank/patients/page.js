"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import Modal from "@/components/ui/Modal";
import { BLOOD_GROUPS, INDIAN_STATES } from "@/lib/constants";

const STATUS_COLOR = { PENDING_PAYMENT: "warning", ACTIVE: "success", FULFILLED: "info", EXPIRED: "danger" };

const HOSPITAL_TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
];

const EMPTY_FORM = {
  name: "", age: "", sex: "Male", bloodGroup: "O+", unitsRequired: "1",
  disease: "",
  address: "", district: "", state: "", nationality: "Indian",
  hospitalName: "", hospitalType: "PRIVATE", doctorName: "",
  contactPerson1: "", contactPerson2: "", contactPerson3: "",
  mobile: "", email: "",
  bankAccountName: "", bankAccountNo: "", bankAccountIFSC: "", bankAccountUPI: "",
};

function PrintView({ patient, onClose }) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 32, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ borderBottom: "3px solid #B91C1C", paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#B91C1C" }}>BloodBankGroup.com</div>
        <div style={{ fontSize: 13, color: "#555" }}>Patient Registration — BloodBankGroup.com</div>
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Patient Details</div>

      {[
        ["Patient ID", patient.patientDisplayId],
        ["Name", patient.name],
        ["Age / Sex", `${patient.age} / ${patient.sex}`],
        ["Blood Group", patient.bloodGroup],
        ["Units Required", patient.unitsRequired],
        ["Hospital", `${patient.hospitalName}${patient.hospitalType ? ` (${patient.hospitalType === "GOVERNMENT" ? "Government" : "Private"})` : ""}`],
        ["Doctor", patient.doctorName || "—"],
        ["Disease", patient.disease || "—"],
        ["Address", patient.address || "—"],
        ["District", patient.district || "—"],
        ["State", patient.state || "—"],
        ["Mobile", patient.mobile],
        ["Email", patient.email || "—"],
        ["Emergency Contact 1", patient.contactPerson1 || "—"],
        ["Emergency Contact 2", patient.contactPerson2 || "—"],
        ["Emergency Contact 3", patient.contactPerson3 || "—"],
        ["Registered Blood Bank", patient.registeredBloodBank?.name || "—"],
        ["Status", patient.status],
        ["Registered On", new Date(patient.createdAt).toLocaleDateString("en-IN")],
      ].map(([label, value]) => (
        <div key={label} style={{ display: "flex", borderBottom: "1px solid #eee", padding: "7px 0", fontSize: 14 }}>
          <div style={{ width: 200, color: "#666", flexShrink: 0 }}>{label}</div>
          <div style={{ fontWeight: 600 }}>{value}</div>
        </div>
      ))}

      <div style={{ marginTop: 32, fontSize: 11, color: "#999" }}>
        Printed from BloodBankGroup.com — India&apos;s Paperless Blood Exchange Network
      </div>

      <div style={{ marginTop: 16 }} className="no-print">
        <button onClick={onClose} style={{ padding: "8px 20px", cursor: "pointer" }}>Close Print View</button>
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}

export default function PatientsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Edit patient state
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState({ bloodGroup: "", unitsRequired: "", registeredBloodBankId: "", doctorName: "", disease: "", hospitalName: "" });
  const [editSaving, setEditSaving] = useState(false);

  // Print state
  const [printPatient, setPrintPatient] = useState(null);

  const bankId = user?.bloodBankId;

  const fetchPatients = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const params = new URLSearchParams({ bloodBankId: bankId });
      if (filterStatus) params.set("status", filterStatus);
      const data = await apiGet(`/patients?${params}`, { token: accessToken });
      setPatients(data.data || data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken, filterStatus]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  function setField(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleCreate() {
    if (!form.name || !form.age || !form.bloodGroup || !form.address || !form.district || !form.state || !form.hospitalName || !form.hospitalType || !form.mobile) {
      toast.error("Fill all required fields"); return;
    }
    setSaving(true);
    try {
      await apiPost("/patients", {
        name: form.name,
        age: parseInt(form.age),
        sex: form.sex,
        bloodGroup: form.bloodGroup,
        unitsRequired: parseInt(form.unitsRequired) || 1,
        disease: form.disease || undefined,
        address: form.address,
        district: form.district,
        state: form.state,
        nationality: form.nationality || undefined,
        hospitalName: form.hospitalName,
        hospitalType: form.hospitalType || undefined,
        doctorName: form.doctorName || undefined,
        contactPerson1: form.contactPerson1 || undefined,
        contactPerson2: form.contactPerson2 || undefined,
        contactPerson3: form.contactPerson3 || undefined,
        mobile: form.mobile,
        email: form.email || undefined,
        bankAccountName: form.bankAccountName || undefined,
        bankAccountNo: form.bankAccountNo || undefined,
        bankAccountIFSC: form.bankAccountIFSC || undefined,
        bankAccountUPI: form.bankAccountUPI || undefined,
      }, { token: accessToken });
      toast.success("Patient registered. Login credentials sent to patient email.");
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || "Failed to register patient");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(patient) {
    setEditPatient(patient);
    setEditForm({
      bloodGroup: patient.bloodGroup || "",
      unitsRequired: String(patient.unitsRequired || ""),
      registeredBloodBankId: patient.registeredBloodBank?.id || "",
      doctorName: patient.doctorName || "",
      disease: patient.disease || "",
      hospitalName: patient.hospitalName || "",
    });
  }

  async function handleEdit() {
    if (!editPatient) return;
    setEditSaving(true);
    try {
      await apiPatch(`/patients/${editPatient.id}`, {
        bloodGroup: editForm.bloodGroup || undefined,
        unitsRequired: editForm.unitsRequired ? parseInt(editForm.unitsRequired) : undefined,
        registeredBloodBankId: editForm.registeredBloodBankId || undefined,
        doctorName: editForm.doctorName || undefined,
        disease: editForm.disease || undefined,
        hospitalName: editForm.hospitalName || undefined,
      }, { token: accessToken });
      toast.success("Patient requirement updated");
      setEditPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.message || "Failed to update patient");
    } finally {
      setEditSaving(false);
    }
  }

  if (printPatient) {
    return <PrintView patient={printPatient} onClose={() => setPrintPatient(null)} />;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Patients</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Patients registered with this blood bank</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register New Patient</button>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <select className="form-input" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["PENDING_PAYMENT","ACTIVE","FULFILLED","EXPIRED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilterStatus("")}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : patients.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No patients found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>Address / State</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.patientDisplayId}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><BloodTag group={p.bloodGroup} /></td>
                  <td style={{ textAlign: "center" }}>{p.unitsRequired}</td>
                  <td style={{ fontSize: 13 }}>{p.hospitalName}{p.hospitalType ? ` (${p.hospitalType === "GOVERNMENT" ? "Govt" : "Pvt"})` : ""}</td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                    {[p.district, p.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td style={{ fontSize: 13 }}>{p.mobile || "—"}</td>
                  <td><Badge status={STATUS_COLOR[p.status] || "info"}>{p.status}</Badge></td>
                  <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() => openEdit(p)}
                        title="Edit requirement"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px" }}
                        onClick={() => setPrintPatient(p)}
                        title="Print patient info"
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Register New Patient Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(EMPTY_FORM); }} title="Register New Patient">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>

          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)", paddingBottom: 6 }}>Patient Details</div>
          <div>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setField("name", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" min="0" value={form.age} onChange={e => setField("age", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Sex *</label>
              <select className="form-input" value={form.sex} onChange={e => setField("sex", e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Units *</label>
              <input className="form-input" type="number" min="1" value={form.unitsRequired} onChange={e => setField("unitsRequired", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Blood Group *</label>
              <select className="form-input" value={form.bloodGroup} onChange={e => setField("bloodGroup", e.target.value)}>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Disease (Optional)</label>
              <input className="form-input" value={form.disease} onChange={e => setField("disease", e.target.value)} />
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)", paddingBottom: 6, marginTop: 4 }}>Address</div>
          <div>
            <label className="form-label">Address *</label>
            <textarea className="form-input" rows={2} value={form.address} onChange={e => setField("address", e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">District *</label>
              <input className="form-input" value={form.district} onChange={e => setField("district", e.target.value)} />
            </div>
            <div>
              <label className="form-label">State/UT *</label>
              <select className="form-input" value={form.state} onChange={e => setField("state", e.target.value)}>
                <option value="">Select</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)", paddingBottom: 6, marginTop: 4 }}>Hospital</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Hospital Name *</label>
              <input className="form-input" value={form.hospitalName} onChange={e => setField("hospitalName", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Hospital Type *</label>
              <select className="form-input" value={form.hospitalType} onChange={e => setField("hospitalType", e.target.value)}>
                {HOSPITAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Doctor&apos;s Name (Optional)</label>
            <input className="form-input" value={form.doctorName} onChange={e => setField("doctorName", e.target.value)} />
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)", paddingBottom: 6, marginTop: 4 }}>Contact</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Mobile No. *</label>
              <input className="form-input" value={form.mobile} onChange={e => setField("mobile", e.target.value)} maxLength={10} />
            </div>
            <div>
              <label className="form-label">Email (Optional)</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="For login credentials" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["contactPerson1","contactPerson2","contactPerson3"].map((f, i) => (
              <input key={f} className="form-input" value={form[f]} onChange={e => setField(f, e.target.value)} placeholder={`Emergency contact ${i+1}`} />
            ))}
          </div>

          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)", paddingBottom: 6, marginTop: 4 }}>Payment / Refund Details (Optional)</div>
          <div>
            <label className="form-label">Name of Bank</label>
            <input className="form-input" value={form.bankAccountName} onChange={e => setField("bankAccountName", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Account No.</label>
              <input className="form-input" value={form.bankAccountNo} onChange={e => setField("bankAccountNo", e.target.value)} />
            </div>
            <div>
              <label className="form-label">IFSC</label>
              <input className="form-input" value={form.bankAccountIFSC} onChange={e => setField("bankAccountIFSC", e.target.value)} />
            </div>
            <div>
              <label className="form-label">UPI ID</label>
              <input className="form-input" value={form.bankAccountUPI} onChange={e => setField("bankAccountUPI", e.target.value)} />
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: "4px 0 0" }}>
            Patient will be notified via email with their Patient ID and login credentials if email is provided. Registration fee of ₹100 must be paid to activate the request.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleCreate}>
            {saving ? "Registering..." : "Register Patient"}
          </button>
        </div>
      </Modal>

      {/* Edit Patient Requirement Modal */}
      <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient Requirement">
        <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "0 0 16px" }}>
          Update blood group, units required, or other details for <strong>{editPatient?.name}</strong> ({editPatient?.patientDisplayId})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="form-label">Blood Group</label>
              <select className="form-input" value={editForm.bloodGroup} onChange={e => setEditForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Units Required</label>
              <input className="form-input" type="number" min="1" value={editForm.unitsRequired} onChange={e => setEditForm(f => ({ ...f, unitsRequired: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Hospital Name</label>
            <input className="form-input" value={editForm.hospitalName} onChange={e => setEditForm(f => ({ ...f, hospitalName: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Doctor&apos;s Name</label>
            <input className="form-input" value={editForm.doctorName} onChange={e => setEditForm(f => ({ ...f, doctorName: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Disease / Condition</label>
            <input className="form-input" value={editForm.disease} onChange={e => setEditForm(f => ({ ...f, disease: e.target.value }))} />
          </div>
          <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: 0 }}>
            Updating blood group or units will re-activate the patient&apos;s listing in the search results.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={() => setEditPatient(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={editSaving} onClick={handleEdit}>
            {editSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </>
  );
}
