import {
  dataNaCompetencia,
  ehCompetenciaValida,
  ocorrenciasEntre,
  pendentesAte,
  RecorrenteCalc,
  somarCompetencia,
  ultimaCompetencia,
} from './calendario';
import {
  calcularGastarHoje,
  EntradaGastarHoje,
  simularGasto,
} from './gastar-hoje';
import {
  datasDasParcelas,
  parcelaPrice,
  simularParcelamento,
  taxaImplicita,
} from './parcelamento';

let proximoId = 1;
function rec(parcial: Partial<RecorrenteCalc>): RecorrenteCalc {
  return {
    id: proximoId++,
    descricao: 'Conta',
    valor: 100,
    tipo: 'SAIDA',
    inicio: '2026-01-10',
    parcelasTotal: null,
    parcelaInicial: 1,
    ehSalario: false,
    ativo: true,
    criadoEm: '2026-11-01',
    ocorrencias: [],
    ...parcial,
  };
}

const salario = (parcial: Partial<RecorrenteCalc> = {}) =>
  rec({
    descricao: 'Salário',
    valor: 3800,
    tipo: 'ENTRADA',
    ehSalario: true,
    inicio: '2026-01-04',
    ...parcial,
  });

function entrada(parcial: Partial<EntradaGastarHoje>): EntradaGastarHoje {
  return {
    hoje: '2026-11-16',
    saldoDisponivel: 0,
    recorrentes: [],
    metaPercentual: 20,
    gastoHoje: 0,
    entradasDoMes: 0,
    movimentosCaixinha: [],
    ...parcial,
  };
}

describe('calendário dos recorrentes', () => {
  it('usa o último dia em meses mais curtos', () => {
    expect(dataNaCompetencia('2026-01-31', '2026-02')).toBe('2026-02-28');
    expect(dataNaCompetencia('2026-01-31', '2028-02')).toBe('2028-02-29');
    expect(dataNaCompetencia('2026-01-31', '2026-11')).toBe('2026-11-30');
    expect(dataNaCompetencia('2026-01-31', '2026-12')).toBe('2026-12-31');
  });

  it('soma meses atravessando o ano', () => {
    expect(somarCompetencia('2026-11', 3)).toBe('2027-02');
    expect(somarCompetencia('2026-01', -1)).toBe('2025-12');
  });

  it('parcelado para depois da última parcela', () => {
    const r = rec({ inicio: '2026-10-05', parcelasTotal: 3 });
    const lista = ocorrenciasEntre(r, '2026-01-01', '2027-12-31');
    expect(lista.map((o) => [o.data, o.parcela])).toEqual([
      ['2026-10-05', 1],
      ['2026-11-05', 2],
      ['2026-12-05', 3],
    ]);
    expect(ultimaCompetencia(r)).toBe('2026-12');
    expect(ehCompetenciaValida(r, '2027-01')).toBe(false);
    expect(ehCompetenciaValida(r, '2026-09')).toBe(false);
    expect(ehCompetenciaValida(r, '2026-11')).toBe(true);
  });

  it('compra antiga começa da parcela informada', () => {
    const r = rec({
      inicio: '2026-11-25',
      parcelasTotal: 8,
      parcelaInicial: 3,
    });
    const lista = ocorrenciasEntre(r, '2026-11-01', '2030-01-01');
    expect(lista).toHaveLength(6);
    expect(lista[0].parcela).toBe(3);
    expect(lista[5]).toMatchObject({ parcela: 8, data: '2027-04-25' });
  });

  it('marca meses pagos e pulados; atrasados contam só depois do cadastro', () => {
    const r = rec({
      inicio: '2026-01-10',
      criadoEm: '2026-09-20',
      ocorrencias: [
        { competencia: '2026-09', paga: true },
        { competencia: '2026-10', paga: false },
      ],
    });
    const pendentes = pendentesAte(r, '2026-11-30');
    expect(pendentes.map((o) => o.competencia)).toEqual(['2026-11']);
    const todas = ocorrenciasEntre(r, '2026-09-01', '2026-10-31');
    expect(todas.map((o) => o.status)).toEqual(['PAGA', 'PULADA']);
  });

  it('inativo não gera ocorrências', () => {
    expect(
      ocorrenciasEntre(rec({ ativo: false }), '2026-01-01', '2026-12-31'),
    ).toEqual([]);
  });
});

