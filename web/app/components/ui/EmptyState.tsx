import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-14 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-dim text-muted-light">
          {icon}
        </div>
      )}

      <p className="text-sm font-semibold text-muted">{title}</p>

      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted-light">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
