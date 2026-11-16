import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Usado por healthcheck e pelo ping que evita o servidor dormir. */
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
