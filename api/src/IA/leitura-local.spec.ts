import { lerTextoComprovante } from './leitura-local';

/** Junta as linhas como o texto sai do PDF. */
const pdf = (...linhas: string[]) => linhas.join('\n');

describe('leitura de comprovante sem IA', () => {
  it('Pix enviado com rótulos em linhas separadas (Destino / Nome / Fulano)', () => {
    const r = lerTextoComprovante(
      pdf(
        'Comprovante de transferência',
        '16 NOV 2026 - 10:32:15',
        'Valor',
        'R$ 150,00',
        'Tipo de transferência',
        'Pix',
        'Destino',
        'Nome',
        'João da Silva',
        'CPF',
        '•••.456.789-••',
        'Origem',
        'Nome',
        'Cliente Teste',
      ),
    );
    expect(r).toEqual({
      valor: 150,
      data: '2026-11-16',
      tipoTransacao: 'SAIDA',
      descricao: 'Pix para João da Silva',
      completa: true,
    });
  });

  it('Pix pago com "nome:" na linha de baixo e milhar no valor', () => {
    const r = lerTextoComprovante(
      pdf(
        'Comprovante de pagamento Pix',
        'valor da transação: R$ 1.234,56',
        'data e hora: 03/11/2026 às 14:20',
        'recebedor',
        'nome: Mercado Bom Preço Ltda',
        'CNPJ: 12.345.678/0001-90',
        'pagador',
        'nome: Cliente Teste',
      ),
    );
    expect(r).toMatchObject({
      valor: 1234.56,
      data: '2026-11-03',
      tipoTransacao: 'SAIDA',
      descricao: 'Pix para Mercado Bom Preço Ltda',
      completa: true,
    });
  });

  it('Pix recebido: valor sem rótulo, data na linha de baixo e nome de quem pagou', () => {
    const r = lerTextoComprovante(
      pdf(
        'Pix recebido',
        'R$ 500,00',
        'Quem pagou',
        'Maria Oliveira',
        'CPF ***.123.456-**',
        'Data',
        '12/11/2026',
      ),
    );
    expect(r).toMatchObject({
      valor: 500,
      data: '2026-11-12',
      tipoTransacao: 'ENTRADA',
      descricao: 'Pix de Maria Oliveira',
      completa: true,
    });
  });

  it('Pix recebido com "De:" e CNPJ na mesma linha', () => {
    const r = lerTextoComprovante(
      pdf(
        'Comprovante de transferência Pix',
        'Pix recebido',
        'Valor: R$ 3.250,00',
        'Data: 05/11/2026 09:15',
        'De: EMPRESA TECNOLOGIA LTDA - CNPJ 98.765.432/0001-10',
        'Para: Cliente Teste',
      ),
    );
    expect(r).toMatchObject({
      valor: 3250,
      tipoTransacao: 'ENTRADA',
      descricao: 'Pix de EMPRESA TECNOLOGIA LTDA',
    });
  });

  it('boleto: ignora vencimento, desconto e juros; usa a data do pagamento', () => {
    const r = lerTextoComprovante(
      pdf(
        'Comprovante de Pagamento de Boleto',
        'Beneficiário: CIA DE ENERGIA ELETRICA',
        'Data de vencimento: 10/11/2026',
        'Data do pagamento: 08/11/2026',
        'Desconto: R$ 0,00',
        'Juros/Multa: R$ 3,10',
        'Valor pago: R$ 245,90',
      ),
    );
    expect(r).toEqual({
      valor: 245.9,
      data: '2026-11-08',
      tipoTransacao: 'SAIDA',
      descricao: 'Boleto CIA DE ENERGIA ELETRICA',
      completa: true,
    });
  });

  it('TED com data por extenso', () => {
    const r = lerTextoComprovante(
      pdf(
        'TED realizada',
        'Realizada em 5 de novembro de 2026',
        'Valor R$12,00',
        'Favorecido: Ana Souza',
      ),
    );
    expect(r).toMatchObject({
      valor: 12,
      data: '2026-11-05',
      tipoTransacao: 'SAIDA',
      descricao: 'Transferência para Ana Souza',
    });
  });

  it('datas no formato 2026-11-05 e 05.11.26', () => {
    expect(lerTextoComprovante('Pix enviado\nR$ 1,00\n2026-11-05').data).toBe(
      '2026-11-05',
    );
    expect(lerTextoComprovante('Pix enviado\nR$ 1,00\n05.11.26').data).toBe(
      '2026-11-05',
    );
  });

  it('data impossível (31/02) é ignorada', () => {
    const r = lerTextoComprovante('Pix enviado\nValor: R$ 9,90\n31/02/2026');
    expect(r.data).toBeNull();
    expect(r.completa).toBe(false);
  });

  it('vários valores sem rótulo: não chuta (deixa para a IA)', () => {
    const r = lerTextoComprovante(
      pdf('Pix enviado', '01/11/2026', 'R$ 10,00', 'R$ 25,00'),
    );
    expect(r.valor).toBeNull();
    expect(r.completa).toBe(false);
  });

  it('linha de tarifa ou saldo não é confundida com o valor', () => {
    const r = lerTextoComprovante(
      pdf('Pix enviado', '01/11/2026', 'Saldo: R$ 900,00', 'R$ 45,00'),
    );
    expect(r.valor).toBe(45);
  });

  it('documento que não é comprovante de banco fica incompleto', () => {
    const r = lerTextoComprovante(
      pdf('Cardápio', 'Pizza grande', 'R$ 59,90', 'Refrigerante R$ 8,00'),
    );
    expect(r.completa).toBe(false);
    expect(r.tipoTransacao).toBeNull();
  });

  it('texto vazio', () => {
    expect(lerTextoComprovante('')).toEqual({
      valor: null,
      data: null,
      tipoTransacao: null,
      descricao: 'Comprovante',
      completa: false,
    });
  });
});
