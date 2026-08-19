import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioRepository } from 'src/usuario/usuario.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly repository: UsuarioRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!
,
    });
  }
  async validate(payload: any) {
    const usuario = await this.repository.buscarPorId(payload.sub);
    if (!usuario) throw new UnauthorizedException('Usuario não encontrado');
    return {
      id: usuario.id,
      email: usuario.email,
    };
  }
}
