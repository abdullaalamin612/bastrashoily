import { db } from './db.js';

export interface ProductSummary {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  category: string;
  subCategory?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  mainImage: string;
  description?: string;
  variants?: Array<{
    id: string;
    sku: string;
    colorName?: string;
    colorBangla?: string;
    sizeName?: string;
    sizeBangla?: string;
    sizeCode?: string;
    price: number;
    offerPrice?: number;
    stock: number;
  }>;
}

/**
 * 1. searchProducts
 * Safe, read-only search across active products in SQLite.
 */
export function searchProducts(params: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  inStockOnly?: boolean;
}): ProductSummary[] {
  try {
    let sql = `
      SELECT p.id, p.name, p.bangla_name, p.slug, p.category_id, p.sub_category,
             p.price, p.discount_price, p.main_image, p.description
      FROM products p
      WHERE p.status = 'active'
    `;
    const sqlParams: any[] = [];

    if (params.category && params.category !== 'all') {
      sql += ` AND (LOWER(p.category_id) LIKE ? OR LOWER(p.sub_category) LIKE ?)`;
      const catLike = `%${params.category.toLowerCase().trim()}%`;
      sqlParams.push(catLike, catLike);
    }

    if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
      sql += ` AND COALESCE(p.discount_price, p.price) >= ?`;
      sqlParams.push(params.minPrice);
    }

    if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
      sql += ` AND COALESCE(p.discount_price, p.price) <= ?`;
      sqlParams.push(params.maxPrice);
    }

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      const stopWords = new Set([
        'কি',
        'কী',
        'কেমন',
        'আছে',
        'দেখা',
        'দেখি',
        'চাই',
        'একটু',
        'বলুন',
        'দেন',
        'দাও',
        'কালেকশন',
        'আমাকে',
        'আপনাদের',
        'পণ্য',
        'প্রোডাক্ট',
        'পোশাক',
        'দেখতে',
      ]);
      const tokens = q
        .split(/\s+/)
        .map((t) => t.replace(/[?.,!]/g, '').trim())
        .filter((t) => t.length > 1 && !stopWords.has(t));

      if (tokens.length > 0) {
        const tokenClauses: string[] = [];
        for (const token of tokens) {
          const tLike = `%${token}%`;
          tokenClauses.push(`(
            LOWER(p.name) LIKE ? OR
            LOWER(p.bangla_name) LIKE ? OR
            LOWER(COALESCE(p.description, '')) LIKE ? OR
            LOWER(p.slug) LIKE ? OR
            LOWER(p.category_id) LIKE ? OR
            LOWER(p.sub_category) LIKE ?
          )`);
          sqlParams.push(tLike, tLike, tLike, tLike, tLike, tLike);
        }
        sql += ` AND (${tokenClauses.join(' OR ')})`;
      } else {
        const qLike = `%${q}%`;
        sql += ` AND (
          LOWER(p.name) LIKE ? OR
          LOWER(p.bangla_name) LIKE ? OR
          LOWER(COALESCE(p.description, '')) LIKE ? OR
          LOWER(p.slug) LIKE ?
        )`;
        sqlParams.push(qLike, qLike, qLike, qLike);
      }
    }

    sql += ` ORDER BY p.is_featured DESC, p.sales_count DESC LIMIT 10`;

    const products = db.prepare(sql).all(...sqlParams) as any[];

    // Fetch variant details for matching products
    const getVariants = db.prepare(`
      SELECT v.id, v.sku, v.price, v.offer_price, v.stock,
             col.name as color_name, col.bangla_name as color_bangla,
             sz.name as size_name, sz.bangla_name as size_bangla, sz.code as size_code
      FROM product_variants v
      LEFT JOIN colors col ON v.color_id = col.id
      LEFT JOIN sizes sz ON v.size_id = sz.id
      WHERE v.product_id = ? AND v.active = 1
    `);

    const results: ProductSummary[] = [];

    for (const prod of products) {
      const variants = getVariants.all(prod.id) as any[];
      const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

      // In-stock filter
      if (params.inStockOnly && totalStock <= 0) {
        continue;
      }

      // Color filter if specified
      if (params.color) {
        const cLower = params.color.toLowerCase();
        const hasColor = variants.some(
          (v) => (v.color_name && v.color_name.toLowerCase().includes(cLower)) ||
                 (v.color_bangla && v.color_bangla.includes(cLower))
        );
        if (!hasColor) continue;
      }

      // Size filter if specified
      if (params.size) {
        const sLower = params.size.toLowerCase();
        const hasSize = variants.some(
          (v) => (v.size_name && v.size_name.toLowerCase().includes(sLower)) ||
                 (v.size_code && v.size_code.toLowerCase() === sLower) ||
                 (v.size_bangla && v.size_bangla.includes(sLower))
        );
        if (!hasSize) continue;
      }

      results.push({
        id: prod.id,
        name: prod.name,
        banglaName: prod.bangla_name || prod.name,
        slug: prod.slug,
        category: prod.category_id,
        subCategory: prod.sub_category,
        price: Number(prod.price),
        discountPrice: prod.discount_price ? Number(prod.discount_price) : undefined,
        stock: totalStock,
        mainImage: prod.main_image || '',
        description: prod.description || '',
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.color_name,
          colorBangla: v.color_bangla,
          sizeName: v.size_name,
          sizeBangla: v.size_bangla,
          sizeCode: v.size_code,
          price: Number(v.price),
          offerPrice: v.offer_price ? Number(v.offer_price) : undefined,
          stock: Number(v.stock || 0),
        })),
      });
    }

    return results;
  } catch (err) {
    console.error('searchProducts tool error:', err);
    return [];
  }
}

