import { CreateOrcamento } from "../types/orcamento";
import api from "./api";

export async function listarOrcamento(){
    const response = await api.get('/orcamento')
    return response.data
}

export async function criarOrcamento(dados:CreateOrcamento) {
    const response = await api.post('/orcamento', dados)
    return response.data
    
}