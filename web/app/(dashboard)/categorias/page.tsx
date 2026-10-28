import DetalhesCategorias from "@/app/components/categoria/DetalhesCategorias";
import OrcamentoMensalTotal from "@/app/components/categoria/OrcamentoMensalTotal";

export default function Page() {
  return (
    <div className="page-container">
      
      <header>
        <p className="page-eyebrow">Planejamento</p>
        <h1 className="page-title">Categorias e orçamento</h1>
        <p className="page-subtitle">
          Gerencie seus limites de gastos e acompanhe o uso por categoria.
        </p>
      </header>

      
      <OrcamentoMensalTotal />

      
      <section>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-primary">
          Detalhamento por categoria
        </h2>
        <DetalhesCategorias />
      </section>
    </div>
  );
}
