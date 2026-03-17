# ARCHITECTURE.md — Flowlyst CRM & Email Automation Platform

**Last updated:** 2026-03-17  
**Status:** Initial — Derived from PRD-flowlyst-crm.md §7  
**Full architecture detail:** See PRD-flowlyst-crm.md sections 7, 8, 10, 11, 12, 13

---

## Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| State: Server | TanStack React Query | v5 |
| State: Client | Zustand | v5 |
| Auth | Supabase Auth (email + Google OAuth) | v2 |
| Database | PostgreSQL via Supabase | 15.x |
| Realtime | Supabase Realtime | - |
| File Storage | Supabase Storage | - |
| Background Jobs | Supabase Edge Functions + pg_cron | - |
| Email Sending | Amazon SES v2 API | - |
| PWA Push | Web Push API (VAPID) | - |
| Frontend Deploy | Vercel | - |
| Backend Deploy | Supabase Cloud | - |
| CI/CD | GitHub Actions | - |
| Testing | Vitest + Playwright | - |

---

## Key Architectural Decisions

> Full justifications in PRD §7 and §13

1. **Supabase over AWS RDS** — Auth+DB+Storage+Realtime+Edge Functions bundled; RLS-native; zero DevOps overhead
2. **Supabase Auth over Auth0/Clerk** — Free 50K MAU; RLS via `auth.uid()` with zero wiring; Google OAuth in 15 min
3. **Amazon SES v2 over SendGrid/Mailchimp** — $0.10/1K emails (vs $0.80–1.25); BYOS model; DKIM/SPF/DMARC native
4. **Web Push (VAPID) over Firebase/OneSignal** — No vendor lock-in; Safari 16.4+ supported; free
5. **Vercel for Next.js** — Native deployment; edge middleware; preview deployments per PR
6. **pg_cron + Edge Functions** — Co-located with DB; no Redis/BullMQ needed at Phase 1 scale

---

## Repository Structure (Target)

```
flowlyst-crm/
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Auth routes (login, signup, callback)
│   ├── (app)/                      # Protected app routes
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── deals/
│   │   ├── campaigns/
│   │   ├── sequences/
│   │   └── settings/
│   ├── api/                        # Route handlers
│   │   ├── webhooks/ses/           # SES SNS bounce/complaint handler
│   │   └── t/                      # Tracking pixel + click redirect
│   ├── sw.ts                       # Service worker source
│   └── middleware.ts               # Auth guard + workspace resolution
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── contacts/                   # Contact-specific components
│   ├── deals/                      # Deal/pipeline components
│   ├── campaigns/                  # Campaign builder components
│   ├── sequences/                  # Sequence builder (reactflow)
│   └── shared/                     # Layout, nav, notifications
├── lib/
│   ├── supabase/                   # Supabase client (server + client)
│   ├── ses/                        # SES send logic
│   ├── email/                      # Template rendering, tracking token gen
│   └── validations/                # Zod schemas
├── supabase/
│   ├── migrations/                 # SQL migration files
│   ├── functions/                  # Edge Functions
│   │   ├── email-sender/
│   │   ├── sequence-processor/
│   │   ├── campaign-scheduler/
│   │   └── push-sender/
│   └── seed.sql
├── public/
│   ├── manifest.json
│   └── icons/
├── .github/workflows/              # CI/CD
│   ├── ci.yml                      # Test + lint on PR
│   └── deploy.yml                  # Deploy to Vercel + Supabase on merge to main
└── package.json
```

---

## Data Model Summary

Core tables (full schemas in PRD §8):
- `workspaces` — tenant root
- `workspace_members` — user ↔ workspace join (with roles)
- `workspace_invites` — pending invitations
- `contacts` — with tags[], custom_fields JSONB, unsubscribed/bounced flags
- `contact_lists` — static and dynamic
- `contact_list_members` — join table
- `pipelines` + `pipeline_stages` — configurable deal pipeline
- `deals` — with stage, value, owner, custom fields
- `deal_contacts` — many-to-many
- `activities` — unified timeline for contacts + deals
- `tasks` — reminders linked to contacts/deals
- `campaigns` — with stats columns
- `email_templates` — reusable templates with block JSON
- `email_queue` — durable send queue (pg_cron processor)
- `email_events` — all tracking events (open/click/bounce/complaint)
- `email_tracking_tokens` — short tokens for pixel/click endpoints
- `workspace_email_configs` — SES credentials (via Vault reference)
- `sequences` + `sequence_steps` + `sequence_enrollments`
- `notifications` — in-app
- `push_subscriptions` — VAPID endpoint storage

All tables have RLS enabled. Isolation via `workspace_id = ANY(auth.user_workspace_ids())`.

---

## API Contract Summary

Base: `https://app.flowlyst.app/api/v1`  
Auth: `Authorization: Bearer <supabase_jwt>`  
Full spec: PRD §9

Key endpoints:
- `GET/POST /contacts` — list/create
- `GET/PUT/DELETE /contacts/:id` — detail ops
- `POST /contacts/import` — CSV bulk import
- `GET/POST /deals` — list/create
- `PUT /deals/:id/stage` — move deal stage (triggers automation)
- `GET/POST /campaigns` — list/create
- `POST /campaigns/:id/send` — trigger send (async, returns job_id)
- `GET/POST /sequences` — list/create
- `POST /sequences/:id/activate` — activate sequence
- `POST /sequences/:id/enroll` — manually enroll contacts
- `GET/PUT /workspace/email-config` — SES configuration
- `GET /t/o/:token` — open pixel (public)
- `GET /t/c/:token` — click redirect (public)
- `POST /webhooks/ses` — SES SNS handler (public, SNS-signature validated)

---

*This file will be expanded to full architecture spec after sprint planning.*  
*See PRD-flowlyst-crm.md for complete technical detail.*
