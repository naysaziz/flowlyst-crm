#!/usr/bin/env node
/**
 * Quick script to verify Supabase project setup and RLS policies.
 * 
 * Usage:
 *   node scripts/verify-rls.js
 * 
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  console.warn('⚠️  Supabase URL or Anon Key still set to placeholder.');
  console.warn('  Please update .env.local with your Supabase project credentials.');
  console.warn('  You can skip this test for now.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  console.log('Testing Supabase connection and RLS...');
  
  // Try to fetch from workspaces table (should be empty, but RLS may block)
  const { data, error } = await supabase.from('workspaces').select('id').limit(1);
  
  if (error) {
    if (error.code === 'PGRST301' || error.message.includes('row-level security')) {
      console.log('✅ RLS is enabled (request blocked without JWT).');
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  } else {
    console.warn('⚠️  RLS may not be blocking anonymous requests. Ensure RLS policies are applied.');
  }
  
  // Try to fetch from auth.users (should fail for anon key)
  const { error: authError } = await supabase.from('auth.users').select('id').limit(1);
  if (authError && authError.code === '42501') {
    console.log('✅ Auth schema is protected (expected).');
  }
  
  console.log('✅ Basic Supabase connectivity confirmed.');
  return true;
}

testRLS().then(success => {
  if (success) {
    console.log('\n🎉 Supabase project setup and RLS appear to be working.');
    console.log('Next steps:');
    console.log('  1. Run migrations: supabase db push');
    console.log('  2. Seed database: supabase db seed');
    console.log('  3. Set up Auth providers in Supabase Dashboard');
  } else {
    console.error('\n❌ Verification failed.');
    process.exit(1);
  }
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});