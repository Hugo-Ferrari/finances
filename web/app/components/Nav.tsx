"use client";

import {
  ArrowLeftRight,
  Landmark,
  LayoutGrid,
  LucideIcon,
  Menu,
  Tags,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { encerrarSessao } from "../services/auth.service";

export type Nav = {
  tipo: "Dashboard" | "Conta" | "Transacao" | "Categoria" | "IA";
  icones: LucideIcon;
  nome: string;
  rotas: string;
};

const navItem: Nav[] = [
  {
    tipo: "Dashboard",
    nome: "Dashboard",
    icones: LayoutGrid,
    rotas: "/dashboard",
  },
  {
    tipo: "Conta",
    nome: "Conta",
    icones: Landmark,
    rotas: "/contas",
  },
  {
    tipo: "Transacao",
    nome: "Transações",
    icones: ArrowLeftRight,
    rotas: "/transacoes",
  },
  {
    tipo: "Categoria",
    nome: "Categorias",
    icones: Tags,
    rotas: "/categorias",
  },
  {
    tipo: "IA",
    nome: "IA",
    icones: Bot,
    rotas: "/ia",
  },
];

function NavBar() {
  const [open, setOpen] = useState(false);
  const [sairEmAndamento, setSairEmAndamento] = useState(false);
  const [erroSair, setErroSair] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    setSairEmAndamento(true);
    setErroSair(false);

    try {
      await encerrarSessao();
      logout();
      router.replace("/login");
    } catch {
      setErroSair(true);
    } finally {
      setSairEmAndamento(false);
    }
  }

  return (
    <nav
      className={`site-nav sticky top-0 z-20 min-h-screen ${open ? "w-64" : "w-20"} shrink-0 border-r border-border bg-surface/95 p-3 shadow-[4px_0_24px_rgba(23,25,54,0.03)] backdrop-blur-sm transition-all duration-300 ease-in-out`}
    >
      <div
        className={`site-nav-header mb-8 flex items-center ${open ? "justify-between" : "justify-center"}`}
      >
        <div className={`${open ? "flex" : "hidden"} items-center gap-2`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-sm">
            <Image
              src="/icons/icon-192.png"
              alt="Logo"
              width={36}
              height={36}
            />
          </div>

          <span className="text-base font-bold tracking-tight text-primary">
            FinLogic
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Recolher menu" : "Expandir menu"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary-light"
        >
          <Menu size={20} />
        </button>
      </div>

      <ul className="site-nav-list flex flex-col gap-1.5">
        {navItem.map((item) => {
          const Icon = item.icones;
          const isActive = pathname === item.rotas;

          return (
            <li key={item.tipo}>
              <Link
                href={item.rotas}
                className={`flex h-11 items-center ${open ? "gap-3 px-3" : "justify-center"} rounded-xl text-sm transition-all duration-200

                  ${isActive ? "bg-primary font-semibold text-white shadow-sm" : "text-muted hover:bg-primary-light hover:text-primary"}`}
              >
                <Icon size={20} strokeWidth={2} className="shrink-0" />

                <span
                  className={` font-medium whitespace-nowrap  overflow-hidden  transition-all duration-300  ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`}
                >
                  {item.nome}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex-1" />

      <div className="site-nav-footer flex flex-col gap-1.5 border-t border-border pt-3">
        {erroSair && (
          <p role="alert" className="px-2 text-xs text-expense">
            {open ? "Não foi possível sair. Tente novamente." : "Falha ao sair"}
          </p>
        )}

        <Link
          href="/configuracoes"
          aria-current={pathname === "/configuracoes" ? "page" : undefined}
          className={`flex h-11 items-center ${open ? "gap-3 px-3" : "justify-center"} rounded-xl text-sm text-muted transition-all hover:bg-primary-light hover:text-primary`}
        >
          <Settings size={20} />

          <span
            className={`whitespace-nowrap overflow-hidden  transition-all duration-300 ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`}
          >
            Configurações
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={sairEmAndamento}
          aria-busy={sairEmAndamento}
          className={`flex h-11 items-center ${open ? "gap-3 px-3" : "justify-center"} rounded-xl text-sm text-muted transition-all hover:bg-expense-light hover:text-expense`}
        >
          <LogOut size={20} />

          <span
            className={`whitespace-nowrap overflow-hidden  transition-all duration-300 ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`}
          >
            Sair
          </span>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
