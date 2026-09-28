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
} from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { login } from "../../services/auth.service";

function Page() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrarDeMim, setLembrarDeMim] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const router = useRouter();

  useEffect(() => {
    if (usuario) {
      router.replace("/dashboard");
    }
  }, [router, usuario]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setCarregando(true);
      setErro("");
      const response = await login({ email, senha, lembrarDeMim });
      setUsuario(response);
      router.push("/dashboard");
    } catch {
      setErro("Não foi possível entrar. Confira seu email e senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen w-full lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="absolute left-6 top-8 flex items-center gap-2.5 sm:left-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
              <NextImage
                src="/icons/icon-192.png"
                alt=""
                width={36}
                height={36}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">
              FinLogic
            </span>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-9">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Entrar
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  Criar agora
                </Link>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-5"
            >
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
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    placeholder="@#*%"
                    autoComplete="current-password"
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
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    checked={lembrarDeMim}
                    onChange={(e) => setLembrarDeMim(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Lembrar de mim
                </label>
              </div>

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
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-light">
                    ou continue com
                  </span>
                </div>
              </div>

              <div className="grid">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent"
                >
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.5 0 10.4-2.1 14.2-5.6l-6.6-5.6C29.4 34.5 26.9 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.6 5.6C41.8 36 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
                    />
                  </svg>
                  Google
                </button>
              </div>
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
          <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10 flex items-center justify-end">
            <a
              href="#"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur"
            ></a>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-xs font-medium text-secondary">
              <TrendingUp size={14} />
              <span>Sua vida financeira, mais simples</span>
            </div>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.75rem]">
              Entenda seu dinheiro. Tome melhores decisões.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">
              Tenha uma visão clara das suas contas, receitas, despesas e
              objetivos financeiros em um só lugar.
            </p>
          </div>

          <div className="relative z-10 flex items-end pb-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 text-foreground shadow-2xl">
              <p className="text-xs font-medium text-muted">Resumo do mês</p>
              <p className="mt-1 text-xl font-bold">Saldo em contas</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                R$ 4.860,00
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                <ArrowRight size={12} className="rotate-[-45deg] text-income" />
                12% a mais que o mês anterior
              </div>

              <div className="absolute -right-5 -top-6 flex items-center gap-2 rounded-xl bg-income-light px-4 py-3 shadow-lg">
                <TrendingUp size={15} className="text-income" />
                <div className="leading-tight">
                  <p className="text-[10px] font-medium text-income/70">
                    Economias
                  </p>
                  <p className="text-sm font-bold text-income">R$ 350,40</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2 pt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            <span className="h-1.5 w-5 rounded-full bg-secondary" />
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
