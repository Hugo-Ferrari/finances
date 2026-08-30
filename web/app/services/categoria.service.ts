import api from "./api";

export async function listarCategoria() {
    const response = await api.get('/categoria')
    return response.data
    
}