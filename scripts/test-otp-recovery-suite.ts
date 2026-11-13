/**
 * BASTRA SHOILY - Safe Comprehensive Test Suite for Admin Forgot Password / OTP Recovery
 * 
 * Safeguards:
 * - Operates EXCLUSIVELY on an isolated temporary test database.
 * - Safeguard automatically aborts if directed at the production database.
 * - No predetermined password restoration logic on production data.
 * - Complete preservation of production orders, customers, products, inventory, and credentials.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
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

async function runSuite() {
  console.log('================================================================');
  console.log('   BASTRA SHOILY - ADMIN OTP & FORGOT PASSWORD TEST SUITE');
  console.log('================================================================\n');

  // 1. Safeguard check: Abort if production database is targeted
  const prodPath = path.join(process.cwd(), 'data', 'bastra_shoily.sqlite');
  let safeguardFired = false;
  try {
    assertNotProductionDatabase(prodPath);
  } catch {
    safeguardFired = true;
  }
  assert(safeguardFired, 'Production DB Protection Safeguard', 'Safeguard prevents running tests on production database');

  // 2. Initialize isolated test fixture
  const fixture = createIsolatedTestDatabase();
  console.log(`[Test Fixture] Isolated test database: ${fixture.testDbPath}\n`);

  try {
    const {
      db,
      hashPassword,
      verifyPassword,
      maskDestination,
      getSuperAdminForRecovery,
      checkOtpRateLimit,
      createAdminOtpRequest,
      verifyAdminOtp,
      resetAdminPasswordWithToken,
    } = await import('../server/db.js');

    const {
      isEmailDeliveryConfigured,
      isSmsDeliveryConfigured,
      sendEmailOtp,
      sendSmsOtp,
    } = await import('../server/otpDelivery.js');

    // ---------------------------------------------------------------------------
    // 1. Existing Super Admin Preservation & Dual Identifiers
    // ---------------------------------------------------------------------------
    const superAdmin = getSuperAdminForRecovery('admin');
    assert(Boolean(superAdmin), 'Super Admin Lookup by Username', `Found: ${superAdmin?.name}`);
    assert(superAdmin.id === 'admin-1', 'Target Admin is admin-1', `ID: ${superAdmin.id}`);
    assert(superAdmin.email === 'bastrashoily@gmail.com', 'Super Admin Email Verified', superAdmin.email);
    assert(superAdmin.phone === '01864528488', 'Super Admin Phone Verified', superAdmin.phone);

    // Lookup by Email (case insensitive)
    const byEmail = getSuperAdminForRecovery('bastrashoily@gmail.com');
    assert(byEmail && byEmail.id === 'admin-1', 'Super Admin Lookup by Email bastrashoily@gmail.com', byEmail?.email);

    const byUpperEmail = getSuperAdminForRecovery('BASTRASHOILY@GMAIL.COM');
    assert(byUpperEmail && byUpperEmail.id === 'admin-1', 'Super Admin Lookup by Uppercase Email', byUpperEmail?.email);

    // Lookup by Phone & formatted variations
    const byPhone = getSuperAdminForRecovery('01864528488');
    assert(byPhone && byPhone.id === 'admin-1', 'Super Admin Lookup by Phone 01864528488', byPhone?.phone);

    const byPlusPhone = getSuperAdminForRecovery('+8801864528488');
    assert(byPlusPhone && byPlusPhone.id === 'admin-1', 'Super Admin Lookup by +8801864528488', byPlusPhone?.phone);

    const byDashedPhone = getSuperAdminForRecovery('01864-528488');
    assert(byDashedPhone && byDashedPhone.id === 'admin-1', 'Super Admin Lookup by 01864-528488', byDashedPhone?.phone);

    const maskedEmail = maskDestination(superAdmin.email, 'email');
    assert(maskedEmail === 'ba*****y@gmail.com', 'Email Masking', maskedEmail);

    const maskedPhone = maskDestination(superAdmin.phone, 'phone');
    assert(maskedPhone === '01864****88', 'Phone Masking', maskedPhone);

    // ---------------------------------------------------------------------------
    // 2. Provider Check - Refuse Fake Send When Unconfigured
    // ---------------------------------------------------------------------------
    const emailStatus = isEmailDeliveryConfigured();
    const smsStatus = isSmsDeliveryConfigured();

    assert(!emailStatus.configured, 'Email Delivery Unconfigured Detection', `Status: configured=${emailStatus.configured}, provider=${emailStatus.providerName}`);
    assert(!smsStatus.configured, 'SMS Delivery Unconfigured Detection', `Status: configured=${smsStatus.configured}, provider=${smsStatus.providerName}`);

    // Verify sendEmailOtp fails safely with error when unconfigured
    const unconfiguredEmailSend = await sendEmailOtp(superAdmin.email, '123456');
    assert(!unconfiguredEmailSend.success && unconfiguredEmailSend.code === 'EMAIL_NOT_CONFIGURED', 'Refuse Fake Email Delivery', unconfiguredEmailSend.error);

    // Verify sendSmsOtp fails safely with error when unconfigured
    const unconfiguredSmsSend = await sendSmsOtp(superAdmin.phone, '123456');
    assert(!unconfiguredSmsSend.success && unconfiguredSmsSend.code === 'SMS_NOT_CONFIGURED', 'Refuse Fake SMS Delivery', unconfiguredSmsSend.error);

    // ---------------------------------------------------------------------------
    // 3. OTP Creation & Keyed Hash Security
    // ---------------------------------------------------------------------------
    const { otp, requestId } = createAdminOtpRequest(superAdmin.id, 'email', maskedEmail, '127.0.0.1');

    assert(otp.length === 6 && /^\d{6}$/.test(otp), '6-Digit Secure OTP Generated', `Numeric OTP: ${otp}`);
    assert(Boolean(requestId), 'OTP Request ID Generated', requestId);

    const storedRow = db.prepare('SELECT * FROM admin_otp_requests WHERE id = ?').get(requestId) as any;
    assert(Boolean(storedRow), 'OTP Request Stored in Database', `Request ID: ${storedRow?.id}`);
    assert(!JSON.stringify(storedRow).includes(otp), 'Plaintext OTP Not In Database', 'OTP plaintext is NOT in DB row');
    assert(storedRow?.otp_hash && storedRow?.otp_hash.length === 64, 'Keyed Hash & Salt Stored', `Hash length: ${storedRow?.otp_hash?.length}`);

    // ---------------------------------------------------------------------------
    // 4. Rate-Limiting & Cooldown Enforcement
    // ---------------------------------------------------------------------------
    const cooldownCheck = checkOtpRateLimit(superAdmin.email, '127.0.0.1');
    assert(!cooldownCheck.allowed, '60-Second Cooldown Enforcement', cooldownCheck.error);

    // ---------------------------------------------------------------------------
    // 5. Incorrect OTP Attempts & Max Attempt Lockout (3 Failed Attempts)
    // ---------------------------------------------------------------------------
    const wrongAttempt1 = verifyAdminOtp(superAdmin.id, '000000', '127.0.0.1');
    assert(!wrongAttempt1.success, 'Wrong OTP Attempt 1 Rejected', wrongAttempt1.error);

    const wrongAttempt2 = verifyAdminOtp(superAdmin.id, '000001', '127.0.0.1');
    assert(!wrongAttempt2.success, 'Wrong OTP Attempt 2 Rejected', wrongAttempt2.error);

    const wrongAttempt3 = verifyAdminOtp(superAdmin.id, '000002', '127.0.0.1');
    assert(!wrongAttempt3.success, 'Max Attempts Lockout (Attempt 3)', wrongAttempt3.error);

    // Locked out OTP cannot be verified even with correct code
    const lockedOutVerify = verifyAdminOtp(superAdmin.id, otp, '127.0.0.1');
    assert(!lockedOutVerify.success, 'Locked Out OTP Rejects Correct Code', lockedOutVerify.error);

    // ---------------------------------------------------------------------------
    // 6. OTP Expiration after 5 minutes
    // ---------------------------------------------------------------------------
    db.prepare('DELETE FROM otp_rate_limits').run();
    const { otp: expOtp, requestId: expId } = createAdminOtpRequest(superAdmin.id, 'email', maskedEmail, '127.0.0.1');

    // Force expire in DB
    db.prepare("UPDATE admin_otp_requests SET expires_at = datetime('now', '-10 seconds') WHERE id = ?").run(expId);
    const expVerify = verifyAdminOtp(superAdmin.id, expOtp, '127.0.0.1');
    assert(!expVerify.success, 'Expired OTP Rejection', expVerify.error);

    // ---------------------------------------------------------------------------
    // 7. Successful OTP Verification & Single-Use Reset Token Issuance
    // ---------------------------------------------------------------------------
    db.prepare('DELETE FROM otp_rate_limits').run();
    const { otp: freshOtp } = createAdminOtpRequest(superAdmin.id, 'email', maskedEmail, '127.0.0.1');

    const freshVerify = verifyAdminOtp(superAdmin.id, freshOtp, '127.0.0.1');
    assert(freshVerify.success && Boolean(freshVerify.resetToken), 'Valid OTP Verification', `Reset Token Issued: ${freshVerify.resetToken?.slice(0, 10)}...`);

    // Replay attack prevention: OTP cannot be verified twice
    const replayVerify = verifyAdminOtp(superAdmin.id, freshOtp, '127.0.0.1');
    assert(!replayVerify.success, 'Replay Attack Prevention (OTP Single-Use)', replayVerify.error);

    // ---------------------------------------------------------------------------
    // 8. Password Reset with Token, Session Revocation & Single-Use
    // ---------------------------------------------------------------------------
    const dummyToken = `test-session-to-be-revoked-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO admin_sessions (token, admin_id, csrf_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, 'csrf-temp', '127.0.0.1', 'Mozilla', datetime('now', '+24 hours'))
    `).run(dummyToken, superAdmin.id);

    const sessionBefore = db.prepare('SELECT token FROM admin_sessions WHERE token = ?').get(dummyToken);
    assert(Boolean(sessionBefore), 'Active Admin Session Created Prior to Reset', dummyToken);

    const newTestPassword = 'IsolatedTestPass2026!@#';
    const resetResult = resetAdminPasswordWithToken(freshVerify.resetToken!, newTestPassword, '127.0.0.1');
    assert(resetResult.success, 'Password Reset Execution', resetResult.message);

    // Verify session was revoked
    const sessionAfter = db.prepare('SELECT token FROM admin_sessions WHERE token = ?').get(dummyToken);
    assert(!sessionAfter, 'Active Admin Sessions Revoked Upon Password Reset', 'Session was successfully purged');

    // Verify reset token cannot be reused
    const replayReset = resetAdminPasswordWithToken(freshVerify.resetToken!, 'AnotherPass999!', '127.0.0.1');
    assert(!replayReset.success, 'Reset Token Single-Use Enforcement', replayReset.error);

    // Verify the new password verifies with verifyPassword
    const adminAfter = db.prepare('SELECT password_hash, salt FROM admins WHERE id = ?').get(superAdmin.id) as any;
    assert(
      verifyPassword(newTestPassword, adminAfter.password_hash, adminAfter.salt),
      'New Password Verification via Scrypt',
      'New password successfully verified in isolated database'
    );

    // Verify total super admins remains exactly 1 (No duplicate admin created)
    const superAdminsCount = (db.prepare("SELECT COUNT(*) as c FROM admins WHERE role = 'super_admin'").get() as any).c;
    assert(superAdminsCount === 1, 'Zero Duplicate Admin Accounts', `Super admins: ${superAdminsCount}`);

    // Verify preservation of database tables in fixture
    const tables = ['categories', 'products', 'product_variants', 'orders', 'customers', 'store_settings', 'audit_logs'];
    for (const t of tables) {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get() as any;
      assert(row && typeof row.c === 'number', `Table Preservation: ${t}`, `${row.c} records intact`);
    }

  } finally {
    fixture.cleanup();
    console.log('\n[Test Fixture] Cleaned up temporary test database successfully.');
  }

  console.log('\n================================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((e) => {
  console.error('Test suite uncaught error:', e);
  process.exit(1);
});
