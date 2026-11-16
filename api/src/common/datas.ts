import { BadRequestException } from '@nestjs/common';

/**
 * Convenção de datas das transações: o que importa é o DIA escolhido pelo
 * usuário, guardado como meia-noite UTC daquele dia (YYYY-MM-DDT00:00:00Z).
 * Assim o filtro por dia não depende do fuso do servidor (Render = UTC) nem
 * do navegador (Brasil = UTC-3).
 */
const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarDia(dia: string, campo: string) {
  if (!SO_DATA.test(dia) || Number.isNaN(Date.parse(dia))) {
    throw new BadRequestException(`${campo} deve estar no formato AAAA-MM-DD`);
  }
}

export function inicioDoDia(dia: string, campo = 'inicio'): Date {
  validarDia(dia, campo);
  return new Date(`${dia}T00:00:00.000Z`);
}

export function fimDoDia(dia: string, campo = 'fim'): Date {
  validarDia(dia, campo);
  return new Date(`${dia}T23:59:59.999Z`);
}

/** Dia de hoje no Brasil, no formato AAAA-MM-DD. */
export function hojeNoBrasil(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

/** Converte a data recebida da tela para a convenção acima. */
export function dataDaTransacao(data?: string): Date {
  if (!data) return inicioDoDia(hojeNoBrasil(), 'data');
  if (SO_DATA.test(data)) return inicioDoDia(data, 'data');
  // ISO completo (versões antigas do front enviavam o dia à meia-noite UTC).
  return new Date(data);
}
