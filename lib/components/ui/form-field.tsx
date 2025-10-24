'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FormField({ label, error, required, children, htmlFor, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        px-3 py-2 rounded-lg border text-sm
        bg-white dark:bg-neutral-900
        ${error
          ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
          : 'border-neutral-300 dark:border-neutral-700 focus:ring-sky-500 focus:border-sky-500'
        }
        focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        placeholder:text-neutral-400 dark:placeholder:text-neutral-600
        ${className}
      `}
      {...props}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ error, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`
        px-3 py-2 rounded-lg border text-sm
        bg-white dark:bg-neutral-900
        ${error
          ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
          : 'border-neutral-300 dark:border-neutral-700 focus:ring-sky-500 focus:border-sky-500'
        }
        focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        placeholder:text-neutral-400 dark:placeholder:text-neutral-600
        resize-none
        ${className}
      `}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`
        px-3 py-2 rounded-lg border text-sm
        bg-white dark:bg-neutral-900
        ${error
          ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
          : 'border-neutral-300 dark:border-neutral-700 focus:ring-sky-500 focus:border-sky-500'
        }
        focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white border-transparent',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg border font-medium
        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
