import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export async function executeSecurityFixes(dbUrl: string) {
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20251030_fix_security.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');
    await client.query(sql);
    await client.query('COMMIT;');
  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function checkSecurityStatus(dbUrl: string) {
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    const rls = await client.query(`
      SELECT relrowsecurity FROM pg_class
      JOIN pg_namespace n ON n.oid = pg_class.relnamespace
      WHERE n.nspname='public' AND relname='company_research_cache';
    `);
    const vector = await client.query(`
      SELECT n.nspname FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      WHERE e.extname='vector';
    `);
    return {
      rls_enabled: rls.rows[0]?.relrowsecurity || false,
      vector_schema: vector.rows[0]?.nspname || 'unknown'
    };
  } finally {
    client.release();
    await pool.end();
  }
}