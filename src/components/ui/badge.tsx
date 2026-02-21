import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground border-border",
        glass: "border-white/10 bg-white/10 backdrop-blur-sm text-foreground",
        success: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
        pending: "border-transparent bg-slate-500/10 text-slate-600 dark:text-slate-400",
        registered: "border-transparent bg-slate-500/10 text-slate-600 dark:text-slate-400",
        in_transit: "border-transparent bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        delivered: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        exception: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
        delayed: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
        sailing: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
