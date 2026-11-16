"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Receipt,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";
import { formatarNomeCategoria } from "@/app/lib/financas";
import { Transacao } from "@/app/types/transacao";
import EmptyState from "@/app/components/ui/EmptyState";
import { deletarTransacao } from "@/app/services/transacao.service";
import { mensagemDeErro } from "@/app/lib/erros";

export function LinhaTransacao({
  transacao,
  onExcluir,
}: {
  transacao: Transacao;
  onExcluir?: (id: number) => void;
}) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const entrada = transacao.tipoTransacao === "ENTRADA";
  const Icone = entrada ? ArrowUpRight : ArrowDownLeft;
  const titulo =
    transacao.descricao?.trim() ||
    (transacao.categoria ? formatarNomeCategoria(transacao.categoria.nome) : entrada ? "Entrada" : "Saída");

  useEffect(() => {
    if (!confirmandoExclusao) return;

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !excluindo) {
        setConfirmandoExclusao(false);
        setErroExclusao("");
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [confirmandoExclusao, excluindo]);

  async function excluir() {
    if (!onExcluir) return;

    setExcluindo(true);
    setErroExclusao("");
    try {
      await deletarTransacao(transacao.id);
      onExcluir(transacao.id);
      setConfirmandoExclusao(false);
    } catch (error) {
      setErroExclusao(
        mensagemDeErro(error, "Não foi possível excluir a transação. Tente novamente."),
      );
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 py-3 sm:gap-3">
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
        {onExcluir && (
          <button
            type="button"
            aria-label={`Excluir transação ${titulo}`}
            title="Excluir transação"
            onClick={() => {
              setErroExclusao("");
              setConfirmandoExclusao(true);
            }}
            className="btn btn-icon ml-1 text-muted transition hover:bg-expense-light hover:text-expense"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      {confirmandoExclusao && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !excluindo) {
              setConfirmandoExclusao(false);
              setErroExclusao("");
            }
          }}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`excluir-transacao-${transacao.id}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-expense-light text-expense">
                <AlertTriangle size={20} />
              </span>
              <div className="min-w-0">
                <h2
                  id={`excluir-transacao-${transacao.id}`}
                  className="text-lg font-bold text-foreground"
                >
                  Excluir transação?
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Essa ação é permanente. O saldo da conta será atualizado automaticamente.
                </p>
              </div>
            </div>
            {erroExclusao && (
              <p className="mt-4 text-sm font-medium text-expense" role="alert">
                {erroExclusao}
              </p>
            )}
            <div className="modal-actions mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setConfirmandoExclusao(false);
                  setErroExclusao("");
                }}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={excluir}
                disabled={excluindo}
              >
                {excluindo ? "Excluindo..." : "Excluir transação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
