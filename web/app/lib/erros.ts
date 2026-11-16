import axios from "axios";

/** Extrai a mensagem enviada pela API (NestJS) ou devolve o texto padrão. */
export function mensagemDeErro(error: unknown, padrao: string): string {
  if (axios.isAxiosError(error)) {
    const mensagem = (error.response?.data as { message?: unknown } | undefined)
      ?.message;

    if (typeof mensagem === "string") return mensagem;
    if (Array.isArray(mensagem) && typeof mensagem[0] === "string") {
      return mensagem[0];
    }
  }

  return padrao;
}

/** Erro de rede sem resposta do servidor (sem internet, DNS, conexão recusada). */
export function ehFalhaDeConexao(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    !error.response &&
    error.code === "ERR_NETWORK"
  );
}