/**
 * 2. getProductDetails
 */
export function getProductDetails(productIdOrSlug: string): ProductSummary | null {
  try {
    const prod = db.prepare(`
      SELECT p.*, c.name as category_name, c.bangla_name as category_bangla
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.id = ? OR p.slug = ?) AND p.status = 'active'
    `).get(productIdOrSlug, productIdOrSlug) as any;

    if (!prod) return null;

    const variants = db.prepare(`
      SELECT v.id, v.sku, v.price, v.offer_price, v.stock,
             col.name as color_name, col.bangla_name as color_bangla,
             sz.name as size_name, sz.bangla_name as size_bangla, sz.code as size_code
      FROM product_variants v
      LEFT JOIN colors col ON v.color_id = col.id
      LEFT JOIN sizes sz ON v.size_id = sz.id
      WHERE v.product_id = ? AND v.active = 1
    `).all(prod.id) as any[];

    const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

    return {
      id: prod.id,
      name: prod.name,
      banglaName: prod.bangla_name || prod.name,
      slug: prod.slug,
      category: prod.category_id,
      subCategory: prod.sub_category,
      price: Number(prod.price),
      discountPrice: prod.discount_price ? Number(prod.discount_price) : undefined,
      stock: totalStock,
      mainImage: prod.main_image || '',
      description: prod.description || '',
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        colorName: v.color_name,
        colorBangla: v.color_bangla,
        sizeName: v.size_name,
        sizeBangla: v.size_bangla,
        sizeCode: v.size_code,
        price: Number(v.price),
        offerPrice: v.offer_price ? Number(v.offer_price) : undefined,
        stock: Number(v.stock || 0),
      })),
    };
  } catch (err) {
    console.error('getProductDetails tool error:', err);
    return null;
  }
}

/**
 * 3. checkProductStock
 */
