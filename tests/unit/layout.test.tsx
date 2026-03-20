import { render, screen } from '@testing-library/react'
import { useLayoutStore } from '@/lib/layout-store'
import AppLayout from '@/app/(app)/layout'
import { Provider } from 'react-redux' // Mock Zustand as Provider if needed, but use vi.mock

// Mock next/link for SSR
vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>
}))

// Mock Zustand store for controlled render
const mockToggleSidebar = vi.fn()
vi.mock('@/lib/layout-store', () => ({
  useLayoutStore: vi.fn(() => ({
    isSidebarOpen: true,
    toggleSidebar: mockToggleSidebar
  }))
}))

describe('AppLayout', () => {
  it('renders sidebar nav links', () => {
    render(<AppLayout>children</AppLayout>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Deals')).toBeInTheDocument()
    expect(screen.getByText('Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Sequences')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders top bar with workspace switcher and user avatar', () => {
    render(<AppLayout>children</AppLayout>)
    expect(screen.getByText('Default Workspace')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('has responsive classes for sidebar', () => {
    const { container } = render(<AppLayout>children</AppLayout>)
    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('hidden', 'lg:flex')
  })
})