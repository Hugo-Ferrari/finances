import { formatarMoeda } from "@/app/lib/formatters";
import { diaPorExtenso } from "@/app/lib/financas";
import { DiaPlanejado } from "@/app/types/planejamento";

const moedaCurta = (v: number) =>
  v >= 1000
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v)
    : formatarMoeda(v).replace(",00", "");

/** Faixa dos próximos dias: quanto sobra por dia e o que vence em cada um. */
export default function ProximosDias({ dias }: { dias: DiaPlanejado[] }) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-primary">Próximos dias</h2>
        <p className="text-xs text-muted">quanto sobra por dia, já descontadas as contas</p>
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {dias.map((d, i) => {
          const salario = d.porDia === null;
          const conta = d.eventos.find((e) => e.tipo === "SAIDA" && !e.paga);
          const estilo = i === 0
            ? "border-primary bg-primary text-white"
            : salario
              ? "border-income-muted bg-income-light"
              : conta
                ? "border-expense-muted bg-expense-light"
                : "border-border";
          const rotulo = salario
            ? d.eventos.find((e) => e.ehSalario)?.descricao ?? "Salário"
            : conta
              ? conta.descricao + (d.eventos.filter((e) => e.tipo === "SAIDA" && !e.paga).length > 1 ? " +" : "")
              : diaPorExtenso(d.data, { day: "2-digit", month: "2-digit" });
          const titulo = d.eventos.map((e) => `${e.descricao}: ${formatarMoeda(e.valor)}${e.paga ? " (pago)" : ""}`).join("\n");
          return (
            <li key={d.data} title={titulo || undefined} className={`num flex min-w-0 flex-col items-center rounded-2xl border px-1 py-2.5 text-center ${estilo}`}>
              <span className={`text-[11px] font-bold uppercase ${i === 0 ? "text-white/75" : "text-muted-light"}`}>
                {i === 0 ? "Hoje" : diaPorExtenso(d.data, { weekday: "short" }).replace(".", "")}
              </span>
              <span className="mt-0.5 text-[15px] font-extrabold">
                {salario ? moedaCurta(d.eventos.find((e) => e.ehSalario)?.valor ?? 0) : moedaCurta(d.porDia ?? 0)}
              </span>
              <span className={`w-full truncate px-1 text-[11px] ${i === 0 ? "text-white/75" : salario ? "font-bold text-income" : conta ? "font-bold text-expense" : "text-muted"}`}>
                {i === 0 ? diaPorExtenso(d.data, { day: "2-digit", month: "2-digit" }) : rotulo}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" /> Hoje</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-expense-muted" /> Conta vence (já descontada)</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-income-muted" /> Salário</span>
      </div>
    </section>
  );
}
