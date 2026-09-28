import { IsNumber, IsOptional } from "class-validator";

export class CreateOrcamento {
  @IsNumber()
  valor!: number;

  @IsNumber()
  categoriaId!: number;
}

export class UpdateOrcamento {
  @IsOptional()
  @IsNumber()
  valor?: number;
}