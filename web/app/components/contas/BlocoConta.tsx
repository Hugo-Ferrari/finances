"use client";

import { Conta } from "@/app/types/conta";
import { formatarMoeda } from "@/app/lib/formatters";
import { mensagemDeErro } from "@/app/lib/erros";
import { rotuloTipoConta } from "@/app/lib/financas";
import {
  excluirConta,
  update as atualizarConta,
} from "@/app/services/conta.service";
import {
  AlertTriangle,
  Landmark,
  MoreVertical,
  PiggyBank,
  Save,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ModalPortal } from "@/app/components/caixinha/Modal";

interface BlocoContaProps {
  conta: Conta;
  patrimonio: number;
  onContaExcluida: (id: number) => void;
  onContaAtualizada: (conta: Conta) => void;
}

const ICONES_TIPO = { CORRENTE: Landmark, POUPANCA: PiggyBank, CARTEIRA: Wallet } as const;

function BlocoConta({
  conta,
  patrimonio,
  onContaExcluida,
  onContaAtualizada,
}: BlocoContaProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeConta, setNomeConta] = useState(conta.nome);
  const IconeTipo = ICONES_TIPO[conta.tipo] ?? Wallet;
  const parte = patrimonio > 0 ? Math.max(Number(conta.saldo), 0) / patrimonio : 0;
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

    const contaAtualizada: Conta = { ...conta, nome, tipo: tipoConta };

    try {
      setSalvando(true);
      await atualizarConta(conta.id, { nome, tipo: tipoConta });
      onContaAtualizada(contaAtualizada);
      setModalAberto(false);
    } catch (error) {
      setErro(
        mensagemDeErro(error, "Não foi possível atualizar a conta. Tente novamente."),
      );
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
      setErro(
        mensagemDeErro(error, "Não foi possível excluir a conta. Tente novamente."),
      );
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
            <IconeTipo size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-foreground">{conta.nome}</h2>
            <p className="text-xs text-muted">{rotuloTipoConta(conta.tipo)}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!conta.ativa && <span className="badge badge-expense">Inativa</span>}
          <button
            type="button"
            aria-label={`Gerenciar conta ${conta.nome}`}
            title="Gerenciar conta"
            onClick={abrirModal}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-dim hover:text-foreground"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs text-muted">Saldo</p>
        <p className="num mt-1 text-2xl font-extrabold tracking-tight text-foreground">
          {formatarMoeda(conta.saldo)}
        </p>
      </div>

      <div className="mt-4">
        <div className="progress h-1.5">
          <span style={{ width: `${parte * 100}%`, background: "var(--accent)" }} />
        </div>
        <p className="num mt-1.5 text-xs text-muted">{Math.round(parte * 100)}% do patrimônio</p>
      </div>

      {conta.tipo === "POUPANCA" && conta.ativa && Number(conta.saldo) > 0 && (
        <Link
          href={`/caixinhas/nova?${new URLSearchParams({
            conta: String(conta.id),
            nome: conta.nome,
            valor: String(conta.saldo).replace(".", ","),
          })}`}
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent hover:underline"
        >
          <PiggyBank size={15} /> Transformar em caixinha
        </Link>
      )}

      {modalAberto && (
        <ModalPortal>
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
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
              className="modal-content max-w-md"
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
                <div>
                  <label htmlFor={`conta-${conta.id}-nome`} className="form-label">Nome da conta</label>
                  <input
                    id={`conta-${conta.id}-nome`}
                    value={nomeConta}
                    onChange={(event) => setNomeConta(event.target.value)}
                    className="form-input"
                    autoFocus
                    disabled={salvando}
                  />
                </div>

                <div>
                  <label htmlFor={`conta-${conta.id}-saldo`} className="form-label">Saldo</label>
                  <input
                    id={`conta-${conta.id}-saldo`}
                    type="text"
                    value={formatarMoeda(conta.saldo)}
                    className="form-input"
                    readOnly
                    disabled
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    O saldo é atualizado automaticamente pelas transações.
                  </p>
                </div>

                <div>
                  <label htmlFor={`conta-${conta.id}-tipo`} className="form-label">Tipo de conta</label>
                  <select
                    id={`conta-${conta.id}-tipo`}
                    value={tipoConta}
                    onChange={(event) =>
                      setTipoConta(event.target.value as Conta["tipo"])
                    }
                    className="form-select"
                    disabled={salvando}
                  >
                    <option value="CORRENTE">Conta corrente</option>
                    {conta.tipo === "POUPANCA" && <option value="POUPANCA">Poupança</option>}
                    <option value="CARTEIRA">Carteira</option>
                  </select>
                </div>
              </form>
            )}

            {erro && (
              <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm font-medium text-red-600 border border-red-500/20" role="alert">
                {erro}
              </div>
            )}

            <div className="modal-actions mt-6">
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
        </ModalPortal>
      )}
    </article>
  );
}

export default BlocoConta;