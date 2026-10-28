import { Transacao } from "@/app/types/transacao";
import { formatarMoeda, formatarData } from "@/app/lib/formatters";

interface TransacaoItemProps {
  transacao: Transacao;
}

function TransacaoItem({ transacao }: TransacaoItemProps) {
  const isEntrada = transacao.tipoTransacao === "ENTRADA";

  return (
    <div className="grid grid-cols-6 items-center gap-4 border-b border-border px-5 py-4 text-sm transition-colors last:border-b-0 hover:bg-surface-hover">
     
      <span className="font-mono text-xs font-semibold text-muted-light">
        #{transacao.id}
      </span>

      
      <span className="text-muted">{formatarData(transacao.data)}</span>

      
      <span className="truncate font-medium text-foreground">
        {transacao.descricao || "Sem descrição"}
      </span>

      
      <span className="truncate text-muted">{transacao.conta.nome}</span>

     
      <span className="truncate text-muted">
        {transacao.categoria?.nome || "—"}
      </span>

     
      <span
        className={`text-right font-bold ${
          isEntrada ? "text-income" : "text-expense"
        }`}
      >
        {isEntrada ? "+" : "−"} {formatarMoeda(transacao.valor)}
      </span>
    </div>
  );
}

export default TransacaoItem;
