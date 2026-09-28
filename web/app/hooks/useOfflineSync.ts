"use client";

import { useEffect } from "react";
import { processarFila } from "@/app/services/offline/transacao.queue";

export function useOfflineSync() {
  useEffect(() => {
    const sincronizar = async () => {
      if (!navigator.onLine) {
        return;
      }

      await processarFila();
    };

    window.addEventListener("online", sincronizar); //pedindo pro navegador avisar quando voltar a ficar online

    sincronizar();

    return () => {
      window.removeEventListener("online", sincronizar);
    };
  }, []);
}
