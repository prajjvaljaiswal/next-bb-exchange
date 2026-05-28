"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import BloodTag from "@/components/ui/BloodTag";
import CertCard from "@/components/ui/CertCard";
import Link from "next/link";

export default function DonorDashboard() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const donorId = user?.donorId;

  const fetchData = useCallback(async () => {
    if (!donorId || !accessToken) return;
    try {
      const data = await apiGet(`/donors/${donorId}/donor-cards`, { token: accessToken });
      setCards(data.data || data);
    } catch {
      toast.error("Failed to load donor cards");
    } finally {
      setLoading(false);
    }
  }, [donorId, accessToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken || !donorId) { setLoading(false); return; }
    fetchData();
  }, [fetchData, authLoading, accessToken, donorId]);

  const latestCard = cards[0];
  const totalDonations = cards.length;
  const activeCycles = cards.filter(c => c.cycleDetected).length;

  // Compute next eligible date (56 days after last donation)
  let nextEligible = null;
  if (latestCard?.dateOfCollection) {
    const d = new Date(latestCard.dateOfCollection);
    d.setDate(d.getDate() + 56);
    nextEligible = d;
  }
  const isEligibleNow = !nextEligible || nextEligible <= new Date();
  const daysUntilEligible = nextEligible ? Math.max(0, Math.ceil((nextEligible - new Date()) / 86400000)) : 0;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Welcome, {user?.name || "Donor"}</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Your donation overview</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Donations" value={totalDonations} variant="red" icon="🩸" />
        <StatCard label="Cycles Closed" value={activeCycles} variant="green" icon="🔄" />
        <StatCard label="Blood Group" value={user?.bloodGroup || "—"} variant="blue" icon="💉" />
        <StatCard
          label={isEligibleNow ? "Eligible Now" : `Eligible In`}
          value={isEligibleNow ? "✓" : `${daysUntilEligible}d`}
          variant={isEligibleNow ? "green" : "orange"}
          icon="📅"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Latest card */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Latest Donor Card</h3>
          {loading ? (
            <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
          ) : latestCard ? (
            <CertCard
              donorCardId={latestCard.donorCardDisplayId}
              donorName={latestCard.donorName}
              donorDisplayId={latestCard.donorLink?.donor?.donorDisplayId || `D-${(latestCard.donorLink?.donorId || "").slice(0, 8).toUpperCase()}`}
              bloodGroup={latestCard.bloodGroup}
              bloodUnitNo={latestCard.bloodUnitNo}
              dateOfCollection={latestCard.dateOfCollection}
              bloodBankName={latestCard.bloodBankName || latestCard.bloodBank?.name}
              bloodBankRegNo={latestCard.bloodBank?.registrationNo}
              authoritySignature={latestCard.bloodBankAuthoritySignature}
              organisationOfDrive={latestCard.organisationOfDrive}
              status={latestCard.status}
            />
          ) : (
            <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
              No donations yet.{" "}
              <span style={{ fontSize: 13 }}>Visit a registered blood bank to donate.</span>
            </div>
          )}
          {cards.length > 1 && (
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <Link href="/donor/donor-cards" style={{ fontSize: 13, color: "var(--color-blood)" }}>View all {cards.length} cards →</Link>
            </div>
          )}
        </div>

        {/* Donation history */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Donation History</h3>
          <div className="panel" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading...</div>
            ) : cards.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>No donations yet</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Blood Group</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {cards.slice(0, 8).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 13 }}>{new Date(c.dateOfCollection).toLocaleDateString("en-IN")}</td>
                      <td><BloodTag group={c.bloodGroup} /></td>
                      <td><Badge status={c.status === "USED" || c.status === "TRANSFERRED" ? "success" : "info"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <Link href="/donor/patients" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", display: "flex" }}>
              Browse Patients to Donate For →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
