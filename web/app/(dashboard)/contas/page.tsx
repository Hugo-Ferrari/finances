"use client";
import PageHeader from "@/app/components/ui/PageHeader";

import NovaConta from "@/app/components/contas/NovaConta";
import ListaContas from "@/app/components/contas/ListarContas";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

function Page() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="page-container animate-fade-in">
     
      <PageHeader
        eyebrow="Patrimônio"
        title="Minhas contas"
        subtitle="Veja onde está o seu dinheiro e quanto já está guardado."
        actions={
          <Button onClick={() => setMostrarFormulario((v) => !v)}>
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
        }
      />

      
      {mostrarFormulario && (
        <NovaConta onClose={() => setMostrarFormulario(false)} />
      )}

    
      <ListaContas />
    </div>
  );
}

export default Page;
