"use client";

import { RegistroDeComprovanteIA } from "@/app/services/IA.service";
import { listarCategoria } from "@/app/services/categoria.service";
import { RegistroDeComprovanteDTO } from "@/app/types/ia";
import { DespesaCategoria } from "@/app/types/categoria";
import React, { useState } from "react";
import ConfigurarTransacao from "./ConfigurarTransacao";
import SalvarTransacao from "./SalvarTransacao";
import { File, FileText } from "lucide-react";
import axios from "axios";

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
      setError("Imagem não encontrada");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await RegistroDeComprovanteIA(imagem);

      console.log("2. Resultado da IA:", response);

      setResultado(response);
      setDescricao(response.descricao);

      console.log("3. Buscando categorias...");

      const categorias: DespesaCategoria[] = await listarCategoria();

      console.log("4. Categorias:", categorias);

      const categoriaEncontrada = categorias.find(
        (categoria) =>
          categoria.nome?.trim().toLocaleUpperCase() ===
          response.categoria.trim().toLocaleUpperCase(),
      );

      if (categoriaEncontrada) {
        setCategoriaId(categoriaEncontrada.id);
      } else {
        setCategoriaId(undefined);

        setError(
          `A categoria "${response.categoria}" não foi encontrada nas categorias cadastradas.`,
        );
      }

      // A conta sempre precisa ser escolhida pelo usuário.
      setContaId(undefined);
    } catch (error) {
    console.error("Erro ao analisar comprovante:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 503) {
        setError(
          "A IA está temporariamente indisponível. Tente novamente em alguns segundos.",
        );
        return;
      }

      if (error.response?.status === 401) {
        setError("Sua sessão expirou. Faça login novamente.");
        return;
      }

      if (error.response?.status === 500) {
        setError("Não foi possível processar o comprovante.");
        return;
      }
    }

    setError("Erro ao analisar comprovante.");
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

    const tiposPermitidos = ["image/jpeg", "image/jpg", "application/pdf"];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setError("Formato inválido. Envie JPG, JPEG ou PDF.");
      return;
    }

    setImagem(arquivo);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#11152f]">
            Registrar com IA
          </h1>

          <p className="mt-2 text-gray-500">
            Envie seu comprovante e deixe o FinLogic identificar os dados
            automaticamente.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#11152f]">
              Selecionar comprovante
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Escolha uma imagem ou PDF do comprovante que deseja analisar.
            </p>
          </div>

          <label
            htmlFor="comprovante"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 transition hover:border-[#8b7cf6] hover:bg-[#eeeaff]"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeaff]">
              <span className="text-2xl">
                <FileText size={25} />{" "}
              </span>
            </div>

            <p className="font-medium text-[#11152f]">
              Clique para selecionar um comprovante
            </p>

            <p className="mt-1 text-sm text-gray-400">JPG, JPEG ou PDF</p>

            <input
              id="comprovante"
              type="file"
              accept=".jpg,.jpeg,.pdf,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {imagem && (
            <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-[#11152f]">
                Arquivo selecionado
              </p>

              <p className="mt-1 truncate text-sm text-gray-500">
                {imagem.name}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnaliseComprovante}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#11152f] px-5 py-3 font-semibold text-white transition hover:bg-[#1b2045] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analisando..." : "Analisar comprovante"}
          </button>
        </div>

        {resultado && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#11152f]">
                Resultado da análise
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Confira os dados identificados pela IA e configure sua
                transação.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Valor</p>

                <p className="mt-1 text-xl font-bold text-[#11152f]">
                  R$ {resultado.valor}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Data</p>

                <p className="mt-1 font-semibold text-[#11152f]">
                  {resultado.data}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Tipo</p>

                <p className="mt-1 font-semibold text-[#11152f]">
                  {resultado.tipoTransacao}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Categoria identificada</p>

                <p className="mt-1 font-semibold text-[#11152f]">
                  {resultado.categoria}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-semibold text-[#11152f]">
                Configurar transação
              </h3>

              <ConfigurarTransacao
                descricao={descricao}
                categoriaId={categoriaId}
                contaId={contaId}
                setDescricao={setDescricao}
                setCategoriaId={setCategoriaId}
                setContaId={setContaId}
              />

              <div className="mt-6 border-t border-gray-200 pt-6">
                <SalvarTransacao
                  tipoTransacao={resultado.tipoTransacao}
                  valor={resultado.valor}
                  data={new Date(resultado.data)}
                  descricao={descricao}
                  categoriaId={categoriaId}
                  contaId={contaId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultadoAnalise;
