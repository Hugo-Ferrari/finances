import { CreateCategoria } from "../types/categoria";
import api from "./api";

export async function listarCategoria() {
    const response = await api.get('/categoria')
    return response.data
    
}

export async function criarCategoria(dados: CreateCategoria) {
    const response = await api.post("/categoria", dados)
    return response.data
    
}

export async function deletarCategoria(id: number) {
    const response = await api.delete(`/categoria/${id}`)
    return response.data
    
}