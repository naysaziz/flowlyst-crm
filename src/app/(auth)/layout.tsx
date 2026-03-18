import { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex" />
      <div className="lg:p-8 max-w-md w-full space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Flowlyst</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to start the journey.
          </p>
        </div>
        {children}
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 md:w-1/2 sm:w-auto">
          <Link 
            href={'/signup'} 
            className="hover:text-accent-foreground hover:underline text-sm text-muted-foreground underline-offset-4"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  )
}
