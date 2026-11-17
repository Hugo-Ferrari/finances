"use client";

import { RegistroDeComprovanteIA } from "@/app/services/IA.service";
import { OrigemLeitura } from "@/app/types/ia";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ConfigurarTransacao, { FormularioComprovante } from "./ConfigurarTransacao";
import SalvarTransacao from "./SalvarTransacao";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  File,
  FileText,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import PageHeader from "@/app/components/ui/PageHeader";
import Link from "next/link";
import { mensagemDeErro } from "@/app/lib/erros";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Como os dados chegaram ao formulário. `manual`: nada foi lido. */
type Modo = OrigemLeitura | "manual";

function hoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

const formularioVazio = (): FormularioComprovante => ({
  tipoTransacao: "SAIDA",
  valor: "",
  data: hoje(),
  descricao: "",
});

/** Erros do próprio arquivo (formato, tamanho): não adianta abrir o formulário. */
function erroDoArquivo(error: unknown): boolean {
  return axios.isAxiosError(error) && [400, 413].includes(error.response?.status ?? 0);
}

const CABECALHO: Record<Modo, { titulo: string; texto: string }> = {
  leitura: {
    titulo: "Lido direto do PDF",
    texto: "Os dados vieram do próprio comprovante, sem IA. Confira e complete a transação.",
  },
  ia: {
    titulo: "Lido pela IA",
    texto: "Confira os dados identificados e complete a transação.",
  },
  "leitura-parcial": {
    titulo: "Leitura parcial",
    texto: "A IA não respondeu agora. Preenchemos o que deu para ler do PDF; confira com atenção.",
  },
  manual: {
    titulo: "Preencha os dados",
    texto: "Não conseguimos ler o comprovante agora. Preencha os campos olhando o arquivo ao lado.",
  },
};

