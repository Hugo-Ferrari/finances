import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Limita por conta, não por IP: todas as requisições chegam pelo proxy da
 * Vercel, então o IP seria o mesmo para todos os usuários.
 * - Rotas autenticadas: conta pelo id do usuário.
 * - Login: conta pelo e-mail informado.
 */
@Injectable()
export class ThrottlerPorContaGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const usuarioId = (req.user as { id?: number } | undefined)?.id;
    if (usuarioId !== undefined) return Promise.resolve(`usuario:${usuarioId}`);

    const email = (req.body as { email?: unknown } | undefined)?.email;
    if (typeof email === 'string' && email.trim()) {
      return Promise.resolve(`email:${email.trim().toLowerCase()}`);
    }

    return Promise.resolve(`ip:${String(req.ip)}`);
  }
}
