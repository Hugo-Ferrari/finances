"use client";

import { criarConta } from "@/app/services/conta.service";
import { ArrowRight, Landmark, X } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  onClose: () => void;
};

function NovaConta({ onClose }: Props) {
  const [nome, setNome] = useState("");
  const [saldo, setSaldo] = useState("");
  const [tipo, setTipo] = useState("CORRENTE");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe um nome para a conta.");
      return;
    }

    const saldoNumerico = Number(saldo.replace(",", "."));
    if (!Number.isFinite(saldoNumerico)) {
      setErro("Informe um saldo válido.");
      return;
    }

    try {
      setCarregando(true);
      await criarConta({ nome: nome.trim(), saldo: saldoNumerico, tipo });
      window.dispatchEvent(new Event("conta-criada"));
      onClose();
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      setErro("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-primary">
              Nova conta
            </h2>
            <p className="mt-1 text-sm text-muted">
              Adicione uma conta para acompanhar seu saldo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário"
          className="rounded-lg p-2 text-muted transition hover:bg-surface-dim hover:text-primary"
        >
          <X size={18} />
        </button>
      </div>

      <form
        onSubmit={enviarFormulario}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_auto] lg:items-end"
      >
        <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-muted">
          Nome da conta
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Ex.: Conta principal"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-muted">
          Saldo inicial
          <input
            type="text"
            inputMode="decimal"
            value={saldo}
            onChange={(event) => setSaldo(event.target.value)}
            placeholder="0,00"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-muted">
          Tipo de conta
          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          >
            <option value="CORRENTE">Conta corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="CARTEIRA">Carteira</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={carregando}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Criar conta"}
          {!carregando && <ArrowRight size={16} />}
        </button>
      </form>

      {erro && (
        <p role="alert" className="mt-4 text-sm font-medium text-expense">
          {erro}
        </p>
      )}
    </div>
  );
}

export default NovaConta;
