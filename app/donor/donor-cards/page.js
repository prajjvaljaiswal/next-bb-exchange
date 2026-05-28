"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import CertCard from "@/components/ui/CertCard";
import Badge from "@/components/ui/Badge";

const STATUS_COLOR = { ISSUED: "info", IN_WHOLE_BLOOD: "warning", IN_PRBC: "warning", RESERVED: "success", TRANSFERRED: "info", USED: "success", EXPIRED: "danger" };

export default function DonorCardsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  const donorId = user?.donorId;

  const fetchCards = useCallback(async () => {
    if (!donorId || !accessToken) return;
    try {
      const data = await apiGet(`/donors/${donorId}/donor-cards`, { token: accessToken });
      setCards(data.data || data);
    } catch {
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [donorId, accessToken]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  function cardProps(card) {
    return {
      donorCardId: card.donorCardDisplayId,
      donorName: card.donorName,
      donorDisplayId: card.donorLink?.donor?.donorDisplayId || `D-${(card.donorLink?.donorId || "").slice(0, 8).toUpperCase()}`,
      bloodGroup: card.bloodGroup,
      bloodUnitNo: card.bloodUnitNo,
      dateOfCollection: card.dateOfCollection,
      bloodBankName: card.bloodBankName || card.bloodBank?.name,
      bloodBankRegNo: card.bloodBank?.registrationNo,
      authoritySignature: card.bloodBankAuthoritySignature,
      organisationOfDrive: card.organisationOfDrive,
      status: card.status,
    };
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>My Donor Cards</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Digital certificates for each donation</p>
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
      ) : cards.length === 0 ? (
        <div className="panel" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🩸</div>
          <h3 style={{ margin: "0 0 8px" }}>No donor cards yet</h3>
          <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 14 }}>Visit a registered blood bank to make your first donation.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, marginBottom: 24 }}>
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card === selectedCard ? null : card)}
                style={{ cursor: "pointer", transition: "transform 0.15s", transform: selectedCard?.id === card.id ? "scale(1.02)" : "scale(1)" }}
              >
                <CertCard {...cardProps(card)} />
              </div>
            ))}
          </div>

          {selectedCard && (
            <div className="panel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Card Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {[
                  { label: "Card ID", value: selectedCard.donorCardDisplayId, mono: true },
                  { label: "Donor ID", value: selectedCard.donorLink?.donor?.donorDisplayId || `D-${(selectedCard.donorLink?.donorId || "").slice(0, 8).toUpperCase()}`, mono: true },
                  { label: "Blood Unit No.", value: selectedCard.bloodUnitNo, mono: true },
                  { label: "Blood Group", value: selectedCard.bloodGroup },
                  { label: "Date of Collection", value: new Date(selectedCard.dateOfCollection).toLocaleDateString("en-IN") },
                  { label: "Blood Bank", value: selectedCard.bloodBankName || selectedCard.bloodBank?.name },
                  { label: "Blood Bank ID", value: selectedCard.bloodBank?.registrationNo, mono: true },
                  { label: "Authority Signature", value: selectedCard.bloodBankAuthoritySignature || "—" },
                  { label: "Organisation of Drive", value: selectedCard.organisationOfDrive || "—" },
                  { label: "Status", value: selectedCard.status },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 11, color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontWeight: 700, fontFamily: f.mono ? "var(--font-mono)" : undefined, fontSize: 13 }}>{f.value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
