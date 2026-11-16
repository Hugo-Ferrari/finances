"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, PiggyBank, Plus, Sparkles, TrendingUp } from "lucide-react";

import PageHeader from "@/app/components/ui/PageHeader";
import SkeletonCard from "@/app/components/ui/Skeleton";
import CardCaixinha from "@/app/components/caixinha/CardCaixinha";
import { listarCaixinhas } from "@/app/services/caixinha.service";
import { formatarMoeda } from "@/app/lib/formatters";
import { ResumoCaixinha } from "@/app/types/caixinha";

function Page() {
  const [caixinhas, setCaixinhas] = useState<ResumoCaixinha[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    listarCaixinhas().then(setCaixinhas).catch(() => setErro(true));
  }, []);

  const soma = (campo: keyof Pick<ResumoCaixinha, "saldo" | "rendimentoMes" | "rendimentoTotal" | "rendimentoDia">) =>
    (caixinhas ?? []).reduce((t, c) => t + c[campo], 0);

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        eyebrow="Dinheiro guardado"
        title="Caixinhas"
        subtitle="Seu dinheiro guardado rendendo todo dia, separado das contas do dia a dia."
        actions={
          <Link href="/caixinhas/nova" className="btn btn-primary">
            <Plus size={17} /> Nova caixinha
          </Link>
        }
      />

      {erro && <p className="card p-6 text-sm text-expense">Não foi possível carregar suas caixinhas.</p>}

      {!caixinhas && !erro && (
        <div className="grid gap-5 md:grid-cols-3">
          <SkeletonCard altura={200} className="md:col-span-3" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {caixinhas && caixinhas.length === 0 && (
        <section className="hero-card p-8 sm:p-10">
          <div className="relative z-10 max-w-xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary">
              <PiggyBank size={24} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold">Guarde dinheiro e veja ele crescer</h2>
            <p className="mt-2 text-white/70">
              Crie uma caixinha com o valor que você tem aplicado e quanto ele rende. O saldo vai
              aumentando todo dia, como no banco, e você vê quanto vai ter daqui a meses ou anos.
            </p>
            <Link href="/caixinhas/nova" className="btn mt-6 bg-secondary text-primary hover:brightness-95">
              <Plus size={17} /> Criar minha primeira caixinha
            </Link>
          </div>
        </section>
      )}

      {caixinhas && caixinhas.length > 0 && (
        <>
          <section className="hero-card p-6 sm:p-8" aria-label="Resumo das caixinhas">
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.3fr_2fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Total guardado</p>
                <p className="num mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{formatarMoeda(soma("saldo"))}</p>
                <p className="mt-1 text-sm text-white/60">
                  em {caixinhas.length} {caixinhas.length === 1 ? "caixinha" : "caixinhas"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icone: TrendingUp, rotulo: "Rendeu este mês", valor: soma("rendimentoMes") },
                  { icone: CalendarDays, rotulo: "Rende por dia", valor: soma("rendimentoDia") },
                  { icone: Sparkles, rotulo: "Já rendeu no total", valor: soma("rendimentoTotal") },
                ].map(({ icone: Icone, rotulo, valor }) => (
                  <div key={rotulo} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                      <Icone size={14} className="text-secondary" /> {rotulo}
                    </p>
                    <p className="num mt-1 text-lg font-bold">+ {formatarMoeda(valor)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {caixinhas.map((c) => (
              <CardCaixinha key={c.id} caixinha={c} />
            ))}
            <Link
              href="/caixinhas/nova"
              className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/60 p-5 text-center text-muted transition hover:border-accent hover:bg-accent-light/40 hover:text-accent"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-sm">
                <Plus size={20} />
              </span>
              <span className="font-semibold">Nova caixinha</span>
              <span className="text-xs">Separe dinheiro para um objetivo</span>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

export default Page;
