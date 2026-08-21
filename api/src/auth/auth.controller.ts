import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto:LoginDto){
    return this.authService.login(dto)
    
  }
}
