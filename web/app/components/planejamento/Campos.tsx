"use client";

/** Campo de dinheiro com o "R$" na frente (mesmo visual das caixinhas). */
export function CampoDinheiro({
  id,
  rotulo,
  valor,
  onValor,
  autoFocus = false,
  obrigatorio = true,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onValor: (v: string) => void;
  autoFocus?: boolean;
  obrigatorio?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{rotulo}</label>
      <div className="flex items-center rounded-[var(--radius-lg)] border border-border bg-background pl-4 focus-within:border-[var(--border-focus)]">
        <span className="text-sm font-bold text-muted">R$</span>
        <input
          id={id}
          inputMode="decimal"
          autoFocus={autoFocus}
          placeholder="0,00"
          className="h-11 w-full bg-transparent px-3 text-sm outline-none focus-visible:outline-none"
          value={valor}
          onChange={(e) => onValor(e.target.value)}
          required={obrigatorio}
        />
      </div>
    </div>
  );
}

export function CaixaErro({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <div role="alert" className="rounded-xl border border-expense/20 bg-expense-light px-4 py-3 text-sm font-medium text-expense">
      {texto}
    </div>
  );
}

export function Rodape({ onCancelar, salvando, rotulo }: { onCancelar: () => void; salvando: boolean; rotulo: string }) {
  return (
    <div className="modal-actions mt-2">
      <button type="button" className="btn btn-ghost h-10" onClick={onCancelar} disabled={salvando}>
        Cancelar
      </button>
      <button type="submit" className="btn btn-primary h-10" disabled={salvando}>
        {salvando ? "Salvando..." : rotulo}
      </button>
    </div>
  );
}

/** Valor digitado ("99,90") → número com 2 casas, ou NaN. */
export function lerDinheiro(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "").replace(/^R\$/, "");
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normalizado);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

/** Número → texto do campo ("99,9" → "99,90"). */
export function paraCampo(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
