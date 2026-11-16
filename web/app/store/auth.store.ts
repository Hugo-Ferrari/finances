import { create } from "zustand";
import { Usuario } from "../types/auth";

/**
 * verificando: ainda consultando a API (ex.: servidor acordando)
 * autenticado / anonimo: resultado da verificação
 * erro: a API não respondeu (fora do ar, sem internet)
 */
export type StatusAuth = "verificando" | "autenticado" | "anonimo" | "erro";

interface AuthState {
  usuario: Usuario | null;
  status: StatusAuth;
  setUsuario: (usuario: Usuario) => void;
  setStatus: (status: StatusAuth) => void;
  logout: () => void;
}

/**
 * Lembra (só neste aparelho) se a última verificação encontrou alguém logado.
 * Quem não estava logado vê o login na hora, sem esperar a API acordar; quem
 * estava vê a tela de carregamento e vai direto para o dashboard (sem piscar
 * a página inicial).
 */
const CHAVE_SESSAO = "finlogic-sessao";

export function lembrarSessao(ativa: boolean) {
  try {
    if (ativa) localStorage.setItem(CHAVE_SESSAO, "1");
    else localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // Navegador sem localStorage (modo privado): só perde o atalho.
  }
}

export function tinhaSessao(): boolean {
  try {
    return localStorage.getItem(CHAVE_SESSAO) === "1";
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  status: "verificando",
  setUsuario: (usuario) => {
    lembrarSessao(true);
    set({ usuario, status: "autenticado" });
  },
  setStatus: (status) => set({ status }),
  logout: () => {
    lembrarSessao(false);
    set({ usuario: null, status: "anonimo" });
  },
}));
