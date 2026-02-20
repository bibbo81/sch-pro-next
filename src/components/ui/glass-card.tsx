import * as React from "react"
import { cn } from "@/lib/utils"

function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "glass glass-hover rounded-2xl p-6 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 pb-4", className)}
      {...props}
    />
  )
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function GlassCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function GlassCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("", className)} {...props} />
  )
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2 pt-4 border-t border-white/10", className)}
      {...props}
    />
  )
}

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
}
