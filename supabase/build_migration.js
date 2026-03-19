const fs = require('fs');
const path = require('path');

const cleanSql = fs.readFileSync(
  path.join(__dirname, 'migrations/20260318151605_init_schema_full2.sql'),
  'utf8'
);

// Extract table names from CREATE TABLE statements
const tableRegex = /CREATE TABLE "([^"]+)"/g;
const tables = [];
let match;
while ((match = tableRegex.exec(cleanSql)) !== null) {
  tables.push(match[1]);
}
console.log('Tables:', tables);

// Determine which tables have workspace_id column by scanning column definitions
const workspaceIdTables = [];
const noWorkspaceIdTables = [];
for (const table of tables) {
  // Find CREATE TABLE block for this table (simplistic)
  const start = cleanSql.indexOf(`CREATE TABLE "${table}"`);
  if (start === -1) continue;
  let end = cleanSql.indexOf(';', start);
  let block = cleanSql.substring(start, end);
  // Check if block contains "workspace_id"
  if (block.includes('workspace_id')) {
    workspaceIdTables.push(table);
  } else {
    noWorkspaceIdTables.push(table);
  }
}

console.log('Tables with workspace_id:', workspaceIdTables);
console.log('Tables without workspace_id:', noWorkspaceIdTables);

// Build final migration
let output = `-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

`;

output += cleanSql + '\n\n';

// RLS helper function
output += `-- RLS helper function
CREATE OR REPLACE FUNCTION public.user_workspace_ids()
RETURNS uuid[] AS $$
  SELECT array_agg(DISTINCT wm.workspace_id)::uuid[]
  FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

`;

// Enable RLS on each table
for (const table of tables) {
  output += `ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;\n`;
}
output += '\n';

// Create RLS policies for tables with workspace_id
for (const table of workspaceIdTables) {
  // Skip workspaces table because we need policy using id = ANY(user_workspace_ids())
  if (table === 'workspaces') {
    output += `-- Workspaces policy: users can see workspaces they are a member of\n`;
    output += `CREATE POLICY "Workspace members can manage workspaces" ON public.workspaces\n`;
    output += `  FOR ALL USING (id = ANY(user_workspace_ids())) WITH CHECK (id = ANY(user_workspace_ids()));\n\n`;
  } else {
    output += `-- Policy for ${table}\n`;
    output += `CREATE POLICY "Workspace members can manage ${table}" ON public."${table}"\n`;
    output += `  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));\n\n`;
  }
}

// Policies for tables without workspace_id (join tables)
// contact_list_members: join between contact_lists (workspace_id) and contacts (workspace_id)
// We'll allow if the user has access to the list's workspace.
for (const table of noWorkspaceIdTables) {
  if (table === 'contact_list_members') {
    output += `-- Policy for contact_list_members\n`;
    output += `CREATE POLICY "Workspace members can manage contact_list_members" ON public."${table}"\n`;
    output += `  FOR ALL USING (EXISTS (\n`;
    output += `    SELECT 1 FROM public.contact_lists cl\n`;
    output += `    WHERE cl.id = list_id AND cl.workspace_id = ANY(user_workspace_ids())\n`;
    output += `  )) WITH CHECK (EXISTS (\n`;
    output += `    SELECT 1 FROM public.contact_lists cl\n`;
    output += `    WHERE cl.id = list_id AND cl.workspace_id = ANY(user_workspace_ids())\n`;
    output += `  ));\n\n`;
  } else if (table === 'deal_contacts') {
    output += `-- Policy for deal_contacts\n`;
    output += `CREATE POLICY "Workspace members can manage deal_contacts" ON public."${table}"\n`;
    output += `  FOR ALL USING (EXISTS (\n`;
    output += `    SELECT 1 FROM public.deals d\n`;
    output += `    WHERE d.id = deal_id AND d.workspace_id = ANY(user_workspace_ids())\n`;
    output += `  )) WITH CHECK (EXISTS (\n`;
    output += `    SELECT 1 FROM public.deals d\n`;
    output += `    WHERE d.id = deal_id AND d.workspace_id = ANY(user_workspace_ids())\n`;
    output += `  ));\n\n`;
  } else {
    output += `-- TODO: Add RLS policy for ${table}\n`;
  }
}

// Helper function for pg_cron (placeholder)
output += `-- Helper functions (e.g., for pg_cron)
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
output += `-- pg_cron jobs
SELECT cron.schedule('email-queue-processor', '* * * * *', 'SELECT process_email_queue();');

`;

const finalPath = path.join(__dirname, 'migrations/20260318151605_init_schema.sql');
fs.writeFileSync(finalPath, output);
console.log(`Final migration written to ${finalPath}`);