import { Conta } from "@/app/types/conta";
import { ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

type Props = {
  conta: Conta;
};

function BlocoConta({ conta }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet size={22} />
          </div>

          <div>
            <h2 className="font-semibold">
              {conta.nome}
            </h2>

            <p className="text-sm text-muted">
              {conta.tipo}
            </p>
          </div>
        </div>

        <span
          className={
            conta.ativa
              ? "text-xs font-medium text-income bg-income/10 px-2 py-1 rounded-full"
              : "text-xs font-medium text-expense bg-expense/10 px-2 py-1 rounded-full"
          }
        >
          {conta.ativa ? "Ativa" : "Inativa"}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted">
          Saldo disponível
        </p>

        <p className="text-2xl font-bold mt-1">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(conta.saldo))}
        </p>
      </div>

      <div className="border-t border-border mt-5 pt-4">
        <Link href={"/transacoes"}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition"
        >
          Ver transações
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default BlocoConta;