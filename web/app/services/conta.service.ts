import { Ysabeau } from "next/font/google";
import api from "./api";
import { Conta } from "../types/conta";

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

export async function excluirConta(id: number) {
  const response = await api.delete(`/conta/${id}`);
  return response.data;
}

export async function update(id: number, dados: Conta) {
  const response = await api.patch(`/conta/${id}`, dados);
  return response.data;
}
