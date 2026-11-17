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
          className={`form-input-group ${className}`}
          data-invalid={Boolean(error)}
        >
          {icon && (
            <span className="shrink-0 text-muted-light">{icon}</span>
          )}

          <input
            ref={ref}
            id={id}
            className="form-input-control"
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
