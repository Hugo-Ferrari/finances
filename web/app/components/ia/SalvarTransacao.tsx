import { criarTransacao } from "@/app/services/transacao.service";
import { CreateTransacao } from "@/app/types/transacao";
import React, { useState } from "react";

interface SalvarTransacaoProps {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  data: Date;
  descricao: string;
  categoriaId?: number;
  contaId?: number;
}

function SalvarTransacao(props: SalvarTransacaoProps) {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit() {
    if (!props.contaId) {
      setMensagem("Selecione uma conta.");
      return;
    }

    if (!props.categoriaId) {
      setMensagem("Selecione uma categoria.");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      const dados: CreateTransacao = {
        tipoTransacao: props.tipoTransacao,
        valor: props.valor,
        data: props.data,
        descricao: props.descricao,
        contaId: props.contaId,
        categoriaId: props.categoriaId,
      };

      console.log("Dados enviados para criar transação:", dados);

      await criarTransacao(dados);

      setMensagem("Transação salva com sucesso!");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar transação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-[#11152f] px-5 py-3 font-semibold text-white transition hover:bg-[#1b2045] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar transação"}
      </button>

      {mensagem && <p className="mt-3 text-sm text-gray-600">{mensagem}</p>}
    </div>
  );
}

export default SalvarTransacao;
