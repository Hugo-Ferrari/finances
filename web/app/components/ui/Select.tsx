import { SelectHTMLAttributes, ReactNode, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          className={`form-select ${
            error
              ? "border-expense ring-2 ring-expense/10"
              : "focus:border-accent focus:ring-2 focus:ring-accent/12"
          } ${className}`}
          {...rest}
        >
          {children}
        </select>

        {error && (
          <p role="alert" className="text-xs font-medium text-expense">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
