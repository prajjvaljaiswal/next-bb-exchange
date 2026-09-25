"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    items: [
      { href: "/patient/dashboard", icon: "dashboard", label: "Dashboard" },
      { href: "/patient/status",    icon: "activity",  label: "Blood Status" },
    ],
  },
];

export default function PatientLayout({ children }) {
  return (
    <div className="platform-shell">
      <Sidebar navItems={NAV} brandTitle="Patient Portal" />
      <div className="platform-main">
        <Topbar title="Patient Portal" breadcrumbs={["BloodBankGroup.com", "Patient"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
