"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, CheckCircle2, Info, Scale, TrendingDown } from "lucide-react";
import { CaixaErro, CampoDinheiro, lerDinheiro } from "./Campos";
import GraficoComprometimento from "./GraficoComprometimento";
import { listarConta } from "@/app/services/conta.service";
import { listarCategoria } from "@/app/services/categoria.service";
import {
  registrarParcelamento,
  rendimentoSugerido,
  simularParcelamento,
} from "@/app/services/planejamento.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarMoeda, paraDiaISO } from "@/app/lib/formatters";
import { formatarNomeCategoria, lerValor, somarDiasISO } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";
import { DadosSimulacao, ResultadoSimulacao } from "@/app/types/planejamento";

type ModoLoja = "SEM_JUROS" | "PARCELA" | "TAXA";

const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** Calculadora: à vista ou parcelado, juros escondidos e impacto no mês. */
export default function CalculadoraParcelamento({ onRegistrado }: { onRegistrado: () => void }) {
  const hoje = paraDiaISO(new Date());
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState("10");
  const [modo, setModo] = useState<ModoLoja>("SEM_JUROS");
  const [valorParcela, setValorParcela] = useState("");
  const [taxa, setTaxa] = useState("");
  const [desconto, setDesconto] = useState("");
  const [primeira, setPrimeira] = useState(somarDiasISO(hoje, 30));
  const [rendimento, setRendimento] = useState("");
  const [sugestao, setSugestao] = useState<{ nome: string; taxaMensal: number } | null>(null);

  const [ultimoResultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState("");

  // Registro da compra
  const [registrando, setRegistrando] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [pagas, setPagas] = useState("0");
  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nome: string }[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erroRegistro, setErroRegistro] = useState("");
  const [registrado, setRegistrado] = useState("");

  useEffect(() => {
    rendimentoSugerido()
      .then((s) => {
        setSugestao(s);
        if (s) setRendimento(s.taxaMensal.toLocaleString("pt-BR", { maximumFractionDigits: 4 }));
      })
      .catch(() => setSugestao(null));
  }, []);

  const dados: DadosSimulacao | null = useMemo(() => {
    const v = lerDinheiro(valor);
    const n = Number(parcelas);
    if (!(v > 0) || !Number.isInteger(n) || n < 1 || n > 240 || !primeira) return null;
    const d: DadosSimulacao = { valor: v, parcelas: n, primeiraParcela: primeira };
    if (modo === "PARCELA") {
      const p = lerDinheiro(valorParcela);
      if (!(p > 0)) return null;
      d.valorParcela = p;
    }
    if (modo === "TAXA") {
      const t = lerValor(taxa);
      if (!(t > 0 && t <= 100)) return null;
      d.taxaJuros = Math.round(t * 10000) / 10000;
    }
    const desc = lerValor(desconto);
    if (Number.isFinite(desc) && desc > 0 && desc < 100) d.descontoAVista = Math.round(desc * 100) / 100;
    const r = lerValor(rendimento);
    d.rendimentoMensal = Number.isFinite(r) && r >= 0 && r <= 100 ? Math.round(r * 10000) / 10000 : 0;
    return d;
  }, [valor, parcelas, modo, valorParcela, taxa, desconto, rendimento, primeira]);

  useEffect(() => {
    if (!dados) return;
    let cancelado = false;
    const t = setTimeout(() => {
      setCalculando(true);
      simularParcelamento(dados)
        .then((r) => { if (!cancelado) { setResultado(r); setErro(""); } })
        .catch((e) => { if (!cancelado) setErro(mensagemDeErro(e, "Não foi possível calcular.")); })
        .finally(() => { if (!cancelado) setCalculando(false); });
    }, 450);
    return () => { cancelado = true; clearTimeout(t); };
  }, [dados]);

  function abrirRegistro() {
    setRegistrando(true);
    setRegistrado("");
    if (contas.length === 0) {
      listarConta().then((l: Conta[]) => setContas(l.filter((c) => c.ativa))).catch(() => setContas([]));
      listarCategoria().then(setCategorias).catch(() => setCategorias([]));
    }
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!dados) return;
    setErroRegistro("");
    if (!descricao.trim()) return setErroRegistro("Dê um nome para a compra, ex.: Celular.");
    const k = Number(pagas);
    if (!Number.isInteger(k) || k < 0 || k >= dados.parcelas) return setErroRegistro("Parcelas já pagas inválidas.");
    setSalvando(true);
    try {
      await registrarParcelamento({
        ...dados,
        descricao: descricao.trim(),
        parcelasPagas: k,
        contaId: contaId ? Number(contaId) : undefined,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
      });
      setRegistrado(descricao.trim());
      setRegistrando(false);
      setDescricao("");
      setPagas("0");
      // Limpa a simulação: a compra agora já entra em "Parcelas" (não contar duas vezes).
      setValor("");
      setValorParcela("");
      onRegistrado();
    } catch (error) {
      setErroRegistro(mensagemDeErro(error, "Não foi possível registrar."));
    } finally {
      setSalvando(false);
    }
  }

  // Com os campos incompletos, o último resultado some da tela.
  const resultado = dados ? ultimoResultado : null;

  const veredito = resultado && {
    A_VISTA: { titulo: "Pague à vista", cor: "var(--accent)", fundo: "var(--accent-light)", icone: CheckCircle2 },
    PARCELADO: { titulo: "Parcelar compensa", cor: "var(--accent)", fundo: "var(--accent-light)", icone: TrendingDown },
    TANTO_FAZ: { titulo: "Tanto faz", cor: "var(--muted)", fundo: "var(--surface-dim)", icone: Scale },
  }[resultado.melhor];

  return (
    <section className="card p-5 sm:p-6" aria-label="Calculadora de parcelamento">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent"><Calculator size={20} /></span>
        <div>
          <h2 className="text-base font-bold text-primary">Calculadora de parcelamento</h2>
          <p className="text-sm text-muted">Descubra os juros escondidos e se vale mais pagar à vista.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Dados da compra */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
            <CampoDinheiro id="calc-valor" rotulo="Preço do produto" valor={valor} onValor={setValor} obrigatorio={false} />
            <div>
              <label htmlFor="calc-parcelas" className="form-label">Parcelas</label>
              <input id="calc-parcelas" type="number" inputMode="numeric" min={1} max={240} className="form-input" value={parcelas} onChange={(e) => setParcelas(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="form-label">A loja informou</p>
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-dim p-1" role="radiogroup" aria-label="O que a loja informou">
              {([
                ["SEM_JUROS", "Sem juros"],
                ["PARCELA", "Valor da parcela"],
                ["TAXA", "Taxa de juros"],
              ] as const).map(([m, rotulo]) => (
                <button key={m} type="button" role="radio" aria-checked={modo === m} onClick={() => setModo(m)}
                  className={`h-9 rounded-xl px-1 text-xs font-bold transition sm:text-sm ${modo === m ? "bg-surface text-primary shadow-sm" : "text-muted"}`}>
                  {rotulo}
                </button>
              ))}
            </div>
          </div>

          {modo === "PARCELA" && (
            <CampoDinheiro id="calc-parcela" rotulo="Valor de cada parcela" valor={valorParcela} onValor={setValorParcela} obrigatorio={false} />
          )}
          {modo === "TAXA" && (
            <div>
              <label htmlFor="calc-taxa" className="form-label">Juros ao mês (%)</label>
              <input id="calc-taxa" inputMode="decimal" className="form-input" placeholder="Ex.: 2,99" value={taxa} onChange={(e) => setTaxa(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="calc-desconto" className="form-label">Desconto à vista (%)</label>
              <input id="calc-desconto" inputMode="decimal" className="form-input" placeholder="0" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
            </div>
            <div>
              <label htmlFor="calc-primeira" className="form-label">1ª parcela em</label>
              <input id="calc-primeira" type="date" className="form-input" value={primeira} onChange={(e) => setPrimeira(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="calc-rendimento" className="form-label">Quanto seu dinheiro rende ao mês (%)</label>
            <input id="calc-rendimento" inputMode="decimal" className="form-input" placeholder="Ex.: 0,9" value={rendimento} onChange={(e) => setRendimento(e.target.value)} />
            <p className="mt-1.5 text-xs text-muted">
              {sugestao
                ? `Preenchido com a caixinha "${sugestao.nome}". Enquanto você paga as parcelas, o dinheiro continua rendendo.`
                : "Sem caixinha cadastrada. Informe quanto sua aplicação rende para comparar."}
            </p>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex flex-col gap-4" aria-live="polite">
          {registrado && (
            <p className="flex items-center gap-2 rounded-xl bg-income-light px-4 py-3 text-sm font-semibold text-income">
              <CheckCircle2 size={16} className="shrink-0" /> &quot;{registrado}&quot; registrada. As parcelas aparecem
              abaixo, em Parcelas em aberto, e no dashboard.
            </p>
          )}
          {!resultado && !erro && (
            <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted">
              <Calculator size={28} className="mb-2 text-muted-light" />
              {calculando ? "Calculando..." : "Informe o preço e as parcelas para ver o resultado."}
            </div>
          )}
          <CaixaErro texto={erro} />

          {resultado && veredito && (
            <div className={`flex flex-col gap-4 transition-opacity ${calculando ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: veredito.fundo }}>
                <veredito.icone size={22} className="mt-0.5 shrink-0" style={{ color: veredito.cor }} />
                <div>
                  <p className="text-lg font-extrabold text-primary">
                    {veredito.titulo}
                    {resultado.melhor !== "TANTO_FAZ" && (
                      <span className="num">: economiza {formatarMoeda(resultado.economia)}</span>
                    )}
                  </p>
                  <p className="num text-sm text-muted">
                    {resultado.rendimentoMensal > 0
                      ? `Com o dinheiro rendendo ${pct(resultado.rendimentoMensal)} ao mês, as ${resultado.parcelas} parcelas valem hoje ${formatarMoeda(resultado.valorPresente)}, contra ${formatarMoeda(resultado.precoAVista)} à vista.`
                      : `Sem rendimento, você paga ${formatarMoeda(resultado.totalParcelado)} parcelado contra ${formatarMoeda(resultado.precoAVista)} à vista.`}
                  </p>
                </div>
              </div>

              <div className="num grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted">Parcela</p>
                  <p className="text-lg font-extrabold text-primary">{resultado.parcelas}x {formatarMoeda(resultado.parcela)}</p>
                </div>
                <div className="rounded-2xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted">Total parcelado</p>
                  <p className="text-lg font-extrabold text-primary">{formatarMoeda(resultado.totalParcelado)}</p>
                </div>
                <div className="rounded-2xl border border-border p-3">
                  <p className="text-xs font-semibold text-muted">À vista</p>
                  <p className="text-lg font-extrabold text-primary">{formatarMoeda(resultado.precoAVista)}</p>
                </div>
                <div className={`rounded-2xl border p-3 ${resultado.taxaMensal > 0 ? "border-expense-muted bg-expense-light" : "border-border"}`}>
                  <p className="text-xs font-semibold text-muted">Juros embutidos</p>
                  {resultado.taxaMensal > 0 ? (
                    <>
                      <p className="text-lg font-extrabold text-expense">{pct(resultado.taxaMensal)} a.m.</p>
                      <p className="text-xs text-expense">{pct(resultado.taxaAnual)} ao ano · + {formatarMoeda(resultado.custoParcelar)}</p>
                    </>
                  ) : (
                    <p className="text-lg font-extrabold text-income">Sem juros</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-surface-hover p-4 text-sm">
                <p className="font-bold text-primary">No seu mês</p>
                <p className="num mt-1 text-muted">
                  {resultado.impactoHoje.parcelasNoCiclo > 0 ? (
                    <>
                      Pode gastar hoje: <strong className="text-foreground">{formatarMoeda(resultado.impactoHoje.porDiaAntes)}</strong> →{" "}
                      <strong className="text-warning">{formatarMoeda(resultado.impactoHoje.porDiaDepois)} / dia</strong>
                      {" "}(a 1ª parcela vence antes do próximo salário).
                    </>
                  ) : (
                    <>A 1ª parcela cai depois do próximo salário: o valor de hoje ({formatarMoeda(resultado.impactoHoje.porDiaAntes)}/dia) não muda.</>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-primary">Quanto fica comprometido por mês</p>
                <GraficoComprometimento dados={resultado.comprometimento} comNovaCompra />
              </div>

              <p className="flex gap-1.5 text-xs text-muted">
                <Info size={13} className="mt-0.5 shrink-0" />
                Valores antes do imposto de renda sobre o rendimento. Taxa embutida calculada sobre o preço à vista.
              </p>

              {!registrando ? (
                <button type="button" className="btn btn-primary self-start" onClick={abrirRegistro}>
                  Registrar compra parcelada
                </button>
              ) : (
                <form onSubmit={registrar} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
                  <p className="text-sm font-bold text-primary">Registrar {resultado.parcelas}x de {formatarMoeda(resultado.parcela)}</p>
                  <div>
                    <label htmlFor="reg-desc" className="form-label">O que você comprou</label>
                    <input id="reg-desc" className="form-input" maxLength={60} placeholder="Ex.: Celular" value={descricao} onChange={(e) => setDescricao(e.target.value)} autoFocus />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="reg-pagas" className="form-label">Já paguei</label>
                      <input id="reg-pagas" type="number" min={0} max={resultado.parcelas - 1} className="form-input" value={pagas} onChange={(e) => setPagas(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="reg-conta" className="form-label">Conta</label>
                      <select id="reg-conta" className="form-select" value={contaId} onChange={(e) => setContaId(e.target.value)}>
                        <option value="">Escolher na hora</option>
                        {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="reg-cat" className="form-label">Categoria</label>
                      <select id="reg-cat" className="form-select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                        <option value="">Sem categoria</option>
                        {categorias.map((c) => <option key={c.id} value={c.id}>{formatarNomeCategoria(c.nome)}</option>)}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-muted">Compra antiga? Informe quantas parcelas já pagou: o app começa da próxima.</p>
                  <CaixaErro texto={erroRegistro} />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-ghost h-10" onClick={() => setRegistrando(false)} disabled={salvando}>Cancelar</button>
                    <button type="submit" className="btn btn-primary h-10" disabled={salvando}>{salvando ? "Salvando..." : "Registrar"}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
