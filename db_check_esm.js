
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data, error } = await supabase.from('products').select('*').limit(1);
if (error) {
  console.error("Error:", error);
} else {
  console.log("Columns:", Object.keys(data[0]));
  console.log("Sample:", data[0]);
}
