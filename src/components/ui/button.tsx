import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'glass' | 'primary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = [
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
      "text-sm font-medium transition-all duration-200 ease-glass",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.98]",
    ].join(" ")

    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent/50 hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      glass: [
        "glass glass-hover",
        "text-foreground",
        "hover:scale-[1.02]",
      ].join(" "),
      primary: [
        "bg-primary text-primary-foreground",
        "shadow-md hover:shadow-lg",
        "hover:scale-[1.02] hover:brightness-110",
        "glow-primary",
      ].join(" "),
    }

    const sizes: Record<string, string> = {
      default: "h-10 px-5 py-2",
      sm: "h-9 px-3.5 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps }
