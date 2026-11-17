"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/caixinha/Modal";
import { CaixaErro, CampoDinheiro, lerDinheiro, paraCampo, Rodape } from "./Campos";
import { listarConta } from "@/app/services/conta.service";
import { listarCategoria } from "@/app/services/categoria.service";
import { atualizarRecorrente, criarRecorrente } from "@/app/services/planejamento.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { paraDiaISO } from "@/app/lib/formatters";
import { formatarNomeCategoria } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";
import { Recorrente, TipoLancamento } from "@/app/types/planejamento";

type Categoria = { id: number; nome: string };

/** Próximo dia do mês a partir de hoje (padrão do primeiro vencimento). */
function proximoDia(): string {
  return paraDiaISO(new Date());
}

/** Cadastro e edição de conta fixa (salário, aluguel, assinatura...). */
export default function ModalRecorrente({
  recorrente,
  tipoInicial = "SAIDA",
  onFechar,
  onSalvo,
}: {
  recorrente?: Recorrente;
  tipoInicial?: TipoLancamento;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const editando = !!recorrente;
  const [tipo, setTipo] = useState<TipoLancamento>(recorrente?.tipoTransacao ?? tipoInicial);
  const [descricao, setDescricao] = useState(recorrente?.descricao ?? "");
  const [valor, setValor] = useState(recorrente ? paraCampo(recorrente.valor) : "");
  const [inicio, setInicio] = useState(recorrente?.inicio ?? proximoDia());
  const [contaId, setContaId] = useState(recorrente?.conta ? String(recorrente.conta.id) : "");
  const [categoriaId, setCategoriaId] = useState(recorrente?.categoria ? String(recorrente.categoria.id) : "");
  const [ehSalario, setEhSalario] = useState(recorrente?.ehSalario ?? false);
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarConta().then((l: Conta[]) => setContas(l.filter((c) => c.ativa))).catch(() => setContas([]));
    listarCategoria().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const v = lerDinheiro(valor);
    if (!descricao.trim()) return setErro("Dê um nome, ex.: Aluguel.");
    if (!(v > 0)) return setErro("Informe o valor.");
    setSalvando(true);
    const dados = {
      descricao: descricao.trim(),
      valor: v,
      tipoTransacao: tipo,
      inicio,
      contaId: contaId ? Number(contaId) : undefined,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      ehSalario: tipo === "ENTRADA" && ehSalario,
    };
    try {
      if (recorrente) await atualizarRecorrente(recorrente.id, dados);
      else await criarRecorrente(dados);
      onSalvo();
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível salvar."));
      setSalvando(false);
    }
  }

  const dia = Number(inicio.slice(8, 10));
  return (
    <Modal
      titulo={editando ? "Editar conta fixa" : "Nova conta fixa"}
      descricao="Algo que se repete todo mês. Você confirma quando pagar (ou receber) e o saldo é atualizado."
      onFechar={onFechar}
      bloqueado={salvando}
    >
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-dim p-1" role="radiogroup" aria-label="Tipo">
          {(["SAIDA", "ENTRADA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tipo === t}
              onClick={() => setTipo(t)}
              className={`h-10 rounded-xl text-sm font-bold transition ${tipo === t ? (t === "SAIDA" ? "bg-surface text-expense shadow-sm" : "bg-surface text-income shadow-sm") : "text-muted"}`}
            >
              {t === "SAIDA" ? "Conta a pagar" : "Dinheiro que entra"}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="rec-desc" className="form-label">Nome</label>
          <input id="rec-desc" className="form-input" maxLength={60} placeholder={tipo === "SAIDA" ? "Ex.: Aluguel, Internet, Academia" : "Ex.: Salário"} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoDinheiro id="rec-valor" rotulo="Valor por mês" valor={valor} onValor={setValor} />
          <div>
            <label htmlFor="rec-inicio" className="form-label">{editando ? "Primeiro vencimento" : "Próximo vencimento"}</label>
            <input id="rec-inicio" type="date" className="form-input" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
            {dia > 0 && <p className="mt-1.5 text-xs text-muted">Todo dia {dia}{dia > 28 ? " (ou o último dia do mês)" : ""}.</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rec-conta" className="form-label">Conta (opcional)</label>
            <select id="rec-conta" className="form-select" value={contaId} onChange={(e) => setContaId(e.target.value)}>
              <option value="">Escolher na hora</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="rec-cat" className="form-label">Categoria (opcional)</label>
            <select id="rec-cat" className="form-select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Sem categoria</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{formatarNomeCategoria(c.nome)}</option>)}
            </select>
          </div>
        </div>

        {tipo === "ENTRADA" && (
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-hover p-4">
            <input type="checkbox" className="mt-0.5" checked={ehSalario} onChange={(e) => setEhSalario(e.target.checked)} />
            <span>
              <span className="block text-sm font-semibold text-foreground">É o meu salário</span>
              <span className="text-xs text-muted">O &quot;pode gastar hoje&quot; divide o dinheiro até o dia em que ele cai.</span>
            </span>
          </label>
        )}

        <CaixaErro texto={erro} />
        <Rodape onCancelar={onFechar} salvando={salvando} rotulo={editando ? "Salvar" : "Cadastrar"} />
      </form>
    </Modal>
  );
}
