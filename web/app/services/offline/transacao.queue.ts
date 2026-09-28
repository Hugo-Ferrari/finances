import Dexie, { Table } from "dexie";
import { CreateTransacao } from "@/app/types/transacao";
import { enviarTransacaoParaApi } from "../transacao.service";

export interface TransacaoPendente extends CreateTransacao {
  id?: number;
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

export async function adicionarNaFila(
  dados: CreateTransacao
) {
  await db.transacoes.add(dados);
}

export async function processarFila() {
  const transacoes = await db.transacoes.toArray();

  for (const transacao of transacoes) {
    try {
      const { id, ...dados } = transacao;

      await enviarTransacaoParaApi(dados);

      if (id !== undefined) {
        await db.transacoes.delete(id);
      }
    } catch (error) {
      console.error(
        "Erro ao enviar transação offline:",
        error
      );
    }
  }
}