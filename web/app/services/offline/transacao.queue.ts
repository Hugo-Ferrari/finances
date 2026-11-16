import Dexie, { Table } from "dexie";
import axios from "axios";
import { CreateTransacao } from "@/app/types/transacao";
import { enviarTransacaoParaApi } from "../transacao.service";

export interface TransacaoPendente extends CreateTransacao {
  id?: number;
  usuarioId?: number;
}

class OfflineDatabase extends Dexie {
  transacoes!: Table<TransacaoPendente, number>;

  constructor() {
    super("finlogic-offline");

    this.version(1).stores({
      transacoes: "++id",
    });
  }
}

export const db = new OfflineDatabase();

let processando = false;

export async function adicionarNaFila(
  dados: CreateTransacao,
  usuarioId: number | undefined,
) {
  await db.transacoes.add({ ...dados, usuarioId });
}

export async function processarFila(usuarioId: number) {
  if (processando) return;
  processando = true;

  try {
    const transacoes = await db.transacoes.toArray();

    for (const transacao of transacoes) {
      const { id, usuarioId: dono, ...dados } = transacao;

      // Cada usuário só envia o que ele mesmo registrou neste aparelho.
      if (dono !== undefined && dono !== usuarioId) continue;

      try {
        await enviarTransacaoParaApi(dados);
        if (id !== undefined) await db.transacoes.delete(id);
      } catch (error) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        // 4xx: a API recusou (ex.: saldo insuficiente). Reenviar não resolve.
        if (status !== undefined && status >= 400 && status < 500) {
          console.warn("Transação offline recusada pela API:", dados, error);
          if (id !== undefined) await db.transacoes.delete(id);
          continue;
        }

        // Sem conexão ou servidor fora: tenta de novo na próxima sincronização.
        break;
      }
    }
  } finally {
    processando = false;
  }
}
