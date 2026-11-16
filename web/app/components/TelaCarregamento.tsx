"use client";

import { useEffect, useState } from "react";

const AVISO_APOS_MS = 4_000;

interface TelaCarregamentoProps {
  erro?: boolean;
  onTentarNovamente?: () => void;
}

/** Tela cheia exibida enquanto a sessão é verificada (ou quando a API não responde). */
export default function TelaCarregamento({
  erro = false,
  onTentarNovamente,
}: TelaCarregamentoProps) {
  const [demorando, setDemorando] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDemorando(true), AVISO_APOS_MS);
    return () => clearTimeout(timer);
  }, []);

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-base font-semibold text-foreground">
            Não foi possível conectar ao servidor
          </p>
          <p className="text-sm text-muted">
            Verifique sua internet e tente novamente em alguns instantes.
          </p>
          {onTentarNovamente && (
            <button
              type="button"
              onClick={onTentarNovamente}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen animate-fade-in items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p className="text-sm text-muted">Carregando...</p>
        {demorando && (
          <p className="text-sm text-muted animate-fade-in">
            Conectando ao servidor. Isso pode levar até 1 minuto quando o
            sistema fica um tempo sem uso.
          </p>
        )}
      </div>
    </div>
  );
}