function ResultadoAnalise() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);

  const [modo, setModo] = useState<Modo | null>(null);
  const [formulario, setFormulario] = useState<FormularioComprovante>(formularioVazio);
  const [dataEstimada, setDataEstimada] = useState(false);
  // Muda a cada análise, para o botão de salvar voltar ao estado inicial.
  const [analise, setAnalise] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Endereço local (blob:) do arquivo para a prévia; liberado ao trocar e ao sair.
  const previaAtual = useRef<string | null>(null);
  function trocarPrevia(novo: File | null) {
    if (previaAtual.current) URL.revokeObjectURL(previaAtual.current);
    previaAtual.current = novo ? URL.createObjectURL(novo) : null;
    setPrevia(previaAtual.current);
  }
  useEffect(
    () => () => {
      if (previaAtual.current) URL.revokeObjectURL(previaAtual.current);
    },
    [],
  );

  function alterar<K extends keyof FormularioComprovante>(
    campo: K,
    valor: FormularioComprovante[K],
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleAnaliseComprovante() {
    if (!arquivo) {
      setError("Selecione um comprovante.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await RegistroDeComprovanteIA(arquivo);

      setFormulario({
        tipoTransacao: response.tipoTransacao,
        valor: response.valor.toFixed(2).replace(".", ","),
        data: response.data,
        descricao: response.descricao,
        categoriaId: response.categoriaId ?? undefined,
        // A conta sempre precisa ser escolhida pelo usuário.
        contaId: undefined,
      });
      setDataEstimada(response.dataEstimada);
      setModo(response.origem);

      if (response.categoriaId === null) {
        setError("Nenhuma das suas categorias combinou com o comprovante. Escolha uma abaixo.");
      }
    } catch (error) {
      const mensagem = mensagemDeErro(error, "Não foi possível analisar o comprovante.");
      if (erroDoArquivo(error)) {
        setError(mensagem);
        return;
      }
      // IA fora do ar, limite atingido ou sem conexão: o usuário preenche à mão.
      setError(mensagem);
      setFormulario(formularioVazio());
      setDataEstimada(false);
      setModo("manual");
    } finally {
      setAnalise((n) => n + 1);
      setLoading(false);
    }
  }

  function selecionar(novo: File | undefined) {
    if (!novo) {
      setError("Arquivo não encontrado");
      return;
    }
    if (!TIPOS_PERMITIDOS.includes(novo.type)) {
      setError("Formato inválido. Envie JPG, PNG, WEBP ou PDF.");
      return;
    }
    setArquivo(novo);
    trocarPrevia(novo);
    setModo(null);
    setError("");
  }

  function recomecar() {
    setArquivo(null);
    trocarPrevia(null);
    setModo(null);
    setError("");
    setFormulario(formularioVazio());
  }

  const passos = [
    { icone: Upload, titulo: "Envie o comprovante", texto: "Foto da nota, cupom fiscal, Pix ou PDF." },
    { icone: Sparkles, titulo: "Lemos os dados", texto: "PDF de banco é lido na hora; fotos passam pela IA." },
    { icone: CheckCircle2, titulo: "Confira e salve", texto: "Escolha a conta e registre em segundos." },
  ];

  const pdf = arquivo?.type === "application/pdf";
  const cabecalho = modo ? CABECALHO[modo] : null;
  const alerta = modo === "manual" || modo === "leitura-parcial";

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Assistente"
        title="Ler comprovante"
        subtitle="Envie um comprovante e registre a transação sem digitar nada."
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-primary">Comprovante</h2>
          <p className="mt-0.5 text-sm text-muted">Imagem ou PDF de até 5 MB.</p>

          <label
            htmlFor="comprovante"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) selecionar(e.dataTransfer.files[0]);
            }}
            className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-hover px-6 py-8 text-center transition hover:border-accent hover:bg-accent-light/50"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-accent">
              {arquivo ? <File size={24} /> : <FileText size={24} />}
            </span>
            <p className="font-semibold text-foreground [overflow-wrap:anywhere]">
              {arquivo ? arquivo.name : "Clique ou arraste o arquivo aqui"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {arquivo ? "Clique para trocar o arquivo" : "JPG, PNG, WEBP ou PDF"}
            </p>
            <input
              id="comprovante"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                selecionar(e.target.files?.[0]);
                e.target.value = "";
              }}
              className="hidden"
            />
          </label>

          {arquivo && previa && (
            <div className="mt-4">
              {pdf ? (
                <>
                  <object
                    data={previa}
                    type="application/pdf"
                    aria-label="Prévia do comprovante"
                    className="hidden h-80 w-full rounded-xl border border-border lg:block"
                  />
                  <a
                    href={previa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    <ExternalLink size={15} /> Abrir o PDF
                  </a>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:), sem otimização possível
                <img
                  src={previa}
                  alt="Prévia do comprovante"
                  className="max-h-80 w-full rounded-xl border border-border bg-surface-hover object-contain"
                />
              )}
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
              {error}
            </div>
          )}

          <p className="mt-4 flex gap-2 rounded-xl border border-border bg-surface-hover px-3 py-2.5 text-xs leading-5 text-muted">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Fotos e PDFs escaneados são enviados ao Google Gemini para leitura. Na versão gratuita,
              o Google pode usar o conteúdo para melhorar a IA dele. Não envie documentos com dados
              que você não quer compartilhar.{" "}
              <Link href="/privacidade" className="font-semibold text-primary hover:underline">
                Saiba mais
              </Link>
            </span>
          </p>

          <button
            type="button"
            onClick={handleAnaliseComprovante}
            disabled={loading || !arquivo}
            className="btn btn-primary mt-5 h-12 w-full"
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Analisando...
              </>
            ) : (
              <>
                <Sparkles size={17} /> Analisar comprovante
              </>
            )}
          </button>
          {loading && (
            <p className="mt-2 text-center text-xs text-muted">
              Pode levar até 1 minuto se o servidor estiver acordando.
            </p>
          )}
        </section>

        <section className="lg:col-span-3">
          {!modo || !cabecalho ? (
            <div className="card p-6">
              <h2 className="text-base font-bold text-primary">Como funciona</h2>
              <ol className="mt-5 flex flex-col gap-5">
                {passos.map(({ icone: Icone, titulo, texto }, i) => (
                  <li key={titulo} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
                      <Icone size={20} />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {i + 1}. {titulo}
                      </p>
                      <p className="text-sm text-muted">{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="card p-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-primary">Transação</h2>
                <span className={`chip ${alerta ? "bg-warning-light text-warning" : "bg-accent-light text-accent"}`}>
                  {alerta ? <AlertTriangle size={13} /> : modo === "ia" ? <Sparkles size={13} /> : <FileText size={13} />}
                  {cabecalho.titulo}
                </span>
              </div>
              <p className={`mt-2 text-sm ${alerta ? "rounded-xl bg-warning-light px-3 py-2 font-medium text-warning" : "text-muted"}`}>
                {cabecalho.texto}
              </p>

              <div className="mt-6">
                <ConfigurarTransacao
                  formulario={formulario}
                  alterar={alterar}
                  dataEstimada={dataEstimada}
                />
                <div className="mt-6">
                  <SalvarTransacao key={analise} formulario={formulario} />
                </div>
                <button
                  type="button"
                  onClick={recomecar}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
                >
                  <RotateCcw size={15} /> Ler outro comprovante
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResultadoAnalise;
