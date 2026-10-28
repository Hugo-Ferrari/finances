"use client";

import NovaConta from "@/app/components/contas/NovaConta";
import ListaContas from "@/app/components/contas/ListarContas";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

function Page() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="page-container animate-fade-in">
     
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Patrimônio</p>
          <h1 className="page-title">Minhas contas</h1>
          <p className="page-subtitle">
            Gerencie suas contas e acompanhe seus saldos.
          </p>
        </div>

        <Button
          onClick={() => setMostrarFormulario((v) => !v)}
        >
          {mostrarFormulario ? (
            <>
              <X size={17} />
              Fechar formulário
            </>
          ) : (
            <>
              <Plus size={17} />
              Nova conta
            </>
          )}
        </Button>
      </header>

      
      {mostrarFormulario && (
        <NovaConta onClose={() => setMostrarFormulario(false)} />
      )}

    
      <ListaContas />
    </div>
  );
}

export default Page;
