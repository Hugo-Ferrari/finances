/**
 * De onde vieram os dados (api/src/IA/dto/ia.ts):
 * - `ia`: lidos pela IA;
 * - `leitura`: lidos direto do texto do PDF, sem IA;
 * - `leitura-parcial`: a IA falhou e só parte do PDF foi lida (conferir).
 */
export type OrigemLeitura = "ia" | "leitura" | "leitura-parcial";

/** Resposta de POST /ia/comprovante (api/src/IA/dto/ia.ts). */
export interface RegistroDeComprovanteDTO {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  /** YYYY-MM-DD */
  data: string;
  /** true quando o comprovante não tinha data legível e foi usada a de hoje */
  dataEstimada: boolean;
  descricao: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  origem: OrigemLeitura;
}
