import api from "./api";

type NovaConta = {
  nome: string;
  saldo: number;
  tipo: string;
};

export async function criarConta(dados: NovaConta) {
  const response = await api.post(`/conta`, dados);
  return response.data;
}

export async function listarConta() {
  const response = await api.get(`/conta`);
  return response.data;
}
