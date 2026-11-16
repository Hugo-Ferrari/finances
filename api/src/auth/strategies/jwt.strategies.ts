import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (request: Request) => {
        const cookie = request.cookies as Record<string, string> | undefined;
        return cookie?.access_token ?? null;
      },
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  /**
   * O token é assinado pela API: confiar nele evita uma consulta ao banco em
   * TODA requisição (banco e API ficam em regiões diferentes, ~0,2 s cada).
   * Conta apagada: o GET /usuario responde 401 e a tela volta para o login.
   */
  validate(payload: JwtPayload) {
    if (!Number.isInteger(payload?.sub)) {
      throw new UnauthorizedException('Sessão inválida');
    }
    return { id: payload.sub };
  }
}
