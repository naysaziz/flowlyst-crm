-- supabase/seed.sql — Demo data for Flowlyst CRM
-- Run: supabase db seed
-- Assumes service role key (bypasses RLS)
--
-- BEFORE RUNNING: set SEED_ADMIN_USER_ID to a real auth.users UUID.
-- Get it from: Supabase Dashboard → Authentication → Users → copy user UUID
-- Or pass it as a psql variable: psql -v admin_user_id="<uuid>" -f seed.sql
-- If left as null, workspace_members row is skipped (workspace exists but has no owner).

-- Create demo workspace
DO $$
DECLARE
  ws_id uuid := gen_random_uuid();
  pipe_id uuid := gen_random_uuid();
  -- Set this to a real auth.users UUID before seeding, or leave null to skip member row
  admin_user_id uuid := NULL;
BEGIN
  -- Workspace (always inserted — no user dependency)
  INSERT INTO public.workspaces (id, slug, name, timezone)
  VALUES (ws_id, 'flowlyst-demo', 'Flowlyst Demo', 'America/Los_Angeles')
  ON CONFLICT (slug) DO NOTHING;

  -- Demo admin member (only if admin_user_id is set)
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.workspace_members (id, workspace_id, user_id, role, joined_at)
    VALUES (gen_random_uuid(), ws_id, admin_user_id, 'owner', now())
    ON CONFLICT DO NOTHING;
  END IF;

  -- Default pipeline
  INSERT INTO public.pipelines (id, workspace_id, name, is_default)
  VALUES (pipe_id, ws_id, 'Sales Pipeline', true);

  -- Pipeline stages
  INSERT INTO public.pipeline_stages (id, pipeline_id, workspace_id, name, position, type, probability, color) VALUES
    (gen_random_uuid(), pipe_id, ws_id, 'New Lead', 1, 'open', 10, '#ef4444'),
    (gen_random_uuid(), pipe_id, ws_id, 'Qualified', 2, 'open', 30, '#f59e0b'),
    (gen_random_uuid(), pipe_id, ws_id, 'Proposal', 3, 'open', 60, '#10b981'),
    (gen_random_uuid(), pipe_id, ws_id, 'Negotiation', 4, 'open', 80, '#3b82f6'),
    (gen_random_uuid(), pipe_id, ws_id, 'Won', 5, 'won', 100, '#10b981'),
    (gen_random_uuid(), pipe_id, ws_id, 'Lost', 6, 'lost', 0, '#ef4444');

  -- Default email config (Flowlyst pool)
  INSERT INTO public.workspace_email_configs (id, workspace_id, mode)
  VALUES (gen_random_uuid(), ws_id, 'flowlyst_pool');
END $$;

-- After running seed: INSERT INTO project_config (project_ref) VALUES ('your-project-ref'); -- Get ref from Supabase dashboard URL