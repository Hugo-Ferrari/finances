"use client";

import { Eye, EyeOff, Lock, Mail, ShieldCheck, TrendingUp, User } from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cadastro } from "../../services/auth.service";
import Button from "../../components/ui/Button";


function PainelDecorativo() {
  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14"
      aria-hidden="true"
    >
      
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      
      <div className="absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-secondary/8 blur-3xl" />

      
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/8 px-4 py-2 text-xs font-semibold text-secondary">
          <TrendingUp size={14} />
          Comece sua organização financeira
        </div>
        <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-[2.75rem]">
          Sua vida financeira,<br />mais clara e organizada.
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-7 text-white/55">
          Crie sua conta e tenha uma visão simples das suas receitas, despesas,
          contas e objetivos financeiros — tudo em um só lugar.
        </p>
      </div>

      
      <div className="relative z-10 pb-4">
        <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 text-foreground shadow-2xl">
          <p className="text-xs font-semibold text-muted">Meta do mês</p>
          <p className="mt-1 text-xl font-bold text-foreground">Guardar R$ 1.200,00</p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-dim">
            <div className="h-full w-[68%] rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-xs text-muted">68% da meta alcançada</p>

          
          <div className="absolute -right-4 -top-5 flex items-center gap-2 rounded-xl bg-income-light px-4 py-2.5 shadow-lg">
            <TrendingUp size={14} className="text-income" />
            <div className="leading-tight">
              <p className="text-[10px] font-medium text-income/70">Economia</p>
              <p className="text-sm font-bold text-income">+R$ 350,40</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="relative z-10 flex justify-center gap-2">
        <span className="h-1.5 w-5 rounded-full bg-secondary" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>
    </aside>
  );
}


function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    try {
      setCarregando(true);
      const response = await cadastro({ nome, email, senha });
      if (response) router.push("/login");
    } catch {
      setErro("Não foi possível criar sua conta. Verifique os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen w-full lg:grid-cols-[0.95fr_1.05fr]">

        
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">

          
          <div className="absolute left-6 top-8 flex items-center gap-2.5 sm:left-10">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm">
              <NextImage src="/icons/icon-192.png" alt="FinLogic" width={36} height={36} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-primary">FinLogic</span>
          </div>

          
          <div className="w-full max-w-md animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Crie sua conta
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
                >
                  Entrar
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              
              <div className="flex flex-col gap-2">
                <label htmlFor="nome" className="form-label">Nome completo</label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/12">
                  <User size={17} className="shrink-0 text-muted-light" />
                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                </div>
              </div>

              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="form-label">E-mail</label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/12">
                  <Mail size={17} className="shrink-0 text-muted-light" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="exemplo@gmail.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                </div>
              </div>

             
              <div className="flex flex-col gap-2">
                <label htmlFor="senha" className="form-label">Senha</label>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/12">
                  <Lock size={17} className="shrink-0 text-muted-light" />
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
                  />
                  <button
                    type="button"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="shrink-0 text-muted-light transition-colors hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="text-xs text-muted-light">
                  Mínimo de 8 caracteres, contendo letras e números.
                </p>
              </div>

              
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
                <input
                  type="checkbox"
                  required
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                />
                <span>
                  Concordo com os{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    Termos de Serviço
                  </a>{" "}
                  e a{" "}
                  <a href="#" className="font-semibold text-primary hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              
              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense animate-fade-in"
                >
                  {erro}
                </div>
              )}

              
              <Button
                type="submit"
                loading={carregando}
                size="lg"
                className="w-full rounded-xl"
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </div>

          
          <div className="mt-8 flex items-center gap-2 text-xs text-muted lg:hidden">
            <ShieldCheck size={13} />
            <span>Seus dados são protegidos com segurança.</span>
          </div>
        </section>

        
        <PainelDecorativo />
      </div>
    </main>
  );
}

export default CadastroPage;