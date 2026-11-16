import { HttpException } from '@nestjs/common';
import { IaService } from './ia.service';
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

const categorias = [
  { id: 1, nome: 'Mercado' },
  { id: 2, nome: 'Saúde' },
  { id: 3, nome: 'farmacia' }, // nome antigo, gravado sem acento
];
const prisma = {
  categoria: { findMany: jest.fn().mockResolvedValue(categorias) },
};
const servico = () => new IaService(prisma as never);
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
  beforeEach(() => generateContent.mockReset());

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

  it('erros do Gemini viram respostas claras: 503, 429, vazio e outros', async () => {
    generateContent.mockRejectedValueOnce(
      Object.assign(new Error('x'), { status: 503 }),
    );
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(503);
    generateContent.mockRejectedValueOnce(
      Object.assign(new Error('x'), { status: 429 }),
    );
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(429);
    generateContent.mockResolvedValueOnce({ text: '' });
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(500);
    generateContent.mockRejectedValueOnce(
      Object.assign(new Error('modelo não encontrado'), { status: 404 }),
    );
    expect(
      await status(servico().analisarComprovante(7, arquivo, 'image/png')),
    ).toBe(500);
  });
});
