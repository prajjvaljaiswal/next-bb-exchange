export default function InventoryBar({ bloodGroup, current, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const state = pct > 50 ? "ok" : pct > 20 ? "low" : "critical";

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="blood-tag">{bloodGroup}</span>
          {label && <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{label}</span>}
        </div>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: state === "critical" ? "var(--color-blood)" : "var(--color-ink-muted)" }}>
          {current}/{max} units
        </span>
      </div>
      <div className="inventory-bar-track">
        <div className={`inventory-bar-fill ${state}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
