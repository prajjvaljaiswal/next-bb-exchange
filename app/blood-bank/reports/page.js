"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

const OTHER_REPORTS = [
  { key: "receivables", label: "Receivables Report", desc: "Balance sheet receivables snapshot", endpoint: "/reports/balance-sheet/receivables" },
  { key: "deliverables", label: "Deliverables Report", desc: "Balance sheet deliverables snapshot", endpoint: "/reports/balance-sheet/deliverables" },
  { key: "physical-transfers", label: "Physical Transfers", desc: "Form A/B physical transfer summary", endpoint: "/reports/transfers/physical" },
  { key: "digital-transfers", label: "Digital Transfers", desc: "Bilateral/Unilateral digital exchange log", endpoint: "/reports/transfers/digital" },
];

export default function ReportsPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();

  // Date-wise donation report state
  const [donationDate, setDonationDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [customEmail, setCustomEmail] = useState("");

  // Other reports state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloadingOther, setDownloadingOther] = useState(null);

  const bankId = user?.bloodBankId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  async function downloadDonationReport() {
    if (!donationDate) { toast.error("Please select a date"); return; }
    setDownloading(true);
    try {
      const params = new URLSearchParams({ bloodBankId: bankId, format: "pdf", date: donationDate });
      const resp = await fetch(`${API_URL}/reports/donations?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${donationDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  }

  async function emailDonationReport(toCustomEmail = false) {
    if (!donationDate) { toast.error("Please select a date"); return; }
    if (toCustomEmail && !customEmail) { toast.error("Please enter an email address"); return; }
    setEmailing(true);
    try {
      const params = new URLSearchParams({ bloodBankId: bankId, date: donationDate });
      if (toCustomEmail && customEmail) {
        params.set("emailTo", customEmail);
      } else {
        params.set("email", "true");
      }
      const resp = await fetch(`${API_URL}/reports/donations?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!resp.ok) throw new Error("Email failed");
      const json = await resp.json();
      toast.success(json.data?.message || "Report emailed successfully");
    } catch (err) {
      toast.error("Email failed: " + err.message);
    } finally {
      setEmailing(false);
    }
  }

  async function downloadOtherReport(report, format = "pdf") {
    setDownloadingOther(report.key + format);
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
      toast.error("Download failed: " + err.message);
    } finally {
      setDownloadingOther(null);
    }
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Reports</h2>
        <p style={{ margin: "4px 0 0", color: "var(--color-ink-muted)", fontSize: 13 }}>Generate and download PDF reports</p>
      </div>

      {/* Module 4 — Date-Wise Donations Report */}
      <div className="panel" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Date-Wise Donations Report</div>
          <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 3 }}>
            PDF with all donations on a selected date — donor details, type, blood group compatibility, remarks
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>Select Date</label>
            <input
              className="form-input"
              type="date"
              style={{ width: 200 }}
              value={donationDate}
              onChange={e => setDonationDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            disabled={downloading || !donationDate}
            onClick={downloadDonationReport}
          >
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <button
            className="btn btn-ghost"
            disabled={emailing || !donationDate}
            onClick={() => emailDonationReport(false)}
            title={`Email PDF to your registered address (${user?.email || "your email"})`}
          >
            {emailing ? "Sending..." : "Email to Me"}
          </button>
        </div>

        {/* Module 7: "send to self or to anyone a copy through an e-mail id" */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label" style={{ display: "block", marginBottom: 4 }}>Send to Any Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="Enter any email address"
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <button
            className="btn btn-ghost"
            disabled={emailing || !donationDate || !customEmail}
            onClick={() => emailDonationReport(true)}
          >
            {emailing ? "Sending..." : "Send to This Email"}
          </button>
        </div>

        {donationDate && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-ink-muted)" }}>
            &quot;Email to Me&quot; sends to your registered address: <strong>{user?.email}</strong>
          </div>
        )}
      </div>

      {/* Other Reports */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Other Reports</h3>
        <div className="panel" style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Date Range Filter</div>
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OTHER_REPORTS.map(report => (
            <div key={report.key} className="panel" style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{report.label}</div>
                <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 2 }}>{report.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={!!downloadingOther}
                  onClick={() => downloadOtherReport(report, "json")}
                >
                  {downloadingOther === report.key + "json" ? "..." : "JSON"}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!!downloadingOther}
                  onClick={() => downloadOtherReport(report, "pdf")}
                >
                  {downloadingOther === report.key + "pdf" ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
