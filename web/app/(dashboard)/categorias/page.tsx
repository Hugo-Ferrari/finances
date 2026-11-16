import Link from "next/link";
import { Plus } from "lucide-react";
import DetalhesCategorias from "@/app/components/categoria/DetalhesCategorias";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Planejamento"
        title="Categorias e orçamento"
        subtitle="Defina limites por categoria e veja onde dá para economizar."
        actions={
          <Link href="/novaCategoria" className="btn btn-primary">
            <Plus size={17} /> Nova categoria
          </Link>
        }
      />
      <DetalhesCategorias />
    </div>
  );
}
