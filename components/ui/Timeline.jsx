export default function Timeline({ steps }) {
  // steps: [{ label, description, status: 'done'|'active'|'pending' }]
  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <div key={i} className="timeline-item">
          <div className={`timeline-dot ${step.status}`}>
            {step.status === "done" ? "✓" : i + 1}
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: step.status === "pending" ? "var(--color-ink-faint)" : "var(--color-ink)" }}>
              {step.label}
            </div>
            {step.description && (
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>{step.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
