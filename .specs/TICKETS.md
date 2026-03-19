# TICKETS.md — Flowlyst CRM & Email Automation Platform

**Last updated:** 2026-03-17  
**Repo:** github.com/clio-flowlyst/flowlyst-crm  
**Branching strategy:** `feat/ticket-XXX-short-description` → PR → code review → merge to `main`  
**PR template:** All PRs must include: scope, test plan, screenshot/recording (UI), migration note (DB changes)

---

## Phase 1 Tickets (Weeks 1–10)

### Foundation — Sprint 1 (Week 1–2)

```
[x] TICKET-001: Next.js 15 scaffold + Prisma schema + DB push (dev)
    branch: feat/init-phase1
    PR: #1 (merged to main)
    deps: none
    effort: 1 day
    scope: create-next-app, supabase/functions dirs, full Prisma schema from PRD §8,
           prisma generate + db push, package.json Appendix B deps, npm install
    status: deployed (init commit)

[r] TICKET-002: Supabase project setup + full DB schema migration (all tables + RLS policies)
    branch: feat/ticket-002-supabase-schema
    PR: #3
    deps: TICKET-001
    effort: 2 days
    scope: Create Supabase project, run PRD §8 SQL migration (extensions, tables, RLS policies,
           helper functions, pg_cron jobs), update .env.local with Supabase URL/keys,
           seed.sql with workspace + admin user, verify RLS with supabase client test
    status: in-review

[ ] TICKET-003: Supabase Auth — email/password + Google OAuth flows
    branch: feat/ticket-003-auth
    PR: (to be opened)
    deps: TICKET-002
    effort: 2 days
    scope: @supabase/ssr server/client helpers, login/signup/callback pages
           (src/app/(auth)/), session cookie management, Google OAuth provider config
           in Supabase dashboard, email confirmation flow, password reset flow
    status: pending

[ ] TICKET-004: Next.js middleware — auth guard + workspace resolution
    branch: feat/ticket-004-middleware
    PR: (to be opened)
    deps: TICKET-003
    effort: 1 day
    scope: src/app/middleware.ts — protect /app/* routes, redirect unauthenticated users
           to /login, resolve workspace slug from URL or user's default workspace,
           inject workspace context into request headers
    status: pending

[ ] TICKET-005: Core layout — sidebar nav, top bar, workspace switcher
    branch: feat/ticket-005-layout
    PR: (to be opened)
    deps: TICKET-004
    effort: 2 days
    scope: src/app/(app)/layout.tsx, sidebar with nav links (dashboard/contacts/deals/
           campaigns/sequences/settings), top bar with user avatar + workspace switcher,
           shadcn/ui primitives, responsive mobile-first, Zustand for sidebar state
    status: pending

[ ] TICKET-006: PWA manifest + base service worker (offline shell + cache strategies)
    branch: feat/ticket-006-pwa
    PR: (to be opened)
    deps: TICKET-005
    effort: 1 day
    scope: public/manifest.json (icons, display, theme_color), @serwist/next config,
           app shell caching strategy (stale-while-revalidate for static, network-first
           for API), offline fallback page, iOS splash screens
    status: pending
```

### Contacts Module — Sprint 2 (Week 3–4)

