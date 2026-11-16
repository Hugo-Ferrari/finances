import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Receipt } from "lucide-react";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import { formatarNomeCategoria } from "@/app/lib/financas";
import { Transacao } from "@/app/types/transacao";
import EmptyState from "@/app/components/ui/EmptyState";

export function LinhaTransacao({ transacao }: { transacao: Transacao }) {
  const entrada = transacao.tipoTransacao === "ENTRADA";
  const Icone = entrada ? ArrowUpRight : ArrowDownLeft;
  const titulo =
    transacao.descricao?.trim() ||
    (transacao.categoria ? formatarNomeCategoria(transacao.categoria.nome) : entrada ? "Entrada" : "Saída");

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          entrada ? "bg-income-light text-income" : "bg-expense-light text-expense"
        }`}
      >
        <Icone size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{titulo}</p>
        <p className="truncate text-xs text-muted">
          {transacao.categoria ? formatarNomeCategoria(transacao.categoria.nome) : "Sem categoria"}
          {" · "}
          {transacao.conta.nome}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`num text-sm font-bold ${entrada ? "text-income" : "text-foreground"}`}>
          {entrada ? "+ " : "− "}
          {formatarMoeda(transacao.valor)}
        </p>
        <p className="text-xs text-muted-light">{formatarData(transacao.data)}</p>
      </div>
    </div>
  );
}

export default function TransacoesRecentes({ transacoes }: { transacoes: Transacao[] }) {
  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Últimas movimentações</h2>
          <p className="mt-0.5 text-sm text-muted">O que entrou e saiu recentemente</p>
        </div>
        <Link href="/transacoes" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-accent hover:underline">
          Ver todas <ChevronRight size={15} />
        </Link>
      </div>

      {transacoes.length === 0 ? (
        <EmptyState
          icon={<Receipt size={24} />}
          title="Nenhuma transação ainda"
          description="Registre sua primeira entrada ou despesa."
        />
      ) : (
        <div className="mt-2 divide-y divide-border">
          {transacoes.map((t) => (
            <LinhaTransacao key={t.id} transacao={t} />
          ))}
        </div>
      )}
    </section>
  );
}
