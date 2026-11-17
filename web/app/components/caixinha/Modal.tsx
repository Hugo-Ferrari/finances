"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  titulo: string;
  descricao?: string;
  onFechar: () => void;
  children: ReactNode;
  bloqueado?: boolean;
  className?: string;
}

export default function Modal({ titulo, descricao, onFechar, children, bloqueado = false, className = "" }: ModalProps) {
  useEffect(() => {
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && !bloqueado && onFechar();
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onFechar, bloqueado]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onMouseDown={(e) => e.target === e.currentTarget && !bloqueado && onFechar()}
    >
      <div className={`modal-content max-h-[90svh] overflow-y-auto ${className}`}>
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
  );
}
