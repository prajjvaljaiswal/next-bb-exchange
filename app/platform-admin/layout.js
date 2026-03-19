"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/platform-admin/dashboard", icon: "📊", label: "Dashboard" },
      { href: "/platform-admin/blood-banks", icon: "🏥", label: "Blood Banks" },
      { href: "/platform-admin/blood-bank-groups", icon: "🔗", label: "Bank Groups" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/platform-admin/donors", icon: "🩸", label: "Donors" },
      { href: "/platform-admin/patients", icon: "👤", label: "Patients" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/platform-admin/payments", icon: "💳", label: "Payments" },
      { href: "/platform-admin/reports", icon: "📄", label: "Reports" },
    ],
  },
];

export default function PlatformAdminLayout({ children }) {
  return (
    <div className="platform-shell dark-theme">
      <Sidebar navItems={NAV} />
      <div className="platform-main">
        <Topbar title="Platform Admin" breadcrumbs={["Bloodexchange.in", "Admin"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
