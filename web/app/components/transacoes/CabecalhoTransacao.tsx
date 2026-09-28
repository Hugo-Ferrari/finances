function CabecalhoTransacao() {
  return (
    <div className="grid grid-cols-6 items-center border-b border-border bg-background px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
      <span>#</span>
      <span>Data</span>
      <span>Descrição</span>
      <span>Conta</span>
      <span>Categoria</span>
      <span className="text-right">Valor</span>
    </div>
  );
}

export default CabecalhoTransacao;
