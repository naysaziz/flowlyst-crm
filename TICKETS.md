# TICKETS.md

## Phase 1

- [!] TICKET-004: middleware/workspace (feat/ticket-004-middleware) PR #2 — blocked (review-loops: 3)
  Fixes applied:
  1. Security regression fixed: error handling no longer bypasses auth guard.
  2. Workspace slug validation added (alphanumeric, hyphens, underscores, length <= 32).
  3. File conflict resolved: root-level TICKETS.md retained as status tracker; .specs/TICKETS.md updated.
  Previously resolved issues:
  - Route protection logic fixed
  - Cookie preservation on redirect fixed
  - Test coverage added for workspace slug header and cookie handling