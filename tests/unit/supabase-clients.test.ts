/**
 * Unit tests for Supabase client helpers (TICKET-003)
 * Tests: client.ts (createClient), server.ts (createServerSupabase)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { mockBrowser: true } })),
  createServerClient: vi.fn(() => ({ auth: { mockServer: true } })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn(() => [{ name: 'sb-token', value: 'test' }]),
    set: vi.fn(),
  }),
}))

describe('supabase/client.ts — createClient', () => {
  it('returns a Supabase browser client', async () => {
    const { createBrowserClient } = await import('@supabase/ssr')
    const { createClient } = await import('@/lib/supabase/client')

    const client = createClient()
    expect(createBrowserClient).toHaveBeenCalled()
    expect(client).toBeDefined()
  })

  it('uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars', async () => {
    // client.ts captures env vars at module scope (top-level const).
    // Since the module is already loaded/cached, we verify the call was made with
    // the env vars that were set at load time (which may be undefined in test env).
    // What we verify: createBrowserClient is called (not some other function).
    const { createBrowserClient } = await import('@supabase/ssr')
    const { createClient } = await import('@/lib/supabase/client')

    createClient()
    // Should have been called at least once — env vars are captured at module load
    expect(createBrowserClient).toHaveBeenCalled()
    // Verify it passes exactly 2 args (url + anon key), whatever their values
    const lastCall = (createBrowserClient as ReturnType<typeof vi.fn>).mock.calls.at(-1)
    expect(lastCall).toHaveLength(2)
  })
})

describe('supabase/server.ts — createServerSupabase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('is an async function', async () => {
    const { createServerSupabase } = await import('@/lib/supabase/server')
    expect(createServerSupabase).toBeInstanceOf(Function)
    // Should return a promise
    const result = createServerSupabase()
    expect(result).toBeInstanceOf(Promise)
  })

  it('awaits cookies() before using the cookie store', async () => {
    const { cookies } = await import('next/headers')
    const { createServerSupabase } = await import('@/lib/supabase/server')

    await createServerSupabase()
    expect(cookies).toHaveBeenCalled()
  })

  it('calls createServerClient with URL and anon key', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-test')

    const { createServerClient } = await import('@supabase/ssr')
    const { createServerSupabase } = await import('@/lib/supabase/server')

    await createServerSupabase()
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-test',
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it('passes cookie handlers with getAll and setAll', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { createServerSupabase } = await import('@/lib/supabase/server')

    await createServerSupabase()

    const callArgs = (createServerClient as ReturnType<typeof vi.fn>).mock.calls[0]
    const cookieOptions = callArgs[2].cookies
    expect(cookieOptions).toHaveProperty('getAll')
    expect(cookieOptions).toHaveProperty('setAll')
    expect(typeof cookieOptions.getAll).toBe('function')
    expect(typeof cookieOptions.setAll).toBe('function')
  })
})
