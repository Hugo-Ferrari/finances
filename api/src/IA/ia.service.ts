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

import { PrismaService } from 'src/prisma/prisma.service'; // ajuste ao caminho do seu PrismaService
import { ResultadoComprovante } from './dto/ia';
import { TIPOS_TRANSACAO, TipoTransacao } from './ia.constants';

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

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly ai: GoogleGenAI;
  private readonly modelo: string;

  constructor(private readonly prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelo = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash';
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

    const texto = await this.chamarGemini(arquivo, mimeType, categorias);
    return this.validar(this.parse(texto), categorias);
  }

  private async chamarGemini(
    arquivo: Buffer,
    mimeType: string,
    categorias: CategoriaUsuario[],
  ) {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelo,
        contents: [
          { inlineData: { mimeType, data: arquivo.toString('base64') } },
          { text: this.montarPrompt(categorias) },
        ],
        config: {
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
    } catch (error: unknown) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined;

      if (status === 503) {
        throw new ServiceUnavailableException(
          'O serviço de IA está temporariamente indisponível. Tente novamente em alguns segundos.',
        );
      }

      if (status === 429) {
        throw new HttpException(
          'Limite de uso da IA atingido. Tente novamente em instantes.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.logger.error('Erro ao chamar o Gemini', error as Error);
      throw new InternalServerErrorException(
        'Não foi possível processar o comprovante.',
      );
    }
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

  private validar(
    bruto: RespostaBruta,
    categorias: CategoriaUsuario[],
  ): ResultadoComprovante {
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
    const categoria = bruto.categoria
      ? categorias.find(
          (c) => this.normalizar(c.nome) === this.normalizar(bruto.categoria!),
        )
      : undefined;

    const dataValida =
      typeof bruto.data === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(bruto.data) &&
      !Number.isNaN(Date.parse(bruto.data));

    return {
      tipoTransacao,
      valor: Math.round(bruto.valor * 100) / 100,
      data: dataValida ? (bruto.data as string) : this.hoje(),
      dataEstimada: !dataValida,
      descricao: (bruto.descricao ?? '').trim().slice(0, 100) || 'Sem descrição',
      categoriaId: categoria?.id ?? null,
      categoriaNome: categoria?.nome ?? null,
    };
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private hoje(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
    }).format(new Date());
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
