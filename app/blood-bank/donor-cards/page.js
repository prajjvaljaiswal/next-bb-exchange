"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import CertCard from "@/components/ui/CertCard";
import Modal from "@/components/ui/Modal";

const STATUS_COLOR = { ISSUED: "info", IN_WHOLE_BLOOD: "warning", IN_PRBC: "warning", RESERVED: "success", TRANSFERRED: "info", USED: "success", EXPIRED: "danger" };

export default function DonorCardsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  const bankId = user?.bloodBankId;

  const fetchCards = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const data = await apiGet(`/blood-banks/${bankId}/donor-cards`, { token: accessToken });
      setCards(data.data || data);
    } catch {
      toast.error("Failed to load donor cards");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const filtered = cards.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterGroup && c.bloodGroup !== filterGroup) return false;
    return true;
  });

  async function reserveCard(cardId, patientId) {
    try {
      await apiPatch(`/blood-banks/${bankId}/donor-cards/${cardId}/reserve`, { patientId }, { token: accessToken });
      toast.success("Card reserved for patient");
      fetchCards();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Donor Cards</h2>
          <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Digital donor certificates issued after each donation</p>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{filtered.length} cards</div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select className="form-input" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {["ISSUED","IN_WHOLE_BLOOD","IN_PRBC","RESERVED","TRANSFERRED","USED","EXPIRED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input" style={{ width: 160 }} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="">All Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(""); setFilterGroup(""); }}>Clear</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No donor cards found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Card ID</th>
                <th>Donor</th>
                <th>Blood Group</th>
                <th>Unit No</th>
                <th>Collected</th>
                <th>Status</th>
                <th>Reserved For</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(card => (
                <tr key={card.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{card.donorCardDisplayId}</td>
                  <td style={{ fontWeight: 600 }}>{card.donorName}</td>
                  <td><BloodTag group={card.bloodGroup} /></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{card.bloodUnitNo}</td>
                  <td style={{ fontSize: 13 }}>{new Date(card.dateOfCollection).toLocaleDateString("en-IN")}</td>
                  <td><Badge status={STATUS_COLOR[card.status] || "info"}>{card.status}</Badge></td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                    {card.reservedForPatient?.patientDisplayId || "—"}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCard(card)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCard && (
        <Modal open={!!selectedCard} onClose={() => setSelectedCard(null)} title="Donor Card" width={500}>
          <CertCard
            donorCardId={selectedCard.donorCardDisplayId}
            donorName={selectedCard.donorName}
            donorDisplayId={selectedCard.donorLink?.donor?.donorDisplayId || `D-${(selectedCard.donorLink?.donorId || "").slice(0, 8).toUpperCase()}`}
            bloodGroup={selectedCard.bloodGroup}
            bloodUnitNo={selectedCard.bloodUnitNo}
            dateOfCollection={selectedCard.dateOfCollection}
            bloodBankName={selectedCard.bloodBankName}
            bloodBankRegNo={selectedCard.bloodBank?.registrationNo}
            authoritySignature={selectedCard.bloodBankAuthoritySignature}
            organisationOfDrive={selectedCard.organisationOfDrive}
            status={selectedCard.status}
          />
        </Modal>
      )}
    </>
  );
}
