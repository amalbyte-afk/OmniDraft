import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const errorId = useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={props.id}
          className={`glass px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus-ring rounded-xl transition-colors ${error ? 'border-error/50' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-xs text-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
