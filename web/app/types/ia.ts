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
}
