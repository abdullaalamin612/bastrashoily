import crypto from 'node:crypto';
import { db } from './db.js';

export interface PaymentGatewayConfig {
  bkash: {
    enabled: boolean;
    isLive: boolean;
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    merchantNumber: string;
  };
  nagad: {
    enabled: boolean;
    isLive: boolean;
    merchantId: string;
    publicKey: string;
    privateKey: string;
    merchantNumber: string;
  };
  sslcommerz: {
    enabled: boolean;
    isLive: boolean;
    storeId: string;
    storePasswd: string;
  };
}

export function isSimulationAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  if (process.env.ALLOW_PAYMENT_SIMULATION === 'false') {
    return false;
  }
  return process.env.ALLOW_PAYMENT_SIMULATION === 'true';
}

export function getPaymentGatewayConfig(): PaymentGatewayConfig {
  let dbConfig: any = {};
  try {
    const row = db.prepare("SELECT value FROM store_settings WHERE key = 'payment_gateway_credentials'").get() as any;
    if (row && row.value) {
      dbConfig = JSON.parse(row.value);
    }
  } catch (err) {
    console.warn('Could not read payment gateway credentials from database, using env/defaults:', err);
  }

  return {
    bkash: {
      enabled: dbConfig.bkash?.enabled ?? (process.env.BKASH_ENABLED !== 'false'),
      isLive: dbConfig.bkash?.isLive ?? (process.env.BKASH_IS_LIVE === 'true'),
      appKey: process.env.BKASH_APP_KEY || dbConfig.bkash?.appKey || '',
      appSecret: process.env.BKASH_APP_SECRET || dbConfig.bkash?.appSecret || '',
      username: process.env.BKASH_USERNAME || dbConfig.bkash?.username || '',
      password: process.env.BKASH_PASSWORD || dbConfig.bkash?.password || '',
      merchantNumber: process.env.BKASH_MERCHANT_NUMBER || dbConfig.bkash?.merchantNumber || '01864-528488',
    },
    nagad: {
      enabled: dbConfig.nagad?.enabled ?? (process.env.NAGAD_ENABLED !== 'false'),
      isLive: dbConfig.nagad?.isLive ?? (process.env.NAGAD_IS_LIVE === 'true'),
      merchantId: process.env.NAGAD_MERCHANT_ID || dbConfig.nagad?.merchantId || '',
      publicKey: process.env.NAGAD_PUBLIC_KEY || dbConfig.nagad?.publicKey || '',
      privateKey: process.env.NAGAD_PRIVATE_KEY || dbConfig.nagad?.privateKey || '',
      merchantNumber: process.env.NAGAD_MERCHANT_NUMBER || dbConfig.nagad?.merchantNumber || '01864-528488',
    },
    sslcommerz: {
      enabled: dbConfig.sslcommerz?.enabled ?? (process.env.SSLCOMMERZ_ENABLED !== 'false'),
      isLive: dbConfig.sslcommerz?.isLive ?? (process.env.SSLCOMMERZ_IS_LIVE === 'true'),
      storeId: process.env.SSLCOMMERZ_STORE_ID || dbConfig.sslcommerz?.storeId || '',
      storePasswd: process.env.SSLCOMMERZ_STORE_PASSWD || dbConfig.sslcommerz?.storePasswd || '',
    },
  };
}

