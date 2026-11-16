import Link from "next/link";
import { Plus } from "lucide-react";

function CriarCategoria() {
  return (
    <Link
      href="/novaCategoria"
      className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/60 p-5 text-center text-muted transition hover:border-accent hover:bg-accent-light/40 hover:text-accent"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-sm">
        <Plus size={20} />
      </span>
      <span className="font-semibold">Nova categoria</span>
      <span className="text-xs">Defina um limite e controle seus gastos</span>
    </Link>
  );
}

export default CriarCategoria;
