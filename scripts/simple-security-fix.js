// Run: node scripts/simple-security-fix.js
const fs = require('fs');
const { Client } = require('pg');
const path = require('path');

(async () => {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251030_fix_security.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL file not found:', sqlPath);
    process.exit(1);
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Missing DATABASE_URL (service-role connection)');
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString });
  const startTime = new Date();
  
  try {
    await client.connect();
    console.log('🟢 Connected to database');
    
    await client.query('BEGIN;');
    await client.query(sql);
    
    // Log the successful execution to audit table
    const auditDetails = {
      runBy: 'z.ai',
      status: 'success',
      scriptVersion: '20251030',
      executedAt: startTime.toISOString(),
      duration: Date.now() - startTime.getTime(),
      environment: process.env.NODE_ENV || 'development',
      sqlFile: '20251030_fix_security.sql'
    };
    
    await client.query(
      "INSERT INTO extensions.security_fix_audit(details) VALUES ($1)",
      [JSON.stringify(auditDetails)]
    );
    
    await client.query('COMMIT;');
    console.log('✅ Security fixes applied successfully.');
    console.log('📝 Execution logged to audit table.');
  } catch (err) {
    await client.query('ROLLBACK;').catch(() => {});
    
    // Try to log the failure even if the main transaction failed
    try {
      await client.query('BEGIN;');
      const auditDetails = {
        runBy: 'z.ai',
        status: 'error',
        scriptVersion: '20251030',
        executedAt: startTime.toISOString(),
        duration: Date.now() - startTime.getTime(),
        environment: process.env.NODE_ENV || 'development',
        error: err.message,
        sqlFile: '20251030_fix_security.sql'
      };
      
      await client.query(
        "INSERT INTO extensions.security_fix_audit(details) VALUES ($1)",
        [JSON.stringify(auditDetails)]
      );
      await client.query('COMMIT;');
      console.log('📝 Error logged to audit table.');
    } catch (logErr) {
      console.warn('⚠️ Could not log error to audit table:', logErr.message);
    }
    
    console.error('❌ Error applying fixes:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();