"use client";

import NavBar from "../components/Nav";
import OfflineSync from "./OfflineSync";

// A sessão já é verificada pelo AuthInitializer (app/layout.tsx).
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <NavBar />
      <OfflineSync />
      <main
        className="dashboard-main min-w-0 flex-1 overflow-y-auto animate-fade-in"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
