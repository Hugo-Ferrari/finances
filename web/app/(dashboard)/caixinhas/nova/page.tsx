"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";

import CampoTaxa from "@/app/components/caixinha/CampoTaxa";
import { criarCaixinha } from "@/app/services/caixinha.service";
import { listarConta } from "@/app/services/conta.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarMoeda, paraDiaISO } from "@/app/lib/formatters";
import { lerValor } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";
import { PeriodoTaxa } from "@/app/types/caixinha";

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const contaParam = params.get("conta");

  const [nome, setNome] = useState(params.get("nome") ?? "");
  const [instituicao, setInstituicao] = useState("");
  const [valor, setValor] = useState(params.get("valor") ?? "");
  const [data, setData] = useState(paraDiaISO(new Date()));
  const [taxa, setTaxa] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoTaxa>("MENSAL");
  const [isenta, setIsenta] = useState(false);
  const [contaOrigem, setContaOrigem] = useState(contaParam ?? "");
  const [contas, setContas] = useState<Conta[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarConta()
      .then((lista: Conta[]) => setContas(lista.filter((c) => c.ativa)))
      .catch(() => setContas([]));
  }, []);

  const valorNum = lerValor(valor);
  const taxaNum = lerValor(taxa);
  const taxaMensal =
    Number.isFinite(taxaNum) && taxaNum > 0
      ? periodo === "MENSAL"
        ? taxaNum / 100
        : Math.pow(1 + taxaNum / 100, 1 / 12) - 1
      : 0;
  const exemploMes = (Number.isFinite(valorNum) && valorNum > 0 ? valorNum : 1000) * taxaMensal;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) return setErro("Dê um nome para a caixinha.");
    if (!Number.isFinite(valorNum) || valorNum <= 0) return setErro("Informe quanto você tem aplicado.");
    if (!Number.isFinite(taxaNum) || taxaNum < 0) return setErro("Informe quanto a aplicação rende.");

    setSalvando(true);
    try {
      const criada = await criarCaixinha({
        nome: nome.trim(),
        instituicao: instituicao.trim() || undefined,
        isentaIR: isenta,
        taxa: taxaNum,
        periodo,
        valorInicial: Math.round(valorNum * 100) / 100,
        dataInicial: data,
        contaOrigemId: contaOrigem ? Number(contaOrigem) : undefined,
      });
      router.replace(`/caixinhas/${criada.id}`);
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível criar a caixinha."));
      setSalvando(false);
    }
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl animate-fade-in">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <p className="page-eyebrow">Dinheiro guardado</p>
          <h1 className="page-title">Nova caixinha</h1>
          <p className="page-subtitle">
            Informe quanto você tem aplicado e quanto rende. O saldo passa a crescer sozinho.
          </p>
        </div>

        <form onSubmit={salvar} className="card flex flex-col gap-5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="nome" className="form-label">Nome da caixinha</label>
              <input id="nome" className="form-input" placeholder="Ex.: Reserva de emergência" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="instituicao" className="form-label">Banco ou corretora (opcional)</label>
              <input id="instituicao" className="form-input" placeholder="Ex.: Nubank, Inter, XP" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} maxLength={40} />
            </div>
            <div>
              <label htmlFor="valor" className="form-label">Quanto você tem aplicado</label>
              <div className="flex items-center rounded-[var(--radius-lg)] border border-border bg-background pl-4 focus-within:border-[var(--border-focus)]">
                <span className="text-sm font-bold text-muted">R$</span>
                <input id="valor" inputMode="decimal" className="h-11 w-full bg-transparent px-3 text-sm outline-none focus-visible:outline-none" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} required />
              </div>
            </div>
            <div>
              <label htmlFor="data" className="form-label">Desde quando</label>
              <input id="data" type="date" className="form-input" value={data} max={paraDiaISO(new Date())} onChange={(e) => setData(e.target.value)} required />
            </div>
          </div>

          <div>
            <label htmlFor="taxa" className="form-label">Quanto rende</label>
            <CampoTaxa taxa={taxa} periodo={periodo} onTaxa={setTaxa} onPeriodo={setPeriodo} />
            {taxaMensal > 0 && (
              <p className="num mt-2 text-xs text-accent">
                Com essa taxa, {formatarMoeda(Number.isFinite(valorNum) && valorNum > 0 ? valorNum : 1000)} rendem cerca de{" "}
                <strong>{formatarMoeda(exemploMes)}</strong> por mês.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="conta" className="form-label">O dinheiro saiu de alguma conta?</label>
            <select id="conta" className="form-select" value={contaOrigem} onChange={(e) => setContaOrigem(e.target.value)}>
              <option value="">Não, só quero registrar a caixinha</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  Sim, de {c.nome} ({formatarMoeda(c.saldo)})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Se escolher uma conta, o valor sai do saldo dela sem contar como despesa.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-hover p-4">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--accent)]" checked={isenta} onChange={(e) => setIsenta(e.target.checked)} />
            <span>
              <span className="block text-sm font-semibold text-foreground">Isenta de imposto de renda</span>
              <span className="text-xs text-muted">Marque para LCI, LCA e outras aplicações isentas. Caso contrário, mostramos também o valor líquido.</span>
            </span>
          </label>

          <p className="flex items-start gap-2 text-xs text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            O saldo é uma estimativa com a taxa informada. Se ficar diferente do banco, use “Atualizar saldo” na caixinha.
          </p>

          {erro && (
            <div role="alert" className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? "Criando..." : "Criar caixinha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  // useSearchParams precisa de Suspense para a página poder ser pré-renderizada.
  return (
    <Suspense fallback={null}>
      <Formulario />
    </Suspense>
  );
}
