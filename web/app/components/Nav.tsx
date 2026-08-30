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
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type Nav = {
  tipo: "Dashboard" | "Conta" | "Transacao" | "Categoria";
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
];

function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className={`  min-h-screen  ${open ? "w-64" : "w-20"}  bg-background  border-r border-border   p-3   flex flex-col  transition-all duration-300 ease-in-out `}
    >
      <div
        className={`  flex items-center  mb-8 ${open ? "justify-between" : "justify-center"}`}
      >
        <div className={` ${open ? "flex" : "hidden"}  items-center  gap-2`}>
          <div className=" w-9 h-9 rounded-xl bg-primary text-white  flex items-center justify-center  font-bold">
            M
          </div>

          <span className="font-bold text-primary">Moneva</span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className=" w-9 h-9 rounded-full flex items-center justify-center text-primary  hover:bg-primary-light  transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {navItem.map((item) => {
          const Icon = item.icones;
          const isActive = pathname === item.rotas;

          return (
            <li key={item.tipo}>
              <Link
                href={item.rotas}
                className={`flex items-center ${open ? "gap-3 px-3" : "justify-center"} h-11  rounded-xl  transition-all duration-200

                  ${isActive ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary-light hover:text-primary"}`}
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

      <div className="flex flex-col gap-2">
        <button
          className={`flex items-center  ${open ? "gap-3 px-3" : "justify-center"}  h-11  rounded-xl  text-muted  hover:bg-primary-light  hover:text-primary transition-all`}
        >
          <Settings size={20} />

          <span
            className={`whitespace-nowrap overflow-hidden  transition-all duration-300 ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`}
          >
            Configurações
          </span>
        </button>

        <button
          className={` flex items-center ${open ? "gap-3 px-3" : "justify-center"}  h-11 rounded-xl text-muted  hover:bg-expense-ligh  hover:text-expense transition-all`}
        >
          <LogOut size={20} />

          <span
            className={`whitespace-nowrapoverflow-hiddentransition-all duration-300${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}`}
          >
            Sair
          </span>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
