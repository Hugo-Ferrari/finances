"use client";

import { RegistroDeComprovanteIA } from "@/app/services/IA.service";
import { RegistroDeComprovanteDTO } from "@/app/types/ia";
import React, { useState } from "react";
import ConfigurarTransacao from "./ConfigurarTransacao";
import SalvarTransacao from "./SalvarTransacao";
import { CheckCircle2, File, FileText, Sparkles, Upload } from "lucide-react";
import PageHeader from "@/app/components/ui/PageHeader";
import { formatarNomeCategoria } from "@/app/lib/financas";
import { mensagemDeErro } from "@/app/lib/erros";
import { formatarData, formatarMoeda } from "@/app/lib/formatters";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function ResultadoAnalise() {
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [contaId, setContaId] = useState<number | undefined>(undefined);

  const [resultado, setResultado] = useState<RegistroDeComprovanteDTO | null>(
    null,
  );

  const [imagem, setImagem] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnaliseComprovante() {
    if (!imagem) {
      setError("Selecione um comprovante.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await RegistroDeComprovanteIA(imagem);

      setResultado(response);
      setDescricao(response.descricao);
      setCategoriaId(response.categoriaId ?? undefined);
      // A conta sempre precisa ser escolhida pelo usuário.
      setContaId(undefined);

      if (response.categoriaId === null) {
        setError(
          "Nenhuma das suas categorias combinou com o comprovante. Escolha uma abaixo.",
        );
      }
    } catch (error) {
      setError(mensagemDeErro(error, "Erro ao analisar comprovante."));
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(evento: React.ChangeEvent<HTMLInputElement>) {
    if (!evento.target.files || evento.target.files.length === 0) {
      setError("Arquivo não encontrado");
      return;
    }

    const arquivo = evento.target.files[0];

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setError("Formato inválido. Envie JPG, PNG, WEBP ou PDF.");
      return;
    }

    setImagem(arquivo);
    setError("");
  }

  function handleDrop(evento: React.DragEvent<HTMLLabelElement>) {
    evento.preventDefault();
    const arquivo = evento.dataTransfer.files?.[0];
    if (!arquivo) return;
    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setError("Formato inválido. Envie JPG, PNG, WEBP ou PDF.");
      return;
    }
    setImagem(arquivo);
    setError("");
  }

  const passos = [
    { icone: Upload, titulo: "Envie o comprovante", texto: "Foto da nota, cupom fiscal, Pix ou PDF." },
    { icone: Sparkles, titulo: "A IA lê os dados", texto: "Valor, data, descrição e a categoria mais provável." },
    { icone: CheckCircle2, titulo: "Confira e salve", texto: "Escolha a conta e registre em segundos." },
  ];

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Assistente"
        title="Ler comprovante com IA"
        subtitle="Envie um comprovante e registre a transação sem digitar nada."
      />

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-primary">Comprovante</h2>
          <p className="mt-0.5 text-sm text-muted">Imagem ou PDF de até 5 MB.</p>

          <label
            htmlFor="comprovante"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-hover px-6 py-10 text-center transition hover:border-accent hover:bg-accent-light/50"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-accent">
              {imagem ? <File size={24} /> : <FileText size={24} />}
            </span>
            <p className="font-semibold text-foreground">
              {imagem ? imagem.name : "Clique ou arraste o arquivo aqui"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {imagem ? "Clique para trocar o arquivo" : "JPG, PNG, WEBP ou PDF"}
            </p>
            <input
              id="comprovante"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleAnaliseComprovante}
            disabled={loading || !imagem}
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
        </section>

        <section className="lg:col-span-3">
          {!resultado ? (
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
              <h2 className="text-base font-bold text-primary">Resultado da análise</h2>
              <p className="mt-0.5 text-sm text-muted">Confira os dados identificados e complete a transação.</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-hover p-4">
                  <p className="text-xs text-muted">Valor</p>
                  <p className={`num mt-1 text-xl font-extrabold ${resultado.tipoTransacao === "ENTRADA" ? "text-income" : "text-foreground"}`}>
                    {formatarMoeda(resultado.valor)}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-hover p-4">
                  <p className="text-xs text-muted">Data</p>
                  <p className="mt-1 font-bold text-foreground">{formatarData(resultado.data)}</p>
                  {resultado.dataEstimada && (
                    <p className="text-[11px] text-warning">Não encontrada, usamos a de hoje</p>
                  )}
                </div>
                <div className="rounded-2xl bg-surface-hover p-4">
                  <p className="text-xs text-muted">Tipo</p>
                  <p className="mt-1 font-bold text-foreground">
                    {resultado.tipoTransacao === "ENTRADA" ? "Entrada" : "Saída"}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-hover p-4">
                  <p className="text-xs text-muted">Categoria sugerida</p>
                  <p className="mt-1 font-bold text-foreground">
                    {resultado.categoriaNome ? formatarNomeCategoria(resultado.categoriaNome) : "Nenhuma"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <ConfigurarTransacao
                  descricao={descricao}
                  categoriaId={categoriaId}
                  contaId={contaId}
                  setDescricao={setDescricao}
                  setCategoriaId={setCategoriaId}
                  setContaId={setContaId}
                />
                <div className="mt-6">
                  <SalvarTransacao
                    tipoTransacao={resultado.tipoTransacao}
                    valor={resultado.valor}
                    data={resultado.data}
                    descricao={descricao}
                    categoriaId={categoriaId}
                    contaId={contaId}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ResultadoAnalise;
