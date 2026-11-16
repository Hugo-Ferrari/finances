import {
  aliquotaIR,
  calcularEstado,
  impostoEstimado,
  prever,
  rendimentoNoPeriodo,
  rendimentosMensais,
  resumir,
  SaldoInsuficienteError,
  somarMeses,
  Taxa,
} from './rendimento';

const anual12: Taxa[] = [{ taxa: 12, periodo: 'ANUAL', inicio: '2025-01-01' }];
const mensal1: Taxa[] = [{ taxa: 1, periodo: 'MENSAL', inicio: '2025-01-01' }];
const dep = (valor: number, data: string) => ({
  tipo: 'DEPOSITO' as const,
  valor,
  data,
});
const ret = (valor: number, data: string) => ({
  tipo: 'RETIRADA' as const,
  valor,
  data,
});

describe('rendimento das caixinhas', () => {
  it('12% ao ano: R$ 1.000 viram R$ 1.120 em um ano', () => {
    const e = calcularEstado(anual12, [dep(1000, '2025-01-01')], '2026-01-01');
    expect(e.saldo).toBeCloseTo(1120, 2);
  });

  it('1% ao mês: R$ 1.000 viram 1000 × 1,01^12 = R$ 1.126,83 em um ano', () => {
    const e = calcularEstado(mensal1, [dep(1000, '2025-01-01')], '2026-01-01');
    expect(e.saldo).toBeCloseTo(1126.83, 2);
  });

  it('1% ao mês: R$ 1.000 viram exatamente R$ 1.010 após um mês', () => {
    expect(
      calcularEstado(mensal1, [dep(1000, '2025-04-01')], '2025-05-01').saldo,
    ).toBeCloseTo(1010, 6);
    expect(
      calcularEstado(mensal1, [dep(1000, '2025-02-15')], '2025-03-15').saldo,
    ).toBeCloseTo(1010, 6);
    expect(
      calcularEstado(mensal1, [dep(1000, '2025-01-31')], '2025-02-28').saldo,
    ).toBeCloseTo(1010, 6);
  });

  it('todo mês completo do extrato rende exatamente a taxa (inclusive fevereiro)', () => {
    const meses = rendimentosMensais(
      mensal1,
      [dep(1000, '2025-01-01')],
      '2025-06-30',
    );
    // 30/06 é o último dia: junho também está completo
    const valores = meses.reverse().map((m) => m.valor);
    const esperados = [0, 1, 2, 3, 4, 5].map(
      (k) => Math.round(1000 * Math.pow(1.01, k) * 0.01 * 100) / 100,
    );
    // janeiro começa no dia 1 (depósito no fim do dia 1): 29/30 de mês
    expect(valores[0]).toBeCloseTo(1000 * (Math.pow(1.01, 29 / 30) - 1), 2);
    for (let k = 1; k < valores.length; k++)
      expect(valores[k]).toBeLessThan(esperados[k] + 0.11);
    expect(valores[2]).toBeGreaterThan(valores[1]); // março > fevereiro só pelos juros compostos
    expect(valores[3]).toBeGreaterThan(valores[2]); // abril > março (antes ficava menor)
  });

  it('dias de um mês incompleto rendem proporcionalmente', () => {
    // 15 dias comerciais = meio mês
    const e = calcularEstado(mensal1, [dep(1000, '2025-04-01')], '2025-04-16');
    expect(e.saldo).toBeCloseTo(1000 * Math.pow(1.01, 0.5), 6);
  });

  it('dividir o período em vários movimentos não muda o resultado', () => {
    const zero = { tipo: 'DEPOSITO' as const, valor: 0, data: '2025-03-17' };
    const direto = calcularEstado(
      mensal1,
      [dep(1000, '2025-01-05')],
      '2025-09-23',
    ).saldo;
    const dividido = calcularEstado(
      mensal1,
      [dep(1000, '2025-01-05'), zero],
      '2025-09-23',
    ).saldo;
    expect(dividido).toBeCloseTo(direto, 8);
  });

  it('não rende antes do depósito e rende no próprio ritmo depois', () => {
    expect(
      calcularEstado(anual12, [dep(1000, '2025-06-01')], '2025-05-31').saldo,
    ).toBe(0);
    expect(
      calcularEstado(anual12, [dep(1000, '2025-06-01')], '2025-06-01').saldo,
    ).toBe(1000);
  });

  it('mudança de taxa vale só a partir do dia de início', () => {
    const taxas: Taxa[] = [
      ...anual12,
      { taxa: 0, periodo: 'ANUAL', inicio: '2025-07-02' },
    ];
    const e = calcularEstado(taxas, [dep(1000, '2025-01-01')], '2026-01-01');
    // 6 meses a 12% ao ano (01/01 → 01/07) e depois nada
    expect(e.saldo).toBeCloseTo(1000 * Math.pow(1.12, 0.5), 2);
  });

  it('retirada sai dos depósitos mais antigos e não pode passar do saldo', () => {
    const movs = [
      dep(1000, '2025-01-01'),
      dep(500, '2025-06-01'),
      ret(1200, '2025-06-01'),
    ];
    const e = calcularEstado(
      [{ taxa: 0, periodo: 'ANUAL', inicio: '2025-01-01' }],
      movs,
      '2025-06-01',
    );
    expect(e.saldo).toBeCloseTo(300, 2);
    expect(e.lotes).toHaveLength(1);
    expect(e.lotes[0].data).toBe('2025-06-01');
    expect(() =>
      calcularEstado(
        anual12,
        [dep(100, '2025-01-01'), ret(200, '2025-01-02')],
        '2025-02-01',
      ),
    ).toThrow(SaldoInsuficienteError);
  });

  it('ajuste passa a valer o saldo informado e a diferença conta como rendimento', () => {
    const movs = [
      dep(1000, '2025-01-01'),
      { tipo: 'AJUSTE' as const, valor: 1050, data: '2025-03-01' },
    ];
    const e = calcularEstado(
      [{ taxa: 0, periodo: 'ANUAL', inicio: '2025-01-01' }],
      movs,
      '2025-03-01',
    );
    expect(e.saldo).toBeCloseTo(1050, 2);
    expect(e.saldo - e.depositado).toBeCloseTo(50, 2);
  });

  it('imposto pela tabela regressiva conforme a idade de cada depósito', () => {
    expect(aliquotaIR(180)).toBe(0.225);
    expect(aliquotaIR(181)).toBe(0.2);
    expect(aliquotaIR(361)).toBe(0.175);
    expect(aliquotaIR(721)).toBe(0.15);
    const e = calcularEstado(anual12, [dep(1000, '2025-01-01')], '2026-02-05'); // 400 dias
    const ganho = e.saldo - 1000;
    expect(impostoEstimado(e, '2026-02-05', false)).toBeCloseTo(
      ganho * 0.175,
      2,
    );
    expect(impostoEstimado(e, '2026-02-05', true)).toBe(0);
  });

  it('rendimento do mês desconta depósitos e retiradas do período', () => {
    const movs = [dep(1000, '2025-01-01'), dep(5000, '2025-03-15')];
    const r = rendimentoNoPeriodo(anual12, movs, '2025-02-28', '2025-03-31');
    const esperado =
      calcularEstado(anual12, movs, '2025-03-31').saldo -
      calcularEstado(anual12, movs, '2025-02-28').saldo -
      5000;
    expect(r).toBeCloseTo(esperado, 6);
    expect(r).toBeGreaterThan(0);
  });

  it('resumo de hoje e extrato mensal batem com o rendimento total', () => {
    const movs = [dep(1000, '2025-01-10')];
    const resumo = resumir(mensal1, movs, '2025-04-20', false);
    const meses = rendimentosMensais(mensal1, movs, '2025-04-20');
    expect(meses.map((m) => m.mes)).toEqual([
      '2025-04',
      '2025-03',
      '2025-02',
      '2025-01',
    ]);
    const soma = meses.reduce((t, m) => t + m.valor, 0);
    expect(soma).toBeCloseTo(resumo.rendimentoTotal, 1);
    expect(resumo.rendimentoMes).toBe(meses[0].valor);
    expect(resumo.liquido).toBeLessThan(resumo.saldo);
  });

  it('previsão de 12 meses sem aporte bate com o cálculo direto', () => {
    const p = prever(
      mensal1,
      [dep(1000, '2025-01-01')],
      '2025-01-01',
      12,
      0,
      true,
    );
    expect(p).toHaveLength(13);
    expect(p[12].data).toBe('2026-01-01');
    expect(p[12].saldo).toBeCloseTo(1126.83, 2);
  });

  it('previsão com aporte mensal de R$ 100 a 1% ao mês = R$ 2.395,08 em 12 meses', () => {
    const p = prever(
      mensal1,
      [dep(1000, '2025-01-01')],
      '2025-01-01',
      12,
      100,
      true,
    );
    // 1000×1,01^12 + 100×((1,01^12−1)/0,01) = 1126,83 + 1268,25
    expect(p[12].saldo).toBeCloseTo(2395.08, 2);
    expect(p[12].investido).toBeCloseTo(2200, 2);
  });

  it('somarMeses ajusta fim de mês', () => {
    expect(somarMeses('2025-01-31', 1)).toBe('2025-02-28');
    expect(somarMeses('2025-11-15', 3)).toBe('2026-02-15');
  });
});
