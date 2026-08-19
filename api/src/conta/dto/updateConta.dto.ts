import { Tipo } from 'src/generated/prisma/enums';

export interface UpdateContaDto {
  nome?: string;
  tipo?: Tipo; // enuns
}
