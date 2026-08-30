"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { cadastro } from "../../services/auth.service";

function Page() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await cadastro({ nome, email, senha });
    if (response) {
      router.push("/login");
    }
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 border-1">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-2xl">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Crie sua conta</h1>
          <p className="text-sm text-muted">
            Insira seus dados para começar a gerenciar suas finanças.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nome"
              className="text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              Nome completo
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-dim bg-surface px-3 py-3 focus-within:border-primary transition-colors">
              <User size={18} className="text-muted" />
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                id="nome"
                type="text"
                name="nome"
                placeholder="Seu nome completo"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              Email profissional
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-dim bg-surface px-3 py-3 focus-within:border-primary transition-colors">
              <Mail size={18} className="text-muted" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                name="email"
                placeholder="exemplo@empresa.com"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="senha"
              className="text-xs font-semibold uppercase tracking-wide text-foreground"
            >
              Senha
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-surface-dim bg-surface px-3 py-3 focus-within:border-primary transition-colors">
              <Lock size={18} className="text-muted" />
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                id="senha"
                name="senha"
                placeholder="********"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
              />
              <button
                type="button"
                className="text-muted hover:text-foreground"
              ></button>
            </div>
            <p className="text-xs text-muted">
              Mínimo de 8 caracteres, contendo letras e números.
            </p>
          </div>

          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-dim accent-primary"
            />
            <span>
              Concordo com os{" "}
              <a href="#" className="font-medium text-primary hover:underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="font-medium text-primary hover:underline">
                Política de Privacidade
              </a>
              .
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cadastrar
          </button>

          <p className="text-center text-sm text-muted">
            Já tenho conta.{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
export default Page;
