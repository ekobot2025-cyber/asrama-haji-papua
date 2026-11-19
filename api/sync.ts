import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ 
      success: false, 
      message: 'DATABASE_URL is not configured in server environment' 
    });
  }

  const sql = neon(databaseUrl);
  const SYNC_KEY = 'simaha_papua_production';

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT payload, updated_at, version 
        FROM simaha_cloud_sync 
        WHERE key = ${SYNC_KEY}
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return res.status(200).json({
          success: true,
          exists: false,
          payload: null,
          message: 'No cloud state found yet'
        });
      }

      return res.status(200).json({
        success: true,
        exists: true,
        payload: rows[0].payload,
        updated_at: rows[0].updated_at,
        version: rows[0].version
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { payload } = body;

      if (!payload) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing "payload" in request body' 
        });
      }

      const rows = await sql`
        INSERT INTO simaha_cloud_sync (key, payload, updated_at, version)
        VALUES (${SYNC_KEY}, ${JSON.stringify(payload)}, NOW(), 1)
        ON CONFLICT (key) DO UPDATE
        SET payload = EXCLUDED.payload,
            updated_at = NOW(),
            version = simaha_cloud_sync.version + 1
        RETURNING updated_at, version;
      `;

      return res.status(200).json({
        success: true,
        message: 'Cloud state synchronized successfully',
        updated_at: rows[0]?.updated_at,
        version: rows[0]?.version
      });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Sync API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Database Error', 
      error: error.message 
    });
  }
}
