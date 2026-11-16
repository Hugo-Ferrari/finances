import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';

import { PrismaService } from 'src/prisma/prisma.service';
import { hojeNoBrasil } from 'src/common/datas';
import { OrigemLeitura, ResultadoComprovante } from './dto/ia';
import { TIPOS_TRANSACAO, TipoTransacao } from './ia.constants';
import { LeituraLocal, lerTextoComprovante } from './leitura-local';
import { extrairTextoPdf } from './texto-pdf';
import { categoriaPorHistorico } from './categoria-historico';

interface RespostaBruta {
  tipoTransacao: string;
  valor: number;
  data: string | null;
  descricao: string;
  categoria: string | null;
}

interface CategoriaUsuario {
  id: number;
  nome: string;
}

/** Tempo máximo de cada chamada ao Gemini. */
export const TEMPO_LIMITE_GEMINI_MS = 25_000;
/** Espera antes de cada nova tentativa (2 novas tentativas no máximo). */
export const ESPERAS_GEMINI_MS = [2_000, 5_000];
/** Transações recentes usadas para sugerir a categoria. */
const HISTORICO_CATEGORIAS = 300;

/** Erros passageiros do Gemini, que valem uma nova tentativa. */
function erroTemporario(status: number | undefined): boolean {
  return status === undefined || status === 408 || status >= 500;
}

