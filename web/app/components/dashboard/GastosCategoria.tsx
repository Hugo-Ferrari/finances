import Link from "next/link";
import { ChevronRight, PieChart } from "lucide-react";
import { formatarMoeda } from "@/app/lib/formatters";
import { GastoCategoria } from "@/app/lib/financas";
import EmptyState from "@/app/components/ui/EmptyState";
import IconeCategoria from "@/app/components/categoria/IconeCategoria";

const CORES = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"];
const MAXIMO = 5;

/** Para onde foi o dinheiro no mês, comparando com o limite de cada categoria. */
export default function GastosCategoria({ gastos }: { gastos: GastoCategoria[] }) {
  const total = gastos.reduce((t, g) => t + g.valor, 0);
  const principais = gastos.slice(0, MAXIMO);
  const outros = gastos.slice(MAXIMO).reduce((t, g) => t + g.valor, 0);

  return (
    <section className="card flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Para onde foi o dinheiro</h2>
          <p className="mt-0.5 text-sm text-muted">Gastos do mês por categoria</p>
        </div>
        <Link
          href="/categorias"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim text-muted transition hover:bg-primary hover:text-white"
          aria-label="Ver categorias"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState icon={<PieChart size={24} />} title="Nenhum gasto neste mês" />
      ) : (
        <>
          {/* Barra empilhada com a participação de cada categoria */}
          <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-surface-dim">
            {principais.map((g, i) => (
              <span
                key={g.categoriaId ?? "sem"}
                style={{ width: `${(g.valor / total) * 100}%`, background: `var(${CORES[i]})` }}
                title={g.nome}
              />
            ))}
            {outros > 0 && (
              <span style={{ width: `${(outros / total) * 100}%`, background: "var(--chart-7)" }} />
            )}
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {principais.map((g, i) => {
              const usoLimite = g.limite ? g.valor / g.limite : null;
              return (
                <li key={g.categoriaId ?? "sem"} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, var(${CORES[i]}) 14%, transparent)`,
                      color: `var(${CORES[i]})`,
                    }}
                  >
                    <IconeCategoria categoriaId={g.categoriaId} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{g.nome}</p>
                      <p className="num shrink-0 text-sm font-bold text-foreground">
                        {formatarMoeda(g.valor)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                      <span className="num">{Math.round((g.valor / total) * 100)}% dos gastos</span>
                      {usoLimite !== null && (
                        <span
                          className={`num font-semibold ${
                            usoLimite >= 1 ? "text-expense" : usoLimite >= 0.8 ? "text-warning" : "text-muted"
                          }`}
                        >
                          {Math.round(usoLimite * 100)}% do limite
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {outros > 0 && (
            <p className="num mt-4 text-xs text-muted">
              + {formatarMoeda(outros)} em outras categorias
            </p>
          )}
        </>
      )}
    </section>
  );
}
