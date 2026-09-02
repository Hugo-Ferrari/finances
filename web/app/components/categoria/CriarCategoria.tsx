import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

function CriarCategoria() {
  return (
    <Link href={'/novaCategoria'}
      type="Link"
      className="flex h-45 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted bg-surface text-muted transition hover:border-foreground hover:text-black/70"
    >
        
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 ">
        <Plus size={20} className="text-white"/>
      </div>

      <h1 className="font-semibold">
        Criar nova categoria
      </h1>

      <p className="text-sm text-muted">
        Adicione uma categoria ao seu orçamento
      </p>
    </Link>
  );
}

export default CriarCategoria;