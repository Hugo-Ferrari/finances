"use client";

import { Conta } from "@/app/types/conta";
import { formatarMoeda } from "@/app/lib/formatters";
import {
  excluirConta,
  update as atualizarConta,
} from "@/app/services/conta.service";
import {
  AlertTriangle,
  ArrowUpRight,
  MoreVertical,
  Save,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BlocoContaProps {
  conta: Conta;
  onContaExcluida: (id: number) => void;
  onContaAtualizada: (conta: Conta) => void;
}

function BlocoConta({
  conta,
  onContaExcluida,
  onContaAtualizada,
}: BlocoContaProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeConta, setNomeConta] = useState(conta.nome);
  const [saldoConta, setSaldoConta] = useState(String(conta.saldo));
  const [tipoConta, setTipoConta] = useState<Conta["tipo"]>(conta.tipo);

  useEffect(() => {
    if (!modalAberto) return;

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !excluindo && !salvando) {
        setModalAberto(false);
        setConfirmandoExclusao(false);
        setErro("");
      }
    }

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [modalAberto, excluindo, salvando]);

  function abrirModal() {
    setNomeConta(conta.nome);
    setSaldoConta(String(conta.saldo));
    setTipoConta(conta.tipo);
    setConfirmandoExclusao(false);
    setErro("");
    setModalAberto(true);
  }

  async function handleAtualizarConta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const nome = nomeConta.trim();
    if (!nome) {
      setErro("Informe um nome para a conta.");
      return;
    }

    const saldo = Number(saldoConta.replace(",", "."));
    if (!Number.isFinite(saldo)) {
      setErro("Informe um saldo válido.");
      return;
    }

    const contaAtualizada: Conta = {
      ...conta,
      nome,
      saldo: String(saldo),
      tipo: tipoConta,
    };

    try {
      setSalvando(true);
      await atualizarConta(conta.id, contaAtualizada);
      onContaAtualizada(contaAtualizada);
      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      setErro("Não foi possível atualizar a conta. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirConta() {
    try {
      setExcluindo(true);
      setErro("");

      await excluirConta(conta.id);
      onContaExcluida(conta.id);
      setModalAberto(false);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setErro("Não foi possível excluir a conta. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <article className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
            <Wallet size={20} className="text-primary" />
          </div>

          <div>
            <h2 className="font-bold text-foreground">{conta.nome}</h2>
            <p className="text-xs text-muted">{conta.tipo}</p>
          </div>
        </div>

        <span
          className={`badge ${
            conta.ativa ? "badge-income" : "badge-expense"
          }`}
        >
          {conta.ativa ? "Ativa" : "Inativa"}
        </span>
        <button
          type="button"
          aria-label={`Gerenciar conta ${conta.nome}`}
          title="Gerenciar conta"
          onClick={abrirModal}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="mt-6">
        <p className="text-xs text-muted">Saldo disponível</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
          {formatarMoeda(conta.saldo)}
        </p>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <Link
          href="/transacoes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          Ver transações
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-xs px-4 animate-in fade-in duration-200"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !excluindo &&
              !salvando
            ) {
              setModalAberto(false);
              setConfirmandoExclusao(false);
              setErro("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gerenciar-conta-titulo"
            aria-describedby="gerenciar-conta-descricao"
            className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl border border-border/40 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  confirmandoExclusao
                    ? "bg-red-500/10 text-red-500"
                    : "bg-primary-light text-primary"
                }`}
              >
                {confirmandoExclusao ? (
                  <AlertTriangle size={24} />
                ) : (
                  <Wallet size={24} />
                )}
              </div>

              <div className="flex-1">
                <h2
                  id="gerenciar-conta-titulo"
                  className="text-lg font-bold text-foreground tracking-tight"
                >
                  {confirmandoExclusao ? "Excluir conta" : "Atualizar conta"}
                </h2>

                <p
                  id="gerenciar-conta-descricao"
                  className="mt-1.5 text-sm text-muted leading-relaxed"
                >
                  {confirmandoExclusao ? (
                    <>
                      Tem certeza que deseja excluir a conta{" "}
                      <strong className="font-semibold text-foreground">
                        {conta.nome}
                      </strong>
                      ? Essa ação é permanente e não poderá ser desfeita.
                    </>
                  ) : (
                    "Altere os dados da conta ou escolha excluí-la."
                  )}
                </p>
              </div>
            </div>

            {!confirmandoExclusao && (
              <form
                id="form-atualizar-conta"
                onSubmit={handleAtualizarConta}
                className="mt-5 space-y-4"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="form-label">Nome da conta</span>
                  <input
                    value={nomeConta}
                    onChange={(event) => setNomeConta(event.target.value)}
                    className="form-input"
                    autoFocus
                    disabled={salvando}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="form-label">Saldo</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={saldoConta}
                    onChange={(event) => setSaldoConta(event.target.value)}
                    className="form-input"
                    disabled={salvando}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="form-label">Tipo de conta</span>
                  <select
                    value={tipoConta}
                    onChange={(event) =>
                      setTipoConta(event.target.value as Conta["tipo"])
                    }
                    className="form-select"
                    disabled={salvando}
                  >
                    <option value="CORRENTE">Conta corrente</option>
                    <option value="POUPANCA">Poupança</option>
                    <option value="CARTEIRA">Carteira</option>
                  </select>
                </label>
              </form>
            )}

            {erro && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-medium text-red-600 border border-red-500/20" role="alert">
                {erro}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirmandoExclusao) {
                    setConfirmandoExclusao(false);
                  } else {
                    setModalAberto(false);
                  }
                  setErro("");
                }}
                disabled={excluindo || salvando}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/10 disabled:opacity-50"
              >
                {confirmandoExclusao ? "Voltar" : "Cancelar"}
              </button>

              {confirmandoExclusao ? (
                <button
                  type="button"
                  onClick={handleExcluirConta}
                  disabled={excluindo}
                  className="inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-500/20 transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {excluindo ? "Excluindo..." : "Sim, excluir"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErro("");
                      setConfirmandoExclusao(true);
                    }}
                    disabled={salvando}
                    className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Excluir conta
                  </button>
                  <button
                    type="submit"
                    form="form-atualizar-conta"
                    disabled={salvando}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {salvando ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar alterações
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default BlocoConta;