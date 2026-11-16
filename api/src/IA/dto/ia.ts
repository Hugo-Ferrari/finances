import { TipoTransacao } from '../ia.constants';

/**
 * De onde vieram os dados:
 * - `ia`: lidos pela IA;
 * - `leitura`: lidos direto do texto do PDF, sem IA;
 * - `leitura-parcial`: a IA falhou e só parte do PDF foi lida (conferir).
 */
export type OrigemLeitura = 'ia' | 'leitura' | 'leitura-parcial';

export class ResultadoComprovante {
  tipoTransacao!: TipoTransacao;
  valor!: number;
  data!: string;
  dataEstimada!: boolean;
  descricao!: string;
  categoriaId!: number | null;
  categoriaNome!: string | null;
  origem!: OrigemLeitura;
}
