"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/platform-admin/dashboard",        icon: "dashboard", label: "Dashboard" },
      { href: "/platform-admin/blood-banks",       icon: "hospital",  label: "Blood Banks" },
      { href: "/platform-admin/blood-bank-groups", icon: "link",      label: "Bank Groups" },
    ],
  },
  {
    label: "Users",
    items: [
      { href: "/platform-admin/donors",   icon: "droplet", label: "Donors" },
      { href: "/platform-admin/patients", icon: "user",    label: "Patients" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/platform-admin/payments", icon: "credit-card", label: "Payments" },
      { href: "/platform-admin/reports",  icon: "bar-chart",   label: "Reports" },
    ],
  },
];

export default function PlatformAdminLayout({ children }) {
  return (
    <div className="platform-shell dark-theme">
      <Sidebar navItems={NAV} />
      <div className="platform-main">
        <Topbar title="Platform Admin" breadcrumbs={["BloodBankGroup.com", "Admin"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
