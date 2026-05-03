import pg from 'pg';
const { Client } = pg;

// Using the direct pooler connection (port 6543 for transaction mode, or 5432 for session mode)
const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.vcqyqgnvhknsduvmptbv',
  password: 'M13579asar2025@2025',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('✅ Connected to database!');

  // Check current OTP settings
  const res = await client.query(`
    SELECT name, value FROM auth.config 
    WHERE name IN ('mailer_otp_exp', 'otp_exp', 'mailer_autoconfirm')
    ORDER BY name;
  `);
  
  console.log('\n📋 Auth OTP Config:');
  res.rows.forEach(row => console.log(` - ${row.name}: ${row.value}`));

  await client.end();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
