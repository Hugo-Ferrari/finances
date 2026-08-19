import { Controller } from '@nestjs/common';
import { TransacaoService } from './transacao.service';

@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}
}
