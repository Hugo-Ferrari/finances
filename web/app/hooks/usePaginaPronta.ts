"use client";

import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

/**
 * Fica `true` depois que o React assume a página no navegador.
 * Antes disso um formulário seria enviado pelo navegador (sem o nosso
 * onSubmit), então os botões de envio ficam desabilitados até aqui.
 */
export function usePaginaPronta() {
  return useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );
}
