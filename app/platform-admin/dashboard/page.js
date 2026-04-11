"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useSocketContext } from "@/context/SocketContext";
import StatCard from "@/components/ui/StatCard";

export default function PlatformAdminDashboard() {
  const { accessToken, loading: authLoading } = useAuth();
  const toast = useToast();
  const { socket } = useSocketContext();
  const [kpis, setKpis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await apiGet("/dashboard/platform-admin", { token: accessToken });
      setKpis(data.data || data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) { setLoading(false); return; }
    fetchKpis();
  }, [fetchKpis, authLoading, accessToken]);

  // Real-time activity feed
  useEffect(() => {
    if (!socket) return;
    function onActivity(event) {
      setActivity(prev => [{ ...event, ts: new Date() }, ...prev].slice(0, 20));
    }
    socket.on("donation.logged", (d) => onActivity({ type: "donation", msg: `Donation logged at ${d.bloodBankName || "a blood bank"}`, icon: "🩸" }));
    socket.on("cycle.detected", (d) => onActivity({ type: "cycle", msg: `Cycle detected — ${d.bankCount || ""} banks settled`, icon: "🔄" }));
    socket.on("transfer.requested", (d) => onActivity({ type: "transfer", msg: `Form A sent: ${d.fromBank || ""} → ${d.toBank || ""}`, icon: "📝" }));
    return () => {
      socket.off("donation.logged");
      socket.off("cycle.detected");
      socket.off("transfer.requested");
    };
  }, [socket]);

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--color-ink-muted)" }}>Loading dashboard...</div>;
  }

  const k = kpis || {};

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Platform Overview</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Bloodexchange.in · India Network</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Blood Banks" value={k.totalBloodBanks ?? "—"} variant="blue" icon="🏥" />
        <StatCard label="Active Donors" value={k.totalDonors ?? "—"} variant="red" icon="🩸" />
        <StatCard label="Donor Cards" value={k.totalDonorCards ?? "—"} variant="green" icon="🪪" />
        <StatCard label="Transfusions" value={k.totalDonations ?? "—"} variant="orange" icon="💉" />
        <StatCard label="Pending Approval" value={k.pendingBanks ?? "—"} variant="orange" icon="⏳" />
        <StatCard label="Revenue (₹)" value={k.totalRevenue ? `₹${(k.totalRevenue / 100).toLocaleString("en-IN")}` : "—"} variant="green" icon="💰" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Left: Pending approvals + recent donations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {k.pendingBanksList?.length > 0 && (
            <div className="panel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-warning)", textTransform: "uppercase" }}>
                Pending Approval ({k.pendingBanksList.length})
              </h3>
              <table className="data-table">
                <thead>
                  <tr><th>Bank Name</th><th>City</th><th>Reg No</th><th>Registered</th></tr>
                </thead>
                <tbody>
                  {k.pendingBanksList.slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.name}</td>
                      <td style={{ fontSize: 13 }}>{b.city}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.registrationNo}</td>
                      <td style={{ fontSize: 13 }}>{new Date(b.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10 }}>
                <a href="/platform-admin/blood-banks" style={{ fontSize: 13, color: "var(--color-blood)" }}>View all →</a>
              </div>
            </div>
          )}

          {k.recentDonations?.length > 0 && (
            <div className="panel" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>
                Recent Donations
              </h3>
              <table className="data-table">
                <thead>
                  <tr><th>Donor</th><th>Blood Group</th><th>Blood Bank</th><th>Date</th><th>Cycle</th></tr>
                </thead>
                <tbody>
                  {k.recentDonations.slice(0, 8).map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.donor?.name || "—"}</td>
                      <td style={{ fontSize: 13 }}>{d.donorCard?.bloodGroup || "—"}</td>
                      <td style={{ fontSize: 13 }}>{d.bloodBank?.name || "—"}</td>
                      <td style={{ fontSize: 13 }}>{new Date(d.donationDate).toLocaleDateString("en-IN")}</td>
                      <td>{d.cycleDetected ? "🔄" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!k.pendingBanksList?.length && !k.recentDonations?.length && (
            <div className="panel" style={{ padding: 40, textAlign: "center", color: "var(--color-ink-muted)" }}>
              No activity yet. Start by approving blood banks.
            </div>
          )}
        </div>

        {/* Right: Live activity feed */}
        <div className="panel" style={{ padding: 20, height: "fit-content" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-ink-muted)", textTransform: "uppercase" }}>Live Activity</h3>
          </div>
          {activity.length === 0 ? (
            <div style={{ color: "var(--color-ink-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
              Waiting for events...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activity.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 18 }}>{ev.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{ev.msg}</div>
                    <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 2 }}>
                      {ev.ts?.toLocaleTimeString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
