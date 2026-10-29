export const TIPOS_TRANSACAO = ['ENTRADA', 'SAIDA'] as const;
export type TipoTransacao = (typeof TIPOS_TRANSACAO)[number];

export const TIPOS_ARQUIVO_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024;
