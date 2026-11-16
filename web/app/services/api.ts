import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth.store";

const sameOrigin = process.env.NEXT_PUBLIC_API_MODE === "same-origin";

const apiBaseUrl = sameOrigin
  ? "/api"
  : process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

// O backend (Render gratuito) dorme quando fica parado e leva até ~1 min
// para acordar. Leituras têm timeout curto e são repetidas; gravações têm
// timeout longo e nunca são repetidas, para não duplicar dados.
const TIMEOUT_LEITURA_MS = 25_000;
const TIMEOUT_GRAVACAO_MS = 90_000;
const MAX_TENTATIVAS_LEITURA = 3;
const STATUS_TEMPORARIOS = [502, 503, 504];

type ConfigComTentativa = InternalAxiosRequestConfig & { tentativa?: number };

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.timeout === undefined || config.timeout === 0) {
    const leitura = (config.method ?? "get").toLowerCase() === "get";
    config.timeout = leitura ? TIMEOUT_LEITURA_MS : TIMEOUT_GRAVACAO_MS;
  }
  return config;
});

function ehErroTemporario(error: AxiosError) {
  if (!error.response) return true; // timeout ou falha de rede
  return STATUS_TEMPORARIOS.includes(error.response.status);
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as ConfigComTentativa | undefined;

  if (error.response?.status === 401 && config?.url !== "/auth/login") {
    // Sessão expirada ou inexistente: o AuthInitializer leva para o login.
    useAuthStore.getState().logout();
    return Promise.reject(error);
  }

  const leitura = (config?.method ?? "").toLowerCase() === "get";
  const tentativa = config?.tentativa ?? 0;

  if (
    config &&
    leitura &&
    tentativa < MAX_TENTATIVAS_LEITURA &&
    ehErroTemporario(error) &&
    !(typeof navigator !== "undefined" && !navigator.onLine)
  ) {
    config.tentativa = tentativa + 1;
    await esperar(2_000 * config.tentativa);
    return api(config);
  }

  return Promise.reject(error);
});

export default api;
