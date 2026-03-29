"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useSocketContext } from "@/context/SocketContext";
import StatCard from "@/components/ui/StatCard";
import InventoryBar from "@/components/ui/InventoryBar";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function BloodBankDashboard() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const { socket } = useSocketContext();
  const [kpis, setKpis] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [pendingFormAs, setPendingFormAs] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);

  const bankId = user?.bloodBankId;

  const fetchData = useCallback(async () => {
    if (!bankId || !accessToken) return;
    try {
      const [dashData, invData, formsData, donData] = await Promise.all([
        apiGet(`/dashboard/blood-bank/${bankId}`, { token: accessToken }),
        apiGet(`/inventory/blood-banks/${bankId}/prbc/summary`, { token: accessToken }),
        apiGet(`/transfers/form-a?bloodBankId=${bankId}&status=SENT`, { token: accessToken }),
        apiGet(`/donations?bloodBankId=${bankId}&limit=5`, { token: accessToken }),
      ]);
      setKpis(dashData.data || dashData);
      setInventory(invData.data || invData);
      const forms = formsData.data || formsData;
      setPendingFormAs(forms.filter(f => f.recipientBankId === bankId));
      setRecentDonations(donData.data || donData);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [bankId, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket || !bankId) return;
    function addEvent(ev) {
      setLiveEvents(prev => [{ ...ev, ts: new Date() }, ...prev].slice(0, 10));
    }
    socket.on("donation.logged", d => addEvent({ icon: "🩸", msg: "Donation logged" }));
    socket.on("cycle.detected", d => addEvent({ icon: "🔄", msg: "Cycle detected! Refunds triggered." }));
    socket.on("transfer.requested", d => addEvent({ icon: "📝", msg: "New Form A received" }));
    socket.on("form.received", d => addEvent({ icon: "📦", msg: "Form B receipt confirmed" }));
    return () => {
      socket.off("donation.logged");
      socket.off("cycle.detected");
      socket.off("transfer.requested");
      socket.off("form.received");
    };
  }, [socket, bankId]);

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading dashboard...</div>;
  }

  const k = kpis || {};

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{user?.bloodBankName || "Blood Bank"} Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Real-time overview</p>
      </div>

      {pendingFormAs.length > 0 && (
        <div style={{ background: "var(--color-warning-bg, #fffbeb)", border: "1px solid var(--color-warning)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <strong>{pendingFormAs.length} Form A request{pendingFormAs.length !== 1 ? "s" : ""}</strong> awaiting your response.{" "}
          <Link href="/blood-bank/transfers/form-a" style={{ color: "var(--color-blood)" }}>Review →</Link>
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="PRBC Units" value={k.prbcUnits ?? "—"} variant="red" icon="🩸" />
        <StatCard label="Active Donors" value={k.donorCount ?? "—"} variant="blue" icon="👤" />
        <StatCard label="Active Patients" value={k.patientCount ?? "—"} variant="orange" icon="🏥" />
        <StatCard label="Pending Forms" value={(k.pendingFormA ?? 0) + (k.pendingFormB ?? 0)} variant="orange" icon="📋" />
        <StatCard label="Receivables" value={k.receivableCount ?? "—"} variant="green" icon="📥" />
        <StatCard label="Deliverables" value={k.deliverableCount ?? "—"} variant="red" icon="📤" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Inventory bars */}
          {inventory.length > 0 && (
            <div className="panel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>
                PRBC Inventory
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {inventory.map(s => (
                  <InventoryBar key={s.bloodGroup} bloodGroup={s.bloodGroup} available={s.available} total={s.total} />
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/blood-bank/inventory/prbc" style={{ fontSize: 13, color: "var(--color-blood)" }}>View full inventory →</Link>
              </div>
            </div>
          )}

          {/* Recent donations */}
          {recentDonations.length > 0 && (
            <div className="panel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Recent Donations</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Donor</th><th>Blood Group</th><th>Patient</th><th>Date</th><th>Cycle</th></tr>
                </thead>
                <tbody>
                  {recentDonations.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.donor?.name || "—"}</td>
                      <td style={{ fontSize: 13 }}>{d.donorCard?.bloodGroup || "—"}</td>
                      <td style={{ fontSize: 13 }}>{d.patient?.patientDisplayId || "—"}</td>
                      <td style={{ fontSize: 13 }}>{new Date(d.donationDate).toLocaleDateString("en-IN")}</td>
                      <td>{d.cycleDetected ? "🔄" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10 }}>
                <Link href="/blood-bank/donations" style={{ fontSize: 13, color: "var(--color-blood)" }}>View all donations →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: live events + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Live Events</h3>
            </div>
            {liveEvents.length === 0 ? (
              <div style={{ color: "var(--color-ink-muted)", fontSize: 13, textAlign: "center", padding: 16 }}>Waiting for events...</div>
            ) : liveEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}>
                <span>{ev.icon}</span>
                <div>
                  <div>{ev.msg}</div>
                  <div style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>{ev.ts?.toLocaleTimeString("en-IN")}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/blood-bank/donations/new" className="btn btn-primary" style={{ justifyContent: "center" }}>+ Log Donation</Link>
              <Link href="/blood-bank/inventory/whole-blood" className="btn btn-ghost" style={{ justifyContent: "center" }}>Record TTI Results</Link>
              <Link href="/blood-bank/transfers/form-a" className="btn btn-ghost" style={{ justifyContent: "center" }}>Send Form A</Link>
              <Link href="/blood-bank/balance-sheet/receivables" className="btn btn-ghost" style={{ justifyContent: "center" }}>View Balance Sheet</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
