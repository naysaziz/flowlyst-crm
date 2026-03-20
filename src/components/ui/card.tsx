// Stub shadcn/ui Card — to be replaced with full shadcn component
import React from 'react'

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={['rounded-lg border bg-card text-card-foreground shadow-sm', className ?? ''].join(' ')}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={['flex flex-col space-y-1.5 p-6', className ?? ''].join(' ')} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={['text-2xl font-semibold leading-none tracking-tight', className ?? ''].join(' ')}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: DivProps) {
  return <p className={['text-sm text-muted-foreground', className ?? ''].join(' ')} {...props} />
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={['p-6 pt-0', className ?? ''].join(' ')} {...props} />
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div className={['flex items-center p-6 pt-0', className ?? ''].join(' ')} {...props} />
}
