"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import CampoTaxa from "./CampoTaxa";
import { listarConta } from "@/app/services/conta.service";
import { alterarTaxa, atualizarCaixinha, registrarMovimento } from "@/app/services/caixinha.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarMoeda, paraDiaISO } from "@/app/lib/formatters";
import { lerValor, rotuloTaxa } from "@/app/lib/financas";
import { Conta } from "@/app/types/conta";
import { Caixinha, PeriodoTaxa, TipoMovimentoCaixinha } from "@/app/types/caixinha";

function Erro({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <div role="alert" className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
      {texto}
    </div>
  );
}

function Rodape({ onCancelar, salvando, rotulo }: { onCancelar: () => void; salvando: boolean; rotulo: string }) {
  return (
    <div className="mt-2 flex justify-end gap-3">
      <button type="button" className="btn btn-ghost h-10" onClick={onCancelar} disabled={salvando}>
        Cancelar
      </button>
      <button type="submit" className="btn btn-primary h-10" disabled={salvando}>
        {salvando ? "Salvando..." : rotulo}
      </button>
    </div>
  );
}

function CampoValor({ id, valor, onValor, rotulo }: { id: string; valor: string; onValor: (v: string) => void; rotulo: string }) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{rotulo}</label>
      <div className="flex items-center rounded-[var(--radius-lg)] border border-border bg-background pl-4 focus-within:border-[var(--border-focus)]">
        <span className="text-sm font-bold text-muted">R$</span>
        <input id={id} inputMode="decimal" autoFocus placeholder="0,00" className="h-11 w-full bg-transparent px-3 text-sm outline-none focus-visible:outline-none" value={valor} onChange={(e) => onValor(e.target.value)} required />
      </div>
    </div>
  );
}

const TEXTOS: Record<TipoMovimentoCaixinha, { titulo: string; descricao: string; valor: string; botao: string }> = {
  DEPOSITO: { titulo: "Guardar dinheiro", descricao: "Coloque mais dinheiro na caixinha.", valor: "Quanto vai guardar", botao: "Guardar" },
  RETIRADA: { titulo: "Retirar dinheiro", descricao: "Tire dinheiro da caixinha.", valor: "Quanto vai retirar", botao: "Retirar" },
  AJUSTE: {
    titulo: "Atualizar saldo",
    descricao: "Digite o saldo que aparece no app do banco. O cálculo continua a partir dele.",
    valor: "Saldo no banco",
    botao: "Atualizar",
  },
};

interface ModalMovimentoProps {
  caixinha: Caixinha;
  tipo: TipoMovimentoCaixinha;
  onFechar: () => void;
  onSalvo: (c: Caixinha) => void;
}

export function ModalMovimento({ caixinha, tipo, onFechar, onSalvo }: ModalMovimentoProps) {
  const textos = TEXTOS[tipo];
  const [valor, setValor] = useState(tipo === "AJUSTE" ? String(caixinha.saldo).replace(".", ",") : "");
  const [data, setData] = useState(paraDiaISO(new Date()));
  const [contaId, setContaId] = useState("");
  const [contas, setContas] = useState<Conta[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (tipo === "AJUSTE") return;
    listarConta()
      .then((lista: Conta[]) => setContas(lista.filter((c) => c.ativa)))
      .catch(() => setContas([]));
  }, [tipo]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const numero = lerValor(valor);
    if (!Number.isFinite(numero) || numero < 0 || (tipo !== "AJUSTE" && numero === 0)) {
      return setErro("Informe um valor válido.");
    }
    setSalvando(true);
    setErro("");
    try {
      onSalvo(
        await registrarMovimento(caixinha.id, {
          tipo,
          valor: Math.round(numero * 100) / 100,
          data,
          contaId: contaId ? Number(contaId) : undefined,
        }),
      );
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível salvar."));
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={textos.titulo} descricao={textos.descricao} onFechar={onFechar} bloqueado={salvando}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <CampoValor id="valor-movimento" rotulo={textos.valor} valor={valor} onValor={setValor} />
        {tipo === "RETIRADA" && (
          <p className="num -mt-2 text-xs text-muted">Disponível: {formatarMoeda(caixinha.saldo)}</p>
        )}
        <div>
          <label htmlFor="data-movimento" className="form-label">Data</label>
          <input id="data-movimento" type="date" className="form-input" value={data} max={paraDiaISO(new Date())} onChange={(e) => setData(e.target.value)} required />
        </div>
        {tipo !== "AJUSTE" && (
          <div>
            <label htmlFor="conta-movimento" className="form-label">
              {tipo === "DEPOSITO" ? "Saiu de alguma conta?" : "Vai para alguma conta?"}
            </label>
            <select id="conta-movimento" className="form-select" value={contaId} onChange={(e) => setContaId(e.target.value)}>
              <option value="">Não</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({formatarMoeda(c.saldo)})
                </option>
              ))}
            </select>
          </div>
        )}
        <Erro texto={erro} />
        <Rodape onCancelar={onFechar} salvando={salvando} rotulo={textos.botao} />
      </form>
    </Modal>
  );
}

