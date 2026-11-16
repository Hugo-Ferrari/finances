import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client.ts/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    // Banco (Neon, São Paulo) longe da API: abrir uma conexão nova custa caro
    // (TLS + autenticação atravessando o continente). Mantém as conexões
    // abertas por mais tempo e com keep-alive, em vez de fechar após 10 s.
    const adapter = new PrismaPg({
      connectionString,
      max: 10,
      idleTimeoutMillis: 5 * 60_000,
      keepAlive: true,
      connectionTimeoutMillis: 20_000,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
