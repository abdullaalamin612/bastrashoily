/**
 * BOSTROSHOILY (বস্ত্র শৈলী) - Production Email & Bangladesh SMS OTP Delivery Engine
 * 
 * Secure delivery of one-time recovery codes to registered admin contacts.
 * - Credentials reside strictly in server-side environment variables.
 * - Never logs or exposes plain OTPs.
 * - Validates provider configuration; fails with clear, informative errors if unconfigured.
 * - Supports Bangladesh (+880) SMS providers (Greenweb BD, BulksmsBD, Alpha SMS, Twilio, Webhook).
 * - Supports Email via SMTP (Nodemailer), Resend API, and SendGrid API.
 */

import nodemailer from 'nodemailer';

export interface DeliveryResult {
  success: boolean;
  message?: string;
  error?: string;
  provider?: string;
  code?: string;
}

// -----------------------------------------------------------------------------
// 1. PROVIDER STATUS CHECKS (Does not leak secrets)
// -----------------------------------------------------------------------------
export function isEmailDeliveryConfigured(): { configured: boolean; providerName: string } {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    return { configured: true, providerName: 'Resend API' };
  }
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim()) {
    return { configured: true, providerName: 'SendGrid API' };
  }
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_HOST.trim() &&
    process.env.SMTP_USER.trim()
  ) {
    return { configured: true, providerName: `SMTP (${process.env.SMTP_HOST.trim()})` };
  }
  return { configured: false, providerName: 'None' };
}

export function isSmsDeliveryConfigured(): { configured: boolean; providerName: string } {
  if (process.env.GREENWEB_SMS_TOKEN && process.env.GREENWEB_SMS_TOKEN.trim()) {
    return { configured: true, providerName: 'Greenweb BD SMS Gateway' };
  }
  if (process.env.BULKSMSBD_API_KEY && process.env.BULKSMSBD_API_KEY.trim()) {
    return { configured: true, providerName: 'BulksmsBD Gateway' };
  }
  if (process.env.ALPHA_SMS_API_KEY && process.env.ALPHA_SMS_API_KEY.trim()) {
    return { configured: true, providerName: 'Alpha SMS BD Gateway' };
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_PHONE &&
    process.env.TWILIO_ACCOUNT_SID.trim()
  ) {
    return { configured: true, providerName: 'Twilio SMS' };
  }
  if (process.env.SMS_GATEWAY_URL && process.env.SMS_GATEWAY_URL.trim()) {
    return { configured: true, providerName: 'Custom SMS Webhook Gateway' };
  }
  return { configured: false, providerName: 'None' };
}

