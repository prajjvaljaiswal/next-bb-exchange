const LABEL_STYLE = { fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 };
const VALUE_STYLE = { fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-mono)" };

export default function CertCard({
  donorCardId,
  donorName,
  donorDisplayId,
  bloodGroup,
  bloodUnitNo,
  dateOfCollection,
  bloodBankName,
  bloodBankRegNo,
  authoritySignature,
  organisationOfDrive,
  status,
}) {
  return (
    <div className="cert-card">
      {/* Header */}
      <div className="cert-header">BloodBankGroup.com — Donor Certificate</div>

      {/* Card ID */}
      <div className="cert-id" style={{ marginTop: 6 }}>{donorCardId}</div>

      {/* Donor section */}
      <div style={{ marginTop: 14 }}>
        <div style={LABEL_STYLE}>Name of Donor</div>
        <div className="cert-name">{donorName || "—"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div>
          <div style={LABEL_STYLE}>Donor Id</div>
          <div style={VALUE_STYLE}>{donorDisplayId || "—"}</div>
        </div>
        <div>
          <div style={LABEL_STYLE}>Blood Group</div>
          <div className="cert-group" style={{ fontSize: 18, marginTop: 0 }}>{bloodGroup || "—"}</div>
        </div>
      </div>

      {/* Blood Bank section */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={LABEL_STYLE}>Name of Donation Centre Blood Bank</div>
        <div style={{ ...VALUE_STYLE, fontSize: 13, color: "rgba(255,255,255,0.95)" }}>{bloodBankName || "—"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        <div>
          <div style={LABEL_STYLE}>Blood Bank Id</div>
          <div style={VALUE_STYLE}>{bloodBankRegNo || "—"}</div>
        </div>
        <div>
          <div style={LABEL_STYLE}>Blood Unit No.</div>
          <div style={VALUE_STYLE}>{bloodUnitNo || "—"}</div>
        </div>
        <div>
          <div style={LABEL_STYLE}>Date of Collection</div>
          <div style={VALUE_STYLE}>
            {dateOfCollection ? new Date(dateOfCollection).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>
        <div>
          <div style={LABEL_STYLE}>Status</div>
          <div style={{ ...VALUE_STYLE, color: "var(--color-blood)", fontWeight: 700 }}>{status || "ISSUED"}</div>
        </div>
      </div>

      {/* Authority signature */}
      {authoritySignature && (
        <div style={{ marginTop: 10 }}>
          <div style={LABEL_STYLE}>Name-Signature of Blood Bank Authority</div>
          <div style={{ ...VALUE_STYLE, fontStyle: "italic" }}>{authoritySignature}</div>
        </div>
      )}

      {/* Organisation of drive */}
      {organisationOfDrive && (
        <div style={{ marginTop: 10 }}>
          <div style={LABEL_STYLE}>Name of Organisation of Donation Drive</div>
          <div style={{ ...VALUE_STYLE }}>{organisationOfDrive}</div>
        </div>
      )}
    </div>
  );
}