describe('quanto posso gastar hoje', () => {
  it('exemplo completo: salário dia 4, contas e meta de 20%', () => {
    const r = calcularGastarHoje(
      entrada({
        saldoDisponivel: 3175, // já descontado o gasto de hoje
        gastoHoje: 18,
        recorrentes: [
          salario(),
          rec({ descricao: 'Internet', valor: 99.9, inicio: '2026-01-19' }),
          rec({
            descricao: 'Aluguel',
            valor: 850,
            inicio: '2026-01-01',
            ocorrencias: [{ competencia: '2026-11', paga: true }],
          }),
          rec({ descricao: 'Spotify', valor: 25, inicio: '2026-01-28' }),
        ],
      }),
    );
    // Ciclo: 16/11 até 03/12 (salário em 04/12) = 18 dias.
    expect(r.fimCiclo).toBe('2026-12-04');
    expect(r.inicioCiclo).toBe('2026-11-04');
    expect(r.dias).toBe(18);
    // Contas: internet 19/11, spotify 28/11, aluguel 01/12 (o de novembro já foi pago).
    expect(r.contas.map((c) => c.descricao)).toEqual([
      'Internet',
      'Spotify',
      'Aluguel',
    ]);
    expect(r.totalContas).toBeCloseTo(974.9, 2);
    expect(r.metaGuardar).toBe(760);
    // livre no começo do dia = 3175 + 18 − 974,90 − 760 = 1458,10 → 81,00/dia
    expect(r.porDia).toBe(81);
    expect(r.restanteHoje).toBe(63);
    expect(r.livre).toBeCloseTo(1440.1, 2);
    expect(r.estado).toBe('OK');
    expect(r.proximoSalario).toEqual({
      descricao: 'Salário',
      valor: 3800,
      data: '2026-12-04',
    });
  });

  it('o que já foi para as caixinhas no ciclo abate a meta', () => {
    const r = calcularGastarHoje(
      entrada({
        saldoDisponivel: 2000,
        recorrentes: [salario()],
        movimentosCaixinha: [
          { tipo: 'DEPOSITO', valor: 500, data: '2026-11-05' },
          { tipo: 'RETIRADA', valor: 100, data: '2026-11-10' },
          { tipo: 'DEPOSITO', valor: 999, data: '2026-10-20' }, // ciclo anterior
        ],
      }),
    );
    expect(r.jaGuardado).toBe(400);
    expect(r.metaRestante).toBe(360);
  });

  it('sem salário: ciclo até o fim do mês e meta sobre as entradas do mês', () => {
    const r = calcularGastarHoje(
      entrada({ saldoDisponivel: 1500, entradasDoMes: 2000 }),
    );
    expect(r.fimCiclo).toBe('2026-12-01');
    expect(r.dias).toBe(15);
    expect(r.metaGuardar).toBe(400);
    expect(r.porDia).toBe(73.33);
    expect(r.proximoSalario).toBeNull();
    // Sem salário não aparece o dia "do salário" na faixa.
    expect(r.proximosDias.every((d) => d.porDia !== null)).toBe(true);
  });

  it('gastou mais que o valor do dia: estado ACIMA', () => {
    const r = calcularGastarHoje(
      entrada({ saldoDisponivel: 1300, gastoHoje: 200, metaPercentual: 0 }),
    );
    expect(r.porDia).toBe(100); // (1300 + 200) / 15
    expect(r.restanteHoje).toBe(-100);
    expect(r.estado).toBe('ACIMA');
  });

  it('contas maiores que o saldo: estado NEGATIVO e por dia zero', () => {
    const r = calcularGastarHoje(
      entrada({
        saldoDisponivel: 300,
        metaPercentual: 0,
        recorrentes: [rec({ valor: 500, inicio: '2026-01-20' })],
      }),
    );
    expect(r.porDia).toBe(0);
    expect(r.livre).toBe(-200);
    expect(r.estado).toBe('NEGATIVO');
  });

  it('conta atrasada entra nas contas a pagar', () => {
    const r = calcularGastarHoje(
      entrada({
        saldoDisponivel: 1000,
        metaPercentual: 0,
        recorrentes: [
          rec({
            descricao: 'Luz',
            valor: 120,
            inicio: '2026-01-10',
            criadoEm: '2026-11-01',
          }),
        ],
      }),
    );
    expect(r.contas).toHaveLength(1);
    expect(r.contas[0]).toMatchObject({
      descricao: 'Luz',
      atrasada: true,
      data: '2026-11-10',
    });
  });

  it('próximos dias param no dia do salário e mostram as contas', () => {
    const r = calcularGastarHoje(
      entrada({
        hoje: '2026-11-30',
        saldoDisponivel: 1000,
        metaPercentual: 0,
        recorrentes: [
          salario(),
          rec({ descricao: 'Aluguel', valor: 400, inicio: '2026-01-01' }),
        ],
      }),
    );
    expect(r.dias).toBe(4);
    expect(r.proximosDias.map((d) => d.data)).toEqual([
      '2026-11-30',
      '2026-12-01',
      '2026-12-02',
      '2026-12-03',
      '2026-12-04',
    ]);
    expect(r.proximosDias[1].eventos[0]).toMatchObject({
      descricao: 'Aluguel',
      valor: 400,
    });
    expect(r.proximosDias[4]).toMatchObject({ porDia: null });
    expect(r.proximosDias[4].eventos[0]).toMatchObject({ ehSalario: true });
  });

  it('simula um gasto: os próximos dias caem', () => {
    const r = calcularGastarHoje(
      entrada({ saldoDisponivel: 1500, metaPercentual: 0 }),
    );
    expect(r.porDia).toBe(100);
    const s = simularGasto(r, 150);
    expect(s.livreDepois).toBe(1350);
    expect(s.porDiaDepois).toBe(96.42); // 1350 / 14
  });
});

