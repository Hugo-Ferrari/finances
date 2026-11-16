"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

import { buscarUsuario } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import TelaCarregamento from "./TelaCarregamento";

const ROTAS_PUBLICAS = ["/", "/login", "/cadastro"];

/**
 * Verifica a sessão uma única vez ao abrir o sistema e protege todas as
 * rotas que não são públicas. O resultado fica no auth.store; as páginas
 * não precisam chamar /usuario de novo.
 */
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = useAuthStore((state) => state.status);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const setStatus = useAuthStore((state) => state.setStatus);

  const router = useRouter();
  const pathname = usePathname();
  const rotaPublica = ROTAS_PUBLICAS.includes(pathname);

  const verificarSessao = useCallback(async () => {
    setStatus("verificando");
    try {
      setUsuario(await buscarUsuario());
    } catch (error) {
      const naoAutenticado =
        axios.isAxiosError(error) && error.response?.status === 401;
      setStatus(naoAutenticado ? "anonimo" : "erro");
    }
  }, [setStatus, setUsuario]);

  useEffect(() => {
    verificarSessao();
  }, [verificarSessao]);

  useEffect(() => {
    if (status === "autenticado" && rotaPublica) {
      router.replace("/dashboard");
    } else if (status === "anonimo" && !rotaPublica) {
      router.replace("/login");
    }
  }, [status, rotaPublica, router]);

  if (status === "verificando") return <TelaCarregamento />;

  if (rotaPublica) {
    return status === "autenticado" ? <TelaCarregamento /> : <>{children}</>;
  }

  if (status === "erro") {
    return <TelaCarregamento erro onTentarNovamente={verificarSessao} />;
  }

  if (status !== "autenticado") return <TelaCarregamento />;

  return <>{children}</>;
}
