"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { buscarUsuario } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUsuario = useAuthStore((state) => state.setUsuario);

  const router = useRouter();
  const pathname = usePathname();

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function verificarAutenticacao() {
      try {
        const usuario = await buscarUsuario();

        if (!ativo) return;

        setUsuario(usuario);

        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/cadastro"
        ) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        if (!ativo) return;

        if (
          pathname === "/dashboard" ||
          pathname.startsWith("/dashboard/")
        ) {
          router.replace("/login");
          return;
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    verificarAutenticacao();

    return () => {
      ativo = false;
    };
  }, [pathname, router, setUsuario]);

  if (
    carregando &&
    (
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/cadastro"
    )
  ) {
    return null;
  }

  return <>{children}</>;
}