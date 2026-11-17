"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2 } from "lucide-react";
import Modal from "@/app/components/caixinha/Modal";
import { encerrarSessao, excluirConta } from "@/app/services/auth.service";
import { db } from "@/app/services/offline/transacao.queue";
import { useAuthStore } from "@/app/store/auth.store";
import { mensagemDeErro } from "@/app/lib/erros";

/** Exclusão da conta pelo próprio usuário (direito previsto na LGPD). */
export default function ExcluirConta() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  function fechar() {
    setAberto(false);
    setSenha("");
    setErro("");
  }

  async function confirmar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExcluindo(true);
    setErro("");
    try {
      await excluirConta(senha);
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível excluir a conta. Tente novamente."));
      setExcluindo(false);
      return;
    }

    // A conta já foi apagada: limpa o que ficou neste aparelho e sai.
    await Promise.allSettled([encerrarSessao(), db.transacoes.clear()]);
    try {
      localStorage.removeItem("finlogic-preferencias");
    } catch {
      // Navegador sem localStorage: nada para limpar.
    }
    logout();
    router.replace("/login");
  }

  return (
    <section className="card flex flex-col gap-4 border-expense/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="font-semibold text-foreground">Excluir minha conta</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Apaga para sempre seu cadastro, contas, transações, categorias, orçamentos, caixinhas e
          planejamento. Se quiser guardar uma cópia, exporte suas transações antes.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="btn btn-ghost h-10 shrink-0 self-start text-expense sm:self-auto"
      >
        <Trash2 size={16} /> Excluir conta
      </button>

      {aberto && (
        <Modal
          titulo="Excluir minha conta"
          descricao="Essa ação é permanente e não pode ser desfeita. Digite sua senha para confirmar."
          onFechar={fechar}
          bloqueado={excluindo}
        >
          <form method="post" onSubmit={confirmar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="excluir-senha" className="form-label">
                Senha
              </label>
              <div className="form-input-group">
                <Lock size={17} className="shrink-0 text-muted-light" />
                <input
                  id="excluir-senha"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={excluindo}
                  className="form-input-control"
                  autoFocus
                />
              </div>
            </div>

            {erro && (
              <div role="alert" className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
                {erro}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={fechar} disabled={excluindo} className="btn btn-ghost h-11">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={excluindo || !senha}
                className="btn btn-danger h-11"
              >
                {excluindo ? "Excluindo..." : "Excluir para sempre"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
