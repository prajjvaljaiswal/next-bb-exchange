"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const REPORTS = [
  { key: "donations", label: "Donation Report", desc: "All donations in date range with blood groups", endpoint: "/reports/donations" },
  { key: "receivables", label: "Receivables Report", desc: "Balance sheet receivables snapshot", endpoint: "/reports/balance-sheet/receivables" },
  { key: "deliverables", label: "Deliverables Report", desc: "Balance sheet deliverables snapshot", endpoint: "/reports/balance-sheet/deliverables" },
  { key: "physical-transfers", label: "Physical Transfers", desc: "Form A/B physical transfer summary", endpoint: "/reports/transfers/physical" },
  { key: "digital-transfers", label: "Digital Transfers", desc: "Bilateral/Unilateral digital exchange log", endpoint: "/reports/transfers/digital" },
];

export default function ReportsPage() {
  const { user, accessToken } = useAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloading, setDownloading] = useState(null);

  const bankId = user?.bloodBankId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  async function downloadReport(report, format = "pdf") {
    setDownloading(report.key + format);
    try {
      const params = new URLSearchParams({ bloodBankId: bankId, format });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const resp = await fetch(`${API_URL}${report.endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!resp.ok) throw new Error("Download failed");

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.key}-${dateTo || new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Reports</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Download PDF or JSON reports</p>
      </div>

      <div className="panel" style={{ marginBottom: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Date Range</h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>From</label>
            <input className="form-input" type="date" style={{ width: 180 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>To</label>
            <input className="form-input" type="date" style={{ width: 180 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {REPORTS.map(report => (
          <div key={report.key} className="panel" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{report.label}</div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 2 }}>{report.desc}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={!!downloading}
                onClick={() => downloadReport(report, "json")}
              >
                {downloading === report.key + "json" ? "..." : "JSON"}
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={!!downloading}
                onClick={() => downloadReport(report, "pdf")}
              >
                {downloading === report.key + "pdf" ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
