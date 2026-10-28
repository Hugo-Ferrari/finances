"use client";

import {
  ArrowLeftRight,
  Bot,
  Landmark,
  LayoutGrid,
  LogOut,
  LucideIcon,
  Menu,
  Settings,
  Tags,
  X,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { encerrarSessao } from "../services/auth.service";


type NavItemDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};


const NAV_ITEMS: NavItemDef[] = [
  { id: "dashboard",  label: "Dashboard",   icon: LayoutGrid,    href: "/dashboard" },
  { id: "contas",     label: "Contas",       icon: Landmark,      href: "/contas" },
  { id: "transacoes", label: "Transações",   icon: ArrowLeftRight, href: "/transacoes" },
  { id: "categorias", label: "Categorias",   icon: Tags,          href: "/categorias" },
  { id: "ia",         label: "IA",           icon: Bot,           href: "/ia" },
];


interface NavLinkProps {
  item: NavItemDef;
  isActive: boolean;
  expanded: boolean;
}

function NavLink({ item, isActive, expanded }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={[
          "flex h-11 items-center rounded-xl text-sm transition-all duration-200",
          expanded ? "gap-3 px-3" : "justify-center",
          isActive
            ? "bg-primary font-semibold text-white shadow-sm"
            : "text-muted hover:bg-primary-light hover:text-primary",
        ].join(" ")}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
        <span
          className={[
            "font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
            expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0",
          ].join(" ")}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}


function NavBar() {
  const [expanded, setExpanded] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    setLogoutLoading(true);
    setLogoutError(false);
    try {
      await encerrarSessao();
      logout();
      router.replace("/login");
    } catch {
      setLogoutError(true);
    } finally {
      setLogoutLoading(false);
    }
  }

  const toggleLabel = expanded ? "Recolher menu" : "Expandir menu";

  return (
    <nav
      className={[
        "site-nav flex flex-col",
        expanded ? "w-64" : "w-[4.5rem]",
      ].join(" ")}
      aria-label="Navegação principal"
    >
     
      <div
        className={[
          "site-nav-header mb-6 flex items-center",
          expanded ? "justify-between" : "justify-center",
        ].join(" ")}
      >
        <div className={`${expanded ? "flex" : "hidden"} items-center gap-2.5`}>
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm">
            <Image src="/icons/icon-192.png" alt="FinLogic" width={36} height={36} />
          </div>
          <span className="text-base font-extrabold tracking-tight text-primary">
            FinLogic
          </span>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={toggleLabel}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-primary-light hover:text-primary"
        >
          {expanded ? <X size={18} /> : <Menu size={20} />}
        </button>
      </div>

      
      <ul className="site-nav-list flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={pathname === item.href}
            expanded={expanded}
          />
        ))}
      </ul>

      
      <div className="flex-1" />

      
      <div className="site-nav-footer flex flex-col gap-1 border-t border-border pt-3">
        {logoutError && (
          <p role="alert" className="px-2 text-xs text-expense animate-fade-in">
            {expanded ? "Não foi possível sair. Tente novamente." : "Falha ao sair"}
          </p>
        )}

        <Link
          href="/configuracoes"
          aria-current={pathname === "/configuracoes" ? "page" : undefined}
          className={[
            "flex h-11 items-center rounded-xl text-sm text-muted transition-all hover:bg-primary-light hover:text-primary",
            expanded ? "gap-3 px-3" : "justify-center",
          ].join(" ")}
        >
          <Settings size={20} />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
            }`}
          >
            Configurações
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          aria-busy={logoutLoading}
          className={[
            "flex h-11 w-full items-center rounded-xl text-sm text-muted transition-all hover:bg-expense-light hover:text-expense",
            expanded ? "gap-3 px-3" : "justify-center",
          ].join(" ")}
        >
          {logoutLoading ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <LogOut size={20} />
          )}
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
              expanded ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
            }`}
          >
            {logoutLoading ? "Saindo..." : "Sair"}
          </span>
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
