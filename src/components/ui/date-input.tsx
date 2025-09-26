'use client'

import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
  placeholder?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  id,
  className,
  placeholder
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      // Add multiple attributes to prevent browser extension interference
      inputRef.current.setAttribute('data-no-autofill', 'true')
      inputRef.current.setAttribute('data-form-type', 'filter')
      inputRef.current.setAttribute('data-lpignore', 'true')
      inputRef.current.setAttribute('data-1p-ignore', 'true')
      inputRef.current.setAttribute('data-bwignore', 'true')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onChange(e.target.value)
  }

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }

  return (
    <input
      ref={inputRef}
      type="date"
      id={id}
      value={value}
      onChange={handleChange}
      onClick={handleClick}
      onFocus={handleFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-no-autofill="true"
      data-form-type="filter"
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      role="textbox"
      aria-label="Date filter input"
      placeholder={placeholder}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "min-w-[150px]",
        className
      )}
    />
  )
}