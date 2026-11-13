import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { adminRouter, storeRouter, getDynamicBaseUrl, handleDynamicSitemapXml } from './server/api.js';
import { db, DATA_DIR } from './server/db.js';
import { initPostgresStore, getDatabaseMigrationStatus } from './server/postgresStore.js';

const app = express();
// Dev server must run on port 3000 in AI Studio.
// On Render in production, always bind to assigned process.env.PORT.
const isDev = process.env.NODE_ENV !== 'production';
const envPort = Number(process.env.PORT);
const PORT = isDev ? 3000 : (envPort || 3000);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Local image uploads directory: persistent disk in production (/var/data/uploads) and local fallback
const persistentUploadsDir = path.join(DATA_DIR, 'uploads');
try {
  if (!fs.existsSync(persistentUploadsDir)) {
    fs.mkdirSync(persistentUploadsDir, { recursive: true });
  }
} catch (uploadErr) {
  console.warn('[Uploads Directory Warning] Persistent uploads dir error:', uploadErr);
}
const fallbackUploadsDir = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(fallbackUploadsDir)) {
    fs.mkdirSync(fallbackUploadsDir, { recursive: true });
  }
} catch (fallbackErr) {
  console.warn('[Uploads Directory Warning] Fallback uploads dir error:', fallbackErr);
}
if (fs.existsSync(persistentUploadsDir)) {
  app.use('/static/uploads', express.static(persistentUploadsDir));
  app.use('/uploads', express.static(persistentUploadsDir));
}
if (fs.existsSync(fallbackUploadsDir)) {
  app.use('/static/uploads', express.static(fallbackUploadsDir));
  app.use('/uploads', express.static(fallbackUploadsDir));
}

// Clean Architectural Separation:
// 1. /api/admin -> Strictly protected admin endpoints (authenticated sessions, mandatory CSRF & RBAC)
// 2. /api -> Public storefront endpoints (products, categories, checkout, etc.)
app.use('/api/admin', adminRouter);
app.use('/api', storeRouter);

// Lazy-initialize GoogleGenAI to prevent crash if key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'BOSTROSHOILY - বস্ত্র শৈলী',
    time: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Dynamic Root Sitemap & Robots.txt for Search Engines
