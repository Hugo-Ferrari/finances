"use client";

import { useState } from "react";
import { Check, CreditCard, Trash2 } from "lucide-react";
import EmptyState from "@/app/components/ui/EmptyState";
import GraficoComprometimento from "./GraficoComprometimento";
import ModalPagar, { ItemPagar } from "./ModalPagar";
import { formatarMoeda } from "@/app/lib/formatters";
import { diaPorExtenso, nomeDoMes } from "@/app/lib/financas";
import { mensagemDeErro } from "@/app/lib/erros";
import { excluirRecorrente } from "@/app/services/planejamento.service";
import { ListaParcelamentos } from "@/app/types/planejamento";

/** Compras parceladas: quanto falta, quando termina e o peso de cada mês. */
export default function ParcelasEmAberto({
  dados,
  onAtualizar,
}: {
  dados: ListaParcelamentos;
  onAtualizar: () => void;
}) {
  const [pagando, setPagando] = useState<ItemPagar | null>(null);
  const [erro, setErro] = useState("");
  const abertas = dados.compras.filter((c) => !c.parcelamento?.quitada);
  const quitadas = dados.compras.filter((c) => c.parcelamento?.quitada);

  // Primeiro mês em que as parcelas de hoje diminuem (alguma compra termina).
  const alivio = dados.comprometimento.find(
    (m, i) => i > 0 && m.parcelas < dados.comprometimento[i - 1].parcelas,
  );

  async function excluir(id: number, nome: string) {
    if (!confirm(`Excluir a compra "${nome}"? As parcelas já lançadas continuam no extrato.`)) return;
    try {
      await excluirRecorrente(id);
      onAtualizar();
    } catch (e) {
      setErro(mensagemDeErro(e, "Não foi possível excluir."));
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-primary">Parcelas em aberto</h2>
          <p className="text-sm text-muted">Compras parceladas que você registrou.</p>
        </div>
        {abertas.length > 0 && (
          <div className="num flex gap-5 text-right">
            <div>
              <p className="text-xs font-semibold text-muted">Por mês</p>
              <p className="text-lg font-extrabold text-expense">{formatarMoeda(dados.porMes)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Falta pagar</p>
              <p className="text-lg font-extrabold text-primary">{formatarMoeda(dados.totalRestante)}</p>
            </div>
          </div>
        )}
      </div>

      {erro && <p role="alert" className="mt-3 rounded-xl bg-expense-light px-4 py-3 text-sm text-expense">{erro}</p>}

      {dados.compras.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={26} />}
          title="Nenhuma compra parcelada"
          description="Use a calculadora acima e clique em “Registrar compra parcelada”."
        />
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-3">
            {[...abertas, ...quitadas].map((c) => {
              const p = c.parcelamento!;
              const pendente = c.pendentes[0];
              return (
                <li key={c.id} className={`rounded-2xl border border-border p-4 ${p.quitada ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{c.descricao}</p>
                      <p className="num text-xs text-muted">
                        {c.parcelasTotal}x {formatarMoeda(c.valor)}
                        {c.valorAVista ? ` · à vista ${formatarMoeda(c.valorAVista)}` : ""}
                        {c.conta ? ` · ${c.conta.nome}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pendente && (
                        <button type="button" className="btn btn-ghost h-9 text-sm"
                          onClick={() => setPagando({
                            recorrenteId: c.id, descricao: c.descricao, valor: c.valor, tipo: "SAIDA",
                            competencia: pendente.competencia, data: pendente.data, parcela: pendente.parcela,
                            parcelasTotal: c.parcelasTotal, contaId: c.conta?.id,
                          })}>
                          <Check size={15} /> Pagar {pendente.parcela}ª
                        </button>
                      )}
                      <button type="button" aria-label={`Excluir ${c.descricao}`} title="Excluir"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-expense hover:bg-expense-light hover:text-expense"
                        onClick={() => excluir(c.id, c.descricao)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="progress mt-3 h-2.5">
                    <span style={{ width: `${(p.pagas / (c.parcelasTotal ?? 1)) * 100}%`, background: p.quitada ? "var(--income)" : "var(--chart-3)" }} />
                  </div>
                  <div className="num mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
                    <span><strong className="text-foreground">{p.pagas}</strong> de {c.parcelasTotal} pagas</span>
                    {p.quitada ? (
                      <span className="font-bold text-income">Quitada</span>
                    ) : (
                      <>
                        <span>
                          {pendente?.atrasada ? <strong className="text-expense">Atrasada: </strong> : "Próxima: "}
                          {c.proxima || pendente ? diaPorExtenso((pendente ?? c.proxima)!.data, { day: "2-digit", month: "2-digit" }) : "—"}
                        </span>
                        <span>Falta {formatarMoeda(p.valorRestante)}</span>
                        <span>Termina em {nomeDoMes(p.ultimaParcela.slice(0, 7), "short").toLowerCase()}/{p.ultimaParcela.slice(2, 4)}</span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {abertas.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-primary">Próximos 12 meses</p>
              {alivio && (
                <p className="num text-sm text-muted">
                  Em {nomeDoMes(alivio.competencia).toLowerCase()} você fica livre de{" "}
                  <strong className="text-income">
                    {formatarMoeda(
                      dados.comprometimento[dados.comprometimento.indexOf(alivio) - 1].parcelas - alivio.parcelas,
                    )}
                  </strong>{" "}
                  por mês em parcelas.
                </p>
              )}
              <GraficoComprometimento dados={dados.comprometimento} />
            </div>
          )}
        </>
      )}

      {pagando && (
        <ModalPagar item={pagando} onFechar={() => setPagando(null)} onPago={() => { setPagando(null); onAtualizar(); }} />
      )}
    </section>
  );
}
