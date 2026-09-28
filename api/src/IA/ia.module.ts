import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { ControllerIA } from './ia.controller';

@Module({
  controllers: [ControllerIA],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}
