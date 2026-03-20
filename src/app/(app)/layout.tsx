import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

// Minimal app layout — TICKET-005 will add sidebar nav + top bar
export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
