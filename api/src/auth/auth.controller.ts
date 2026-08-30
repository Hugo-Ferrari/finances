
import { Response } from 'express';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto,@Res({ passthrough: true }) response: Response,) {
    const token = await this.authService.login(dto);
    response.cookie('access_token', token, {
      httpOnly: true,
    });
    return {
      mensagem: 'Login realizado',
    };
  }
}
