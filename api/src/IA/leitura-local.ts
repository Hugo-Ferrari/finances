import { TipoTransacao } from './ia.constants';

/**
 * Leitura de comprovantes bancários (Pix, TED, boleto) a partir do texto
 * extraído do PDF, sem usar IA. Só funciona com PDFs que têm texto; para fotos
 * e PDFs escaneados a leitura fica vazia e o comprovante segue para a IA.
 */
export interface LeituraLocal {
  valor: number | null;
  /** YYYY-MM-DD */
  data: string | null;
  tipoTransacao: TipoTransacao | null;
  descricao: string;
  /** true quando valor, data e tipo foram encontrados */
  completa: boolean;
}

const MESES: Record<string, number> = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
};

/** Minúsculas, sem acentos e com espaços simples (mantém pontuação). */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

const VALOR = /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})(?!\d)/;
const VALOR_COM_REAIS = /r\$\s*(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})(?!\d)/g;

function paraNumero(inteiro: string, centavos: string): number {
  return Number(`${inteiro.replace(/\./g, '')}.${centavos}`);
}

/** Linhas que falam de outros valores (tarifa, saldo...) e não do pago. */
const LINHA_VALOR_IGNORADA =
  /\b(tarifa|saldo|juros|multa|desconto|limite|taxa|encargos?|iof|cashback)\b/;
const ROTULO_VALOR = /\b(valor|total|quantia|montante|importancia)\b/;

function lerValor(linhas: string[]): number | null {
  // 1) Linha com rótulo ("Valor", "Valor pago", "Total") e o valor na mesma
  //    linha ou na seguinte.
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!ROTULO_VALOR.test(linha) || LINHA_VALOR_IGNORADA.test(linha)) continue;
    const mesma = linha.match(VALOR);
    if (mesma) return paraNumero(mesma[1], mesma[2]);
    const proxima = linhas[i + 1]?.match(new RegExp(`^${VALOR.source}`));
    if (proxima && !LINHA_VALOR_IGNORADA.test(linhas[i + 1]))
      return paraNumero(proxima[1], proxima[2]);
  }
  // 2) Sem rótulo: aceita só se houver um único valor "R$" no documento.
  const valores = new Set<number>();
  for (const linha of linhas) {
    if (LINHA_VALOR_IGNORADA.test(linha)) continue;
    for (const m of linha.matchAll(VALOR_COM_REAIS)) {
      valores.add(paraNumero(m[1], m[2]));
    }
  }
  return valores.size === 1 ? [...valores][0] : null;
}

function montarData(dia: number, mes: number, ano: number): string | null {
  if (ano < 100) ano += 2000;
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia ||
    ano < 2000
  ) {
    return null;
  }
  return data.toISOString().slice(0, 10);
}

const DATAS: {
  regex: RegExp;
  montar: (m: RegExpMatchArray) => string | null;
}[] = [
  // 05/11/2026, 05-11-2026, 05.11.26
  {
    regex: /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/,
    montar: (m) => montarData(+m[1], +m[2], +m[3]),
  },
  // 2026-11-05
  {
    regex: /\b(\d{4})-(\d{2})-(\d{2})\b/,
    montar: (m) => montarData(+m[3], +m[2], +m[1]),
  },
  // 05 nov 2026, 05/nov/2026, 5 de novembro de 2026
  {
    regex:
      /\b(\d{1,2})(?:\s+de\s+|[\s/.-]+)(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?(?:\s+de\s+|[\s/.-]+)(\d{4})\b/,
    montar: (m) => montarData(+m[1], MESES[m[2]], +m[3]),
  },
];

const LINHA_DATA_IGNORADA = /\b(vencimento|nascimento|validade|emissao|expira)/;
const ROTULO_DATA =
  /\b(data|realizad[oa]|efetuad[oa]|pago em|pagamento em|transferid[oa] em|recebid[oa] em|enviad[oa] em|feito em)\b/;

function dataDaLinha(linha: string): string | null {
  for (const { regex, montar } of DATAS) {
    const m = linha.match(regex);
    if (m) {
      const data = montar(m);
      if (data) return data;
    }
  }
  return null;
}

function lerData(linhas: string[]): string | null {
  let primeira: string | null = null;
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (LINHA_DATA_IGNORADA.test(linha)) continue;
    const data = dataDaLinha(linha);
    if (ROTULO_DATA.test(linha)) {
      if (data) return data;
      const seguinte = linhas[i + 1];
      if (seguinte && !LINHA_DATA_IGNORADA.test(seguinte)) {
        const dataSeguinte = dataDaLinha(seguinte);
        if (dataSeguinte) return dataSeguinte;
      }
    }
    primeira ??= data;
  }
  return primeira;
}

const ENTRADA =
  /\b(pix recebido|transferencia recebida|ted recebida|doc recebido|voce recebeu|recebimento de pix|deposito recebido|credito em conta|pagamento recebido|valor recebido)\b/;
const SAIDA =
  /\b(pix enviado|pix realizado|pix efetuado|transferencia enviada|transferencia realizada|transferencia efetuada|ted enviada|ted realizada|voce enviou|voce pagou|pagamento efetuado|pagamento realizado|comprovante de pagamento|pagamento de boleto|boleto pago|debito em conta|saque realizado|compra no debito|compra aprovada)\b/;

