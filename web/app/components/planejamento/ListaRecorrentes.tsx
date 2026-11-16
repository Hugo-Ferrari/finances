"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleSlash,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
  Undo2,
  Wallet,
} from "lucide-react";
import EmptyState from "@/app/components/ui/EmptyState";
import { formatarMoeda } from "@/app/lib/formatters";
import { diaPorExtenso, formatarNomeCategoria } from "@/app/lib/financas";
import { mensagemDeErro } from "@/app/lib/erros";
import {
  atualizarRecorrente,
  desfazerRecorrente,
  excluirRecorrente,
  pularRecorrente,
} from "@/app/services/planejamento.service";
import { Recorrente } from "@/app/types/planejamento";
import ModalPagar, { ItemPagar } from "./ModalPagar";
import ModalRecorrente from "./ModalRecorrente";

const PILULA = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";

function Situacao({ r }: { r: Recorrente }) {
  const pendente = r.pendentes[0];
  if (!r.ativo) return <span className={`${PILULA} bg-surface-dim text-muted`}>Pausada</span>;
  if (pendente?.atrasada)
    return <span className={`${PILULA} bg-expense-light text-expense`}>Atrasada · {diaPorExtenso(pendente.data, { day: "2-digit", month: "2-digit" })}</span>;
  if (r.mesAtual?.status === "PAGA")
    return <span className={`${PILULA} bg-income-light text-income`}>{r.tipoTransacao === "ENTRADA" ? "Recebido" : "Paga"} este mês</span>;
  if (r.mesAtual?.status === "PULADA") return <span className={`${PILULA} bg-surface-dim text-muted`}>Pulada este mês</span>;
  if (r.proxima)
    return <span className={`${PILULA} bg-warning-light text-warning`}>Vence {diaPorExtenso(r.proxima.data, { day: "2-digit", month: "2-digit" })}</span>;
  return <span className={`${PILULA} bg-surface-dim text-muted`}>Encerrada</span>;
}

