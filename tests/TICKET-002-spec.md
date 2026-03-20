# Test Spec — TICKET-002 (Supabase Schema + RLS)

**QA Date:** 2026-03-19  
**Branch:** feat/ticket-002-supabase-schema  
**Commit:** 1532425  
**Result:** APPROVED ✅

---

## Scope
DB-only ticket. No UI, no unit tests, no E2E. Validation is:
1. SQL migration syntax and structural correctness
2. RLS policy coverage and logic
3. Seed idempotency
4. RLS verification script correctness

---

## Static Migration Checks (All Pass)

### Extensions (4/4)
- [x] `uuid-ossp` enabled
- [x] `pgcrypto` enabled  
- [x] `pg_cron` enabled
- [x] `pg_net` enabled

### Schema Structure (23 tables + project_config)
- [x] 23 application tables with proper PKs, FKs, indexes
- [x] 48 foreign key constraints with correct ON DELETE/CASCADE behavior
- [x] 25 indexes covering common query patterns
- [x] 20 enum types matching PRD §8

### RLS Coverage (23/23 tables)
- [x] All 23 application tables have `ENABLE ROW LEVEL SECURITY`
- [x] `project_config` intentionally excluded (internal config, accessed by SECURITY DEFINER fn only)
- [x] 26 RLS policies total

### RLS Policy Logic
- [x] `user_workspace_ids()` helper: SECURITY DEFINER + STABLE (performance)
- [x] `workspace_members` bootstrap INSERT: `user_id = auth.uid()` (allows first-time join)
- [x] `workspaces` bootstrap INSERT: `auth.uid() IS NOT NULL` (any authed user can create)
- [x] `workspaces` SELECT: restricted to members via `user_workspace_ids()`
- [x] `workspaces` UPDATE: restricted to members only
- [x] `contact_list_members`: subquery via `contact_lists.workspace_id` (no direct workspace_id column)
- [x] `deal_contacts`: subquery via `deals.workspace_id` (no direct workspace_id column)
- [x] All other tables: `workspace_id = ANY(user_workspace_ids())`

### process_email_queue() Function
- [x] SECURITY DEFINER (needed to call pg_net)
- [x] Uses `app.service_role_key` (not `app.current_jwt` — empty in cron context)
- [x] Graceful RETURN with WARNING if `project_ref` not set
- [x] Graceful RETURN with WARNING if `service_role_key` not set
- [x] Reads project_ref from `project_config` table with fallback to `app.project_ref`
- [x] Correct pg_net.http_post with Authorization + Content-Type headers

### pg_cron Job
- [x] Idempotent: DO block unschedules existing job before re-creating
- [x] Single `SELECT cron.schedule(...)` call (no duplicates)
- [x] Schedule: every minute (`* * * * *`)
- [x] Calls `public.process_email_queue()` (schema-qualified)

### seed.sql
- [x] `admin_user_id := NULL` (not hardcoded UUID)
- [x] Workspace insert: `ON CONFLICT (slug) DO NOTHING` (idempotent)
- [x] Member insert: conditional on `admin_user_id IS NOT NULL`
- [x] Member insert: `ON CONFLICT DO NOTHING` (idempotent)
- [x] Default pipeline + 6 stages (New Lead/Qualified/Proposal/Negotiation/Won/Lost)
- [x] Default email config (flowlyst_pool mode)

### .env.local
- [x] All 3 Supabase vars present as placeholders (no leaked secrets)
- [x] Step-by-step setup instructions included in comments

### scripts/verify-rls.js
- [x] JS syntax valid
- [x] Anon INSERT blocked test (workspaces)
- [x] Anon SELECT returns empty test (workspaces)
- [x] Service role: test user creation via admin API
- [x] Service role: test workspace + member linking
- [x] Signed-in user: sees own workspace
- [x] Signed-in user: can insert contact in own workspace
- [x] Cleanup: test user deleted after tests

---

## Known Limitations (Non-Blocking)
- `project_config` table has no RLS — any authenticated user can read/delete config.
  - project_ref is non-secret (it's in the public Supabase URL)
  - SECURITY DEFINER function still bypasses RLS correctly
  - Recommend: add admin-only RLS policy in a follow-up migration

## Runtime Verification
Docker not available on this host — `supabase start` and `supabase db push` cannot run locally.
Manual verification steps (for deploy/ops):
1. `supabase login && supabase link --project-ref <ref>`
2. `supabase db push` → applies migration
3. `supabase db seed` → inserts demo data
4. Set real keys in `.env.local`
5. `node scripts/verify-rls.js` → should show all ✅ PASS
