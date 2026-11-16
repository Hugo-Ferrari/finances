import { mensagemDeErro } from "@/app/lib/erros";
import { lerValor } from "@/app/lib/financas";
import { criarTransacao } from "@/app/services/transacao.service";
import { CreateTransacao } from "@/app/types/transacao";
import React, { useState } from "react";
import { FormularioComprovante } from "./ConfigurarTransacao";

interface SalvarTransacaoProps {
  formulario: FormularioComprovante;
  /** Chamado depois de salvar (online ou na fila offline). */
  onSalvo?(): void;
}

function SalvarTransacao({ formulario, onSalvo }: SalvarTransacaoProps) {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  // Evita salvar a mesma transação duas vezes.
  const [salvo, setSalvo] = useState(false);

  async function handleSubmit() {
    const valor = lerValor(formulario.valor);
    const faltando =
      !Number.isFinite(valor) || valor <= 0
        ? "Informe um valor maior que zero."
        : !formulario.data
          ? "Informe a data."
          : !formulario.contaId
            ? "Selecione uma conta."
            : !formulario.categoriaId
              ? "Selecione uma categoria."
              : "";
    if (faltando) {
      setMensagem(faltando);
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      const dados: CreateTransacao = {
        tipoTransacao: formulario.tipoTransacao,
        valor: Math.round(valor * 100) / 100,
        data: formulario.data,
        descricao: formulario.descricao.trim(),
        contaId: formulario.contaId!,
        categoriaId: formulario.categoriaId!,
      };

      const resultado = await criarTransacao(dados);

      setMensagem(
        resultado.offline
          ? "Sem conexão: a transação foi guardada e será enviada quando a internet voltar."
          : "Transação salva com sucesso!",
      );
      setSalvo(true);
      onSalvo?.();
    } catch (error) {
      setMensagem(mensagemDeErro(error, "Erro ao salvar transação."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || salvo}
        className="btn btn-primary h-12 w-full"
      >
        {loading ? "Salvando..." : salvo ? "Transação salva" : "Salvar transação"}
      </button>

      {mensagem && (
        <p role="status" className="mt-3 text-sm font-medium text-muted">
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default SalvarTransacao;
