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
      <CabecalhoMinhasContas saldoTotal={saldoTotal} />

      {contas.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-muted">Nenhuma conta cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {contas.map((item) => (
            <BlocoConta key={item.id} conta={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListaContas;