function statusDoErro(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null && 'status' in error
    ? (error as { status?: number }).status
    : undefined;
}

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelo: string;

  constructor(private readonly prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelo = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';
  }

  /** Separado para os testes não esperarem de verdade. */
  protected esperar(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async analisarComprovante(
    usuarioId: number,
    arquivo: Buffer,
    mimeType: string,
  ): Promise<ResultadoComprovante> {
    const categorias = await this.prisma.categoria.findMany({
      where: { usuarioId },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });

    // 1) PDF com texto (comprovante de banco): lê sem IA.
    let local: LeituraLocal | null = null;
    if (mimeType === 'application/pdf') {
      const texto = await extrairTextoPdf(arquivo);
      if (texto.trim()) local = lerTextoComprovante(texto);
      if (local?.completa) {
        return this.resultadoLocal(local, 'leitura', usuarioId, categorias);
      }
    }

    // 2) Foto, PDF escaneado ou leitura incompleta: usa a IA.
    try {
      const texto = await this.chamarGemini(arquivo, mimeType, categorias);
      return await this.validar(this.parse(texto), categorias, usuarioId);
    } catch (error) {
      // 3) IA fora do ar, mas o PDF já trouxe o valor: devolve o que foi lido
      //    para o usuário conferir e completar.
      if (local?.valor) {
        this.logger.warn('IA indisponível; usando a leitura parcial do PDF.');
        return this.resultadoLocal(
          local,
          'leitura-parcial',
          usuarioId,
          categorias,
        );
      }
      throw error;
    }
  }

  private async resultadoLocal(
    local: LeituraLocal,
    origem: OrigemLeitura,
    usuarioId: number,
    categorias: CategoriaUsuario[],
  ): Promise<ResultadoComprovante> {
    const categoria = await this.categoriaPeloHistorico(
      usuarioId,
      local.descricao,
      categorias,
    );
    return {
      tipoTransacao: local.tipoTransacao ?? 'SAIDA',
      valor: local.valor!,
      data: local.data ?? hojeNoBrasil(),
      dataEstimada: local.data === null,
      descricao: local.descricao,
      categoriaId: categoria?.id ?? null,
      categoriaNome: categoria?.nome ?? null,
      origem,
    };
  }

  private async categoriaPeloHistorico(
    usuarioId: number,
    descricao: string,
    categorias: CategoriaUsuario[],
  ): Promise<CategoriaUsuario | undefined> {
    if (categorias.length === 0) return undefined;
    const historico = await this.prisma.transacao.findMany({
      where: {
        conta: { usuarioId },
        categoriaId: { not: null },
        descricao: { not: null },
      },
      select: { descricao: true, categoriaId: true },
      orderBy: [{ data: 'desc' }, { id: 'desc' }],
      take: HISTORICO_CATEGORIAS,
    });
    const id = categoriaPorHistorico(descricao, historico);
    return categorias.find((c) => c.id === id);
  }

  /** Chama o Gemini tentando de novo em erros passageiros (503, rede, demora). */
  private async chamarGemini(
    arquivo: Buffer,
    mimeType: string,
    categorias: CategoriaUsuario[],
  ): Promise<string> {
    for (let tentativa = 1; ; tentativa++) {
      try {
        return await this.gerarConteudo(arquivo, mimeType, categorias);
      } catch (error: unknown) {
        const status = statusDoErro(error);
        const mensagem = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Gemini falhou (tentativa ${tentativa}, status ${status ?? 'sem status'}): ${mensagem.slice(0, 500)}`,
        );
        const espera = ESPERAS_GEMINI_MS[tentativa - 1];
        if (!erroTemporario(status) || espera === undefined) {
          throw this.traduzirErro(status);
        }
        await this.esperar(espera);
      }
    }
  }

  private async gerarConteudo(
    arquivo: Buffer,
    mimeType: string,
    categorias: CategoriaUsuario[],
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.modelo,
      contents: [
        { inlineData: { mimeType, data: arquivo.toString('base64') } },
        { text: this.montarPrompt(categorias) },
      ],
      config: {
        httpOptions: { timeout: TEMPO_LIMITE_GEMINI_MS },
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipoTransacao: {
              type: Type.STRING,
              enum: [...TIPOS_TRANSACAO],
            },
            valor: { type: Type.NUMBER },
            data: { type: Type.STRING, nullable: true },
            descricao: { type: Type.STRING },
            categoria: { type: Type.STRING, nullable: true },
          },
          required: [
            'tipoTransacao',
            'valor',
            'data',
            'descricao',
            'categoria',
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error('Resposta vazia do Gemini.');
    }
    return response.text;
  }

  private traduzirErro(status: number | undefined): HttpException {
    if (status === 429) {
      return new HttpException(
        'Limite de uso da IA atingido. Tente novamente em instantes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (erroTemporario(status)) {
      return new ServiceUnavailableException(
        'O serviço de IA está temporariamente indisponível. Tente novamente em alguns segundos.',
      );
    }
    return new InternalServerErrorException(
      'Não foi possível processar o comprovante.',
    );
  }

  private parse(texto: string): RespostaBruta {
    try {
      return JSON.parse(texto) as RespostaBruta;
    } catch {
      this.logger.error(`JSON inválido do Gemini: ${texto}`);
      throw new UnprocessableEntityException(
        'Não foi possível interpretar o comprovante.',
      );
    }
  }

  private async validar(
    bruto: RespostaBruta,
    categorias: CategoriaUsuario[],
    usuarioId: number,
  ): Promise<ResultadoComprovante> {
    if (!Number.isFinite(bruto.valor) || bruto.valor <= 0) {
      throw new UnprocessableEntityException(
        'Não foi possível identificar o valor do comprovante.',
      );
    }

    const tipoTransacao = (TIPOS_TRANSACAO as readonly string[]).includes(
      bruto.tipoTransacao,
    )
      ? (bruto.tipoTransacao as TipoTransacao)
      : 'SAIDA';
    const descricao =
      (bruto.descricao ?? '').trim().slice(0, 100) || 'Sem descrição';
    const categoria =
      (bruto.categoria
        ? categorias.find(
            (c) =>
              this.normalizar(c.nome) === this.normalizar(bruto.categoria!),
          )
        : undefined) ??
      (await this.categoriaPeloHistorico(usuarioId, descricao, categorias));

    const dataValida =
      typeof bruto.data === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(bruto.data) &&
      !Number.isNaN(Date.parse(bruto.data));

    return {
      tipoTransacao,
      valor: Math.round(bruto.valor * 100) / 100,
      data: dataValida ? (bruto.data as string) : hojeNoBrasil(),
      dataEstimada: !dataValida,
      descricao,
      categoriaId: categoria?.id ?? null,
      categoriaNome: categoria?.nome ?? null,
      origem: 'ia',
    };
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  }

  private montarPrompt(categorias: CategoriaUsuario[]): string {
    const listaCategorias = categorias.length
      ? categorias.map((c) => `- ${c.nome}`).join('\n')
      : '(o usuário ainda não tem categorias)';

    return `
Analise este documento financeiro (nota fiscal, cupom ou comprovante).

TIPO:
- ENTRADA: dinheiro recebido (salário, depósito, transferência recebida, venda).
- SAIDA: dinheiro gasto (compra, conta paga, transferência enviada, saque).
- Em comprovante de Pix/transferência, se não for possível saber quem é o
  usuário, assuma SAIDA.

CATEGORIAS DO USUÁRIO (escolha exatamente uma, copiando o nome igual):
${listaCategorias}

REGRAS:
1. valor: número com ponto decimal (ex.: 1234.56). Use o valor TOTAL
   efetivamente pago ou recebido. Nunca use subtotal, valor de parcela,
   troco ou valor antes de desconto.
2. data: formato YYYY-MM-DD. Se o documento não tiver data legível, use null.
   Não invente.
3. descricao: curta (estabelecimento ou motivo), até 60 caracteres.
4. categoria: um nome da lista acima. Se nenhuma combinar bem, ou se a lista
   estiver vazia, use null. Nunca invente uma categoria fora da lista.
5. Não invente informações que não estejam no documento.
`.trim();
  }
}
