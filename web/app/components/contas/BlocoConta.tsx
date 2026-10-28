"use client";

import { Conta } from "@/app/types/conta";
import { formatarMoeda } from "@/app/lib/formatters";
import { ArrowUpRight, Wallet } from "lucide-react";
import Link from "next/link";

interface BlocoContaProps {
  conta: Conta;
}

function BlocoConta({ conta }: BlocoContaProps) {
  return (
    <article className="card p-5 transition-shadow hover:shadow-md">
      
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
            <Wallet size={20} className="text-primary" />
          </div>

          <div>
            <h2 className="font-bold text-foreground">{conta.nome}</h2>
            <p className="text-xs text-muted">{conta.tipo}</p>
          </div>
        </div>

        <span
          className={`badge ${
            conta.ativa ? "badge-income" : "badge-expense"
          }`}
        >
          {conta.ativa ? "Ativa" : "Inativa"}
        </span>
      </div>

     
      <div className="mt-6">
        <p className="text-xs text-muted">Saldo disponível</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
          {formatarMoeda(conta.saldo)}
        </p>
      </div>

     
      <div className="mt-5 border-t border-border pt-4">
        <Link
          href="/transacoes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          Ver transações
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default BlocoConta;