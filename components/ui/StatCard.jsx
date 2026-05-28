const VARIANT = {
  red:    { iconBg: "#FEF2F2", iconBorder: "#FECACA", iconColor: "#B91C1C" },
  green:  { iconBg: "#F0FDF4", iconBorder: "#BBF7D0", iconColor: "#15803D" },
  orange: { iconBg: "#FFF7ED", iconBorder: "#FED7AA", iconColor: "#C2410C" },
  blue:   { iconBg: "#EFF6FF", iconBorder: "#BFDBFE", iconColor: "#1D4ED8" },
};

export default function StatCard({ label, value, delta, deltaType = "up", variant = "red", icon }) {
  const cfg = VARIANT[variant] || VARIANT.red;

  return (
    <div className={`stat-card ${variant}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
          {delta !== undefined && (
            <div className={`stat-delta ${deltaType}`}>
              {deltaType === "up" ? "↑" : deltaType === "down" ? "↓" : "⚠"} {delta}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 38, height: 38,
            borderRadius: 10,
            background: cfg.iconBg,
            border: `1px solid ${cfg.iconBorder}`,
            color: cfg.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