export function checkProductStock(params: {
  productId: string;
  size?: string;
  color?: string;
}): {
  found: boolean;
  productName?: string;
  totalStock?: number;
  variantFound?: boolean;
  variantStock?: number;
  availableSizes?: string[];
  availableColors?: string[];
  message: string;
} {
  try {
    const prod = getProductDetails(params.productId);
    if (!prod) {
      return { found: false, message: 'পণ্যটি খুঁজে পাওয়া যায়নি।' };
    }

    const availableSizes = Array.from(new Set(prod.variants?.map((v) => v.sizeCode || v.sizeName || '').filter(Boolean)));
    const availableColors = Array.from(new Set(prod.variants?.map((v) => v.colorBangla || v.colorName || '').filter(Boolean)));

    if (!params.size && !params.color) {
      return {
        found: true,
        productName: prod.banglaName || prod.name,
        totalStock: prod.stock,
        availableSizes,
        availableColors,
        message: prod.stock > 0
          ? `${prod.banglaName || prod.name}-এর মোট ${prod.stock}টি পণ্য স্টকে রয়েছে। সাইজ: ${availableSizes.join(', ')} | রঙ: ${availableColors.join(', ')}`
          : `${prod.banglaName || prod.name} বর্তমানে স্টক আউট।`,
      };
    }

    // Match specific variant
    let matchedVariant = prod.variants?.find((v) => {
      let match = true;
      if (params.size) {
        const s = params.size.toLowerCase();
        match = match && Boolean(
          (v.sizeCode && v.sizeCode.toLowerCase() === s) ||
          (v.sizeName && v.sizeName.toLowerCase().includes(s)) ||
          (v.sizeBangla && v.sizeBangla.includes(params.size))
        );
      }
      if (params.color) {
        const c = params.color.toLowerCase();
        match = match && Boolean(
          (v.colorName && v.colorName.toLowerCase().includes(c)) ||
          (v.colorBangla && v.colorBangla.includes(params.color))
        );
      }
      return match;
    });

    if (matchedVariant) {
      return {
        found: true,
        productName: prod.banglaName || prod.name,
        totalStock: prod.stock,
        variantFound: true,
        variantStock: matchedVariant.stock,
        availableSizes,
        availableColors,
        message: matchedVariant.stock > 0
          ? `${prod.banglaName || prod.name}-এর ${matchedVariant.sizeName || matchedVariant.sizeCode || ''} ${matchedVariant.colorBangla || matchedVariant.colorName || ''} স্টকে ${matchedVariant.stock}টি উপলব্ধ রয়েছে!`
          : `${prod.banglaName || prod.name}-এর এই ভ্যারিয়েন্টটি বর্তমানে স্টকে নেই। তবে অন্যান্য সাইজ/কালার দেখতে পারেন।`,
      };
    }

    return {
      found: true,
      productName: prod.banglaName || prod.name,
      totalStock: prod.stock,
      variantFound: false,
      variantStock: 0,
      availableSizes,
      availableColors,
      message: `অনুরোধকৃত সাইজ/রঙটি পাওয়া যায়নি। উপলব্ধ সাইজ: ${availableSizes.join(', ') || 'ফ্রি সাইজ'} এবং রঙ: ${availableColors.join(', ')}।`,
    };
  } catch (err) {
    console.error('checkProductStock error:', err);
    return { found: false, message: 'স্টক যাচাই করতে সমস্যা হয়েছে।' };
  }
}

/**
 * 4. getSizeGuide
 */
export function getSizeGuide(categoryOrType?: string): string {
  const cat = (categoryOrType || '').toLowerCase();
  if (cat.includes('lungi') || cat.includes('লুঙ্গি')) {
    return 'সিরাজগঞ্জ তাঁতের লুঙ্গির সাইজ গাইড:\n• ২.৫ হাত (স্ট্যান্ডার্ড): দৈর্ঘ্য প্রায় ৪৫ ইঞ্চি, প্রস্থ প্রায় ৮৮ ইঞ্চি। সাধারণ উচ্চতার জন্য আদর্শ।\n• ৩ হাত (লম্বা): দৈর্ঘ্য প্রায় ৪৮ ইঞ্চি, প্রস্থ প্রায় ৯৬ ইঞ্চি। বেশি লম্বা বা ঢিলেঢালা পরতে আগ্রহীদের জন্য।\n• উভয় মাপেই ১০০% খাঁটি সুতি তাঁতের সুতা ব্যবহার করা হয়।';
  }
  if (cat.includes('panjabi') || cat.includes('পাঞ্জাবি')) {
    return 'পাঞ্জাবি সাইজ চার্ট (বুকের মাপ):\n• S (৩৮): বুক ৩৯-৪০ ইঞ্চি, ঝুল ৪০ ইঞ্চি\n• M (৪০): বুক ৪১-৪২ ইঞ্চি, ঝুল ৪২ ইঞ্চি\n• L (৪২): বুক ৪৩-৪৪ ইঞ্চি, ঝুল ৪৪ ইঞ্চি\n• XL (৪৪): বুক ৪৫-৪৬ ইঞ্চি, ঝুল ৪৪ ইঞ্চি\n• XXL (৪৬): বুক ৪৭-৪৮ ইঞ্চি, ঝুল ৪৫ ইঞ্চি';
  }
  if (cat.includes('saree') || cat.includes('শাড়ি') || cat.includes('জামদানি')) {
    return 'শাড়ির সাইজ গাইড:\n• আমাদের সমস্ত জামদানি ও সিল্ক শাড়ি স্ট্যান্ডার্ড ১২ হাত (প্রায় ১৮ ফুট) লম্বা এবং ব্লাউজ পিস সহ/ছাড়া সুনির্দিষ্ট বিবরণে উল্লেখ রয়েছে। এটি ফ্রি সাইজ।';
  }
  return 'আমাদের সাইজ গাইড:\n• লুঙ্গি: ২.৫ হাত (স্ট্যান্ডার্ড) ও ৩ হাত (লম্বা)\n• পাঞ্জাবি: ৩৮, ৪০, ৪২, ৪৪, ৪৬ (S থেকে XXL)\n• শাড়ি: স্ট্যান্ডার্ড ১২ হাত ফ্রি সাইজ।';
}

