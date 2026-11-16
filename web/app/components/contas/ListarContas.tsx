"use client";

import { listarConta } from "@/app/services/conta.service";
import { Conta } from "@/app/types/conta";
import { useEffect, useState } from "react";

import CabecalhoMinhasContas from "./CabecalhoMinhasContas";
import BlocoConta from "./BlocoConta";

function ListaContas() {
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function carregarContas() {
      try {
        const dados = await listarConta();
        setContas(dados);
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
      }
    }

    carregarContas();

    window.addEventListener("conta-criada", carregarContas);
    return () => window.removeEventListener("conta-criada", carregarContas);
  }, []);

  const saldoTotal = contas.reduce(
    (total, conta) => total + Number(conta.saldo),
    0,
  );

  return (
    <div>
      <CabecalhoMinhasContas contas={contas} />

      {contas.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-semibold text-muted">Nenhuma conta cadastrada</p>
          <p className="mt-1 text-xs text-muted-light">Crie sua primeira conta para começar a acompanhar seu dinheiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {contas.map((item) => (
            <BlocoConta
              key={item.id}
              conta={item}
              patrimonio={saldoTotal}
              onContaExcluida={(id) =>
                setContas((contasAtuais) =>
                  contasAtuais.filter((conta) => conta.id !== id),
                )
              }
              onContaAtualizada={(contaAtualizada) =>
                setContas((contasAtuais) =>
                  contasAtuais.map((conta) =>
                    conta.id === contaAtualizada.id ? contaAtualizada : conta,
                  ),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaContas;
