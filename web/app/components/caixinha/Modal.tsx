"use client";

import { createPortal } from "react-dom";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function ModalPortal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const overflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = overflow;
    };
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
        <div className="modal-content max-h-[90svh] overflow-y-auto">
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
