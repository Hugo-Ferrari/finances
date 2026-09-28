export class ResultadoComprovante {
  tipoTransacao!: 'ENTRADA' | 'SAIDA';
  valor!: number;
  data!: string;
  descricao!: string;
  categoria!: string;
}