function Linha({
  r,
  onPagar,
  onEditar,
  onAtualizar,
  onErro,
}: {
  r: Recorrente;
  onPagar: (item: ItemPagar) => void;
  onEditar: () => void;
  onAtualizar: () => void;
  onErro: (m: string) => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const entrada = r.tipoTransacao === "ENTRADA";
  const pendente = r.pendentes[0];
  const resolvidoNoMes = r.mesAtual && r.mesAtual.status !== "PENDENTE" ? r.mesAtual : null;

  async function executar(acao: () => Promise<unknown>, erro: string) {
    setOcupado(true);
    try {
      await acao();
      onAtualizar();
    } catch (e) {
      onErro(mensagemDeErro(e, erro));
    } finally {
      setOcupado(false);
    }
  }

  const botao = "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:bg-accent-light hover:text-accent disabled:opacity-50";
  return (
    <li className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${r.ativo ? "" : "opacity-60"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${entrada ? "bg-income-light text-income" : "bg-expense-light text-expense"}`}>
          {entrada ? <ArrowUpRight size={19} /> : <ArrowDownRight size={19} />}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
            <span className="truncate">{r.descricao}</span>
            {r.ehSalario && <span className={`${PILULA} bg-accent-light text-accent`}>Salário</span>}
          </p>
          <p className="truncate text-xs text-muted">
            Todo dia {r.diaDoMes}
            {r.conta ? ` · ${r.conta.nome}` : ""}
            {r.categoria ? ` · ${formatarNomeCategoria(r.categoria.nome)}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <Situacao r={r} />
        <span className={`num w-28 text-right text-sm font-extrabold ${entrada ? "text-income" : "text-expense"}`}>
          {entrada ? "+ " : "− "}
          {formatarMoeda(r.valor)}
        </span>
        <div className="flex gap-1.5">
          {r.ativo && pendente && (
            <button
              type="button"
              className={botao}
              disabled={ocupado}
              title={entrada ? "Confirmar recebimento" : "Marcar como paga"}
              aria-label={`${entrada ? "Confirmar recebimento de" : "Marcar como paga"} ${r.descricao}`}
              onClick={() =>
                onPagar({
                  recorrenteId: r.id,
                  descricao: r.descricao,
                  valor: r.valor,
                  tipo: r.tipoTransacao,
                  competencia: pendente.competencia,
                  data: pendente.data,
                  parcela: pendente.parcela,
                  parcelasTotal: r.parcelasTotal,
                  contaId: r.conta?.id,
                })
              }
            >
              <Check size={16} />
            </button>
          )}
          {r.ativo && pendente && (
            <button type="button" className={botao} disabled={ocupado} title="Pular este mês" aria-label={`Pular ${r.descricao} este mês`}
              onClick={() => executar(() => pularRecorrente(r.id, pendente.competencia), "Não foi possível pular o mês.")}>
              <CircleSlash size={16} />
            </button>
          )}
          {resolvidoNoMes && (
            <button type="button" className={botao} disabled={ocupado}
              title={resolvidoNoMes.status === "PAGA" ? "Desfazer (apaga a transação lançada)" : "Desfazer"}
              aria-label={`Desfazer ${r.descricao} deste mês`}
              onClick={() => {
                if (resolvidoNoMes.status === "PAGA" && !confirm("Desfazer apaga a transação lançada e devolve o saldo da conta. Continuar?")) return;
                executar(() => desfazerRecorrente(r.id, resolvidoNoMes.competencia), "Não foi possível desfazer.");
              }}>
              <Undo2 size={16} />
            </button>
          )}
          <button type="button" className={botao} disabled={ocupado} title="Editar" aria-label={`Editar ${r.descricao}`} onClick={onEditar}>
            <Pencil size={15} />
          </button>
          <button type="button" className={botao} disabled={ocupado} title={r.ativo ? "Pausar" : "Reativar"} aria-label={`${r.ativo ? "Pausar" : "Reativar"} ${r.descricao}`}
            onClick={() => executar(() => atualizarRecorrente(r.id, { ativo: !r.ativo }), "Não foi possível alterar.")}>
            {r.ativo ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" className={`${botao} hover:!border-expense hover:!bg-expense-light hover:!text-expense`} disabled={ocupado} title="Excluir" aria-label={`Excluir ${r.descricao}`}
            onClick={() => {
              if (!confirm(`Excluir "${r.descricao}"? As transações já lançadas continuam no extrato.`)) return;
              executar(() => excluirRecorrente(r.id), "Não foi possível excluir.");
            }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </li>
  );
}

/** Aba "Contas fixas": salário, aluguel, assinaturas... */
export default function ListaRecorrentes({
  recorrentes,
  onAtualizar,
}: {
  recorrentes: Recorrente[];
  onAtualizar: () => void;
}) {
  const [pagando, setPagando] = useState<ItemPagar | null>(null);
  const [editando, setEditando] = useState<Recorrente | "novo-saida" | "novo-entrada" | null>(null);
  const [erro, setErro] = useState("");

  const fixas = recorrentes.filter((r) => r.parcelasTotal === null);
  const entradas = fixas.filter((r) => r.tipoTransacao === "ENTRADA");
  const saidas = fixas.filter((r) => r.tipoTransacao === "SAIDA");
  const soma = (l: Recorrente[]) => l.filter((r) => r.ativo).reduce((t, r) => t + r.valor, 0);
  const totalEntradas = soma(entradas);
  const totalSaidas = soma(saidas);
  const temSalario = entradas.some((r) => r.ehSalario && r.ativo);

  const grupo = (titulo: string, lista: Recorrente[], vazio: string, tipo: "novo-saida" | "novo-entrada") => (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-primary">{titulo}</h2>
        <button type="button" className="btn btn-ghost h-9 text-sm" onClick={() => setEditando(tipo)}>
          <Plus size={15} /> Adicionar
        </button>
      </div>
      {lista.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{vazio}</p>
      ) : (
        <ul className="mt-1 divide-y divide-border">
          {lista.map((r) => (
            <Linha key={r.id} r={r} onPagar={setPagando} onEditar={() => setEditando(r)} onAtualizar={onAtualizar} onErro={setErro} />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="flex flex-col gap-5">
      {fixas.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={<Wallet size={26} />}
            title="Nenhuma conta fixa ainda"
            description="Cadastre seu salário e o que você paga todo mês. Assim o app sabe quanto você pode gastar por dia."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="btn btn-primary" onClick={() => setEditando("novo-entrada")}>
                  <Plus size={16} /> Cadastrar salário
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditando("novo-saida")}>
                  <Plus size={16} /> Conta a pagar
                </button>
              </div>
            }
          />
        </section>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-3">
            {[
              { rotulo: "Entra todo mês", valor: totalEntradas, cor: "text-income" },
              { rotulo: "Sai todo mês", valor: totalSaidas, cor: "text-expense" },
              { rotulo: "Sobra", valor: totalEntradas - totalSaidas, cor: totalEntradas - totalSaidas >= 0 ? "text-primary" : "text-expense" },
            ].map((k) => (
              <div key={k.rotulo} className="card min-w-0 p-3 sm:p-4">
                <p className="text-xs font-semibold text-muted">{k.rotulo}</p>
                <p className={`num mt-1 truncate text-sm font-extrabold sm:text-xl ${k.cor}`}>{formatarMoeda(k.valor)}</p>
              </div>
            ))}
          </section>
          {!temSalario && (
            <p className="rounded-xl bg-warning-light px-4 py-3 text-sm text-warning">
              Marque uma entrada como <strong>salário</strong> para o &quot;pode gastar hoje&quot; dividir o dinheiro até o dia do pagamento.
            </p>
          )}
          {erro && <p role="alert" className="rounded-xl bg-expense-light px-4 py-3 text-sm font-medium text-expense">{erro}</p>}
          {grupo("Dinheiro que entra", entradas, "Cadastre seu salário e outras rendas fixas.", "novo-entrada")}
          {grupo("Contas a pagar", saidas, "Aluguel, internet, academia, assinaturas...", "novo-saida")}
        </>
      )}

      {pagando && (
        <ModalPagar item={pagando} onFechar={() => setPagando(null)} onPago={() => { setPagando(null); setErro(""); onAtualizar(); }} />
      )}
      {editando && (
        <ModalRecorrente
          recorrente={typeof editando === "object" ? editando : undefined}
          tipoInicial={editando === "novo-entrada" ? "ENTRADA" : "SAIDA"}
          onFechar={() => setEditando(null)}
          onSalvo={() => { setEditando(null); setErro(""); onAtualizar(); }}
        />
      )}
    </div>
  );
}