app.get('/robots.txt', (req, res) => {
  const baseUrl = getDynamicBaseUrl(req);
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

app.get('/sitemap.xml', handleDynamicSitemapXml);

// Database & Supabase PostgreSQL Migration Status endpoint
app.get('/api/database/status', async (req, res) => {
  try {
    const status = await getDatabaseMigrationStatus();
    res.json({ success: true, ...status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Database status error' });
  }
});

// AI Fashion Consultant & Customer Support Route (Authoritative SQLite Grounded & Strictly Secure)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, history, imageBase64, mimeType } = req.body;

    const userText = typeof message === 'string' ? message.trim() : '';

    if (!userText && !imageBase64) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    // -------------------------------------------------------------
    // 1. STRICT SECURITY GUARDRAIL: Never leak admin secrets or passwords
    // -------------------------------------------------------------
    const lowerQuery = userText.toLowerCase();
    const sensitivePatterns = [
      /admin.*pass/i,
      /password/i,
      /পাসওয়ার্ড/i,
      /লগইন.*পাসওয়ার্ড/i,
      /এডমিন.*পাসওয়ার্ড/i,
      /এডমিন.*লগইন/i,
      /secret.*key/i,
      /credential/i,
      /api.*key/i,
      /access.*token/i,
      /বিকাশ.*পিন/i,
      /নগদ.*পিন/i,
      /pin.*number/i,
      /database.*pass/i,
      /auth.*secret/i,
    ];

    const isSensitiveAttempt = sensitivePatterns.some((pattern) => pattern.test(lowerQuery));
    if (isSensitiveAttempt) {
      return res.json({
        reply: 'দুঃখিত, প্রশাসনিক ও নিরাপত্তাজনিত গোপনীয় তথ্য (যেমন পাসওয়ার্ড বা এক্সেস কি) প্রকাশ করা আমাদের নীতিমালার পরিপন্থী। বস্ত্র শৈলী (BOSTROSHOILY)-এর যেকোনো পোশাক, সাইজ গাইড, ডেলিভারি চার্জ, অফার বা অর্ডার সংক্রান্ত যেকোনো তথ্য জানতে চাইলে আমাকে নির্দ্বিধায় বলতে পারেন।',
        productCards: [],
        securityBlocked: true,
      });
    }

    // -------------------------------------------------------------
    // 2. Authoritative Dynamic Data from SQLite Store Settings & Products
    //    (Admin panel rule changes immediately take effect here!)
    // -------------------------------------------------------------
    let deliveryConfig: any = { insideDhakaCharge: 70, outsideDhakaCharge: 130, freeDeliveryThreshold: 2000, estimatedDeliveryDays: '২-৪ দিন' };
    let generalSettings: any = { phone: '+880 1864-528488', address: 'তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ', returnPolicyDays: 7, whatsappNumber: '01864528488' };
    let footerConfig: any = { returnPolicy: '৭ দিনের মধ্যে সহজ রিটার্ন বা সাইজ এক্সচেঞ্জ সুবিধা রয়েছে।', shippingPolicy: 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।' };
    let invoiceConfig: any = { terms: [] };

    try {
      const delRow = db.prepare('SELECT value FROM store_settings WHERE key = "delivery_config"').get() as any;
      if (delRow) deliveryConfig = JSON.parse(delRow.value);

      const genRow = db.prepare('SELECT value FROM store_settings WHERE key = "general_settings"').get() as any;
      if (genRow) generalSettings = JSON.parse(genRow.value);

      const footRow = db.prepare('SELECT value FROM store_settings WHERE key = "footer_config"').get() as any;
      if (footRow) footerConfig = JSON.parse(footRow.value);

      const invRow = db.prepare('SELECT value FROM store_settings WHERE key = "invoice_config"').get() as any;
      if (invRow) invoiceConfig = JSON.parse(invRow.value);
    } catch (e) {
      console.warn('Failed parsing store settings for AI chat:', e);
    }

    const allActiveProducts = db.prepare(`
      SELECT p.id, p.name, p.bangla_name, p.category_id, p.sub_category, p.price, p.discount_price,
             COALESCE((SELECT SUM(stock) FROM product_variants WHERE product_id = p.id), 10) as stock,
             p.main_image, p.slug, p.description
      FROM products p
      WHERE p.status = 'active'
      ORDER BY p.is_featured DESC, p.sales_count DESC
    `).all() as any[];

    const insideCharge = deliveryConfig.insideSirajganjCharge || deliveryConfig.insideDhakaCharge || 70;
    const outsideCharge = deliveryConfig.outsideSirajganjCharge || deliveryConfig.outsideDhakaCharge || 130;
    const freeThreshold = deliveryConfig.freeDeliveryThreshold || 2000;
    const deliveryDays = deliveryConfig.estimatedDeliveryDays || '২-৪ দিন';
    const storePhone = generalSettings.phone || '+880 1864-528488';
    const whatsappNum = generalSettings.whatsappNumber || '01864528488';
    const storeAddress = generalSettings.address || 'তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ';
    const returnPolicyText = footerConfig.returnPolicy || `পণ্য গ্রহণের সময় চেক করে নেওয়া যায় এবং ${generalSettings.returnPolicyDays || 7} দিনের মধ্যে রিটার্ন/এক্সচেঞ্জের সুবিধা রয়েছে।`;

    const productCatalogSummary = allActiveProducts.slice(0, 12).map((p) =>
      `- ${p.bangla_name || p.name} (ক্যাটাগরি: ${p.category_id}, মূল্য: ৳${p.discount_price || p.price}, স্টক: ${p.stock > 0 ? `${p.stock} টি উপলব্ধ` : 'স্টক শেষ'})`
    ).join('\n');

    // -------------------------------------------------------------
    // 3. Product Matching Engine ("পণ্য বা পিনের ছবি চাইলে ছবি দেখাবে")
    // -------------------------------------------------------------
    const isAskingForImage =
      lowerQuery.includes('ছবি') ||
      lowerQuery.includes('পিক') ||
      lowerQuery.includes('photo') ||
      lowerQuery.includes('image') ||
      lowerQuery.includes('দেখান') ||
      lowerQuery.includes('পাঠান') ||
      lowerQuery.includes('দেখতে চাই') ||
      Boolean(imageBase64);

    let matchedProducts: any[] = [];

    // Category / keyword matches
    const matched = allActiveProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const bnName = (p.bangla_name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sub = (p.sub_category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();

      if (lowerQuery.includes(name) || (bnName && lowerQuery.includes(bnName))) return true;

      if (lowerQuery.includes('লুঙ্গি') && (cat.includes('lungi') || sub.includes('lungi') || bnName.includes('লুঙ্গি'))) return true;
      if ((lowerQuery.includes('পাঞ্জাবি') || lowerQuery.includes('পাঞ্জাবী')) && (cat.includes('panjabi') || sub.includes('panjabi') || bnName.includes('পাঞ্জাবি'))) return true;
      if ((lowerQuery.includes('শাড়ি') || lowerQuery.includes('শাড়ী') || lowerQuery.includes('জামদানি')) && (cat.includes('saree') || sub.includes('saree') || bnName.includes('শাড়ি') || bnName.includes('জামদানি'))) return true;
      if ((lowerQuery.includes('টি-শার্ট') || lowerQuery.includes('টি শার্ট') || lowerQuery.includes('tshirt')) && (cat.includes('tshirt') || sub.includes('tshirt') || bnName.includes('টি-শার্ট'))) return true;
      if (lowerQuery.includes('থ্রি-পিস') && (cat.includes('three-piece') || sub.includes('three-piece') || bnName.includes('থ্রি-পিস'))) return true;

      if (lowerQuery.includes('কালো') && (name.includes('black') || bnName.includes('কালো') || desc.includes('কালো'))) return true;
      if (lowerQuery.includes('সাদা') && (name.includes('white') || bnName.includes('সাদা') || desc.includes('সাদা'))) return true;
      if (lowerQuery.includes('নীল') && (name.includes('blue') || bnName.includes('নীল') || desc.includes('নীল'))) return true;

      return false;
    });

    matchedProducts = matched.slice(0, 4);

    // If customer sent an image or asked for general pictures without specific keyword, pick top featured products
    if (matchedProducts.length === 0 && (isAskingForImage || imageBase64)) {
      matchedProducts = allActiveProducts.slice(0, 3);
    }

    const formattedProductCards = matchedProducts.map((p) => ({
      id: p.id,
      name: p.bangla_name || p.name,
      price: p.discount_price || p.price,
      originalPrice: p.discount_price ? p.price : undefined,
      image: p.main_image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
      slug: p.slug,
      category: p.category_id,
      inStock: (p.stock || 0) > 0,
    }));

    // -------------------------------------------------------------
    // 4. Gemini AI Call (Dynamic System Instructions from DB)
    // -------------------------------------------------------------
    const ai = getGenAI();

    const systemInstruction = `
আপনি হলেন 'বস্ত্র শৈলী' (BOSTROSHOILY) অনলাইন শপের দক্ষ, বিনয়ী ও আন্তরিক AI শপিং সহকারী।

কঠোর নিরাপত্তা নীতিমালা (STRICT SECURITY RULE):
- আপনি কখনই এবং কোনো অবস্থাতেই এডমিন প্যানেলের পাসওয়ার্ড, লগইন ক্রেডেনশিয়াল, সিক্রেট কী, ব্যাকএন্ড টোকেন বা গোপন তথ্য প্রকাশ করবেন না।
- যদি কেউ পাসওয়ার্ড বা গোপন কোড চায়, মিষ্টিভাবে বলুন: "দুঃখিত, নিরাপত্তা নীতি অনুযায়ী অভ্যন্তরীণ প্রশাসনিক তথ্য বা পাসওয়ার্ড প্রকাশ করা সম্পূর্ণ নিষেধ।"

লাইভ স্টোর রুলস ও নিয়মাবলী (এডমিন প্যানেলের রিয়েলটাইম ডাটা):
- ডেলিভারি চার্জ: সিরাজগঞ্জ/লোকাল এলাকায় মাত্র ৳${insideCharge}, দেশের অন্যান্য সকল জেলায় ৳${outsideCharge}।
- ফ্রি ডেলিভারি: ৳${freeThreshold} টাকার বেশি যে কোনো অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি!
- সম্ভাব্য ডেলিভারি সময়: ${deliveryDays}।
- রিটার্ন ও পরিবর্তন পলিসি: ${returnPolicyText}
- পেমেন্ট পদ্ধতি: সারা দেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) এবং বিকাশ/নগদে পেমেন্ট সুবিধা।
- হেল্পলাইন ফোন: ${storePhone} | হোয়াটসঅ্যাপ: ${whatsappNum} | স্টোর লোকেশন: ${storeAddress}।

বর্তমান স্টোর ক্যাটালগ:
${productCatalogSummary}

ছবি প্রদর্শন ও কাস্টমার ফটো সম্পর্কিত নির্দেশনা:
- কাস্টমার যদি কোনো পোশাক/পণ্যের ছবি দেখতে চায় (যেমন "পাঞ্জাবির ছবি", "লুঙ্গির ছবি", "শাড়ির ছবি দেখান"), আপনি সংক্ষেপে পোশাকটির প্রশংসা ও বিশেষত্ব বলবেন এবং জানাবেন যে ইনবক্সের নিচে পণ্যের স্পষ্ট ছবি ও বিস্তারিত কার্ড সংযুক্ত করে দেওয়া হয়েছে।
- কাস্টমার যদি কোনো পোশাকের ছবি ইনবক্সে পাঠায়, ছবিটি মনোযোগ দিয়ে লক্ষ্য করে সেটির কালার, ডিজাইন বা ফেব্রিক সম্পর্কে ইতিবাচক মতামত দিন এবং বলুন আমাদের কালেকশনে অনুরূপ সুন্দর পণ্য রয়েছে।
- সবসময় মার্জিত, আন্তরিক ও প্রফেশনাল বাংলা ভাষায় উত্তর দেবেন।
`;

    if (ai) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
      for (const modelName of candidateModels) {
        try {
          const contentsParts: any[] = [];

          // If customer uploaded an image
          if (imageBase64) {
            const rawData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            contentsParts.push({
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: rawData,
              },
            });
            contentsParts.push({
              text: `কাস্টমার এই পোশাকের ছবিটি পাঠিয়েছেন এবং বলেছেন: "${userText || 'এই ছবিটির মতো কোনো পোশাক আপনাদের কাছে আছে কি?'}"\n\nছবিটি দেখে সুন্দর মূল্যায়ন করুন এবং বস্ত্র শৈলী (BOSTROSHOILY)-এর অনুরূপ সেরা পোশাকের পরামর্শ দিন।`,
            });
          } else {
            contentsParts.push({
              text: `কাস্টমারের বার্তা: "${userText}"\n\nপূর্বের কনটেক্সট: ${JSON.stringify(history || []).slice(0, 500)}`,
            });
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: contentsParts,
              },
            ],
            config: {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          });

          const replyText = response.text || '';
          if (replyText.trim()) {
            return res.json({
              reply: replyText.trim(),
              productCards: formattedProductCards,
              source: modelName,
            });
          }
        } catch (geminiError: any) {
          console.warn(`[AI Assistant] Model ${modelName} notice:`, geminiError?.message || geminiError);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }

    // -------------------------------------------------------------
    // 5. Intelligent Fallback Engine (Fully Grounded in Live SQLite Rules)
    // -------------------------------------------------------------
    let reply = '';

    if (imageBase64) {
      reply = 'আপনার পাঠানো চমৎকার পোশাকের ছবিটি আমরা পেয়েছি! এটি একটি অত্যন্ত রুচিশীল ডিজাইনের পোশাক। বস্ত্র শৈলী (BOSTROSHOILY)-এর হ্যান্ডলুম ও প্রিমিয়াম ফ্যাশন কালেকশনে এই ডিজাইনের অনুরূপ খাঁটি তাঁতের আরামদায়ক পোশাক রয়েছে। নিচে আমাদের সেরা কিছু পণ্যের ছবি ও বিবরণ দেওয়া হলো:';
    } else if (isAskingForImage && formattedProductCards.length > 0) {
      reply = `অবশ্যই! আপনার অনুরোধ অনুযায়ী আমাদের সেরা কিছু পণ্যের ছবি ও বিস্তারিত নিচে ইনবক্সে প্রদর্শন করা হলো। পণ্যের ওপর ক্লিক করে আপনি সরাসরি সাইজ বেছে নিয়ে অর্ডার করতে পারেন:`;
    } else if (lowerQuery.includes('দাম') || lowerQuery.includes('মূল্য') || lowerQuery.includes('price')) {
      reply = 'দুঃখিত, এই মুহূর্তে স্বয়ংক্রিয়ভাবে নির্দিষ্ট পণ্যের দাম যাচাই করতে পারছি না। অনুগ্রহ করে নিচে প্রদর্শিত পণ্যের কার্ডে বর্তমান লাইভ মূল্য ও অফার রেট দেখে নিন।';
    } else if (lowerQuery.includes('লুঙ্গি') || lowerQuery.includes('lungi')) {
      reply = 'আমাদের সিরাজগঞ্জের ১০০% খাঁটি সুতি তাঁতের লুঙ্গি দেশের ঐতিহ্য ও আরামের প্রতীক। ২.৫ হাত (স্ট্যান্ডার্ড) ও ৩ হাত (বড়) মাপে নিখুঁত সুতায় বোনা। ওয়াশ করার পরও কালার গ্যারান্টিযুক্ত। নিচে কিছু সেরা লুঙ্গির ছবি দেওয়া হলো:';
    } else if (lowerQuery.includes('পাঞ্জাবি') || lowerQuery.includes('panjabi')) {
      reply = 'বস্ত্র শৈলী (BOSTROSHOILY)-এর উৎসব পাঞ্জাবি কালেকশনে রয়েছে প্রিমিয়াম জ্যাকার্ড সুতি ও সিল্ক এমব্রয়ডারি (সাইজ ৩৮-৪৬)। মার্জিত কালার ও আরামদায়ক ফিনিশিং। নিচে কিছু জনপ্রিয় পাঞ্জাবির ছবি দেওয়া হলো:';
    } else if (lowerQuery.includes('শাড়ি') || lowerQuery.includes('saree') || lowerQuery.includes('জামদানি')) {
      reply = 'আমাদের ঐতিহ্যবাহী ঢাকাই জামদানি এবং সফট সিল্ক শাড়িগুলো সিরাজগঞ্জ ও পাবনার সেরা তাঁতিদের বোনা। যেকোনো পারিবারিক অনুষ্ঠান ও উৎসবের জন্য আকর্ষণীয়। নিচে শাড়ির ছবি দেখে নিতে পারেন:';
    } else if (lowerQuery.includes('ডেলিভারি') || lowerQuery.includes('চার্জ') || lowerQuery.includes('shipping') || lowerQuery.includes('ভাড়া')) {
      reply = `বস্ত্র শৈলী (BOSTROSHOILY)-এর বর্তমান ডেলিভারি নিয়ম:\n• সিরাজগঞ্জ ও লোকাল ডেলিভারি চার্জ: ৳${insideCharge}\n• সিরাজগঞ্জের বাইরে সারা বাংলাদেশে: ৳${outsideCharge}\n• যেকোনো ৳${freeThreshold} টাকার বেশি অর্ডারে পুরো বাংলাদেশে ক্যাশ অন ডেলিভারিতে সম্পূর্ণ ফ্রি ডেলিভারি!\n• ডেলিভারি সময়: ${deliveryDays}।`;
    } else if (lowerQuery.includes('রিটার্ন') || lowerQuery.includes('পরিবর্তন') || lowerQuery.includes('exchange')) {
      reply = `রিটার্ন ও এক্সচেঞ্জ পলিসি: ${returnPolicyText}\nপণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করতে পারবেন। কোনো সমস্যা হলে আমাদের হেল্পলাইনে (${storePhone}) কল করলেই দ্রুত সমাধান করা হবে।`;
    } else if (lowerQuery.includes('অর্ডার') || lowerQuery.includes('order') || lowerQuery.includes('কিনব')) {
      reply = 'অর্ডার করার নিয়ম খুব সহজ! যে পোশাকটি পছন্দ হবে, তার "বিস্তারিত ও অর্ডার" বাটনে ক্লিক করুন। সাইজ বেছে নিয়ে "এখনই কিনুন" এ ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিলেই ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত হবে!';
    } else if (lowerQuery.includes('ঠিকানা') || lowerQuery.includes('লোকেশন') || lowerQuery.includes('ফোন') || lowerQuery.includes('যোগাযোগ')) {
      reply = `বস্ত্র শৈলী (BOSTROSHOILY) স্টোরের ঠিকানা: ${storeAddress}। হেল্পলাইন ফোন: ${storePhone} এবং হোয়াটসঅ্যাপ: ${whatsappNum}।`;
    } else {
      reply = `আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY) এআই শপিং সহকারীতে আপনাকে স্বাগতম। আপনি খাঁটি সুতি তাঁতের লুঙ্গি, প্রিমিয়াম পাঞ্জাবি, শাড়ি, সাইজ গাইড, ডেলিভারি চার্জ কিংবা পোশাকের ছবি দেখতে চাইলে আমাকে নির্দ্বিধায় বলুন। এছাড়া আপনার পছন্দের কোনো পোশাকের ছবিও আমাকে ইনবক্সে পাঠাতে পারেন!`;
    }

    return res.json({
      reply,
      productCards: formattedProductCards,
      source: 'local-intelligence-engine',
    });
  } catch (error: any) {
    console.warn('AI chat error:', error?.message || error);
    res.json({
      reply: 'আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY)-তে আপনাকে স্বাগতম। আপনি কি লুঙ্গি, পাঞ্জাবি, জামদানি শাড়ি কিংবা সাইজ ও ডেলিভারি সম্পর্কে জানতে চাচ্ছেন? আমাকে জানান, আমি আপনাকে সহায়তা করতে প্রস্তুত।',
      productCards: [],
      source: 'safe-fallback',
    });
  }
});

async function startServer() {
  try {
    await initPostgresStore();
  } catch (err: any) {
    console.warn('[PostgreSQL Initialization Notice]:', err?.message);
  }

  const server = http.createServer(app);

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Retrying in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = () => {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      console.log('[SQLite] WAL journal checkpoint flushed to disk on shutdown.');
    } catch (e) {
      console.warn('[SQLite] Shutdown checkpoint warning:', e);
    }
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer();