export function savePaymentGatewayConfig(config: Partial<PaymentGatewayConfig>): void {
  const current = getPaymentGatewayConfig();
  const merged = {
    bkash: { ...current.bkash, ...(config.bkash || {}) },
    nagad: { ...current.nagad, ...(config.nagad || {}) },
    sslcommerz: { ...current.sslcommerz, ...(config.sslcommerz || {}) },
  };

  db.prepare(`
    INSERT INTO store_settings (key, value, updated_at)
    VALUES ('payment_gateway_credentials', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(JSON.stringify(merged));
}

// -------------------------------------------------------------
// 1. bKash Tokenized / Direct Checkout API
// -------------------------------------------------------------
export async function initiateBkashPayment(params: {
  orderId: string;
  amount: number;
  customerPhone?: string;
  callbackUrl: string;
}) {
  const cfg = getPaymentGatewayConfig().bkash;
  const baseUrl = cfg.isLive
    ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
    : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

  const hasCredentials = Boolean(cfg.appKey && cfg.appSecret && cfg.username && cfg.password);

  // If credentials are provided, attempt real API flow
  if (hasCredentials) {
    try {
      // 1. Grant Token
      const tokenRes = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          username: cfg.username,
          password: cfg.password,
        },
        body: JSON.stringify({
          app_key: cfg.appKey,
          app_secret: cfg.appSecret,
        }),
      });
      const tokenData = await tokenRes.json();

      if (!tokenData.id_token) {
        throw new Error(tokenData.statusMessage || 'Failed to authenticate with bKash API');
      }

      // 2. Create Payment
      const createRes = await fetch(`${baseUrl}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenData.id_token,
          'X-APP-Key': cfg.appKey,
        },
        body: JSON.stringify({
          mode: '0011',
          payerReference: params.customerPhone || '01864528488',
          callbackURL: params.callbackUrl,
          amount: params.amount.toFixed(2),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: params.orderId,
        }),
      });

      const createData = await createRes.json();
      if (createData.bkashURL) {
        return {
          success: true,
          mode: 'redirect',
          gateway: 'bkash',
          paymentId: createData.paymentID,
          paymentUrl: createData.bkashURL,
        };
      }
      throw new Error(createData.statusMessage || 'bKash create payment did not return checkout URL');
    } catch (err: any) {
      console.error('Direct bKash API call failed:', err?.message);
      // In production or when credentials exist, NEVER silently simulate
      if (cfg.isLive || !isSimulationAllowed()) {
        throw new Error(`bKash গেটওয়ে সংযোগ ব্যর্থ: ${err?.message || 'অজ্ঞাত ত্রুটি'}`);
      }
    }
  }

  // Only allowed in sandbox / development mode
  if (!isSimulationAllowed()) {
    throw new Error('প্রোডাকশনে bKash API credentials আবশ্যক। সিমুলেশন সম্পূর্ণ নিষ্ক্রিয়।');
  }

  const paymentId = `bKash-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  return {
    success: true,
    mode: 'simulation',
    gateway: 'bkash',
    paymentId,
    paymentUrl: `/payment/checkout-simulator?gateway=bkash&orderId=${params.orderId}&amount=${params.amount}&paymentId=${paymentId}`,
    merchantNumber: cfg.merchantNumber,
  };
}

export async function executeBkashPayment(paymentId: string, orderId: string) {
  const cfg = getPaymentGatewayConfig().bkash;
  const baseUrl = cfg.isLive
    ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
    : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

  const hasCredentials = Boolean(cfg.appKey && cfg.appSecret && cfg.username && cfg.password);

  if (hasCredentials) {
    try {
      const tokenRes = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          username: cfg.username,
          password: cfg.password,
        },
        body: JSON.stringify({
          app_key: cfg.appKey,
          app_secret: cfg.appSecret,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.id_token) {
        return {
          success: false,
          error: tokenData.statusMessage || 'bKash token grant failed',
          paymentStatus: 'failed',
        };
      }

      const execRes = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenData.id_token,
          'X-APP-Key': cfg.appKey,
        },
        body: JSON.stringify({ paymentID: paymentId }),
      });
      const execData = await execRes.json();
      if (execData.statusCode === '0000' && execData.trxID) {
        return {
          success: true,
          trxId: execData.trxID,
          paymentStatus: 'paid',
          amount: Number(execData.amount),
        };
      }
      return {
        success: false,
        error: execData.statusMessage || 'bKash execute failed',
        paymentStatus: 'failed',
      };
    } catch (err: any) {
      console.error('bKash execute failed:', err?.message);
      return {
        success: false,
        error: err?.message || 'bKash payment execution network error',
        paymentStatus: 'failed',
      };
    }
  }

  // Simulation verification only allowed if explicitly enabled in non-production
  if (!isSimulationAllowed()) {
    return {
      success: false,
      error: 'প্রোডাকশনে bKash পেমেন্ট ভেরিফিকেশন API ব্যতীত সফল বিবেচনা করা অসম্ভব।',
      paymentStatus: 'failed',
    };
  }

  const ord = db.prepare('SELECT total FROM orders WHERE id = ?').get(orderId) as any;
  const generatedTrx = `BK${Math.floor(100000000 + Math.random() * 900000000)}`;
  return {
    success: true,
    trxId: generatedTrx,
    paymentStatus: 'paid',
    amount: ord ? Number(ord.total) : undefined,
    mode: 'simulation',
  };
}

// -------------------------------------------------------------
// 2. Nagad Merchant Payment Gateway API
// -------------------------------------------------------------
export async function initiateNagadPayment(params: {
  orderId: string;
  amount: number;
  customerPhone?: string;
  callbackUrl: string;
}) {
  const cfg = getPaymentGatewayConfig().nagad;
  const baseUrl = cfg.isLive
    ? 'https://api.mynagad.com/api/dfs'
    : 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs';

  const hasCredentials = Boolean(cfg.merchantId && cfg.publicKey && cfg.privateKey);

  if (hasCredentials) {
    try {
      const now = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
      const initUrl = `${baseUrl}/check-out/initialize/${cfg.merchantId}/${params.orderId}`;
      const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
        },
        body: JSON.stringify({
          dateTime: now,
          sensitiveData: `merchantId=${cfg.merchantId}&orderId=${params.orderId}&currencyCode=050&amount=${params.amount}&challenge=${crypto.randomBytes(8).toString('hex')}`,
          signature: crypto.randomBytes(32).toString('base64'),
        }),
      });

      const initData = await initRes.json();
      if (initData.callBackUrl) {
        return {
          success: true,
          mode: 'redirect',
          gateway: 'nagad',
          paymentId: initData.paymentReferenceId || params.orderId,
          paymentUrl: initData.callBackUrl,
        };
      }
      throw new Error(initData.message || 'Nagad initialization did not return callback URL');
    } catch (err: any) {
      console.error('Nagad direct API failed:', err?.message);
      if (cfg.isLive || !isSimulationAllowed()) {
        throw new Error(`Nagad গেটওয়ে সংযোগ ব্যর্থ: ${err?.message || 'অজ্ঞাত ত্রুটি'}`);
      }
    }
  }

  if (!isSimulationAllowed()) {
    throw new Error('প্রোডাকশনে Nagad API credentials আবশ্যক। সিমুলেশন সম্পূর্ণ নিষ্ক্রিয়।');
  }

  const paymentId = `NAGAD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  return {
    success: true,
    mode: 'simulation',
    gateway: 'nagad',
    paymentId,
    paymentUrl: `/payment/checkout-simulator?gateway=nagad&orderId=${params.orderId}&amount=${params.amount}&paymentId=${paymentId}`,
    merchantNumber: cfg.merchantNumber,
  };
}

