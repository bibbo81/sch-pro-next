'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-500/20",
  error: "border-red-500/20",
  warning: "border-amber-500/20",
  info: "border-blue-500/20",
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={cn(
        "glass animate-slide-in-bottom md:animate-slide-in-right",
        "flex items-center gap-3 rounded-xl px-4 py-3 pr-3",
        "text-sm text-foreground",
        "border",
        variantClasses[toast.variant]
      )}
    >
      {icons[toast.variant]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-lg p-1 hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { id, message, variant, duration }])
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex flex-col gap-2 max-w-sm md:ml-auto">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