```
[ ] TICKET-007: Contact list page — virtual scroll, search, tag filter
    branch: feat/ticket-007-contact-list
    PR: (to be opened)
    deps: TICKET-005
    effort: 2 days
    scope: /contacts page with @tanstack/react-virtual scroll (10k+ contacts),
           search with debounce (300ms), multi-tag filter, column sort,
           TanStack Query for data fetching + optimistic updates
    status: pending

[ ] TICKET-008: Contact create/edit form with Zod validation
    branch: feat/ticket-008-contact-form
    PR: (to be opened)
    deps: TICKET-007
    effort: 1 day
    scope: /contacts/new and /contacts/:id/edit — react-hook-form + @hookform/resolvers,
           Zod schema matching DB schema, custom fields editor (JSONB), tag autocomplete
    status: pending

[ ] TICKET-009: Contact detail page + activity timeline component
    branch: feat/ticket-009-contact-detail
    PR: (to be opened)
    deps: TICKET-008
    effort: 2 days
    scope: /contacts/:id — contact header card, editable fields, activity timeline
           (infinite scroll, grouped by date), quick note/call/meeting log, linked deals
    status: pending

[ ] TICKET-010: Tag management (create/rename/delete + contact tagging)
    branch: feat/ticket-010-tags
    PR: (to be opened)
    deps: TICKET-007
    effort: 1 day
    scope: Settings > Tags page, bulk tag/untag contacts from list view, tag count display
    status: pending

[ ] TICKET-011: CSV import — parse, duplicate detection, import preview
    branch: feat/ticket-011-csv-import
    PR: (to be opened)
    deps: TICKET-007
    effort: 2 days
    scope: /contacts/import — papaparse CSV parsing, column mapping UI, duplicate
           detection (email match), conflict resolution (skip/merge/overwrite),
           import preview with row count, async import with progress indicator
    status: pending

[ ] TICKET-012: Contact lists (static) — create/add/remove contacts
    branch: feat/ticket-012-contact-lists
    PR: (to be opened)
    deps: TICKET-007
    effort: 1 day
    scope: /contacts/lists, create/rename/delete lists, add contacts via search or
           bulk select, contact_count cache update, list detail page
    status: pending
```

### Deals Module — Sprint 3 (Week 5–6)

```
[ ] TICKET-013: Pipeline Kanban board with @dnd-kit drag-and-drop
    branch: feat/ticket-013-kanban
    PR: (to be opened)
    deps: TICKET-005
    effort: 3 days
    scope: /deals — @dnd-kit/core DnD board, stages as columns, deal cards with
           value/owner/close-date, optimistic stage update on drop, pipeline switcher
    status: pending

[ ] TICKET-014: Deal create/edit form (value, stage, close date, owner)
    branch: feat/ticket-014-deal-form
    PR: (to be opened)
    deps: TICKET-013
    effort: 1 day
    scope: /deals/new and /deals/:id/edit — form with Zod, currency input, date picker,
           stage select, owner assignment, custom fields
    status: pending

[ ] TICKET-015: Deal detail page + linked contacts + timeline
    branch: feat/ticket-015-deal-detail
    PR: (to be opened)
    deps: TICKET-014
    effort: 2 days
    scope: /deals/:id — deal header, stage progress bar, linked contacts (search/add),
           activity timeline shared with contact, task creation
    status: pending

[ ] TICKET-016: Pipeline stage management in Settings
    branch: feat/ticket-016-pipeline-settings
    PR: (to be opened)
    deps: TICKET-013
    effort: 1 day
    scope: Settings > Pipeline — add/edit/delete/reorder stages, type (open/won/lost),
           probability, color picker, framer-motion drag to reorder
    status: pending

[ ] TICKET-017: Activity logging on deal stage changes
    branch: feat/ticket-017-activity-log
    PR: (to be opened)
    deps: TICKET-015
    effort: 1 day
    scope: Supabase DB trigger or Edge Function hook on deals.stage_id UPDATE —
           insert activities row (type: deal_stage_changed), surface in timeline
    status: pending
```

### Email Campaigns — Sprint 4–5 (Week 7–9)

