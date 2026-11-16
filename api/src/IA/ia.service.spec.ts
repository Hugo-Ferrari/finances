import { HttpException } from '@nestjs/common';
import {
  ESPERAS_GEMINI_MS,
  IaService,
  TEMPO_LIMITE_GEMINI_MS,
} from './ia.service';
import { hojeNoBrasil } from 'src/common/datas';

// Simula o cliente do Gemini: cada teste define o que generateContent devolve.
const generateContent = jest.fn();
jest.mock('@google/genai', () => {
  const real =
    jest.requireActual<typeof import('@google/genai')>('@google/genai');
  return {
    ...real,
    GoogleGenAI: jest
      .fn()
      .mockImplementation(() => ({ models: { generateContent } })),
  };
});

// Texto do PDF: cada teste define (vazio = PDF escaneado / foto).
const extrairTextoPdf = jest.fn<Promise<string>, [Buffer]>();
jest.mock('./texto-pdf', () => ({
  extrairTextoPdf: (b: Buffer) => extrairTextoPdf(b),
}));

const categorias = [
  { id: 1, nome: 'Mercado' },
  { id: 2, nome: 'Saúde' },
  { id: 3, nome: 'farmacia' }, // nome antigo, gravado sem acento
];
const historico = jest.fn();
const prisma = {
  categoria: { findMany: jest.fn().mockResolvedValue(categorias) },
  transacao: { findMany: historico },
};
// Não espera de verdade entre as tentativas; só registra quanto esperaria.
const esperas: number[] = [];
class IaServiceSemEspera extends IaService {
  protected esperar(ms: number) {
    esperas.push(ms);
    return Promise.resolve();
  }
}
const servico = () => new IaServiceSemEspera(prisma as never);
const erro = (status?: number) =>
  Object.assign(new Error(`falha ${status ?? 'de rede'}`), { status });
const resposta = (obj: unknown) =>
  generateContent.mockResolvedValueOnce({ text: JSON.stringify(obj) });
const arquivo = Buffer.from('imagem');

async function status(promessa: Promise<unknown>) {
  try {
    await promessa;
    return 200;
  } catch (e) {
    return e instanceof HttpException ? e.getStatus() : 'erro inesperado';
  }
}

