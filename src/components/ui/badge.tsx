// Stub shadcn/ui Badge — to be replaced with full shadcn component
import React from 'react'

type BadgeVariant = 'default' | 'secondary' | 'success' | 'destructive' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-green-100 text-green-800',
  destructive: 'bg-red-100 text-red-800',
  outline: 'border border-input bg-background text-foreground',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  )
}
