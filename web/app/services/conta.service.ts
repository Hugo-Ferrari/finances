import api from "./api";

export async function listarConta() {
    const response = await api.get(`/conta`)
    return response.data
}