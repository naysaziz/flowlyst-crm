import { renderHook, act } from '@testing-library/react'
import { useLayoutStore } from '@/lib/layout-store'

describe('Layout Store', () => {
  it('initializes with sidebar open', () => {
    const { result } = renderHook(() => useLayoutStore())
    expect(result.current.isSidebarOpen).toBe(true)
  })

  it('toggles sidebar state', () => {
    const { result } = renderHook(() => useLayoutStore())
    act(() => {
      result.current.toggleSidebar()
    })
    expect(result.current.isSidebarOpen).toBe(false)

    act(() => {
      result.current.toggleSidebar()
    })
    expect(result.current.isSidebarOpen).toBe(true)
  })

  it('sets sidebar open state', () => {
    const { result } = renderHook(() => useLayoutStore())
    act(() => {
      result.current.setSidebarOpen(false)
    })
    expect(result.current.isSidebarOpen).toBe(false)

    act(() => {
      result.current.setSidebarOpen(true)
    })
    expect(result.current.isSidebarOpen).toBe(true)
  })
})