"use client";
import Sidebar from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";

const NAV = [
  {
    items: [
      { href: "/patient/dashboard", icon: "📊", label: "Dashboard" },
      { href: "/patient/status", icon: "🔍", label: "Blood Status" },
    ],
  },
];

export default function PatientLayout({ children }) {
  return (
    <div className="platform-shell">
      <Sidebar navItems={NAV} brandTitle="Patient Portal" />
      <div className="platform-main">
        <Topbar title="Patient Portal" breadcrumbs={["Bloodexchange.in", "Patient"]} />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
}