export async function verifyNagadPayment(paymentRefId: string, orderId: string) {
  const cfg = getPaymentGatewayConfig().nagad;
  const baseUrl = cfg.isLive
    ? 'https://api.mynagad.com/api/dfs'
    : 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs';

  const hasCredentials = Boolean(cfg.merchantId && cfg.publicKey);

  if (hasCredentials) {
    try {
      const verifyRes = await fetch(`${baseUrl}/verify/payment/${paymentRefId}`);
      const verifyData = await verifyRes.json();
      if (verifyData.status === 'Success') {
        return {
          success: true,
          trxId: verifyData.issuerPaymentRefNo || paymentRefId,
          paymentStatus: 'paid',
          amount: Number(verifyData.amount),
        };
      }
      return {
        success: false,
        error: verifyData.message || 'Nagad verification was not successful',
        paymentStatus: 'failed',
      };
    } catch (err: any) {
      console.error('Nagad verify error:', err?.message);
      return {
        success: false,
        error: err?.message || 'Nagad verification error',
        paymentStatus: 'failed',
      };
    }
  }

  if (!isSimulationAllowed()) {
    return {
      success: false,
      error: 'প্রোডাকশনে Nagad পেমেন্ট ভেরিফিকেশন API ব্যতীত সফল বিবেচনা করা অসম্ভব।',
      paymentStatus: 'failed',
    };
  }

  const ordNagad = db.prepare('SELECT total FROM orders WHERE id = ?').get(orderId) as any;
  const generatedTrx = `NG${Math.floor(100000000 + Math.random() * 900000000)}`;
  return {
    success: true,
    trxId: generatedTrx,
    paymentStatus: 'paid',
    amount: ordNagad ? Number(ordNagad.total) : undefined,
    mode: 'simulation',
  };
}

