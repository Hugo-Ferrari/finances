
import { RegistroDeComprovanteDTO } from "../types/ia";
import api from "./api";

export async function RegistroDeComprovanteIA(arquivo: File): Promise<RegistroDeComprovanteDTO> {
    const formData = new FormData()

    formData.append('imagem', arquivo)

    try{
        const response = await api.post('/ia/comprovante', formData)
        return response.data
    }
    catch(erro){
        console.log("Erro ao enviar comprovante: ", erro )
        throw erro
    }
   
}