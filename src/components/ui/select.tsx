// Stub shadcn/ui Select — to be replaced with full shadcn component
import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          'block w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
    )
  },
)

Select.displayName = 'Select'

export function SelectItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return <option value={value}>{children}</option>
}