// -----------------------------------------------------------------------------
// 2. EMAIL OTP DELIVERY
// -----------------------------------------------------------------------------
export async function sendEmailOtp(toEmail: string, otpCode: string, adminName?: string): Promise<DeliveryResult> {
  const emailStatus = isEmailDeliveryConfigured();
  if (!emailStatus.configured) {
    return {
      success: false,
      code: 'EMAIL_NOT_CONFIGURED',
      error:
        'সার্ভার-সাইড ইমেইল সার্ভিস কনফিগার করা নেই। Render Dashboard > Environment-এ SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) অথবা RESEND_API_KEY সেট করুন।',
    };
  }

  const subject = 'বস্ত্র শৈলী (BOSTROSHOILY) - এডমিন একাউন্ট রিকভারি ওটিপি কোড';
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #1a1a1a; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #1c1917; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; font-size: 12px; color: #f59e0b; }
        .content { padding: 32px 24px; text-align: center; }
        .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .desc { font-size: 13px; color: #525252; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 16px 24px; display: inline-block; margin: 0 auto 24px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #b45309; }
        .validity { font-size: 12px; color: #b45309; font-weight: bold; margin-top: 6px; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; font-size: 11px; color: #991b1b; text-align: left; line-height: 1.5; margin-top: 16px; }
        .footer { padding: 16px 24px; background: #fafafa; border-top: 1px solid #f0f0f0; text-align: center; font-size: 11px; color: #737373; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>BOSTROSHOILY • বস্ত্র শৈলী</h1>
          <p>এডমিন পোর্টাল সিকিউরিটি সার্ভিস</p>
        </div>
        <div class="content">
          <div class="greeting">আসসালামু আলাইকুম, ${adminName || 'এডমিন'}!</div>
          <div class="desc">
            আপনার বস্ত্র শৈলী (BOSTROSHOILY) এডমিন একাউন্টের পাসওয়ার্ড রিসেট করার জন্য এই ওটিপি (OTP) কোডটি ইস্যু করা হয়েছে।
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="validity">⏱ কোডের মেয়াদ ৫ মিনিট (একবার ব্যবহারযোগ্য)</div>
          </div>
          <div class="warning">
            ⚠️ <strong>নিরাপত্তা সতর্কতা:</strong> এই ওটিপি কোডটি অত্যন্ত গোপনীয়। এটি কারও সাথে শেয়ার করবেন না। আপনি যদি এই অনুরোধ না করে থাকেন, তবে অবিলম্বে আপনার সার্ভার ও সাইট এক্সেস যাচাই করুন।
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} বস্ত্র শৈলী (BOSTROSHOILY) • সিরাজগঞ্জ ও পাবনার সেরা দেশীয় পোশাক
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
[BOSTROSHOILY] বস্ত্র শৈলী এডমিন একাউন্ট রিকভারি
আসসালামু আলাইকুম, ${adminName || 'এডমিন'}!

আপনার বস্ত্র শৈলী (BOSTROSHOILY) এডমিন একাউন্ট পাসওয়ার্ড রিসেটের ওটিপি কোড: ${otpCode}
মেয়াদ: ৫ মিনিট (একবার ব্যবহারযোগ্য)।

নিরাপত্তা সতর্কতা: এই কোডটি কারও সাথে শেয়ার করবেন না।
`;

  // 1. Resend API
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    try {
      const fromAddr = process.env.RESEND_FROM || 'BOSTROSHOILY <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [toEmail],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Resend HTTP error ${res.status}`);
      }
      return { success: true, provider: 'Resend API', message: 'Email dispatched successfully via Resend' };
    } catch (err: any) {
      console.error('[Email Delivery Error via Resend]:', err?.message || err);
      return { success: false, code: 'RESEND_DELIVERY_FAILED', error: `Resend ইমেইল ডেলিভারি ব্যর্থ হয়েছে: ${err?.message || 'Unknown error'}` };
    }
  }

  // 2. SendGrid API
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim()) {
    try {
      const fromAddr = process.env.SENDGRID_FROM || 'no-reply@bostroshoily.com';
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: fromAddr, name: 'BOSTROSHOILY' },
          subject,
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent },
          ],
        }),
      });
      if (!res.ok && res.status !== 202) {
        const errText = await res.text();
        throw new Error(errText || `SendGrid status ${res.status}`);
      }
      return { success: true, provider: 'SendGrid API', message: 'Email dispatched successfully via SendGrid' };
    } catch (err: any) {
      console.error('[Email Delivery Error via SendGrid]:', err?.message || err);
      return { success: false, code: 'SENDGRID_DELIVERY_FAILED', error: `SendGrid ইমেইল ডেলিভারি ব্যর্থ হয়েছে: ${err?.message || 'Unknown error'}` };
    }
  }

  // 3. SMTP via Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      });

      const fromAddress = process.env.SMTP_FROM || `"BOSTROSHOILY Security" <${process.env.SMTP_USER.trim()}>`;

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return { success: true, provider: 'SMTP', message: 'Email dispatched successfully via SMTP' };
    } catch (err: any) {
      console.error('[Email Delivery Error via SMTP]:', err?.message || err);
      return { success: false, code: 'SMTP_DELIVERY_FAILED', error: `SMTP ইমেইল ডেলিভারি ব্যর্থ হয়েছে: ${err?.message || 'Unknown SMTP error'}` };
    }
  }

  return {
    success: false,
    code: 'EMAIL_NOT_CONFIGURED',
    error: 'কোনো বৈধ ইমেইল প্রোভাইডার কনফিগারেশন পাওয়া যায়নি।',
  };
}

