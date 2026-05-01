/**
 * Quick Supabase Connection Check
 * Simple Node.js script to verify Supabase connection
 * Works with both .env and .env.local files
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env from both .env and .env.local
function loadEnv() {
  const env = {};
  
  // Try .env
  try {
    const content = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch {}
  
  // Try .env.local (overrides .env)
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch {}
  
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Supabase Connection Check\n');
console.log('='.repeat(50));

// Check configuration
if (!url) {
  console.log('❌ VITE_SUPABASE_URL: Missing');
} else {
  console.log(`✅ VITE_SUPABASE_URL: ${url.substring(0, 30)}...`);
}

if (!key) {
  console.log('❌ VITE_SUPABASE_ANON_KEY: Missing');
} else {
  console.log(`✅ VITE_SUPABASE_ANON_KEY: ***${key.slice(-10)}`);
}

if (!url || !key) {
  console.log('\n❌ Configuration incomplete. Please check your .env.local file.');
  process.exit(1);
}

// Test connection
console.log('\n🌐 Testing connection...\n');

try {
  const testUrl = new URL(url);
  const healthUrl = `${testUrl.origin}/rest/v1/`;
  
  const response = await fetch(healthUrl, {
    method: 'GET',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.ok || response.status === 401 || response.status === 404) {
    console.log('✅ Connection successful!');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log('\n🎉 Your Supabase backend is connected!');
    console.log('\n💡 Tip: Test in browser at http://localhost:5173/test-connection');
  } else {
    console.log(`⚠️  Unexpected response: ${response.status}`);
    console.log('   Connection may still work, but check your configuration.');
  }
} catch (error) {
  console.log('❌ Connection failed!');
  console.log(`   Error: ${error.message}`);
  console.log('\nPlease check:');
  console.log('  1. Your internet connection');
  console.log('  2. Supabase URL is correct');
  console.log('  3. Supabase project is active');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');

