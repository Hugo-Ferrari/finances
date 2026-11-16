/**
 * Calculadora de compras parceladas (funções puras, sem banco).
 *
 * - Parcela pela tabela Price: P = V · i / (1 − (1 + i)^−n). Sem juros, P = V / n.
 * - Taxa embutida: a taxa mensal que faz as parcelas valerem o preço à vista
 *   (achada por bisseção). "12x sem juros" que custa mais que o preço à vista
 *   com desconto tem juros escondidos.
 * - À vista ou parcelado: o dinheiro que fica na caixinha enquanto você paga
 *   as parcelas rende. Trazemos cada parcela para hoje com o rendimento da
 *   caixinha (valor presente, 30 dias = 1 mês) e comparamos com o preço à
 *   vista. Valores antes do imposto de renda.
 */
import {
  dataNaCompetencia,
  competenciaDe,
  diasEntre,
  somarCompetencia,
} from './calendario';

export interface EntradaSimulacao {
  hoje: string;
  /** Preço cheio do produto. */
  valor: number;
  parcelas: number;
  /** Valor de cada parcela, se a loja informou. */
  valorParcela?: number;
  /** Juros ao mês (%), se a loja informou a taxa em vez da parcela. */
  taxaJuros?: number;
  /** Desconto para pagar à vista (%). */
  descontoAVista?: number;
  /** Quanto seu dinheiro rende ao mês (%), para comparar. */
  rendimentoMensal?: number;
  /** Data da 1ª parcela (AAAA-MM-DD). */
  primeiraParcela: string;
}

export type Melhor = 'A_VISTA' | 'PARCELADO' | 'TANTO_FAZ';

export interface ResultadoSimulacao {
  precoAVista: number;
  parcela: number;
  parcelas: number;
  totalParcelado: number;
  /** Quanto o parcelado custa a mais que o preço à vista. */
  custoParcelar: number;
  /** Taxa de juros embutida, em % ao mês e ao ano. */
  taxaMensal: number;
  taxaAnual: number;
  rendimentoMensal: number;
  /** Quanto as parcelas valem hoje, descontado o rendimento. */
  valorPresente: number;
  melhor: Melhor;
  /** Quanto a melhor opção economiza em relação à outra. */
  economia: number;
  cronograma: { numero: number; data: string; valor: number }[];
}

const centavos = (v: number) => Math.round(v * 100) / 100;

export function parcelaPrice(valor: number, taxa: number, n: number): number {
  if (n <= 0) throw new Error('Número de parcelas inválido');
  if (taxa <= 0) return valor / n;
  return (valor * taxa) / (1 - Math.pow(1 + taxa, -n));
}

/** Taxa mensal (decimal) que faz n parcelas de `parcela` valerem `valor`. */
export function taxaImplicita(
  valor: number,
  parcela: number,
  n: number,
): number {
  if (valor <= 0 || parcela * n <= valor + 1e-9) return 0;
  let baixo = 0;
  let alto = 1;
  // Garante que o intervalo contém a resposta (taxas absurdas param em 100% a.m.).
  if (parcelaPrice(valor, alto, n) < parcela) return alto;
  for (let i = 0; i < 100; i++) {
    const meio = (baixo + alto) / 2;
    if (parcelaPrice(valor, meio, n) > parcela) alto = meio;
    else baixo = meio;
  }
  return (baixo + alto) / 2;
}

/** Datas das parcelas: todo mês no dia da primeira (último dia em meses curtos). */
export function datasDasParcelas(primeira: string, n: number): string[] {
  const inicio = competenciaDe(primeira);
  return Array.from({ length: n }, (_, k) =>
    dataNaCompetencia(primeira, somarCompetencia(inicio, k)),
  );
}

export function valorPresente(
  pagamentos: { data: string; valor: number }[],
  hoje: string,
  taxaMensal: number,
): number {
  return pagamentos.reduce((total, p) => {
    const meses = Math.max(0, diasEntre(hoje, p.data)) / 30;
    return total + p.valor / Math.pow(1 + taxaMensal, meses);
  }, 0);
}

export function simularParcelamento(e: EntradaSimulacao): ResultadoSimulacao {
  const n = Math.round(e.parcelas);
  if (!(e.valor > 0) || n < 1)
    throw new Error('Valor e parcelas são obrigatórios');

  const desconto = Math.min(Math.max(e.descontoAVista ?? 0, 0), 100) / 100;
  const precoAVista = centavos(e.valor * (1 - desconto));

  // Parcela: a informada, ou pela taxa sobre o preço cheio, ou sem juros.
  let parcela: number;
  if (e.valorParcela && e.valorParcela > 0) parcela = e.valorParcela;
  else if (e.taxaJuros && e.taxaJuros > 0)
    parcela = parcelaPrice(e.valor, e.taxaJuros / 100, n);
  else parcela = e.valor / n;
  parcela = centavos(parcela);

  const totalParcelado = centavos(parcela * n);
  const taxa = taxaImplicita(precoAVista, parcela, n);
  const datas = datasDasParcelas(e.primeiraParcela, n);
  const cronograma = datas.map((data, i) => ({
    numero: i + 1,
    data,
    valor: parcela,
  }));

  const rendimento = Math.max(e.rendimentoMensal ?? 0, 0);
  const vp = centavos(valorPresente(cronograma, e.hoje, rendimento / 100));
  const diferenca = centavos(precoAVista - vp);
  const melhor: Melhor =
    Math.abs(diferenca) < 1
      ? 'TANTO_FAZ'
      : diferenca > 0
        ? 'PARCELADO'
        : 'A_VISTA';

  return {
    precoAVista,
    parcela,
    parcelas: n,
    totalParcelado,
    custoParcelar: centavos(totalParcelado - precoAVista),
    taxaMensal: Math.round(taxa * 10000) / 100,
    taxaAnual: Math.round((Math.pow(1 + taxa, 12) - 1) * 10000) / 100,
    rendimentoMensal: rendimento,
    valorPresente: vp,
    melhor,
    economia: Math.abs(diferenca),
    cronograma,
  };
}
