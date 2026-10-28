import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, suffix, error, hint, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}

        <div
          className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-all duration-150
            ${error ? "border-expense ring-2 ring-expense/10" : "border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/12"}
            ${className}`}
        >
          {icon && (
            <span className="shrink-0 text-muted-light">{icon}</span>
          )}

          <input
            ref={ref}
            id={id}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
            {...rest}
          />

          {suffix && (
            <span className="shrink-0 text-muted-light">{suffix}</span>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-expense">
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-xs text-muted-light">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
