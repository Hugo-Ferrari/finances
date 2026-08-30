"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/auth.store";
import { login } from "../../services/auth.service";
import { useRouter } from "next/navigation";

function Page() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const setUsuario = useAuthStore((state) => state.setUsuario);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await login({ email, senha });
    setUsuario(response);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <h1 className="text-lg font-semibold text-foreground">logo</h1>
        </div>

        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold text-primary">Moneva</h1>
          <p>Seu dinheiro, suas decisões. </p>

          <h3 className="text-sm text-muted">
            Acesse sua conta para continuar.
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              Email
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-surface-dim bg-surface px-3 py-3 transition-colors focus-within:border-primary">
              <Mail size={18} className="text-muted" />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="senha"
                className="text-xs font-semibold uppercase tracking-wide text-foreground"
              >
                Senha
              </label>

              {/* <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-primary hover:underline"
              >
                Esqueci a senha
              </Link> */}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-surface-dim bg-surface px-3 py-3 transition-colors focus-within:border-primary">
              <Lock size={18} className="text-muted" />

              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                id="senha"
                type="password"
                name="senha"
                placeholder="********"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Entrar
            <ArrowRight size={16} />
          </button>

          <hr className="my-2 border-surface-dim" />

          <p className="text-center text-sm text-muted">
            Ainda não tem acesso?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Page;
