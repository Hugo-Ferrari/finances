import { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { ControllerIA } from './ia.controller';
import { IaService } from './ia.service';

describe('POST /ia/comprovante', () => {
  let app: INestApplication<App>;
  const analisar = jest.fn().mockResolvedValue({ ok: true });

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] }),
      ],
      controllers: [ControllerIA],
      providers: [
        { provide: IaService, useValue: { analisarComprovante: analisar } },
      ],
    }).compile();
    app = modulo.createNestApplication();
    // Simula o usuário autenticado (o JwtGuard global não entra neste teste).
    app.use(
      (
        req: { user?: unknown; headers: Record<string, string> },
        _res: unknown,
        next: () => void,
      ) => {
        req.user = { id: Number(req.headers['x-usuario'] ?? 1) };
        next();
      },
    );
    await app.init();
  });

  afterAll(() => app.close());

  const enviar = (usuario: number, nome: string, tipo: string, tamanho = 100) =>
    request(app.getHttpServer())
      .post('/ia/comprovante')
      .set('x-usuario', String(usuario))
      .attach('imagem', Buffer.alloc(tamanho, 1), {
        filename: nome,
        contentType: tipo,
      });

  it('aceita JPG, PNG, WEBP e PDF e repassa o arquivo para a análise', async () => {
    for (const [nome, tipo] of [
      ['a.jpg', 'image/jpeg'],
      ['a.png', 'image/png'],
      ['a.webp', 'image/webp'],
      ['a.pdf', 'application/pdf'],
    ]) {
      await enviar(1, nome, tipo).expect(201);
    }
    expect(analisar).toHaveBeenLastCalledWith(
      1,
      expect.any(Buffer),
      'application/pdf',
    );
  });

  it('sem arquivo ou com formato não aceito → 400', async () => {
    await request(app.getHttpServer())
      .post('/ia/comprovante')
      .set('x-usuario', '2')
      .expect(400);
    const r = await enviar(2, 'a.txt', 'text/plain').expect(400);
    expect((r.body as { message: string }).message).toContain(
      'Formato inválido',
    );
  });

  it('arquivo acima de 5 MB → 413', async () => {
    await enviar(3, 'grande.png', 'image/png', 5 * 1024 * 1024 + 1).expect(413);
  });

  it('limite de 20 análises por hora por usuário (outro usuário não é afetado)', async () => {
    for (let i = 0; i < 20; i++)
      await enviar(4, 'a.png', 'image/png').expect(201);
    const r = await enviar(4, 'a.png', 'image/png').expect(429);
    expect(JSON.stringify(r.body)).toMatch(/Too Many|Muitas/);
    await enviar(5, 'a.png', 'image/png').expect(201);
  });
});
