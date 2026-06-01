import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, className = '', ...props }: Props) {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {props.required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(198,40,40,0.1)] transition-all ${error ? 'border-[var(--color-error)] shadow-[0_0_0_3px_rgba(220,38,38,0.1)]' : ''} ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />
      {error && <p id={errorId} className="text-xs text-[var(--color-primary)]" role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className="text-xs text-[var(--color-text-muted)]">{helperText}</p>}
    </div>
  );
}
