"use client";

import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { buscarUsuario, login } from "../../services/auth.service";
import { mensagemDeErro } from "../../lib/erros";
import axios from "axios";
import Button from "../../components/ui/Button";
import PainelAuth from "../../components/PainelAuth";




function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrarDeMim, setLembrarDeMim] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  // Servidor gratuito dormindo leva até ~1 min para acordar: avisa em vez de parecer travado.
  const [demorando, setDemorando] = useState(false);

  useEffect(() => {
    if (!carregando) return;
    const timer = setTimeout(() => setDemorando(true), 5_000);
    return () => {
      clearTimeout(timer);
      setDemorando(false);
    };
  }, [carregando]);

  const setUsuario = useAuthStore((state) => state.setUsuario);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    try {
      setCarregando(true);
      const resposta = await login({ email, senha, lembrarDeMim });
      // A API nova já devolve o usuário no login (uma ida ao servidor a menos).
      setUsuario(resposta.usuario ?? (await buscarUsuario()));
      router.replace("/dashboard");
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      setErro(
        status === 401
          ? "Não foi possível entrar. Confira seu e-mail e senha."
          : mensagemDeErro(error, "Não foi possível conectar. Tente novamente em instantes."),
      );
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
                Entrar
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="font-semibold text-primary underline underline-offset-4 transition-opacity hover:opacity-75"
                >
                  Criar agora
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="form-label">E-mail</label>
                <div className="form-input-group">
                  <Mail size={17} className="shrink-0 text-muted-light" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="exemplo@gmail.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input-control"
                  />
                </div>
              </div>

              
              <div className="flex flex-col gap-2">
                <label htmlFor="senha" className="form-label">Senha</label>
                <div className="form-input-group">
                  <Lock size={17} className="shrink-0 text-muted-light" />
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="form-input-control"
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
              </div>

             
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={lembrarDeMim}
                  onChange={(e) => setLembrarDeMim(e.target.checked)}
                />
                Lembrar de mim
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
                {carregando ? "Entrando..." : "Entrar"}
              </Button>

              {demorando && (
                <p role="status" className="text-center text-xs leading-5 text-muted animate-fade-in">
                  O servidor estava em repouso e está acordando. Pode levar até 1 minuto, só na primeira vez.
                </p>
              )}

            </form>
          </div>

          
          <div className="mt-8 flex items-center gap-2 text-xs text-muted lg:hidden">
            <ShieldCheck size={13} />
            <span>Seus dados são protegidos com segurança.</span>
          </div>
        </section>

        
        <PainelAuth />
      </div>
    </main>
  );
}

export default LoginPage;
