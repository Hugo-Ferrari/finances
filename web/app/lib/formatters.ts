/** Utilitário para formatar valores em BRL */
export function formatarMoeda(valor: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

/** Formata data para exibição no padrão brasileiro */
export function formatarData(data: string | Date): string {
  const d = typeof data === "string" ? new Date(`${data.slice(0, 10)}T00:00:00`) : data;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Capitaliza a primeira letra de uma string */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Trunca um texto em determinado número de caracteres */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}
