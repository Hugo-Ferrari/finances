import { Response, CookieOptions } from 'express';
import { Body, Controller, Post, Res } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { Public } from 'src/common/decorators/public.decorator';

const isProd = process.env.NODE_ENV === 'production';

const cookieBase: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(dto);

    response.cookie('access_token', token, {
      ...cookieBase,
      maxAge: dto.lembrarDeMim ? 30 * 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000,
    });

    return { mensagem: 'Login realizado' };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', cookieBase);

    return { mensagem: 'Logout realizado' };
  }
}
