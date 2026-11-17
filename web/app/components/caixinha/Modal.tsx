"use client";

import { createPortal } from "react-dom";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Trava a página enquanto houver modal aberto. Só `overflow: hidden` não basta
 * no iPhone: a página de trás continuava rolando junto com o dedo. Fixar o body
 * na posição atual impede isso; ao fechar, a página volta para onde estava.
 */
let modaisAbertos = 0;
let estiloAnterior = "";
let posicaoAnterior = 0;

function travarPagina() {
  if (modaisAbertos++ > 0) return;
  const body = document.body;
  posicaoAnterior = window.scrollY;
  estiloAnterior = body.style.cssText;
  Object.assign(body.style, {
    position: "fixed",
    top: `-${posicaoAnterior}px`,
    left: "0",
    right: "0",
    width: "100%",
    overflow: "hidden",
  });
}

function destravarPagina() {
  if (--modaisAbertos > 0) return;
  document.body.style.cssText = estiloAnterior;
  window.scrollTo({ top: posicaoAnterior, behavior: "instant" });
}

export function ModalPortal({ children }: { children: ReactNode }) {
  useEffect(() => {
    travarPagina();
    return destravarPagina;
  }, []);

  return typeof document === "undefined" ? null : createPortal(children, document.body);
}

interface ModalProps {
  titulo: string;
  descricao?: string;
  onFechar: () => void;
  children: ReactNode;
  bloqueado?: boolean;
}

export default function Modal({ titulo, descricao, onFechar, children, bloqueado = false }: ModalProps) {
  useEffect(() => {
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && !bloqueado && onFechar();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onFechar, bloqueado]);

  return (
    <ModalPortal>
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.target === e.currentTarget && !bloqueado && onFechar()}
      >
        <div className="modal-content">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary">{titulo}</h2>
              {descricao && <p className="mt-1 text-sm text-muted">{descricao}</p>}
            </div>
            <button
              type="button"
              onClick={onFechar}
              disabled={bloqueado}
              aria-label="Fechar"
              className="rounded-lg p-1.5 text-muted transition hover:bg-surface-dim hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </ModalPortal>
  );
}
