"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/blood-bank/dashboard", icon: "dashboard", label: "Dashboard" },
      { href: "/blood-bank/admins",    icon: "users",     label: "Admins" },
    ],
  },
  {
    label: "Blood Management",
    items: [
      { href: "/blood-bank/inventory/whole-blood", icon: "beaker",      label: "Whole Blood" },
      { href: "/blood-bank/inventory/prbc",        icon: "droplet",     label: "PRBC Inventory" },
      { href: "/blood-bank/donations/new",         icon: "plus-circle", label: "Log Donation" },
      { href: "/blood-bank/donations",             icon: "clipboard",   label: "Donations" },
      { href: "/blood-bank/donor-cards",           icon: "id-card",     label: "Donor Cards" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/blood-bank/donors",          icon: "user-plus", label: "Donors" },
      { href: "/blood-bank/patients",        icon: "hospital",  label: "Patients" },
      { href: "/blood-bank/recommendation",  icon: "target",    label: "Recommendation" },
    ],
  },
  {
    label: "Balance Sheet",
    items: [
      { href: "/blood-bank/balance-sheet/receivables",  icon: "inbox", label: "Receivables" },
      { href: "/blood-bank/balance-sheet/deliverables", icon: "send",  label: "Deliverables" },
    ],
  },
  {
    label: "Transfers",
    items: [
      { href: "/blood-bank/transfers/form-a", icon: "file-text", label: "Form A" },
      { href: "/blood-bank/transfers/form-b", icon: "package",   label: "Form B" },
    ],
  },
  {
    label: "Digital Exchange",
    items: [
      { href: "/blood-bank/digital-exchange/bilateral",  icon: "switch",      label: "Bilateral" },
      { href: "/blood-bank/digital-exchange/unilateral", icon: "arrow-right", label: "Unilateral" },
    ],
  },
  {
    label: "Finance & Reports",
    items: [
      { href: "/blood-bank/payments",         icon: "credit-card", label: "Payments" },
      { href: "/blood-bank/reports/donations", icon: "bar-chart",  label: "Reports" },
    ],
  },
];

export default function BloodBankLayout({ children }) {
  return (
    <div className="platform-shell">
      <Sidebar navItems={NAV} />
      <div className="platform-main">
        <Topbar title="Blood Bank Portal" breadcrumbs={["BloodBankGroup.com", "Blood Bank"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
