import { Conta } from "../types/conta";
import { Transacao } from "../types/transacao";

/** Meta usada como referência de economia (regra 50/30/20). */
export const META_TAXA_ECONOMIA = 0.2;

export type Orcamento = { id: number; valor: number | string; categoriaId: number };

export type ResumoMes = {
  entradas: number;
  saidas: number;
  /** entradas - saídas */
  economia: number;
  /** economia / entradas (null quando não houve entradas) */
  taxa: number | null;
};

export type PontoMensal = ResumoMes & { chave: string; rotulo: string };

export type GastoCategoria = {
  categoriaId: number | null;
  nome: string;
  valor: number;
  limite: number | null;
};

/** AAAA-MM do mês atual (fuso do navegador). */
export function chaveMesAtual(base = new Date()): string {
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
}

/** As datas chegam como AAAA-MM-DD...; a chave do mês não depende de fuso. */
export function chaveMes(data: string): string {
  return data.slice(0, 7);
}

export function nomeDoMes(chave: string, formato: "long" | "short" = "long") {
  const [ano, mes] = chave.split("-").map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: formato,
  });
  const limpo = nome.replace(".", "");
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

function calcularResumo(lista: Transacao[]): ResumoMes {
  let entradas = 0;
  let saidas = 0;
  for (const t of lista) {
    if (t.tipoTransacao === "ENTRADA") entradas += Number(t.valor);
    else saidas += Number(t.valor);
  }
  const economia = entradas - saidas;
  return { entradas, saidas, economia, taxa: entradas > 0 ? economia / entradas : null };
}

export function resumoDoMes(transacoes: Transacao[], chave: string): ResumoMes {
  return calcularResumo(transacoes.filter((t) => chaveMes(t.data) === chave));
}

/** Últimos `meses` meses (do mais antigo para o atual). */
export function serieMensal(transacoes: Transacao[], meses = 6): PontoMensal[] {
  const hoje = new Date();
  const serie: PontoMensal[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const chave = chaveMesAtual(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1));
    serie.push({ chave, rotulo: nomeDoMes(chave, "short"), ...resumoDoMes(transacoes, chave) });
  }
  return serie;
}

export function gastosPorCategoria(
  transacoes: Transacao[],
  chave: string,
  orcamentos: Orcamento[] = [],
): GastoCategoria[] {
  const mapa = new Map<number | null, GastoCategoria>();
  for (const t of transacoes) {
    if (t.tipoTransacao !== "SAIDA" || chaveMes(t.data) !== chave) continue;
    const id = t.categoria?.id ?? null;
    const atual = mapa.get(id) ?? {
      categoriaId: id,
      nome: t.categoria ? formatarNomeCategoria(t.categoria.nome) : "Sem categoria",
      valor: 0,
      limite: null,
    };
    atual.valor += Number(t.valor);
    mapa.set(id, atual);
  }
  for (const o of orcamentos) {
    const item = mapa.get(o.categoriaId);
    if (item) item.limite = Number(o.valor);
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor);
}

export function saldoTotal(contas: Conta[]): number {
  return contas.reduce((total, c) => total + Number(c.saldo), 0);
}

export function ordenarPorDataDesc(transacoes: Transacao[]): Transacao[] {
  return [...transacoes].sort((a, b) =>
    a.data === b.data ? b.id - a.id : a.data < b.data ? 1 : -1,
  );
}

/** Dias que faltam para acabar o mês, contando hoje. */
export function diasRestantesNoMes(base = new Date()): number {
  const ultimo = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  return ultimo - base.getDate() + 1;
}

const TIPOS_CONTA: Record<Conta["tipo"], string> = {
  CORRENTE: "Conta corrente",
  POUPANCA: "Poupança",
  CARTEIRA: "Carteira",
};

export function rotuloTipoConta(tipo: Conta["tipo"]): string {
  return TIPOS_CONTA[tipo] ?? tipo;
}

// Categorias antigas foram gravadas sem acento e em minúsculas pela API.
const ACENTOS: Record<string, string> = {
  saude: "saúde",
  educacao: "educação",
  alimentacao: "alimentação",
  farmacia: "farmácia",
  servicos: "serviços",
  vestuario: "vestuário",
  cartao: "cartão",
  doacoes: "doações",
  manutencao: "manutenção",
  assinaturas: "assinaturas",
  agua: "água",
  energia: "energia",
  salario: "salário",
  combustivel: "combustível",
  eletronicos: "eletrônicos",
  presentes: "presentes",
  emergencia: "emergência",
  emprestimo: "empréstimo",
};

/** "educacao" → "Educação"; nomes já formatados ficam como estão. */
export function formatarNomeCategoria(nome: string): string {
  if (!nome) return "";
  const palavras = nome.split(" ").map((p) => ACENTOS[p] ?? p);
  const texto = palavras.join(" ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "1% ao mês" / "12% ao ano" */
export function rotuloTaxa(t: { taxa: number; periodo: "MENSAL" | "ANUAL" } | null): string {
  if (!t) return "Sem taxa";
  const valor = t.taxa.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  return `${valor}% ${t.periodo === "MENSAL" ? "ao mês" : "ao ano"}`;
}

/** Converte texto digitado ("1.234,56" ou "1234.56") em número. */
export function lerValor(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "").replace(/^R\$/, "");
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return Number(normalizado);
}

/** "E se eu gastar X hoje?": mesma conta da API (planejamento/gastar-hoje.ts). */
export function simularGasto(
  r: { livre: number; dias: number },
  valor: number,
): { livreDepois: number; porDiaDepois: number } {
  const livreDepois = Math.round((r.livre - valor) * 100) / 100;
  const porDiaDepois =
    r.dias > 1
      ? Math.floor((Math.max(0, livreDepois) / (r.dias - 1)) * 100 + 1e-6) / 100
      : Math.max(0, livreDepois);
  return { livreDepois, porDiaDepois };
}

/** "sex., 4 de dez." a partir de AAAA-MM-DD. */
export function diaPorExtenso(dia: string, opcoes: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }): string {
  return new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", opcoes);
}

/** "Hoje", "Amanhã" ou "qui., 19/11". */
export function rotuloDia(dia: string, hoje: string): string {
  const diff = Math.round((Date.parse(`${dia}T12:00:00`) - Date.parse(`${hoje}T12:00:00`)) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return diaPorExtenso(dia, { weekday: "short", day: "2-digit", month: "2-digit" });
}

/** Soma dias a uma data AAAA-MM-DD. */
export function somarDiasISO(dia: string, dias: number): string {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}
