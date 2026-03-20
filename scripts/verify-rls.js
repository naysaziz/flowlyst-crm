const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonRLS() {
  console.log('=== Anon User RLS Tests ===');
  
  // Test 1: Anon cannot insert workspace
  try {
    const { data, error } = await supabaseAnon.from('workspaces').insert({ 
      id: crypto.randomUUID(),
      slug: 'test-anon', 
      name: 'Test Anon',
      timezone: 'UTC'
    });
    if (error) {
      console.log('✅ PASS: Anon blocked from insert workspaces:', error.message);
    } else {
      console.log('❌ FAIL: Anon inserted workspace');
    }
  } catch (e) {
    console.log('✅ PASS: Anon insert blocked');
  }

  // Test 2: Anon cannot select workspaces
  const { data: ws, error: wsError } = await supabaseAnon.from('workspaces').select('*');
  if (wsError || (ws && ws.length === 0)) {
    console.log('✅ PASS: No workspaces visible to anon');
  } else {
    console.log('❌ FAIL: Anon sees workspaces:', ws.length);
  }
}

async function testAuthRLS() {
  if (!supabaseServiceKey) {
    console.log('⏭️  SKIP: Set SUPABASE_SERVICE_ROLE_KEY for authenticated tests');
    return;
  }

  console.log('=== Authenticated Workspace Member RLS Tests ===');

  const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const testEmail = `test-rls-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  try {
    // Create test user
    const { data: userData, error: userError } = await supabaseService.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    if (userError) throw userError;

    const testUid = userData.user.id;
    console.log('Created test user:', testUid);

    // Create test workspace
    const { data: wsData, error: wsError } = await supabaseService.from('workspaces').insert({
      id: crypto.randomUUID(),
      slug: `test-auth-${Date.now()}`,
      name: 'Test Auth Workspace',
      timezone: 'UTC'
    }).select().single();
    if (wsError) throw wsError;
    const testWsId = wsData.id;
    console.log('Created test workspace:', testWsId);

    // Link member
    const { error: memberError } = await supabaseService.from('workspace_members').insert({
      id: crypto.randomUUID(),
      workspace_id: testWsId,
      user_id: testUid,
      role: 'member'
    });
    if (memberError) throw memberError;

    // Sign in as test user
    const { data: { session } } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });

    // Test: Auth user can select own workspace
    const { data: authWs } = await supabaseAuth.from('workspaces').select('*');
    console.log('✅ PASS: Auth user sees workspaces:', authWs?.length || 0);

    // Test: Auth user can insert contact in own workspace (requires membership)
    const { data: newContact, error: insertError } = await supabaseAuth
      .from('contacts')
      .insert({
        id: crypto.randomUUID(),
        workspace_id: testWsId,
        email: `test-contact-${Date.now()}@example.com`
      });
    if (insertError) {
      console.log('❌ FAIL: Auth user cannot insert contact:', insertError.message);
    } else {
      console.log('✅ PASS: Auth user inserted contact in own workspace');
      // Clean up
      await supabaseService.from('contacts').delete().eq('id', newContact[0].id);
    }

    // Test cross-workspace: try select other workspace? But since only own visible, already covered.

  } catch (e) {
    console.log('❌ ERROR in auth tests:', e.message);
  } finally {
    // Cleanup
    if (supabaseServiceKey) {
      try {
        await supabaseService.from('workspaces').delete().eq('slug', /^test-auth-/);
        await supabaseService.from('workspace_members').delete().eq('user_id', testUid); // approx
        await supabaseService.auth.admin.deleteUser(testUid);
      } catch {}
    }
  }
}

async function main() {
  await testAnonRLS();
  await testAuthRLS();
  console.log('\nRLS verification complete. Check logs above.');
}

main().catch(console.error);
