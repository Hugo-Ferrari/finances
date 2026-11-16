import { mensagemDeErro } from "@/app/lib/erros";
import { criarTransacao } from "@/app/services/transacao.service";
import { CreateTransacao } from "@/app/types/transacao";
import React, { useState } from "react";

interface SalvarTransacaoProps {
  tipoTransacao: "ENTRADA" | "SAIDA";
  valor: number;
  /** YYYY-MM-DD */
  data: string;
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

      const resultado = await criarTransacao(dados);

      setMensagem(
        resultado.offline
          ? "Sem conexão: a transação foi guardada e será enviada quando a internet voltar."
          : "Transação salva com sucesso!",
      );
    } catch (error) {
      setMensagem(mensagemDeErro(error, "Erro ao salvar transação."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary h-12 w-full"
      >
        {loading ? "Salvando..." : "Salvar transação"}
      </button>

      {mensagem && <p role="status" className="mt-3 text-sm font-medium text-muted">{mensagem}</p>}
    </div>
  );
}

export default SalvarTransacao;
