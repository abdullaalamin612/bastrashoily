/**
 * BASTRA SHOILY - Isolated Test Database Helper
 * 
 * Safeguards:
 * 1. Strictly prevents running tests against production or persistent databases.
 * 2. Creates a disposable isolated temporary SQLite database for test execution.
 * 3. Guarantees production orders, customers, products, inventory, and credentials remain 100% untouched.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export interface IsolatedTestContext {
  testDbPath: string;
  templateDbPath: string;
  initialCounts: {
    categories: number;
    products: number;
    orders: number;
    customers: number;
    store_settings: number;
    audit_logs: number;
  };
  cleanup: () => void;
}

export function assertNotProductionDatabase(dbPath: string): void {
  const resolved = path.resolve(dbPath);
  const prodPaths = [
    path.resolve(path.join(process.cwd(), 'data', 'bastra_shoily.sqlite')),
    path.resolve('/var/data/bastra_shoily.sqlite'),
  ];

  if (prodPaths.includes(resolved)) {
    throw new Error(
      `[SECURITY ABORT] Test execution attempted against production database "${dbPath}"! ` +
      `Tests are strictly forbidden from executing against production data.`
    );
  }

  if (process.env.NODE_ENV === 'production' && !resolved.includes('test') && !resolved.includes('tmp')) {
    throw new Error(
      `[SECURITY ABORT] Test execution attempted in production environment without verified test database isolation!`
    );
  }
}

export function createIsolatedTestDatabase(): IsolatedTestContext {
  const templateDbPath = path.join(process.cwd(), 'data', 'bastra_shoily.sqlite');
  if (!fs.existsSync(templateDbPath)) {
    throw new Error(`Template database not found at ${templateDbPath}. Cannot create isolated test fixture.`);
  }

  // Create isolated temp file
  const testId = crypto.randomBytes(6).toString('hex');
  const tempDir = fs.existsSync('/tmp') ? '/tmp' : path.join(process.cwd(), 'data');
  const testDbPath = path.join(tempDir, `bastra_test_isolated_${testId}.sqlite`);

  // Copy template database to isolated location
  fs.copyFileSync(templateDbPath, testDbPath);

  // Set environment variable BEFORE db module load
  process.env.DB_PATH = testDbPath;
  process.env.DATA_DIR = path.dirname(testDbPath);
  process.env.REQUIRE_EXISTING_DB = 'false';

  // Read initial record counts using standalone node:sqlite connection
  const db = new DatabaseSync(testDbPath);
  const getCount = (table: string): number => {
    try {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as any;
      return row ? Number(row.c) : 0;
    } catch {
      return 0;
    }
  };

  const initialCounts = {
    categories: getCount('categories'),
    products: getCount('products'),
    orders: getCount('orders'),
    customers: getCount('customers'),
    store_settings: getCount('store_settings'),
    audit_logs: getCount('audit_logs'),
  };
  db.close();

  const cleanup = () => {
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
      const shm = `${testDbPath}-shm`;
      const wal = `${testDbPath}-wal`;
      if (fs.existsSync(shm)) fs.unlinkSync(shm);
      if (fs.existsSync(wal)) fs.unlinkSync(wal);
    } catch (err) {
      console.warn('Test database cleanup notice:', err);
    }
  };

  return {
    testDbPath,
    templateDbPath,
    initialCounts,
    cleanup,
  };
}