describe('IA de comprovantes', () => {
  beforeEach(() => {
    generateContent.mockReset();
    extrairTextoPdf.mockReset().mockResolvedValue('');
    historico.mockReset().mockResolvedValue([]);
    esperas.length = 0;
  });

  it('lê o comprovante e casa a categoria do usuário ignorando acento e maiúscula', async () => {
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 87.456,
      data: '2026-11-10',
      descricao: '  Drogaria São Paulo  ',
      categoria: 'SAUDE',
    });
    const r = await servico().analisarComprovante(7, arquivo, 'image/png');
    expect(r).toEqual({
      tipoTransacao: 'SAIDA',
      valor: 87.46,
      data: '2026-11-10',
      dataEstimada: false,
      descricao: 'Drogaria São Paulo',
      categoriaId: 2,
      categoriaNome: 'Saúde',
      origem: 'ia',
    });
    // Busca só as categorias do próprio usuário e envia o arquivo em base64
    expect(prisma.categoria.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { usuarioId: 7 } }),
    );
    type Chamada = {
      model: string;
      contents: [{ inlineData: unknown }, { text: string }];
    };
    const chamada = (generateContent.mock.calls as Chamada[][])[0][0];
    expect(chamada.model).toBe('gemini-3.8-flash');
    expect(chamada.contents[0].inlineData).toEqual({
      mimeType: 'image/png',
      data: arquivo.toString('base64'),
    });
    expect(chamada.contents[1].text).toContain('- Saúde');
  });

  it('categoria antiga sem acento também casa ("Farmácia" ↔ "farmacia")', async () => {
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 10,
      data: '2026-11-01',
      descricao: 'x',
      categoria: 'Farmácia',
    });
    expect(
      (await servico().analisarComprovante(7, arquivo, 'image/jpeg'))
        .categoriaId,
    ).toBe(3);
  });

  it('sem data legível usa hoje e avisa que foi estimada; categoria desconhecida vira null', async () => {
    resposta({
      tipoTransacao: 'ENTRADA',
      valor: 1500,
      data: null,
      descricao: '',
      categoria: 'Investimentos',
    });
    const r = await servico().analisarComprovante(
      7,
      arquivo,
      'application/pdf',
    );
    expect(r.data).toBe(hojeNoBrasil());
    expect(r.dataEstimada).toBe(true);
    expect(r.categoriaId).toBeNull();
    expect(r.descricao).toBe('Sem descrição');
    expect(r.tipoTransacao).toBe('ENTRADA');
  });

  it('data em formato errado também é tratada como estimada', async () => {
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 5,
      data: '10/11/2026',
      descricao: 'x',
      categoria: null,
    });
    expect(
      (await servico().analisarComprovante(7, arquivo, 'image/png'))
        .dataEstimada,
    ).toBe(true);
  });

  it('tipo inválido vira SAIDA', async () => {
    resposta({
      tipoTransacao: 'PIX',
      valor: 5,
      data: '2026-11-01',
      descricao: 'x',
      categoria: null,
    });
    expect(
      (await servico().analisarComprovante(7, arquivo, 'image/png'))
        .tipoTransacao,
    ).toBe('SAIDA');
  });

  it('valor zero/negativo ou JSON inválido → 422 (não dá para usar)', async () => {
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 0,
      data: '2026-11-01',
      descricao: 'x',
      categoria: null,
    });
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(422);
    generateContent.mockResolvedValueOnce({ text: 'não é json' });
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(422);
  });

  it('pede ao Gemini um tempo limite por chamada', async () => {
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 5,
      data: '2026-11-01',
      descricao: 'x',
      categoria: null,
    });
    await servico().analisarComprovante(7, arquivo, 'image/png');
    type Chamada = { config: { httpOptions: { timeout: number } } };
    const chamada = (generateContent.mock.calls as Chamada[][])[0][0];
    expect(chamada.config.httpOptions.timeout).toBe(TEMPO_LIMITE_GEMINI_MS);
  });

  it('tenta de novo em erro passageiro (503 e falha de rede) e segue quando dá certo', async () => {
    generateContent
      .mockRejectedValueOnce(erro(503))
      .mockRejectedValueOnce(erro());
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 12,
      data: '2026-11-01',
      descricao: 'Padaria',
      categoria: 'Mercado',
    });
    const r = await servico().analisarComprovante(7, arquivo, 'image/png');
    expect(r.valor).toBe(12);
    expect(generateContent).toHaveBeenCalledTimes(3);
    expect(esperas).toEqual(ESPERAS_GEMINI_MS);
  });

  it('desiste depois de 3 tentativas e devolve 503 com mensagem clara', async () => {
    generateContent.mockRejectedValue(erro(503));
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(503);
    expect(generateContent).toHaveBeenCalledTimes(3);
  });

  it('resposta vazia também é tentada de novo', async () => {
    generateContent.mockResolvedValue({ text: '' });
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(503);
    expect(generateContent).toHaveBeenCalledTimes(3);
  });

  it('não insiste em erro que não é passageiro: 429 e 404', async () => {
    generateContent.mockRejectedValueOnce(erro(429));
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(429);
    generateContent.mockRejectedValueOnce(erro(404));
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(500);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(esperas).toEqual([]);
  });

  describe('PDF de banco', () => {
    const pixRecebido = [
      'Comprovante de transferência Pix',
      'Pix recebido',
      'Valor: R$ 3.250,00',
      'Data: 05/11/2026 09:15',
      'De: EMPRESA TECNOLOGIA LTDA - CNPJ 98.765.432/0001-10',
    ].join('\n');

    it('lê sem IA e sugere a categoria pelo histórico do usuário', async () => {
      extrairTextoPdf.mockResolvedValue(pixRecebido);
      historico.mockResolvedValue([
        { descricao: 'Salário Empresa Tecnologia', categoriaId: 1 },
      ]);
      const r = await servico().analisarComprovante(
        7,
        arquivo,
        'application/pdf',
      );
      expect(r).toEqual({
        tipoTransacao: 'ENTRADA',
        valor: 3250,
        data: '2026-11-05',
        dataEstimada: false,
        descricao: 'Pix de EMPRESA TECNOLOGIA LTDA',
        categoriaId: 1,
        categoriaNome: 'Mercado',
        origem: 'leitura',
      });
      expect(generateContent).not.toHaveBeenCalled();
      // O histórico consultado é só o do próprio usuário
      const [consulta] = historico.mock.calls[0] as [
        { where: { conta: unknown } },
      ];
      expect(consulta.where.conta).toEqual({ usuarioId: 7 });
    });

    it('PDF escaneado (sem texto) vai para a IA', async () => {
      resposta({
        tipoTransacao: 'SAIDA',
        valor: 40,
        data: '2026-11-02',
        descricao: 'Posto',
        categoria: null,
      });
      const r = await servico().analisarComprovante(
        7,
        arquivo,
        'application/pdf',
      );
      expect(r.origem).toBe('ia');
      expect(generateContent).toHaveBeenCalledTimes(1);
    });

    it('leitura incompleta usa a IA; se a IA cair, devolve o que leu para conferir', async () => {
      const semData = 'Pix enviado\nValor: R$ 80,00\nPara: Maria';
      extrairTextoPdf.mockResolvedValue(semData);
      resposta({
        tipoTransacao: 'SAIDA',
        valor: 80,
        data: '2026-11-03',
        descricao: 'Maria',
        categoria: null,
      });
      const comIa = await servico().analisarComprovante(
        7,
        arquivo,
        'application/pdf',
      );
      expect(comIa.origem).toBe('ia');
      expect(comIa.data).toBe('2026-11-03');

      generateContent.mockRejectedValue(erro(503));
      const semIa = await servico().analisarComprovante(
        7,
        arquivo,
        'application/pdf',
      );
      expect(semIa).toMatchObject({
        origem: 'leitura-parcial',
        valor: 80,
        tipoTransacao: 'SAIDA',
        descricao: 'Pix para Maria',
        data: hojeNoBrasil(),
        dataEstimada: true,
      });
    });

    it('foto com a IA fora do ar não tem o que devolver: 503', async () => {
      generateContent.mockRejectedValue(erro(503));
      expect(
        await status(servico().analisarComprovante(7, arquivo, 'image/jpeg')),
      ).toBe(503);
      expect(extrairTextoPdf).not.toHaveBeenCalled();
    });
  });

  it('quando a IA não acha categoria, o histórico sugere uma', async () => {
    historico.mockResolvedValue([
      { descricao: 'Drogaria São Paulo', categoriaId: 2 },
      { descricao: 'Drogaria Sao Paulo centro', categoriaId: 2 },
      { descricao: 'Uber', categoriaId: 1 },
    ]);
    resposta({
      tipoTransacao: 'SAIDA',
      valor: 30,
      data: '2026-11-01',
      descricao: 'DROGARIA SAO PAULO',
      categoria: null,
    });
    const r = await servico().analisarComprovante(7, arquivo, 'image/png');
    expect(r.categoriaId).toBe(2);
    expect(r.categoriaNome).toBe('Saúde');
  });
});
