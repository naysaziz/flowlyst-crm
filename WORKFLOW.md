# CRM Dev Workflow - Autonomous Orchestration

## Agent Flow (No Human Input Required)
1. **lead-arch**: Monitors TICKETS.md every heartbeat. Spawns eng-coder for next [ ] ticket.
2. **eng-coder**: Implements, commits/pushes branch, updates TICKET to [~] → [pr-ready].
3. **lead-arch**: Auto-reviews PR (Sonnet reasoning), approves or [R] feedback.
4. **qa-tester**: E2E/unit tests, browser validation; [qa-pass] or [qa-fail].
5. **ops-deploy**: Merges PR, local npm run dev/deploy test, updates [x].

## Autonomy Triggers
- **Heartbeat**: Check TICKETS.md; spawn next agent if idle >30min.
- **Blocks [!]**: Telegram alert to Aziz.
- **Done Phase**: Morning briefing summary.

## No Hallucinations
- All actions from TICKETS.md/PRD/ARCHITECTURE.md.
- Tools only: exec/read/write/edit/sessions_spawn.
- Log every step to memory/YYYY-MM-DD.md.

Updated: 2026-03-17 by Clio