import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const { Pool } = pg;

// ==============================================================================
// 1. SUPABASE (POSTGRESQL) DATABASE CONNECTION & POOL
// ==============================================================================
export const DATABASE_URL = process.env.DATABASE_URL || '';

// Resilient DATA_DIR resolution with graceful permission fallback
let resolvedDataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
try {
  if (!fs.existsSync(resolvedDataDir)) {
    fs.mkdirSync(resolvedDataDir, { recursive: true });
  }
} catch (dirErr) {
  console.warn(`[Storage Warning] Cannot write to ${resolvedDataDir}, falling back to local directory:`, dirErr);
  resolvedDataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(resolvedDataDir)) {
    try {
      fs.mkdirSync(resolvedDataDir, { recursive: true });
    } catch {}
  }
}
export const DATA_DIR = resolvedDataDir;

// Resilient DB_PATH resolution
let resolvedDbPath = process.env.DB_PATH || path.join(DATA_DIR, 'bastra_shoily.sqlite');
try {
  const dbDir = path.dirname(resolvedDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (dbDirErr) {
  console.warn(`[Storage Warning] Cannot access directory for ${resolvedDbPath}, falling back:`, dbDirErr);
  resolvedDbPath = path.join(DATA_DIR, 'bastra_shoily.sqlite');
}
export const DB_PATH = resolvedDbPath;

// If persistent volume database does not exist yet (e.g. freshly mounted Render disk),
// auto-clone bundled template database so all products, images and settings are available immediately
const templateDbPath = path.join(process.cwd(), 'data', 'bastra_shoily.sqlite');
if (!fs.existsSync(DB_PATH) && fs.existsSync(templateDbPath) && path.resolve(DB_PATH) !== path.resolve(templateDbPath)) {
  try {
    fs.copyFileSync(templateDbPath, DB_PATH);
    console.log(`[Database Seed] Cloned template database to persistent volume at ${DB_PATH}`);
  } catch (seedErr) {
    console.warn('[Database Seed Warning] Notice copying template db:', seedErr);
  }
}

// PostgreSQL Connection Pool for Supabase
export const pgPool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

if (pgPool) {
  pgPool.on('error', (err) => {
    console.warn('[PostgreSQL Pool Warning] Unexpected idle client error:', err.message);
  });
  console.log('[PostgreSQL] Supabase connection pool configured successfully.');
} else {
  console.log(`[Database] Connected to durable persistent storage: ${DB_PATH}. WAL mode active.`);
}

// Helper to run queries directly against Supabase PostgreSQL
export async function queryPostgres<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pgPool) return [];
  try {
    const res = await pgPool.query(text, params);
    return res.rows as T[];
  } catch (err: any) {
    console.error('[PostgreSQL Error] Query execution failed:', err.message);
    throw err;
  }
}

// Helper to convert parameterized SQLite queries (? to $1, $2, ...)
export function convertSqliteToPostgres(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Create pre-startup backup if existing persistent database exists
if (fs.existsSync(DB_PATH)) {
  try {
    const backupDir = path.join(DATA_DIR, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `bastra_shoily_backup_${new Date().toISOString().slice(0, 10)}.sqlite`);
    fs.copyFileSync(DB_PATH, backupFile);
    console.log(`[Database Backup] Pre-startup safety backup created at ${backupFile}`);
  } catch (bakErr) {
    console.warn('[Database Backup Warning] Backup creation notice:', bakErr);
  }
}

// Durable SQLite engine using configured DB_PATH for complete persistence across restarts & reloads
export const db = new DatabaseSync(DB_PATH);

// Robust production PRAGMAs
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA synchronous = NORMAL;');
} catch (e) {
  console.warn('Database PRAGMA configuration notice:', e);
}

// Password Hashing & Verification via Node.js Scrypt (Memory-Hard & Cryptographically Secure)
// Backwards compatible with legacy PBKDF2 hashes
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password.trim(), s, 64, { N: 16384, r: 8, p: 1 });
  return { hash: `scrypt:${key.toString('hex')}`, salt: s };
}

