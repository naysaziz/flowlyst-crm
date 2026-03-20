const fs = require('fs');
const path = require('path');

// Read generated SQL from prisma migrate diff
const generated = fs.readFileSync(
  path.join(__dirname, 'migrations/20260318151605_init_schema_full.sql'),
  'utf8'
);

// Extract table names from CREATE TABLE statements
const tableMatches = generated.match(/CREATE TABLE "([^"]+)"/g);
const tables = tableMatches ? tableMatches.map(m => m.slice(13, -1).replace(/"/g, '')) : [];
console.log('Found tables:', tables);

// Build new migration
let migration = `-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

`;

// Add generated SQL (enums and tables)
migration += generated + '\n\n';

// RLS helper function
migration += `-- RLS helper function
CREATE OR REPLACE FUNCTION public.user_workspace_ids()
RETURNS uuid[] AS $$
  SELECT array_agg(DISTINCT wm.workspace_id)::uuid[]
  FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

`;

// Enable RLS on each table
for (const table of tables) {
  migration += `ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;\n`;
}
migration += '\n';

// Create RLS policies for tables that have workspace_id column
// We'll need to know which tables have workspace_id. Let's assume all except workspace_members? Actually many have.
// We'll create a simple policy: USING (workspace_id = ANY(user_workspace_ids()))
// For tables without workspace_id, we need different policy (e.g., workspace_members, workspace_invites).
// Let's create generic: if table has workspace_id column, use that; else if table references workspace via foreign key? 
// For simplicity, we'll manually list tables with workspace_id.
// Let's parse from generated SQL to find column definitions.
// For now, we'll skip and add later manually.
// We'll just add placeholder.

migration += `-- RLS policies (to be completed)\n`;
migration += `-- For each table with workspace_id, add policy:\n`;
migration += `-- CREATE POLICY "<policy_name>" ON public.<table>\n`;
migration += `--   FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));\n\n`;

// Helper function for pg_cron
migration += `-- Helper functions (e.g., for pg_cron)
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS void AS $$
BEGIN
  -- Dequeue and send emails via SES Edge Function trigger
  PERFORM net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/email-sender',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.current_jwt', true)),
    body := jsonb_build_object('batch_size', 14)
  );
END;
$$ LANGUAGE plpgsql;

`;

// pg_cron jobs
migration += `-- pg_cron jobs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');

`;

// Write final migration
const outputPath = path.join(__dirname, 'migrations/20260318151605_init_schema.sql');
fs.writeFileSync(outputPath, migration);
console.log(`Written to ${outputPath}`);