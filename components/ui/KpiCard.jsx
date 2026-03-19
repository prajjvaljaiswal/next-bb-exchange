export default function KpiCard({ label, value, delta, deltaType = "up", icon }) {
  return (
    <div className="kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-dash-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-dash-text)" }}>{value}</div>
          {delta !== undefined && (
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 6, color: deltaType === "up" ? "#22C55E" : deltaType === "down" ? "#EF4444" : "#F59E0B" }}>
              {deltaType === "up" ? "↑" : deltaType === "down" ? "↓" : "⚠"} {delta}
            </div>
          )}
        </div>
        {icon && <span style={{ fontSize: 24, opacity: 0.4, color: "var(--color-dash-text)" }}>{icon}</span>}
      </div>
    </div>
  );
}
