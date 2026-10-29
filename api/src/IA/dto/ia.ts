import { TipoTransacao } from '../ia.constants';

export class ResultadoComprovante {
  tipoTransacao!: TipoTransacao;
  valor!: number;
  data!: string; 
  dataEstimada!: boolean; 
  descricao!: string;
  categoriaId!: number | null; 
  categoriaNome!: string | null; 
}