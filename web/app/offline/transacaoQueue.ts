
import { CreateTransacao } from "../types/transacao";


const DB_NAME = "finclogic-offline";
const STORE_NAME = "transacoes-pendentes";
const DB_VERSION = 1;

export interface TransacoesPendente {
  id: string;
  dados: CreateTransacao;
  criadaEm: string;
}

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };
  });
}

export async function adicionarTransacaoPendente(dados: CreateTransacao,): Promise<void> {
    const db = await abrirBanco();
    const transacao = db.transaction(STORE_NAME, "readwrite");
    const store = transacao.objectStore(STORE_NAME);
    const pendente: TransacoesPendente = {
      id: crypto.randomUUID(),
      dados,
      criadaEm: new Date().toISOString(),
    };
    store.add(pendente);
    return new Promise((resolve, reject) => {
      transacao.oncomplete = () => resolve();
      transacao.onerror = () => reject(transacao.error);
    });
}

export async function listarTransacoesPendentes(): Promise<TransacoesPendente[]> {
    const db = await abrirBanco();
    const transacao = db.transaction(STORE_NAME, "readonly");
    const store = transacao.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
}

export async function removerTransacaoPendente(id: string): Promise<void> {
    const db = await abrirBanco();
    const transacao = db.transaction(STORE_NAME, "readwrite");
    const store = transacao.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      transacao.oncomplete = () => resolve();
      transacao.onerror = () => reject(transacao.error);
    });
}
