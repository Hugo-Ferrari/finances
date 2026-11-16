import { categoriaPorHistorico } from './categoria-historico';

describe('categoria pelo histórico', () => {
  const historico = [
    { descricao: 'Padaria Pão Quente', categoriaId: 1 },
    { descricao: 'padaria pao quente', categoriaId: 1 },
    { descricao: 'Padaria Pão Quente', categoriaId: 4 },
    { descricao: 'Uber viagem', categoriaId: 2 },
    { descricao: null, categoriaId: 3 },
    { descricao: 'Farmácia', categoriaId: null },
  ];

  it('usa a categoria mais frequente entre descrições parecidas, sem acento', () => {
    expect(
      categoriaPorHistorico('Pix para PADARIA PAO QUENTE', historico),
    ).toBe(1);
  });

  it('palavras genéricas (pix, compra, ltda) não contam como parecidas', () => {
    expect(
      categoriaPorHistorico('Pix enviado', [
        { descricao: 'Pix para Joana', categoriaId: 1 },
      ]),
    ).toBeNull();
    expect(
      categoriaPorHistorico('Compra Mercado Ltda', [
        { descricao: 'Compra Posto Ltda', categoriaId: 1 },
      ]),
    ).toBeNull();
  });

  it('sem nada parecido devolve null', () => {
    expect(categoriaPorHistorico('Cinema', historico)).toBeNull();
    expect(categoriaPorHistorico('Cinema', [])).toBeNull();
  });

  it('empate: vale a mais recente (primeira da lista)', () => {
    expect(
      categoriaPorHistorico('Uber', [
        { descricao: 'Uber', categoriaId: 5 },
        { descricao: 'Uber', categoriaId: 2 },
      ]),
    ).toBe(5);
  });
});
