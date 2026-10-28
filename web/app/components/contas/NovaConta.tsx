"use client";

import { criarConta } from "@/app/services/conta.service";
import { Landmark, X, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import Button from "@/app/components/ui/Button";

interface NovaConta {
  onClose: () => void;
}

function NovaConta({ onClose }: NovaConta) {
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
    } catch {
      setErro("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="card p-5 animate-fade-in sm:p-6">
      
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
            <Landmark size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-primary">
              Nova conta
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Adicione uma conta para acompanhar seu saldo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-dim hover:text-primary"
        >
          <X size={18} />
        </button>
      </div>

      
      <form
        onSubmit={enviarFormulario}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_minmax(170px,0.9fr)_auto] lg:items-end"
      >
        
        <label className="flex flex-col gap-1.5">
          <span className="form-label">Nome da conta</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Conta principal"
            className="form-input"
            autoFocus
          />
        </label>

        
        <label className="flex flex-col gap-1.5">
          <span className="form-label">Saldo inicial</span>
          <input
            type="text"
            inputMode="decimal"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            placeholder="0,00"
            className="form-input"
          />
        </label>

        
        <label className="flex flex-col gap-1.5">
          <span className="form-label">Tipo de conta</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="form-select"
          >
            <option value="CORRENTE">Conta corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="CARTEIRA">Carteira</option>
          </select>
        </label>

       
        <Button type="submit" loading={carregando}>
          Criar conta
          {!carregando && <ArrowRight size={16} />}
        </Button>
      </form>

      
      {erro && (
        <p role="alert" className="mt-4 text-sm font-medium text-expense animate-fade-in">
          {erro}
        </p>
      )}
    </div>
  );
}

export default NovaConta;
