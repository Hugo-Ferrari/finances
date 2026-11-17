"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Pencil, Percent, RefreshCw, Trash2 } from "lucide-react";

import Modal from "@/app/components/caixinha/Modal";
import { ModalEditar, ModalMovimento, ModalTaxa } from "@/app/components/caixinha/Modais";
import PrevisaoCaixinha from "@/app/components/caixinha/PrevisaoCaixinha";
import ExtratoCaixinha from "@/app/components/caixinha/ExtratoCaixinha";
import SkeletonCard from "@/app/components/ui/Skeleton";
import { buscarCaixinha, excluirCaixinha, removerMovimento } from "@/app/services/caixinha.service";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarData, formatarMoeda, paraDiaISO } from "@/app/lib/formatters";
import { rotuloTaxa } from "@/app/lib/financas";
import { Caixinha, MovimentoCaixinha, TipoMovimentoCaixinha } from "@/app/types/caixinha";

type Acao =
  | { tipo: "movimento"; movimento: TipoMovimentoCaixinha }
  | { tipo: "taxa" }
  | { tipo: "editar" }
  | { tipo: "excluir" }
  | { tipo: "desfazer"; movimento: MovimentoCaixinha };

function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [caixinha, setCaixinha] = useState<Caixinha | null>(null);
  const [erro, setErro] = useState("");
  const [acao, setAcao] = useState<Acao | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const hoje = paraDiaISO(new Date());

  useEffect(() => {
    buscarCaixinha(Number(id))
      .then(setCaixinha)
      .catch((e) => setErro(mensagemDeErro(e, "Não foi possível carregar a caixinha.")));
  }, [id]);

  const fechar = useCallback(() => {
    setAcao(null);
    setErroAcao("");
  }, []);

  const salvo = useCallback((c: Caixinha) => {
    setCaixinha(c);
    setAcao(null);
  }, []);

  async function confirmar() {
    if (!caixinha || !acao) return;
    setProcessando(true);
    setErroAcao("");
    try {
      if (acao.tipo === "excluir") {
        await excluirCaixinha(caixinha.id);
        router.replace("/caixinhas");
        return;
      }
      if (acao.tipo === "desfazer") salvo(await removerMovimento(caixinha.id, acao.movimento.id));
    } catch (e) {
      setErroAcao(mensagemDeErro(e, "Não foi possível concluir."));
    } finally {
      setProcessando(false);
    }
  }

  if (erro) {
    return (
      <div className="page-container">
        <div className="card p-6">
          <p className="text-sm text-expense">{erro}</p>
          <Link href="/caixinhas" className="btn btn-ghost mt-4 h-10">Voltar às caixinhas</Link>
        </div>
      </div>
    );
  }

  if (!caixinha) {
    return (
      <div className="page-container">
        <SkeletonCard altura={240} />
        <SkeletonCard altura={420} />
      </div>
    );
  }

  const colocado = caixinha.depositado - caixinha.retirado;
  const versao = `${caixinha.saldo}-${caixinha.movimentos.length}-${caixinha.taxas.length}-${caixinha.isentaIR}`;

  return (
    <div className="page-container animate-fade-in">
      <div>
        <Link href="/caixinhas" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} /> Caixinhas
        </Link>
        <div className="page-header">
          <div className="min-w-0">
            <p className="page-eyebrow">{caixinha.instituicao || "Caixinha"}</p>
            <h1 className="page-title truncate">{caixinha.nome}</h1>
            <p className="page-subtitle">
              Rende {rotuloTaxa(caixinha.taxaAtual)} · {caixinha.isentaIR ? "isenta de IR" : "com IR no resgate"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost h-10" onClick={() => setAcao({ tipo: "taxa" })}>
              <Percent size={15} /> Alterar taxa
            </button>
            <button type="button" className="btn btn-ghost h-10" onClick={() => setAcao({ tipo: "editar" })} aria-label="Editar caixinha">
              <Pencil size={15} />
            </button>
            <button type="button" className="btn btn-ghost h-10 text-expense" onClick={() => setAcao({ tipo: "excluir" })} aria-label="Excluir caixinha">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <section className="hero-card p-5 sm:p-8">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Saldo hoje</p>
            <p className="num mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatarMoeda(caixinha.saldo)}</p>
            <p className="num mt-2 text-sm text-white/70">
              {caixinha.isentaIR
                ? "Sem imposto de renda no resgate"
                : `Se resgatar hoje: ${formatarMoeda(caixinha.liquido)} (IR estimado ${formatarMoeda(caixinha.imposto)})`}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setAcao({ tipo: "movimento", movimento: "DEPOSITO" })} className="btn h-11 bg-secondary px-3 text-primary hover:brightness-95">
                <ArrowUpRight size={16} /> Guardar
              </button>
              <button type="button" onClick={() => setAcao({ tipo: "movimento", movimento: "RETIRADA" })} className="btn h-11 bg-white/10 px-3 text-white ring-1 ring-white/20 hover:bg-white/15">
                <ArrowDownLeft size={16} /> Retirar
              </button>
              <button type="button" onClick={() => setAcao({ tipo: "movimento", movimento: "AJUSTE" })} className="btn h-11 bg-white/10 px-3 text-white ring-1 ring-white/20 hover:bg-white/15">
                <RefreshCw size={15} /> Atualizar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { rotulo: "Rendeu este mês", valor: `+\u00a0${formatarMoeda(caixinha.rendimentoMes)}`, destaque: true },
              { rotulo: "Rende por dia", valor: `+\u00a0${formatarMoeda(caixinha.rendimentoDia)}`, destaque: true },
              { rotulo: "Já rendeu no total", valor: `+\u00a0${formatarMoeda(caixinha.rendimentoTotal)}`, destaque: true },
              { rotulo: "Você colocou", valor: formatarMoeda(colocado), destaque: false },
            ].map((s) => (
              <div key={s.rotulo} className="caixa-valor rounded-2xl bg-white/8 p-3 ring-1 ring-white/10 sm:p-4">
                <p className="text-xs text-white/60">{s.rotulo}</p>
                <p className={`num valor-ajustavel mt-1 font-bold [--valor-max:1.125rem] ${s.destaque ? "text-secondary" : ""}`}>{s.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PrevisaoCaixinha caixinhaId={caixinha.id} isenta={caixinha.isentaIR} versao={versao} />

      <ExtratoCaixinha caixinha={caixinha} hoje={hoje} onRemover={(m) => setAcao({ tipo: "desfazer", movimento: m })} />

      <p className="text-center text-xs text-muted">
        Valores estimados com a taxa informada (juros compostos diários, mês comercial de 30 dias). O banco
        pode ter pequenas diferenças; use “Atualizar” para igualar ao saldo real.
      </p>

      {acao?.tipo === "movimento" && <ModalMovimento caixinha={caixinha} tipo={acao.movimento} onFechar={fechar} onSalvo={salvo} />}
      {acao?.tipo === "taxa" && <ModalTaxa caixinha={caixinha} onFechar={fechar} onSalvo={salvo} />}
      {acao?.tipo === "editar" && <ModalEditar caixinha={caixinha} onFechar={fechar} onSalvo={salvo} />}
      {(acao?.tipo === "excluir" || acao?.tipo === "desfazer") && (
        <Modal
          titulo={acao.tipo === "excluir" ? "Excluir caixinha" : "Desfazer movimento"}
          descricao={
            acao.tipo === "excluir"
              ? "A caixinha e todo o histórico serão apagados. O dinheiro não volta para as contas: se quiser devolver, faça uma retirada antes."
              : `Desfazer ${acao.movimento.tipo === "DEPOSITO" ? "o depósito" : acao.movimento.tipo === "RETIRADA" ? "a retirada" : "a atualização"} de ${formatarMoeda(acao.movimento.valor)} em ${formatarData(acao.movimento.data)}?${acao.movimento.conta ? ` O valor volta para ${acao.movimento.conta.nome}.` : ""}`
          }
          onFechar={fechar}
          bloqueado={processando}
        >
          {erroAcao && <p className="mb-4 text-sm font-medium text-expense">{erroAcao}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-ghost h-10" onClick={fechar} disabled={processando}>Cancelar</button>
            <button type="button" className="btn btn-danger h-10" onClick={confirmar} disabled={processando}>
              {processando ? "Aguarde..." : acao.tipo === "excluir" ? "Excluir" : "Desfazer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Page;
