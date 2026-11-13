/**
 * BASTRA SHOILY - Verification Test Suite for Admin Authentication and Recovery
 */
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import { createIsolatedTestDatabase, assertNotProductionDatabase } from './test-db-helper.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('   BASTRA SHOILY - ADMIN AUTH & RECOVERY VERIFICATION SUITE');
  console.log('================================================================\n');

  // Guard: Ensure isolated fixture
  const fixture = createIsolatedTestDatabase();
  console.log(`[Test Guard] Isolated test database: ${fixture.testDbPath}`);

  try {
    const { hashPassword, verifyPassword, performAdminRecoveryWithSecret, db } = await import('../server/db.js');

    // Test 1: Verify database state & preservation of existing records
    const adminRows = db.prepare("SELECT id, name, email, username, phone, role, password_hash, salt FROM admins WHERE id = 'admin-1'").all() as any[];
    assert(adminRows.length === 1, 'Single Super Admin Preservation', `Found exactly ${adminRows.length} super admin row`);
    const admin = adminRows[0];
    assert(admin.username === 'admin', 'Super Admin Username', `username is '${admin.username}'`);
    assert(admin.email === 'bastrashoily@gmail.com', 'Super Admin Email', `email is '${admin.email}'`);
    assert(admin.phone === '01864528488', 'Super Admin Phone', `phone is '${admin.phone}'`);

    // Test 2: Verify wrong password is rejected
    const matchesWrong = verifyPassword('wrongpassword999', admin.password_hash, admin.salt);
    assert(!matchesWrong, 'Wrong Password Rejection', 'wrongpassword999 was rejected');

    // Test 3: Recovery fails when ADMIN_RECOVERY_KEY is not set
    delete process.env.ADMIN_RECOVERY_KEY;
    delete process.env.ADMIN_RECOVERY_SECRET;
    const noKeyResult = performAdminRecoveryWithSecret('some-key', 'newpass123456');
    assert(!noKeyResult.success && noKeyResult.error?.includes('নিষ্ক্রিয়'), 'Recovery Disabled When Unconfigured', noKeyResult.error);

    // Test 4: Recovery fails when secret is wrong
    process.env.ADMIN_RECOVERY_KEY = 'test-secret-recovery-key-2026';
    const wrongSecretResult = performAdminRecoveryWithSecret('incorrect-key', 'newpass123456');
    assert(!wrongSecretResult.success && wrongSecretResult.error?.includes('ভুল'), 'Recovery Rejects Wrong Secret', wrongSecretResult.error);

    // Test 5: Recovery succeeds with correct secret on isolated DB
    const successRecovery = performAdminRecoveryWithSecret('test-secret-recovery-key-2026', 'RecoveredPass@789!');
    assert(successRecovery.success, 'Recovery Succeeds With Correct Secret', successRecovery.message);

    // Verify updated admin in isolated DB
    const updatedAdmin = db.prepare("SELECT password_hash, salt FROM admins WHERE id = 'admin-1'").get() as any;
    const matchesNew = verifyPassword('RecoveredPass@789!', updatedAdmin.password_hash, updatedAdmin.salt);
    assert(matchesNew, 'New Password Matches After Recovery', 'RecoveredPass@789! verified');

    // Verify no duplicate super admin was created
    const superAdminsCount = (db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get() as any).c;
    assert(superAdminsCount === 1, 'No Duplicate Admins Created', `Super admin count remains ${superAdminsCount}`);

    // Clean up environment variable
    delete process.env.ADMIN_RECOVERY_KEY;
  } finally {
    fixture.cleanup();
    console.log('[Test Cleanup] Isolated test database destroyed.');
  }

  console.log('\n================================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
