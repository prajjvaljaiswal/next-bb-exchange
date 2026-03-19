export default function StatCard({ label, value, delta, deltaType = "up", variant = "red", icon }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
          {delta !== undefined && (
            <div className={`stat-delta ${deltaType}`}>
              {deltaType === "up" ? "↑" : deltaType === "down" ? "↓" : "⚠"} {delta}
            </div>
          )}
        </div>
        {icon && (
          <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>
        )}
      </div>
    </div>
  );
}
