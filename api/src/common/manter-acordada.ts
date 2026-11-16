/**
 * Mantém a API acordada no Render gratuito.
 *
 * O Render desliga o serviço depois de 15 min sem receber requisições e leva
 * ~1 min para religar (era a demora para entrar no app). A API chama o
 * próprio /health pelo endereço PÚBLICO a cada 9 min: a chamada entra pela
 * borda do Render como um acesso de fora e conta como atividade.
 *
 * Só liga no Render: RENDER_EXTERNAL_URL é preenchida pelo próprio Render
 * (não precisa configurar nada). Fora dele (máquina local, testes) não faz nada.
 * O /health não consulta o banco, então o Neon continua podendo descansar.
 */
export const INTERVALO_MANTER_ACORDADA_MS = 9 * 60_000;

export function manterAcordada(
  urlPublica: string | undefined = process.env.RENDER_EXTERNAL_URL,
  intervaloMs = INTERVALO_MANTER_ACORDADA_MS,
  chamar: (url: string) => Promise<unknown> = (url) =>
    fetch(url, { signal: AbortSignal.timeout(30_000) }),
): NodeJS.Timeout | null {
  if (!urlPublica) return null;
  const alvo = `${urlPublica.replace(/\/+$/, '')}/health`;
  const timer = setInterval(() => {
    // Falhar uma vez não é problema: a próxima chamada tenta de novo.
    chamar(alvo).catch(() => undefined);
  }, intervaloMs);
  // Não segura o processo vivo no desligamento (deploy/restart).
  timer.unref();
  return timer;
}
