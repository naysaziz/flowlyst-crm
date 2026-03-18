-- Seed.sql for Flowlyst CRM
-- Create admin workspace and user (assume Supabase Auth admin user created in dashboard)

INSERT INTO public.workspaces (slug, name) VALUES ('flowlyst-admin', 'Flowlyst Admin') 
ON CONFLICT (slug) DO NOTHING;

-- Note: Create workspace_member for auth.uid() manually or via dashboard for initial admin