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

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  status: "verificando",
  setUsuario: (usuario) => set({ usuario, status: "autenticado" }),
  setStatus: (status) => set({ status }),
  logout: () => set({ usuario: null, status: "anonimo" }),
}));
