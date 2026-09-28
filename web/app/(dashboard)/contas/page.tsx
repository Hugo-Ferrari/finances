"use client";

import NovaConta from "@/app/components/contas/NovaConta";
import ListaContas from "@/app/components/contas/ListarContas";
import { Plus } from "lucide-react";
import { useState } from "react";

function Page() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Patrimônio
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Minhas contas
          </h1>
          <p className="mt-2 text-sm text-muted">
            Gerencie suas contas e acompanhe seus saldos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus size={17} />
          {mostrarFormulario ? "Fechar formulário" : "Nova conta"}
        </button>
      </div>

      {mostrarFormulario && (
        <NovaConta onClose={() => setMostrarFormulario(false)} />
      )}
      <ListaContas />
    </div>
  );
}

export default Page;
