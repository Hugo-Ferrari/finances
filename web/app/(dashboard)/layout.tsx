"use client";

import { useEffect, useState } from "react";
import NavBar from "../components/Nav";
import OfflineSync from "./OfflineSync";
import { buscarUsuario } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";


function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen animate-fade-in items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p className="text-sm text-muted">Carregando...</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      try {
        const usuario = await buscarUsuario();
        setUsuario(usuario);
      } catch {
      } finally {
        setCarregando(false);
      }
    }
    verificarUsuario();
  }, [setUsuario]);

  if (carregando) return <LoadingSkeleton />;

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