/**
 * 5. getShippingCharge
 */
export function getShippingCharge(district?: string, orderSubtotal?: number): {
  insideRate: number;
  outsideRate: number;
  freeThreshold: number;
  deliveryDays: string;
  appliedCharge: number;
  isFree: boolean;
  message: string;
} {
  let config = {
    insideSirajganjCharge: 70,
    outsideSirajganjCharge: 130,
    freeDeliveryThreshold: 2000,
    estimatedDeliveryDays: '২-৪ দিন',
  };

  try {
    const row = db.prepare('SELECT value FROM store_settings WHERE key = "delivery_config"').get() as any;
    if (row && row.value) {
      config = { ...config, ...JSON.parse(row.value) };
    }
  } catch {}

  const insideRate = Number(config.insideSirajganjCharge || 70);
  const outsideRate = Number(config.outsideSirajganjCharge || 130);
  const freeThreshold = Number(config.freeDeliveryThreshold || 2000);
  const deliveryDays = config.estimatedDeliveryDays || '২-৪ দিন';

  const sub = Number(orderSubtotal || 0);
  const isFree = sub >= freeThreshold;

  let isLocal = false;
  if (district) {
    const dLower = district.toLowerCase().trim();
    isLocal = dLower.includes('sirajganj') || dLower.includes('সিরাজগঞ্জ');
  }

  const baseRate = isLocal ? insideRate : outsideRate;
  const appliedCharge = isFree ? 0 : baseRate;

  let message = `ডেলিভারি চার্জের নিয়মাবলী:\n• সিরাজগঞ্জ জেলায় লোকাল চার্জ: ৳${insideRate} (২৪ ঘণ্টার মধ্যে)\n• সারা দেশের অন্যান্য সকল জেলায়: ৳${outsideRate} (${deliveryDays})\n• যেকোনো ৳${freeThreshold} বা তার বেশি টাকার অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি!`;

  if (district) {
    message += `\n\n${district}-এর জন্য প্রযোজ্য চার্জ: ${isFree ? 'সম্পূর্ণ ফ্রি' : `৳${appliedCharge}`}।`;
  }

  return {
    insideRate,
    outsideRate,
    freeThreshold,
    deliveryDays,
    appliedCharge,
    isFree,
    message,
  };
}

/**
 * 6. getStorePolicies
 */
export function getStorePolicies(): {
  returnPolicy: string;
  paymentPolicy: string;
  storeAddress: string;
  helplinePhone: string;
  whatsappNumber: string;
} {
  let general = { phone: '+880 1864-528488', address: 'তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ', returnPolicyDays: 7, whatsappNumber: '01864528488' };
  let footer = { returnPolicy: '৭ দিনের মধ্যে সহজ রিটার্ন বা সাইজ এক্সচেঞ্জ সুবিধা রয়েছে।' };

  try {
    const genRow = db.prepare('SELECT value FROM store_settings WHERE key = "general_settings"').get() as any;
    if (genRow) general = { ...general, ...JSON.parse(genRow.value) };
    const footRow = db.prepare('SELECT value FROM store_settings WHERE key = "footer_config"').get() as any;
    if (footRow) footer = { ...footer, ...JSON.parse(footRow.value) };
  } catch {}

  return {
    returnPolicy: footer.returnPolicy || `${general.returnPolicyDays || 7} দিনের মধ্যে ডেলিভারিম্যানের সামনে চেক করে রিটার্ন বা সাইজ এক্সচেঞ্জ করার সুবিধা রয়েছে।`,
    paymentPolicy: 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) ছাড়াও বিকাশ ও নগদ মাধ্যমে নিরাপদ অনলাইন পেমেন্ট সুবিধা।',
    storeAddress: general.address || 'তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ',
    helplinePhone: general.phone || '+880 1864-528488',
    whatsappNumber: general.whatsappNumber || '01864528488',
  };
}

/**
 * 7. getCustomerOrderStatus
 * Privacy-preserving: Requires matching order ID AND verified customer phone!
 * Never leaks address or private information.
 */
