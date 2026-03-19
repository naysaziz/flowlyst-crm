-- supabase/seed.sql — Demo data for Flowlyst CRM
-- Run: supabase db seed
-- Assumes service role key (bypasses RLS)

-- Create demo workspace
DO $$
DECLARE
  ws_id uuid := gen_random_uuid();
  pipe_id uuid := gen_random_uuid();
  admin_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid; -- Replace with real Supabase Auth user ID (e.g., from dashboard)
BEGIN
  -- Workspace
  INSERT INTO public.workspaces (id, slug, name, timezone)
  VALUES (ws_id, 'flowlyst-demo', 'Flowlyst Demo', 'America/Los_Angeles');

  -- Demo admin member
  INSERT INTO public.workspace_members (id, workspace_id, user_id, role, joined_at)
  VALUES (gen_random_uuid(), ws_id, admin_user_id, 'owner', now());

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