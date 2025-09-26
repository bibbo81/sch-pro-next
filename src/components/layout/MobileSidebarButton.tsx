'use client'

import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileSidebarButtonProps {
  onClick: () => void
  className?: string
}

export function MobileSidebarButton({ onClick, className }: MobileSidebarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
        className
      )}
      onClick={onClick}
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" />
    </button>
  )
}