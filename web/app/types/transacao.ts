interface CreateTransacao {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  descricao?: string;
  data: Date;
  contaId: number;
  categoriaId?: number;
}