export function verifyPassword(password: string, storedHash?: string, salt?: string): boolean {
  if (!password || !storedHash || !salt) return false;
  const trimmed = password.trim();
  try {
    if (storedHash.startsWith('scrypt:')) {
      const expectedKeyHex = storedHash.slice(7);
      const computedKey = crypto.scryptSync(trimmed, salt, 64, { N: 16384, r: 8, p: 1 });
      const computedBuf = Buffer.from(computedKey.toString('hex'), 'hex');
      const storedBuf = Buffer.from(expectedKeyHex, 'hex');
      if (computedBuf.length !== storedBuf.length) return false;
      return crypto.timingSafeEqual(computedBuf, storedBuf);
    }

    // Backwards-compatible PBKDF2 verification for existing seeds
    const pbkdf2Computed = crypto.pbkdf2Sync(trimmed, salt, 10000, 64, 'sha512').toString('hex');
    const computedBuf = Buffer.from(pbkdf2Computed, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length === storedBuf.length && crypto.timingSafeEqual(computedBuf, storedBuf)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Initialize Database Schema
export function initDatabaseSchema() {
  db.exec(`
    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_category TEXT DEFAULT 'MEN',
      image TEXT,
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Colors
    CREATE TABLE IF NOT EXISTS colors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT NOT NULL,
      hex_code TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Sizes
    CREATE TABLE IF NOT EXISTS sizes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT NOT NULL,
      code TEXT NOT NULL,
      category TEXT DEFAULT 'ALL',
      category_id TEXT,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      description TEXT,
      short_description TEXT,
      category_id TEXT,
      sub_category TEXT,
      variant_config TEXT NOT NULL DEFAULT 'color_size', -- 'free_size' or 'color_size'
      brand TEXT DEFAULT 'BOSTROSHOILY',
      price REAL NOT NULL,
      discount_price REAL,
      low_stock_threshold INTEGER DEFAULT 5,
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 1,
      is_best_seller INTEGER DEFAULT 0,
      is_offer INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', -- 'active', 'inactive', 'draft', 'archived'
      main_image TEXT,
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT,
      sales_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    -- Product Variants (Authoritative Purchasable Unit)
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      color_id TEXT NOT NULL,
      size_id TEXT, -- NULL for Free Size / Color-only
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      offer_price REAL,
      weight REAL DEFAULT 0.5,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      active INTEGER DEFAULT 1,
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (color_id) REFERENCES colors (id),
      FOREIGN KEY (size_id) REFERENCES sizes (id)
    );

    -- Unique index on product + color + size
    CREATE UNIQUE INDEX IF NOT EXISTS idx_variant_product_color_size 
    ON product_variants (product_id, color_id, COALESCE(size_id, '__FREE_SIZE__'));

    -- Color Galleries (Product + Color -> Multiple Gallery Images)
    CREATE TABLE IF NOT EXISTS color_galleries (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      color_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_main INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (color_id) REFERENCES colors (id)
    );

    -- Variant Gallery Overrides (Optional exceptional gallery for a specific ProductVariant)
    CREATE TABLE IF NOT EXISTS variant_gallery_overrides (
      id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
    );

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      district TEXT,
      upazila TEXT,
      address TEXT,
      status TEXT DEFAULT 'active', -- 'active', 'blocked'
      total_orders INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      cancelled_orders INTEGER DEFAULT 0,
      ip_address TEXT,
      user_agent TEXT,
      risk_level TEXT DEFAULT 'low',
      is_fake INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT NOT NULL,
      district TEXT NOT NULL,
      upazila TEXT,
      postal_code TEXT,
      subtotal REAL NOT NULL,
      delivery_charge REAL NOT NULL DEFAULT 60,
      discount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cod',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_txn_id TEXT,
      order_status TEXT NOT NULL DEFAULT 'pending',
      order_source TEXT DEFAULT 'website', -- 'website', 'admin', 'wholesale'
      customer_notes TEXT,
      admin_notes TEXT,
      order_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items (IMMUTABLE SNAPSHOT OF PURCHASABLE UNIT)
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      product_name TEXT NOT NULL,
      bangla_name TEXT,
      sku TEXT NOT NULL,
      color_name TEXT,
      size_name TEXT,
      original_price REAL NOT NULL,
      offer_price REAL,
      discount_amount REAL DEFAULT 0,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      final_item_price REAL NOT NULL,
      image TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    -- Order Timeline / History
    CREATE TABLE IF NOT EXISTS order_timeline (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      note TEXT,
      actor TEXT DEFAULT 'System',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    -- Returns & Refunds
    CREATE TABLE IF NOT EXISTS order_returns (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      reason TEXT NOT NULL,
      reason_code TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'requested', -- 'requested', 'under_review', 'approved', 'item_received', 'inspected', 'refund_approved', 'refund_processing', 'refunded', 'rejected'
      total_refund_amount REAL NOT NULL DEFAULT 0,
      refund_status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'rejected'
      refund_method TEXT,
      refund_txn_id TEXT,
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id)
    );

    -- Inventory Transactions Log
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      transaction_type TEXT NOT NULL, -- 'stock_in', 'sale', 'stock_out', 'adjustment', 'return', 'cancellation_restore'
      previous_stock INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reference TEXT,
      admin_id TEXT,
      note TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Coupons
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_discount_amount REAL,
      start_date TEXT,
      expiry_date TEXT,
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      per_user_limit INTEGER DEFAULT 1,
      allow_stacking INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Timer Offers (Authoritative Pricing Rule)
    CREATE TABLE IF NOT EXISTS timer_offers (
      id TEXT PRIMARY KEY,
      offer_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
      discount_value REAL NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      target_type TEXT NOT NULL DEFAULT 'entire_store', -- 'entire_store', 'category', 'product', 'variant'
      target_ids TEXT DEFAULT '[]', -- JSON array of IDs
      min_quantity INTEGER DEFAULT 1,
      min_order_amount REAL DEFAULT 0,
      max_discount REAL,
      status TEXT DEFAULT 'active', -- 'draft', 'scheduled', 'active', 'expired', 'inactive'
      created_by TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Wholesale Customers
    CREATE TABLE IF NOT EXISTS wholesale_customers (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      district TEXT,
      address TEXT,
      credit_limit REAL DEFAULT 50000,
      discount_rate REAL DEFAULT 15,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Wholesale Orders
    CREATE TABLE IF NOT EXISTS wholesale_orders (
      id TEXT PRIMARY KEY,
      wholesale_customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      total_amount REAL NOT NULL,
      items_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_terms TEXT DEFAULT '30_days',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Complaints Management
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      order_id TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
      status TEXT DEFAULT 'new', -- 'new', 'in_review', 'waiting_for_customer', 'resolved', 'closed'
      assigned_admin TEXT,
      admin_reply TEXT,
      internal_note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Internal Admin Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_admin TEXT NOT NULL,
      priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
      due_date TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
      created_by TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Notifications & Messages
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'order', 'payment', 'return', 'refund', 'low_stock', 'complaint', 'review'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Product Reviews
    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      admin_reply TEXT,
      status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'hidden'
      is_verified_purchase INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Admins & Staff
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'super_admin',
      permissions TEXT DEFAULT '["all"]', -- JSON array
      password_hash TEXT,
      salt TEXT,
      force_password_change INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      avatar TEXT,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Roles for Staff Accounts & RBAC
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      bangla_name TEXT NOT NULL,
      description TEXT,
      permissions TEXT NOT NULL DEFAULT '[]', -- JSON array of permission strings
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Staff Users (Staff Accounts System)
    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      designation TEXT,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
      is_super_admin INTEGER DEFAULT 0,
      avatar TEXT,
      last_login TEXT,
      force_password_change INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- User Roles (Many-to-Many Staff Roles)
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES staff_users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      UNIQUE(user_id, role_id)
    );

    -- Admin Sessions (Auth & CSRF Tracking)
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      csrf_token TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    -- Audit Logs (Append-Only)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      previous_value TEXT,
      new_value TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Login Activity
    CREATE TABLE IF NOT EXISTS login_activity (
      id TEXT PRIMARY KEY,
      admin_name TEXT NOT NULL,
      email TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      user_agent TEXT,
      status TEXT DEFAULT 'success',
      reason TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Settings
    CREATE TABLE IF NOT EXISTS ai_settings (
      id TEXT PRIMARY KEY,
      enabled INTEGER DEFAULT 1,
      agent_name TEXT DEFAULT 'বস্ত্র শৈলী (BOSTROSHOILY) এআই সহকারী',
      welcome_message TEXT,
      language TEXT DEFAULT 'bn',
      response_style TEXT DEFAULT 'friendly_expert',
      business_description TEXT,
      business_hours TEXT,
      contact_info TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Knowledge Base
    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL, -- 'faq', 'delivery', 'payment', 'return', 'refund', 'product', 'business'
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Conversations Log
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT,
      last_message TEXT,
      message_count INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active', -- 'active', 'waiting', 'human_handoff', 'resolved', 'closed'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Hero & Store Banners
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      bangla_title TEXT,
      subtitle TEXT,
      bangla_subtitle TEXT,
      button_text TEXT,
      button_url TEXT,
      desktop_image TEXT NOT NULL,
      mobile_image TEXT,
      display_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      tag TEXT,
      show_men_button INTEGER DEFAULT 1,
      show_women_button INTEGER DEFAULT 1,
      men_button_text TEXT DEFAULT 'Shop for men',
      women_button_text TEXT DEFAULT 'Shop for women',
      men_button_url TEXT DEFAULT '/category/men',
      women_button_url TEXT DEFAULT '/category/women',
      video_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Store & Commerce Settings (Authoritative SQLite Key-Value Store)
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Landing Pages / Product Campaigns (Soft Creation High-Converting Architecture)
    CREATE TABLE IF NOT EXISTS landing_pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      template TEXT DEFAULT 'template_1',
      badge_text TEXT DEFAULT 'সীমিত সময়ের স্পেশাল অফার!',
      headline TEXT NOT NULL,
      subheadline TEXT,
      video_url TEXT,
      benefits_json TEXT,
      highlights_json TEXT,
      customer_reviews_json TEXT,
      offer_price REAL,
      regular_price REAL,
      delivery_inside_dhaka REAL DEFAULT 70,
      delivery_outside_dhaka REAL DEFAULT 120,
      whatsapp_number TEXT DEFAULT '01890123456',
      call_number TEXT DEFAULT '01890123456',
      status TEXT DEFAULT 'active',
      view_count INTEGER DEFAULT 0,
      order_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Meta Pixel & Conversion API (CAPI) Tracking Events Log
    CREATE TABLE IF NOT EXISTS tracking_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      event_id TEXT NOT NULL,
      source TEXT DEFAULT 'server_capi', -- 'browser_pixel', 'server_capi'
      user_identifier TEXT,
      value REAL,
      currency TEXT DEFAULT 'BDT',
      status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'deduplicated'
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Fraud & Security Blacklist / Threat Protection
    CREATE TABLE IF NOT EXISTS security_blacklist (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'phone', 'ip', 'email'
      value TEXT UNIQUE NOT NULL,
      reason TEXT NOT NULL,
      risk_score INTEGER DEFAULT 80,
      blocked_attempts INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', -- 'active', 'whitelisted'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Video Gallery (Craft, Loom, Product Reels)
    CREATE TABLE IF NOT EXISTS video_gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      bangla_title TEXT,
      video_url TEXT NOT NULL,
      thumbnail TEXT,
      category TEXT DEFAULT 'general',
      duration TEXT DEFAULT '1:30',
      product_id TEXT,
      is_featured INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      views_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Suppliers Directory (Suppliers & Purchases)
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      category TEXT,
      total_purchased REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Purchases & Inward Stock Orders
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      purchase_no TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'received',
      purchase_date TEXT DEFAULT CURRENT_TIMESTAMP,
      items_json TEXT NOT NULL,
      note TEXT,
      created_by TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin OTP Recovery Requests (Keyed hashes, 5-min expiry, single-use)
    CREATE TABLE IF NOT EXISTS admin_otp_requests (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      channel TEXT NOT NULL, -- 'email' | 'sms'
      destination_masked TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      is_used INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      FOREIGN KEY (admin_id) REFERENCES admins (id)
    );

    -- Admin Password Reset Tokens (Single-use token issued upon verified OTP)
    CREATE TABLE IF NOT EXISTS admin_password_resets (
      token TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      otp_request_id TEXT,
      is_used INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      FOREIGN KEY (admin_id) REFERENCES admins (id)
    );

    -- Rate limiting table for OTP requests and verification attempts
    CREATE TABLE IF NOT EXISTS otp_rate_limits (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      action TEXT NOT NULL, -- 'request' | 'verify'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Combo Offers / Bundle Deals (Custom Design & Beautiful Typography Architecture)
    CREATE TABLE IF NOT EXISTS combo_offers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      bangla_title TEXT,
      tagline TEXT,
      description TEXT,
      badge TEXT DEFAULT 'স্পেশাল কম্বো',
      original_price REAL NOT NULL,
      combo_price REAL NOT NULL,
      savings_amount REAL NOT NULL,
      savings_percent REAL DEFAULT 0,
      items_json TEXT NOT NULL DEFAULT '[]',
      image TEXT,
      start_date TEXT,
      end_date TEXT,
      active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Checkout Cross-Category Upsell Offers
    CREATE TABLE IF NOT EXISTS checkout_upsells (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      product_id TEXT NOT NULL,
      offer_price REAL NOT NULL,
      target_categories TEXT NOT NULL DEFAULT '["ALL"]',
      image TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- CMS Policy Pages (Phase 1.3 - Dedicated Full-Page URLs)
    CREATE TABLE IF NOT EXISTS policy_pages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_bn TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_bn TEXT NOT NULL,
      content_en TEXT,
      seo_title TEXT,
      meta_description TEXT,
      status TEXT DEFAULT 'published',
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Size Charts Directory (Phase 4.4)
    CREATE TABLE IF NOT EXISTS size_charts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT NOT NULL,
      category_slug TEXT,
      sub_category TEXT,
      measurements_json TEXT NOT NULL DEFAULT '[]',
      unit TEXT DEFAULT 'inch',
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Product Related Products (Phase 4.6)
    CREATE TABLE IF NOT EXISTS product_related (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      related_product_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (related_product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    -- Product Add-ons / Optional Extras (Phase 4.7)
    CREATE TABLE IF NOT EXISTS product_addons (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      addon_product_id TEXT NOT NULL,
      custom_title_bn TEXT,
      custom_description_bn TEXT,
      price_override REAL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
      FOREIGN KEY (addon_product_id) REFERENCES products (id) ON DELETE CASCADE
    );
  `);

  try {
    const schemaMigrations = [
      'ALTER TABLE combo_offers ADD COLUMN category_slug TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN category_name TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN discount_percent REAL DEFAULT 0;',
      'ALTER TABLE combo_offers ADD COLUMN headline TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN discount_text TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN logo_image TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN product_ids_json TEXT DEFAULT "[]";',
      'ALTER TABLE combo_offers ADD COLUMN badge_circle_text TEXT DEFAULT "কাঁথাফোঁড়";',
      'ALTER TABLE combo_offers ADD COLUMN theme_color TEXT DEFAULT "#2B1208";',
      'ALTER TABLE combo_offers ADD COLUMN accent_color TEXT DEFAULT "#DFB788";',
      'ALTER TABLE combo_offers ADD COLUMN circle_image TEXT;',
      'ALTER TABLE combo_offers ADD COLUMN box_width INTEGER DEFAULT 780;',
      'ALTER TABLE combo_offers ADD COLUMN circle_size INTEGER DEFAULT 180;',
      // Category migrations
      'ALTER TABLE categories ADD COLUMN description TEXT;',
      'ALTER TABLE categories ADD COLUMN seo_title TEXT;',
      'ALTER TABLE categories ADD COLUMN seo_description TEXT;',
      'ALTER TABLE categories ADD COLUMN seo_slug TEXT;',
      'ALTER TABLE categories ADD COLUMN is_main INTEGER DEFAULT 0;',
      // Product migrations
      'ALTER TABLE products ADD COLUMN compare_at_price REAL;',
      'ALTER TABLE products ADD COLUMN image_alt TEXT;',
      'ALTER TABLE products ADD COLUMN canonical_url TEXT;',
      'ALTER TABLE products ADD COLUMN og_title TEXT;',
      'ALTER TABLE products ADD COLUMN og_description TEXT;',
      'ALTER TABLE products ADD COLUMN og_image TEXT;',
      'ALTER TABLE products ADD COLUMN size_chart_id TEXT;',
      'ALTER TABLE products ADD COLUMN availability TEXT DEFAULT "in_stock";',
      'ALTER TABLE categories ADD COLUMN banner TEXT;',
      'ALTER TABLE categories ADD COLUMN circle_image TEXT;',
      'ALTER TABLE categories ADD COLUMN show_in_circle_gallery INTEGER DEFAULT 1;',
      'ALTER TABLE categories ADD COLUMN circle_gallery_order INTEGER DEFAULT 0;',
      'ALTER TABLE categories ADD COLUMN is_archived INTEGER DEFAULT 0;',
      'ALTER TABLE size_charts ADD COLUMN main_category TEXT DEFAULT "MEN";',
      'ALTER TABLE size_charts ADD COLUMN mode TEXT DEFAULT "table";',
      'ALTER TABLE size_charts ADD COLUMN image_url TEXT;',
      'ALTER TABLE size_charts ADD COLUMN design_settings TEXT DEFAULT "{}";',
      'ALTER TABLE size_charts ADD COLUMN available_sizes_json TEXT DEFAULT "[]";',
      'ALTER TABLE size_charts ADD COLUMN show_table INTEGER DEFAULT 1;',
      'ALTER TABLE size_charts ADD COLUMN show_image INTEGER DEFAULT 1;',
      'ALTER TABLE product_addons ADD COLUMN addon_type TEXT DEFAULT "existing";',
      'ALTER TABLE product_addons ADD COLUMN custom_image TEXT;',
      'ALTER TABLE product_addons ADD COLUMN custom_name TEXT;',
      'ALTER TABLE product_addons ADD COLUMN custom_price REAL;',
      // Sizes & Staff RBAC migrations
      'ALTER TABLE sizes ADD COLUMN category_id TEXT;',
      'ALTER TABLE admins ADD COLUMN username TEXT;',
      'ALTER TABLE admins ADD COLUMN designation TEXT;',
      'ALTER TABLE admins ADD COLUMN roles TEXT;',
      'ALTER TABLE staff_users ADD COLUMN is_super_admin INTEGER DEFAULT 0;',
    ];
    for (const q of schemaMigrations) {
      try {
        db.exec(q);
      } catch {}
    }

    // Seed default RBAC roles if empty
    try {
      const rolesCount = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
      if (!rolesCount || rolesCount.count === 0) {
        const defaultRoles = [
          { id: 'role-super-admin', name: 'Super Admin', bangla_name: 'সুপার এডমিন', description: 'সর্বময় নিয়ন্ত্রণ ও পূর্ণ প্রশাসনিক সুবিধা', permissions: JSON.stringify(['all']) },
          { id: 'role-manager', name: 'Manager', bangla_name: 'ম্যানেজার', description: 'দৈনন্দিন স্টোর ও স্টাফ কার্যক্রম নিয়ন্ত্রণ', permissions: JSON.stringify(['products.view', 'products.create', 'products.edit', 'orders.view', 'orders.edit', 'inventory.view', 'customers.view', 'reports.view']) },
          { id: 'role-product-manager', name: 'Product Manager', bangla_name: 'প্রোডাক্ট ম্যানেজার', description: 'পণ্য, সাইজ চার্ট, ক্যাটাগরি ও অফার পরিচালনা', permissions: JSON.stringify(['products.view', 'products.create', 'products.edit', 'products.archive', 'inventory.view', 'inventory.adjust']) },
          { id: 'role-order-manager', name: 'Order Manager', bangla_name: 'অর্ডার ম্যানেজার', description: 'অর্ডার যাচাই, অনুমোদন ও কুরিয়ার পার্সেল প্রসেসিং', permissions: JSON.stringify(['orders.view', 'orders.edit', 'orders.cancel', 'customers.view']) },
          { id: 'role-accountant', name: 'Accountant', bangla_name: 'হিসাবরক্ষক (Accountant)', description: 'আয়-ব্যয়, পেমেন্ট ও লাভ-ক্ষতির আর্থিক রিপোর্ট', permissions: JSON.stringify(['payments.manage', 'reports.view', 'orders.view']) },
          { id: 'role-inventory-manager', name: 'Inventory Manager', bangla_name: 'ইনভেন্টরি ম্যানেজার', description: 'স্টক হিসাব, সরবরাহকারী ও মালামাল রিসিভ', permissions: JSON.stringify(['inventory.view', 'inventory.adjust', 'products.view']) },
          { id: 'role-customer-support', name: 'Customer Support', bangla_name: 'কাস্টমার সাপোর্ট', description: 'গ্রাহক বার্তা, অভিযোগ ও অর্ডার ট্র্যাকিং সহায়তা', permissions: JSON.stringify(['orders.view', 'customers.view']) },
          { id: 'role-marketing-manager', name: 'Marketing Manager', bangla_name: 'মার্কেটিং ম্যানেজার', description: 'ব্যানার, কুপন, কম্বো অফার ও মেটা পিক্সেল ক্যাম্পেইন', permissions: JSON.stringify(['products.view', 'reports.view', 'settings.manage']) },
        ];
        for (const r of defaultRoles) {
          db.prepare('INSERT OR IGNORE INTO roles (id, name, bangla_name, description, permissions) VALUES (?, ?, ?, ?, ?)').run(r.id, r.name, r.bangla_name, r.description, r.permissions);
        }
      }
    } catch (rErr) {
      console.warn('Roles seed notice:', rErr);
    }

    // Sync Super Admin into staff_users
    try {
      const superAdmin = db.prepare("SELECT * FROM admins WHERE role = 'super_admin' LIMIT 1").get() as any;
      if (superAdmin) {
        const existingStaff = db.prepare('SELECT id FROM staff_users WHERE id = ? OR username = ? OR email = ?').get(superAdmin.id, superAdmin.username || 'admin', superAdmin.email);
        if (!existingStaff) {
          db.prepare(`
            INSERT OR IGNORE INTO staff_users (id, name, username, email, phone, designation, password_hash, salt, status, is_super_admin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
          `).run(
            superAdmin.id,
            superAdmin.name,
            superAdmin.username || 'admin',
            superAdmin.email,
            superAdmin.phone || '01864528488',
            'Super Admin / Owner',
            superAdmin.password_hash,
            superAdmin.salt
          );
          db.prepare('INSERT OR IGNORE INTO user_roles (id, user_id, role_id) VALUES (?, ?, ?)').run(`ur-${superAdmin.id}-super`, superAdmin.id, 'role-super-admin');
        }
      }
    } catch (sErr) {
      console.warn('Staff super-admin sync notice:', sErr);
    }

    // Ensure default combo offers have authentic reference screenshot defaults
    db.prepare(`
      UPDATE combo_offers
      SET
        headline = COALESCE(NULLIF(headline, ''), 'সকল গিফট বক্সে'),
        badge_circle_text = COALESCE(NULLIF(badge_circle_text, ''), 'কাঁথাফোঁড়'),
        theme_color = COALESCE(NULLIF(theme_color, ''), '#2B1208'),
        accent_color = COALESCE(NULLIF(accent_color, ''), '#DFB788'),
        circle_image = COALESCE(NULLIF(circle_image, ''), '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg'),
        category_slug = COALESCE(NULLIF(category_slug, ''), 'gift-box'),
        category_name = COALESCE(NULLIF(category_name, ''), 'সকল গিফট বক্স'),
        discount_percent = CASE WHEN discount_percent IS NULL OR discount_percent <= 0 THEN 20 ELSE discount_percent END,
        discount_text = COALESCE(NULLIF(discount_text, ''), 'ফ্ল্যাট ২০% ডিসকাউন্ট')
      WHERE id = 'combo-1' OR id = 'combo-2';
    `).run();
  } catch {}

  try {
    // Clean demo offers
    db.prepare("DELETE FROM timer_offers WHERE id = 'to-1'").run();

    // Security Cleanup: Purge any legacy bypass sessions and invalid long-lived sessions
    db.prepare("DELETE FROM admin_sessions WHERE token LIKE '%master%' OR expires_at > '2035-01-01'").run();
  } catch (err) {
    console.warn('Session cleanup notice:', err);
  }

  try {
    const lpCount = db.prepare('SELECT COUNT(*) as count FROM landing_pages').get() as { count: number };
    if (!lpCount || lpCount.count === 0) {
      const prod = db.prepare(`
        SELECT p.id, p.name, pv.price, pv.offer_price 
        FROM products p 
        LEFT JOIN product_variants pv ON p.id = pv.product_id 
        LIMIT 1
      `).get() as any;
      const prodId = prod?.id || 'prod-1';
      const offerPrice = prod?.offer_price || prod?.price || 1450;
      const regPrice = prod?.price || 1850;

      db.prepare(`
        INSERT INTO landing_pages (
          id, title, slug, product_id, template, badge_text, headline, subheadline, video_url,
          benefits_json, highlights_json, customer_reviews_json, offer_price, regular_price,
          delivery_inside_dhaka, delivery_outside_dhaka, whatsapp_number, call_number, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'lp-1',
        'প্রিমিয়াম হ্যান্ডলুম সুতি লুঙ্গি ও পাঞ্জাবি স্পেশাল অফার',
        'special-handloom-offer',
        prodId,
        'template_1',
        'সীমিত সময়ের ধামাকা অফার! সরাসরি কারখানা থেকে হোম ডেলিভারি',
        'শতভাগ খাঁটি দেশীয় সুতায় তৈরি আরামদায়ক ও আভিজাত্যপূর্ণ পোশাক',
        'অর্ডার করতে নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন। ডেলিভারিম্যান পৌঁছানোর পর পণ্য দেখে মূল্য পরিশোধ করুন।',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        JSON.stringify([
          '১০০% খাঁটি সুতি ও আরামদায়ক টেক্সচার',
          'রং পাকা ও দীর্ঘস্থায়ী কোয়ালিটির নিশ্চয়তা',
          'সরাসরি ঐতিহ্যবাহী তাঁতপল্লী থেকে সংগৃহীত',
          'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দেওয়ার সুবিধা)',
          '৭ দিনের সহজ পরিবর্তন ও মানিব্যাক গ্যারান্টি',
        ]),
        JSON.stringify([
          { title: 'স্বাদে গন্ধে ইনস্ট্যান্ট রিচার্জ!', desc: 'শতভাগ আরামদায়ক ও পরিচ্ছন্ন সুতা' },
          { title: '১০০% খাঁটি কোয়ালিটি', desc: 'মজবুত বুনন ও টেকসই সেলাই' },
          { title: 'শতভাগ প্রিমিয়াম নিশ্চয়তা', desc: 'দেখে বুঝে নেওয়ার পূর্ণ সুবিধা' },
        ]),
        JSON.stringify([
          {
            name: 'তানভীর আহমেদ',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            comment: 'কাপড়টা সত্যি অনেক আরামদায়ক। ডেলিভারিও দ্রুত পেয়েছি।',
          },
          {
            name: 'মাহবুবুল হক',
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            comment: 'একদম ছবির মতোই পেয়েছি। সবাইকে নেওয়ার পরামর্শ দিচ্ছি।',
          },
        ]),
        offerPrice,
        regPrice,
        70,
        120,
        '01890123456',
        '01890123456',
        'active'
      );
    }

    const existingPromo = db.prepare("SELECT value FROM store_settings WHERE key = 'promo_sub_banners'").get() as any;
    if (!existingPromo) {
      const defaultPromo = [
        {
          id: 'sub-banner-1',
          title: 'SUMMER FASHION SALE',
          badge: '70% OFF',
          subtitle: 'প্রিমিয়াম সামার কালেকশন',
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700',
          link: '/category/women',
          bgGradient: 'from-amber-600/90 to-rose-700/90',
        },
        {
          id: 'sub-banner-2',
          title: 'MEGA FASHION SALE',
          badge: 'SPRING 2026',
          subtitle: 'এক্সক্লুসিভ নতুন ডিজাইন',
          image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=700',
          link: '/category/men',
          bgGradient: 'from-emerald-700/90 to-teal-900/90',
        },
        {
          id: 'sub-banner-3',
          title: 'Weekend Special Sale',
          badge: '50% OFF',
          subtitle: 'সীমিত সময়ের বিশেষ অফার',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=700',
          link: '/category/all',
          bgGradient: 'from-violet-700/90 to-indigo-950/90',
        },
      ];
      db.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('promo_sub_banners', ?)").run(
        JSON.stringify(defaultPromo)
      );
    }

    // Seed default Combo Offers / Bundle Deals if empty
    const comboCount = db.prepare('SELECT COUNT(*) as count FROM combo_offers').get() as { count: number };
    if (!comboCount || comboCount.count === 0) {
      db.prepare(`
        INSERT INTO combo_offers (
          id, title, bangla_title, tagline, description, badge, original_price, combo_price, savings_amount, savings_percent, items_json, image, start_date, end_date, active, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'combo-1',
        'Traditional Handloom Lungi & Cotton Panjabi Duo',
        'প্রিমিয়াম তাঁতের লুঙ্গি + সুতি পাঞ্জাবি কম্বো প্যাক',
        'শতভাগ আরামদায়ক ও খাঁটি দেশীয় বুননের প্রিমিয়াম ডুও বান্ডেল',
        'সিরাজগঞ্জের ঐতিহ্যবাহী তাঁতের তৈরি সুতি লুঙ্গি ও আধুনিক কাটের সুতি পাঞ্জাবির এক অপূর্ব যুগলবন্দি। বিশেষ উৎসবে আপনার কিংবা প্রিয়জনের জন্য সেরা উপহার।',
        'স্পেশাল কম্বো',
        2450,
        1850,
        600,
        24,
        JSON.stringify([
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'প্রিমিয়াম তাঁতের লুঙ্গি (Royal Handloom Lungi)',
            price: 950,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
            variant: 'রয়েল ব্লু / স্ট্যান্ডার্ড'
          },
          {
            id: 'item-2',
            productId: 'prod-2',
            productName: 'ক্লাসিক সুতি পাঞ্জাবি (Classic Cotton Panjabi)',
            price: 1500,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
            variant: 'আইভরি হোয়াইট / L'
          }
        ]),
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        '2026-01-01',
        '2026-12-31',
        1,
        1
      );

      db.prepare(`
        INSERT INTO combo_offers (
          id, title, bangla_title, tagline, description, badge, original_price, combo_price, savings_amount, savings_percent, items_json, image, start_date, end_date, active, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'combo-2',
        'Festive Heritage Kurta & Handloom Shawl Combo',
        'উৎসব কালেকশন: খাদি কুর্তা ও হ্যান্ডলুম চাদর বান্ডেল',
        'শীত ও বসন্তের সান্ধ্য অনুষ্ঠানে আভিজাত্যের পূর্ণাঙ্গ রূপ',
        'খাঁটি খাদি সুতায় নিখুঁত হাতে বোনা কুর্তা ও কাশ্মীরি মোটিফের সিরাজগঞ্জি তাঁতের শাল চাদর। সীমিত সময়ের জন্য বিশেষ বান্ডেল মূল্যে।',
        'ঈদ স্পেশাল অফার',
        3600,
        2750,
        850,
        24,
        JSON.stringify([
          {
            id: 'item-1',
            productId: 'prod-3',
            productName: 'ঐতিহ্যবাহী খাদি কুর্তা',
            price: 1800,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
            variant: 'নেভি ব্লু / XL'
          },
          {
            id: 'item-2',
            productId: 'prod-4',
            productName: 'প্রিমিয়াম হ্যান্ডলুম উলের শাল চাদর',
            price: 1800,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80',
            variant: 'মেরুন গোল্ড / ফ্রি সাইজ'
          }
        ]),
        'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        '2026-01-01',
        '2026-12-31',
        1,
        2
      );
    }
  } catch (err) {
    console.warn('Initial landing_pages / combo_offers check warning:', err);
  }
}

// Seed Initial Authentic Data
export function seedDatabaseIfEmpty() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount && catCount.count > 0) {
    return; // Already seeded
  }

  db.exec('BEGIN TRANSACTION');

  try {
    // 1. Categories
    const insertCat = db.prepare(
      'INSERT INTO categories (id, name, bangla_name, slug, parent_category, image, order_num, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    insertCat.run('cat-lungi', 'Lungi', 'লুঙ্গি', 'lungi', 'MEN', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertCat.run('cat-panjabi', 'Panjabi', 'পাঞ্জাবি', 'panjabi', 'MEN', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 2, 1);
    insertCat.run('cat-saree', 'Saree', 'শাড়ি ও জামদানি', 'saree', 'WOMEN', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 3, 1);
    insertCat.run('cat-tshirt', 'T-Shirt', 'টি-শার্ট', 'tshirt', 'MEN', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 4, 1);
    insertCat.run('cat-three-piece', 'Three-Piece', 'থ্রি-পিস', 'three-piece', 'WOMEN', 'https://images.unsplash.com/photo-1583391733975-22d7efd0ce24?auto=format&fit=crop&w=800&q=80', 5, 1);

    // 2. Colors
    const insertColor = db.prepare('INSERT INTO colors (id, name, bangla_name, hex_code, active) VALUES (?, ?, ?, ?, ?)');
    insertColor.run('col-blue', 'Royal Blue', 'রয়্যাল ব্লু', '#1e3a8a', 1);
    insertColor.run('col-red', 'Ruby Red', 'রুবি রেড', '#dc2626', 1);
    insertColor.run('col-green', 'Forest Green', 'ফরেস্ট গ্রিন', '#15803d', 1);
    insertColor.run('col-black', 'Midnight Black', 'মিডনাইট ব্ল্যাক', '#18181b', 1);
    insertColor.run('col-white', 'Pure White', 'পিউর হোয়াইট', '#f8fafc', 1);
    insertColor.run('col-brown', 'Warm Brown', 'চকলেট ব্রাউন', '#78350f', 1);
    insertColor.run('col-maroon', 'Deep Maroon', 'মেরুন', '#831843', 1);

    // 3. Sizes
    const insertSize = db.prepare('INSERT INTO sizes (id, name, bangla_name, code, category, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertSize.run('sz-25h', '2.5 হাত', '২.৫ হাত (স্ট্যান্ডার্ড)', '2.5H', 'LUNGI', 1, 1);
    insertSize.run('sz-30h', '3 হাত', '৩ হাত (লম্বা)', '3.0H', 'LUNGI', 2, 1);
    insertSize.run('sz-s', 'S', 'স্মল (৩৮)', 'S', 'APPAREL', 3, 1);
    insertSize.run('sz-m', 'M', 'মিডিয়াম (৪০)', 'M', 'APPAREL', 4, 1);
    insertSize.run('sz-l', 'L', 'লার্জ (৪২)', 'L', 'APPAREL', 5, 1);
    insertSize.run('sz-xl', 'XL', 'এক্সেল (৪৪)', 'XL', 'APPAREL', 6, 1);
    insertSize.run('sz-xxl', 'XXL', 'ডাবল এক্সেল (৪৬)', 'XXL', 'APPAREL', 7, 1);
    insertSize.run('sz-free', 'Free Size', 'ফ্রি সাইজ', 'FREE', 'FREE_SIZE', 8, 1);

    // 4. Products & Variants (Authoritative ProductVariant architecture)
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, bangla_name, slug, sku, description, short_description, 
        category_id, sub_category, variant_config, brand, price, discount_price, 
        low_stock_threshold, is_featured, is_new_arrival, is_best_seller, is_offer, 
        status, main_image, seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertVar = db.prepare(`
      INSERT INTO product_variants (
        id, product_id, color_id, size_id, sku, price, offer_price, weight, stock, low_stock_threshold, active, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertGallery = db.prepare(`
      INSERT INTO color_galleries (id, product_id, color_id, image_url, is_main, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // PRODUCT 1: সিরাজগঞ্জ সুতি তাঁতের লুঙ্গি (Free Size / Color-only)
    insertProd.run(
      'prod-lungi-01',
      'Sirajganj Pure Cotton Handloom Lungi',
      'সিরাজগঞ্জ প্রিমিয়াম সুতি তাঁতের লুঙ্গি',
      'sirajganj-pure-cotton-handloom-lungi',
      'BS-LUN-001',
      '১০০% খাঁটি সিরাজগঞ্জের সুতি সুতায় বোনা এই লুঙ্গিটি অত্যন্ত নরম, আরামদায়ক ও টেকসই। গরমের দিনে পরার জন্য এটি একদম পারফেক্ট। ওয়াশের পরও ১০০% রঙ পাকা থাকে।',
      '১০০% খাঁটি দেশীয় সুতি হ্যান্ডলুম লুঙ্গি, প্রিমিয়াম আরামদায়ক বুনন।',
      'cat-lungi',
      'Lungi',
      'free_size',
      'BOSTROSHOILY',
      950,
      850,
      5,
      1,
      1,
      1,
      1,
      'active',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      'সিরাজগঞ্জ সুতি তাঁতের লুঙ্গি - BOSTROSHOILY',
      'খাঁটি সুতি তাঁতের তৈরি আরামদায়ক লুঙ্গি।'
    );

    // Free size variants for 3 colors
    insertVar.run('var-lun-blue-free', 'prod-lungi-01', 'col-blue', null, 'LUN-BLU-001', 950, 850, 0.4, 25, 5, 1, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-lun-red-free', 'prod-lungi-01', 'col-red', null, 'LUN-RED-001', 950, 850, 0.4, 18, 5, 1, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-lun-green-free', 'prod-lungi-01', 'col-green', null, 'LUN-GRN-001', 950, 850, 0.4, 12, 5, 1, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80');

    // Color galleries for Product 1
    insertGallery.run('gal-lun-blu-1', 'prod-lungi-01', 'col-blue', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertGallery.run('gal-lun-blu-2', 'prod-lungi-01', 'col-blue', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', 0, 2);
    insertGallery.run('gal-lun-red-1', 'prod-lungi-01', 'col-red', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertGallery.run('gal-lun-grn-1', 'prod-lungi-01', 'col-green', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 1, 1);

    // PRODUCT 2: রয়্যাল সেমি সিল্ক এমব্রয়ডারি পাঞ্জাবি (Color + Size)
    insertProd.run(
      'prod-panjabi-01',
      'Royal Embroidered Semi-Silk Panjabi',
      'রয়্যাল সেমি সিল্ক এমব্রয়ডারি পাঞ্জাবি',
      'royal-semi-silk-embroidered-panjabi',
      'BS-PAN-001',
      'উৎসব কিংবা যেকোনো আভিজাত্যের আয়োজনে এই পাঞ্জাবিটি সেরা। বুক ও কলার জুড়ে নিখুঁত মেশিন এমব্রয়ডারি ওয়ার্ক এবং আরামদায়ক প্রিমিয়াম সিল্ক-কটন মিক্সড ফেব্রিক।',
      'উৎসবের আভিজাত্যে রাজকীয় এমব্রয়ডারি সিল্ক পাঞ্জাবি।',
      'cat-panjabi',
      'Panjabi',
      'color_size',
      'BOSTROSHOILY',
      2450,
      2150,
      4,
      1,
      1,
      1,
      1,
      'active',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'রয়্যাল এমব্রয়ডারি পাঞ্জাবি - BOSTROSHOILY',
      'আভিজাত্য ও রুচির সেরা পাঞ্জাবি কালেকশন।'
    );

    // Actual combinations for Royal Blue (M, L, XL)
    insertVar.run('var-pan-blu-m', 'prod-panjabi-01', 'col-blue', 'sz-m', 'PAN-BLU-M', 2450, 2150, 0.5, 14, 3, 1, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-pan-blu-l', 'prod-panjabi-01', 'col-blue', 'sz-l', 'PAN-BLU-L', 2450, 2150, 0.5, 20, 4, 1, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-pan-blu-xl', 'prod-panjabi-01', 'col-blue', 'sz-xl', 'PAN-BLU-XL', 2450, 2150, 0.5, 8, 2, 1, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');

    // Actual combinations for Midnight Black (M, L)
    insertVar.run('var-pan-blk-m', 'prod-panjabi-01', 'col-black', 'sz-m', 'PAN-BLK-M', 2450, 2150, 0.5, 12, 3, 1, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-pan-blk-l', 'prod-panjabi-01', 'col-black', 'sz-l', 'PAN-BLK-L', 2450, 2150, 0.5, 16, 4, 1, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80');

    // Color Galleries for Panjabi
    insertGallery.run('gal-pan-blu-1', 'prod-panjabi-01', 'col-blue', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertGallery.run('gal-pan-blu-2', 'prod-panjabi-01', 'col-blue', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 0, 2);
    insertGallery.run('gal-pan-blk-1', 'prod-panjabi-01', 'col-black', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', 1, 1);

    // PRODUCT 3: ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি (Free Size / Color-only)
    insertProd.run(
      'prod-saree-01',
      'Traditional Dhakai Jamdani Handloom Saree',
      'ঐতিহ্যবাহী ঢাকাই জামদানি তাঁতের শাড়ি',
      'traditional-dhakai-jamdani-handloom-saree',
      'BS-SAR-001',
      'রূপালী ও সুতি জরির নিখুঁত নকশায় হাতে বোনা অভিজাত জামদানি শাড়ি। প্রতিটি শাড়ি তৈরিতে তাঁতিদের সময় লেগেছে ১৫ থেকে ২০ দিন।',
      'খাঁটি ঢাকাই জামদানি, রূপালী জরি ও সুতি সুতায় হাতে বোনা।',
      'cat-saree',
      'Saree',
      'free_size',
      'BOSTROSHOILY',
      4500,
      3850,
      3,
      1,
      1,
      1,
      1,
      'active',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'ঢাকাই জামদানি শাড়ি - BOSTROSHOILY',
      'বাংলার ঐতিহ্যবাহী জামদানি শাড়ির সেরা সমাহার।'
    );

    insertVar.run('var-sar-mar-free', 'prod-saree-01', 'col-maroon', null, 'SAR-MAR-001', 4500, 3850, 0.7, 7, 2, 1, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
    insertVar.run('var-sar-blu-free', 'prod-saree-01', 'col-blue', null, 'SAR-BLU-001', 4500, 3850, 0.7, 5, 2, 1, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80');
    insertGallery.run('gal-sar-mar-1', 'prod-saree-01', 'col-maroon', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertGallery.run('gal-sar-blu-1', 'prod-saree-01', 'col-blue', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', 1, 1);

    // 5. Admins
    const insertAdmin = db.prepare(`
      INSERT INTO admins (id, name, email, phone, role, permissions, status, avatar, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAdmin.run(
      'admin-1',
      'Abdullah (Owner)',
      process.env.INITIAL_ADMIN_EMAIL || 'bastrashoily@gmail.com',
      '01864528488',
      'super_admin',
      '["all", "products.view", "products.create", "products.edit", "products.archive", "orders.view", "orders.edit", "orders.cancel", "orders.refund", "inventory.view", "inventory.adjust", "customers.view", "customers.edit", "payments.manage", "reports.view", "settings.manage", "admins.manage"]',
      'active',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'সদ্য সক্রিয়'
    );

    // 6. Promotional Starter Coupons (Kept clean - configured dynamically via Admin Panel)
    // Clean initial state per user specification

    // 7. Audit Logs
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run('aud-1', 'Abdullah (Owner)', 'System Initialized', 'system', 'bastra_shoily', null, 'Initial schema and clean system initialized', '127.0.0.1');

    // 8. AI Settings
    const insertAISettings = db.prepare(`
      INSERT INTO ai_settings (id, enabled, agent_name, welcome_message, language, response_style, business_description, business_hours, contact_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAISettings.run(
      'default',
      1,
      'বস্ত্র শৈলী (BOSTROSHOILY) এআই কনসালট্যান্ট',
      'আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY)-তে আপনাকে স্বাগতম। আপনি কি লুঙ্গি, পাঞ্জাবি, জামদানি শাড়ি কিংবা সাইজ সম্পর্কে জানতে চাচ্ছেন?',
      'bn',
      'friendly_expert',
      'বস্ত্র শৈলী (BOSTROSHOILY) সিরাজগঞ্জ ও পাবনার সেরা তাঁতের লুঙ্গি, ঐতিহ্যবাহী ঢাকাই জামদানি এবং প্রিমিয়াম পাঞ্জাবির অনলাইন শপ।',
      'সকাল ৯টা থেকে রাত ১১টা (সপ্তাহে ৭ দিন)',
      'হটলাইন: +8801864-528488, ইমেইল: bostroshoily@gmail.com'
    );

    // 15. AI Knowledge
    const insertAIKnowledge = db.prepare(`
      INSERT INTO ai_knowledge (id, category, title, content, active)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertAIKnowledge.run('kno-1', 'delivery', 'ডেলিভারি চার্জ ও সময়', 'সিরাজগঞ্জ জেলায় লোকাল ডেলিভারি চার্জ মাত্র ৭০ টাকা (২৪ ঘণ্টার মধ্যে)। সিরাজগঞ্জের বাইরে সারা বাংলাদেশে ১৩০ টাকা (২-৩ দিনের মধ্যে)। ২,০০০ টাকার বেশি যেকোনো অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি!', 1);
    insertAIKnowledge.run('kno-2', 'return', 'রিটার্ন ও এক্সচেঞ্জ পলিসি', 'ডেলিভারি ম্যানের সামনে প্রোডাক্ট চেক করে নেওয়ার সুযোগ রয়েছে। কোনো সাইজ বা ত্রুটি থাকলে ৭ দিনের মধ্যে সম্পূর্ণ বিনামূল্যে এক্সচেঞ্জ করে দেওয়া হয়।', 1);
    insertAIKnowledge.run('kno-3', 'payment', 'পেমেন্ট মাধ্যম', 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) ছাড়াও বিকাশ, নগদ ও কার্ডের মাধ্যমে নিরাপদ অনলাইন পেমেন্ট করার সুযোগ রয়েছে।', 1);

    db.exec('COMMIT');
    console.log('[DB] BOSTROSHOILY SQLite database seeded successfully.');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('[DB] Failed to seed database:', error);
  }
}

// Ensure all seeded admins have password hashes and salt
export function ensureAdminCredentials() {
  try {
    const adminCols = db.prepare('PRAGMA table_info(admins)').all().map((c: any) => c.name);
    if (!adminCols.includes('password_hash')) db.exec('ALTER TABLE admins ADD COLUMN password_hash TEXT;');
    if (!adminCols.includes('salt')) db.exec('ALTER TABLE admins ADD COLUMN salt TEXT;');
    if (!adminCols.includes('force_password_change')) db.exec('ALTER TABLE admins ADD COLUMN force_password_change INTEGER DEFAULT 0;');
    if (!adminCols.includes('username')) db.exec('ALTER TABLE admins ADD COLUMN username TEXT;');
    if (!adminCols.includes('designation')) db.exec('ALTER TABLE admins ADD COLUMN designation TEXT;');
    if (!adminCols.includes('roles')) db.exec('ALTER TABLE admins ADD COLUMN roles TEXT;');

    try {
      const defPass = (process.env.INITIAL_ADMIN_PASSWORD || '').trim() || 'admin123';
      const { hash: defHash, salt: defSalt } = hashPassword(defPass);
      db.prepare(`
        UPDATE admins 
        SET username = CASE WHEN username = '01864528488' OR username IS NULL OR username = '' THEN 'admin' ELSE username END,
            email = 'bastrashoily@gmail.com',
            phone = '01864528488',
            designation = COALESCE(NULLIF(designation, ''), 'Super Admin / Owner'),
            roles = '["super_admin"]',
            password_hash = COALESCE(NULLIF(password_hash, ''), ?),
            salt = COALESCE(NULLIF(salt, ''), ?),
            force_password_change = 0
        WHERE id = 'admin-1' OR role = 'super_admin'
      `).run(defHash, defSalt);
    } catch {}

    // Seed realistic active staff accounts if only super_admin exists
    try {
      const existingStaff = db.prepare("SELECT COUNT(*) as count FROM admins WHERE id != 'admin-1' AND role != 'super_admin'").get() as { count: number };
      if (!existingStaff || existingStaff.count === 0) {
        const staffSeedData = [
          {
            id: 'staff-manager',
            name: 'আহমেদ হাসান (Ahmed Hasan)',
            username: 'manager',
            email: 'manager@bastrashoily.com',
            phone: '01711000001',
            designation: 'জেনারেল ম্যানেজার (Store Manager)',
            role: 'manager',
            roles: JSON.stringify(['manager']),
            permissions: JSON.stringify(['all']),
            password: 'staff@manager123',
          },
          {
            id: 'staff-prod-mgr',
            name: 'তানভীর আহমেদ (Tanvir Ahmed)',
            username: 'prod_manager',
            email: 'products@bastrashoily.com',
            phone: '01711000002',
            designation: 'প্রোডাক্ট ম্যানেজার (Product Manager)',
            role: 'product_manager',
            roles: JSON.stringify(['product_manager']),
            permissions: JSON.stringify(['products.view', 'products.create', 'products.edit', 'products.archive', 'inventory.view', 'inventory.adjust']),
            password: 'staff@product123',
          },
          {
            id: 'staff-order-mgr',
            name: 'মাহমুদুল হক (Mahmudul Haque)',
            username: 'order_manager',
            email: 'orders@bastrashoily.com',
            phone: '01711000003',
            designation: 'অর্ডার ম্যানেজার (Order Manager)',
            role: 'order_manager',
            roles: JSON.stringify(['order_manager']),
            permissions: JSON.stringify(['orders.view', 'orders.edit', 'orders.cancel', 'orders.refund', 'inventory.view', 'customers.view']),
            password: 'staff@order123',
          },
          {
            id: 'staff-accountant',
            name: 'রাশেদ খান (Rashed Khan)',
            username: 'accountant',
            email: 'accounts@bastrashoily.com',
            phone: '01711000004',
            designation: 'চিফ একাউন্টেন্ট (Chief Accountant)',
            role: 'accountant',
            roles: JSON.stringify(['accountant']),
            permissions: JSON.stringify(['payments.manage', 'reports.view', 'orders.view']),
            password: 'staff@account123',
          },
          {
            id: 'staff-inv-mgr',
            name: 'কামরুল ইসলাম (Kamrul Islam)',
            username: 'inv_manager',
            email: 'inventory@bastrashoily.com',
            phone: '01711000005',
            designation: 'ইনভেন্টরি ম্যানেজার (Inventory Manager)',
            role: 'inventory_manager',
            roles: JSON.stringify(['inventory_manager']),
            permissions: JSON.stringify(['inventory.view', 'inventory.adjust', 'products.view']),
            password: 'staff@inventory123',
          },
          {
            id: 'staff-cust-support',
            name: 'ফারজানা আক্তার (Farzana Akter)',
            username: 'customer_support',
            email: 'support@bastrashoily.com',
            phone: '01711000006',
            designation: 'কাস্টমার সাপোর্ট লিড (Customer Support)',
            role: 'customer_support',
            roles: JSON.stringify(['customer_support']),
            permissions: JSON.stringify(['orders.view', 'customers.view', 'complaints.manage', 'reviews.manage']),
            password: 'staff@support123',
          },
          {
            id: 'staff-mkt-mgr',
            name: 'সাকিব আল হাসান (Sakib Al Hasan)',
            username: 'marketing_manager',
            email: 'marketing@bastrashoily.com',
            phone: '01711000007',
            designation: 'মার্কেটিং ম্যানেজার (Marketing Manager)',
            role: 'marketing_manager',
            roles: JSON.stringify(['marketing_manager']),
            permissions: JSON.stringify(['marketing.manage', 'coupons.manage', 'campaigns.manage', 'landing_pages.manage', 'banners.manage']),
            password: 'staff@marketing123',
          },
        ];

        const insertStmt = db.prepare(`
          INSERT INTO admins (id, name, username, email, phone, designation, role, roles, permissions, password_hash, salt, status, force_password_change)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0)
        `);

        for (const st of staffSeedData) {
          const { hash, salt } = hashPassword(st.password);
          insertStmt.run(st.id, st.name, st.username, st.email, st.phone, st.designation, st.role, st.roles, st.permissions, hash, salt);
        }
      }
    } catch (seedErr) {
      console.warn('[DB] Staff seed warning:', seedErr);
    }

    const prodCols = db.prepare('PRAGMA table_info(products)').all().map((c: any) => c.name);
    if (!prodCols.includes('size_chart')) db.exec('ALTER TABLE products ADD COLUMN size_chart TEXT;');
  } catch {
    try { db.exec('ALTER TABLE admins ADD COLUMN force_password_change INTEGER DEFAULT 0;'); } catch {}
  }

  try {
    const orderCols = db.prepare('PRAGMA table_info(orders)').all().map((c: any) => c.name);
    if (!orderCols.includes('timer_offer_name')) db.exec('ALTER TABLE orders ADD COLUMN timer_offer_name TEXT;');
    if (!orderCols.includes('timer_offer_discount')) db.exec('ALTER TABLE orders ADD COLUMN timer_offer_discount REAL DEFAULT 0;');
    if (!orderCols.includes('courier_provider')) db.exec('ALTER TABLE orders ADD COLUMN courier_provider TEXT;');
    if (!orderCols.includes('courier_tracking_code')) db.exec('ALTER TABLE orders ADD COLUMN courier_tracking_code TEXT;');
    if (!orderCols.includes('courier_consignment_id')) db.exec('ALTER TABLE orders ADD COLUMN courier_consignment_id TEXT;');
    if (!orderCols.includes('courier_status')) db.exec('ALTER TABLE orders ADD COLUMN courier_status TEXT;');
    if (!orderCols.includes('ip_address')) db.exec('ALTER TABLE orders ADD COLUMN ip_address TEXT;');
    if (!orderCols.includes('user_agent')) db.exec('ALTER TABLE orders ADD COLUMN user_agent TEXT;');
    if (!orderCols.includes('fraud_score')) db.exec('ALTER TABLE orders ADD COLUMN fraud_score INTEGER DEFAULT 0;');
    if (!orderCols.includes('fraud_status')) db.exec("ALTER TABLE orders ADD COLUMN fraud_status TEXT DEFAULT 'safe';");

    const custCols = db.prepare('PRAGMA table_info(customers)').all().map((c: any) => c.name);
    if (!custCols.includes('ip_address')) db.exec('ALTER TABLE customers ADD COLUMN ip_address TEXT;');
    if (!custCols.includes('user_agent')) db.exec('ALTER TABLE customers ADD COLUMN user_agent TEXT;');
    if (!custCols.includes('risk_level')) db.exec("ALTER TABLE customers ADD COLUMN risk_level TEXT DEFAULT 'low';");
    if (!custCols.includes('cancelled_orders')) db.exec('ALTER TABLE customers ADD COLUMN cancelled_orders INTEGER DEFAULT 0;');
    if (!custCols.includes('is_fake')) db.exec('ALTER TABLE customers ADD COLUMN is_fake INTEGER DEFAULT 0;');
    if (!custCols.includes('notes')) db.exec('ALTER TABLE customers ADD COLUMN notes TEXT;');
  } catch {}

  try {
    db.exec('CREATE TABLE IF NOT EXISTS store_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);');
  } catch {}

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS customer_cart (
        id TEXT PRIMARY KEY,
        customer_phone TEXT NOT NULL,
        product_id TEXT NOT NULL,
        variant_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        price REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_phone, product_id, variant_id)
      );
    `);
  } catch {}

  const initialPasswordEnv = (process.env.INITIAL_ADMIN_PASSWORD || '').trim();
  const admins = db.prepare('SELECT id, email, password_hash FROM admins').all() as any[];
  const updateStmt = db.prepare('UPDATE admins SET password_hash = ?, salt = ?, force_password_change = ? WHERE id = ?');

  for (const admin of admins) {
    if (!admin.password_hash) {
      if (initialPasswordEnv) {
        const { hash, salt } = hashPassword(initialPasswordEnv);
        updateStmt.run(hash, salt, 0, admin.id);
        console.log(`[Security Notice] Admin ${admin.email} password initialized from INITIAL_ADMIN_PASSWORD environment variable.`);
      } else {
        // In production and by default, never assign a predictable fallback password.
        // Generate an unguessable cryptographic random hash so account cannot be accessed until explicitly configured or recovered.
        const unguessableSecret = crypto.randomBytes(32).toString('hex');
        const { hash, salt } = hashPassword(unguessableSecret);
        updateStmt.run(hash, salt, 1, admin.id);
        console.warn(`[Security Warning] Admin ${admin.email} had no password configured. Assigned unguessable random credentials. Use CLI recovery (scripts/recover-admin.js) or OTP recovery to set a password.`);
      }
    }
  }

  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}
}

// Server-side Recovery for Existing Super Admin Account
// Operates ONLY on verified existing admin-1 / super_admin row. Never duplicates admin accounts.
// Never logs passwords or hashes. Can be fully disabled by unsetting ADMIN_RECOVERY_KEY.
export function applyAdminRecoveryIfRequested(): { recovered: boolean; message: string } {
  const recoveryKey = (process.env.ADMIN_RECOVERY_KEY || process.env.ADMIN_RECOVERY_SECRET || '').trim();
  const recoveryPass = (process.env.ADMIN_RECOVERY_PASSWORD || '').trim();

  if (!recoveryKey || !recoveryPass) {
    return { recovered: false, message: 'No recovery requested' };
  }

  if (recoveryPass.length < 6) {
    console.warn('[Security Warning] ADMIN_RECOVERY_PASSWORD must be at least 6 characters. Recovery skipped.');
    return { recovered: false, message: 'Recovery password must be at least 6 characters' };
  }

  try {
    const existingKeyRow = db.prepare("SELECT value FROM store_settings WHERE key = 'admin_recovery_applied_key'").get() as any;
    if (existingKeyRow && existingKeyRow.value === recoveryKey) {
      return { recovered: false, message: 'Recovery key already applied' };
    }
  } catch {}

  const targetAdmin = db.prepare("SELECT id, name, email, phone FROM admins WHERE id = 'admin-1' OR role = 'super_admin' ORDER BY id ASC LIMIT 1").get() as any;
  if (!targetAdmin) {
    console.warn('[Security Warning] No super admin account found in database to recover.');
    return { recovered: false, message: 'No super admin found' };
  }

  const { hash, salt } = hashPassword(recoveryPass);
  db.prepare("UPDATE admins SET password_hash = ?, salt = ?, force_password_change = 0, status = 'active' WHERE id = ?").run(hash, salt, targetAdmin.id);

  // Clear failed login attempts so rate limit lockout is immediately removed
  try {
    db.prepare("DELETE FROM login_activity WHERE status = 'failed' AND (email = ? OR email = ?)").run(targetAdmin.email, targetAdmin.phone);
  } catch {}

  // Record audit trail without logging plain password or hash
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${crypto.randomUUID()}`,
      targetAdmin.name || 'Abdullah (Owner)',
      'Admin Account Recovered via Recovery Key',
      'auth',
      targetAdmin.id,
      null,
      'Super admin password successfully recovered via server environment configuration',
      '127.0.0.1'
    );
  } catch {}

  // Mark applied key
  try {
    db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ('admin_recovery_applied_key', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(recoveryKey, recoveryKey);
  } catch {}

  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}

  console.log(`[Security Alert] Super admin (${targetAdmin.email}) credentials successfully recovered via environment configuration. Please remove ADMIN_RECOVERY_KEY from your environment settings to disable recovery mode.`);
  return { recovered: true, message: 'Super admin credentials recovered successfully' };
}

// Interactive / API Recovery Procedure Protected by Server-Side Secret Key
export function performAdminRecoveryWithSecret(secret: string, newPassword: string, ip: string = '127.0.0.1'): { success: boolean; error?: string; message?: string } {
  const serverKey = (process.env.ADMIN_RECOVERY_KEY || process.env.ADMIN_RECOVERY_SECRET || '').trim();
  if (!serverKey) {
    return {
      success: false,
      error: 'সার্ভারে রিকভারি মোড নিষ্ক্রিয় রয়েছে। Render Dashboard-এ ADMIN_RECOVERY_KEY এনভায়রনমেন্ট ভ্যারিয়েবল সেট করে পুনরায় চেষ্টা করুন।',
    };
  }

  // IP rate limiting against brute force attempts on server recovery secret
  try {
    const ipFailures = db.prepare(`
      SELECT COUNT(*) as count FROM otp_rate_limits
      WHERE ip_address = ? AND action = 'secret_recover_fail'
        AND datetime(created_at) >= datetime('now', '-15 minutes')
    `).get(ip) as { count: number };
    if (ipFailures && ipFailures.count >= 5) {
      return { success: false, error: 'অতিরিক্ত ভুল রিকভারি সিক্রেট কি প্রচেষ্টার কারণে রিকভারি সাময়িকভাবে স্থগিত করা হয়েছে। ১৫ মিনিট পর পুনরায় চেষ্টা করুন।' };
    }
  } catch {}

  // Single-use enforcement: check if this secret key was already successfully applied
  try {
    const existingKeyRow = db.prepare("SELECT value FROM store_settings WHERE key = 'admin_recovery_applied_key'").get() as any;
    if (existingKeyRow && existingKeyRow.value === serverKey) {
      return {
        success: false,
        error: 'এই রিকভারি সিক্রেট কি-টি ইতিমধ্যে ব্যবহার করা হয়েছে (Single-Use)। পুনরায় ব্যবহারের জন্য Render Dashboard-এ নতুন ADMIN_RECOVERY_KEY সেট করুন।',
      };
    }
  } catch {}

  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    return { success: false, error: 'সার্ভার রিকভারি সিক্রেট কি প্রদান করা আবশ্যক।' };
  }

  // Timing-safe constant-time comparison to prevent timing attacks
  const inputBuf = Buffer.from(secret.trim());
  const expectedBuf = Buffer.from(serverKey);
  if (inputBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(inputBuf, expectedBuf)) {
    try {
      db.prepare(`
        INSERT INTO otp_rate_limits (id, identifier, ip_address, action, created_at)
        VALUES (?, 'server_recovery_secret', ?, 'secret_recover_fail', CURRENT_TIMESTAMP)
      `).run(`rl-${crypto.randomUUID()}`, ip);
    } catch {}
    return { success: false, error: 'ভুল রিকভারি সিক্রেট কি! সঠিক কি দিয়ে পুনরায় চেষ্টা করুন।' };
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
    return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
  }

  const targetAdmin = db.prepare("SELECT id, name, email, phone FROM admins WHERE id = 'admin-1' OR role = 'super_admin' ORDER BY id ASC LIMIT 1").get() as any;
  if (!targetAdmin) {
    return { success: false, error: 'ডেটাবেসে কোনো সক্রিয় সুপার এডমিন একাউন্ট পাওয়া যায়নি।' };
  }

  const { hash, salt } = hashPassword(newPassword.trim());
  db.prepare("UPDATE admins SET password_hash = ?, salt = ?, force_password_change = 0, status = 'active' WHERE id = ?").run(hash, salt, targetAdmin.id);

  // Mark secret key as applied in store_settings (Enforce single-use)
  try {
    db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ('admin_recovery_applied_key', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(serverKey);
  } catch {}

  // Revoke all existing admin sessions for this admin (Mandatory session revocation)
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(targetAdmin.id);
  db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);
  db.prepare('UPDATE admin_password_resets SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);

  // Clear failed login attempts so rate limit lockout is immediately removed
  try {
    db.prepare("DELETE FROM login_activity WHERE status = 'failed' AND (email = ? OR email = ?)").run(targetAdmin.email, targetAdmin.phone);
  } catch {}

  // Record audit trail without logging plain password or hash
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${crypto.randomUUID()}`,
      targetAdmin.name || 'Abdullah (Owner)',
      'Admin Account Recovered via Protected Secret',
      'auth',
      targetAdmin.id,
      null,
      'Super admin password successfully recovered via one-time protected recovery secret',
      ip
    );
  } catch {}

  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}

  return {
    success: true,
    message: 'এডমিন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
  };
}

// -----------------------------------------------------------------------------
// SECURE ADMIN OTP & PASSWORD RESET RECOVERY ENGINE
// -----------------------------------------------------------------------------

export function maskDestination(dest: string, type: 'email' | 'phone'): string {
  if (!dest) return '';
  const trimmed = dest.trim();
  if (type === 'email') {
    const parts = trimmed.split('@');
    if (parts.length !== 2) return '*****';
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) {
      return `${name[0]}*****@${domain}`;
    }
    return `${name.slice(0, 2)}*****${name.slice(-1)}@${domain}`;
  } else {
    // Phone
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length <= 4) return '01864****88';
    const firstPart = digits.slice(0, 5);
    const lastPart = digits.slice(-2);
    return `${firstPart}****${lastPart}`;
  }
}

export function hashOtp(otp: string, salt: string): string {
  let pepper = process.env.OTP_SECRET;
  if (!pepper || !pepper.trim() || pepper.trim().length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[SECURITY FATAL] Missing or insecure required OTP_SECRET environment variable in production! Configure a secure OTP_SECRET (at least 16 characters) in Render Dashboard.');
    }
    pepper = 'dev-bastra-shoily-otp-pepper-secret-key';
  }
  return crypto.createHmac('sha256', salt + pepper.trim()).update(otp.trim()).digest('hex');
}

export function verifyOtpHash(otp: string, salt: string, storedHash: string): boolean {
  if (!otp || !salt || !storedHash) return false;
  try {
    const computed = hashOtp(otp, salt);
    const bufA = Buffer.from(computed, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Resolves existing super-admin from configured SQLite database
export function getSuperAdminForRecovery(identifier?: string): any {
  const rawId = (identifier || '').trim();
  if (!rawId) {
    return db.prepare("SELECT id, username, name, email, phone, role, status FROM admins WHERE id = 'admin-1' OR role = 'super_admin' ORDER BY id ASC LIMIT 1").get();
  }

  const cleanEmail = rawId.toLowerCase();
  const cleanDigits = rawId.replace(/\D/g, '');
  let cleanPhone = cleanDigits;
  if (cleanPhone.startsWith('8801')) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.startsWith('880')) {
    cleanPhone = '0' + cleanPhone.slice(3);
  } else if (!cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '0' + cleanPhone;
  }

  return db.prepare(`
    SELECT id, username, name, email, phone, role, status
    FROM admins
    WHERE (
      LOWER(email) = ?
      OR LOWER(COALESCE(username, '')) = ?
      OR LOWER(name) = ?
      OR phone = ?
      OR phone = ?
      OR REPLACE(REPLACE(phone, '-', ''), ' ', '') = ?
      OR REPLACE(REPLACE(phone, '-', ''), ' ', '') = ?
      OR (LOWER(?) IN ('bastrashoily@gmail.com', 'admin@bastrashoily.com', 'admin') AND (id = 'admin-1' OR role = 'super_admin'))
      OR (? IN ('01864528488', '8801864528488') AND (id = 'admin-1' OR role = 'super_admin'))
    )
    AND (role = 'super_admin' OR id = 'admin-1')
    AND (status = 'active' OR status IS NULL)
    LIMIT 1
  `).get(cleanEmail, cleanEmail, cleanEmail, rawId, cleanPhone, cleanDigits, cleanPhone, cleanEmail, cleanDigits);
}

// Rate-limiting check: 60s cooldown between requests, max 4 requests per 15 minutes
export function checkOtpRateLimit(identifier: string, ip: string): { allowed: boolean; remainingCooldownSeconds?: number; error?: string } {
  try {
    // 1. Check 60-second cooldown on recent request for this IP or identifier
    const recent = db.prepare(`
      SELECT created_at FROM otp_rate_limits
      WHERE (identifier = ? OR ip_address = ?)
        AND action = 'request'
        AND datetime(created_at) >= datetime('now', '-60 seconds')
      ORDER BY datetime(created_at) DESC LIMIT 1
    `).get(identifier, ip) as any;

    if (recent) {
      const createdTime = new Date(recent.created_at + 'Z').getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
      const remaining = Math.max(1, 60 - elapsed);
      return {
        allowed: false,
        remainingCooldownSeconds: remaining,
        error: `অনুগ্রহ করে অপেক্ষা করুন। নতুন ওটিপি পাঠানোর জন্য আরও ${remaining} সেকেন্ড অপেক্ষা করতে হবে।`,
      };
    }

    // 2. Max 4 OTP requests in 15 minutes
    const windowCount = db.prepare(`
      SELECT COUNT(*) as count FROM otp_rate_limits
      WHERE (identifier = ? OR ip_address = ?)
        AND action = 'request'
        AND datetime(created_at) >= datetime('now', '-15 minutes')
    `).get(identifier, ip) as { count: number };

    if (windowCount && windowCount.count >= 4) {
      return {
        allowed: false,
        error: 'নিরাপত্তার স্বার্থে অতিরিক্ত ওটিপি অনুরোধের কারণে সাময়িক বিরতি দেওয়া হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর পুনরায় চেষ্টা করুন।',
      };
    }

    return { allowed: true };
  } catch (e) {
    console.warn('Rate limit query warning:', e);
    return { allowed: true };
  }
}

// Generates cryptographically secure 6-digit OTP, stores keyed hash (never plaintext)
export function createAdminOtpRequest(
  adminId: string,
  channel: 'email' | 'sms',
  destinationMasked: string,
  ip: string
): { otp: string; requestId: string } {
  // 1. Invalidate any previous unverified OTP requests for this admin
  db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE admin_id = ? AND is_used = 0').run(adminId);

  // 2. Generate random 6-digit OTP (100000 - 999999)
  const otp = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(otp, salt);
  const requestId = `otp-${crypto.randomUUID()}`;

  // 3. Expire in exactly 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // 4. Insert OTP record with keyed hash ONLY (Never plaintext)
  db.prepare(`
    INSERT INTO admin_otp_requests (
      id, admin_id, channel, destination_masked, otp_hash, salt, attempts, max_attempts, is_used, expires_at, created_at, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 0, ?, CURRENT_TIMESTAMP, ?)
  `).run(requestId, adminId, channel, destinationMasked, otpHash, salt, expiresAt, ip);

  // 5. Record rate limit
  try {
    db.prepare(`
      INSERT INTO otp_rate_limits (id, identifier, ip_address, action, created_at)
      VALUES (?, ?, ?, 'request', CURRENT_TIMESTAMP)
    `).run(`rl-${crypto.randomUUID()}`, adminId, ip);
  } catch {}

  // Return OTP for immediate memory dispatch ONLY; never persisted to DB or logged
  return { otp, requestId };
}

// Verifies 6-digit OTP against keyed hash; generates single-use resetToken
export function verifyAdminOtp(
  adminId: string,
  inputOtp: string,
  ip: string
): { success: boolean; resetToken?: string; error?: string } {
  const trimmedOtp = (inputOtp || '').trim();
  if (!trimmedOtp || trimmedOtp.length !== 6) {
    return { success: false, error: 'অনুগ্রহ করে সঠিক ৬-সংখ্যার ওটিপি কোড প্রদান করুন।' };
  }

  // IP rate limiting against brute force OTP verification attempts
  try {
    const ipFailures = db.prepare(`
      SELECT COUNT(*) as count FROM otp_rate_limits
      WHERE ip_address = ? AND action = 'verify_fail'
        AND datetime(created_at) >= datetime('now', '-15 minutes')
    `).get(ip) as { count: number };
    if (ipFailures && ipFailures.count >= 10) {
      return { success: false, error: 'অতিরিক্ত ব্যর্থ ওটিপি প্রচেষ্টার কারণে এই আইপি সাময়িকভাবে ব্লক করা হয়েছে। ১৫ মিনিট পর পুনরায় চেষ্টা করুন।' };
    }
  } catch {}

  // 1. Fetch latest active OTP request for this admin
  const row = db.prepare(`
    SELECT * FROM admin_otp_requests
    WHERE admin_id = ? AND is_used = 0
    ORDER BY datetime(created_at) DESC LIMIT 1
  `).get(adminId) as any;

  if (!row) {
    return { success: false, error: 'কোনো সক্রিয় ওটিপি অনুরোধ পাওয়া যায়নি। অনুগ্রহ করে নতুন ওটিপি কোড সংগ্রহ করুন।' };
  }

  // 2. Check 5-minute expiration
  const expireTime = new Date(row.expires_at).getTime();
  if (Date.now() > expireTime) {
    db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE id = ?').run(row.id);
    return { success: false, error: 'ওটিপির ৫ মিনিটের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন ওটিপি কোড সংগ্রহ করুন।' };
  }

  // 3. Check max attempts (maximum 3 failed attempts)
  if (row.attempts >= row.max_attempts) {
    db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE id = ?').run(row.id);
    return { success: false, error: 'সর্বোচ্চ বার ভুল ওটিপি প্রদানের কারণে কোডটি বাতিল করা হয়েছে। অনুগ্রহ করে নতুন কোড সংগ্রহ করুন।' };
  }

  // 4. Verify keyed hash using constant-time comparison
  const isValid = verifyOtpHash(trimmedOtp, row.salt, row.otp_hash);

  if (!isValid) {
    const newAttempts = row.attempts + 1;
    const isExceeded = newAttempts >= row.max_attempts;
    db.prepare('UPDATE admin_otp_requests SET attempts = ?, is_used = ? WHERE id = ?').run(
      newAttempts,
      isExceeded ? 1 : 0,
      row.id
    );

    // Record failed attempt
    try {
      db.prepare(`
        INSERT INTO otp_rate_limits (id, identifier, ip_address, action, created_at)
        VALUES (?, ?, ?, 'verify_fail', CURRENT_TIMESTAMP)
      `).run(`rl-${crypto.randomUUID()}`, adminId, ip);
    } catch {}

    const remaining = Math.max(0, row.max_attempts - newAttempts);
    return {
      success: false,
      error: isExceeded
        ? 'পরপর ৩ বার ভুল ওটিপি দেওয়ায় কোডটি বাতিল করা হয়েছে। অনুগ্রহ করে নতুন ওটিপি সংগ্রহ করুন।'
        : `ভুল ওটিপি কোড! আর ${remaining} বার চেষ্টা করতে পারবেন।`,
    };
  }

  // 5. Successful verification: Invalidate OTP immediately (one-time use only)
  db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE id = ?').run(row.id);

  // 6. Generate single-use resetToken (valid for 10 minutes)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO admin_password_resets (token, admin_id, otp_request_id, is_used, expires_at, created_at, ip_address)
    VALUES (?, ?, ?, 0, ?, CURRENT_TIMESTAMP, ?)
  `).run(resetToken, adminId, row.id, resetExpiresAt, ip);

  try {
    db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${crypto.randomUUID()}`,
      'Admin Verification',
      'OTP Verified Successfully',
      'auth',
      adminId,
      null,
      `OTP verified via ${row.channel}`,
      ip
    );
  } catch {}

  return { success: true, resetToken };
}

// Resets super admin password using verified single-use resetToken
export function resetAdminPasswordWithToken(
  resetToken: string,
  newPassword: string,
  ip: string
): { success: boolean; error?: string; message?: string } {
  if (!resetToken || typeof resetToken !== 'string') {
    return { success: false, error: 'পাসওয়ার্ড রিসেট টোকেন প্রদান করা আবশ্যক।' };
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
    return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
  }

  // Rate limiting against brute force reset token attempts
  try {
    const ipFailures = db.prepare(`
      SELECT COUNT(*) as count FROM otp_rate_limits
      WHERE ip_address = ? AND action = 'reset_fail'
        AND datetime(created_at) >= datetime('now', '-15 minutes')
    `).get(ip) as { count: number };
    if (ipFailures && ipFailures.count >= 5) {
      return { success: false, error: 'অতিরিক্ত ব্যর্থ পাসওয়ার্ড রিসেট প্রচেষ্টার কারণে এই আইপি সাময়িকভাবে ব্লক করা হয়েছে। ১৫ মিনিট পর পুনরায় চেষ্টা করুন।' };
    }
  } catch {}

  // 1. Validate resetToken
  const resetRow = db.prepare(`
    SELECT * FROM admin_password_resets
    WHERE token = ? AND is_used = 0 AND datetime(expires_at) > datetime('now')
  `).get(resetToken.trim()) as any;

  if (!resetRow) {
    try {
      db.prepare(`
        INSERT INTO otp_rate_limits (id, identifier, ip_address, action, created_at)
        VALUES (?, 'password_reset_token', ?, 'reset_fail', CURRENT_TIMESTAMP)
      `).run(`rl-${crypto.randomUUID()}`, ip);
    } catch {}
    return { success: false, error: 'পাসওয়ার্ড রিসেট টোকেনটি অবৈধ অথবা মেয়াদোত্তীর্ণ হয়েছে। পুনরায় ওটিপি সংগ্রহ করুন।' };
  }

  // 2. Invalidate reset token immediately (single-use)
  db.prepare('UPDATE admin_password_resets SET is_used = 1 WHERE token = ?').run(resetRow.token);

  // 3. Find target admin in SQLite database
  const targetAdmin = db.prepare('SELECT id, name, email, phone FROM admins WHERE id = ?').get(resetRow.admin_id) as any;
  if (!targetAdmin) {
    return { success: false, error: 'ডেটাবেসে সংশ্লিষ্ট এডমিন একাউন্টটি পাওয়া যায়নি।' };
  }

  // 4. Hash new password using existing Scrypt implementation
  const { hash, salt } = hashPassword(newPassword.trim());

  // 5. Update only the verified existing super admin row
  db.prepare(`
    UPDATE admins
    SET password_hash = ?, salt = ?, force_password_change = 0, status = 'active'
    WHERE id = ?
  `).run(hash, salt, targetAdmin.id);

  // 6. Revoke all existing sessions for this admin (Mandatory session revocation)
  db.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(targetAdmin.id);

  // 7. Invalidate all pending OTPs and other reset tokens for this admin
  db.prepare('UPDATE admin_otp_requests SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);
  db.prepare('UPDATE admin_password_resets SET is_used = 1 WHERE admin_id = ?').run(targetAdmin.id);

  // 8. Clear any temporary rate-limit lockouts in login_activity
  try {
    db.prepare("DELETE FROM login_activity WHERE status = 'failed' AND (email = ? OR email = ?)").run(
      targetAdmin.email,
      targetAdmin.phone || ''
    );
  } catch {}

  // 9. Record audit trail without logging plain password or hash
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, admin_name, action, target_type, target_id, previous_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `aud-${crypto.randomUUID()}`,
      targetAdmin.name || 'Abdullah (Owner)',
      'Password Reset via Verified OTP',
      'auth',
      targetAdmin.id,
      null,
      'Super admin password successfully updated following verified OTP recovery',
      ip
    );
  } catch {}

  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {}

  return {
    success: true,
    message: 'এডমিন পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে। অনুগ্রহ করে নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
  };
}

// Wipe all demo products, variants, orders, customers, and non-owner staff for production
export function wipeAllDemoData(): {
  deletedProducts: number;
  deletedVariants: number;
  deletedOrders: number;
  deletedCustomers: number;
} {
  db.exec('BEGIN IMMEDIATE;');
  try {
    const pCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    const vCount = (db.prepare('SELECT COUNT(*) as count FROM product_variants').get() as any).count;
    const oCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
    const cCount = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any).count;

    db.exec('DELETE FROM order_timeline;');
    db.exec('DELETE FROM order_items;');
    db.exec('DELETE FROM orders;');
    db.exec('DELETE FROM customers;');
    db.exec('DELETE FROM customer_cart;');
    db.exec('DELETE FROM color_galleries;');
    db.exec('DELETE FROM variant_gallery_overrides;');
    db.exec('DELETE FROM product_variants;');
    db.exec('DELETE FROM product_reviews;');
    db.exec('DELETE FROM inventory_transactions;');
    db.exec('DELETE FROM products;');
    db.exec('DELETE FROM complaints;');
    db.exec('DELETE FROM tasks;');
    db.exec('DELETE FROM notifications;');
    // Retain only primary super admin
    db.exec("DELETE FROM admins WHERE id != 'admin-1' AND role != 'super_admin';");

    // Mark catalog as cleaned and products as seeded so demo items are never automatically regenerated
    db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ('catalog_cleaned', 'true', CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP
    `).run();

    db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ('products_seeded', 'true', CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = 'true', updated_at = CURRENT_TIMESTAMP
    `).run();

    db.exec('COMMIT;');

    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch {}

    return {
      deletedProducts: pCount,
      deletedVariants: vCount,
      deletedOrders: oCount,
      deletedCustomers: cCount,
    };
  } catch (err) {
    try {
      db.exec('ROLLBACK;');
    } catch {}
    throw err;
  }
}

export const wipeDemoProducts = wipeAllDemoData;

// Ensure authentic catalog state without polluting with demo products
export function ensureAllProductsSeeded() {
  try {
    // Check if store was marked clean or already initialized
    const cleaned = db.prepare("SELECT value FROM store_settings WHERE key = 'catalog_cleaned'").get() as any;
    if (cleaned && cleaned.value === 'true') {
      return;
    }
    const seeded = db.prepare("SELECT value FROM store_settings WHERE key = 'products_seeded'").get() as any;
    if (seeded && seeded.value === 'true') {
      return;
    }
  } catch {}

  const countObj = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countObj && countObj.count > 0) {
    try {
      db.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('products_seeded', 'true')").run();
    } catch {}
    return;
  }

  // Never seed demo products if in production or user requested clean catalog
  if (process.env.SKIP_DEMO_SEED === 'true' || process.env.NODE_ENV === 'production') {
    return;
  }

  const insertProd = db.prepare(`
    INSERT OR IGNORE INTO products (
      id, name, bangla_name, slug, sku, description, short_description, 
      category_id, sub_category, variant_config, brand, price, discount_price, 
      low_stock_threshold, is_featured, is_new_arrival, is_best_seller, is_offer, 
      status, main_image, seo_title, seo_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVar = db.prepare(`
    INSERT OR IGNORE INTO product_variants (
      id, product_id, color_id, size_id, sku, price, offer_price, weight, stock, low_stock_threshold, active, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertGallery = db.prepare(`
    INSERT OR IGNORE INTO color_galleries (id, product_id, color_id, image_url, is_main, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Product 4: Ultimate Relaxed Heavyweight Combed Cotton Tee
  insertProd.run(
    'prod-0',
    'Ultimate Unisex Relaxed Heavyweight Tee',
    'প্রিমিয়াম হেভিওয়েট রিল্যাক্সড কটন টি-শার্ট',
    'ultimate-unisex-relaxed-heavyweight-tee',
    'TS-ULT-01',
    'Crafted from 100% long-staple compact combed cotton (220 GSM), the Ultimate Unisex Tee features a signature relaxed silhouette, reinforced ribbed crew neckline, and breathable handfeel.',
    '১০০% কম্বড কমপ্যাক্ট কটন ২২০ জিএসএম রিল্যাক্সড টি-শার্ট।',
    'cat-tshirt',
    'T-Shirt',
    'color_size',
    'BOSTROSHOILY',
    2000,
    1850,
    5,
    1,
    1,
    1,
    0,
    'active',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000',
    'Ultimate Unisex Relaxed Heavyweight Tee | BOSTROSHOILY',
    'Shop premium 220 GSM combed cotton heavyweight t-shirt in Bangladesh.'
  );

  insertVar.run('var-0-aby-s', 'prod-0', 'col-black', 'sz-s', 'TS-ABY-S', 2000, 1850, 0.3, 8, 2, 1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000');
  insertVar.run('var-0-aby-m', 'prod-0', 'col-black', 'sz-m', 'TS-ABY-M', 2000, 1850, 0.3, 10, 2, 1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000');
  insertVar.run('var-0-aby-l', 'prod-0', 'col-black', 'sz-l', 'TS-ABY-L', 2000, 1850, 0.3, 6, 2, 1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000');
  insertVar.run('var-0-brn-m', 'prod-0', 'col-brown', 'sz-m', 'TS-BRN-M', 2100, 1950, 0.3, 8, 2, 1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000');
  insertVar.run('var-0-brn-l', 'prod-0', 'col-brown', 'sz-l', 'TS-BRN-L', 2100, 1950, 0.3, 7, 2, 1, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000');

  insertGallery.run('gal-0-blk-1', 'prod-0', 'col-black', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000', 1, 1);
  insertGallery.run('gal-0-brn-1', 'prod-0', 'col-brown', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1000', 1, 1);

  // Product 5: Premium Handloom Check Lungi (Olive Green & Red)
  insertProd.run(
    'prod-1',
    'Heritage Handloom Cotton Check Lungi',
    'ঐতিহ্যবাহী সিরাজগঞ্জ চেক তাঁতের সুতি লুঙ্গি',
    'heritage-handloom-cotton-check-lungi',
    'LUN-CHK-002',
    'খাঁটি সুতি সুতায় সিরাজগঞ্জের অভিজ্ঞ তাঁতিদের দক্ষ হাতে বোনা আরামদায়ক চেক লুঙ্গি। পাকা রঙ এবং টেকসই ফিনিশিং।',
    'সিরাজগঞ্জের ঐতিহ্যবাহী ১০০ কাউন্ট চেক সুতি লুঙ্গি।',
    'cat-lungi',
    'Lungi',
    'free_size',
    'BOSTROSHOILY',
    1150,
    980,
    5,
    1,
    0,
    1,
    1,
    'active',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    'Heritage Handloom Cotton Check Lungi | BOSTROSHOILY',
    'Authentic Sirajganj check lungi handloom cotton.'
  );
  insertVar.run('var-1-grn-free', 'prod-1', 'col-green', null, 'LUN-CHK-GRN', 1150, 980, 0.4, 15, 3, 1, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800');
  insertVar.run('var-1-red-free', 'prod-1', 'col-red', null, 'LUN-CHK-RED', 1150, 980, 0.4, 12, 3, 1, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800');
  insertGallery.run('gal-1-grn-1', 'prod-1', 'col-green', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', 1, 1);
  insertGallery.run('gal-1-red-1', 'prod-1', 'col-red', 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800', 1, 1);

  // Product 6: Festive White Cotton Panjabi
  insertProd.run(
    'prod-2',
    'Classic Festive Pure White Cotton Panjabi',
    'ক্লাসিক উৎসব পিউর হোয়াইট সুতি পাঞ্জাবি',
    'classic-festive-pure-white-cotton-panjabi',
    'PAN-WHT-003',
    'জুমার নামাজ, ঈদ কিংবা যেকোনো পারিবারিক আয়োজনে খাঁটি সুতি ফেব্রিকের এই সাদা পাঞ্জাবিটি ব্যক্তিত্বে এনে দেয় অনন্য স্নিগ্ধতা।',
    'আভিজাত্যের প্রতীক ধবধবে সাদা পিউর কটন পাঞ্জাবি।',
    'cat-panjabi',
    'Panjabi',
    'color_size',
    'BOSTROSHOILY',
    1950,
    1750,
    4,
    1,
    1,
    0,
    0,
    'active',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    'Classic Festive White Panjabi | BOSTROSHOILY',
    'Pure white cotton panjabi with exquisite embroidery neckline.'
  );
  insertVar.run('var-2-wht-m', 'prod-2', 'col-white', 'sz-m', 'PAN-WHT-M', 1950, 1750, 0.5, 14, 3, 1, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800');
  insertVar.run('var-2-wht-l', 'prod-2', 'col-white', 'sz-l', 'PAN-WHT-L', 1950, 1750, 0.5, 18, 4, 1, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800');
  insertVar.run('var-2-wht-xl', 'prod-2', 'col-white', 'sz-xl', 'PAN-WHT-XL', 1950, 1750, 0.5, 9, 2, 1, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800');
  insertGallery.run('gal-2-wht-1', 'prod-2', 'col-white', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800', 1, 1);

  // Product 7: Designer Embroidered Three-Piece
  insertProd.run(
    'prod-3',
    'Handloom Cotton Designer Three-Piece',
    'হ্যান্ডলুম কটন ডিজাইনার এমব্রয়ডারি থ্রি-পিস',
    'handloom-cotton-designer-three-piece',
    'TP-DES-001',
    'সূক্ষ্ম হাতের কাজ ও আরামদায়ক প্রিমিয়াম সুতি কাপড়ের থ্রি-পিস সেট। কামিজ, সালোয়ার ও ওড়নার মেলবন্ধনে অত্যন্ত রুচিশীল কালেকশন।',
    'আরামদায়ক সুতি ফ্যাব্রিকে ডিজাইনার এমব্রয়ডারি থ্রি-পিস।',
    'cat-three-piece',
    'Three-Piece',
    'free_size',
    'BOSTROSHOILY',
    3200,
    2850,
    4,
    1,
    1,
    1,
    1,
    'active',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    'Designer Cotton Three Piece Set | BOSTROSHOILY',
    'Graceful embroidered cotton three-piece suits for festive occasions.'
  );
  insertVar.run('var-3-blu-free', 'prod-3', 'col-blue', null, 'TP-DES-BLU', 3200, 2850, 0.8, 9, 2, 1, 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800');
  insertVar.run('var-3-red-free', 'prod-3', 'col-red', null, 'TP-DES-RED', 3200, 2850, 0.8, 7, 2, 1, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
  insertGallery.run('gal-3-blu-1', 'prod-3', 'col-blue', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800', 1, 1);
  insertGallery.run('gal-3-red-1', 'prod-3', 'col-red', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 1, 1);

  // Product 8: Rajshahi Pure Silk Saree
  insertProd.run(
    'prod-4',
    'Exclusive Rajshahi Pure Silk Floral Saree',
    'এক্সক্লুসিভ রাজশাহী পিউর সিল্ক ফ্লোরাল শাড়ি',
    'exclusive-rajshahi-pure-silk-floral-saree',
    'SAR-RAJ-002',
    'বাংলার ঐতিহ্যবাহী রাজশাহী সিল্কের অতুলনীয় কোমলতা ও আকর্ষণীয় ফ্লোরাল আঁচল প্রিন্ট। যেকোনো অভিজাত সন্ধ্যার জন্য নিখুঁত সাজ।',
    'খাঁটি রাজশাহী রেশম সুতার রাজকীয় সিল্ক শাড়ি।',
    'cat-saree',
    'Saree',
    'free_size',
    'BOSTROSHOILY',
    5200,
    4600,
    3,
    1,
    0,
    1,
    0,
    'active',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    'Rajshahi Pure Silk Saree | BOSTROSHOILY',
    'Finest handwoven pure silk saree from Rajshahi silk looms.'
  );
  insertVar.run('var-4-mar-free', 'prod-4', 'col-maroon', null, 'SAR-RAJ-MAR', 5200, 4600, 0.6, 6, 2, 1, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
  insertGallery.run('gal-4-mar-1', 'prod-4', 'col-maroon', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 1, 1);
}

// Ensure hero & store banners are seeded
export function ensureBannersTableAndSeeded() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      bangla_title TEXT,
      subtitle TEXT,
      bangla_subtitle TEXT,
      button_text TEXT,
      button_url TEXT,
      desktop_image TEXT NOT NULL,
      mobile_image TEXT,
      display_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      tag TEXT,
      show_men_button INTEGER DEFAULT 1,
      show_women_button INTEGER DEFAULT 1,
      men_button_text TEXT DEFAULT 'Shop for men',
      women_button_text TEXT DEFAULT 'Shop for women',
      men_button_url TEXT DEFAULT '/category/men',
      women_button_url TEXT DEFAULT '/category/women',
      video_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe idempotent migration for banners table
  try {
    const bannerCols = db.prepare('PRAGMA table_info(banners)').all().map((c: any) => c.name);
    if (!bannerCols.includes('show_men_button')) db.exec('ALTER TABLE banners ADD COLUMN show_men_button INTEGER DEFAULT 1;');
    if (!bannerCols.includes('show_women_button')) db.exec('ALTER TABLE banners ADD COLUMN show_women_button INTEGER DEFAULT 1;');
    if (!bannerCols.includes('men_button_text')) db.exec("ALTER TABLE banners ADD COLUMN men_button_text TEXT DEFAULT 'Shop for men';");
    if (!bannerCols.includes('women_button_text')) db.exec("ALTER TABLE banners ADD COLUMN women_button_text TEXT DEFAULT 'Shop for women';");
    if (!bannerCols.includes('men_button_url')) db.exec("ALTER TABLE banners ADD COLUMN men_button_url TEXT DEFAULT '/category/men';");
    if (!bannerCols.includes('women_button_url')) db.exec("ALTER TABLE banners ADD COLUMN women_button_url TEXT DEFAULT '/category/women';");
    if (!bannerCols.includes('video_url')) db.exec("ALTER TABLE banners ADD COLUMN video_url TEXT;");
  } catch {}

  try {
    const seeded = db.prepare("SELECT value FROM store_settings WHERE key = 'banners_seeded'").get() as any;
    if (seeded && seeded.value === 'true') {
      return; // Banners already seeded; preserve all user-created, edited, deleted, and toggled banners
    }
  } catch {}

  const countObj = db.prepare('SELECT COUNT(*) as count FROM banners').get() as { count: number };
  if (countObj && countObj.count > 0) {
    try {
      db.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('banners_seeded', 'true')").run();
    } catch {}
    return; // Non-empty banners table; respect existing data
  }

  const insertBanner = db.prepare(`
    INSERT OR IGNORE INTO banners (
      id, title, bangla_title, subtitle, bangla_subtitle, button_text, button_url,
      desktop_image, mobile_image, display_order, is_active, tag,
      show_men_button, show_women_button, men_button_text, women_button_text, men_button_url, women_button_url, video_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    // 1. Lungi Banner
    insertBanner.run(
      'hero-lungi',
      'LUNGI COLLECTION',
      'সিরাজগঞ্জ তাঁতের লুঙ্গি',
      '১০০% সুতি, আরামদায়ক ও নিখুঁত বুননের প্রিমিয়াম তাঁতের লুঙ্গি কালেকশন',
      '১০০% সুতি, আরামদায়ক ও নিখুঁত বুননের প্রিমিয়াম তাঁতের লুঙ্গি কালেকশন',
      'লুঙ্গি দেখুন (Shop Lungi)',
      '/category/lungi',
      'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=800',
      1,
      1,
      'Lungi',
      1,
      1,
      'Shop for men',
      'Shop for women',
      '/category/men',
      '/category/women',
      null
    );

    // 2. Saree Banner
    insertBanner.run(
      'hero-saree',
      'SAREE COLLECTION',
      'ঢাকাই জামদানি ও সিল্ক শাড়ি',
      'বাংলার ঐতিহ্যবাহী তাঁত, জামদানি ও সিল্ক শাড়ির অনন্য আভিজাত্য',
      'বাংলার ঐতিহ্যবাহী তাঁত, জামদানি ও সিল্ক শাড়ির অনন্য আভিজাত্য',
      'শাড়ি দেখুন (Shop Saree)',
      '/category/saree',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      2,
      1,
      'Saree',
      1,
      1,
      'Shop for men',
      'Shop for women',
      '/category/men',
      '/category/women',
      null
    );

    // 3. T-Shirt Banner
    insertBanner.run(
      'hero-tshirt',
      'T-SHIRT COLLECTION',
      'প্রিমিয়াম কম্বড কটন টি-শার্ট',
      'রং ও ফেব্রিক গ্যারান্টি সহ আধুনিক ক্যাজুয়াল ও ট্রেন্ডি লুক',
      'রং ও ফেব্রিক গ্যারান্টি সহ আধুনিক ক্যাজুয়াল ও ট্রেন্ডি লুক',
      'টি-শার্ট দেখুন (Shop T-Shirt)',
      '/category/tshirt',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      3,
      1,
      'T-Shirt',
      1,
      1,
      'Shop for men',
      'Shop for women',
      '/category/men',
      '/category/women',
      null
    );

    // 4. Panjabi Banner
    insertBanner.run(
      'hero-panjabi',
      'PANJABI COLLECTION',
      'রয়েল কটন ও এম্ব্রয়ডারি পাঞ্জাবি',
      'উৎসব ও শুভানুষ্ঠানে আভিজাত্যপূর্ণ প্রিমিয়াম ডিজাইনার পাঞ্জাবি',
      'উৎসব ও শুভানুষ্ঠানে আভিজাত্যপূর্ণ প্রিমিয়াম ডিজাইনার পাঞ্জাবি',
      'পাঞ্জাবি দেখুন (Shop Panjabi)',
      '/category/panjabi',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      4,
      1,
      'Panjabi',
      1,
      1,
      'Shop for men',
      'Shop for women',
      '/category/men',
      '/category/women',
      null
    );

    // 5. Three Piece Banner
    insertBanner.run(
      'hero-three-piece',
      'THREE PIECE COLLECTION',
      'এক্সক্লুসিভ ডিজাইনার থ্রি-পিস',
      'আভিজাত্যপূর্ণ সুতি ও জর্জেটের দৃষ্টিনন্দন পার্টি ও ক্যাজুয়াল থ্রি-পিস',
      'আভিজাত্যপূর্ণ সুতি ও জর্জেটের দৃষ্টিনন্দন পার্টি ও ক্যাজুয়াল থ্রি-পিস',
      'থ্রি-পিস দেখুন (Shop Three-Piece)',
      '/category/three-piece',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      5,
      1,
      'Three-Piece',
      1,
      1,
      'Shop for men',
      'Shop for women',
      '/category/men',
      '/category/women',
      null
    );
    try {
      db.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('banners_seeded', 'true')").run();
    } catch {}
}

// Ensure store_settings table and initial configs
export function ensureStoreSettings() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const initialSettings: Record<string, any> = {
    home_collections: [
      {
        id: 'col-lungi',
        title: 'Lungi Collection',
        banglaTitle: 'লুঙ্গি কালেকশন',
        subtitle: 'সিরাজগঞ্জের খাঁটি তাঁতের সুতি লুঙ্গি',
        position: 1,
        link: '/category/lungi',
        image: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=800',
        isActive: true,
      },
      {
        id: 'col-saree',
        title: 'Saree Collection',
        banglaTitle: 'শাড়ি কালেকশন',
        subtitle: 'ঐতিহ্যবাহী জামদানি ও সিল্ক শাড়ি',
        position: 2,
        link: '/category/saree',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        isActive: true,
      },
      {
        id: 'col-tshirt',
        title: 'T-Shirt Collection',
        banglaTitle: 'টি-শার্ট কালেকশন',
        subtitle: '১০০% প্রিমিয়াম সুতি কম্বড ফেব্রিক',
        position: 3,
        link: '/category/tshirt',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
        isActive: true,
      },
      {
        id: 'col-three-piece',
        title: 'Three Piece Collection',
        banglaTitle: 'থ্রি-পিস কালেকশন',
        subtitle: 'ডিজাইনার সুতি ও জর্জেট পার্টি থ্রি-পিস',
        position: 4,
        link: '/category/three-piece',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
        isActive: true,
      },
      {
        id: 'col-panjabi',
        title: 'Panjabi Collection',
        banglaTitle: 'পাঞ্জাবি কালেকশন',
        subtitle: 'রয়েল কটন ও নিখুঁত এম্ব্রয়ডারি উৎসব পাঞ্জাবি',
        position: 5,
        link: '/category/panjabi',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
        isActive: true,
      },
    ],
    category_banners: [
      {
        id: 'cat-ban-men',
        categorySlug: 'men',
        title: 'Men Collection Banner',
        banglaTitle: 'পুরুষদের এক্সক্লুসিভ কালেকশন',
        description: 'তাঁতের লুঙ্গি, প্রিমিয়াম পাঞ্জাবি এবং স্মার্ট ক্যাজুয়াল টি-শার্টের সেরা সমাহার',
        desktopImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-women',
        categorySlug: 'women',
        title: 'Women Collection Banner',
        banglaTitle: 'মহিলাদের ঐতিহ্য ও আধুনিক ফ্যাশন',
        description: 'ঢাকাই জামদানি, সুতি ও সিল্ক শাড়ির সাথে আকর্ষণীয় ডিজাইনার থ্রি-পিস',
        desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-lungi',
        categorySlug: 'lungi',
        title: 'Lungi Banner',
        banglaTitle: 'সিরাজগঞ্জ তাঁতের লুঙ্গি',
        description: '১০০% সুতি, দীর্ঘস্থায়ী আরামদায়ক খাঁটি দেশীয় তাঁতের লুঙ্গি',
        desktopImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-saree',
        categorySlug: 'saree',
        title: 'Saree Banner',
        banglaTitle: 'ঐতিহ্যবাহী জামদানি ও তাঁতের শাড়ি',
        description: 'অভিজাত্যের প্রতীক খাঁটি সুতা ও রেশমি তাঁতের শাড়ির সম্ভার',
        desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-panjabi',
        categorySlug: 'panjabi',
        title: 'Panjabi Banner',
        banglaTitle: 'রয়েল কটন ও এম্ব্রয়ডারি পাঞ্জাবি',
        description: 'উৎসব ও আভিজাত্যের শুভ রঙে প্রিমিয়াম ডিজাইনার পাঞ্জাবি',
        desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-tshirt',
        categorySlug: 'tshirt',
        title: 'T-Shirt Banner',
        banglaTitle: 'প্রিমিয়াম কম্বড কটন টি-শার্ট',
        description: '১০০% কটন, প্রি-ওয়াশড এবং টেকসই রঙের আরামদায়ক টি-শার্ট',
        desktopImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
      {
        id: 'cat-ban-threepiece',
        categorySlug: 'three-piece',
        title: 'Three Piece Banner',
        banglaTitle: 'ডিজাইনার থ্রি-পিস কালেকশন',
        description: 'আভিজাত্যপূর্ণ সুতি ও জর্জেটের দৃষ্টিনন্দন পার্টি ও ক্যাজুয়াল থ্রি-পিস',
        desktopImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
        isActive: true,
      },
    ],
    offer_config: {
      headline: 'বিশেষ মেগা উৎসব ছাড়!',
      subHeadline: 'সীমিত সময়ের ধামাকা অফার! সরাসরি তাঁতপল্লী থেকে হোম ডেলিভারি। যেকোনো ৩টি পণ্য ক্রয়ে নিশ্চিত বিশেষ উপহার ও ফ্রি শিপিং।',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: false,
    },
    delivery_config: {
      insideSirajganjLabel: 'সিরাজগঞ্জ জেলা (লোকাল ডেলিভারি)',
      insideSirajganjCharge: 70,
      outsideSirajganjLabel: 'সিরাজগঞ্জের বাইরে সারা বাংলাদেশ',
      outsideSirajganjCharge: 130,
      insideDhakaCharge: 70,
      outsideDhakaCharge: 130,
      freeDeliveryThreshold: 2000,
      estimatedInsideDhakaDays: '১-২ দিন',
      estimatedOutsideDhakaDays: '২-৪ দিন',
      estimatedDeliveryDays: '২-৩ দিন',
      freeDeliveryOnOnlinePayment: false,
    },
    payment_config: {
      enableCod: true,
      enableBkash: true,
      bkashNumber: '01712-345678',
      bkashType: 'merchant',
      enableNagad: true,
      nagadNumber: '01812-345678',
      enableRocket: false,
      rocketNumber: '01912-345678',
      enableSslCommerz: false,
      instructions: {
        bkash: 'বিকাশ মার্চেন্ট নাম্বারে পেমেন্ট করুন অথবা সেন্ড মানি করুন। পেমেন্ট শেষে ট্রানজেকশন আইডি (TrxID) প্রদান করুন।',
        nagad: 'নগদ নাম্বারে পেমেন্ট করে প্রাপ্ত TrxID প্রদান করুন।',
        rocket: 'রকেট একাউন্টে পেমেন্ট করুন।',
        cod: 'পণ্য হাতে পেয়ে ডেলিভারিম্যানকে মূল্য পরিশোধ করুন।',
      },
    },
    general_settings: {
      siteName: 'BOSTROSHOILY | বস্ত্র শৈলী',
      tagline: 'সিরাজগঞ্জের ঐতিহ্যবাহী তাঁত ও আধুনিক ফ্যাশন',
      phone: '+880 1864-528488',
      email: 'bostroshoily@gmail.com',
      address: 'তাঁতপল্লী রোড, শাহজাদপুর, সিরাজগঞ্জ, বাংলাদেশ',
      returnPolicyDays: 7,
      facebookUrl: 'https://facebook.com/bostroshoily',
      instagramUrl: 'https://instagram.com/bostroshoily',
      whatsappUrl: 'https://wa.me/8801864528488',
      whatsappNumber: '+8801864528488',
      logoUrl: '',
      youtubeUrl: '',
      copyrightText: '© ২০২৬ বস্ত্র শৈলী (BOSTROSHOILY) - সর্বস্বত্ব সংরক্ষিত।',
    },
    footer_config: {
      aboutUs: 'BOSTROSHOILY (বস্ত্র শৈলী) বাংলাদেশের সমৃদ্ধ ঐতিহ্যবাহী সিরাজগঞ্জ ও পাবনার তাঁতের সেরা সুতি লুঙ্গি, প্রিমিয়াম পাঞ্জাবি ও ঢাকাই জামদানি শাড়ির নির্ভরযোগ্য অনলাইন প্রতিষ্ঠান।',
      phone: '+880 1864-528488',
      email: 'bostroshoily@gmail.com',
      address: 'তাঁতপল্লী রোড, শাহজাদপুর, সিরাজগঞ্জ, বাংলাদেশ',
      facebookUrl: 'https://facebook.com/bostroshoily',
      instagramUrl: 'https://instagram.com/bostroshoily',
      youtubeUrl: '',
      whatsappUrl: 'https://wa.me/8801864528488',
      privacyPolicy: 'BOSTROSHOILY (বস্ত্র শৈলী) গ্রাহকদের তথ্যের গোপনীয়তা কঠোরভাবে রক্ষা করে।',
      termsAndConditions: 'সকল তথ্যাদি ও পণ্যের গুণমান খাঁটি ও অথেন্টিক রাখার নিশ্চয়তা দেওয়া হয়।',
      returnPolicy: 'ডেলিভারির সময় চেক করুন। সাইজ বা ফিটিং সমস্যা হলে ৭ দিনের ভেতর সহজ এক্সচেঞ্জ সুবিধা পাবেন।',
      shippingPolicy: 'সিরাজগঞ্জে ২৪ ঘণ্টার মধ্যে এবং দেশের যেকোনো প্রান্তে ২-৩ দিনে নিরাপদ ডেলিভারি।',
      copyrightText: '© ২০২৬ বস্ত্র শৈলী (BOSTROSHOILY) - সর্বস্বত্ব সংরক্ষিত।',
    },
    seo_config: {
      siteTitle: 'BOSTROSHOILY (বস্ত্র শৈলী) | Authentic Handloom & Clothing Store',
      metaDescription: 'Shop authentic Sirajganj handloom lungis, royal panjabis, Dhakai jamdani sarees & cotton wear at BOSTROSHOILY (বস্ত্র শৈলী / bostoshoily).',
      keywords: 'bostroshoily, bostoshoily, bostro shoily, bastra shoily, বস্ত্র শৈলী, sirajganj handloom lungi, dhakai jamdani saree, panjabi',
      ogImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: process.env.APP_URL || 'https://bostroshoily.onrender.com',
      robotsTxt: 'User-agent: *\nAllow: /',
      sitemapEnabled: true,
    },
    courier_config: {
      provider: 'steadfast',
      steadfastApiKey: process.env.STEADFAST_API_KEY || '',
      steadfastSecretKey: process.env.STEADFAST_SECRET_KEY || '',
      steadfastBaseUrl: 'https://portal.steadfast.com.bd/api/v1',
      isSandbox: true,
    },
    invoice_config: {
      headerTitle: 'BOSTROSHOILY',
      headerSubtitle: 'বস্ত্র শৈলী - ঐতিহ্যবাহী পোশাক ও খাঁটি তাঁত পণ্য',
      authoritySignatureTitle: 'BOSTROSHOILY Authority',
      authorityName: 'Authorized Signature',
      showProductImage: true,
      termsTitle: 'পরামর্শ ও শর্তাবলী:',
      terms: [
        { id: 'term-1', text: 'পণ্য গ্রহণের সময় ডেলিভারি ম্যানের উপস্থিতিতে চেক করে নিন।' },
        { id: 'term-2', text: '৭ দিনের মধ্যে রিটার্ন বা সাইজ এক্সচেঞ্জের সুবিধা রয়েছে।' },
        { id: 'term-3', text: 'কোনো সমস্যা বা তথ্যের জন্য কাস্টমার কেয়ারে যোগাযোগ করুন।' },
      ],
      footerNote: 'আমাদের সাথে কেনাকাটা করার জন্য আন্তরিক ধন্যবাদ!',
      customerServiceNote: 'বস্ত্র শৈলী (BOSTROSHOILY) ডিজিটাল ইনভয়েস সিস্টেম',
    },
    category_size_charts: {
      panjabi: {
        categoryKey: 'panjabi',
        categoryName: 'Panjabi',
        banglaName: 'পাঞ্জাবি',
        imageUrl: '',
        note: 'সমস্ত মাপ স্ট্যান্ডার্ড ইঞ্চিতে পরিমাপ করা। ১০০% প্রিমিয়াম সুতি ও আরামদায়ক কাটিং।',
        headers: ['Size', 'Chest', 'Length', 'Sleeve'],
        rows: [
          { Size: '38 (S)', Chest: '39"', Length: '38"', Sleeve: '23.5"' },
          { Size: '40 (M)', Chest: '41"', Length: '40"', Sleeve: '24"' },
          { Size: '42 (L)', Chest: '43"', Length: '42"', Sleeve: '24.5"' },
          { Size: '44 (XL)', Chest: '45"', Length: '44"', Sleeve: '25"' },
          { Size: '46 (XXL)', Chest: '47"', Length: '45"', Sleeve: '25.5"' },
        ],
      },
      lungi: {
        categoryKey: 'lungi',
        categoryName: 'Lungi',
        banglaName: 'লুঙ্গি',
        imageUrl: '',
        note: 'সিরাজগঞ্জ তাঁতের প্রিমিয়াম লুঙ্গি (ফ্রি-সাইজ)। সুতার কাউন্ট: ৮০, দৈর্ঘ্য: ৩ হাত / ৫৪ ইঞ্চি, বহর: আড়াই হাত / ৪৫ ইঞ্চি।',
        headers: ['Parameter', 'Specification', 'Bangla Unit'],
        rows: [
          { Parameter: 'Yarn Count', Specification: '80s Combed Cotton', 'Bangla Unit': '৮০ কাউন্ট সুতি' },
          { Parameter: 'Length', Specification: '54 Inches', 'Bangla Unit': '৩ হাত (৫৪ ইঞ্চি)' },
          { Parameter: 'Width (Bohor)', Specification: '45 Inches', 'Bangla Unit': 'আড়াই হাত (৪৫ ইঞ্চি)' },
          { Parameter: 'Reed / Shana', Specification: '130 Reed', 'Bangla Unit': '১৩০ শানা' },
          { Parameter: 'Waist Style', Specification: 'Free Size Traditional', 'Bangla Unit': 'ফ্রি সাইজ সর্বজনীন' },
        ],
      },
      saree: {
        categoryKey: 'saree',
        categoryName: 'Saree',
        banglaName: 'শাড়ি',
        imageUrl: '',
        note: 'প্রিমিয়াম সুতি ও জামদানি শাড়ির মাপ। দৈর্ঘ্য: ১২ হাত (সহ ব্লাউজ পিস ১৪ হাত), বহর: ৪৫ ইঞ্চি।',
        headers: ['Component', 'Length', 'Width (Bohor)'],
        rows: [
          { Component: 'Saree Body (শাড়ির বডি)', Length: '12 Hands / 216 Inches', 'Width (Bohor)': '45 Inches' },
          { Component: 'Blouse Piece (ব্লাউজ পিস)', Length: '1.5-2 Hands / 32 Inches', 'Width (Bohor)': '45 Inches' },
          { Component: 'Total Length (মোট দৈর্ঘ্য)', Length: '14 Hands (8.5 Yards)', 'Width (Bohor)': '45 Inches' },
        ],
      },
      tshirt: {
        categoryKey: 'tshirt',
        categoryName: 'T-Shirt',
        banglaName: 'টি-শার্ট',
        imageUrl: '',
        note: 'প্রিমিয়াম ১০০% কম্বড কটন টি-শার্ট। সমস্ত মাপ ইঞ্চিতে।',
        headers: ['Size', 'Chest', 'Length', 'Shoulder'],
        rows: [
          { Size: 'M', Chest: '38"', Length: '27"', Shoulder: '17"' },
          { Size: 'L', Chest: '40"', Length: '28"', Shoulder: '18"' },
          { Size: 'XL', Chest: '42"', Length: '29"', Shoulder: '19"' },
          { Size: 'XXL', Chest: '44"', Length: '30"', Shoulder: '20"' },
        ],
      },
      threepiece: {
        categoryKey: 'threepiece',
        categoryName: 'Three-Piece',
        banglaName: 'থ্রি-পিস',
        imageUrl: '',
        note: 'কামিজ, সালোয়ার ও ওড়নার পরিমাপ। সমস্ত মাপ ইঞ্চিতে।',
        headers: ['Item / Part', 'M', 'L', 'XL', 'XXL'],
        rows: [
          { 'Item / Part': 'Kamiz Chest', M: '38"', L: '40"', XL: '42"', XXL: '44"' },
          { 'Item / Part': 'Kamiz Length', M: '42"', L: '43"', XL: '44"', XXL: '45"' },
          { 'Item / Part': 'Salwar Length', M: '38"', L: '39"', XL: '40"', XXL: '41"' },
          { 'Item / Part': 'Dopatta (ওড়না)', M: '5 Hands', L: '5 Hands', XL: '5 Hands', XXL: '5 Hands' },
        ],
      },
      nav_menus: [
        {
          id: 'nav-men',
          mainCategory: 'MEN',
          label: 'Men',
          banglaLabel: 'পুরুষ',
          order: 1,
          isActive: true,
          items: [
            { id: 'sub-lungi', label: 'Lungi', banglaLabel: 'লুঙ্গি', url: '/category/lungi', categorySlug: 'lungi', order: 1, isActive: true },
            { id: 'sub-panjabi', label: 'Panjabi', banglaLabel: 'পাঞ্জাবি', url: '/category/panjabi', categorySlug: 'panjabi', order: 2, isActive: true },
            { id: 'sub-tshirt', label: 'T-Shirt', banglaLabel: 'টি-শার্ট', url: '/category/tshirt', categorySlug: 'tshirt', order: 3, isActive: true },
          ],
        },
        {
          id: 'nav-women',
          mainCategory: 'WOMEN',
          label: 'Women',
          banglaLabel: 'মহিলা',
          order: 2,
          isActive: true,
          items: [
            { id: 'sub-saree', label: 'Saree', banglaLabel: 'শাড়ি', url: '/category/saree', categorySlug: 'saree', order: 1, isActive: true },
            { id: 'sub-three-piece', label: 'Three Piece', banglaLabel: 'থ্রি-পিস', url: '/category/three-piece', categorySlug: 'three-piece', order: 2, isActive: true },
          ],
        },
        {
          id: 'nav-others',
          mainCategory: 'OTHERS',
          label: 'Others',
          banglaLabel: 'অন্যান্য',
          order: 3,
          isActive: true,
          items: [
            { id: 'sub-gamcha', label: 'Gamcha & Shawl', banglaLabel: 'গামছা ও চাদর', url: '/category/others', categorySlug: 'others', order: 1, isActive: true },
            { id: 'sub-handicrafts', label: 'Handicrafts', banglaLabel: 'হস্তশিল্প ও ঐতিহ্য', url: '/category/handicrafts', categorySlug: 'handicrafts', order: 2, isActive: true },
          ],
        },
      ],
    },
  };

  const getStmt = db.prepare('SELECT key FROM store_settings WHERE key = ?');
  const insertStmt = db.prepare('INSERT INTO store_settings (key, value) VALUES (?, ?)');

  for (const [key, val] of Object.entries(initialSettings)) {
    const exists = getStmt.get(key);
    if (!exists) {
      insertStmt.run(key, JSON.stringify(val));
    }
  }

  ensureDefaultCouponsSeed();
}

function ensureDefaultCouponsSeed() {
  try {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number };
    if (!countRow || countRow.count === 0) {
      const insertCoupon = db.prepare(`
        INSERT INTO coupons (
          id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, usage_limit, used_count, per_user_limit, allow_stacking, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertCoupon.run(
        'cp-bastra100',
        'BASTRA100',
        'বিশেষ স্বাগতম ছাড় - ১০০০ টাকার বেশি অর্ডারে ১০০ টাকা ছাড়',
        'fixed',
        100,
        1000,
        null,
        '2028-12-31',
        500,
        0,
        5,
        0,
        1
      );
      insertCoupon.run(
        'cp-festive15',
        'FESTIVE15',
        'উৎসব ছাড় - ১৫% ছাড় (সর্বোচ্চ ৫০০ টাকা)',
        'percentage',
        15,
        1500,
        500,
        '2028-12-31',
        500,
        0,
        5,
        0,
        1
      );
    }
  } catch (err) {
    console.warn('Default coupons seeding warning:', err);
  }
}

function ensureVideoGalleryAndSecuritySeed() {
  try {
    const vCount = db.prepare('SELECT COUNT(*) as count FROM video_gallery').get() as { count: number };
    if (!vCount || vCount.count === 0) {
      const insertVideo = db.prepare(`
        INSERT INTO video_gallery (id, title, bangla_title, video_url, thumbnail, category, duration, is_featured, active, views_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertVideo.run(
        'vid-1',
        'Traditional Handloom Weaving Process in Sirajganj',
        'সিরাজগঞ্জের ঐতিহ্যবাহী খটখটি তাঁতে লুঙ্গি বুনন শৈলী',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
        'craft',
        '২:১৫ মিনিট',
        1,
        1,
        1250
      );
      insertVideo.run(
        'vid-2',
        'Dhakai Jamdani Saree Crafting & Motif Guide',
        'জামদানি শাড়ির ঐতিহ্যবাহী নকশা ও সুতার কারুকাজ',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
        'saree',
        '৩:১০ মিনিট',
        1,
        1,
        890
      );
      insertVideo.run(
        'vid-3',
        'How to Wear and Care Premium Handloom Lungi',
        '৮০ কাউন্ট লুঙ্গির সঠিক ব্যবহার ও ধোয়ার নিয়ম',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
        'guide',
        '১:৪৫ মিনিট',
        0,
        1,
        450
      );
    }

    const bCount = db.prepare('SELECT COUNT(*) as count FROM security_blacklist').get() as { count: number };
    if (!bCount || bCount.count === 0) {
      const insertBlacklist = db.prepare(`
        INSERT INTO security_blacklist (id, type, value, reason, risk_score, blocked_attempts, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBlacklist.run('bl-1', 'phone', '01900000000', 'একাধিকবার ফেক অর্ডার ও পার্সেল রিজেক্ট', 95, 4, 'active');
      insertBlacklist.run('bl-2', 'ip', '192.168.1.100', 'অস্বাভাবিক অটোমেটেড বট রিকোয়েস্ট ট্র্যাফিক', 85, 12, 'active');
    }
  } catch (err) {
    console.warn('Failed to seed video gallery or security blacklist:', err);
  }
}

export function ensureOthersCategoriesAndUpsells() {
  try {
    // 1. Ensure OTHERS subcategories exist
    const insertCat = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, bangla_name, slug, parent_category, image, order_num, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertCat.run('cat-gift-box', 'Gift Box', 'গিফট বক্স', 'gift-box', 'OTHERS', '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg', 1);
    insertCat.run('cat-ator', 'Ator & Fragrance', 'আতর ও সুগন্ধি', 'ator', 'OTHERS', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800', 2);
    insertCat.run('cat-tupi', 'Tupi / Prayer Cap', 'টুপি কালেকশন', 'tupi', 'OTHERS', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', 3);
    insertCat.run('cat-payjama', 'Payjama', 'সিল্ক ও সুতি পায়জামা', 'payjama', 'OTHERS', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800', 4);
    insertCat.run('cat-gamcha', 'Gamcha & Shawl', 'গামছা ও চাদর', 'gamcha', 'OTHERS', 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=800', 5);

    // 2. Ensure Gift Box product exists
    db.prepare(`
      INSERT OR IGNORE INTO products (
        id, name, bangla_name, slug, sku, description, short_description,
        category_id, sub_category, variant_config, brand, price, discount_price,
        low_stock_threshold, is_featured, is_new_arrival, is_best_seller, is_offer,
        status, main_image, seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'prod-gift-box',
      'Royal Handcrafted Luxury Magnetic Gift Box',
      'রয়্যাল হ্যান্ডক্রাফটেড লাক্সারি ম্যাগনেটিক গিফট বক্স',
      'royal-luxury-magnetic-gift-box',
      'GB-LUX-001',
      'প্রিয়জনকে উপহার দেওয়ার জন্য আকর্ষণীয় সুদৃশ্য রিজিড ম্যাগনেটিক গিফট বক্স। প্রিমিয়াম সিল্ক রিবন ও স্পেশাল গ্রিটিংস কার্ড অন্তর্ভুক্ত। পাঞ্জাবি বা লুঙ্গি সুন্দরভাবে প্যাক করার উপযোগী।',
      'পোশাক উপহার দেওয়ার জন্য প্রিমিয়াম ম্যাগনেটিক লাক্সারি গিফট বক্স।',
      'cat-gift-box',
      'Gift Box',
      'free_size',
      'BOSTROSHOILY',
      350,
      290,
      10,
      1,
      1,
      1,
      1,
      'active',
      '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg',
      'Royal Handcrafted Luxury Magnetic Gift Box | BOSTROSHOILY',
      'Premium magnetic rigid gift box with satin ribbon for special gifts.'
    );

    // Free size variant for gift box
    db.prepare(`
      INSERT OR IGNORE INTO product_variants (
        id, product_id, color_id, size_id, sku, price, offer_price, weight, stock, low_stock_threshold, active, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'var-giftbox-free',
      'prod-gift-box',
      'col-brown',
      null,
      'GB-LUX-001-STD',
      350,
      290,
      0.3,
      100,
      5,
      1,
      '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg'
    );

    // 3. Ensure default checkout upsell exists
    const upsellCount = db.prepare('SELECT COUNT(*) as count FROM checkout_upsells').get() as { count: number };
    if (!upsellCount || upsellCount.count === 0) {
      db.prepare(`
        INSERT INTO checkout_upsells (
          id, title, description, product_id, offer_price, target_categories, image, is_active, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'upsell-gift-box',
        'প্রিয়জনকে গিফট দিতে সুন্দর একটি Gift Box নিন!',
        'আপনার পছন্দের পাঞ্জাবি, লুঙ্গি বা শাড়ি আকর্ষণীয় রয়্যাল ম্যাগনেটিক বক্সে সাজিয়ে দিন।',
        'prod-gift-box',
        290,
        JSON.stringify(['ALL', 'panjabi', 'lungi', 'saree', 'three-piece', 'tshirt']),
        '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg',
        1,
        1
      );
    }
  } catch (err) {
    console.warn('ensureOthersCategoriesAndUpsells notice:', err);
  }
}

export function ensurePolicyPagesSeeded() {
  try {
    const policies = [
      {
        id: 'pol-returns-exchange',
        slug: 'returns-exchange',
        title_bn: 'রিটার্ন ও এক্সচেঞ্জ পলিসি',
        title_en: 'Returns & Exchange Policy',
        content_bn: `১. ডেলিভারির সময় তাৎক্ষণিক পণ্য যাচাই (Doorstep Checking)
ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল খুলে শাড়ি, লুঙ্গি, পাঞ্জাবি বা অন্যান্য পণ্যটির রঙ, কোয়ালিটি ও সঠিক মাপ যাচাই করে নিন।
যদি কোনো ফেব্রিক ত্রুটি (ড্যামেজ), ভুল সাইজ বা ভুল পণ্য দেখতে পান, তবে ডেলিভারি ম্যানের কাছে তাৎক্ষণিকভাবে পার্সেল ফেরত দিয়ে দিন—এক্ষেত্রে কোনো ডেলিভারি চার্জ প্রযোজ্য হবে না।
ডেলিভারি গ্রহণ করার পরও ৭ (সাত) দিনের মধ্যে যেকোনো ত্রুটির জন্য রিটার্ন বা এক্সচেঞ্জের আবেদন করতে পারবেন।

২. রিটার্ন ও এক্সচেঞ্জ গ্রহণের শর্তাবলী
পণ্যটি অবশ্যই অব্যবহৃত (Unused), না-ধোয়া (Unwashed) এবং সম্পূর্ণ অক্ষত অবস্থায় থাকতে হবে।
পণ্যের আসল ট্যাগ, বস্ত্র শৈলী (BOSTROSHOILY) বারকোড লেবেল এবং মূল বক্স/প্যাকেজিং সুরক্ষিত থাকতে হবে।
পার্সেলের সাথে দেওয়া অরিজিনাল ক্যাশ মেমো / ইনভয়েস স্লিপ সাথে রাখতে হবে।
কাস্টম মেড বা ব্যক্তিগত ব্যবহারের সামগ্রী (যেমন: আতর/টুপি আনসিল করা হলে) স্বাস্থ্যবিধির স্বার্থে ফেরতযোগ্য নয়।

৩. সাইজ পরিবর্তন ও এক্সচেঞ্জ প্রক্রিয়া
পোশাকের সাইজ বড় বা ছোট হলে পছন্দের সঠিক সাইজের স্টক থাকা সাপেক্ষে বিনামূল্যে এক্সচেঞ্জ সুবিধা উপভোগ করুন।
আমাদের হটলাইন (+880 1864-528488) অথবা হোয়াটসঅ্যাপে ইনভয়েস নম্বরসহ মেসেজ দিন।
আমাদের রাইডার আপনার ঠিকানা থেকে পূর্বের পণ্য সংগ্রহ করে নতুন সাইজের পণ্য পৌঁছে দেবে (সাধারণত ৪৮-৭২ ঘণ্টার মধ্যে)।

৪. রিফান্ড ও মূল্য ফেরত নীতি (Refund Policy)
অনলাইন পেমেন্ট (bKash, Nagad, কার্ড) করে থাকলে এবং পণ্য ফেরত নেওয়া হলে সর্বোচ্চ ৩-৫ কার্যদিবসের মধ্যে আপনার মূল অ্যাকাউন্টে সম্পূর্ণ মূল্য রিফান্ড করা হবে।
ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে রিটার্ন পণ্য আমাদের ওয়্যারহাউসে পৌঁছানোর ২৪ ঘণ্টার মধ্যে বিকাশ/নগদ এর মাধ্যমে টাকা ফেরত দেওয়া হবে।
আমাদের কোনো ভুলের কারণে রিটার্ন হলে গ্রাহককে কোনো অতিরিক্ত ডেলিভারি বা রিটার্ন ফি প্রদান করতে হবে না।`,
        content_en: 'Check the parcel in front of the delivery partner. 7 days easy return & exchange guarantee if unused with original tags.',
        seo_title: 'রিটার্ন ও এক্সচেঞ্জ পলিসি | বস্ত্র শৈলী (BOSTROSHOILY)',
        meta_description: 'বস্ত্র শৈলী (BOSTROSHOILY) থেকে ক্রয়কৃত পণ্যে ৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ সুবিধা। ত্রুটিযুক্ত পণ্যে শতভাগ ক্যাশ রিফান্ড গ্যারান্টি।',
      },
      {
        id: 'pol-terms-and-conditions',
        slug: 'terms-and-conditions',
        title_bn: 'শর্তাবলী ও নিয়মাবলী',
        title_en: 'Terms & Conditions',
        content_bn: `১. সাধারণ নীতিমালা ও গ্রাহক সম্মতি
ওয়েবসাইটে প্রবেশ এবং অর্ডার সম্পন্ন করার মাধ্যমে আপনি বস্ত্র শৈলীর সকল নিয়মাবলী ও শর্তাবলী মেনে নিচ্ছেন।
বস্ত্র শৈলী (BOSTROSHOILY) যেকোনো সময় বিজ্ঞপ্তির মাধ্যমে নিয়মাবলী বা পণ্যের মূল্যের হালনাগাদ করার অধিকার সংরক্ষণ করে।
প্রতিটি পণ্যের ছবি ও বর্ণনা বাস্তব পণ্যের প্রকৃত রঙের সাথে ৯৫% এর বেশি সামঞ্জস্যপূর্ণ রাখার চেষ্টা করা হয়; তবে ডিসপ্লে রেজুল্যুশন ও আলোর ভিন্নতার কারণে সামান্য ফারাক অনুভূত হতে পারে।

২. অর্ডার কনফার্মেশন ও মূল্য নির্ধারণ
ওয়েবসাইটে প্রদর্শিত সকল মূল্য বাংলাদেশী টাকায় (BDT ৳) ধার্য এবং প্রযোজ্য ভ্যাট অন্তর্ভুক্ত।
অর্ডার সম্পন্ন করার পর স্বয়ংক্রিয় এসএমএস ও ফোন কলের মাধ্যমে অর্ডার ভেরিফাই করা হতে পারে।
কোনো পণ্যের স্টক হঠাৎ ফুরিয়ে গেলে বা প্রযুক্তিগত মূল্যে ভুল থাকলে বস্ত্র শৈলী অর্ডার বাতিলের অধিকার রাখে এবং অগ্রিম পরিশোধিত মূল্য অবিলম্বে রিফান্ড করে।

৩. ঐতিহ্যবাহী তাঁতের খাঁটি নিশ্চয়তা
আমাদের প্রতিটি লুঙ্গি, শাড়ি ও পাঞ্জাবি সিরাজগঞ্জের অভিজ্ঞ তাঁতিদের দক্ষ হাতের তৈরি ১০০% নিখুঁত সুতি ও উন্নত সুতার প্রমাণিক বয়নে নির্মিত।
হস্তচালিত তাঁতের নিজস্ব নান্দনিকতার কারণে কাপড়ে সামান্য সূক্ষ্ম বৈচিত্র্য থাকতে পারে, যা খাঁটি হস্তশিল্পের অনন্য প্রতীক।

৪. মেধা স্বত্ব ও কপিরাইট আইন
ওয়েবসাইটের লোগো, গ্রাফিক্স, পণ্যের ছবি, টেক্সট এবং সফ্টওয়্যার ডিজাইন বস্ত্র শৈলীর নিজস্ব মেধা সম্পদ।
অনুমোদন ছাড়া কোনো ছবি বা সামগ্রী বাণিজ্যিক উদ্দেশ্যে পুনঃব্যবহার করা সম্পূর্ণ বেআইনি এবং কপিরাইট আইনের লঙ্ঘন।`,
        content_en: 'Terms and conditions governing the use of BOSTROSHOILY website and services.',
        seo_title: 'শর্তাবলী ও নিয়মাবলী | বস্ত্র শৈলী (BOSTROSHOILY)',
        meta_description: 'বস্ত্র শৈলী (BOSTROSHOILY) ব্যবহারের আইনি নীতিমালা, অর্ডার কনফার্মেশন ও গ্রাহক অধিকার সুরক্ষানীতি।',
      },
      {
        id: 'pol-privacy-policy',
        slug: 'privacy-policy',
        title_bn: 'গোপনীয়তা নীতি',
        title_en: 'Privacy Policy',
        content_bn: `১. কি কি তথ্য আমরা সংগ্রহ করি
নাম, পূর্ণ ডেলিভারি ঠিকানা, জেলা, থানা এবং মোবাইল ফোন নম্বর (অর্ডার সঠিক ঠিকানায় পৌঁছানোর স্বার্থে)।
অর্ডার ইতিহাস, পছন্দের পণ্য (উইশলিস্ট) এবং পণ্য সংক্রান্ত পর্যালোচনার তথ্য।
আমরা কখনোই গ্রাহকের ক্রেডিট কার্ড বা পেমেন্ট গেটওয়ের পিন/পাসওয়ার্ড সংরক্ষণ করি না। সকল পেমেন্ট SSL এনক্রিপ্টেড সরকারি ব্যাংক অনুমোদিত গেটওয়ে দ্বারা প্রসেস হয়।

২. তথ্যের ব্যবহার ও গোপনীয়তা রক্ষা
আপনার তথ্য কেবল আপনার অর্ডার প্রসেসিং, ইনভয়েসিং এবং কাস্টমার সার্ভিসের প্রয়োজনে ব্যবহৃত হয়।
আমরা কখনোই গ্রাহকের ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষ, বিজ্ঞাপন সংস্থা বা বিপণন এজেন্সির কাছে বিক্রি বা প্রকাশ করি না।
জরুরি ডেলিভারির সুবিধার্থে শুধুমাত্র অনুমোদিত কুরিয়ার পার্টনারকে নাম, ঠিকানা ও মোবাইল নম্বর দেওয়া হয়।

৩. কুকিজ ও ব্রাউজিং অভিজ্ঞতা
ওয়েবসাইটের কার্ট সংরক্ষণ ও দ্রুত ব্রাউজিং অভিজ্ঞতার জন্য সীমিত ব্রাউজার কুকিজ ব্যবহৃত হয়।
আপনি চাইলে আপনার ব্রাউজার সেটিং থেকে যেকোনো সময় কুকিজ মুছে ফেলতে পারেন।

৪. ডেটা সুরক্ষা ও নিয়ন্ত্রণ
সকল ডেটা আধুনিক ক্লাউড সার্ভারে এনক্রিপ্টেড ব্যাকআপের মাধ্যমে সুরক্ষিত থাকে।
যেকোনো সময় আপনার অ্যাকাউন্ট বা সংরক্ষিত তথ্য মুছে ফেলার জন্য আমাদের সাপোর্ট সেন্টারে অনুরোধ করতে পারেন।`,
        content_en: 'Our commitment to protecting your personal data, delivery info and payment security.',
        seo_title: 'গোপনীয়তা নীতি | বস্ত্র শৈলী (BOSTROSHOILY)',
        meta_description: 'বস্ত্র শৈলী (BOSTROSHOILY)-র গ্রাহক তথ্যের শতভাগ সুরক্ষা ও গোপনীয়তা বজায় রাখার নীতিমালা।',
      },
      {
        id: 'pol-delivery-information',
        slug: 'delivery-information',
        title_bn: 'ডেলিভারি তথ্য ও চার্জ',
        title_en: 'Delivery Information & Charges',
        content_bn: `১. ডেলিভারি সময়সীমা
সিরাজগঞ্জ জেলা ও আশেপাশের এলাকায়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি।
ঢাকা মেট্রোপলিটন এলাকা: ১ থেকে ২ কার্যদিবসের মধ্যে সরাসরি হোম ডেলিভারি।
ঢাকা ও সিরাজগঞ্জের বাইরে সারা বাংলাদেশের যেকোনো জেলা/উপজেলায়: ২ থেকে ৩ কার্যদিবসের মধ্যে হোম ডেলিভারি।

২. ডেলিভারি চার্জের হার
সিরাজগঞ্জ লোকাল হোম ডেলিভারি: ৫০ টাকা মাত্র।
ঢাকা সিটির ভেতর হোম ডেলিভারি: ৭০ টাকা মাত্র।
ঢাকা সিটির বাইরে সমগ্র বাংলাদেশে: ১২০ টাকা মাত্র।
বিশেষ অফার: ২০০০ টাকা বা তদূর্ধ্ব মূল্যের সকল অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি!

৩. ক্যাশ অন ডেলিভারি (COD) ও ট্র্যাকিং
কোনো অগ্রিম টাকা ছাড়াই সম্পূর্ণ ক্যাশ অন ডেলিভারিতে অর্ডার করার সুবর্ণ সুযোগ।
পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।
অর্ডার ডিসপ্যাচ হওয়ার সাথে সাথে আপনার ফোনে ট্র্যাকিং লিংক ও এসএমএস পাঠানো হবে যাতে রিয়েল-টাইম পার্সেল ট্র্যাক করতে পারেন।

৪. উৎসব ও আবহাওয়া জনিত সতর্কতা
ঈদ বা বিশেষ উৎসবের মৌসুমে কুরিয়ারের অতিরিক্ত চাপের কারণে ১ দিন বেশি সময় লাগতে পারে। সময়মতো পণ্য পেতে উৎসবের অন্তত ৫-৭ দিন আগে অর্ডার সম্পন্ন করার পরামর্শ দেওয়া হয়।`,
        content_en: 'Full delivery charge rates, timeframes, and tracking procedures across all 64 districts in Bangladesh.',
        seo_title: 'ডেলিভারি তথ্য ও চার্জ | বস্ত্র শৈলী (BOSTROSHOILY)',
        meta_description: 'সারা দেশে দ্রুততম ক্যাশ অন ডেলিভারি সুবিধা ও নির্দিষ্ট চার্জের বিস্তারিত তালিকা।',
      },
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO policy_pages (
        id, slug, title_bn, title_en, content_bn, content_en, seo_title, meta_description, status, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
    `);

    for (const p of policies) {
      stmt.run(p.id, p.slug, p.title_bn, p.title_en, p.content_bn, p.content_en, p.seo_title, p.meta_description);
    }
  } catch (err) {
    console.warn('ensurePolicyPagesSeeded warning:', err);
  }
}

export function ensureSizeChartsSeeded() {
  try {
    const defaultCharts = [
      {
        id: 'sc-panjabi',
        name: 'Panjabi Standard Fit',
        bangla_name: 'পাঞ্জাবি সাইজ ও মাপ চার্ট',
        category_slug: 'panjabi',
        sub_category: 'Panjabi',
        unit: 'inch',
        notes: 'সমস্ত মাপ স্ট্যান্ডার্ড ইঞ্চিতে পরিমাপ করা। ১০০% প্রিমিয়াম সুতি ও আরামদায়ক কাটিং।',
        measurements: [
          { size: '38 (S)', chest: '40"', length: '40"', shoulder: '17.5"', sleeve: '24"' },
          { size: '40 (M)', chest: '42"', length: '42"', shoulder: '18"', sleeve: '24.5"' },
          { size: '42 (L)', chest: '44"', length: '44"', shoulder: '18.5"', sleeve: '25"' },
          { size: '44 (XL)', chest: '46"', length: '45"', shoulder: '19"', sleeve: '25.5"' },
          { size: '46 (XXL)', chest: '48"', length: '46"', shoulder: '19.5"', sleeve: '26"' },
        ],
      },
      {
        id: 'sc-lungi',
        name: 'Lungi Size & Length',
        bangla_name: 'লুঙ্গি সাইজ ও হাত মাপ চার্ট',
        category_slug: 'lungi',
        sub_category: 'Lungi',
        unit: 'inch',
        notes: 'সিরাজগঞ্জ খাঁটি তাঁতের সুতি লুঙ্গি। স্ট্যান্ডার্ড দৈর্ঘ্য ও ঘের।',
        measurements: [
          { size: '২.৫ হাত', length: '45 Inch', width: '82 Inch', recommended: 'উচ্চতা ৫\'২" - ৫\'৫"' },
          { size: '২.৭৫ হাত', length: '48 Inch', width: '88 Inch', recommended: 'উচ্চতা ৫\'৬" - ৫\'১০" (স্ট্যান্ডার্ড)' },
          { size: '৩ হাত', length: '52 Inch', width: '92 Inch', recommended: 'উচ্চতা ৫\'১০"+' },
          { size: 'Free Size', length: '48 Inch', width: '88 Inch', recommended: 'রেগুলার যেকোনো উচ্চতা' },
        ],
      },
      {
        id: 'sc-saree',
        name: 'Saree Standard',
        bangla_name: 'শাড়ি সাইজ ও আঁচল চার্ট',
        category_slug: 'saree',
        sub_category: 'Saree',
        unit: 'inch',
        notes: 'ঐতিহ্যবাহী জামদানি ও তাঁতের শাড়ি। দৈর্ঘ্য ১২ থেকে ১৪ হাত।',
        measurements: [
          { size: '১২ হাত (Standard)', length: '5.5 Meter', blouse: 'Without Blouse Piece', aanchal: 'Traditional Woven' },
          { size: '১২.৫ হাত (With Blouse)', length: '6.0 Meter', blouse: 'Included (0.8 Meter)', aanchal: 'Designer Zari/Resham' },
          { size: 'Free Size', length: '5.5 Meter (১২ হাত)', blouse: 'রানিং ব্লাউজ পিস সহ', aanchal: 'অভিজাত ট্র্যাডিশনাল' },
        ],
      },
      {
        id: 'sc-tshirt',
        name: 'T-Shirt Standard Fit',
        bangla_name: 'টি-শার্ট সাইজ চার্ট',
        category_slug: 'tshirt',
        sub_category: 'T-Shirt',
        unit: 'inch',
        notes: '১০০% কম্বড কটন প্রি-ওয়াশড টি-শার্ট।',
        measurements: [
          { size: 'M', chest: '38"', length: '27"', shoulder: '17"' },
          { size: 'L', chest: '40"', length: '28"', shoulder: '18"' },
          { size: 'XL', chest: '42"', length: '29"', shoulder: '19"' },
          { size: 'XXL', chest: '44"', length: '30"', shoulder: '20"' },
        ],
      },
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO size_charts (
        id, name, bangla_name, category_slug, sub_category, measurements_json, unit, notes, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const sc of defaultCharts) {
      stmt.run(sc.id, sc.name, sc.bangla_name, sc.category_slug, sc.sub_category, JSON.stringify(sc.measurements), sc.unit, sc.notes);
    }
  } catch (err) {
    console.warn('ensureSizeChartsSeeded warning:', err);
  }
}

export function ensureMainCategoriesSeeded() {
  try {
    const mainCats = [
      { id: 'cat-main-men', name: 'MEN', bangla_name: 'পুরুষদের পোশাক', slug: 'men', order_num: 1 },
      { id: 'cat-main-women', name: 'WOMEN', bangla_name: 'মহিলাদের পোশাক', slug: 'women', order_num: 2 },
      { id: 'cat-main-kids', name: 'KIDS', bangla_name: 'বাচ্চাদের কালেকশন', slug: 'kids', order_num: 3 },
      { id: 'cat-main-others', name: 'OTHERS & ACCESSORIES', bangla_name: 'উপহার ও আনুষঙ্গিক', slug: 'others', order_num: 4 },
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, bangla_name, slug, parent_category, order_num, active, is_main)
      VALUES (?, ?, ?, ?, 'ROOT', ?, 1, 1)
    `);

    for (const mc of mainCats) {
      stmt.run(mc.id, mc.name, mc.bangla_name, mc.slug, mc.order_num);
      db.prepare(`UPDATE categories SET is_main = 1 WHERE slug = ?`).run(mc.slug);
    }

    // Seed Initial Subcategories under MEN, WOMEN, KIDS, OTHERS & ACCESSORIES
    const initialSubs = [
      // MEN
      { id: 'sub-lungi', name: 'Lungi', bangla_name: 'লুঙ্গি', slug: 'lungi', parent: 'MEN', order: 1, circle_image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-panjabi', name: 'Panjabi', bangla_name: 'পাঞ্জাবি', slug: 'panjabi', parent: 'MEN', order: 2, circle_image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-tshirt', name: 'T-Shirt & Polo T-Shirt', bangla_name: 'টি-শার্ট ও পোলো', slug: 't-shirt', parent: 'MEN', order: 3, circle_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-shirts', name: 'Shirts', bangla_name: 'শার্ট', slug: 'shirts', parent: 'MEN', order: 4, circle_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-jeans-pants', name: 'Jeans & Pants', bangla_name: 'জিন্স ও প্যান্ট', slug: 'jeans-pants', parent: 'MEN', order: 5, circle_image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-innerwear', name: 'Innerwear', bangla_name: 'ইনারওয়্যার', slug: 'innerwear', parent: 'MEN', order: 6, circle_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-traditional-wear', name: 'Traditional Wear', bangla_name: 'ঐতিহ্যবাহী পোশাক', slug: 'traditional-wear', parent: 'MEN', order: 7, circle_image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-payjama', name: 'Payjama', bangla_name: 'পায়জামা', slug: 'payjama', parent: 'MEN', order: 8, circle_image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=400&q=80' },
      
      // WOMEN
      { id: 'sub-saree', name: 'Saree', bangla_name: 'শাড়ি ও জামদানি', slug: 'saree', parent: 'WOMEN', order: 1, circle_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-threepiece', name: 'Three-Piece', bangla_name: 'থ্রি-পিস', slug: 'three-piece', parent: 'WOMEN', order: 2, circle_image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-salwar-kameez', name: 'Salwar Kameez', bangla_name: 'সালোয়ার কামিজ', slug: 'salwar-kameez', parent: 'WOMEN', order: 3, circle_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-kurti', name: 'Kurti', bangla_name: 'কুর্তি', slug: 'kurti', parent: 'WOMEN', order: 4, circle_image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-tops', name: 'Tops', bangla_name: 'টপস', slug: 'tops', parent: 'WOMEN', order: 5, circle_image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-abaya', name: 'Abaya', bangla_name: 'আবায়া', slug: 'abaya', parent: 'WOMEN', order: 6, circle_image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-hijab', name: 'Hijab', bangla_name: 'হিজাব', slug: 'hijab', parent: 'WOMEN', order: 7, circle_image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-womens-bottoms', name: "Women's Bottom Wear", bangla_name: 'লেডিস বটমস ও প্লাজো', slug: 'womens-bottoms', parent: 'WOMEN', order: 8, circle_image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=80' },

      // KIDS
      { id: 'sub-boys-clothing', name: 'Boys Clothing', bangla_name: 'ছেলেদের পোশাক', slug: 'boys-clothing', parent: 'KIDS', order: 1, circle_image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-girls-clothing', name: 'Girls Clothing', bangla_name: 'মেয়েদের পোশাক', slug: 'girls-clothing', parent: 'KIDS', order: 2, circle_image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-baby-clothing', name: 'Baby Clothing', bangla_name: 'শিশুদের পোশাক', slug: 'baby-clothing', parent: 'KIDS', order: 3, circle_image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-kids-sets', name: 'Kids Sets', bangla_name: 'কিডস কম্বো সেট', slug: 'kids-sets', parent: 'KIDS', order: 4, circle_image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=400&q=80' },

      // OTHERS & ACCESSORIES
      { id: 'sub-gift-box', name: 'Gift Box', bangla_name: 'উপহার বক্স', slug: 'gift-box', parent: 'OTHERS & ACCESSORIES', order: 1, circle_image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-ator', name: 'Ator', bangla_name: 'আতর ও সুগন্ধি', slug: 'ator', parent: 'OTHERS & ACCESSORIES', order: 2, circle_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-tupi', name: 'Tupi', bangla_name: 'টুপি ও ক্যাপ', slug: 'tupi', parent: 'OTHERS & ACCESSORIES', order: 3, circle_image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-sal-chador', name: 'Sal Chador', bangla_name: 'শাল ও চাদর', slug: 'sal-chador', parent: 'OTHERS & ACCESSORIES', order: 4, circle_image: 'https://images.unsplash.com/photo-1606744888344-498238f0170a?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-bags', name: 'Bags', bangla_name: 'ব্যাগ ও পার্স', slug: 'bags', parent: 'OTHERS & ACCESSORIES', order: 5, circle_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-accessories', name: 'Accessories', bangla_name: 'ফ্যাশন আনুষঙ্গিক', slug: 'accessories', parent: 'OTHERS & ACCESSORIES', order: 6, circle_image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-fashion-essentials', name: 'Fashion Essentials', bangla_name: 'নিত্য প্রয়োজনীয় ফ্যাশন সামগ্রী', slug: 'fashion-essentials', parent: 'OTHERS & ACCESSORIES', order: 7, circle_image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=400&q=80' },
      { id: 'sub-seasonal-collections', name: 'Seasonal Collections', bangla_name: 'সিজনাল স্পেশাল কালেকশন', slug: 'seasonal-collections', parent: 'OTHERS & ACCESSORIES', order: 8, circle_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80' },
    ];

    const insertSubStmt = db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, bangla_name, slug, parent_category, order_num, active, circle_image, show_in_circle_gallery, circle_gallery_order)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, 1, ?)
    `);

    for (const sub of initialSubs) {
      insertSubStmt.run(sub.id, sub.name, sub.bangla_name, sub.slug, sub.parent, sub.order, sub.circle_image, sub.order);
      // Update existing if already present
      db.prepare(`
        UPDATE categories
        SET parent_category = COALESCE(parent_category, ?),
            circle_image = COALESCE(circle_image, ?),
            show_in_circle_gallery = COALESCE(show_in_circle_gallery, 1)
        WHERE slug = ?
      `).run(sub.parent, sub.circle_image, sub.slug);
    }
  } catch (err) {
    console.warn('ensureMainCategoriesSeeded warning:', err);
  }
}

export function ensureProductAddonsSeeded() {
  try {
    const giftBoxProduct = db.prepare("SELECT id FROM products WHERE slug = 'royal-luxury-magnetic-gift-box' OR id = 'prod-gift-box'").get() as any;
    if (giftBoxProduct?.id) {
      const topProducts = db.prepare("SELECT id FROM products WHERE id != ? LIMIT 8").all(giftBoxProduct.id) as any[];
      const insertAddon = db.prepare(`
        INSERT OR IGNORE INTO product_addons (
          id, product_id, addon_product_id, custom_title_bn, custom_description_bn, price_override, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `);

      for (let i = 0; i < topProducts.length; i++) {
        insertAddon.run(
          `addon-${topProducts[i].id}-${giftBoxProduct.id}`,
          topProducts[i].id,
          giftBoxProduct.id,
          'প্রিয়জনকে উপহার দিতে সুন্দর লাক্সারি ম্যাগনেটিক গিফট বক্স নিন',
          'আকর্ষণীয় সাটিন রিবন ও স্পেশাল গ্রিটিংস কার্ডসহ প্রিমিয়াম রিজিড বক্স। পাঞ্জাবি বা শাড়ি সুন্দরভাবে প্যাক করার উপযোগী।',
          290,
          1
        );
      }
    }
  } catch (err) {
    console.warn('ensureProductAddonsSeeded warning:', err);
  }
}

// Initialize on import
initDatabaseSchema();
seedDatabaseIfEmpty();
ensureAdminCredentials();
ensureAllProductsSeeded();
ensureBannersTableAndSeeded();
ensureStoreSettings();
ensureOthersCategoriesAndUpsells();
ensurePolicyPagesSeeded();
ensureSizeChartsSeeded();
ensureMainCategoriesSeeded();
ensureProductAddonsSeeded();
ensureVideoGalleryAndSecuritySeed();
applyAdminRecoveryIfRequested();

