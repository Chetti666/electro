import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10",
        destructive:
          "bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500/10",
        outline:
          "bg-transparent border-2 border-slate-500 text-slate-400 hover:border-cyan-400 hover:text-cyan-400",
        secondary:
          "bg-transparent border-2 border-fuchsia-400 text-fuchsia-400 hover:bg-fuchsia-400/10",
        ghost: "hover:bg-cyan-400/10 hover:text-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={
          variant === "default"
            ? { boxShadow: "0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)", textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }
            : variant === "destructive"
            ? { boxShadow: "0 0 10px rgba(255, 0, 64, 0.3), inset 0 0 10px rgba(255, 0, 64, 0.1)", textShadow: "0 0 10px rgba(255, 0, 64, 0.5)" }
            : variant === "secondary"
            ? { boxShadow: "0 0 10px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1)", textShadow: "0 0 10px rgba(255, 0, 255, 0.5)" }
            : undefined
        }
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }