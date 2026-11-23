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

if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(dbUrl);
const SYNC_KEY = 'simaha_papua_production';

async function check() {
  const rows = await sql`SELECT payload, version, updated_at FROM simaha_cloud_sync WHERE key = ${SYNC_KEY} LIMIT 1;`;
  if (rows.length === 0) {
    console.log('No data found');
    return;
  }
  const p = rows[0].payload;
  console.log('--- CLOUD DB STATUS ---');
  console.log('Version:', rows[0].version);
  console.log('Updated At:', rows[0].updated_at);
  console.log('Users:', p.users?.length, p.users?.map(u => `${u.username} (${u.role})`));
  console.log('Guests:', p.guests?.length);
  console.log('Groups:', p.groups?.length);
  console.log('Reservations:', p.reservations?.length);
  console.log('Room Assignments:', p.roomAssignments?.length);
  console.log('Checkins:', p.checkins?.length);
  console.log('Checkouts:', p.checkouts?.length);
  console.log('Invoices:', p.invoices?.length);
  console.log('Invoice Items:', p.invoiceItems?.length);
  console.log('Payments:', p.payments?.length);
  console.log('Housekeeping Tasks:', p.housekeepingTasks?.length);
  console.log('Maintenance Requests:', p.maintenanceRequests?.length);
  console.log('Notifications:', p.notifications?.length);
  console.log('Audit Logs:', p.auditLogs?.length);
  console.log('Non-AVAILABLE Rooms:', p.rooms?.filter(r => r.status !== 'AVAILABLE').map(r => `${r.room_number}:${r.status}`));
  console.log('Facilities:', p.facilities?.length, p.facilities?.map(f => f.name));
  console.log('Rates:', p.rates?.length, p.rates?.map(r => r.name));
}

check().catch(console.error);
