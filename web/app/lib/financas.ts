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