```
[ ] TICKET-018: Workspace SES configuration UI + domain verification flow
    branch: feat/ticket-018-ses-config
    PR: (to be opened)
    deps: TICKET-005
    effort: 2 days
    scope: Settings > Email — BYOS vs Flowlyst Pool toggle, AWS key input (vault store),
           from_email/from_name/reply_to config, SES domain verification status display
           (DKIM/SPF/DMARC), test send button
    status: pending

[ ] TICKET-019: Visual email block builder (header/text/button/image/divider/footer)
    branch: feat/ticket-019-email-builder
    PR: (to be opened)
    deps: TICKET-018
    effort: 4 days
    scope: /campaigns/new and /templates/new — drag-drop block editor (header/text/button/
           image/divider/footer), blocks_json state in Zustand, HTML export (juice CSS
           inliner for email clients), preview desktop/mobile, variable placeholder UI
    status: pending

[ ] TICKET-020: Campaign create/edit — name, subject, preheader, recipients
    branch: feat/ticket-020-campaign-form
    PR: (to be opened)
    deps: TICKET-019
    effort: 2 days
    scope: /campaigns/new — multi-step form (settings → design → recipients → review),
           recipient targeting (list/tag/all), estimated recipient count, schedule send
    status: pending

[ ] TICKET-021: Variable substitution + {{unsubscribe_link}} enforcement
    branch: feat/ticket-021-variable-substitution
    PR: (to be opened)
    deps: TICKET-020
    effort: 1 day
    scope: Server-side render: replace {{first_name}}, {{company}}, etc. per contact,
           enforce {{unsubscribe_link}} presence at send time (block send if missing),
           unsubscribe endpoint handler (sets contacts.unsubscribed = true)
    status: pending

[ ] TICKET-022: Email queue + pg_cron scheduler + SES send Edge Function
    branch: feat/ticket-022-email-queue
    PR: (to be opened)
    deps: TICKET-021
    effort: 3 days
    scope: supabase/functions/email-sender — dequeue pending emails in batches (14/s rate
           limit), SES v2 SendEmail call, update queue status + ses_message_id,
           retry logic (3 attempts, exponential backoff), pg_cron schedule (every 60s)
    status: pending

[ ] TICKET-023: Open tracking pixel endpoint + click redirect endpoint
    branch: feat/ticket-023-tracking
    PR: (to be opened)
    deps: TICKET-022
    effort: 1 day
    scope: /api/t/o/[token] — 1x1 GIF, record email_events.opened, update campaign stats;
           /api/t/c/[token] — record email_events.clicked, redirect to destination_url
    status: pending

[ ] TICKET-024: SES SNS webhook handler (bounce/complaint/delivery)
    branch: feat/ticket-024-ses-webhook
    PR: (to be opened)
    deps: TICKET-022
    effort: 2 days
    scope: /api/webhooks/ses — SNS signature verification, process Bounce/Complaint/Delivery
           notifications, update contacts.bounced/bounce_type, insert email_events rows,
           update campaign stats via RPC, hard bounce = set bounced=true + blacklist
    status: pending

[ ] TICKET-025: Campaign analytics page (sent/opened/clicked/bounced stats)
    branch: feat/ticket-025-campaign-analytics
    PR: (to be opened)
    deps: TICKET-023, TICKET-024
    effort: 2 days
    scope: /campaigns/:id/analytics — stat cards (sent/delivered/opened/clicked/bounced/
           complained), open rate %, click rate %, time-series chart (framer-motion or
           recharts), recipient activity list with per-contact event history
    status: pending
```

### Polish & Launch — Sprint 5 (Week 9–10)

