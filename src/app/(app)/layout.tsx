import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet' // Assume added or placeholder
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu' // Placeholder
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar' // Assume
import { Menu, Home, Users, DollarSign, Mail, Clock, Settings, ChevronDown } from 'lucide-react'
import { useLayoutStore } from '@/lib/layout-store'
import { useState } from 'react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSidebarOpen, toggleSidebar } = useLayoutStore()
  const [workspaces] = useState(['Default Workspace', 'My Company', 'Test Org'])

  return (
    <div className="flex h-dvh bg-background">
      {/* Mobile Sheet Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={toggleSidebar}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden mr-4 ml-2 h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 border-r-0 bg-card/50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">Flowlyst</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/app/dashboard" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/app/contacts" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <Users className="h-5 w-5" />
                <span>Contacts</span>
              </Link>
              <Link href="/app/deals" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <DollarSign className="h-5 w-5" />
                <span>Deals</span>
              </Link>
              <Link href="/app/campaigns" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <Mail className="h-5 w-5" />
                <span>Campaigns</span>
              </Link>
              <Link href="/app/sequences" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <Clock className="h-5 w-5" />
                <span>Sequences</span>
              </Link>
              <Link href="/app/settings" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-card/50 flex flex-col shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Flowlyst</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/app/dashboard" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/app/contacts" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <Users className="h-5 w-5" />
            <span>Contacts</span>
          </Link>
          <Link href="/app/deals" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <DollarSign className="h-5 w-5" />
            <span>Deals</span>
          </Link>
          <Link href="/app/campaigns" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <Mail className="h-5 w-5" />
            <span>Campaigns</span>
          </Link>
          <Link href="/app/sequences" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <Clock className="h-5 w-5" />
            <span>Sequences</span>
          </Link>
          <Link href="/app/settings" className="flex items-center space-x-2 rounded-md p-2 hover:bg-accent">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card sticky top-0 z-40">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden mr-4 h-10 w-10" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Workspace Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  Default Workspace
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {workspaces.map((ws) => (
                  <DropdownMenuItem key={ws}>
                    {ws}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}