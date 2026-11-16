import { defaultCache } from "@serwist/next/worker";

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,

  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  fallbacks: {
    entries: [
      {
        url: "/login",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },

  runtimeCaching: [
    // Dados da API nunca vêm do cache: evita mostrar saldo/usuário antigos
    // (ou de outra pessoa no mesmo aparelho) quando o servidor demora.
    {
      matcher: ({ sameOrigin, url: { pathname } }) =>
        sameOrigin && pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();