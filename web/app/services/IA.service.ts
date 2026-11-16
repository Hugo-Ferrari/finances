import { RegistroDeComprovanteDTO } from "../types/ia";
import api from "./api";

/**
 * A API pode precisar acordar (Render) e tentar a IA até 3 vezes,
 * então esta chamada tem um tempo limite maior que o das outras gravações.
 */
const TIMEOUT_ANALISE_MS = 150_000;

export async function RegistroDeComprovanteIA(
  arquivo: File,
): Promise<RegistroDeComprovanteDTO> {
  const formData = new FormData();
  formData.append("imagem", arquivo);

  const response = await api.post<RegistroDeComprovanteDTO>(
    "/ia/comprovante",
    formData,
    { timeout: TIMEOUT_ANALISE_MS },
  );
  return response.data;
}
