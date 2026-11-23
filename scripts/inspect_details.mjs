import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) dbUrl = match[1];
  }
}

const sql = neon(dbUrl);
const SYNC_KEY = 'simaha_papua_production';

async function checkDetails() {
  const rows = await sql`SELECT payload FROM simaha_cloud_sync WHERE key = ${SYNC_KEY} LIMIT 1;`;
  const p = rows[0].payload;
  console.log('Guest:', JSON.stringify(p.guests, null, 2));
  console.log('Reservation:', JSON.stringify(p.reservations, null, 2));
  console.log('Invoice:', JSON.stringify(p.invoices, null, 2));
}

checkDetails().catch(console.error);
