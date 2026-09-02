export type DespesaCategoria = {
  id?: number;
  nome?: string;
  usuarioId?: number;
  categoriaId?: number | null;
  valor?: number | string | null;
  categoria?: {
    nome?: string;
  } | null;
};
