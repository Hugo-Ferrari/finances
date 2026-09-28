"use client";

import {
  Bell,
  Check,
  LoaderCircle,
  Mail,
  Save,
  Settings,
  UserRound,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { buscarUsuario, atualizarUsuario } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/auth.store";

type Perfil = {
  id: number;
  nome: string;
  email: string;
};

const preferenciasPadrao = {
  notificacoes: true,
  resumoDashboard: true,
};

function Page() {
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const [perfil, setPerfil] = useState<Perfil>({ id: 0, nome: "", email: "" });
  const [preferencias, setPreferencias] = useState(preferenciasPadrao);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const preferenciasSalvas = localStorage.getItem("finlogic-preferencias");
    if (preferenciasSalvas) {
      try {
        startTransition(() => {
          setPreferencias({
            ...preferenciasPadrao,
            ...JSON.parse(preferenciasSalvas),
          });
        });
      } catch {
        localStorage.removeItem("finlogic-preferencias");
      }
    }

    async function carregarPerfil() {
      try {
        const dados = await buscarUsuario();
        setPerfil(dados);
        setUsuario(dados);
      } catch {
        setErro("Não foi possível carregar seu perfil.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, [setUsuario]);

  function atualizarPreferencia(nome: keyof typeof preferencias) {
    setPreferencias((atual) => {
      const novasPreferencias = { ...atual, [nome]: !atual[nome] };
      localStorage.setItem(
        "finlogic-preferencias",
        JSON.stringify(novasPreferencias),
      );
      return novasPreferencias;
    });
    setSucesso("Preferências salvas.");
    setErro("");
  }

  async function salvarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const dados = await atualizarUsuario({
        nome: perfil.nome.trim(),
        email: perfil.email.trim(),
      });
      setPerfil(dados);
      setUsuario(dados);
      setSucesso("Perfil atualizado com sucesso.");
    } catch {
      setErro("Não foi possível salvar. Verifique o nome e o email informado.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-label="Carregando"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-5 sm:p-8">
      <header className="border-b border-border pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Minha conta
        </p>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          <Settings size={28} /> Configurações
        </h1>
        <p className="mt-2 text-sm text-muted">
          Atualize seus dados e escolha como o FinLogic deve funcionar para
          você.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="font-bold text-primary">Perfil</h2>
              <p className="text-sm text-muted">Seus dados de acesso</p>
            </div>
          </div>

          <form onSubmit={salvarPerfil} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              Nome completo
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
                <UserRound size={18} className="text-muted" />
                <input
                  required
                  minLength={2}
                  value={perfil.nome}
                  onChange={(event) =>
                    setPerfil({ ...perfil, nome: event.target.value })
                  }
                  className="w-full bg-transparent text-sm font-normal outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              Email
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
                <Mail size={18} className="text-muted" />
                <input
                  required
                  type="email"
                  value={perfil.email}
                  onChange={(event) =>
                    setPerfil({ ...perfil, email: event.target.value })
                  }
                  className="w-full bg-transparent text-sm font-normal outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/25 text-primary">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="font-bold text-primary">Preferências</h2>
              <p className="text-sm text-muted">Personalize sua experiência</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={preferencias.notificacoes}
              onClick={() => atualizarPreferencia("notificacoes")}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-left transition hover:border-accent"
            >
              <span>
                <strong className="block text-sm text-foreground">
                  Notificações
                </strong>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  Receber avisos importantes da sua conta
                </span>
              </span>
              <span
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${preferencias.notificacoes ? "justify-end bg-primary" : "justify-start bg-surface-dim"}`}
              >
                <span className="h-4 w-4 rounded-full bg-white" />
              </span>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={preferencias.resumoDashboard}
              onClick={() => atualizarPreferencia("resumoDashboard")}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-left transition hover:border-accent"
            >
              <span>
                <strong className="block text-sm text-foreground">
                  Resumo no dashboard
                </strong>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  Manter os cartões de resumo visíveis
                </span>
              </span>
              <span
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${preferencias.resumoDashboard ? "justify-end bg-primary" : "justify-start bg-surface-dim"}`}
              >
                <span className="h-4 w-4 rounded-full bg-white" />
              </span>
            </button>
          </div>
        </section>
      </div>

      {(erro || sucesso) && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${erro ? "bg-expense-light text-expense" : "bg-income-light text-income"}`}
        >
          {sucesso && <Check size={17} />}
          {erro || sucesso}
        </p>
      )}
    </div>
  );
}

export default Page;
