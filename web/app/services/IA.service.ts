
import { RegistroDeComprovanteDTO } from "../types/ia";
import api from "./api";

export async function RegistroDeComprovanteIA(arquivo: File): Promise<RegistroDeComprovanteDTO> {
    const formData = new FormData()

    formData.append('imagem', arquivo)

    const response = await api.post('/ia/comprovante', formData)
    return response.data
   
}