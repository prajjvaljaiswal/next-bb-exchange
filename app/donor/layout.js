"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    items: [
      { href: "/donor/dashboard",    icon: "dashboard", label: "Dashboard" },
      { href: "/donor/donor-cards",  icon: "id-card",   label: "My Donor Cards" },
      { href: "/donor/patients",     icon: "search",    label: "Find Patient" },
      { href: "/donor/blood-banks",  icon: "hospital",  label: "Blood Banks" },
    ],
  },
];

export default function DonorLayout({ children }) {
  return (
    <div className="platform-shell">
      <Sidebar navItems={NAV} brandTitle="Donor Portal" />
      <div className="platform-main">
        <Topbar title="Donor Portal" breadcrumbs={["Bloodexchange.in", "Donor"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
