export interface RegistroDeComprovanteDTO {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  data: string;
  descricao: string;
  categoria: string;
}