
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
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

async function run() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, pricing_mode, price, price_usd, price_syp_manual')
    .order('createdAt', { ascending: false });
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("All products from Supabase:");
    data.forEach(p => {
      console.log(` - [${p.id}] ${p.name}: stock=${p.stock}, mode=${p.pricing_mode}, price=${p.price}, usd=${p.price_usd}, syp_manual=${p.price_syp_manual}`);
    });
  }
}

run();
