"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

import { buscarUsuario } from "../services/auth.service";
import { lembrarSessao, tinhaSessao, useAuthStore } from "../store/auth.store";
import TelaCarregamento from "./TelaCarregamento";

const ROTAS_PUBLICAS = ["/", "/login", "/cadastro"];

const semInscricao = () => () => {};

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
  const sessaoAnterior = useSyncExternalStore(semInscricao, tinhaSessao, () => false);

  const verificarSessao = useCallback(async () => {
    setStatus("verificando");
    try {
      setUsuario(await buscarUsuario());
    } catch (error) {
      const naoAutenticado =
        axios.isAxiosError(error) && error.response?.status === 401;
      if (naoAutenticado) lembrarSessao(false);
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

  if (rotaPublica) {
    // Login e página inicial aparecem na hora, enquanto a sessão é conferida
    // por trás (a própria conferência já acorda a API). Só espera quem
    // provavelmente está logado e vai ser levado ao dashboard.
    if (status === "autenticado") return <TelaCarregamento />;
    if (status === "verificando" && sessaoAnterior) return <TelaCarregamento />;
    return <>{children}</>;
  }

  if (status === "verificando") return <TelaCarregamento />;

  if (status === "erro") {
    return <TelaCarregamento erro onTentarNovamente={verificarSessao} />;
  }

  if (status !== "autenticado") return <TelaCarregamento />;

  return <>{children}</>;
}
