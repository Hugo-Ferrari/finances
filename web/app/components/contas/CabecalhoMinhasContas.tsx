type Props = {
  saldoTotal: number;
};

function CabecalhoMinhasContas({ saldoTotal }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">

      <div className="bg-surface border border-border rounded-2xl px-6 py-4 min-w-[220px]">
        <span className="text-sm text-muted">
          Saldo Total
        </span>

        <p className="text-2xl font-bold mt-1">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(saldoTotal)}
        </p>
      </div>
    </div>
  );
}

export default CabecalhoMinhasContas;