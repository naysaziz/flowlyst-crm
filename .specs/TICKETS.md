# TICKETS.md — Flowlyst CRM & Email Automation Platform

**Last updated:** 2026-03-17  
**Status:** Phase 1 Tickets — Populated by lead-arch after PRD review & scaffold init

---

## Phase 1 Tickets (Weeks 1–10)

### Foundation (Sprint 1)
```
[~] TICKET-001: Next.js 15 project scaffold (TS, Tailwind, shadcn/ui, ESLint, Prettier) | branch: feature/ticket-001 | status: in-progress | assignee: eng-coder
[ ] TICKET-002: Supabase project + full DB schema migration (all tables + RLS policies) | branch: feature/ticket-002 | status: pending
[ ] TICKET-003: Supabase Auth — email/password + Google OAuth flows | branch: feature/ticket-003 | status: pending
[ ] TICKET-004: Next.js middleware — auth guard + workspace resolution | branch: feature/ticket-004 | status: pending
[ ] TICKET-005: Core layout — sidebar nav, top bar, workspace switcher | branch: feature/ticket-005 | status: pending
[ ] TICKET-006: PWA manifest + base service worker (offline shell + cache strategies) | branch: feature/ticket-006 | status: pending
```

### Contacts Module (Sprint 2)
```
[ ] TICKET-007: Contact list page — virtual scroll, search, tag filter | branch: feature/ticket-007 | status: pending
[ ] TICKET-008: Contact create/edit form with Zod validation | branch: feature/ticket-008 | status: pending
[ ] TICKET-009: Contact detail page + activity timeline component | branch: feature/ticket-009 | status: pending
[ ] TICKET-010: Tag management (create/rename/delete + contact tagging) | branch: feature/ticket-010 | status: pending
[ ] TICKET-011: CSV import — parse, duplicate detection, import preview | branch: feature/ticket-011 | status: pending
[ ] TICKET-012: Contact lists (static) — create/add/remove contacts | branch: feature/ticket-012 | status: pending
```

### Deals Module (Sprint 3)
```
[ ] TICKET-013: Pipeline Kanban board with @dnd-kit drag-and-drop | branch: feature/ticket-013 | status: pending
[ ] TICKET-014: Deal create/edit form (value, stage, close date, owner) | branch: feature/ticket-014 | status: pending
[ ] TICKET-015: Deal detail page + linked contacts + timeline | branch: feature/ticket-015 | status: pending
[ ] TICKET-016: Pipeline stage management in Settings | branch: feature/ticket-016 | status: pending
[ ] TICKET-017: Activity logging on deal stage changes | branch: feature/ticket-017 | status: pending
```

### Email Campaigns (Sprint 4–5)
```
[ ] TICKET-018: Workspace SES configuration UI + domain verification flow | branch: feature/ticket-018 | status: pending
[ ] TICKET-019: Visual email block builder (header/text/button/image/divider/footer blocks) | branch: feature/ticket-019 | status: pending
[ ] TICKET-020: Campaign create/edit — name, subject, preheader, recipient targeting | branch: feature/ticket-020 | status: pending
[ ] TICKET-021: Variable substitution rendering + {{unsubscribe_link}} enforcement | branch: feature/ticket-021 | status: pending
[ ] TICKET-022: Email queue + pg_cron scheduler + SES send Edge Function | branch: feature/ticket-022 | status: pending
[ ] TICKET-023: Open tracking pixel endpoint + click redirect endpoint | branch: feature/ticket-023 | status: pending
[ ] TICKET-024: SES SNS webhook handler (bounce/complaint/delivery processing) | branch: feature/ticket-024 | status: pending
[ ] TICKET-025: Campaign analytics page (sent/opened/clicked/bounced stats) | branch: feature/ticket-025 | status: pending
```

### Polish & Launch (Sprint 5)
```
[ ] TICKET-026: Tasks module — CRUD, assignment, due reminders | branch: feature/ticket-026 | status: pending
[ ] TICKET-027: In-app notifications — bell icon, dropdown, unread count | branch: feature/ticket-027 | status: pending
[ ] TICKET-028: Team invite flow (send invite → accept → join workspace) | branch: feature/ticket-028 | status: pending
[ ] TICKET-029: Settings pages — workspace, email config, team members | branch: feature/ticket-029 | status: pending
[ ] TICKET-030: Dashboard widgets (pipeline summary, activity feed, tasks due, campaign stats) | branch: feature/ticket-030 | status: pending
[ ] TICKET-031: GitHub Actions CI/CD pipeline → Vercel + Supabase migrations | branch: feature/ticket-031 | status: pending
[ ] TICKET-032: Beta onboarding flow + welcome email sequence (self-dogfooding) | branch: feature/ticket-032 | status: pending
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
[ ] pending        — not started
[~] in-progress    — actively being worked
[R] changes-requested — PR needs revision
[Q] qa-ready       — PR approved, awaiting QA
[x] deployed       — merged to main and live
```
