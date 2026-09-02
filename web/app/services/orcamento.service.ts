import api from "./api";

export async function listarOrcamento(){
    const response = await api.get('/orcamento')
    return response.data
}