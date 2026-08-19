import { Controller } from '@nestjs/common';
import { ContaService } from './conta.service';

@Controller('conta')
export class ContaController {
  constructor(private readonly contaService: ContaService) {}
}
