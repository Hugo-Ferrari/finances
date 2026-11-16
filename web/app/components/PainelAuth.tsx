import { PiggyBank, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const DESTAQUES = [
  { icone: PiggyBank, texto: "Veja quanto sobra no fim de cada mês" },
  { icone: TrendingUp, texto: "Limites por categoria para gastar com consciência" },
  { icone: Sparkles, texto: "Registre comprovantes com IA em segundos" },
];

/** Painel ilustrativo das telas de login e cadastro (desktop). */
export default function PainelAuth() {
  return (
    <aside
      style={{ borderRadius: 0 }}
      className="hero-card relative hidden min-h-screen p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14"
      aria-hidden="true"
    >
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-secondary ring-1 ring-white/15">
          <ShieldCheck size={14} />
          Seu dinheiro, sob controle
        </div>
        <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-[2.75rem]">
          Gaste com consciência.
          <br />
          <span className="text-secondary">Guarde mais todo mês.</span>
        </h2>
        <ul className="mt-8 flex flex-col gap-4">
          {DESTAQUES.map(({ icone: Icone, texto }) => (
            <li key={texto} className="flex items-center gap-3 text-[15px] text-white/75">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-secondary">
                <Icone size={17} />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface p-5 text-foreground shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted">Taxa de economia do mês</p>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-bold text-accent">Meta 20%</span>
        </div>
        <p className="num mt-2 text-3xl font-extrabold text-primary">24%</p>
        <div className="progress mt-3 h-2.5">
          <span style={{ width: "24%", background: "var(--accent)" }} />
        </div>
        <p className="num mt-3 text-xs text-muted">R$ 1.180,00 guardados de R$ 4.900,00 recebidos</p>
      </div>
    </aside>
  );
}
