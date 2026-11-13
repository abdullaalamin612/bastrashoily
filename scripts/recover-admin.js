#!/usr/bin/env node
/**
 * BASTRA SHOILY - Production Admin Account Recovery Script
 * 
 * Safely recovers or updates the master super admin account in the verified SQLite database.
 * - Operates ONLY on the single existing super admin account (admin-1).
 * - Never creates duplicate admin accounts.
 * - Preserves all orders, products, customers, payments, inventory, and audit logs intact.
 * - Unlocks any temporary rate-limiting locks from failed password attempts.
 * - Flushes SQLite WAL checkpoint for persistent durability.
 * - Never logs or exposes plain passwords or password hashes.
 * 
 * Usage:
 *   node scripts/recover-admin.js "<new_password>"
 * Or via environment variable:
 *   ADMIN_RECOVERY_PASSWORD="<new_password>" node scripts/recover-admin.js
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'bastra_shoily.sqlite');

const newPassword = (process.argv[2] || process.env.ADMIN_RECOVERY_PASSWORD || '').trim();

if (!newPassword || newPassword.length < 6) {
  console.error('[Error] Please provide a valid password of at least 6 characters.');
  console.error('Usage: node scripts/recover-admin.js "<new_password>"');
  process.exit(1);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`[Error] Database file not found at: ${DB_PATH}`);
  console.error('Please verify the DB_PATH or DATA_DIR environment variables.');
  process.exit(1);
}

console.log('------------------------------------------------------------');
console.log('   BASTRA SHOILY - SECURE ADMIN RECOVERY UTILITY');
console.log('------------------------------------------------------------');
console.log(`Database Location: ${DB_PATH}`);

try {
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Verify and report preservation of existing production data
  const pCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() || { c: 0 }).c;
  const oCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() || { c: 0 }).c;
  const cCount = (db.prepare('SELECT COUNT(*) as c FROM customers').get() || { c: 0 }).c;
  const aCount = (db.prepare('SELECT COUNT(*) as c FROM admins').get() || { c: 0 }).c;
  const audCount = (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() || { c: 0 }).c;

  console.log(`Data Verification Check:`);
  console.log(`  - Products:  ${pCount} (Preserved)`);
  console.log(`  - Orders:    ${oCount} (Preserved)`);
  console.log(`  - Customers: ${cCount} (Preserved)`);
  console.log(`  - Admins:    ${aCount} accounts registered`);
  console.log(`  - Audit Log: ${audCount} historical records (Preserved)`);

  // 2. Locate existing super admin
  const targetAdmin = db.prepare("SELECT id, name, email, phone, role FROM admins WHERE id = 'admin-1' OR role = 'super_admin' ORDER BY id ASC LIMIT 1").get();
  if (!targetAdmin) {
    console.error('[Error] No existing super admin account found in database to recover.');
    process.exit(1);
  }

  console.log(`Target Super Admin: ${targetAdmin.name} (${targetAdmin.email}) [ID: ${targetAdmin.id}]`);

  // 3. Cryptographically secure scrypt hashing
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(newPassword, salt, 64, { N: 16384, r: 8, p: 1 });
  const hash = `scrypt:${key.toString('hex')}`;

  // 4. Update the existing super admin record ONLY (never duplicate)
  db.prepare(`
    UPDATE admins 
    SET password_hash = ?, salt = ?, username = 'admin', force_password_change = 0, status = 'active'
    WHERE id = ?
  `).run(hash, salt, targetAdmin.id);

  // 5. Invalidate existing sessions and pending recovery tokens
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(targetAdmin.id);
  db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);
  db.prepare('UPDATE admin_password_resets SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);

  // 6. Unlock any rate-limiting lockouts in login_activity
  db.prepare("DELETE FROM login_activity WHERE status = 'failed' AND (email = ? OR email = ?)").run(targetAdmin.email, targetAdmin.phone || '');

  // 6. Record audit log without storing password or hash
  db.prepare(`
    INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `aud-${crypto.randomUUID()}`,
    targetAdmin.name || 'System Admin',
    'Admin Password Recovered via CLI',
    'auth',
    targetAdmin.id,
    null,
    'Super admin password recovered via server-side CLI recovery utility',
    '127.0.0.1'
  );

  // 7. Checkpoint SQLite WAL to guarantee data flush to disk
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}

  console.log('------------------------------------------------------------');
  console.log('✅ SUCCESS: Admin password successfully updated!');
  console.log(`   You can now log in using:`);
  console.log(`   - Username: admin`);
  console.log(`   - Email:    ${targetAdmin.email}`);
  console.log(`   - Phone:    ${targetAdmin.phone || '01890123456'}`);
  console.log('------------------------------------------------------------');
  process.exit(0);
} catch (err) {
  console.error('[Recovery Error]:', err.message || err);
  process.exit(1);
}