// -----------------------------------------------------------------------------
// 3. BANGLADESH (+880) SMS OTP DELIVERY
// -----------------------------------------------------------------------------
export async function sendSmsOtp(rawPhone: string, otpCode: string): Promise<DeliveryResult> {
  const smsStatus = isSmsDeliveryConfigured();
  if (!smsStatus.configured) {
    return {
      success: false,
      code: 'SMS_NOT_CONFIGURED',
      error:
        'বাংলাদেশি এসএমএস গেটওয়ে কনফিগার করা নেই। Render Dashboard > Environment-এ GREENWEB_SMS_TOKEN, ALPHA_SMS_API_KEY, BULKSMSBD_API_KEY অথবা TWILIO ক্রেডেনশিয়াল সেট করুন।',
    };
  }

  // Normalize Bangladesh Phone (e.g. 01890123456 or +8801890123456 -> 8801890123456 or 01890123456)
  const digitsOnly = rawPhone.replace(/\D/g, '');
  let phoneWithCountryCode = digitsOnly;
  let localPhone = digitsOnly;

  if (digitsOnly.startsWith('880')) {
    localPhone = '0' + digitsOnly.slice(3);
  } else if (digitsOnly.startsWith('0')) {
    phoneWithCountryCode = '88' + digitsOnly;
  } else {
    phoneWithCountryCode = '880' + digitsOnly;
    localPhone = '0' + digitsOnly;
  }

  const smsMessage = `[BOSTROSHOILY] বস্ত্র শৈলী এডমিন একাউন্ট রিকভারি ওটিপি: ${otpCode}। মেয়াদ ৫ মিনিট। এই কোডটি কাউকে বলবেন না।`;

  // 1. Greenweb BD SMS Gateway
  if (process.env.GREENWEB_SMS_TOKEN && process.env.GREENWEB_SMS_TOKEN.trim()) {
    try {
      const token = process.env.GREENWEB_SMS_TOKEN.trim();
      const url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(token)}&to=${encodeURIComponent(localPhone)}&message=${encodeURIComponent(smsMessage)}`;
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      if (!res.ok || text.toLowerCase().includes('error')) {
        throw new Error(text || `HTTP ${res.status}`);
      }
      return { success: true, provider: 'Greenweb BD SMS', message: 'SMS dispatched via Greenweb BD' };
    } catch (err: any) {
      console.error('[SMS Delivery Error via Greenweb]:', err?.message || err);
      return { success: false, code: 'GREENWEB_DELIVERY_FAILED', error: `Greenweb এসএমএস পাঠানো সম্ভব হয়নি: ${err?.message || 'Unknown error'}` };
    }
  }

  // 2. BulksmsBD Gateway
  if (process.env.BULKSMSBD_API_KEY && process.env.BULKSMSBD_API_KEY.trim()) {
    try {
      const apiKey = process.env.BULKSMSBD_API_KEY.trim();
      const senderId = process.env.BULKSMSBD_SENDER_ID || '';
      const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(localPhone)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(smsMessage)}`;
      const res = await fetch(url, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.response_code !== 202 && data.response_code !== 1000)) {
        throw new Error(data?.error_message || `BulksmsBD status ${res.status}`);
      }
      return { success: true, provider: 'BulksmsBD', message: 'SMS dispatched via BulksmsBD' };
    } catch (err: any) {
      console.error('[SMS Delivery Error via BulksmsBD]:', err?.message || err);
      return { success: false, code: 'BULKSMSBD_DELIVERY_FAILED', error: `BulksmsBD এসএমএস পাঠানো সম্ভব হয়নি: ${err?.message || 'Unknown error'}` };
    }
  }

  // 3. Alpha SMS BD
  if (process.env.ALPHA_SMS_API_KEY && process.env.ALPHA_SMS_API_KEY.trim()) {
    try {
      const res = await fetch('https://api.sms.net.bd/sendsms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: process.env.ALPHA_SMS_API_KEY.trim(),
          msg: smsMessage,
          to: localPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.error && data.error !== 0)) {
        throw new Error(data?.msg || `Alpha SMS error status ${res.status}`);
      }
      return { success: true, provider: 'Alpha SMS BD', message: 'SMS dispatched via Alpha SMS BD' };
    } catch (err: any) {
      console.error('[SMS Delivery Error via Alpha SMS]:', err?.message || err);
      return { success: false, code: 'ALPHA_SMS_DELIVERY_FAILED', error: `Alpha SMS এসএমএস পাঠানো সম্ভব হয়নি: ${err?.message || 'Unknown error'}` };
    }
  }

  // 4. Twilio SMS
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_PHONE) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID.trim();
      const token = process.env.TWILIO_AUTH_TOKEN.trim();
      const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

      const formattedPhone = '+' + phoneWithCountryCode;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_FROM_PHONE.trim(),
          To: formattedPhone,
          Body: smsMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Twilio error status ${res.status}`);
      }
      return { success: true, provider: 'Twilio SMS', message: 'SMS dispatched via Twilio' };
    } catch (err: any) {
      console.error('[SMS Delivery Error via Twilio]:', err?.message || err);
      return { success: false, code: 'TWILIO_DELIVERY_FAILED', error: `Twilio এসএমএস পাঠানো সম্ভব হয়নি: ${err?.message || 'Unknown error'}` };
    }
  }

  // 5. Generic SMS Gateway Webhook
  if (process.env.SMS_GATEWAY_URL && process.env.SMS_GATEWAY_URL.trim()) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (process.env.SMS_GATEWAY_AUTH_BEARER) {
        headers['Authorization'] = `Bearer ${process.env.SMS_GATEWAY_AUTH_BEARER.trim()}`;
      }
      const res = await fetch(process.env.SMS_GATEWAY_URL.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: localPhone,
          phoneWithCountryCode,
          message: smsMessage,
          otp: otpCode,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `SMS Webhook returned status ${res.status}`);
      }
      return { success: true, provider: 'Custom SMS Webhook Gateway', message: 'SMS dispatched via custom webhook' };
    } catch (err: any) {
      console.error('[SMS Delivery Error via Webhook]:', err?.message || err);
      return { success: false, code: 'WEBHOOK_DELIVERY_FAILED', error: `কাস্টম এসএমএস গেটওয়ে রেসপন্স করেনি: ${err?.message || 'Unknown error'}` };
    }
  }

  return {
    success: false,
    code: 'SMS_NOT_CONFIGURED',
    error: 'কোনো সক্রিয় এসএমএস গেটওয়ে কনফিগার করা নেই।',
  };
}
