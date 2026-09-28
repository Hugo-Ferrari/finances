"use client";

import { useEffect, useState } from "react";

import NavBar from "../components/Nav";
import OfflineSync from "./OfflineSync";

import { buscarUsuario } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

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

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <NavBar />

      <OfflineSync />

      <main className="dashboard-main min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
