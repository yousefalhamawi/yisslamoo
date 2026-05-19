
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually and clean quotes/returns
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const productId = '14a10827-10d0-4b9a-b8bb-40a91ce5ee46';
  
  console.log("Updating stock to 42 with select()...");
  const { data, error } = await supabase
    .from('products')
    .update({ stock: 42 })
    .eq('id', productId)
    .select();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Update select response:", data);
  }
}

runTest();
