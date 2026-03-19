# TICKETS.md

## Phase 1

- [r] TICKET-004: middleware/workspace (feat/ticket-004-middleware) PR #2 — fixes applied, ready for review
  Issues resolved:
  1. src/middleware.ts:51 — pathname.startsWith('/app') matches /apples (fixed: exact '/app' or '/app/')
  2. src/middleware.ts:53,59 — redirect discards Supabase cookie updates (fixed: cookie transfer)
  3. test coverage added for workspace slug header and cookie handling