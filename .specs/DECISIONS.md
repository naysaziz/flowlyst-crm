# DECISIONS.md — Flowlyst CRM & Email Automation Platform

Architecture Decision Records (ADRs) for Flowlyst.  
Format: Decision | Status | Date | Rationale | Alternatives Rejected

---

## ADR-001: Database — Supabase over AWS RDS

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Use Supabase (managed PostgreSQL) as primary database.

**Rationale:**
- Auth+DB+Storage+Realtime+Edge Functions bundled — eliminates 4 separate services
- `auth.uid()` available in RLS policies natively — zero wiring for multi-tenant isolation
- Free tier (500MB) covers early development; Pro ($25/mo) covers launch
- Supabase is open-source Postgres — no proprietary extensions; can self-host or migrate to RDS later
- Developer velocity: `supabase db push` migrations, TypeScript type generation, Studio UI

**Alternatives rejected:**
- AWS RDS PostgreSQL: No integrated auth/RLS, no Realtime, no Storage, requires separate Lambda for jobs
- PlanetScale (MySQL): No RLS, no PostgreSQL, limited Supabase Auth compatibility
- Firebase Firestore: NoSQL limits complex queries; no true relational joins for CRM data

---

## ADR-002: Auth — Supabase Auth over Auth0/Clerk/NextAuth

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Use Supabase Auth for all authentication.

**Rationale:**
- 50,000 MAU free — reaches $15K MRR before incurring auth costs
- Google OAuth supported out of the box (dashboard config, not code)
- JWT custom claims hook allows injecting workspace_ids without DB round-trips
- RLS policies use `auth.uid()` directly — no adapter layer
- Magic link and OTP included

**Alternatives rejected:**
- Auth0: $240+/mo at scale, external service, JWT requires custom RLS integration
- Clerk: $25+/mo, beautiful DX but not RLS-native, another external vendor
- NextAuth.js: Great for simple auth but requires own session store; no built-in RLS bridge

---

## ADR-003: Email Sending — Amazon SES v2 over SendGrid/Mailchimp

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Amazon SES v2 as primary email sending infrastructure, with dual mode (Flowlyst pool + BYOS).

**Rationale:**
- Cost: $0.10/1,000 emails vs. $0.89–$1.25 (SendGrid/Postmark) — 10× cheaper
- Dedicated IP pools available at scale (protects reputation per workspace)
- Native DKIM, SPF, DMARC setup via SES console and SDK
- Bounce/complaint SNS notifications → automated suppression list management
- BYOS model aligns with power-user needs (agency persona) and gives control
- AWS SDK v3 (`@aws-sdk/client-sesv2`) is TypeScript-native

**Alternatives rejected:**
- SendGrid: 10× cost, external vendor lock-in, API less integrated with BYOS model
- Postmark: Transactional-only positioning, expensive, no BYOS
- Mailchimp: Marketing tool, not API-first, wrong audience
- Brevo: Cheaper alternative but API maturity and deliverability reputation less proven

---

## ADR-004: Frontend — Next.js 15 (App Router) over Remix/SvelteKit/Vite SPA

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Next.js 15 with App Router for all frontend.

**Rationale:**
- Vercel deployment is zero-config for Next.js
- App Router enables Server Components (reduces client bundle, faster LCP)
- Edge Middleware for auth/routing at CDN level (no cold start penalty)
- File-system routing scales cleanly with the product's screen count
- Largest ecosystem for auth libraries, UI components, etc.
- PWA support via `@serwist/next`

**Alternatives rejected:**
- Remix: Good DX, but less mature ecosystem; Vercel edge support comparable
- SvelteKit: Smaller ecosystem, team likely less familiar
- Vite SPA (React): No SSR, worse SEO/LCP; more complex routing setup

---

## ADR-005: PWA Push — Web Push API (VAPID) over Firebase/OneSignal

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Native Web Push API with VAPID keys, no third-party push service.

**Rationale:**
- No additional vendor cost or lock-in
- Safari 16.4+ added Web Push support — covers iOS and macOS users
- VAPID key generation once; standard across all browsers (Chrome via FCM, Firefox via Mozilla, Safari via APNs — all handled by browser push service layer)
- Full control over notification payload and delivery
- Simple implementation: `web-push` npm library in Edge Function

**Alternatives rejected:**
- Firebase Cloud Messaging (FCM): Works but adds Google dependency; Safari requires separate APNs integration
- OneSignal: $9+/mo, third-party service, less control over data
- Pusher: More suited for real-time messaging, not push notifications

---

## ADR-006: Background Jobs — pg_cron + Supabase Edge Functions over Redis/BullMQ

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Use pg_cron for scheduling and Supabase Edge Functions for job execution in Phase 1.

**Rationale:**
- Zero additional infrastructure (no Redis, no separate job server)
- `email_queue` table serves as durable queue — survives Edge Function crashes
- pg_cron available on Supabase Pro with `pg_net` extension for HTTP calls
- Edge Functions co-located with database — low latency for DB queries
- At 10M+ emails/mo, can introduce SQS + Lambda workers without schema changes

**Alternatives rejected:**
- Redis + BullMQ: Requires separate Redis instance (~$15/mo), more operational complexity
- Temporal.io: Overkill for Phase 1; consider at $500K+ ARR
- AWS Lambda + EventBridge: Disconnects job logic from DB; adds IAM complexity

---

## ADR-007: Styling — Tailwind CSS + shadcn/ui over MUI/Chakra/Ant Design

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** Tailwind CSS for utility styling, shadcn/ui for components (copy-paste, not a package).

**Rationale:**
- shadcn/ui components are owned code (not a dependency) — fully customizable
- Built on Radix UI primitives — accessible by default (WCAG 2.1 AA)
- Tailwind enables consistent spacing/color system without CSS overhead
- Next.js + Tailwind is the dominant 2026 stack; best hiring market fit
- Dark mode trivial to implement with `next-themes` + Tailwind `dark:` variant

**Alternatives rejected:**
- Material UI: Heavy bundle, Google-look aesthetic conflicts with custom brand
- Chakra UI: Good but less control than shadcn; slower
- Ant Design: Enterprise aesthetic, heavy, poor tree-shaking

---

## ADR-008: State Management — Zustand + TanStack Query over Redux/SWR/Jotai

**Status:** Accepted  
**Date:** 2026-03-17  
**Decision:** TanStack Query v5 for server state; Zustand v5 for client/UI state.

**Rationale:**
- TanStack Query handles caching, background refetch, optimistic updates, pagination — built for CRM data patterns
- Zustand is minimal (2KB), simple API, TypeScript-first; replaces Redux for UI state (sidebar open, selected items, modal state)
- Combined: covers 100% of state needs without Redux boilerplate
- React Query v5 has native Suspense support, aligning with React 19 patterns

**Alternatives rejected:**
- Redux Toolkit: Excellent but verbose; unnecessary overhead for this scale
- SWR: Less featured than TanStack Query (no mutations, less cache control)
- Jotai: Fine for atoms but TanStack Query is more purpose-built for server state

---

*ADRs will be added as new technical decisions are made during development.*
