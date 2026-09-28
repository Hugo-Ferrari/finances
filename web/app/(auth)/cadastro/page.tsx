"use client";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LifeBuoy,
  Lock,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cadastro } from "../../services/auth.service";

function Page() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setCarregando(true);
      setErro("");
      const response = await cadastro({ nome, email, senha });
      if (response) {
        router.push("/login");
      }
    } catch {
      setErro(
        "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen w-full lg:grid-cols-[0.95fr_1.05fr]">
        
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="absolute left-6 top-8 flex items-center gap-2.5 sm:left-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg  text-sm font-black text-white">
              <NextImage src="/icons/icon-192.png" alt="" width={36} height={36} />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">
              FinLogic
            </span>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-9">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Crie sua conta
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Já tem uma conta?
                <Link
                  href="/login"
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Entrar
                </Link>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="nome"
                  className="text-sm font-medium text-foreground"
                >
                  Nome completo
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors focus-within:border-accent">
                  <User size={17} className="shrink-0 text-muted-light" />
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  E-mail
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors focus-within:border-accent">
                  <Mail size={17} className="shrink-0 text-muted-light" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="exemplo@gmail.com"
                    autoComplete="email"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="senha"
                  className="text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors focus-within:border-accent">
                  <Lock size={17} className="shrink-0 text-muted-light" />
                  <input
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    type={mostrarSenha ? "text" : "password"}
                    id="senha"
                    name="senha"
                    placeholder="@#*%"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                  <button
                    type="button"
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="shrink-0 text-muted-light transition hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="text-xs text-muted-light">
                  Mínimo de 8 caracteres, contendo letras e números.
                </p>
              </div>

              <label className="flex items-start gap-2.5 text-xs leading-5 text-muted">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                />
                <span>
                  Concordo com os
                  <a href="#" className="font-medium text-primary">
                    Termos de Serviço
                  </a>
                  e
                  <a href="#" className="font-medium text-primary">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense"
                >
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-1 flex items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          </div>
        </section>

       
        <section className="relative hidden min-h-screen overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0 opacity-[0.05]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
          <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative z-10 flex items-center justify-end">
            
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-xs font-medium text-secondary">
              <TrendingUp size={14} />
              <span>Comece sua organização financeira</span>
            </div>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.75rem]">
              Sua vida financeira, mais clara e organizada.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">
              Crie sua conta e tenha uma visão simples das suas receitas,
              despesas, contas e objetivos financeiros, tudo em um só lugar.
            </p>
          </div>

          <div className="relative z-10 flex items-end pb-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 text-foreground shadow-2xl">
              <p className="text-xs font-medium text-muted">Meta do mês</p>
              <p className="mt-1 text-xl font-bold">Guardar R$ 1.200,00</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-dim">
                <div className="h-full w-[68%] rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-xs text-muted">68% da meta alcançada</p>

              <div className="absolute -right-5 -top-6 flex items-center gap-2 rounded-xl bg-income-light px-4 py-3 shadow-lg">
                <TrendingUp size={15} className="text-income" />
                <div className="leading-tight">
                  <p className="text-[10px] font-medium text-income/70">
                    Economia
                  </p>
                  <p className="text-sm font-bold text-income">+R$ 350,40</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2 pt-2">
            <span className="h-1.5 w-5 rounded-full bg-secondary" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-center gap-2 pb-6 text-xs text-muted lg:hidden">
        <ShieldCheck size={13} />
        <span>Seus dados são protegidos com segurança.</span>
      </div>
    </main>
  );
}

export default Page;