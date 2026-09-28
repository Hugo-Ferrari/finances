export interface CreateTransacao {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  descricao?: string;
  data: Date;
  contaId: number;
  categoriaId?: number;
}

export type Transacao = {
  id: number;
  valor: string;
  tipoTransacao: "ENTRADA" | "SAIDA";
  descricao: string | null;
  data: string;

  conta: {
    id: number;
    nome: string;
    ativa: boolean;
  };

  categoria: {
    id: number;
    nome: string;
  } | null;
};