export function getCustomerOrderStatus(params: {
  orderId: string;
  customerPhone?: string;
  authenticatedCustomerPhone?: string;
}): {
  found: boolean;
  message: string;
  orderSummary?: any;
} {
  const cleanOrderId = (params.orderId || '').trim();
  const phoneToVerify = (params.authenticatedCustomerPhone || params.customerPhone || '').replace(/[\s-]/g, '');

  if (!cleanOrderId) {
    return {
      found: false,
      message: 'অনুগ্রহ করে আপনার সঠিক অর্ডার আইডি প্রদান করুন (যেমন: BS-202610-XXXXXX)।',
    };
  }

  try {
    const order = db.prepare(`
      SELECT id, customer_name, customer_phone, district, subtotal, delivery_charge,
             total, payment_method, payment_status, order_status, courier_status,
             courier_tracking_code, created_at
      FROM orders
      WHERE id = ?
    `).get(cleanOrderId) as any;

    if (!order) {
      return {
        found: false,
        message: `দুঃখিত, #${cleanOrderId} নম্বরের কোনো অর্ডার ডাটাবেজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার আইডি যাচাই করুন।`,
      };
    }

    // PRIVACY ENFORCEMENT: Customer must provide the matching 11-digit phone number
    const orderPhone = (order.customer_phone || '').replace(/[\s-]/g, '');
    const isPhoneMatched = phoneToVerify && orderPhone && (
      phoneToVerify === orderPhone ||
      phoneToVerify.endsWith(orderPhone.slice(-8)) ||
      orderPhone.endsWith(phoneToVerify.slice(-8))
    );

    if (!isPhoneMatched) {
      return {
        found: false,
        message: `গোপনীয়তা ও নিরাপত্তার স্বার্থে অর্ডারের তথ্য দেখতে অনুগ্রহ করে অর্ডার আইডির সাথে অর্ডারে ব্যবহৃত আপনার মোবাইল নম্বরটি প্রদান করুন (যেমন: "অর্ডার #${cleanOrderId}, ফোন: 017xxxxxxxx")।`,
      };
    }

    const items = db.prepare(`
      SELECT product_name, bangla_name, quantity, color_name, size_name, unit_price
      FROM order_items
      WHERE order_id = ?
    `).all(cleanOrderId) as any[];

    const statusTranslations: Record<string, string> = {
      pending: 'অপেক্ষমাণ (Pending)',
      processing: 'প্রক্রিয়াধীন (Processing)',
      shipped: 'কুরিয়ারে হস্তান্তর করা হয়েছে (Shipped)',
      delivered: 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered)',
      cancelled: 'বাতিল (Cancelled)',
      returned: 'রিটার্ন করা হয়েছে (Returned)',
    };

    const paymentTranslations: Record<string, string> = {
      pending: 'বকেয়া / ক্যাশ অন ডেলিভারি (COD)',
      paid: 'পরিশোধিত (Paid)',
      failed: 'ব্যর্থ (Failed)',
      refunded: 'রিফান্ড সম্পন্ন (Refunded)',
    };

    const orderSummary = {
      orderId: order.id,
      orderStatus: statusTranslations[order.order_status] || order.order_status,
      paymentStatus: paymentTranslations[order.payment_status] || order.payment_status,
      totalAmount: order.total,
      deliveryCharge: order.delivery_charge,
      orderDate: order.created_at,
      itemCount: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
      items: items.map((it) => `${it.bangla_name || it.product_name} (${it.size_name || ''} ${it.color_name || ''}) x${it.quantity}`),
      trackingCode: order.courier_tracking_code || undefined,
    };

    const replyMsg = `আপনার অর্ডার #${order.id}-এর বর্তমান অবস্থা:\n` +
      `• অর্ডারের স্ট্যাটাস: ${orderSummary.orderStatus}\n` +
      `• পেমেন্ট স্ট্যাটাস: ${orderSummary.paymentStatus}\n` +
      `• মোট মূল্য: ৳${order.total} (ডেলিভারি চার্জ: ৳${order.delivery_charge})\n` +
      `• অর্ডারকৃত পণ্য (${items.length}টি): ${orderSummary.items.join(', ')}\n` +
      (order.courier_tracking_code ? `• কুরিয়ার ট্র্যাকিং কোড: ${order.courier_tracking_code}\n` : '') +
      `• অর্ডার করার তারিখ: ${order.created_at}`;

    return {
      found: true,
      message: replyMsg,
      orderSummary,
    };
  } catch (err) {
    console.error('getCustomerOrderStatus error:', err);
    return {
      found: false,
      message: 'অর্ডারের তথ্য খুঁজতে গিয়ে সার্ভারে ত্রুটি দেখা দিয়েছে।',
    };
  }
}
