/**
 * Sugere a categoria de uma transação nova olhando as que o usuário já
 * lançou com descrição parecida ("Pix para Padaria Pão Quente" → mesma
 * categoria de "Padaria Pao Quente").
 */
export interface TransacaoAnterior {
  descricao: string | null;
  categoriaId: number | null;
}

/** Palavras que aparecem em quase todo comprovante e não ajudam a comparar. */
const PALAVRAS_GENERICAS = new Set([
  'pix',
  'para',
  'compra',
  'pagamento',
  'boleto',
  'transferencia',
  'ted',
  'doc',
  'recebido',
  'enviado',
  'ltda',
  'eireli',
  'comprovante',
  'debito',
  'credito',
  'cartao',
  'dos',
  'das',
  'com',
]);

export function palavrasChave(texto: string): Set<string> {
  return new Set(
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z]+/g, ' ')
      .split(' ')
      .filter((p) => p.length >= 3 && !PALAVRAS_GENERICAS.has(p)),
  );
}

function parecidas(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let comuns = 0;
  for (const p of a) if (b.has(p)) comuns++;
  const menor = Math.min(a.size, b.size);
  const uniao = a.size + b.size - comuns;
  // Todas as palavras da descrição menor aparecem na maior, ou metade em comum.
  return comuns === menor || comuns / uniao >= 0.5;
}

/** Categoria mais usada entre as transações parecidas (ou null). */
export function categoriaPorHistorico(
  descricao: string,
  historico: TransacaoAnterior[],
): number | null {
  const alvo = palavrasChave(descricao);
  const contagem = new Map<number, number>();
  for (const t of historico) {
    if (t.categoriaId === null || !t.descricao) continue;
    if (!parecidas(alvo, palavrasChave(t.descricao))) continue;
    contagem.set(t.categoriaId, (contagem.get(t.categoriaId) ?? 0) + 1);
  }
  let melhor: number | null = null;
  let maior = 0;
  // O histórico vem do mais recente para o mais antigo: no empate, ganha o mais recente.
  for (const [categoriaId, vezes] of contagem) {
    if (vezes > maior) {
      melhor = categoriaId;
      maior = vezes;
    }
  }
  return melhor;
}
