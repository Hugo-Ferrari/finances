"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/caixinha/Modal";
import { CaixaErro, CampoDinheiro, lerDinheiro, paraCampo, Rodape } from "./Campos";
import { listarConta } from "@/app/services/conta.service";
import { pagarRecorrente } from "@/app/services/planejamento.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarMoeda, paraDiaISO } from "@/app/lib/formatters";
import { diaPorExtenso } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";

export type ItemPagar = {
  recorrenteId: number;
  descricao: string;
  valor: number;
  tipo: "ENTRADA" | "SAIDA";
  competencia: string;
  data: string;
  parcela: number | null;
  parcelasTotal: number | null;
  contaId?: number | null;
};

/** Confirma um mês de uma conta fixa: lança a transação na conta escolhida. */
export default function ModalPagar({
  item,
  onFechar,
  onPago,
}: {
  item: ItemPagar;
  onFechar: () => void;
  onPago: () => void;
}) {
  const entrada = item.tipo === "ENTRADA";
  const [valor, setValor] = useState(paraCampo(item.valor));
  const hoje = paraDiaISO(new Date());
  const [data, setData] = useState(item.data < hoje ? item.data : hoje);
  const [contas, setContas] = useState<Conta[]>([]);
  const [contaId, setContaId] = useState(item.contaId ? String(item.contaId) : "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarConta()
      .then((lista: Conta[]) => {
        const ativas = lista.filter((c) => c.ativa);
        setContas(ativas);
        // Sem conta cadastrada: sugere uma do dia a dia (corrente ou carteira), não a poupança.
        const sugerida = ativas.find((c) => c.tipo !== "POUPANCA") ?? ativas[0];
        setContaId((atual) => atual || (sugerida ? String(sugerida.id) : ""));
      })
      .catch(() => setContas([]));
  }, []);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const v = lerDinheiro(valor);
    if (!(v > 0)) return setErro("Informe o valor.");
    if (!contaId) return setErro("Escolha a conta.");
    setSalvando(true);
    try {
      await pagarRecorrente(item.recorrenteId, {
        competencia: item.competencia,
        valor: v,
        data,
        contaId: Number(contaId),
      });
      onPago();
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível confirmar."));
      setSalvando(false);
    }
  }

  const parcela = item.parcela ? ` – parcela ${item.parcela}/${item.parcelasTotal}` : "";
  return (
    <Modal
      titulo={entrada ? `Confirmar recebimento: ${item.descricao}` : `Marcar como paga: ${item.descricao}`}
      descricao={`Vencimento ${diaPorExtenso(item.data, { day: "2-digit", month: "long" })}${parcela}. Vira uma transação na conta escolhida.`}
      onFechar={onFechar}
      bloqueado={salvando}
    >
      <form onSubmit={confirmar} className="flex flex-col gap-4">
        <CampoDinheiro id="valor-pagar" rotulo={entrada ? "Valor recebido" : "Valor pago"} valor={valor} onValor={setValor} autoFocus />
        <div>
          <label htmlFor="data-pagar" className="form-label">{entrada ? "Recebido em" : "Pago em"}</label>
          <input id="data-pagar" type="date" className="form-input" value={data} max={hoje} onChange={(e) => setData(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="conta-pagar" className="form-label">{entrada ? "Entrou na conta" : "Saiu da conta"}</label>
          <select id="conta-pagar" className="form-select" value={contaId} onChange={(e) => setContaId(e.target.value)} required>
            {contas.length === 0 && <option value="">Nenhuma conta ativa</option>}
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({formatarMoeda(c.saldo)})
              </option>
            ))}
          </select>
        </div>
        <CaixaErro texto={erro} />
        <Rodape onCancelar={onFechar} salvando={salvando} rotulo={entrada ? "Confirmar" : "Marcar como paga"} />
      </form>
    </Modal>
  );
}
