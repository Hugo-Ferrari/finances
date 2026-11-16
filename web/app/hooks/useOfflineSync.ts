"use client";

import { useEffect } from "react";
import { processarFila } from "@/app/services/offline/transacao.queue";
import { useAuthStore } from "@/app/store/auth.store";

export function useOfflineSync() {
  const usuarioId = useAuthStore((state) => state.usuario?.id);

  useEffect(() => {
    if (usuarioId === undefined) return;

    const sincronizar = async () => {
      if (!navigator.onLine) {
        return;
      }

      await processarFila(usuarioId);
    };

    window.addEventListener("online", sincronizar); //pedindo pro navegador avisar quando voltar a ficar online

    sincronizar();

    return () => {
      window.removeEventListener("online", sincronizar);
    };
  }, [usuarioId]);
}
