"use client";

import { listarConta } from "@/app/services/conta.service";
import { Conta } from "@/app/types/conta";
import { formatarMoeda } from "@/app/lib/formatters";
import { Card, CardHeader } from "@/app/components/ui/Card";
import EmptyState from "@/app/components/ui/EmptyState";
import { ChevronRight, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


interface ContaItemProps {
  conta: Conta;
}

function ContaItem({ conta }: ContaItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-surface-hover">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
          <Wallet size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{conta.nome}</p>
          <p className="text-xs text-muted">{conta.tipo}</p>
        </div>
      </div>

      <div className="ml-3 flex flex-col items-end shrink-0">
        <p className="text-sm font-bold text-foreground">{formatarMoeda(conta.saldo)}</p>
        <span
          className={`mt-0.5 text-[11px] font-semibold ${
            conta.ativa ? "text-income" : "text-expense"
          }`}
        >
          {conta.ativa ? "Ativa" : "Inativa"}
        </span>
      </div>
    </div>
  );
}


function ContasSkeleton() {
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-8 w-8 rounded-xl" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
    </Card>
  );
}


function MinhasContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarConta() {
      try {
        const dados = await listarConta();
        setContas(dados);
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarConta();
  }, []);

  if (carregando) return <ContasSkeleton />;

  const saldoTotal = contas.reduce((acc, c) => acc + Number(c.saldo), 0);

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Minhas Contas"
        subtitle="Visão geral das suas contas"
        action={
          <Link
            href="/contas"
            aria-label="Ver todas as contas"
            className="btn btn-icon btn-primary"
          >
            <ChevronRight size={18} />
          </Link>
        }
      />

      <div className="mt-5 flex flex-col gap-3">
        {contas.length === 0 ? (
          <EmptyState
            icon={<Landmark size={22} />}
            title="Nenhuma conta cadastrada"
            description="Adicione uma conta para começar a acompanhar seu saldo."
          />
        ) : (
          contas.slice(0, 3).map((conta) => (
            <ContaItem key={conta.id} conta={conta} />
          ))
        )}
      </div>

      {contas.length > 0 && (
        <>
          <hr className="divider my-4" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Saldo consolidado</span>
            <p className="text-lg font-extrabold text-foreground">
              {formatarMoeda(saldoTotal)}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

export default MinhasContas;
