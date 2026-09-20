import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:translate-x-0.5 active:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-purple-700 active:shadow-none",
        destructive:
          "bg-rose-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-rose-700 active:shadow-none",
        danger:
          "bg-rose-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:bg-rose-700 active:shadow-none",
        outline:
          "border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[3px_3px_0px_0px_#9333ea] hover:bg-zinc-100 dark:hover:bg-zinc-800 active:shadow-none",
        secondary:
          "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#9333ea] hover:bg-zinc-200 dark:hover:bg-zinc-800 active:shadow-none",
        ghost:
          "hover:bg-purple-600/10 hover:text-purple-600 dark:hover:text-purple-400 text-zinc-700 dark:text-zinc-300",
        link: "text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 px-3 text-xs rounded-lg",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as any}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
