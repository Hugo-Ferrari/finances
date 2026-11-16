import { FiltrosTransacao } from "../components/transacoes/BuscarTransacao";
import { Transacao } from "../types/transacao";

// Busca sem diferenciar acento nem maiúscula ("saude" encontra "Saúde").
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

/** Aplica busca, período, conta, categoria e "somente contas ativas". */
export function filtrarTransacoes(
  transacoes: Transacao[],
  filtros: FiltrosTransacao,
): Transacao[] {
  return transacoes.filter((item) => {
    const textoBusca = normalizar(filtros.busca.trim());
    const data = new Date(`${item.data.slice(0, 10)}T00:00:00`);
    const agora = new Date();
    const inicioHoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );
    let inicioPeriodo: Date | null = null;
    let fimPeriodo: Date | null = null;

    if (filtros.periodo === "hoje") {
      inicioPeriodo = inicioHoje;
      fimPeriodo = new Date(inicioHoje);
      fimPeriodo.setDate(fimPeriodo.getDate() + 1);
    } else if (filtros.periodo === "semana") {
      inicioPeriodo = new Date(inicioHoje);
      inicioPeriodo.setDate(inicioHoje.getDate() - inicioHoje.getDay());
      fimPeriodo = new Date(inicioPeriodo);
      fimPeriodo.setDate(fimPeriodo.getDate() + 7);
    }
    if (filtros.periodo === "mes") {
      inicioPeriodo = new Date(agora.getFullYear(), agora.getMonth(), 1);
    }
    if (filtros.periodo === "ano") {
      inicioPeriodo = new Date(agora.getFullYear(), 0, 1);
    }

    const correspondeBusca =
      !textoBusca ||
      [item.descricao, item.conta.nome, item.categoria?.nome]
        .filter(Boolean)
        .some((texto) => normalizar(texto!).includes(textoBusca));

    return (
      correspondeBusca &&
      (!inicioPeriodo || data >= inicioPeriodo) &&
      (!fimPeriodo || data < fimPeriodo) &&
      (filtros.conta === null || item.conta.id === filtros.conta) &&
      (filtros.categoria === null ||
        item.categoria?.id === filtros.categoria) &&
      (!filtros.ativo || item.conta.ativa !== false)
    );
  });}
