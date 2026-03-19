"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/blood-bank/dashboard", icon: "📊", label: "Dashboard" },
      { href: "/blood-bank/admins", icon: "👥", label: "Admins" },
    ],
  },
  {
    label: "Blood Management",
    items: [
      { href: "/blood-bank/inventory/whole-blood", icon: "🧪", label: "Whole Blood" },
      { href: "/blood-bank/inventory/prbc", icon: "🩸", label: "PRBC Inventory" },
      { href: "/blood-bank/donations/new", icon: "➕", label: "Log Donation" },
      { href: "/blood-bank/donations", icon: "📋", label: "Donations" },
      { href: "/blood-bank/donor-cards", icon: "🪪", label: "Donor Cards" },
    ],
  },
  {
    label: "Patients",
    items: [
      { href: "/blood-bank/patients", icon: "🏥", label: "Patients" },
      { href: "/blood-bank/recommendation", icon: "🎯", label: "Recommendation" },
    ],
  },
  {
    label: "Balance Sheet",
    items: [
      { href: "/blood-bank/balance-sheet/receivables", icon: "📥", label: "Receivables" },
      { href: "/blood-bank/balance-sheet/deliverables", icon: "📤", label: "Deliverables" },
    ],
  },
  {
    label: "Transfers",
    items: [
      { href: "/blood-bank/transfers/form-a", icon: "📝", label: "Form A" },
      { href: "/blood-bank/transfers/form-b", icon: "📦", label: "Form B" },
    ],
  },
  {
    label: "Digital Exchange",
    items: [
      { href: "/blood-bank/digital-exchange/bilateral", icon: "🔄", label: "Bilateral" },
      { href: "/blood-bank/digital-exchange/unilateral", icon: "➡️", label: "Unilateral" },
    ],
  },
  {
    label: "Finance & Reports",
    items: [
      { href: "/blood-bank/payments", icon: "💳", label: "Payments" },
      { href: "/blood-bank/reports/donations", icon: "📄", label: "Reports" },
    ],
  },
];

export default function BloodBankLayout({ children }) {
  return (
    <div className="platform-shell">
      <Sidebar navItems={NAV} />
      <div className="platform-main">
        <Topbar title="Blood Bank Portal" breadcrumbs={["Bloodexchange.in", "Blood Bank"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
