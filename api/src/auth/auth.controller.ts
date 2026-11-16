import { Request, Response, CookieOptions } from 'express';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerPorContaGuard } from 'src/common/guards/throttler-por-conta.guard';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { Public } from 'src/common/decorators/public.decorator';

// secure segue o protocolo real da requisição (HTTPS no Render, atrás de
// proxy com trust proxy; HTTP só no ambiente local).
const cookieBase = (request: Request): CookieOptions => ({
  httpOnly: true,
  secure: request.secure,
  sameSite: 'lax',
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerPorContaGuard)
  @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(dto);

    response.cookie('access_token', token, {
      ...cookieBase(request),
      maxAge: dto.lembrarDeMim ? 30 * 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000,
    });

    return { mensagem: 'Login realizado' };
  }

  @Public()
  @Post('logout')
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('access_token', cookieBase(request));

    return { mensagem: 'Logout realizado' };
  }
}
