"use client";

import { useEffect, useState } from "react";
import { Check, PiggyBank } from "lucide-react";
import { alterarMeta, obterMeta } from "@/app/services/planejamento.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { lerValor } from "@/app/lib/financas";

const SUGESTOES = [10, 15, 20, 30];

/** Ajustes: quanto da renda a pessoa quer guardar (usado no "pode gastar hoje"). */
export default function CardMetaEconomia() {
  const [meta, setMeta] = useState("");
  const [salva, setSalva] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    obterMeta()
      .then(({ metaEconomia }) => {
        setSalva(metaEconomia);
        setMeta(String(metaEconomia).replace(".", ","));
      })
      .catch(() => setMensagem({ tipo: "erro", texto: "Não foi possível carregar a meta." }));
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const valor = lerValor(meta);
    if (!Number.isFinite(valor) || valor < 0 || valor > 90) {
      setMensagem({ tipo: "erro", texto: "Use um valor entre 0% e 90%." });
      return;
    }
    setSalvando(true);
    setMensagem(null);
    try {
      const r = await alterarMeta(Math.round(valor * 10) / 10);
      setSalva(r.metaEconomia);
      setMensagem({ tipo: "ok", texto: "Meta salva." });
    } catch (error) {
      setMensagem({ tipo: "erro", texto: mensagemDeErro(error, "Não foi possível salvar a meta.") });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent">
          <PiggyBank size={20} />
        </div>
        <div>
          <h2 className="font-bold text-primary">Meta de economia</h2>
          <p className="text-sm text-muted">Quanto da sua renda você quer guardar todo mês</p>
        </div>
      </div>

      <form onSubmit={salvar} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button key={s} type="button" onClick={() => setMeta(String(s))}
              className={`h-9 rounded-full border px-4 text-sm font-bold transition ${lerValor(meta) === s ? "border-primary bg-primary text-white" : "border-border text-muted hover:border-accent"}`}>
              {s}%
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="meta-economia" className="sr-only">Meta em %</label>
          <div className="form-input-group form-input-group--compact w-28">
            <input id="meta-economia" inputMode="decimal" className="form-input-control font-bold" value={meta} onChange={(e) => setMeta(e.target.value)} />
            <span className="text-sm font-bold text-muted">%</span>
          </div>
          <button type="submit" className="btn btn-primary h-11" disabled={salvando || lerValor(meta) === salva}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <p className="text-xs leading-5 text-muted">
          O &quot;pode gastar hoje&quot; separa esse valor do salário antes de dividir o resto pelos dias. O que você
          coloca nas caixinhas conta para a meta.
        </p>
        {mensagem && (
          <p role="status" className={`flex items-center gap-2 text-sm font-medium ${mensagem.tipo === "ok" ? "text-income" : "text-expense"}`}>
            {mensagem.tipo === "ok" && <Check size={15} />} {mensagem.texto}
          </p>
        )}
      </form>
    </section>
  );
}
