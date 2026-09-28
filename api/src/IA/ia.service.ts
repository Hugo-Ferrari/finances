import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";

import { GoogleGenAI } from "@google/genai";
import { ResultadoComprovante } from "./dto/ia";

@Injectable()
export class IaService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async analisarComprovante(
    imagem: Buffer,
    mimeType: string,
  ): Promise<ResultadoComprovante> {
    const imagemBase64 = imagem.toString("base64");

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.8-flash",

        contents: [
          {
            inlineData: {
              mimeType,
              data: imagemBase64,
            },
          },
          {
            text: `
Analise este documento financeiro e determine se ele representa
uma ENTRADA ou uma SAIDA financeira.

ENTRADA:
- salário recebido
- pagamento recebido
- depósito recebido
- transferência recebida
- venda realizada
- dinheiro recebido

SAIDA:
- compra
- pagamento de conta
- supermercado
- restaurante
- combustível
- transferência enviada
- saque
- pagamento realizado

Categorias permitidas:

SALARIO
ALIMENTAÇÃO
TRANSPORTE
MORADIA
SAÚDE
EDUCAÇÃO
LAZER
ASSINATURAS
VESTUÁRIO
OUTROS

Regras:

1. Determine se a transação é ENTRADA ou SAIDA.
2. Se for salário recebido:
   tipoTransacao = "ENTRADA"
   categoria = "SALARIO"
3. Compras e pagamentos realizados pelo usuário são SAIDA.
4. O valor deve ser um número.
5. A data deve estar no formato YYYY-MM-DD.
6. A descrição deve ser curta.
7. A categoria deve ser exatamente uma das categorias permitidas.
8. Se não for possível identificar a categoria, utilize "OUTROS".
9. Não invente informações.

Retorne somente:

{
  "tipoTransacao": "ENTRADA" ou "SAIDA",
  "valor": número,
  "data": "YYYY-MM-DD",
  "descricao": "descrição curta",
  "categoria": "categoria"
}
`,
          },
        ],

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              tipoTransacao: {
                type: "string",
                enum: ["ENTRADA", "SAIDA"],
              },

              valor: {
                type: "number",
              },

              data: {
                type: "string",
              },

              descricao: {
                type: "string",
              },

              categoria: {
                type: "string",
                enum: [
                  "SALARIO",
                  "ALIMENTAÇÃO",
                  "TRANSPORTE",
                  "MORADIA",
                  "SAÚDE",
                  "EDUCAÇÃO",
                  "LAZER",
                  "ASSINATURAS",
                  "VESTUÁRIO",
                  "OUTROS",
                ],
              },
            },

            required: [
              "tipoTransacao",
              "valor",
              "data",
              "descricao",
              "categoria",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error("A resposta do Gemini está vazia.");
      }

      try {
        return JSON.parse(response.text) as ResultadoComprovante;
      } catch {
        throw new Error("O Gemini retornou um JSON inválido.");
      }
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? (error as { status?: number }).status
          : undefined;

      if (status === 503) {
        throw new ServiceUnavailableException(
          "O serviço de IA está temporariamente indisponível. Tente novamente em alguns segundos.",
        );
      }

      console.error("Erro ao analisar comprovante:", error);

      throw new InternalServerErrorException(
        "Não foi possível processar o comprovante.",
      );
    }
  }
}