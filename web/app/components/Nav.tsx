"use client";

import {
  ArrowLeftRight,
  Bot,
  CalendarClock,
  Landmark,
  LayoutGrid,
  LogOut,
  LucideIcon,
  MoreHorizontal,
  PiggyBank,
  Settings,
  Tags,
  X,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../store/auth.store";
import { encerrarSessao } from "../services/auth.service";


type NavItemDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Outras rotas que também marcam este item (ex.: telas de cadastro). */
  rotasExtras?: string[];
  /** No celular o item sai da barra e fica no menu "Mais". */
  noMenuMais?: boolean;
};


const NAV_ITEMS: NavItemDef[] = [
  { id: "dashboard",  label: "Dashboard",   icon: LayoutGrid,    href: "/dashboard" },
  { id: "planejamento", label: "Planejar",  icon: CalendarClock, href: "/planejamento" },
  { id: "contas",     label: "Contas",       icon: Landmark,      href: "/contas" },
  { id: "caixinhas",  label: "Caixinhas",    icon: PiggyBank,     href: "/caixinhas" },
  { id: "transacoes", label: "Transações",   icon: ArrowLeftRight, href: "/transacoes", rotasExtras: ["/novaTransacao"] },
  { id: "categorias", label: "Categorias",   icon: Tags,          href: "/categorias", rotasExtras: ["/novaCategoria"] },
  { id: "ia",         label: "IA",           icon: Bot,           href: "/ia", noMenuMais: true },
];

const ROTAS_MENU_MAIS = ["/ia", "/configuracoes"];

function estaAtivo(item: NavItemDef, pathname: string) {
  return [item.href, ...(item.rotasExtras ?? [])].some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );
}


interface NavLinkProps {
  item: NavItemDef;
  isActive: boolean;
  expanded: boolean;
  className?: string;
}

function NavLink({ item, isActive, expanded, className }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <li className={className}>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.label}
        title={item.label}
        className={[
          "flex h-11 items-center rounded-xl text-sm transition-all duration-200",
          expanded ? "gap-3 px-3" : "justify-center",
          isActive
            ? "bg-primary font-semibold text-white shadow-sm ring-1 ring-accent/30"
            : "text-muted hover:bg-accent-light hover:text-accent",
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


interface MenuMaisProps {
  ativo: boolean;
  saindo: boolean;
  erroAoSair: boolean;
  onSair: () => void;
}

/** Celular: itens que não cabem na barra inferior (IA, Configurações e Sair). */
function MenuMais({ ativo, saindo, erroAoSair, onSair }: MenuMaisProps) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const fechar = () => setAberto(false);

  useEffect(() => {
    if (!aberto) return;
    const fecharNoEsc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fecharNoEsc);
    return () => window.removeEventListener("keydown", fecharNoEsc);
  }, [aberto]);

  const classeItem =
    "flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors";

  return (
    <>
      <button
        type="button"
        aria-label="Mais opções"
        aria-expanded={aberto}
        aria-haspopup="menu"
        onClick={() => setAberto((v) => !v)}
        className={[
          "flex h-11 items-center justify-center rounded-xl transition-all duration-200",
          ativo || aberto
            ? "bg-primary text-white shadow-sm ring-1 ring-accent/30"
            : "text-muted hover:bg-accent-light hover:text-accent",
        ].join(" ")}
      >
        <MoreHorizontal size={20} strokeWidth={ativo ? 2.5 : 2} />
      </button>

      {aberto &&
        createPortal(
          <div className="menu-mais-fundo" onClick={fechar}>
            <div
              role="menu"
              aria-label="Mais opções"
              className="menu-mais"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                role="menuitem"
                href="/ia"
                onClick={fechar}
                aria-current={pathname === "/ia" ? "page" : undefined}
                className={`${classeItem} ${pathname === "/ia" ? "bg-accent-light text-accent" : "text-foreground hover:bg-surface-hover"}`}
              >
                <Bot size={19} /> Ler comprovante
              </Link>
              <Link
                role="menuitem"
                href="/configuracoes"
                onClick={fechar}
                aria-current={pathname === "/configuracoes" ? "page" : undefined}
                className={`${classeItem} ${pathname === "/configuracoes" ? "bg-accent-light text-accent" : "text-foreground hover:bg-surface-hover"}`}
              >
                <Settings size={19} /> Configurações
              </Link>
              <div className="my-1 border-t border-border" />
              {erroAoSair && (
                <p role="alert" className="px-3 py-1 text-xs text-expense">
                  Não foi possível sair. Tente novamente.
                </p>
              )}
              <button
                role="menuitem"
                type="button"
                onClick={onSair}
                disabled={saindo}
                aria-busy={saindo}
                className={`${classeItem} text-expense hover:bg-expense-light`}
              >
                {saindo ? <span className="spinner" aria-hidden="true" /> : <LogOut size={19} />}
                {saindo ? "Saindo..." : "Sair"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
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
          {expanded ? (
            <X size={18} />
          ) : (
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary">
              <Image src="/icons/icon-192.png" alt="" width={36} height={36} />
            </span>
          )}
        </button>
      </div>

      
      <ul className="site-nav-list flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={estaAtivo(item, pathname)}
            expanded={expanded}
            className={item.noMenuMais ? "so-desktop" : undefined}
          />
        ))}
        <li className="sm:hidden">
          <MenuMais
            ativo={ROTAS_MENU_MAIS.includes(pathname)}
            saindo={logoutLoading}
            erroAoSair={logoutError}
            onSair={handleLogout}
          />
        </li>
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
