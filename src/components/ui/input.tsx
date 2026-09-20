import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    const inputElement = (
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-purple-600 focus-visible:ring-2 focus-visible:ring-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-2xs",
            icon && "pl-9",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )

    if (!label && !error) {
      return inputElement
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        {inputElement}
        {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, ...props }, ref) => {
    const selectElement = (
      <select
        className={cn(
          "flex h-10 w-full rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 ring-offset-background placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-purple-600 focus-visible:ring-2 focus-visible:ring-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer shadow-2xs [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100",
          error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )

    if (!label && !error) {
      return selectElement
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        {selectElement}
        {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
      </div>
    )
  }
)
Select.displayName = "Select"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const textareaElement = (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 ring-offset-background placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-purple-600 focus-visible:ring-2 focus-visible:ring-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none shadow-2xs",
          error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (!label && !error) {
      return textareaElement
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        {textareaElement}
        {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Select, Textarea }
