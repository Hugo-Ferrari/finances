import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioRepository } from 'src/usuario/usuario.repository';
import type { Request } from 'express';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly repository: UsuarioRepository) {
    super({
      jwtFromRequest: (request: Request) => {
        const cookie = request.cookies as Record<string, string> | undefined;
        return cookie?.access_token ?? null;
      },
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.repository.buscarPorId(payload.sub);

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
    };
  }
}
