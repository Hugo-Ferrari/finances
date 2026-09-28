import { listarTodasTransacoes } from "@/app/services/transacao.service";
import { Transacao } from "@/app/types/transacao";
import { FiltrosTransacao } from "./BuscarTransacao";
import React, { useEffect, useState } from "react";
import CabecalhoTransacao from "./CabecalhoTransacao";
import TransacaoItem from "./TransacaoItem";

type Props = {
  filtros: FiltrosTransacao;
};

function ListaTransacao({ filtros }: Props) {
  const [transacao, setTransacao] = useState<Transacao[]>([]);

  useEffect(() => {
    async function carregarTodasAsTransacoes() {
      const dados = await listarTodasTransacoes();

      setTransacao(dados);
    }

    carregarTodasAsTransacoes();
  }, []);

  const transacoesFiltradas = transacao.filter((item) => {
    const textoBusca = filtros.busca.trim().toLocaleLowerCase();
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
        .some((texto) => texto!.toLocaleLowerCase().includes(textoBusca));

    return (
      correspondeBusca &&
      (!inicioPeriodo || data >= inicioPeriodo) &&
      (!fimPeriodo || data < fimPeriodo) &&
      (filtros.conta === null || item.conta.id === filtros.conta) &&
      (filtros.categoria === null ||
        item.categoria?.id === filtros.categoria) &&
      (!filtros.ativo || item.conta.ativa !== false)
    );
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-180">
        <CabecalhoTransacao />

        {transacoesFiltradas
          .slice()
          .reverse()
          .map((item) => (
            <TransacaoItem key={item.id} transacao={item} />
          ))}
      </div>
    </div>
  );
}

export default ListaTransacao;