describe('calculadora de parcelamento', () => {
  it('parcela pela tabela Price', () => {
    expect(parcelaPrice(1000, 0.02, 12)).toBeCloseTo(94.56, 2);
    expect(parcelaPrice(1200, 0, 12)).toBe(100);
  });

  it('acha a taxa embutida a partir da parcela', () => {
    expect(taxaImplicita(1000, 94.56, 12) * 100).toBeCloseTo(2, 2);
    expect(taxaImplicita(1200, 100, 12)).toBe(0);
  });

  it('datas das parcelas respeitam meses curtos', () => {
    expect(datasDasParcelas('2026-12-31', 3)).toEqual([
      '2026-12-31',
      '2027-01-31',
      '2027-02-28',
    ]);
  });

  it('"sem juros" com desconto à vista tem juros escondidos', () => {
    const r = simularParcelamento({
      hoje: '2026-11-16',
      valor: 1200,
      parcelas: 12,
      descontoAVista: 10,
      primeiraParcela: '2026-12-16',
    });
    expect(r.precoAVista).toBe(1080);
    expect(r.parcela).toBe(100);
    expect(r.custoParcelar).toBe(120);
    expect(r.taxaMensal).toBeCloseTo(1.62, 1);
    expect(r.melhor).toBe('A_VISTA');
    expect(r.cronograma).toHaveLength(12);
  });

  it('sem desconto e com o dinheiro rendendo, parcelar compensa', () => {
    const r = simularParcelamento({
      hoje: '2026-11-16',
      valor: 1200,
      parcelas: 12,
      rendimentoMensal: 1,
      primeiraParcela: '2026-12-16',
    });
    expect(r.taxaMensal).toBe(0);
    expect(r.melhor).toBe('PARCELADO');
    expect(r.valorPresente).toBeLessThan(1200);
    expect(r.economia).toBeCloseTo(1200 - r.valorPresente, 2);
  });

  it('taxa informada pela loja vira parcela', () => {
    const r = simularParcelamento({
      hoje: '2026-11-16',
      valor: 1000,
      parcelas: 12,
      taxaJuros: 2,
      primeiraParcela: '2026-12-16',
    });
    expect(r.parcela).toBeCloseTo(94.56, 2);
    expect(r.taxaMensal).toBeCloseTo(2, 1);
  });
});