export function ModalTaxa({ caixinha, onFechar, onSalvo }: Omit<ModalMovimentoProps, "tipo">) {
  const atual = caixinha.taxaAtual;
  const [taxa, setTaxa] = useState(atual ? String(atual.taxa).replace(".", ",") : "");
  const [periodo, setPeriodo] = useState<PeriodoTaxa>(atual?.periodo ?? "MENSAL");
  const [inicio, setInicio] = useState(paraDiaISO(new Date()));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const numero = lerValor(taxa);
    if (!Number.isFinite(numero) || numero < 0) return setErro("Informe uma taxa válida.");
    setSalvando(true);
    setErro("");
    try {
      onSalvo(await alterarTaxa(caixinha.id, { taxa: numero, periodo, inicio }));
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível alterar a taxa."));
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Alterar rendimento" descricao="A nova taxa vale a partir da data escolhida. O que já rendeu não muda." onFechar={onFechar} bloqueado={salvando}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nova-taxa" className="form-label">Quanto rende agora</label>
          <CampoTaxa id="nova-taxa" taxa={taxa} periodo={periodo} onTaxa={setTaxa} onPeriodo={setPeriodo} />
        </div>
        <div>
          <label htmlFor="inicio-taxa" className="form-label">A partir de</label>
          <input id="inicio-taxa" type="date" className="form-input" value={inicio} min={caixinha.taxas[0]?.inicio} max={paraDiaISO(new Date())} onChange={(e) => setInicio(e.target.value)} required />
        </div>
        {caixinha.taxas.length > 0 && (
          <div className="rounded-2xl bg-surface-hover p-4">
            <p className="text-xs font-semibold text-muted">Histórico</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {[...caixinha.taxas].reverse().map((t) => (
                <li key={t.id} className="flex justify-between gap-3">
                  <span className="text-foreground">{rotuloTaxa(t)}</span>
                  <span className="text-muted">desde {t.inicio.split("-").reverse().join("/")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Erro texto={erro} />
        <Rodape onCancelar={onFechar} salvando={salvando} rotulo="Salvar taxa" />
      </form>
    </Modal>
  );
}

export function ModalEditar({ caixinha, onFechar, onSalvo }: Omit<ModalMovimentoProps, "tipo">) {
  const [nome, setNome] = useState(caixinha.nome);
  const [instituicao, setInstituicao] = useState(caixinha.instituicao ?? "");
  const [isenta, setIsenta] = useState(caixinha.isentaIR);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro("Dê um nome para a caixinha.");
    setSalvando(true);
    setErro("");
    try {
      onSalvo(await atualizarCaixinha(caixinha.id, { nome: nome.trim(), instituicao: instituicao.trim(), isentaIR: isenta }));
    } catch (error) {
      setErro(mensagemDeErro(error, "Não foi possível salvar."));
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Editar caixinha" onFechar={onFechar} bloqueado={salvando}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <div>
          <label htmlFor="editar-nome" className="form-label">Nome</label>
          <input id="editar-nome" className="form-input" value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="editar-instituicao" className="form-label">Banco ou corretora</label>
          <input id="editar-instituicao" className="form-input" value={instituicao} maxLength={40} onChange={(e) => setInstituicao(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={isenta} onChange={(e) => setIsenta(e.target.checked)} />
          Isenta de imposto de renda
        </label>
        <Erro texto={erro} />
        <Rodape onCancelar={onFechar} salvando={salvando} rotulo="Salvar" />
      </form>
    </Modal>
  );
}
