'use client';

import { useId } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ label, error, helperText, options, placeholder, className = '', ...props }: Props) {
  const selectId = useId();
  const errorId = useId();
  const helperId = useId();
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {props.required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border transition-all ${
          error
            ? 'border-[var(--color-error)] shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
            : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(198,40,40,0.1)]'
        } focus:outline-none ${className}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p id={errorId} className="text-xs text-[var(--color-primary)]" role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className="text-xs text-[var(--color-text-muted)]">{helperText}</p>}
    </div>
  );
}
