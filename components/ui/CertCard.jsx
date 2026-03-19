export default function CertCard({ donorCardId, donorName, bloodGroup, dateOfCollection, bloodBankName, status }) {
  return (
    <div className="cert-card">
      <div className="cert-header">Bloodexchange.in — Donor Certificate</div>
      <div className="cert-id">{donorCardId}</div>
      <div className="cert-name">{donorName}</div>
      <div className="cert-group">{bloodGroup}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
            {dateOfCollection ? new Date(dateOfCollection).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
          <div style={{ fontSize: 13, color: "var(--color-blood)", marginTop: 2, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {status || "ISSUED"}
          </div>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Blood Bank</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{bloodBankName}</div>
        </div>
      </div>
    </div>
  );
}
