"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, CreditCard } from "lucide-react";

import PageHeader from "@/app/components/ui/PageHeader";
import SkeletonCard from "@/app/components/ui/Skeleton";
import ListaRecorrentes from "@/app/components/planejamento/ListaRecorrentes";
import CalculadoraParcelamento from "@/app/components/planejamento/CalculadoraParcelamento";
import ParcelasEmAberto from "@/app/components/planejamento/ParcelasEmAberto";
import { listarParcelamentos, listarRecorrentes } from "@/app/services/planejamento.service";
import { ListaParcelamentos, Recorrente } from "@/app/types/planejamento";

type Aba = "fixas" | "parcelas";

function Conteudo() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const aba: Aba = params.get("aba") === "parcelas" ? "parcelas" : "fixas";

  const [recorrentes, setRecorrentes] = useState<Recorrente[] | null>(null);
  const [parcelamentos, setParcelamentos] = useState<ListaParcelamentos | null>(null);
  const [erro, setErro] = useState(false);

  const carregar = useCallback(() => {
    Promise.all([listarRecorrentes(), listarParcelamentos()])
      .then(([r, p]) => {
        setRecorrentes(r);
        setParcelamentos(p);
        setErro(false);
      })
      .catch(() => setErro(true));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function trocarAba(nova: Aba) {
    router.replace(nova === "fixas" ? pathname : `${pathname}?aba=parcelas`, { scroll: false });
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Planejamento"
        title="Planejar"
        subtitle="Contas que se repetem todo mês e compras parceladas. É daqui que sai o “pode gastar hoje”."
      />

      <div className="grid w-full max-w-md grid-cols-2 gap-1 rounded-2xl bg-surface-dim p-1" role="tablist" aria-label="Planejamento">
        {([
          ["fixas", "Contas fixas", CalendarClock],
          ["parcelas", "Parcelamentos", CreditCard],
        ] as const).map(([id, rotulo, Icone]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => trocarAba(id)}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${aba === id ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-primary"}`}>
            <Icone size={16} /> {rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Não foi possível carregar o planejamento.</p>
          <button type="button" className="btn btn-ghost h-10" onClick={carregar}>Tentar novamente</button>
        </div>
      )}

      {aba === "fixas" && (
        recorrentes ? (
          <ListaRecorrentes recorrentes={recorrentes} onAtualizar={carregar} />
        ) : !erro && <SkeletonCard altura={320} />
      )}

      {aba === "parcelas" && (
        <>
          <CalculadoraParcelamento onRegistrado={carregar} />
          {parcelamentos ? (
            <ParcelasEmAberto dados={parcelamentos} onAtualizar={carregar} />
          ) : !erro && <SkeletonCard altura={240} />}
        </>
      )}
    </div>
  );
}

export default function Page() {
  // useSearchParams precisa de Suspense para a página poder ser pré-renderizada.
  return (
    <Suspense fallback={null}>
      <Conteudo />
    </Suspense>
  );
}
