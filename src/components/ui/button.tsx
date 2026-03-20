// Stub shadcn/ui Button — to be replaced with full shadcn component
import React from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'link' | 'destructive'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  asChild?: boolean
  children?: React.ReactNode
}

export function Button({ variant = 'default', asChild, children, className, ...props }: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: [className, 'btn', `btn-${variant}`].filter(Boolean).join(' '),
    })
  }
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : '',
        variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