/** Comprovante emitido por quem fez o pagamento (não diz "enviado"). */
const COMPROVANTE_DE_ENVIO =
  /\bcomprovante\b[^\n]*\b(pix|transferencia|pagamento|ted|doc)\b/;

function lerTipo(texto: string): TipoTransacao | null {
  if (ENTRADA.test(texto)) return 'ENTRADA';
  if (SAIDA.test(texto)) return 'SAIDA';
  // Quem gera o comprovante costuma ser quem pagou (o mesmo que a IA assume).
  if (COMPROVANTE_DE_ENVIO.test(texto)) return 'SAIDA';
  return null;
}

const ROTULOS_DESTINO = [
  'para',
  'destino',
  'destinatario',
  'favorecido',
  'recebedor',
  'nome do recebedor',
  'nome do favorecido',
  'beneficiario',
  'cedente',
  'quem recebeu',
];
const ROTULOS_ORIGEM = [
  'de',
  'origem',
  'pagador',
  'remetente',
  'nome do pagador',
  'quem pagou',
  'quem enviou',
];

/** Nome escrito depois de um rótulo ("Para: Fulano" ou "Para" e o nome na linha de baixo). */
/** "Nome: Fulano" → "Fulano"; "Nome" sozinho → null (o nome vem embaixo). */
const ROTULO_NOME = /^nome(?: completo)?\s*:?\s*(.*)$/;

/**
 * Nome escrito depois de um rótulo: "Para: Fulano", "Para" com o nome na
 * linha de baixo, ou "Destino" / "Nome" / "Fulano" em linhas separadas.
 */
function lerNome(
  linhasOriginais: string[],
  linhas: string[],
  rotulos: string[],
): string | null {
  const alternativas = rotulos.join('|');
  const naMesmaLinha = new RegExp(`^(?:${alternativas})\\s*:\\s*(.+)$`);
  const sozinho = new RegExp(`^(?:${alternativas})\\s*:?$`);
  /** Texto original a partir da posição em que o trecho normalizado começa. */
  const final = (i: number, trecho: string) =>
    linhasOriginais[i].slice(linhasOriginais[i].length - trecho.length).trim();

  for (let i = 0; i < linhas.length; i++) {
    let nome: string | null = null;
    const m = linhas[i].match(naMesmaLinha);
    if (m) {
      nome = final(i, m[1]);
    } else if (sozinho.test(linhas[i]) && linhas[i + 1] !== undefined) {
      const rotuloNome = linhas[i + 1].match(ROTULO_NOME);
      if (!rotuloNome) nome = linhasOriginais[i + 1];
      else if (rotuloNome[1]) nome = final(i + 1, rotuloNome[1]);
      else nome = linhasOriginais[i + 2] ?? null;
    }
    const limpo = nome ? limparNome(nome) : null;
    if (limpo) return limpo;
  }
  return null;
}

function limparNome(nome: string): string | null {
  const limpo = nome
    .replace(/\s*[-–|,]?\s*\b(cpf|cnpj)\b.*$/i, '')
    .replace(/\d{2,3}\.?\d{3}\.?\d{3}[/-]?\d{0,4}-?\d{2}/g, '')
    .replace(/\*{2,}[\d.*-]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (limpo.length < 2 || !/[a-zà-ú]/i.test(limpo)) return null;
  return limpo.slice(0, 80);
}

function montarDescricao(
  texto: string,
  tipo: TipoTransacao | null,
  nome: string | null,
): string {
  const boleto = /\bboleto\b/.test(texto);
  const pix = /\bpix\b/.test(texto);
  if (boleto) return nome ? `Boleto ${nome}` : 'Pagamento de boleto';
  const meio = pix ? 'Pix' : 'Transferência';
  if (tipo === 'ENTRADA')
    return nome ? `${meio} de ${nome}` : `${meio} recebido`;
  if (tipo === 'SAIDA')
    return nome ? `${meio} para ${nome}` : `${meio} enviado`;
  return nome ?? 'Comprovante';
}

export function lerTextoComprovante(textoOriginal: string): LeituraLocal {
  const linhasOriginais = textoOriginal
    .split(/\r?\n/)
    .map((l) => l.replace(/[^\S\n]+/g, ' ').trim())
    .filter(Boolean);
  const linhas = linhasOriginais.map(normalizarTexto);
  const texto = linhas.join('\n');

  const valor = lerValor(linhas);
  const data = lerData(linhas);
  const tipoTransacao = lerTipo(texto);
  // Em uma entrada interessa quem pagou; em uma saída, quem recebeu.
  const nome =
    tipoTransacao === null
      ? null
      : lerNome(
          linhasOriginais,
          linhas,
          tipoTransacao === 'ENTRADA' ? ROTULOS_ORIGEM : ROTULOS_DESTINO,
        );

  return {
    valor: valor !== null && valor > 0 ? valor : null,
    data,
    tipoTransacao,
    descricao: montarDescricao(texto, tipoTransacao, nome).slice(0, 100),
    completa:
      valor !== null && valor > 0 && data !== null && tipoTransacao !== null,
  };
}