```
[ ] TICKET-026: Tasks module — CRUD, assignment, due reminders
    branch: feat/ticket-026-tasks
    PR: (to be opened)
    deps: TICKET-005
    effort: 2 days
    scope: /tasks — list view with filters (mine/all/overdue), create/edit/complete tasks,
           link to contact or deal, due date with overdue highlighting, assigned_to select
    status: pending

[ ] TICKET-027: In-app notifications — bell icon, dropdown, unread count
    branch: feat/ticket-027-notifications
    PR: (to be opened)
    deps: TICKET-005
    effort: 1 day
    scope: Top bar bell icon with unread badge, Supabase Realtime subscription to
           notifications table, dropdown list (mark-read, mark-all-read), deep links
    status: pending

[ ] TICKET-028: Team invite flow (send invite → accept → join workspace)
    branch: feat/ticket-028-team-invites
    PR: (to be opened)
    deps: TICKET-003
    effort: 2 days
    scope: Settings > Team — invite by email (create workspace_invites row, send email via
           SES), /invite/[token] accept page (validate expiry, create workspace_members),
           role assignment, pending invite list with revoke
    status: pending

[ ] TICKET-029: Settings pages — workspace, email config, team members
    branch: feat/ticket-029-settings
    PR: (to be opened)
    deps: TICKET-028
    effort: 1 day
    scope: /settings — tabbed layout (Workspace / Email / Team / Pipeline),
           workspace name/logo/timezone edit, integrates TICKET-016, 018, 028
    status: pending

[ ] TICKET-030: Dashboard widgets (pipeline, activity feed, tasks due, campaign stats)
    branch: feat/ticket-030-dashboard
    PR: (to be opened)
    deps: TICKET-013, TICKET-025, TICKET-026
    effort: 2 days
    scope: /dashboard — pipeline summary (total deals/value by stage), recent activity feed
           (last 20 events), tasks due today/overdue, campaign stats (last 30 days),
           framer-motion entrance animations
    status: pending

[ ] TICKET-031: GitHub Actions CI/CD pipeline → Vercel + Supabase migrations
    branch: feat/ticket-031-cicd
    PR: (to be opened)
    deps: TICKET-001
    effort: 1 day
    scope: .github/workflows/ci.yml (ESLint + TypeScript check + Vitest on every PR),
           .github/workflows/deploy.yml (Vercel deploy on main merge + supabase db push
           to staging), branch protection rules (require CI pass + 1 review)
    status: pending

[ ] TICKET-032: Beta onboarding flow + welcome email sequence (self-dogfooding)
    branch: feat/ticket-032-onboarding
    PR: (to be opened)
    deps: TICKET-022, TICKET-003
    effort: 2 days
    scope: Post-signup onboarding wizard (workspace setup → invite team → import contacts
           → configure email), welcome email sequence (3-step: welcome/getting-started/
           check-in), self-host via Flowlyst sequence feature (dogfooding test)
    status: pending
```

---

## Phase 2 Tickets (Weeks 11–18)

> To be detailed after Phase 1 retrospective

```
[ ] TICKET-033: Sequence builder UI (reactflow visual editor) | status: pending
[ ] TICKET-034: Sequence processor Edge Function + enrollment logic | status: pending
[ ] TICKET-035: BYOS SES configuration (encrypted credentials via Supabase Vault) | status: pending
[ ] TICKET-036: Domain verification wizard (guided DNS record setup) | status: pending
[ ] TICKET-037: PWA push notifications (VAPID, service worker, subscription management) | status: pending
[ ] TICKET-038: Stripe billing integration (subscription plans + feature gating) | status: pending
[ ] TICKET-039: Zapier webhook integration (outbound events) | status: pending
[ ] TICKET-040: Public API + API key management | status: pending
```

---

## Ticket Status Legend
```
[ ] pending           — not started
[~] in-progress       — actively being worked
[R] changes-requested — PR needs revision
[Q] qa-ready          — PR approved, awaiting QA
[x] deployed          — merged to main and live
```

## PR Checklist (attach to every PR description)
```
## PR Checklist
- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user-facing fields (Zod)
- [ ] Error handling on all async operations (try/catch + user-facing error state)
- [ ] No N+1 queries (use select with include, or batch)
- [ ] Follows architecture in ARCHITECTURE.md
- [ ] Tests added (Vitest unit / Playwright E2E for critical paths)
- [ ] Mobile responsive (tested at 375px width)
- [ ] DB migration note (if schema changed)
- [ ] Screenshot or recording attached (if UI change)
```
