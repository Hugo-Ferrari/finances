/** Bloco de carregamento com o mesmo formato do card final. */
export default function SkeletonCard({ altura = 220, className = "" }: { altura?: number; className?: string }) {
  return (
    <div className={`card p-6 ${className}`} aria-hidden="true">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton mt-4 w-full" style={{ height: altura - 80 }} />
    </div>
  );
}
