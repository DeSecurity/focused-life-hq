/**
 * Test Supabase connection
 * This file can be imported in the browser console or used for debugging
 */

import { supabase } from './lib/supabase';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment Variables:');
  console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set (length: ' + supabaseKey.length + ')' : '✗ Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('\n✗ Environment variables are missing!');
    console.log('Make sure your .env file is in the project root and you\'ve restarted the dev server.');
    return false;
  }
  
  // Test Supabase client
  try {
    console.log('\nTesting Supabase client...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('  Session check:', error.message);
    } else {
      console.log('  Session check: ✓ Connected');
      console.log('  Current user:', data.session?.user?.email || 'Not logged in');
    }
    
    // Test database connection (this will fail if table doesn't exist, which is OK)
    console.log('\nTesting database connection...');
    const { error: dbError } = await supabase
      .from('user_data')
      .select('id')
      .limit(1);
    
    if (dbError) {
      if (dbError.code === 'PGRST116' || dbError.message.includes('relation') || dbError.message.includes('does not exist')) {
        console.log('  Database: ⚠ Table "user_data" does not exist yet');
        console.log('  This is normal if you haven\'t run the SQL setup yet.');
        console.log('  See SUPABASE_SETUP.md for instructions.');
      } else {
        console.error('  Database error:', dbError.message);
        return false;
      }
    } else {
      console.log('  Database: ✓ Connected and table exists');
    }
    
    console.log('\n✅ Supabase connection test completed!');
    return true;
  } catch (error: any) {
    console.error('\n✗ Error testing Supabase:', error.message);
    return false;
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}

