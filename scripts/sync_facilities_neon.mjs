import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  // Read from .env if present
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      dbUrl = match[1];
    }
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL is not set and could not be read from .env');
  process.exit(1);
}

const sql = neon(dbUrl);
const SYNC_KEY = 'simaha_papua_production';

async function main() {
  console.log('Fetching current cloud state...');
  const rows = await sql`
    SELECT payload, version, updated_at
    FROM simaha_cloud_sync
    WHERE key = ${SYNC_KEY}
    LIMIT 1;
  `;

  if (rows.length === 0) {
    console.log('No rows found for', SYNC_KEY);
    return;
  }

  const payload = rows[0].payload;
  console.log('Existing facilities count:', payload.facilities?.length);

  // Filter facilities
  const prunedFacilityIds = ['fac-02', 'fac-03', 'fac-06'];
  if (Array.isArray(payload.facilities)) {
    payload.facilities = payload.facilities
      .filter(f => !prunedFacilityIds.includes(f.id) && !f.name.toLowerCase().includes('asmat') && !f.name.toLowerCase().includes('sentani') && !f.name.toLowerCase().includes('ruang makan'))
      .map(f => {
        if (f.id === 'fac-01' || (f.name.toLowerCase().includes('aula') && !f.name.toLowerCase().includes('pernikahan'))) {
          return {
            ...f,
            name: 'Aula (Kegiatan Umum)',
            daily_rate: 3900000,
            rate_unit: 'PER_DAY',
            image_url: '/images/aula-1.png'
          };
        }
        if (f.id === 'fac-01-wedding' || f.name.toLowerCase().includes('pernikahan')) {
          return {
            ...f,
            name: 'Aula (Acara Pernikahan)',
            daily_rate: 5000000,
            rate_unit: 'PER_DAY',
            image_url: '/images/aula-2.png'
          };
        }
        return f;
      });
  }

  // Filter rates
  if (Array.isArray(payload.rates)) {
    payload.rates = payload.rates.filter(r => r.id !== 'rate-04' && r.target_id !== 'fac-02' && !r.name.toLowerCase().includes('asmat'));
  }

  const newVersion = (rows[0].version || 1) + 1;
  const now = new Date().toISOString();

  await sql`
    UPDATE simaha_cloud_sync
    SET payload = ${JSON.stringify(payload)},
        version = ${newVersion},
        updated_at = ${now}
    WHERE key = ${SYNC_KEY};
  `;

  console.log('Successfully updated Neon DB simaha_cloud_sync to version', newVersion);
  console.log('Updated facilities:');
  payload.facilities.forEach(f => console.log(`- [${f.id}] ${f.name} (rate: Rp ${f.daily_rate}, image: ${f.image_url})`));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
