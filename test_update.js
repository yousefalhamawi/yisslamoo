
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const productId = '14a10827-10d0-4b9a-b8bb-40a91ce5ee46';
  
  console.log("Updating stock to 42 for product:", productId);
  const { data: updateData, error: updateError } = await supabase
    .from('products')
    .update({ stock: 42 })
    .eq('id', productId);
    
  if (updateError) {
    console.error("Update Error:", updateError);
  } else {
    console.log("Update succeeded.");
  }
  
  const { data: selectData, error: selectError } = await supabase
    .from('products')
    .select('id, name, stock')
    .eq('id', productId)
    .single();
    
  if (selectError) {
    console.error("Select Error:", selectError);
  } else {
    console.log("Fetched product after update:", selectData);
  }
}

runTest();