// -------------------------------------------------------------
// 3. SSLCommerz Hosted Session Gateway API (Cards, MFS, Banks)
// -------------------------------------------------------------
export async function initiateSSLCommerzSession(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerDistrict: string;
  baseUrl: string;
}) {
  const cfg = getPaymentGatewayConfig().sslcommerz;
  const gwUrl = cfg.isLive
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

  const storeId = cfg.storeId;
  const storePasswd = cfg.storePasswd;
  const hasCredentials = Boolean(storeId && storePasswd);

  if (hasCredentials) {
    const formData = new URLSearchParams();
    formData.append('store_id', storeId);
    formData.append('store_passwd', storePasswd);
    formData.append('total_amount', params.amount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', params.orderId);
    formData.append('success_url', `${params.baseUrl}/api/payment/sslcommerz/success`);
    formData.append('fail_url', `${params.baseUrl}/api/payment/sslcommerz/fail`);
    formData.append('cancel_url', `${params.baseUrl}/api/payment/sslcommerz/cancel`);
    formData.append('ipn_url', `${params.baseUrl}/api/payment/sslcommerz/ipn`);
    formData.append('cus_name', params.customerName || 'Customer');
    formData.append('cus_email', params.customerEmail || 'customer@bostroshoily.com');
    formData.append('cus_add1', params.customerAddress || 'Sirajganj');
    formData.append('cus_city', params.customerDistrict || 'Sirajganj');
    formData.append('cus_country', 'Bangladesh');
    formData.append('cus_phone', params.customerPhone || '01864528488');
    formData.append('shipping_method', 'COURIER');
    formData.append('num_of_item', '1');
    formData.append('product_name', 'Handloom Textile Product');
    formData.append('product_category', 'Clothing');
    formData.append('product_profile', 'physical-goods');

    try {
      const sslRes = await fetch(gwUrl, {
        method: 'POST',
        body: formData,
      });
      const sslData = await sslRes.json();
      if (sslData.status === 'SUCCESS' && sslData.GatewayPageURL) {
        return {
          success: true,
          mode: 'redirect',
          gateway: 'sslcommerz',
          paymentId: sslData.sessionkey || params.orderId,
          paymentUrl: sslData.GatewayPageURL,
        };
      }
      throw new Error(sslData.failedreason || 'SSLCommerz session creation failed');
    } catch (err: any) {
      console.error('SSLCommerz direct API initiation failed:', err?.message);
      if (cfg.isLive || !isSimulationAllowed()) {
        throw new Error(`SSLCommerz গেটওয়ে সেশন তৈরি ব্যর্থ: ${err?.message || 'অজ্ঞাত ত্রুটি'}`);
      }
    }
  }

  if (!isSimulationAllowed()) {
    throw new Error('প্রোডাকশনে SSLCommerz Store ID ও Store Password আবশ্যক।');
  }

  const paymentId = `SSL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  return {
    success: true,
    mode: 'simulation',
    gateway: 'sslcommerz',
    paymentId,
    paymentUrl: `/payment/checkout-simulator?gateway=sslcommerz&orderId=${params.orderId}&amount=${params.amount}&paymentId=${paymentId}`,
  };
}

export async function validateSSLCommerzPayment(valId: string, orderId: string) {
  const cfg = getPaymentGatewayConfig().sslcommerz;
  const valUrl = cfg.isLive
    ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

  const storeId = cfg.storeId;
  const storePasswd = cfg.storePasswd;

  if (storeId && storePasswd) {
    try {
      const res = await fetch(`${valUrl}?val_id=${valId}&store_id=${storeId}&store_passwd=${storePasswd}&format=json`);
      const data = await res.json();
      if (data.status === 'VALID' || data.status === 'VALIDATED') {
        return {
          success: true,
          trxId: data.bank_tran_id || data.tran_id || valId,
          paymentStatus: 'paid',
          cardType: data.card_type,
          amount: Number(data.amount),
        };
      }
      return {
        success: false,
        error: data.error || `SSLCommerz verification status: ${data.status}`,
        paymentStatus: 'failed',
      };
    } catch (err: any) {
      console.error('SSLCommerz validation error:', err?.message);
      return {
        success: false,
        error: err?.message || 'SSLCommerz validation request failed',
        paymentStatus: 'failed',
      };
    }
  }

  if (!isSimulationAllowed()) {
    return {
      success: false,
      error: 'প্রোডাকশনে SSLCommerz ভ্যালিডেশন API ব্যতীত পেমেন্ট নিশ্চিত করা অসম্ভব।',
      paymentStatus: 'failed',
    };
  }

  const ordSsl = db.prepare('SELECT total FROM orders WHERE id = ?').get(orderId) as any;
  const generatedTrx = `SSL${Math.floor(100000000 + Math.random() * 900000000)}`;
  return {
    success: true,
    trxId: generatedTrx,
    paymentStatus: 'paid',
    amount: ordSsl ? Number(ordSsl.total) : undefined,
    mode: 'simulation',
  };
}
