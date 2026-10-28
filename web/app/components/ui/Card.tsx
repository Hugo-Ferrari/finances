import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  
  flush?: boolean;
}

export function Card({ children, className = "", flush = false }: CardProps) {
  return (
    <div className={`card ${flush ? "" : "p-6"} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, badge, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className="rounded-lg bg-surface-dim px-3 py-1.5 text-xs font-medium text-muted">
            {badge}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

interface CardDividerProps {
  className?: string;
}

export function CardDivider({ className = "" }: CardDividerProps) {
  return <hr className={`divider ${className}`} />;
}
