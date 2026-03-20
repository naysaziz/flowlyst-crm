const fs = require('fs');
const path = require('path');

const cleanSql = fs.readFileSync(
  path.join(__dirname, 'migrations/20260318151605_init_schema_full2.sql'),
  'utf8'
);

const tableRegex = /CREATE TABLE "([^"]+)"/g;
const tables = [];
let match;
while ((match = tableRegex.exec(cleanSql)) !== null) {
  tables.push(match[1]);
}

const workspaceIdTables = [];
const noWorkspaceIdTables = [];
for (const table of tables) {
  const start = cleanSql.indexOf(`CREATE TABLE "${table}"`);
  if (start === -1) continue;
  let end = cleanSql.indexOf(';', start);
  let block = cleanSql.substring(start, end);
  if (block.includes('workspace_id')) {
    workspaceIdTables.push(table);
  } else {
    noWorkspaceIdTables.push(table);
  }
}

let output = '';
// Policies for tables with workspace_id (excluding workspaces already done)
for (const table of workspaceIdTables) {
  if (table === 'workspaces') continue;
  output += `-- Policy for ${table}\n`;
  output += `CREATE POLICY "Workspace members can manage ${table}" ON public."${table}"\n`;
  output += `  FOR ALL USING (workspace_id = ANY(user_workspace_ids())) WITH CHECK (workspace_id = ANY(user_workspace_ids()));\n\n`;
}

// Policies for join tables
for (const table of noWorkspaceIdTables) {
  if (table === 'workspaces') continue;
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

console.log(output);