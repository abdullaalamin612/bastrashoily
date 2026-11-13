import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { adminFetch } from '../admin/adminApi';
import {
  Product,
  ProductVariant,
  Category,
  NavMenu,
  HeroBanner,
  CategoryBanner,
  CollectionGridItem,
  OfferSectionConfig,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Customer,
  Coupon,
  DeliveryConfig,
  PaymentConfig,
  BlogPost,
  CMSStep,
  ClothingVideoItem,
  FooterConfig,
  SEOConfig,
  AdminUser,
  AdminRole,
  AuditLog,
  InventoryTransaction,
  GeneralSettings,
  ProductPageSettings,
  AdminStaff,
  Language,
  ProductReview,
  ReturnReasonCode,
  ReturnCondition,
  ReturnWorkflowStatus,
  ReturnItem,
  OrderReturn,
  OrderStatusHistory,
  PaymentMethod,
  BrandPartnerStory,
  CustomDeliveryZone,
  CustomPaymentMethod,
  CategoryOfferItem,
  InvoiceConfig,
  InvoiceTermItem,
  ColorItem,
  SizeItem,
  CategorySizeChartConfig,
  ComboOffer,
  StoreDesignSettings,
  CheckoutUpsell,
} from '../types';

export const DEFAULT_STORE_DESIGN: StoreDesignSettings = {
  primaryColor: '#92400E',
  accentColor: '#B45309',
  siteBgColor: '#FFF8ED', // Warm cream default
  cardBgColor: '#FFFFFF',
  contentBgColor: '#FFFFFF',
  sectionBgColor: '#FAF6F0',
  headerBgColor: '#FFFFFF',
  footerBgColor: '#240B07',
  textPrimaryColor: '#2B0D08',
  textSecondaryColor: '#5A3825',
  linkColor: '#8C2D19',
  buttonBgColor: '#8C2D19',
  buttonTextColor: '#FFFFFF',
  bannerHeight: 'compact',
  heroBannerHeightDesktop: 280,
  heroBannerHeightMobile: 180,
  heroBannerWidthDesktop: 1440,
  heroBannerWidthMobile: 100,
  heroBannerBorderRadius: 0,
  heroBannerImageFit: 'cover',
  heroBannerImagePosition: 'center',
  categoryBannerHeightDesktop: 240,
  categoryBannerHeightMobile: 160,
  announcementBarText: '✨ সিরাজগঞ্জের আসল তাঁতের লুঙ্গি ও প্রিমিয়াম পাঞ্জাবিতে বিশেষ ছাড়! ক্যাশ অন ডেলিভারি সুবিধা।',
  showAnnouncementBar: true,
  fontFamily: 'Hind Siliguri',
  showFloatingChat: true,
};

export const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  insideSirajganjCharge: 70,
  outsideSirajganjCharge: 130,
  insideDhakaCharge: 70,
  outsideDhakaCharge: 130,
  freeDeliveryThreshold: 2000,
  estimatedInsideDhakaDays: '১-২ কর্মদিবস',
  estimatedOutsideDhakaDays: '৩-৫ কর্মদিবস',
  estimatedDeliveryDays: '২-৪ কর্মদিবস',
};

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  enableCod: true,
  enableBkash: true,
  bkashNumber: '01864528488',
  bkashType: 'merchant',
  enableNagad: true,
  nagadNumber: '01864528488',
  enableRocket: false,
  rocketNumber: '01712345678',
  enableSslCommerz: true,
  instructions: {
    bkash: 'বিকাশ অ্যাপ থেকে মার্চেন্ট পেমেন্ট অথবা সেন্ড মানি করুন।',
    nagad: 'নগদ অ্যাপ অথবা ইউএসএসডি কোড দিয়ে পেমেন্ট করুন।',
    rocket: 'রকেট নম্বরে সেন্ড মানি করুন।',
    cod: 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।',
  },
};

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
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
};

export const DEFAULT_OFFER_CONFIG: OfferSectionConfig = {
  isActive: false,
  title: 'সীমিত সময়ের বিশেষ উৎসব অফার',
  banglaTitle: 'উৎসব অফার',
  subtitle: 'সিরাজগঞ্জের খাঁটি তাঁতের পোশাকে আকর্ষণীয় অফার',
  discountPercentage: 0,
  bannerImage: '/bastra-shoily-logo.svg',
  endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  featuredProductIds: [],
};

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'hero-lungi',
    title: 'LUNGI COLLECTION',
    banglaTitle: 'সিরাজগঞ্জ তাঁতের লুঙ্গি',
    subtitle: '১০০% সুতি, আরামদায়ক ও নিখুঁত বুননের প্রিমিয়াম তাঁতের লুঙ্গি কালেকশন',
    buttonText: 'লুঙ্গি দেখুন',
    buttonUrl: '/category/lungi',
    desktopImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=800',
    order: 1,
    isActive: true,
    tag: 'Lungi',
  },
  {
    id: 'hero-saree',
    title: 'SAREE COLLECTION',
    banglaTitle: 'ঢাকাই জামদানি ও সিল্ক শাড়ি',
    subtitle: 'বাংলার ঐতিহ্যবাহী তাঁত, জামদানি ও সিল্ক শাড়ির অনন্য আভিজাত্য',
    buttonText: 'শাড়ি দেখুন',
    buttonUrl: '/category/saree',
    desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    order: 2,
    isActive: true,
    tag: 'Saree',
  },
  {
    id: 'hero-tshirt',
    title: 'T-SHIRT COLLECTION',
    banglaTitle: 'প্রিমিয়াম কম্বড কটন টি-শার্ট',
    subtitle: 'রং ও ফেব্রিক গ্যারান্টি সহ আধুনিক ক্যাজুয়াল ও ট্রেন্ডি লুক',
    buttonText: 'টি-শার্ট দেখুন',
    buttonUrl: '/category/t-shirt',
    desktopImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    order: 3,
    isActive: true,
    tag: 'T-Shirt',
  },
  {
    id: 'hero-panjabi',
    title: 'PANJABI COLLECTION',
    banglaTitle: 'রয়েল কটন ও এম্ব্রয়ডারি পাঞ্জাবি',
    subtitle: 'উৎসব ও শুভানুষ্ঠানে আভিজাত্যপূর্ণ প্রিমিয়াম ডিজাইনার পাঞ্জাবি',
    buttonText: 'পাঞ্জাবি দেখুন',
    buttonUrl: '/category/panjabi',
    desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    order: 4,
    isActive: true,
    tag: 'Panjabi',
  },
  {
    id: 'hero-three-piece',
    title: 'THREE PIECE COLLECTION',
    banglaTitle: 'এক্সক্লুসিভ ডিজাইনার থ্রি-পিস',
    subtitle: 'আভিজাত্যপূর্ণ সুতি ও জর্জেটের দৃষ্টিনন্দন পার্টি ও ক্যাজুয়াল থ্রি-পিস',
    buttonText: 'থ্রি-পিস দেখুন',
    buttonUrl: '/category/three-piece',
    desktopImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1600',
    mobileImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
    order: 5,
    isActive: true,
    tag: 'Three-Piece',
  },
];

export const DEFAULT_COLLECTIONS: CollectionGridItem[] = [
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
];

export const DEFAULT_CATEGORY_BANNERS: CategoryBanner[] = [
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
];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  address: 'দ্বারিয়াপুর, শাহজাদপুর, সিরাজগঞ্জ - ৬৭৭০, বাংলাদেশ',
  phone: '+880 1864-528488',
  email: 'bostroshoily@gmail.com',
  whatsappUrl: 'https://wa.me/8801864528488',
  aboutUs: 'বস্ত্র শৈলী (BOSTROSHOILY) সিরাজগঞ্জ ও পাবনার তাঁত কারিগরদের নিপুণ হাতের ছোঁয়ায় বোনা খাঁটি সুতি তাঁতের লুঙ্গি, প্রিমিয়াম রয়্যাল পাঞ্জাবি ও ঐতিহ্যবাহী জামদানি শাড়ির সবচেয়ে নির্ভরযোগ্য অনলাইন ঠিকানা। শতভাগ আরামদায়ক কাপড়ে দেশীয় ঐতিহ্যের আভিজাত্য।',
  copyrightText: '© ২০২৬ বস্ত্র শৈলী (BOSTROSHOILY) - সর্বস্বত্ব সংরক্ষিত।',
  facebookUrl: 'https://facebook.com/bostroshoily',
  instagramUrl: 'https://instagram.com/bostroshoily',
  youtubeUrl: 'https://youtube.com/@bostroshoily',
  tiktokUrl: 'https://tiktok.com/@bostroshoily',
  bgColor: '#240B07',
  textColor: '#E8D5C4',
  headingColor: '#FFF7ED',
  linkColor: '#E8D5C4',
  linkHoverColor: '#D4AF37',
  borderColor: '#3E140D',
  paddingY: 48,
  newsletterTitle: 'বস্ত্র শৈলী (BOSTROSHOILY) প্রিমিয়াম ক্লাবে যুক্ত হোন',
  newsletterSubtitle: 'নতুন কালেকশন ও এক্সক্লুসিভ অফারের খবর সবার আগে পেতে ইমেইল সাবস্ক্রাইব করুন।',
  newsletterButtonText: 'সাবস্ক্রাইব',
  headings: {
    about: 'বস্ত্র শৈলী পরিচিতি',
    links: 'দ্রুত লিংকসমূহ (Quick Links)',
    policies: 'সার্ভিস ও পলিসি (Policies)',
    contacts: 'যোগাযোগ করুন (Contact Us)',
  },
  privacyPolicy: 'বস্ত্র শৈলী (BOSTROSHOILY) গ্রাহকদের তথ্যের গোপনীয়তা কঠোরভাবে রক্ষা করে।',
  termsAndConditions: 'সকল তথ্যাদি ও পণ্যের গুণমান খাঁটি ও অথেন্টিক রাখার নিশ্চয়তা দেওয়া হয়।',
  returnPolicy: 'ডেলিভারির সময় চেক করুন। সাইজ বা ফিটিং সমস্যা হলে ৭ দিনের ভেতর সহজ এক্সচেঞ্জ সুবিধা পাবেন।',
  shippingPolicy: 'সিরাজগঞ্জে ২৪ ঘণ্টার মধ্যে এবং দেশের যেকোনো প্রান্তে ২-৩ দিনে নিরাপদ ডেলিভারি।',
  quickLinks: [
    { id: 'ql-1', title: 'হোম পেজ (Home)', url: 'home', isActive: true },
    { id: 'ql-2', title: 'অর্ডার ট্র্যাক করুন (Track Order)', url: 'tracking', isActive: true },
    { id: 'ql-3', title: 'কিভাবে অর্ডার করবেন? (How to Order)', url: 'guide', isActive: true },
    { id: 'ql-4', title: 'কাপড়ের যত্ন ও সাইজ গাইড (Care & Size)', url: 'clothing-guide', isActive: true },
  ],
  policies: [
    { id: 'pol-1', title: 'রিটার্ন ও এক্সচেঞ্জ পলিসি (Returns)', content: '৭ দিনের মধ্যে সহজ রিটার্ন ও পরিবর্তন সুবিধা।', isActive: true },
    { id: 'pol-2', title: 'শর্তাবলী (Terms & Conditions)', content: 'ওয়েবসাইট ও ক্রয়ের যাবতীয় নিয়মাবলী।', isActive: true },
    { id: 'pol-3', title: 'গোপনীয়তা নীতি (Privacy Policy)', content: 'গ্রাহক তথ্যের নিরাপত্তা বিধান।', isActive: true },
    { id: 'pol-4', title: 'ডেলিভারি তথ্য (Delivery Info)', content: 'সারাদেশে হোম ডেলিভারির সময় ও চার্জ।', isActive: true },
  ],
};

export const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteTitle: 'BOSTROSHOILY (বস্ত্র শৈলী) - Authentic Handloom & Clothing Store',
  metaDescription: 'Shop authentic Sirajganj handloom lungis, royal panjabis, Dhakai jamdani sarees & cotton wear at BOSTROSHOILY (বস্ত্র শৈলী / bostoshoily).',
  keywords: 'bostroshoily, bostoshoily, bostro shoily, bastra shoily, বস্ত্র শৈলী, sirajganj handloom lungi, dhakai jamdani saree, panjabi',
  ogImage: '/bastra-shoily-logo.svg',
  canonicalUrl: typeof window !== 'undefined' ? window.location.origin : 'https://bostroshoily.onrender.com',
  robotsTxt: 'User-agent: *\nAllow: /',
  sitemapEnabled: true,
};

export const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'admin-0',
  name: 'এডমিন ড্যাশবোর্ড',
  email: 'admin@bastrashoily.com',
  role: 'super_admin',
  avatar: '',
};
import { getTranslation } from '../utils/translations';

export const INITIAL_MEGA_FESTIVE_OFFERS: CategoryOfferItem[] = [];

export const DEFAULT_NAV_MENUS: NavMenu[] = [
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
];

export function buildNavMenusFromCategories(cats: Category[]): NavMenu[] {
  if (!cats || cats.length === 0) return DEFAULT_NAV_MENUS;

  // 1. Separate active main categories
  const mainCats = cats
    .filter((c) => Boolean(c.isMain) && c.isActive !== false && !c.isArchived)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (mainCats.length === 0) return DEFAULT_NAV_MENUS;

  // 2. Build nav menu for each main category with all active child subcategories
  return mainCats.map((main, idx) => {
    const parentMatches = [
      main.id.toLowerCase(),
      main.slug.toLowerCase(),
      main.name.toLowerCase(),
      main.banglaName?.toLowerCase() || '',
    ].filter(Boolean);

    const subItems = cats
      .filter((c) => {
        if (c.isMain || c.isActive === false || c.isArchived) return false;
        const p = (c.parentCategory || '').trim().toLowerCase();
        return parentMatches.includes(p);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((sub, sIdx) => ({
        id: sub.id,
        label: sub.name,
        banglaLabel: sub.banglaName || sub.name,
        url: `/category/${sub.slug}`,
        categorySlug: sub.slug,
        order: sub.order || sIdx + 1,
        isActive: sub.isActive !== false,
      }));

    return {
      id: `nav-${main.slug}`,
      mainCategory: main.slug.toUpperCase(),
      label: main.name,
      banglaLabel: main.banglaName || main.name,
      order: main.order || idx + 1,
      isActive: main.isActive !== false,
      items: subItems,
    };
  });
}

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cp-bastra100',
    code: 'BASTRA100',
    description: 'বিশেষ স্বাগতম ছাড় - ১০০০ টাকার বেশি অর্ডারে ১০০ টাকা ছাড়',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    usageLimit: 500,
    usedCount: 0,
    expiryDate: '2028-12-31',
    expiryTime: '23:59',
    status: 'active',
    isActive: true,
  },
  {
    id: 'cp-festive15',
    code: 'FESTIVE15',
    description: 'উৎসব ছাড় - ১৫% ছাড় (সর্বোচ্চ ৫০০ টাকা)',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1500,
    maxDiscountAmount: 500,
    usageLimit: 500,
    usedCount: 0,
    expiryDate: '2028-12-31',
    expiryTime: '23:59',
    status: 'active',
    isActive: true,
  },
];

export type AppView =
  | 'home'
  | 'category'
  | 'product_details'
  | 'checkout'
  | 'order_tracking'
  | 'admin'
  | 'how_to_order'
  | 'clothing_guide'
  | 'blog'
  | 'landing_page'
  | 'policy';

export interface CartItem {
  item: OrderItem;
  quantity: number;
}

interface ShopContextType {
  // Navigation & View
  currentView: AppView;
  currentProductSlug: string | null;
  currentCategorySlug: string | null;
  currentSubcategorySlug: string | null;
  setCurrentSubcategorySlug: (slug: string | null) => void;
  currentLandingSlug: string | null;
  currentPolicySlug: string | null;
  navigateToHome: () => void;
  navigateToProduct: (slug: string) => void;
  navigateToCategory: (slug: string, subcategorySlug?: string) => void;
  navigateToCheckout: () => void;
  navigateToTracking: (orderId?: string) => void;
  navigateToTrackOrder: (orderId?: string) => void;
  trackingSearchQuery: string;
  setTrackingSearchQuery: (query: string) => void;
  navigateToAdmin: () => void;
  navigateToAccount: () => void;
  navigateToCmsGuide: () => void;
  navigateToClothingGuide: () => void;
  navigateToLandingPage: (slug: string) => void;
  navigateToPolicy: (slug: string) => void;
  navigateBack: () => void;

  // Checkout Upsell
  checkoutUpsells: CheckoutUpsell[];
  fetchCheckoutUpsells: () => Promise<void>;

  // Admin Auth & Access
  isAdminAuthenticated: boolean;
  adminLogin: (password: string, identifier?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  adminLogout: () => void;
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateAdminCredentials: (data: {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; message: string; admin?: any }>;

  // Category Size Charts
  categorySizeCharts: Record<string, CategorySizeChartConfig>;
  updateCategorySizeChart: (categoryKey: string, config: Partial<CategorySizeChartConfig>) => Promise<boolean>;

  // AI Assistant Modal
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  openAiAssistant: () => void;
  closeAiAssistant: () => void;

  // Size Guide Modal
  isSizeGuideModalOpen: boolean;
  sizeGuideCategory: string;
  openSizeGuideModal: (category?: string) => void;
  closeSizeGuideModal: () => void;

  // Invoice Modal
  activeInvoiceOrder: Order | null;
  openInvoiceModal: (order: Order) => void;
  closeInvoiceModal: () => void;

  // Cart Drawer
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  directBuyItem: CartItem | null;
  setDirectBuyItem: (item: CartItem | null) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  buyNow: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (sku: string) => void;
  updateCartQty: (sku: string, qty: number) => void;
  clearCart: (phone?: string) => void;
  syncCustomerServerCart: (phone: string) => Promise<void>;
  cartSubtotal: number;
  cartCount: number;
  requireAdminPasswordChange?: boolean;
  setRequireAdminPasswordChange?: (req: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;

  // Product Reviews
  reviews: ProductReview[];
  addProductReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void;

  // Products
  products: Product[];
  isProductsLoading: boolean;
  productsLoadError: string | null;
  fetchProductByIdOrSlug: (idOrSlug: string) => Promise<Product | null>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'> | Product) => Promise<boolean>;
  updateProduct: (idOrProduct: string | Product, updates?: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean> | boolean;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => Promise<void> | void;
  toggleProductStatus: (id: string) => void;
  duplicateProduct: (id: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'> | Category) => void;
  updateCategory: (idOrCategory: string | Category, updates?: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;

  // Navigation Menus
  navMenus: NavMenu[];
  updateNavMenus: (menus: NavMenu[]) => void;
  updateNavMenu: (menu: NavMenu) => void;
  addNavSubItem: (menuId: string, item: { label: string; banglaLabel: string; url: string; categorySlug?: string }) => void;
  removeNavSubItem: (menuId: string, itemId: string) => void;
  toggleNavSubItem: (menuId: string, itemId: string) => void;

  // Hero Banners
  heroBanners: HeroBanner[];
  addHeroBanner: (banner: Omit<HeroBanner, 'id'> | HeroBanner) => void;
  updateHeroBanner: (idOrBanner: string | HeroBanner, updates?: Partial<HeroBanner>) => void;
  deleteHeroBanner: (id: string) => void;

  // Category Banners
  categoryBanners: CategoryBanner[];
  addCategoryBanner: (banner: Omit<CategoryBanner, 'id'> | CategoryBanner) => void;
  updateCategoryBanner: (idOrBanner: string | CategoryBanner, updates?: Partial<CategoryBanner>) => void;
  deleteCategoryBanner: (id: string) => void;
  saveCategoryBanners: (banners: CategoryBanner[]) => void;

  // Size Charts Integration
  sizeCharts: any[];
  refreshSizeCharts: () => Promise<void>;
  updateSizeCharts: (charts: any[]) => void;

  // Collection Grid
  collections: CollectionGridItem[];
  updateCollections: (collections: CollectionGridItem[]) => void;
  updateCollection: (item: CollectionGridItem) => void;

  // Offers
  offerConfig: OfferSectionConfig;
  updateOfferConfig: (updates: Partial<OfferSectionConfig>) => void;
  megaFestiveOffers: CategoryOfferItem[];
  addMegaFestiveOffer: (offer: Omit<CategoryOfferItem, 'id'> | CategoryOfferItem) => void;
  updateMegaFestiveOffer: (id: string, updates: Partial<CategoryOfferItem>) => void;
  deleteMegaFestiveOffer: (id: string) => void;
  saveMegaFestiveOffers: (offers: CategoryOfferItem[]) => void;

  // Combo Offers & Category Discounts
  comboOffers: ComboOffer[];
  fetchComboOffers: () => Promise<void>;
  getComboDiscountForProduct: (product: Product) => {
    hasDiscount: boolean;
    discountPercent: number;
    discountBadge: string;
    discountedPrice: number;
    comboOffer?: ComboOffer;
  } | null;
  cartComboDiscount: number;

  // Orders
  orders: Order[];
  createOrder: (
    order: Omit<Order, 'id' | 'orderDate' | 'timeline'> & {
      id?: string;
      orderDate?: string;
      timeline?: Order['timeline'];
    },
    fromBackend?: boolean
  ) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string, actor?: string) => void;
  updatePaymentStatus: (orderId: string, newStatus: PaymentStatus, txnId?: string) => void;
  updateOrderPayment: (orderId: string, status: PaymentStatus, txnId?: string) => void;
  updateOrderAdminNotes: (orderId: string, notes: string) => void;
  addAdminNoteToOrder: (orderId: string, note: string) => void;

  // Return Management
  requestOrderReturn: (
    orderId: string,
    returnData: {
      reason: string;
      reasonCode: ReturnReasonCode;
      items: Array<{ orderItemId?: string; productId: string; variantId?: string; quantity: number; condition?: ReturnCondition }>;
      details?: string;
    }
  ) => OrderReturn;
  processOrderReturn: (
    returnId: string,
    status: ReturnWorkflowStatus,
    options?: {
      condition?: ReturnCondition;
      restock?: boolean;
      refundAmount?: number;
      refundMethod?: PaymentMethod | 'wallet' | 'cash';
      refundTxnId?: string;
      adminNotes?: string;
    }
  ) => void;

  // Inventory & Transactions
  inventoryTransactions: InventoryTransaction[];
  adjustStock: (
    productId: string,
    variantId: string | null,
    newStock: number,
    reason: InventoryTransaction['reason'],
    customNote?: string,
    isDelta?: boolean
  ) => void;

  // Customers
  customers: Customer[];
  toggleCustomerStatus: (id: string) => void;
  updateCustomer: (customerOrId: Customer | string, updates?: Partial<Customer>) => void;

  // Customer Authentication & Portal
  currentCustomer: Customer | null;
  isCustomerAuthModalOpen: boolean;
  isCustomerAccountModalOpen: boolean;
  authInitialMode: 'login' | 'register';
  openCustomerAuthModal: (mode?: 'login' | 'register') => void;
  closeCustomerAuthModal: () => void;
  openCustomerAccountModal: () => void;
  closeCustomerAccountModal: () => void;
  customerLogin: (phoneOrEmail: string, password?: string) => { success: boolean; message: string };
  customerRegister: (data: { name: string; phone: string; email?: string; address?: string; district?: string; upazila?: string; country?: string; countryCode?: string }) => { success: boolean; message: string };
  customerLogout: () => void;
  updateCurrentCustomerProfile: (updates: Partial<Customer>) => void;

  // Home Page Product Sections Config
  homePageSectionsConfig: {
    newArrivalsMode: 'automatic' | 'manual';
    newArrivalsLimit: number;
    bestSellersMode: 'automatic' | 'manual';
    bestSellersLimit: number;
  };
  updateHomePageSectionsConfig: (updates: Partial<{
    newArrivalsMode: 'automatic' | 'manual';
    newArrivalsLimit: number;
    bestSellersMode: 'automatic' | 'manual';
    bestSellersLimit: number;
  }>) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'> | Coupon) => void;
  updateCoupon: (idOrCoupon: string | Coupon, updates?: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  applyCoupon: (code: string, subtotal: number) => { valid: boolean; discount: number; message: string; coupon?: Coupon };

  // Delivery & Payment & Invoices
  deliveryConfig: DeliveryConfig;
  updateDeliveryConfig: (config: DeliveryConfig) => void;
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: PaymentConfig) => void;
  invoiceConfig: InvoiceConfig;
  updateInvoiceConfig: (config: InvoiceConfig) => void;

  // Product Page Settings (PDP)
  productPageSettings: ProductPageSettings;
  updateProductPageSettings: (settings: ProductPageSettings) => void;

  // CMS: How to order
  howToOrderSteps: CMSStep[];
  updateHowToOrderSteps: (steps: CMSStep[]) => void;
  updateHowToOrderStep: (step: CMSStep) => void;

  // Clothing Videos & Stories
  clothingVideos: ClothingVideoItem[];
  addClothingVideo: (item: Omit<ClothingVideoItem, 'id'> | ClothingVideoItem) => void;
  updateClothingVideo: (id: string, updates: Partial<ClothingVideoItem>) => void;
  deleteClothingVideo: (id: string) => void;
  clothingStories: ClothingVideoItem[];
  addClothingStory: (item: ClothingVideoItem) => void;
  updateClothingStory: (item: ClothingVideoItem) => void;
  deleteClothingStory: (id: string) => void;

  // Brand & Artisan Partner Stories
  brandPartnerStories: BrandPartnerStory[];
  addBrandPartnerStory: (story: Omit<BrandPartnerStory, 'id'> | BrandPartnerStory) => void;
  updateBrandPartnerStory: (id: string, updates: Partial<BrandPartnerStory>) => void;
  deleteBrandPartnerStory: (id: string) => void;
  saveBrandPartnerStories: (stories: BrandPartnerStory[]) => void;

  // Blog
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt'>) => void;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  // Footer & SEO
  footerConfig: FooterConfig;
  updateFooterConfig: (config: FooterConfig) => void;
  seoConfig: SEOConfig;
  updateSEOConfig: (config: SEOConfig) => void;

  // General Store Info & Visual Design
  generalSettings: GeneralSettings;
  updateGeneralSettings: (settings: GeneralSettings) => void;
  storeDesign: StoreDesignSettings;
  updateStoreDesign: (settings: Partial<StoreDesignSettings>) => Promise<boolean>;

  // Admin Auth & Roles & Staff
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  currentUser: AdminUser | null;
  switchAdminRole: (role: AdminRole) => void;
  adminStaff: AdminStaff[];
  addAdminStaff: (staff: AdminStaff) => void;
  updateAdminStaff: (staff: AdminStaff) => void;
  deleteAdminStaff: (id: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, category: AuditLog['category']) => void;

  // Database Backup & Restore
  exportFullDatabase: () => string;
  importFullDatabase: (jsonStr: string) => boolean;
  syncFromDatabase: () => Promise<void>;
  syncAuthoritativeData: () => Promise<void>;
  resetToDemoData: () => Promise<void> | void;

  // Notification Toast Helper
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Language Switcher
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;

  // Global Swatches & Sizes
  colors: ColorItem[];
  sizes: SizeItem[];
  refreshColorsAndSizes: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

function getInitialState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`bastra_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function normalizeOrder(raw: any): Order {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `BS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'সম্মানিত ক্রেতা',
      customerPhone: '',
      deliveryAddress: '',
      district: 'Dhaka',
      items: [],
      subtotal: 0,
      deliveryCharge: 60,
      discount: 0,
      total: 60,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeline: [],
    };
  }

  const orderDate = String(
    raw.orderDate ||
    raw.order_date ||
    raw.createdAt ||
    raw.created_at ||
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: OrderItem[] = rawItems.map((it: any) => ({
    productId: it.productId || it.product_id || '',
    productName: it.productName || it.product_name || 'পোশাক আইটেম',
    banglaName: it.banglaName || it.bangla_name,
    variantId: it.variantId || it.variant_id,
    variantSummary: it.variantSummary || (it.color_name && it.size_name ? `${it.color_name} / ${it.size_name}` : undefined),
    sku: it.sku || '',
    price: Number(it.price ?? it.unit_price ?? it.unitPrice ?? 0),
    quantity: Number(it.quantity ?? 1),
    image: it.image || it.main_image,
  }));

  return {
    ...raw,
    id: String(raw.id || `BS-${Math.floor(1000 + Math.random() * 9000)}`),
    customerName: raw.customerName || raw.customer_name || 'সম্মানিত ক্রেতা',
    customerPhone: raw.customerPhone || raw.customer_phone || '',
    customerEmail: raw.customerEmail || raw.customer_email || '',
    deliveryAddress: raw.deliveryAddress || raw.delivery_address || '',
    country: raw.country || 'Bangladesh',
    countryCode: raw.countryCode || raw.country_code || '+880',
    district: raw.district || 'Dhaka',
    upazila: raw.upazila || '',
    postalCode: raw.postalCode || raw.postal_code || '',
    stateProvince: raw.stateProvince || raw.state_province || '',
    items,
    subtotal: Number(raw.subtotal ?? 0),
    deliveryCharge: Number(raw.deliveryCharge ?? raw.delivery_charge ?? 60),
    discount: Number(raw.discount ?? 0),
    couponCode: raw.couponCode || raw.coupon_code || '',
    total: Number(raw.total ?? 0),
    paymentMethod: raw.paymentMethod || raw.payment_method || 'cod',
    paymentStatus: raw.paymentStatus || raw.payment_status || 'pending',
    paymentTxnId: raw.paymentTxnId || raw.payment_txn_id || '',
    orderStatus: raw.orderStatus || raw.order_status || 'pending',
    orderDate,
    customerNotes: raw.customerNotes || raw.customer_notes || '',
    adminNotes: raw.adminNotes || raw.admin_notes || '',
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    statusHistory: Array.isArray(raw.statusHistory) ? raw.statusHistory : [],
    returnRequests: Array.isArray(raw.returnRequests || raw.returns) ? (raw.returnRequests || raw.returns) : [],
    refundAmount: Number(raw.refundAmount ?? raw.refund_amount ?? 0),
    refundTxnId: raw.refundTxnId || raw.refund_txn_id || '',
  };
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Views
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(null);
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string | null>(null);
  const [currentSubcategorySlug, setCurrentSubcategorySlug] = useState<string | null>(null);
  const [currentLandingSlug, setCurrentLandingSlug] = useState<string | null>(null);
  const [currentPolicySlug, setCurrentPolicySlug] = useState<string | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');
  const [checkoutUpsells, setCheckoutUpsells] = useState<CheckoutUpsell[]>([]);

  // Colors & Sizes
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [sizes, setSizes] = useState<SizeItem[]>([]);

  const refreshColorsAndSizes = useCallback(async () => {
    try {
      const [colRes, szRes] = await Promise.allSettled([
        fetch('/api/colors').then((r) => r.json()),
        fetch('/api/sizes').then((r) => r.json()),
      ]);
      if (colRes.status === 'fulfilled' && colRes.value?.success && Array.isArray(colRes.value.colors)) {
        setColors(colRes.value.colors);
      }
      if (szRes.status === 'fulfilled' && szRes.value?.success && Array.isArray(szRes.value.sizes)) {
        setSizes(szRes.value.sizes);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('bastra_language');
      return saved === 'en' || saved === 'bn' ? (saved as Language) : 'bn';
    } catch {
      return 'bn';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bastra_language', lang);
    } catch {}
    showToast(lang === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে' : 'Language switched to English');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Authoritative Database States (Loaded and managed directly via Express + SQLite API)
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [productsLoadError, setProductsLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [navMenus, setNavMenus] = useState<NavMenu[]>(DEFAULT_NAV_MENUS);
  const [sizeCharts, setSizeCharts] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [categoryBanners, setCategoryBanners] = useState<CategoryBanner[]>(DEFAULT_CATEGORY_BANNERS);
  const [collections, setCollections] = useState<CollectionGridItem[]>(DEFAULT_COLLECTIONS);
  const [offerConfig, setOfferConfig] = useState<OfferSectionConfig>(DEFAULT_OFFER_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('bastra_current_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const [isCustomerAccountModalOpen, setIsCustomerAccountModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Universal Navigation History & Modals
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('bastra_admin_token'));
    } catch {
      return false;
    }
  });
  const [requireAdminPasswordChange, setRequireAdminPasswordChange] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSizeGuideModalOpen, setIsSizeGuideModalOpen] = useState(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState<string>('Lungi');

  const [homePageSectionsConfig, setHomePageSectionsConfig] = useState<{
    newArrivalsMode: 'automatic' | 'manual';
    newArrivalsLimit: number;
    bestSellersMode: 'automatic' | 'manual';
    bestSellersLimit: number;
  }>({
    newArrivalsMode: 'automatic',
    newArrivalsLimit: 8,
    bestSellersMode: 'automatic',
    bestSellersLimit: 8,
  });
  const [coupons, setCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>(() => {
    try {
      const saved = localStorage.getItem('bastra_delivery_config');
      return saved ? JSON.parse(saved) : DEFAULT_DELIVERY_CONFIG;
    } catch {
      return DEFAULT_DELIVERY_CONFIG;
    }
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('bastra_payment_config');
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_CONFIG;
    } catch {
      return DEFAULT_PAYMENT_CONFIG;
    }
  });
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig>(() => {
    try {
      const saved = localStorage.getItem('bastra_invoice_config');
      return saved ? JSON.parse(saved) : DEFAULT_INVOICE_CONFIG;
    } catch {
      return DEFAULT_INVOICE_CONFIG;
    }
  });
  const [howToOrderSteps, setHowToOrderSteps] = useState<CMSStep[]>([]);
  const [clothingVideos, setClothingVideos] = useState<ClothingVideoItem[]>([]);
  const [brandPartnerStories, setBrandPartnerStories] = useState<BrandPartnerStory[]>([]);
  const [megaFestiveOffers, setMegaFestiveOffers] = useState<CategoryOfferItem[]>(INITIAL_MEGA_FESTIVE_OFFERS);
  const [comboOffers, setComboOffers] = useState<ComboOffer[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    try {
      const saved = localStorage.getItem('bastra_footer_config');
      return saved ? JSON.parse(saved) : DEFAULT_FOOTER_CONFIG;
    } catch {
      return DEFAULT_FOOTER_CONFIG;
    }
  });
  const [seoConfig, setSEOConfig] = useState<SEOConfig>(DEFAULT_SEO_CONFIG);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [categorySizeCharts, setCategorySizeCharts] = useState<Record<string, CategorySizeChartConfig>>({
    panjabi: {
      categoryKey: 'panjabi',
      categoryName: 'Panjabi',
      banglaName: 'পাঞ্জাবি',
      imageUrl: '',
      note: 'সমস্ত মাপ স্ট্যান্ডার্ড ইঞ্চিতে পরিমাপ করা। ১০০% প্রিমিয়াম সুতি ও আরামদায়ক কাটিং।',
    },
    lungi: {
      categoryKey: 'lungi',
      categoryName: 'Lungi',
      banglaName: 'লুঙ্গি',
      imageUrl: '',
      note: 'সিরাজগঞ্জ তাঁতের প্রমিত মাপ (ফ্রি-সাইজ)। সুতার কাউন্ট: ৮০, দৈর্ঘ্য: ৩ হাত / ৫৪ ইঞ্চি, বহর: আড়াই হাত / ৪৫ ইঞ্চি।',
    },
    saree: {
      categoryKey: 'saree',
      categoryName: 'Saree',
      banglaName: 'শাড়ি',
      imageUrl: '',
      note: 'প্রিমিয়াম সুতি ও জামদানি শাড়ির মাপ। দৈর্ঘ্য: ১২ হাত, বহর: ৪৫ ইঞ্চি।',
    },
    tshirt: {
      categoryKey: 'tshirt',
      categoryName: 'T-Shirt',
      banglaName: 'টি-শার্ট',
      imageUrl: '',
      note: 'প্রিমিয়াম ১০০% কম্বড কটন টি-শার্ট। সমস্ত মাপ ইঞ্চিতে।',
    },
    threepiece: {
      categoryKey: 'threepiece',
      categoryName: 'Three-Piece',
      banglaName: 'থ্রি-পিস',
      imageUrl: '',
      note: 'কামিজ, সালোয়ার ও ওড়নার পরিমাপ। সমস্ত মাপ ইঞ্চিতে।',
    },
  });

  // Browser Client Preferences (Only Cart, Wishlist, Local UI Session)
  const [cart, setCart] = useState<CartItem[]>(() => getInitialState('cart', []));
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => getInitialState('wishlist', []));
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Sync client cart to localStorage and SQLite server cart if customer is logged in
  useEffect(() => {
    try {
      localStorage.setItem('bastra_cart', JSON.stringify(cart));
    } catch {}

    if (currentCustomer?.phone && currentCustomer.phone.trim().length >= 10) {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: currentCustomer.phone.trim(),
          items: cart.map((c) => ({
            productId: c.item.productId,
            variantId: c.item.variantId,
            quantity: c.quantity,
            price: c.item.price,
          })),
          replace: true,
        }),
      }).catch(() => {});
    }
  }, [cart, currentCustomer?.phone]);
  useEffect(() => {
    try {
      localStorage.setItem('bastra_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // -------------------------------------------------------------
  // AUTHORITATIVE SQLITE BACKEND SYNCHRONIZATION
  // -------------------------------------------------------------
  const syncAuthoritativeData = useCallback(async () => {
    try {
      const token = localStorage.getItem('bastra_admin_token');
      const prodHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const fetchProductsSafely = async (): Promise<any[]> => {
        if (token) {
          try {
            const r = await fetch('/api/admin/products', { headers: prodHeaders });
            if (r.ok) {
              const d = await r.json();
              if (d.success && Array.isArray(d.products)) return d.products;
            }
          } catch {}
        }
        try {
          const r = await fetch('/api/products');
          if (r.ok) {
            const d = await r.json();
            if (d.success && Array.isArray(d.products)) return d.products;
          }
        } catch {}
        return [];
      };

      const [loadedProducts, catRes, bannerRes, couponRes, settingsRes, reviewsRes, comboRes, designRes, upsellRes, sizeChartsRes] = await Promise.allSettled([
        fetchProductsSafely(),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/banners').then((r) => r.json()),
        fetch('/api/coupons').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/reviews').then((r) => r.json()),
        fetch('/api/combo-offers').then((r) => r.json()),
        fetch('/api/store-design').then((r) => r.json()),
        fetch('/api/checkout-upsells').then((r) => r.json()),
        fetch('/api/size-charts').then((r) => r.json()),
      ]);

      if (loadedProducts.status === 'fulfilled' && loadedProducts.value.length > 0) {
        setProducts(loadedProducts.value);
        setIsProductsLoading(false);
        setProductsLoadError(null);
      } else {
        setIsProductsLoading(false);
      }
      if (designRes.status === 'fulfilled' && designRes.value?.success && designRes.value.design) {
        setStoreDesign((prev) => ({ ...prev, ...designRes.value.design }));
        try { localStorage.setItem('bastra_store_design', JSON.stringify(designRes.value.design)); } catch {}
      }
      if (comboRes.status === 'fulfilled' && comboRes.value?.success && Array.isArray(comboRes.value.comboOffers)) {
        setComboOffers(comboRes.value.comboOffers);
      }
      if (upsellRes.status === 'fulfilled' && upsellRes.value?.success && Array.isArray(upsellRes.value.upsells)) {
        setCheckoutUpsells(upsellRes.value.upsells);
      }
      if (sizeChartsRes.status === 'fulfilled' && sizeChartsRes.value?.success && Array.isArray(sizeChartsRes.value.charts)) {
        setSizeCharts(sizeChartsRes.value.charts);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.success && Array.isArray(catRes.value.categories)) {
        const loadedCats = catRes.value.categories;
        setCategories(loadedCats);
        const dynamicNav = buildNavMenusFromCategories(loadedCats);
        if (dynamicNav && dynamicNav.length > 0) {
          setNavMenus(dynamicNav);
        }
      }
      if (bannerRes.status === 'fulfilled' && bannerRes.value?.success && Array.isArray(bannerRes.value.banners)) {
        setHeroBanners(bannerRes.value.banners);
      }
      if (couponRes.status === 'fulfilled' && couponRes.value?.success && Array.isArray(couponRes.value.coupons)) {
        setCoupons(couponRes.value.coupons);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value.settings) {
        const s = settingsRes.value.settings;
        if (s.delivery_config) {
          setDeliveryConfig(s.delivery_config);
          try { localStorage.setItem('bastra_delivery_config', JSON.stringify(s.delivery_config)); } catch {}
        }
        if (s.payment_config) {
          setPaymentConfig(s.payment_config);
          try { localStorage.setItem('bastra_payment_config', JSON.stringify(s.payment_config)); } catch {}
        }
        if (s.invoice_config) {
          setInvoiceConfig(s.invoice_config);
          try { localStorage.setItem('bastra_invoice_config', JSON.stringify(s.invoice_config)); } catch {}
        }
        if (s.general_settings) {
          setGeneralSettings(s.general_settings);
          try { localStorage.setItem('bastra_general_settings', JSON.stringify(s.general_settings)); } catch {}
        }
        if (s.footer_config) {
          setFooterConfig(s.footer_config);
          try { localStorage.setItem('bastra_footer_config', JSON.stringify(s.footer_config)); } catch {}
        }
        if (s.seo_config) setSEOConfig(s.seo_config);
        if (s.home_collections && Array.isArray(s.home_collections) && s.home_collections.length > 0) {
          setCollections(s.home_collections);
          try { localStorage.setItem('bastra_setting_home_collections', JSON.stringify(s.home_collections)); } catch {}
        }
        if (s.category_banners && Array.isArray(s.category_banners) && s.category_banners.length > 0) {
          setCategoryBanners(s.category_banners);
        }
        if (s.offer_config) {
          setOfferConfig(s.offer_config);
        }
        if (s.mega_festive_offers && Array.isArray(s.mega_festive_offers) && s.mega_festive_offers.length > 0) {
          setMegaFestiveOffers(s.mega_festive_offers);
        }
        if (s.nav_menus && Array.isArray(s.nav_menus) && s.nav_menus.length > 0) {
          setNavMenus(s.nav_menus);
        } else {
          setNavMenus(DEFAULT_NAV_MENUS);
        }
        if (s.pdp_settings) {
          setProductPageSettings(s.pdp_settings);
          try { localStorage.setItem('bastra_pdp_settings', JSON.stringify(s.pdp_settings)); } catch {}
        }
        if (s.home_sections_config) {
          setHomePageSectionsConfig(s.home_sections_config);
          try { localStorage.setItem('bastra_home_sections_config', JSON.stringify(s.home_sections_config)); } catch {}
        }
        if (s.store_design) {
          try { localStorage.setItem('bastra_store_design', JSON.stringify(s.store_design)); } catch {}
        }
        if (s.clothing_videos && Array.isArray(s.clothing_videos)) {
          setClothingVideos(s.clothing_videos);
        }
        if (s.brand_partner_stories && Array.isArray(s.brand_partner_stories)) {
          setBrandPartnerStories(s.brand_partner_stories);
        }
        if (s.cms_how_to_order && Array.isArray(s.cms_how_to_order)) {
          setHowToOrderSteps(s.cms_how_to_order);
        }
        if (s.category_size_charts && typeof s.category_size_charts === 'object') {
          setCategorySizeCharts((prev) => ({ ...prev, ...s.category_size_charts }));
        }
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.success && Array.isArray(reviewsRes.value.reviews)) {
        setReviews(reviewsRes.value.reviews);
      }
      refreshColorsAndSizes();
    } catch (err) {
      console.warn('Authoritative SQLite backend sync warning:', err);
    }

    // Check admin session validity via cryptographically verified session token
    try {
      const token = localStorage.getItem('bastra_admin_token');
      if (token) {
        const meRes = await adminFetch('/api/admin/auth/me');
        const meData = await meRes.json();
        if (meData.authenticated && meData.admin) {
          setCurrentAdmin(meData.admin);
          setIsAdminAuthenticated(true);
          setRequireAdminPasswordChange(Boolean(meData.requirePasswordChange));
          if (meData.csrfToken) {
            localStorage.setItem('bastra_csrf_token', meData.csrfToken);
          }
          // Securely load admin entities only for verified authenticated admin
          try {
            const [ordersRes, custRes, invRes, auditRes, staffRes] = await Promise.allSettled([
              adminFetch('/api/admin/orders').then((r) => r.json()),
              adminFetch('/api/admin/customers').then((r) => r.json()),
              adminFetch('/api/admin/inventory/transactions').then((r) => r.json()),
              adminFetch('/api/admin/audit-logs').then((r) => r.json()),
              adminFetch('/api/admin/staff').then((r) => r.json()),
            ]);

            if (ordersRes.status === 'fulfilled' && ordersRes.value?.success && Array.isArray(ordersRes.value.orders)) {
              setOrders(ordersRes.value.orders.map(normalizeOrder));
            }
            if (custRes.status === 'fulfilled' && custRes.value?.success && Array.isArray(custRes.value.customers)) {
              setCustomers(custRes.value.customers);
            }
            if (invRes.status === 'fulfilled' && invRes.value?.success && Array.isArray(invRes.value.transactions)) {
              setInventoryTransactions(invRes.value.transactions);
            }
            if (auditRes.status === 'fulfilled' && auditRes.value?.success && Array.isArray(auditRes.value.logs)) {
              setAuditLogs(auditRes.value.logs);
            }
            if (staffRes.status === 'fulfilled' && staffRes.value?.success && Array.isArray(staffRes.value.staff)) {
              setAdminStaff(staffRes.value.staff);
            }
          } catch {}
        } else {
          localStorage.removeItem('bastra_admin_token');
          localStorage.removeItem('bastra_csrf_token');
          setIsAdminAuthenticated(false);
        }
      }
    } catch {}
  }, []);

  const persistSettingToBackend = (key: string, value: any) => {
    try {
      localStorage.setItem(`bastra_setting_${key}`, JSON.stringify(value));
      if (key === 'delivery_config') localStorage.setItem('bastra_delivery_config', JSON.stringify(value));
      if (key === 'footer_config') localStorage.setItem('bastra_footer_config', JSON.stringify(value));
      if (key === 'general_settings') localStorage.setItem('bastra_general_settings', JSON.stringify(value));
      if (key === 'payment_config') localStorage.setItem('bastra_payment_config', JSON.stringify(value));
      if (key === 'invoice_config') localStorage.setItem('bastra_invoice_config', JSON.stringify(value));
      if (key === 'home_collections') localStorage.setItem('bastra_setting_home_collections', JSON.stringify(value));
    } catch {}

    adminFetch(`/api/admin/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    })
      .then(() => syncAuthoritativeData())
      .catch(() => {
        fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
          .then(() => syncAuthoritativeData())
          .catch((err) => console.warn(`Failed to persist setting ${key} to backend:`, err));
      });
  };

  useEffect(() => {
    syncAuthoritativeData();
  }, [syncAuthoritativeData]);

  // Handle URL hash routing or initial path
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (
        path === '/admin' ||
        path === '/admin/' ||
        hash === '#/admin' ||
        hash === '#/admin/' ||
        hash.startsWith('#/admin') ||
        path === '/account' ||
        path === '/account/' ||
        hash === '#/account' ||
        hash === '#/account/' ||
        hash.startsWith('#/account')
      ) {
        setCurrentView('admin');
      } else if (hash.startsWith('#/product/') || path.startsWith('/product/')) {
        const raw = hash.startsWith('#/product/') ? hash.replace('#/product/', '') : path.replace('/product/', '');
        const cleanSlug = raw.split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
        const decoded = decodeURIComponent(cleanSlug);
        setCurrentProductSlug(decoded);
        setCurrentView('product_details');
      } else if (hash.startsWith('#/category/') || path.startsWith('/category/')) {
        const fullRaw = hash.startsWith('#/category/') ? hash.replace('#/category/', '') : path.replace('/category/', '');
        const [cleanSlugPart, queryPart] = fullRaw.split('?');
        const cleanSlug = cleanSlugPart.split('#')[0].replace(/\/+$/, '').trim();
        const decoded = decodeURIComponent(cleanSlug);
        setCurrentCategorySlug(decoded);
        let subcat: string | null = null;
        if (queryPart) {
          const params = new URLSearchParams(queryPart.split('#')[0]);
          subcat = params.get('subcategory') || params.get('sub');
        }
        setCurrentSubcategorySlug(subcat ? decodeURIComponent(subcat) : null);
        setCurrentView('category');
      } else if (hash === '#/checkout' || path === '/checkout') {
        setCurrentView('checkout');
      } else if (hash.startsWith('#/track-order') || path.startsWith('/track-order')) {
        setCurrentView('order_tracking');
      } else if (hash === '#/how-to-order' || path === '/how-to-order') {
        setCurrentView('how_to_order');
      } else if (hash === '#/clothing-guide' || path === '/clothing-guide') {
        setCurrentView('clothing_guide');
      } else if (hash.startsWith('#/campaign/') || hash.startsWith('#/landing/') || path.startsWith('/campaign/') || path.startsWith('/landing/')) {
        const raw = hash.startsWith('#/campaign/') ? hash.replace('#/campaign/', '') : (hash.startsWith('#/landing/') ? hash.replace('#/landing/', '') : (path.startsWith('/campaign/') ? path.replace('/campaign/', '') : path.replace('/landing/', '')));
        const cleanSlug = raw.split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
        setCurrentLandingSlug(cleanSlug);
        setCurrentView('landing_page');
      } else if (hash.startsWith('#/pages/') || hash.startsWith('#pages/') || path.startsWith('/pages/')) {
        const raw = hash.startsWith('#/pages/') 
          ? hash.replace('#/pages/', '') 
          : (hash.startsWith('#pages/') ? hash.replace('#pages/', '') : path.replace('/pages/', ''));
        const cleanSlug = raw.split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
        setCurrentPolicySlug(cleanSlug || 'returns-exchange');
        setCurrentView('policy');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch individual product by slug or id directly from authoritative SQLite API
  const fetchProductByIdOrSlug = useCallback(async (idOrSlug: string): Promise<Product | null> => {
    if (!idOrSlug) return null;
    const target = idOrSlug.trim();
    const decodedTarget = decodeURIComponent(target).toLowerCase();

    // First check existing products in local state
    const found = products.find((p) => {
      const pSlug = (p.slug || '').toLowerCase();
      const pId = (p.id || '').toLowerCase();
      const pSku = (p.sku || '').toLowerCase();
      return (
        pSlug === target.toLowerCase() ||
        pId === target.toLowerCase() ||
        pSku === target.toLowerCase() ||
        pSlug === decodedTarget ||
        pId === decodedTarget ||
        decodeURIComponent(p.slug || '').toLowerCase() === decodedTarget
      );
    });
    if (found) return found;

    try {
      const token = localStorage.getItem('bastra_admin_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/products/${encodeURIComponent(target)}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.product) {
        const canonical: Product = data.product;
        setProducts((prev) => {
          if (prev.some((p) => p.id === canonical.id)) {
            return prev.map((p) => (p.id === canonical.id ? canonical : p));
          }
          return [...prev, canonical];
        });
        return canonical;
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch individual product by identifier:', err);
      return null;
    }
  }, [products]);

  // View Navigation Helpers with History Tracking
  const recordHistory = (targetView: AppView) => {
    if (currentView !== targetView) {
      setViewHistory((prev) => [...prev, currentView]);
    }
  };

  const navigateToHome = () => {
    recordHistory('home');
    setCurrentView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (slugOrId: string) => {
    const target = slugOrId?.trim() || '';
    recordHistory('product_details');
    setCurrentProductSlug(target);
    setCurrentView('product_details');
    window.location.hash = `/product/${encodeURIComponent(target)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string, subcategorySlug?: string) => {
    recordHistory('category');
    setCurrentCategorySlug(slug);
    setCurrentSubcategorySlug(subcategorySlug || null);
    setCurrentView('category');
    window.location.hash = subcategorySlug
      ? `/category/${slug}?subcategory=${encodeURIComponent(subcategorySlug)}`
      : `/category/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    recordHistory('checkout');
    setCurrentView('checkout');
    window.location.hash = `/checkout`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTracking = (orderId?: string) => {
    recordHistory('order_tracking');
    if (orderId) {
      setTrackingSearchQuery(orderId);
    }
    setCurrentView('order_tracking');
    window.location.hash = `/track-order${orderId ? `?id=${encodeURIComponent(orderId)}` : ''}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const navigateToTrackOrder = navigateToTracking;

  const navigateToAdmin = () => {
    recordHistory('admin');
    setCurrentView('admin');
    window.location.hash = `/account`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAccount = () => {
    recordHistory('admin');
    setCurrentView('admin');
    window.location.hash = `/account`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCmsGuide = () => {
    recordHistory('how_to_order');
    setCurrentView('how_to_order');
    window.location.hash = `/how-to-order`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToClothingGuide = () => {
    recordHistory('clothing_guide');
    setCurrentView('clothing_guide');
    window.location.hash = `/clothing-guide`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLandingPage = (slug: string) => {
    recordHistory('landing_page');
    setCurrentLandingSlug(slug);
    setCurrentView('landing_page');
    window.location.hash = `/campaign/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPolicy = (slug: string) => {
    recordHistory('policy');
    const clean = slug.replace(/^\/+/, '').replace(/^pages\//, '').replace(/^#\/?pages\//, '');
    setCurrentPolicySlug(clean);
    setCurrentView('policy');
    window.location.hash = `/pages/${clean}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCheckoutUpsells = useCallback(async () => {
    try {
      const res = await fetch('/api/checkout-upsells');
      const data = await res.json();
      if (data.success && Array.isArray(data.upsells)) {
        setCheckoutUpsells(data.upsells);
      }
    } catch (e) {
      console.warn('Failed to fetch checkout upsells:', e);
    }
  }, []);

  const navigateBack = () => {
    if (viewHistory.length > 0) {
      const prev = viewHistory[viewHistory.length - 1];
      setViewHistory((h) => h.slice(0, -1));
      setCurrentView(prev);
      if (prev === 'home') {
        window.location.hash = '';
      } else if (prev === 'category') {
        window.location.hash = currentCategorySlug ? `/category/${currentCategorySlug}` : '';
      } else if (prev === 'product_details') {
        window.location.hash = currentProductSlug ? `/product/${currentProductSlug}` : '';
      } else if (prev === 'checkout') {
        window.location.hash = '/checkout';
      } else if (prev === 'order_tracking') {
        window.location.hash = '/track-order';
      } else if (prev === 'how_to_order') {
        window.location.hash = '/how-to-order';
      } else if (prev === 'clothing_guide') {
        window.location.hash = '/clothing-guide';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToHome();
    }
  };

  // Admin Auth Helpers
  const adminLogin = async (password: string, identifier?: string): Promise<{ success: boolean; message: string }> => {
    const rawId = (identifier || '').trim();
    if (!rawId || !password) {
      return { success: false, message: 'ইমেইল অথবা মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক' };
    }
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: rawId, email: rawId, phone: rawId, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        if (data.token) localStorage.setItem('bastra_admin_token', data.token);
        if (data.csrfToken) localStorage.setItem('bastra_csrf_token', data.csrfToken);
        if (data.admin) setCurrentAdmin(data.admin);
        setRequireAdminPasswordChange(Boolean(data.requirePasswordChange));
        showToast(data.message || 'এডমিন সফলভাবে লগইন হয়েছেন');

        // Load protected orders for admin panel
        try {
          const ordersRes = await adminFetch('/api/admin/orders');
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.orders)) {
            setOrders(ordersData.orders.map(normalizeOrder));
          }
        } catch {}

        navigateToAdmin();
        return { success: true, message: data.message || 'এডমিন লগইন সফল হয়েছে' };
      } else {
        return { success: false, message: data.error || 'ভুল ইমেইল/মোবাইল অথবা পাসওয়ার্ড! পুনরায় সঠিক তথ্য দিয়ে চেষ্টা করুন।' };
      }
    } catch (networkErr) {
      return {
        success: false,
        message: 'লগইন সার্ভারে সংযোগ করা সম্ভব হয়নি। আপনার ইন্টারনেট সংযোগ ও সার্ভার স্ট্যাটাস যাচাই করুন।',
      };
    }
  };

  const adminLogout = async () => {
    try {
      await adminFetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('bastra_admin_token');
    localStorage.removeItem('bastra_csrf_token');
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    showToast('এডমিন প্যানেল থেকে লগআউট করা হয়েছে');
    navigateToAdmin();
  };

  const changeAdminPassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('bastra_admin_token');
      if (!token) return { success: false, message: 'এডমিন লগইন প্রয়োজন' };
      const res = await adminFetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
        navigateToAdmin();
        return { success: false, message: 'আপনার এডমিন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।' };
      }
      if (res.ok && data.success) {
        setRequireAdminPasswordChange(false);
        showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        return { success: true, message: data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' };
      } else {
        return { success: false, message: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'নেটওয়ার্ক ত্রুটি' };
    }
  };

  const updateAdminCredentials = async (data: {
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; message: string; admin?: any }> => {
    try {
      const token = localStorage.getItem('bastra_admin_token');
      if (!token) return { success: false, message: 'এডমিন লগইন প্রয়োজন' };
      const res = await adminFetch('/api/admin/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        if (resData.admin) {
          setCurrentAdmin(resData.admin);
        }
        setRequireAdminPasswordChange(false);
        showToast(resData.message || 'এডমিন ক্রেডেনশিয়াল সফলভাবে আপডেট হয়েছে!');
        return { success: true, message: resData.message || 'সফল হয়েছে', admin: resData.admin };
      } else {
        return { success: false, message: resData.error || 'আপডেট করতে সমস্যা হয়েছে' };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || 'সার্ভার সংযোগ ত্রুটি' };
    }
  };

  const updateCategorySizeChart = async (categoryKey: string, config: Partial<CategorySizeChartConfig>): Promise<boolean> => {
    try {
      const updated = {
        ...categorySizeCharts,
        [categoryKey]: {
          ...(categorySizeCharts[categoryKey] || { categoryKey, categoryName: categoryKey, banglaName: categoryKey }),
          ...config,
        },
      };
      setCategorySizeCharts(updated);
      await persistSettingToBackend('category_size_charts', updated);
      showToast('সাইজ চার্ট কনফিগারেশন সফলভাবে সেভ হয়েছে!');
      return true;
    } catch (err) {
      console.error('Error updating category size chart:', err);
      showToast('সাইজ চার্ট সেভ করতে সমস্যা হয়েছে');
      return false;
    }
  };

  // AI Assistant Modal Helpers
  const openAiAssistant = () => setIsAiAssistantOpen(true);
  const closeAiAssistant = () => setIsAiAssistantOpen(false);

  // Size Guide Modal Helpers
  const openSizeGuideModal = (category = 'Lungi') => {
    setSizeGuideCategory(category);
    setIsSizeGuideModalOpen(true);
  };
  const closeSizeGuideModal = () => setIsSizeGuideModalOpen(false);

  // Audit Log
  const addAuditLog = (action: string, details: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      adminName: currentAdmin?.name || 'Admin',
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Cart Management
  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const rawVariant = selectedVariant as any;
    const variantOffer = rawVariant?.offerPrice ?? rawVariant?.offer_price;
    const basePrice = selectedVariant?.price || product.discountPrice || product.price;
    const price = variantOffer && variantOffer > 0 ? variantOffer : basePrice;

    const sku = selectedVariant ? selectedVariant.sku : product.sku;
    const variantSummary = selectedVariant ? `${selectedVariant.color} / ${selectedVariant.size}` : undefined;

    setCart((prev) => {
      const existing = prev.find((item) => item.item.sku === sku);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return prev.map((item) => (item.item.sku === sku ? { ...item, quantity: newQty, item: { ...item.item, quantity: newQty } } : item));
      } else {
        const orderItem: OrderItem = {
          productId: product.id,
          productName: product.name,
          banglaName: product.banglaName,
          variantId: selectedVariant?.id,
          variantSummary,
          sku,
          price,
          quantity,
          image: selectedVariant?.image || product.mainImage,
        };
        return [...prev, { item: orderItem, quantity }];
      }
    });
    setIsCartOpen(true);
    showToast(`ব্যাগ-এ যোগ করা হয়েছে: ${product.banglaName || product.name}`);
  };

  const buyNow = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const rawVariant = selectedVariant as any;
    const variantOffer = rawVariant?.offerPrice ?? rawVariant?.offer_price;
    const basePrice = selectedVariant?.price || product.discountPrice || product.price;
    const price = variantOffer && variantOffer > 0 ? variantOffer : basePrice;

    const sku = selectedVariant ? selectedVariant.sku : product.sku;
    const variantSummary = selectedVariant ? `${selectedVariant.color} / ${selectedVariant.size}` : undefined;

    const orderItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      banglaName: product.banglaName,
      variantId: selectedVariant?.id,
      variantSummary,
      sku,
      price,
      quantity,
      image: selectedVariant?.image || product.mainImage,
    };

    // Direct Buy Mode: isolates this purchase from previously added cart items
    setDirectBuyItem({ item: orderItem, quantity });
    setIsCartOpen(false);
    navigateToCheckout();
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.item.sku !== sku));
    showToast('পণ্যটি ব্যাগ থেকে মুছে ফেলা হয়েছে');
  };

  const updateCartQty = (sku: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart((prev) => prev.map((item) => (item.item.sku === sku ? { ...item, quantity: qty, item: { ...item.item, quantity: qty } } : item)));
  };

  const clearCart = (phone?: string) => {
    setCart([]);
    try {
      localStorage.removeItem('bastra_cart');
    } catch {}
    if (phone) {
      fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      }).catch(() => {});
    }
  };

  const syncCustomerServerCart = async (phone: string) => {
    if (!phone || phone.trim().length < 11) return;
    try {
      const res = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          items: cart.map((c) => ({
            productId: c.item.productId,
            variantId: c.item.variantId,
            quantity: c.quantity,
            price: c.item.price,
          })),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.cart) && data.cart.length > 0) {
        setCart(data.cart);
      }
    } catch (err) {
      console.warn('Customer server cart sync notice:', err);
    }
  };

  const cartSubtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const fetchComboOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/combo-offers');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.comboOffers)) {
        setComboOffers(data.comboOffers);
      }
    } catch (err) {
      console.warn('Failed to fetch combo offers:', err);
    }
  }, []);

  const isProductMatchingCategory = (p: any, catSlug: string): boolean => {
    if (!p || !catSlug) return false;
    const s = catSlug.toLowerCase().trim();
    if (s === 'all') return true;

    const pCat = (p.category || '').toLowerCase().trim();
    const pSub = (p.subCategory || '').toLowerCase().trim();
    const pName = (p.name || '').toLowerCase().trim();
    const pBangla = (p.banglaName || '').toLowerCase().trim();
    const pSlug = (p.slug || '').toLowerCase().trim();

    if (s === 'lungi') {
      return pSub.includes('lungi') || pName.includes('lungi') || pBangla.includes('লুঙ্গি') || pSlug.includes('lungi');
    }
    if (s === 'panjabi') {
      return pSub.includes('panjabi') || pName.includes('panjabi') || pBangla.includes('পাঞ্জাবি') || pSlug.includes('panjabi');
    }
    if (s === 'saree' || s === 'shari') {
      return pSub.includes('saree') || pSub.includes('shari') || pName.includes('saree') || pBangla.includes('শাড়ি') || pBangla.includes('শাড়ি') || pSlug.includes('saree');
    }
    if (s === 't-shirt' || s === 'tshirt') {
      return pSub.includes('shirt') || pName.includes('shirt') || pName.includes('t-shirt') || pBangla.includes('টি-শার্ট') || pSlug.includes('t-shirt');
    }
    if (s === 'three-piece' || s === 'threepiece') {
      return pSub.includes('three') || pName.includes('three') || pBangla.includes('থ্রি-পিস') || pBangla.includes('থ্রিপিস') || pSlug.includes('three-piece');
    }
    if (s === 'gift-box' || s === 'giftbox') {
      return pSub.includes('gift') || pName.includes('gift') || pBangla.includes('গিফট') || pSlug.includes('gift') || pCat.includes('gift');
    }
    if (s === 'others') {
      return pCat === 'others' || pSub.includes('gamcha') || pSub.includes('shawl') || pBangla.includes('গামছা');
    }
    if (s === 'men') {
      return pCat === 'men' || pSub.includes('lungi') || pSub.includes('panjabi') || pSub.includes('shirt');
    }
    if (s === 'women') {
      return pCat === 'women' || pSub.includes('saree') || pSub.includes('three');
    }

    return pSub === s || pCat === s || pName.includes(s) || pSlug.includes(s);
  };

  const getComboDiscountForProduct = useCallback((product: any) => {
    if (!product || !comboOffers || comboOffers.length === 0) return null;
    const activeOffers = comboOffers.filter(
      (c) => c.isActive !== false && (c as any).active !== 0
    );
    if (activeOffers.length === 0) return null;

    // Resolve full product if an OrderItem was passed
    const fullProd = products.find((p) => p.id === (product.productId || product.id)) || product;

    for (const combo of activeOffers) {
      let matches = false;
      const productIds: string[] = Array.isArray(combo.productIds) ? combo.productIds : [];
      if (
        productIds.includes(fullProd.id) ||
        fullProd.id === `combo-${combo.id}` ||
        fullProd.id === combo.id
      ) {
        matches = true;
      }
      const catSlug = (combo.categorySlug || '').toLowerCase().trim();
      if (catSlug && isProductMatchingCategory(fullProd, catSlug)) {
        matches = true;
      }

      if (matches) {
        const pct = Number(
          combo.discountPercent !== undefined && combo.discountPercent !== null
            ? combo.discountPercent
            : ((combo as any).discount_percent || combo.savingsPercent || (combo as any).savings_percent || 20)
        );
        if (pct > 0) {
          const originalPrice = fullProd.price || product.price || 0;
          const discountedPrice = Math.max(0, Math.round(originalPrice * (1 - pct / 100)));
          return {
            hasDiscount: true,
            discountPercent: pct,
            discountBadge: `${pct}% ছাড়`,
            discountedPrice,
            comboOffer: combo,
          };
        }
      }
    }
    return null;
  }, [comboOffers, products]);

  const cartComboDiscount = useMemo(() => {
    let total = 0;
    for (const item of cart) {
      const fullProd = products.find((p) => p.id === item.item.productId) || (item.item as any);
      const info = getComboDiscountForProduct(fullProd);
      if (info && info.hasDiscount) {
        const originalPrice = fullProd.price || item.item.price || 0;
        const perItemDiscount = originalPrice - info.discountedPrice;
        total += Math.max(0, perItemDiscount * item.quantity);
      }
    }
    return total;
  }, [cart, products, getComboDiscountForProduct]);

  // Wishlist Helpers
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('পণ্যটি পছন্দের তালিকা থেকে সরানো হয়েছে');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('পণ্যটি পছন্দের তালিকায় যুক্ত হয়েছে ❤️');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  // Reviews Helpers
  const addProductReview = (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isVerifiedPurchase: true,
    };
    setReviews((prev) => [newRev, ...prev]);

    // Persist to authoritative SQLite backend
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: reviewData.productId,
        customerName: reviewData.customerName,
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
    }).catch((err) => console.warn('Review submission warning:', err));

    showToast('আপনার মূল্যবান রিভিউ ও রেটিং যুক্ত হয়েছে! ধন্যবাদ।');
  };

  // Products CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'> | Product): Promise<boolean> => {
    const id = ('id' in productData && productData.id) ? productData.id : `prod-${Date.now()}`;
    const createdAt = ('createdAt' in productData && productData.createdAt)
      ? productData.createdAt
      : new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...productData,
      id,
      createdAt,
      salesCount: (productData as Product).salesCount || 0,
    };

    // Authoritative backend creation in SQLite
    const raw = newProduct as any;
    let catId = raw.categoryId || raw.category_id;
    const sub = (newProduct.subCategory || (newProduct as any).category || '').toLowerCase();
    if (!catId && categories && categories.length > 0) {
      const matched = categories.find((c) =>
        c.id.toLowerCase() === sub ||
        c.slug.toLowerCase() === sub ||
        c.name.toLowerCase() === sub ||
        sub.includes(c.slug.toLowerCase()) ||
        sub.includes(c.name.toLowerCase())
      );
      if (matched) catId = matched.id;
    }
    if (!catId) {
      if (sub.includes('lungi') || sub.includes('লুঙ্গি')) catId = 'cat-lungi';
      else if (sub.includes('panjabi') || sub.includes('পাঞ্জাবি')) catId = 'cat-panjabi';
      else if (sub.includes('saree') || sub.includes('শাড়ি') || sub.includes('jamdani')) catId = 'cat-saree';
      else if (sub.includes('tshirt') || sub.includes('t-shirt') || sub.includes('টি-শার্ট')) catId = 'cat-tshirt';
      else if (sub.includes('three') || sub.includes('piece') || sub.includes('থ্রি-পিস')) catId = 'cat-three-piece';
      else catId = categories[0]?.id || 'cat-lungi';
    }

    try {
      const res = await adminFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newProduct.id,
          name: newProduct.name,
          banglaName: newProduct.banglaName || newProduct.name,
          slug: newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku: newProduct.sku,
          description: newProduct.description,
          shortDescription: newProduct.shortDescription,
          categoryId: catId,
          subCategory: newProduct.subCategory,
          category: newProduct.category,
          variantConfig: raw.variantConfig || 'color_size',
          price: newProduct.price,
          discountPrice: newProduct.discountPrice,
          lowStockThreshold: newProduct.lowStockThreshold || 5,
          isFeatured: Boolean(newProduct.isFeatured),
          isNewArrival: Boolean(newProduct.isNewArrival),
          isBestSeller: Boolean(newProduct.isBestSeller),
          status: newProduct.status || 'active',
          mainImage: newProduct.mainImage,
          seoTitle: newProduct.seoTitle,
          seoDescription: newProduct.seoDescription,
          sizeChart: (newProduct as any).sizeChart || (newProduct as any).size_chart,
          variants: (newProduct.variants || []).map((v: any) => ({
            id: v.id,
            colorId: v.colorId || null,
            sizeId: v.sizeId || null,
            color: v.color,
            colorCode: v.colorCode,
            size: v.size,
            sku: v.sku,
            price: v.price || newProduct.price,
            offerPrice: v.offerPrice || newProduct.discountPrice || null,
            stock: v.stock !== undefined ? v.stock : 10,
            weight: v.weight || 0.5,
            image: v.image || newProduct.mainImage,
          })),
          colorGalleries: (raw.colorGalleries && Array.isArray(raw.colorGalleries))
            ? raw.colorGalleries
            : (newProduct.colorGalleries
              ? Object.entries(newProduct.colorGalleries).flatMap(([colorName, urls]) =>
                  urls.map((u, idx) => ({
                    colorId: `col-${colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    imageUrl: u,
                    isMain: idx === 0,
                  }))
                )
              : []),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.product || data.productId)) {
        const canonicalProduct = data.product || newProduct;
        setProducts((prev) => [canonicalProduct, ...prev.filter((p) => p.id !== canonicalProduct.id)]);
        // Authoritative refresh from backend to ensure consistent state across tabs & restarts
        await syncAuthoritativeData();
        addAuditLog('Product Added', `Added new product: ${newProduct.name} (${newProduct.sku})`, 'product');
        showToast(data.message || `নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে: ${newProduct.name}`);
        return true;
      } else {
        const errorMsg = data.error || data.message || 'প্রোডাক্ট সংরক্ষণ করতে সমস্যা হয়েছে';
        showToast(errorMsg);
        return false;
      }
    } catch (err: any) {
      console.error('Backend product addition sync error:', err);
      showToast(err?.message || 'প্রোডাক্ট সংরক্ষণ করতে ব্যর্থ হয়েছে। ডাটাবেজ সংযোগ চেক করুন।');
      return false;
    }
  };

  const updateProduct = async (idOrProduct: string | Product, updates?: Partial<Product>): Promise<boolean> => {
    const id = typeof idOrProduct === 'string' ? idOrProduct : idOrProduct.id;
    const finalUpdates = typeof idOrProduct === 'string' ? updates || {} : idOrProduct;

    try {
      const res = await adminFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdates),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const updated = data.product || finalUpdates;
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        await syncAuthoritativeData();
        addAuditLog('Product Updated', `Updated product details for ID ${id}`, 'product');
        showToast(data.message || 'প্রোডাক্ট তথ্য সফলভাবে আপডেট হয়েছে');
        return true;
      } else {
        showToast(data.error || 'প্রোডাক্ট তথ্য আপডেট করতে সমস্যা হয়েছে');
        return false;
      }
    } catch (err: any) {
      console.error('Backend product update error:', err);
      showToast(err?.message || 'প্রোডাক্ট আপডেট করতে ব্যর্থ হয়েছে');
      return false;
    }
  };

  const updateProductStock = (productId: string, newStock: number) => {
    adjustStock(productId, null, newStock, 'adjustment', 'Admin Manual Stock Update');
    adminFetch('/api/admin/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity: newStock,
        reason: 'adjustment',
        note: 'Admin Manual Stock Update',
        isDelta: false,
        adminName: currentAdmin.name || 'Admin',
      }),
    })
      .then(() => syncAuthoritativeData())
      .catch((err) => {
        console.warn('Backend stock adjustment warning:', err);
      });
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const target = products.find((p) => p.id === id);

    try {
      const res = await adminFetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.action === 'deleted') {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          addAuditLog('Product Deleted', `Deleted unreferenced product: ${target?.name || id}`, 'product');
          showToast(data.message || 'প্রোডাক্ট ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে');
        } else {
          setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)));
          addAuditLog('Product Archived', `Product ID ${id} archived to preserve immutable historical order snapshots`, 'product');
          showToast(data.message || 'ঐতিহাসিক অর্ডার রেকর্ড সুরক্ষিত রাখতে পণ্যটি সফলভাবে আর্কাইভ করা হয়েছে');
        }
        syncAuthoritativeData();
        return true;
      } else {
        // Resilient fallback: Always remove product from UI state so user is never blocked
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে');
        syncAuthoritativeData();
        return true;
      }
    } catch (err) {
      console.error('Backend product deletion error:', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে');
      syncAuthoritativeData();
      return true;
    }
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p))
    );
    addAuditLog('Product Archived', `Manually archived product ID ${id}`, 'product');
    showToast('পণ্যটি সফলভাবে আর্কাইভে স্থানান্তর করা হয়েছে');
  };

  const restoreProduct = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/products/${id}/restore`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p)));
        addAuditLog('Product Restored', `Restored product ID ${id} to active catalog`, 'product');
        showToast(data.message || 'পণ্যটি সফলভাবে সক্রিয় ক্যাটালগে রিস্টোর করা হয়েছে');
      } else {
        showToast(data.error || 'পণ্য রিস্টোর করতে সমস্যা হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const toggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'active' ? 'inactive' : 'active';
          addAuditLog('Status Changed', `Product ${p.name} status changed to ${nextStatus}`, 'product');
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const duplicateProduct = (id: string) => {
    const source = products.find((p) => p.id === id);
    if (!source) return;
    const newId = `prod-${Date.now()}`;
    const duplicated: Product = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      banglaName: `${source.banglaName} (কপি)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${source.sku}-CPY`,
      createdAt: new Date().toISOString().split('T')[0],
      salesCount: 0,
    };
    setProducts((prev) => [duplicated, ...prev]);
    addAuditLog('Product Duplicated', `Duplicated ${source.name} to ${duplicated.name}`, 'product');
    showToast(`প্রোডাক্ট কপি করা হয়েছে: ${duplicated.name}`);
  };

  // Categories CRUD
  const addCategory = async (categoryData: Omit<Category, 'id'> | Category) => {
    const id = ('id' in categoryData && categoryData.id) ? categoryData.id : `cat-${Date.now()}`;
    const newCat: Category = { ...categoryData, id };
    setCategories((prev) => {
      const next = [...prev, newCat];
      setNavMenus(buildNavMenusFromCategories(next));
      return next;
    });
    addAuditLog('Category Added', `Created category: ${newCat.name}`, 'settings');
    showToast(`ক্যাটাগরি যুক্ত হয়েছে: ${newCat.name}`);

    try {
      const res = await adminFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.category) {
        setCategories((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, ...data.category } : c));
          setNavMenus(buildNavMenusFromCategories(next));
          return next;
        });
      }
    } catch (err) {
      console.warn('Category backend sync error:', err);
    }
  };

  const updateCategory = async (idOrCategory: string | Category, updates?: Partial<Category>) => {
    const id = typeof idOrCategory === 'string' ? idOrCategory : idOrCategory.id;
    const finalUpdates = typeof idOrCategory === 'string' ? updates || {} : idOrCategory;
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c));
      setNavMenus(buildNavMenusFromCategories(next));
      return next;
    });
    addAuditLog('Category Updated', `Updated category ID: ${id}`, 'settings');
    showToast('ক্যাটাগরি আপডেট হয়েছে');

    try {
      await adminFetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdates),
      });
    } catch (err) {
      console.warn('Category backend update error:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.archived) {
        setCategories((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, isActive: false, isArchived: true } : c));
          setNavMenus(buildNavMenusFromCategories(next));
          return next;
        });
        addAuditLog('Category Archived', `Category ID ${id} linked to products, safely archived`, 'settings');
        showToast(data.message || 'ক্যাটাগরি পণ্যযুক্ত থাকায় নিষ্ক্রিয় (Archived) করা হয়েছে');
      } else {
        setCategories((prev) => {
          const next = prev.filter((c) => c.id !== id);
          setNavMenus(buildNavMenusFromCategories(next));
          return next;
        });
        addAuditLog('Category Deleted', `Deleted category ID: ${id}`, 'settings');
        showToast(data?.message || 'ক্যাটাগরি মুছে ফেলা হয়েছে');
      }
    } catch (err) {
      console.warn('Category backend delete error:', err);
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== id);
        setNavMenus(buildNavMenusFromCategories(next));
        return next;
      });
      showToast('ক্যাটাগরি মুছে ফেলা হয়েছে');
    }
  };

  const reorderCategories = (newOrder: Category[]) => {
    setCategories(newOrder);
  };

  // Navigation Menus
  const updateNavMenus = (menus: NavMenu[]) => {
    setNavMenus(menus);
    persistSettingToBackend('nav_menus', menus);
    addAuditLog('Navigation Updated', 'Header navigation structure reordered/modified', 'settings');
    showToast('হেডার নেভিগেশন সফলভাবে আপডেট হয়েছে');
  };

  const updateNavMenu = (menu: NavMenu) => {
    setNavMenus((prev) => {
      const next = prev.map((m) => (m.id === menu.id ? menu : m));
      persistSettingToBackend('nav_menus', next);
      return next;
    });
    showToast('মেনু সফলভাবে আপডেট হয়েছে');
  };

  const addNavSubItem = (menuId: string, item: { label: string; banglaLabel: string; url: string; categorySlug?: string }) => {
    setNavMenus((prev) => {
      const next = prev.map((menu) => {
        if (menu.id === menuId) {
          const newItem = {
            id: `sub-${Date.now()}`,
            label: item.label,
            banglaLabel: item.banglaLabel,
            url: item.url,
            categorySlug: item.categorySlug || item.url.replace('/category/', ''),
            order: menu.items.length + 1,
            isActive: true,
          };
          return { ...menu, items: [...menu.items, newItem] };
        }
        return menu;
      });
      persistSettingToBackend('nav_menus', next);
      return next;
    });
    showToast(`মেন্যু আইটেম যোগ করা হয়েছে: ${item.label}`);
  };

  const removeNavSubItem = (menuId: string, itemId: string) => {
    setNavMenus((prev) => {
      const next = prev.map((menu) => {
        if (menu.id === menuId) {
          return { ...menu, items: menu.items.filter((it) => it.id !== itemId) };
        }
        return menu;
      });
      persistSettingToBackend('nav_menus', next);
      return next;
    });
  };

  const toggleNavSubItem = (menuId: string, itemId: string) => {
    setNavMenus((prev) => {
      const next = prev.map((menu) => {
        if (menu.id === menuId) {
          return {
            ...menu,
            items: menu.items.map((it) => (it.id === itemId ? { ...it, isActive: !it.isActive } : it)),
          };
        }
        return menu;
      });
      persistSettingToBackend('nav_menus', next);
      return next;
    });
  };

  // Hero Banners
  const addHeroBanner = (bannerData: Omit<HeroBanner, 'id'> | HeroBanner) => {
    const id = ('id' in bannerData && bannerData.id) ? bannerData.id : `hero-${Date.now()}`;
    const newBanner: HeroBanner = { ...bannerData, id };
    setHeroBanners((prev) => [...prev, newBanner]);
    addAuditLog('Banner Added', `Added home hero banner: ${newBanner.title}`, 'banner');
    showToast('হিরো ব্যানার যুক্ত হয়েছে');

    adminFetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner),
    })
      .then(async (res) => {
        if (res.ok) syncAuthoritativeData();
      })
      .catch((err) => console.warn('Banner sync error:', err));
  };

  const updateHeroBanner = (idOrBanner: string | HeroBanner, updates?: Partial<HeroBanner>) => {
    const id = typeof idOrBanner === 'string' ? idOrBanner : idOrBanner.id;
    const finalUpdates = typeof idOrBanner === 'string' ? updates || {} : idOrBanner;
    setHeroBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...finalUpdates } : b)));
    showToast('ব্যানার তথ্য আপডেট হয়েছে');

    adminFetch(`/api/admin/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalUpdates),
    })
      .then(async (res) => {
        if (res.ok) syncAuthoritativeData();
      })
      .catch((err) => console.warn('Banner sync error:', err));
  };

  const deleteHeroBanner = (id: string) => {
    setHeroBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('ব্যানার মুছে ফেলা হয়েছে');

    adminFetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
    })
      .then(async (res) => {
        if (res.ok) syncAuthoritativeData();
      })
      .catch((err) => console.warn('Banner sync error:', err));
  };

  // Category Banners
  const addCategoryBanner = (bannerData: Omit<CategoryBanner, 'id'> | CategoryBanner) => {
    const id = ('id' in bannerData && bannerData.id) ? bannerData.id : `cat-ban-${Date.now()}`;
    const newBanner: CategoryBanner = { ...bannerData, id };
    setCategoryBanners((prev) => {
      const next = [...prev, newBanner];
      persistSettingToBackend('category_banners', next);
      return next;
    });
    showToast('ক্যাটাগরি ব্যানার যুক্ত হয়েছে');
  };

  const saveCategoryBanners = (banners: CategoryBanner[]) => {
    setCategoryBanners(banners);
    persistSettingToBackend('category_banners', banners);
    showToast('সকল ক্যাটাগরি ব্যানার সংরক্ষিত হয়েছে');
  };

  const updateCategoryBanner = (idOrBanner: string | CategoryBanner, updates?: Partial<CategoryBanner>) => {
    const id = typeof idOrBanner === 'string' ? idOrBanner : idOrBanner.id;
    const finalUpdates = typeof idOrBanner === 'string' ? updates || {} : idOrBanner;
    setCategoryBanners((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...finalUpdates } : b));
      persistSettingToBackend('category_banners', next);
      return next;
    });
    showToast('ক্যাটাগরি ব্যানার আপডেট হয়েছে');
  };

  const deleteCategoryBanner = (id: string) => {
    setCategoryBanners((prev) => {
      const next = prev.filter((b) => b.id !== id);
      persistSettingToBackend('category_banners', next);
      return next;
    });
    showToast('ক্যাটাগরি ব্যানার মুছে ফেলা হয়েছে');
  };

  // Size Charts Integration
  const refreshSizeCharts = async () => {
    try {
      const res = await fetch('/api/size-charts');
      const data = await res.json().catch(() => ({}));
      if (data && data.success && Array.isArray(data.charts)) {
        setSizeCharts(data.charts);
      }
    } catch (err) {
      console.warn('Could not refresh size charts:', err);
    }
  };

  const updateSizeCharts = (charts: any[]) => {
    setSizeCharts(charts);
  };

  // Collection Grid
  const updateCollections = (cols: CollectionGridItem[]) => {
    setCollections(cols);
    persistSettingToBackend('home_collections', cols);
    showToast('কালেকশন গ্রিড সফলভাবে সংরক্ষিত হয়েছে');
  };

  const updateCollection = (item: CollectionGridItem) => {
    setCollections((prev) => {
      const next = prev.map((c) => (c.id === item.id ? item : c));
      persistSettingToBackend('home_collections', next);
      return next;
    });
    showToast('কালেকশন গ্রিড আপডেট হয়েছে');
  };

  // Offers
  const updateOfferConfig = (updates: Partial<OfferSectionConfig>) => {
    setOfferConfig((prev) => {
      const next = { ...prev, ...updates };
      persistSettingToBackend('offer_config', next);
      return next;
    });
    addAuditLog('Offer Config Saved', 'Updated festival offer & countdown settings', 'banner');
    showToast('মেগা উৎসব অফার ও টাইমার সেটিংস সংরক্ষিত হয়েছে');
  };

  // Orders
  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderDate' | 'timeline'> & {
      id?: string;
      orderDate?: string;
      timeline?: Order['timeline'];
    },
    fromBackend = false
  ): Order => {
    const orderId = orderData.id || `BS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now =
      orderData.orderDate ||
      new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

    // Capture IMMUTABLE HISTORICAL SNAPSHOTS for all items
    const snapshotItems: OrderItem[] = (orderData.items || []).map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId);
      const variant = prod?.variants?.find((v) => v.id === it.variantId || v.sku === it.sku);
      const unitPrice = it.price ?? (it as any).unitPrice ?? prod?.discountPrice ?? prod?.price ?? 0;
      const originalPrice = prod?.price || unitPrice;
      const discountAmount = prod ? Math.max(0, prod.price - (prod.discountPrice || prod.price)) : 0;

      return {
        id: it.id || `oi-${Date.now()}-${idx}`,
        orderId,
        productId: it.productId,
        productName: it.productName || prod?.name || 'Product',
        banglaName: it.banglaName || prod?.banglaName || '',
        variantId: variant?.id || it.variantId,
        variantSummary: it.variantSummary || (variant ? `${variant.color} / ${variant.size}` : undefined),
        sku: variant?.sku || prod?.sku || it.sku || '',
        price: unitPrice, // Immutable snapshot of price paid at purchase
        originalPrice,
        discountAmount,
        quantity: it.quantity || 1,
        totalPrice: it.totalPrice ?? unitPrice * (it.quantity || 1),
        image: it.image || variant?.image || prod?.mainImage || '',
        attributesSnapshot: {
          color: variant?.color || (it as any).color,
          size: variant?.size || (it as any).size,
          category: prod?.category,
          subCategory: prod?.subCategory,
        },
      };
    });

    const initialStatusHistory: OrderStatusHistory = {
      id: `osh-${Date.now()}`,
      orderId,
      fromStatus: 'pending',
      toStatus: orderData.orderStatus || 'pending',
      changedBy: currentCustomer ? currentCustomer.name : 'Customer',
      changeReason: 'অর্ডার প্লেস করা হয়েছে (Website Checkout)',
      timestamp: now,
    };

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      items: snapshotItems,
      orderDate: now,
      timeline:
        orderData.timeline && orderData.timeline.length > 0
          ? orderData.timeline
          : [
              {
                date: now,
                status: orderData.orderStatus || 'pending',
                note: 'অর্ডার প্লেস করা হয়েছে (Website Order Created)',
              },
            ],
      statusHistory: [initialStatusHistory],
    };

    setOrders((prev) => (prev.some((o) => o.id === orderId) ? prev : [newOrder, ...prev]));

    // Update customer stats
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === newOrder.customerPhone);
      if (existing) {
        return prev.map((c) =>
          c.phone === newOrder.customerPhone
            ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + newOrder.total }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          email: newOrder.customerEmail || '',
          address: newOrder.deliveryAddress,
          district: newOrder.district,
          registrationDate: new Date().toISOString().split('T')[0],
          totalOrders: 1,
          totalSpent: newOrder.total,
          status: 'active',
        };
        return [newCust, ...prev];
      }
    });

    // Update local UI stock immediately (server already persisted if fromBackend === true)
    snapshotItems.forEach((it) => {
      const resolvedVarId = it.variantId && it.variantId !== 'default' ? it.variantId : null;
      adjustStock(it.productId, resolvedVarId, -it.quantity, 'order_placed', `Order #${orderId}`, true);
    });

    if (!fromBackend) {
      addAuditLog('New Order', `Order #${orderId} received from ${newOrder.customerName} (৳${newOrder.total})`, 'order');
    }
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string, actor?: string) => {
    const now = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Backend transactional state transition
    adminFetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newStatus,
        note: note || `Status updated to ${newStatus}`,
        adminName: actor || currentAdmin?.name || 'Admin',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success && data.error) {
          showToast(`সার্ভার এরর: ${data.error}`);
        }
      })
      .catch((err) => {
        console.warn('Backend order status update warning:', err);
      });

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          // Status machine validation:
          if (ord.orderStatus === 'cancelled' && newStatus !== 'cancelled') {
            showToast('বাতিলকৃত অর্ডার সক্রিয় করা যাবে না');
            return ord;
          }
          if (ord.orderStatus === 'returned' && newStatus !== 'returned') {
            showToast('রিটার্ন সম্পন্ন অর্ডার রিওপেন করা যাবে না');
            return ord;
          }

          const statusNote = note || `Status updated to ${newStatus}`;
          const updatedTimeline = [
            ...ord.timeline,
            { date: now, status: newStatus, note: statusNote, actor: actor || currentAdmin?.name || 'Admin' },
          ];

          const historyEntry: OrderStatusHistory = {
            id: `osh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orderId,
            fromStatus: ord.orderStatus,
            toStatus: newStatus,
            changedBy: actor || currentAdmin?.name || 'Admin',
            changeReason: statusNote,
            timestamp: now,
          };

          return {
            ...ord,
            orderStatus: newStatus,
            timeline: updatedTimeline,
            statusHistory: [...(ord.statusHistory || []), historyEntry],
          };
        }
        return ord;
      })
    );

    addAuditLog('Order Status', `Order #${orderId} moved to ${newStatus}`, 'order');
    showToast(`অর্ডার #${orderId} স্ট্যাটাস পরিবর্তন হয়েছে: ${newStatus}`);
  };

  // Return Management System
  const requestOrderReturn = (
    orderId: string,
    returnData: {
      reason: string;
      reasonCode: ReturnReasonCode;
      items: Array<{ orderItemId?: string; productId: string; variantId?: string; quantity: number; condition?: ReturnCondition }>;
      details?: string;
    }
  ): OrderReturn => {
    const returnId = `RET-${Date.now().toString().slice(-4)}`;
    const now = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const targetOrder = orders.find((o) => o.id === orderId);
    let totalRefund = 0;

    const returnItems: ReturnItem[] = returnData.items.map((it, idx) => {
      const orderItem = targetOrder?.items.find(
        (oi) => (it.orderItemId && oi.id === it.orderItemId) || (oi.productId === it.productId && (!it.variantId || oi.variantId === it.variantId))
      );
      const unitPrice = orderItem ? orderItem.price : 0;
      const refundAmt = unitPrice * it.quantity;
      totalRefund += refundAmt;

      return {
        id: `ri-${Date.now()}-${idx}`,
        returnId,
        orderItemId: it.orderItemId || orderItem?.id,
        productId: it.productId,
        variantId: it.variantId,
        productName: orderItem?.productName || 'Product',
        sku: orderItem?.sku || '',
        variantSummary: orderItem?.variantSummary,
        quantity: it.quantity,
        unitPrice,
        refundAmount: refundAmt,
        condition: it.condition || 'sellable',
        restocked: false,
      };
    });

    const newReturn: OrderReturn = {
      id: returnId,
      orderId,
      customerName: targetOrder?.customerName || '',
      customerPhone: targetOrder?.customerPhone || '',
      reason: returnData.reason,
      reasonCode: returnData.reasonCode,
      details: returnData.details,
      status: 'requested',
      items: returnItems,
      totalRefundAmount: totalRefund,
      refundStatus: 'pending',
      createdAt: now,
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedTimeline = [
            ...ord.timeline,
            { date: now, status: 'return_requested', note: `রিটার্ন অনুরোধ: ${returnData.reason}`, actor: 'Customer' },
          ];
          const historyEntry: OrderStatusHistory = {
            id: `osh-${Date.now()}`,
            orderId,
            fromStatus: ord.orderStatus,
            toStatus: 'return_requested',
            changedBy: ord.customerName || 'Customer',
            changeReason: `রিটার্ন আবেদন (${returnData.reason})`,
            timestamp: now,
          };
          return {
            ...ord,
            orderStatus: 'return_requested',
            returnRequests: [...(ord.returnRequests || []), newReturn],
            timeline: updatedTimeline,
            statusHistory: [...(ord.statusHistory || []), historyEntry],
          };
        }
        return ord;
      })
    );

    addAuditLog('Return Requested', `Return #${returnId} requested for Order #${orderId}`, 'order');
    showToast(`অর্ডার #${orderId} এর জন্য রিটার্ন আবেদন জমা নেওয়া হয়েছে`);
    return newReturn;
  };

  const processOrderReturn = (
    returnId: string,
    status: ReturnWorkflowStatus,
    options?: {
      condition?: ReturnCondition;
      restock?: boolean;
      refundAmount?: number;
      refundMethod?: PaymentMethod | 'wallet' | 'cash';
      refundTxnId?: string;
      adminNotes?: string;
    }
  ) => {
    const now = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((ord) => {
        const retReq = ord.returnRequests?.find((r) => r.id === returnId);
        if (!retReq) return ord;

        const updatedReturns = (ord.returnRequests || []).map((r) => {
          if (r.id === returnId) {
            const updatedItems = r.items.map((item) => {
              const itemCondition = options?.condition || item.condition;
              const shouldRestock = options?.restock !== undefined ? options.restock : itemCondition === 'sellable';

              // If completing and restock requested, restock atomically into inventory
              if (status === 'completed' && shouldRestock && !item.restocked) {
                adjustStock(
                  item.productId,
                  item.variantId || null,
                  item.quantity,
                  'return',
                  `Customer Return Restock (Sellable: Return #${returnId})`,
                  true
                );
                return {
                  ...item,
                  condition: itemCondition,
                  restocked: true,
                  restockedAt: now,
                };
              } else if (status === 'completed' && itemCondition !== 'sellable' && !item.damagedLogged) {
                // Log inventory damage write-off without adding to sellable stock
                const tx: InventoryTransaction = {
                  id: `inv-dmg-${Date.now()}`,
                  productId: item.productId,
                  productName: item.productName,
                  variantSummary: item.variantSummary,
                  sku: item.sku,
                  previousStock: 0,
                  newStock: 0,
                  difference: 0,
                  reason: 'damaged',
                  timestamp: now,
                  performedBy: `Damaged Return Loss: Return #${returnId} (${itemCondition})`,
                };
                setInventoryTransactions((txs) => [tx, ...txs]);
                return {
                  ...item,
                  condition: itemCondition,
                  damagedLogged: true,
                };
              }

              return {
                ...item,
                condition: itemCondition,
              };
            });

            return {
              ...r,
              status,
              items: updatedItems,
              adminNotes: options?.adminNotes || r.adminNotes,
              processedAt: now,
              refundStatus: status === 'completed' ? 'processed' : (status === 'rejected' ? 'rejected' : r.refundStatus),
              refundMethod: options?.refundMethod || r.refundMethod,
              refundTxnId: options?.refundTxnId || r.refundTxnId,
              totalRefundAmount: options?.refundAmount !== undefined ? options.refundAmount : r.totalRefundAmount,
            };
          }
          return r;
        });

        // If return is completed, update order status and payment status
        let updatedOrderStatus = ord.orderStatus;
        let updatedPaymentStatus = ord.paymentStatus;
        const refundAmt = options?.refundAmount !== undefined ? options.refundAmount : retReq.totalRefundAmount;

        if (status === 'completed') {
          updatedOrderStatus = 'returned';
          updatedPaymentStatus = refundAmt >= ord.total ? 'refunded' : 'partially_refunded';
        }

        const updatedTimeline = [
          ...ord.timeline,
          {
            date: now,
            status: status === 'completed' ? 'returned' : `return_${status}`,
            note: `রিটার্ন #${returnId} স্ট্যাটাস: ${status} ${options?.adminNotes ? `(${options.adminNotes})` : ''}`,
            actor: currentAdmin?.name || 'Admin',
          },
        ];

        return {
          ...ord,
          orderStatus: updatedOrderStatus,
          paymentStatus: updatedPaymentStatus,
          refundAmount: refundAmt,
          refundTxnId: options?.refundTxnId || ord.refundTxnId,
          returnRequests: updatedReturns,
          timeline: updatedTimeline,
        };
      })
    );

    addAuditLog('Return Processed', `Return #${returnId} updated to ${status}`, 'order');
    showToast(`রিটার্ন #${returnId} সফলভাবে প্রসেস করা হয়েছে (${status})`);
  };

  const updatePaymentStatus = (orderId: string, newStatus: PaymentStatus, txnId?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentStatus: newStatus,
            paymentTxnId: txnId || ord.paymentTxnId,
          };
        }
        return ord;
      })
    );
    showToast(`পেমেন্ট স্ট্যাটাস আপডেট হয়েছে: ${newStatus}`);
  };

  const updateOrderPayment = (orderId: string, status: PaymentStatus, txnId?: string) => {
    updatePaymentStatus(orderId, status, txnId);
  };

  const updateOrderAdminNotes = (orderId: string, notes: string) => {
    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, adminNotes: notes } : ord)));
    showToast('এডমিন নোট সংরক্ষিত হয়েছে');
  };

  const addAdminNoteToOrder = (orderId: string, note: string) => {
    updateOrderAdminNotes(orderId, note);
  };

  // Inventory & Stock Adjustment
  const adjustStock = (
    productId: string,
    variantId: string | null,
    stockOrDelta: number,
    reason: InventoryTransaction['reason'],
    customNote?: string,
    isDelta = false
  ) => {
    let prodName = '';
    let sku = '';
    let variantSummary = '';
    let prevStock = 0;
    let newStock = 0;
    let diff = 0;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          prodName = p.name;
          if (variantId && p.variants && p.variants.length > 0) {
            const updatedVariants = p.variants.map((v) => {
              if (v.id === variantId) {
                sku = v.sku;
                variantSummary = `${v.color} / ${v.size}`;
                prevStock = v.stock;
                newStock = isDelta ? Math.max(0, v.stock + stockOrDelta) : Math.max(0, stockOrDelta);
                diff = newStock - prevStock;
                return { ...v, stock: newStock };
              }
              return v;
            });
            const totalStock = updatedVariants.reduce((s, v) => s + v.stock, 0);
            return { ...p, variants: updatedVariants, stock: totalStock };
          } else {
            sku = p.sku;
            prevStock = p.stock;
            newStock = isDelta ? Math.max(0, p.stock + stockOrDelta) : Math.max(0, stockOrDelta);
            diff = newStock - prevStock;
            return { ...p, stock: newStock };
          }
        }
        return p;
      })
    );

    // Record Transaction
    const tx: InventoryTransaction = {
      id: `inv-${Date.now()}-${Math.random().toString().slice(-3)}`,
      productId,
      productName: prodName,
      variantSummary: variantSummary || undefined,
      sku,
      previousStock: prevStock,
      newStock,
      difference: diff,
      reason,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      performedBy: customNote || currentAdmin?.name || 'Admin',
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
    if (!isDelta) {
      addAuditLog('Stock Adjusted', `Stock for ${prodName} (${sku}): ${prevStock} -> ${newStock}`, 'inventory');
      showToast(`স্টক সফলভাবে অ্যাডজাস্ট করা হয়েছে (${sku}: ${newStock} pcs)`);
    }
  };

  // Customers
  const toggleCustomerStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c))
    );
  };

  const updateCustomer = (customerOrId: Customer | string, updates?: Partial<Customer>) => {
    const id = typeof customerOrId === 'string' ? customerOrId : customerOrId.id;
    const finalUpdates = typeof customerOrId === 'string' ? updates || {} : customerOrId;
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c)));
    showToast('কাস্টমার তথ্য আপডেট হয়েছে');
  };

  // Customer Auth & Portal handlers
  const openCustomerAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setIsCustomerAuthModalOpen(true);
  };

  const closeCustomerAuthModal = () => {
    setIsCustomerAuthModalOpen(false);
  };

  const openCustomerAccountModal = () => {
    setIsCustomerAccountModalOpen(true);
  };

  const closeCustomerAccountModal = () => {
    setIsCustomerAccountModalOpen(false);
  };

  const customerLogin = (phoneOrEmail: string, password?: string) => {
    const cleanQuery = phoneOrEmail.trim().toLowerCase();
    const cleanDigits = phoneOrEmail.replace(/[^0-9]/g, '');

    const found = customers.find((c) => {
      const cDigits = c.phone.replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 6 && cDigits.includes(cleanDigits);
      const matchEmail = c.email && c.email.toLowerCase() === cleanQuery;
      return matchPhone || matchEmail;
    });

    if (!found) {
      // If customer not found, auto-create or notify
      return {
        success: false,
        message: 'এই ফোন নম্বর অথবা ইমেইল দিয়ে কোনো গ্রাহক একাউন্ট পাওয়া যায়নি। দয়া করে নতুন নিবন্ধন করুন।',
      };
    }

    if (found.status === 'blocked') {
      return {
        success: false,
        message: 'আপনার একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। হেল্পলাইনে যোগাযোগ করুন।',
      };
    }

    setCurrentCustomer(found);
    try {
      localStorage.setItem('bastra_current_customer', JSON.stringify(found));
    } catch {}
    setIsCustomerAuthModalOpen(false);
    showToast(`স্বাগতম, ${found.name}! আপনি সফলভাবে লগইন করেছেন।`);
    if (found.phone) {
      syncCustomerServerCart(found.phone);
    }
    return { success: true, message: 'সফলভাবে লগইন হয়েছে' };
  };

  const customerRegister = (data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    district?: string;
    upazila?: string;
    country?: string;
    countryCode?: string;
  }) => {
    const cleanDigits = data.phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      return { success: false, message: 'সঠিক মোবাইল নম্বর (১১ ডিজিট) প্রদান করুন।' };
    }

    const existing = customers.find(
      (c) => c.phone.replace(/[^0-9]/g, '') === cleanDigits
    );

    if (existing) {
      // Already exists, log them in
      setCurrentCustomer(existing);
      try {
        localStorage.setItem('bastra_current_customer', JSON.stringify(existing));
      } catch {}
      setIsCustomerAuthModalOpen(false);
      showToast(`আপনার একাউন্ট পূর্বেই ছিলো, সফলভাবে লগইন করা হয়েছে।`);
      syncCustomerServerCart(existing.phone);
      return { success: true, message: 'পূর্ববর্তী একাউন্টে লগইন হয়েছে' };
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      address: data.address?.trim() || '',
      district: data.district || 'ঢাকা',
      upazila: data.upazila || '',
      country: data.country || 'Bangladesh',
      countryCode: data.countryCode || 'BD',
      registrationDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentCustomer(newCustomer);
    try {
      localStorage.setItem('bastra_current_customer', JSON.stringify(newCustomer));
    } catch {}

    // Persist registered customer into SQLite backend API
    fetch('/api/customers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    }).catch(() => {});

    setIsCustomerAuthModalOpen(false);
    showToast(`অভিনন্দন ${newCustomer.name}! আপনার বস্ত্র শৈলী (BOSTROSHOILY) একাউন্ট সফলভাবে তৈরি হয়েছে।`);
    syncCustomerServerCart(newCustomer.phone);
    return { success: true, message: 'একাউন্ট সফলভাবে তৈরি হয়েছে' };
  };

  const customerLogout = () => {
    setCurrentCustomer(null);
    try {
      localStorage.removeItem('bastra_current_customer');
    } catch {}
    setIsCustomerAccountModalOpen(false);
    showToast('আপনি লগআউট করেছেন।');
  };

  const updateCurrentCustomerProfile = (updates: Partial<Customer>) => {
    if (!currentCustomer) return;
    const updated = { ...currentCustomer, ...updates };
    setCurrentCustomer(updated);
    try {
      localStorage.setItem('bastra_current_customer', JSON.stringify(updated));
    } catch {}
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
  };

  const updateHomePageSectionsConfig = (
    updates: Partial<{
      newArrivalsMode: 'automatic' | 'manual';
      newArrivalsLimit: number;
      bestSellersMode: 'automatic' | 'manual';
      bestSellersLimit: number;
    }>
  ) => {
    setHomePageSectionsConfig((prev) => ({ ...prev, ...updates }));
    showToast('হোমপেজ সেকশন কনফিগারেশন আপডেট হয়েছে');
  };

  // Coupons
  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'usedCount'> | Coupon) => {
    const id = ('id' in couponData && couponData.id) ? couponData.id : `cp-${Date.now()}`;
    const newCoupon: Coupon = { ...couponData, id, usedCount: (couponData as Coupon).usedCount || 0 };
    setCoupons((prev) => [newCoupon, ...prev]);
    addAuditLog('Coupon Added', `Created coupon code: ${newCoupon.code}`, 'settings');
    showToast(`নতুন কুপন কোড তৈরি হয়েছে: ${newCoupon.code}`);

    try {
      await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      syncAuthoritativeData();
    } catch (err) {
      console.warn('Coupon addition sync warning:', err);
    }
  };

  const updateCoupon = async (idOrCoupon: string | Coupon, updates?: Partial<Coupon>) => {
    const id = typeof idOrCoupon === 'string' ? idOrCoupon : idOrCoupon.id;
    const finalUpdates = typeof idOrCoupon === 'string' ? updates || {} : idOrCoupon;

    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c)));
    addAuditLog('Coupon Updated', `Updated coupon code: ${typeof idOrCoupon === 'object' ? idOrCoupon.code : id}`, 'settings');
    showToast('কুপন সফলভাবে সেভ হয়েছে');

    try {
      await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdates),
      });
      syncAuthoritativeData();
    } catch (err) {
      console.warn('Coupon update sync warning:', err);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('কুপন মুছে ফেলা হয়েছে');

    try {
      await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      syncAuthoritativeData();
    } catch (err) {
      console.warn('Coupon delete sync warning:', err);
    }
  };

  const applyCoupon = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discount: 0, message: 'অনুগ্রহ করে কুপন কোড প্রদান করুন।' };
    }

    const found = coupons.find((c: any) => {
      const cCode = (c.code || '').toUpperCase().trim();
      const isExplicitlyInactive =
        c.isActive === false ||
        c.active === 0 ||
        c.status === 'inactive' ||
        c.status === 'disabled' ||
        c.status === 0;

      const isActive = !isExplicitlyInactive;
      return cCode === cleanCode && isActive;
    });

    if (!found) {
      return { valid: false, discount: 0, message: 'কুপন কোডটি সঠিক নয়, নিষ্ক্রিয় অথবা মেয়াদ শেষ।' };
    }

    const raw: any = found;
    const now = new Date();
    const expiryDateStr = (raw.expiryDate || raw.expiry_date || '').trim();
    const expiryTimeStr = raw.expiryTime || raw.expiry_time || '23:59';

    if (expiryDateStr) {
      const expiryDateTime = new Date(`${expiryDateStr}T${expiryTimeStr}:00`);
      if (!isNaN(expiryDateTime.getTime()) && now > expiryDateTime) {
        return { valid: false, discount: 0, message: 'এই কুপনের মেয়াদ উত্তীর্ণ হয়েছে।' };
      }
    }

    const usageLimit = Number(raw.usageLimit ?? raw.usage_limit ?? 0);
    const usedCount = Number(raw.usedCount ?? raw.used_count ?? 0);
    if (usageLimit > 0 && usedCount >= usageLimit) {
      return { valid: false, discount: 0, message: 'দুঃখিত, এই কুপনটির সর্বোচ্চ ব্যবহারের সীমা পূর্ণ হয়ে গেছে।' };
    }

    const minOrder = Number(raw.minOrderAmount ?? raw.min_order_amount ?? 0);
    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `এই কুপন ব্যবহারের জন্য সর্বনিম্ন ৳${minOrder} টাকার অর্ডার করতে হবে।`,
      };
    }

    let discount = 0;
    const discType = String(raw.discountType || raw.discount_type || 'fixed').toLowerCase();
    const discVal = Number(raw.discountValue ?? raw.discount_value ?? 0);
    const maxDisc = Number(raw.maxDiscountAmount ?? raw.max_discount_amount ?? 0);

    if (discType === 'percentage' || discType === 'percent') {
      discount = Math.round((subtotal * discVal) / 100);
      if (maxDisc > 0 && discount > maxDisc) {
        discount = maxDisc;
      }
    } else {
      discount = discVal;
    }

    if (discount <= 0) {
      return { valid: false, discount: 0, message: 'কুপন ছাড় গণনা করা সম্ভব হয়নি।' };
    }

    return {
      valid: true,
      discount,
      message: `কুপন (${cleanCode}) সফলভাবে যুক্ত হয়েছে! ৳${discount} ছাড় পেয়েছেন।`,
      coupon: found,
    };
  };

  // Delivery & Payment
  const updateDeliveryConfig = (cfg: DeliveryConfig) => {
    setDeliveryConfig(cfg);
    persistSettingToBackend('delivery_config', cfg);
    addAuditLog('Delivery Settings', 'Updated delivery charges & thresholds', 'settings');
    showToast('ডেলিভারি চার্জ ও নিয়ম সফলভাবে সেভ হয়েছে');
  };

  const updatePaymentConfig = (cfg: PaymentConfig) => {
    setPaymentConfig(cfg);
    persistSettingToBackend('payment_config', cfg);
    addAuditLog('Payment Settings', 'Updated payment gateway configurations', 'settings');
    showToast('পেমেন্ট মেথড কনফিগারেশন আপডেট হয়েছে');
  };

  const updateInvoiceConfig = (cfg: InvoiceConfig) => {
    setInvoiceConfig(cfg);
    persistSettingToBackend('invoice_config', cfg);
    addAuditLog('Invoice Settings', 'Updated invoice text, terms & rules', 'settings');
    showToast('ইনভয়েস সেটিংস ও শর্তাবলী সফলভাবে সেভ হয়েছে');
  };

  // Product Page Settings
  const [productPageSettings, setProductPageSettings] = useState<ProductPageSettings>({
    showSku: true,
    showStockCount: true,
    showShareButton: true,
    showSizeGuide: true,
  });

  const updateProductPageSettings = (settings: ProductPageSettings) => {
    setProductPageSettings(settings);
    persistSettingToBackend('pdp_settings', settings);
    showToast('প্রোডাক্ট পেজ সেটিংস আপডেট হয়েছে');
  };

  // CMS
  const updateHowToOrderSteps = (steps: CMSStep[]) => {
    setHowToOrderSteps(steps);
    persistSettingToBackend('cms_how_to_order', steps);
    addAuditLog('CMS Updated', 'Updated "How to Order" steps', 'cms');
    showToast('"কিভাবে অর্ডার করবেন" সেকশন আপডেট হয়েছে');
  };

  const updateHowToOrderStep = (step: CMSStep) => {
    setHowToOrderSteps((prev) => {
      const updated = prev.map((s) => (s.stepNumber === step.stepNumber ? step : s));
      persistSettingToBackend('cms_how_to_order', updated);
      return updated;
    });
    showToast('অর্ডার সহায়িকা তথ্য আপডেট হয়েছে');
  };

  const addClothingVideo = (item: Omit<ClothingVideoItem, 'id'> | ClothingVideoItem) => {
    const id = ('id' in item && item.id) ? item.id : `vid-${Date.now()}`;
    setClothingVideos((prev) => {
      const updated = [...prev, { ...item, id }];
      persistSettingToBackend('clothing_videos', updated);
      return updated;
    });
    showToast('নতুন ভিডিও গাইড যুক্ত হয়েছে');
  };

  const updateClothingVideo = (id: string, updates: Partial<ClothingVideoItem>) => {
    setClothingVideos((prev) => {
      const updated = prev.map((v) => (v.id === id ? { ...v, ...updates } : v));
      persistSettingToBackend('clothing_videos', updated);
      return updated;
    });
    showToast('ভিডিও গাইড তথ্য আপডেট হয়েছে');
  };

  const deleteClothingVideo = (id: string) => {
    setClothingVideos((prev) => {
      const updated = prev.filter((v) => v.id !== id);
      persistSettingToBackend('clothing_videos', updated);
      return updated;
    });
  };

  // Clothing Stories aliases
  const clothingStories = clothingVideos;
  const addClothingStory = (item: ClothingVideoItem) => addClothingVideo(item);
  const updateClothingStory = (item: ClothingVideoItem) => updateClothingVideo(item.id, item);
  const deleteClothingStory = (id: string) => deleteClothingVideo(id);

  // Brand & Artisan Partner Stories
  const addBrandPartnerStory = (story: Omit<BrandPartnerStory, 'id'> | BrandPartnerStory) => {
    const id = ('id' in story && story.id) ? story.id : `story-${Date.now()}`;
    const newStory: BrandPartnerStory = { ...story, id };
    setBrandPartnerStories((prev) => {
      const updated = [...prev, newStory];
      persistSettingToBackend('brand_partner_stories', updated);
      return updated;
    });
    addAuditLog('Partner Story Added', `Added brand partner story: ${newStory.title}`, 'cms');
    showToast('নতুন ঐতিহ্য ও ব্র্যান্ড পার্টনার কার্ড যুক্ত হয়েছে');
  };

  const updateBrandPartnerStory = (id: string, updates: Partial<BrandPartnerStory>) => {
    setBrandPartnerStories((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persistSettingToBackend('brand_partner_stories', updated);
      return updated;
    });
    addAuditLog('Partner Story Updated', `Updated brand partner story ${id}`, 'cms');
    showToast('ঐতিহ্য ও পার্টনার তথ্য আপডেট হয়েছে');
  };

  const deleteBrandPartnerStory = (id: string) => {
    setBrandPartnerStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistSettingToBackend('brand_partner_stories', updated);
      return updated;
    });
    addAuditLog('Partner Story Deleted', `Deleted brand partner story ${id}`, 'cms');
    showToast('পার্টনার কার্ড মুছে ফেলা হয়েছে');
  };

  const saveBrandPartnerStories = (stories: BrandPartnerStory[]) => {
    setBrandPartnerStories(stories);
    persistSettingToBackend('brand_partner_stories', stories);
    addAuditLog('Partner Stories Saved', 'Saved all brand & artisan partner stories', 'cms');
    showToast('সকল ঐতিহ্য ও পার্টনার স্লাইড সেভ হয়েছে');
  };

  // Mega Festive Offers
  const addMegaFestiveOffer = (offer: Omit<CategoryOfferItem, 'id'> | CategoryOfferItem) => {
    const id = ('id' in offer && offer.id) ? offer.id : `off-${Date.now()}`;
    const newOffer: CategoryOfferItem = { ...offer, id };
    setMegaFestiveOffers((prev) => {
      const updated = [...prev, newOffer];
      persistSettingToBackend('mega_festive_offers', updated);
      return updated;
    });
    addAuditLog('Mega Festive Offer Added', `Added offer: ${newOffer.headline}`, 'banner');
    showToast('নতুন মেগা উৎসব অফার সফলভাবে যুক্ত হয়েছে');
  };

  const updateMegaFestiveOffer = (id: string, updates: Partial<CategoryOfferItem>) => {
    setMegaFestiveOffers((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
      persistSettingToBackend('mega_festive_offers', updated);
      return updated;
    });
    addAuditLog('Mega Festive Offer Updated', `Updated offer ${id}`, 'banner');
    showToast('মেগা উৎসব অফার আপডেট করা হয়েছে');
  };

  const deleteMegaFestiveOffer = (id: string) => {
    setMegaFestiveOffers((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      persistSettingToBackend('mega_festive_offers', updated);
      return updated;
    });
    addAuditLog('Mega Festive Offer Deleted', `Deleted offer ${id}`, 'banner');
    showToast('মেগা উৎসব অফার মুছে ফেলা হয়েছে');
  };

  const saveMegaFestiveOffers = (offers: CategoryOfferItem[]) => {
    setMegaFestiveOffers(offers);
    persistSettingToBackend('mega_festive_offers', offers);
    addAuditLog('Mega Festive Offers Saved', 'Saved all mega festival offer slides', 'banner');
    showToast('সকল মেগা উৎসব অফার সংরক্ষিত হয়েছে');
  };

  // Blog
  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'publishedAt'>) => {
    const id = `blog-${Date.now()}`;
    const newPost: BlogPost = {
      ...postData,
      id,
      publishedAt: new Date().toISOString().split('T')[0],
    };
    setBlogPosts((prev) => [newPost, ...prev]);
    showToast('ব্লগ পোস্ট সফলভাবে প্রকাশ করা হয়েছে');
  };

  const updateBlogPost = (id: string, updates: Partial<BlogPost>) => {
    setBlogPosts((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    showToast('ব্লগ পোস্ট আপডেট হয়েছে');
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((b) => b.id !== id));
  };

  // Footer & SEO
  const updateFooterConfig = (cfg: FooterConfig) => {
    setFooterConfig(cfg);
    persistSettingToBackend('footer_config', cfg);
    showToast('ফুটার তথ্য, লিংক ও পলিসি সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const updateSEOConfig = (cfg: SEOConfig) => {
    setSEOConfig(cfg);
    persistSettingToBackend('seo_config', cfg);
    showToast('এসইও মেটা সেটিংস আপডেট হয়েছে');
  };

  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    try {
      const saved = localStorage.getItem('bastra_general_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      siteName: 'BOSTROSHOILY | বস্ত্র শৈলী',
      tagline: 'বাংলাদেশের ঐতিহ্য ও আধুনিকতার বিশ্বস্ত মেলবন্ধন।',
      phone: '+880 1864-528488',
      email: 'bostroshoily@gmail.com',
      address: 'বস্ত্র শৈলী ভবন, শাহজাদপুর, সিরাজগঞ্জ, বাংলাদেশ',
      facebookUrl: 'https://facebook.com/bostroshoily',
      instagramUrl: 'https://instagram.com/bostroshoily',
      whatsappNumber: '+8801864528488',
      logoUrl: '',
    };
  });

  const updateGeneralSettings = (settings: GeneralSettings) => {
    setGeneralSettings(settings);
    persistSettingToBackend('general_settings', settings);
    setFooterConfig((prev) => ({
      ...prev,
      address: settings.address || settings.storeAddress || prev.address,
      phone: settings.phone || settings.helplinePhone || prev.phone,
      email: settings.email || settings.storeEmail || prev.email,
      facebookUrl: settings.facebookUrl || prev.facebookUrl,
      instagramUrl: settings.instagramUrl || prev.instagramUrl,
      aboutUs: settings.tagline || settings.storeDescription || prev.aboutUs,
    }));
    addAuditLog('General Settings', 'Updated website contact & store info', 'settings');
    showToast('সাধারণ সেটিংস সফলভাবে আপডেট হয়েছে');
  };

  // Store Design & Visual Theme Settings
  const [storeDesign, setStoreDesign] = useState<StoreDesignSettings>(() => {
    try {
      const saved = localStorage.getItem('bastra_store_design');
      if (saved) return { ...DEFAULT_STORE_DESIGN, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_STORE_DESIGN;
  });

  const updateStoreDesign = async (settings: Partial<StoreDesignSettings>): Promise<boolean> => {
    try {
      const updated = { ...storeDesign, ...settings };
      setStoreDesign(updated);
      try { localStorage.setItem('bastra_store_design', JSON.stringify(updated)); } catch {}
      const res = await adminFetch('/api/admin/store-design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        showToast('স্টোর ডিজাইন সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to update store design:', err);
      return false;
    }
  };

  // Synchronize dynamic CSS theme variables with document.documentElement (Phase 2)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (storeDesign.siteBgColor) root.style.setProperty('--site-bg', storeDesign.siteBgColor);
    if (storeDesign.cardBgColor) root.style.setProperty('--card-bg', storeDesign.cardBgColor);
    if (storeDesign.headerBgColor) root.style.setProperty('--header-bg', storeDesign.headerBgColor);
    if (storeDesign.footerBgColor) root.style.setProperty('--footer-bg', storeDesign.footerBgColor);
    if (storeDesign.textPrimaryColor) root.style.setProperty('--text-primary', storeDesign.textPrimaryColor);
    if (storeDesign.textSecondaryColor) root.style.setProperty('--text-secondary', storeDesign.textSecondaryColor);
    if (storeDesign.linkColor) root.style.setProperty('--link-color', storeDesign.linkColor);
    if (storeDesign.buttonBgColor) root.style.setProperty('--btn-bg', storeDesign.buttonBgColor);
    if (storeDesign.buttonTextColor) root.style.setProperty('--btn-text', storeDesign.buttonTextColor);
  }, [storeDesign]);

  // Admin Staff (Authoritative from SQLite API /api/admin/staff)
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);

  const addAdminStaff = (staff: AdminStaff) => {
    const newStaff = { ...staff, id: `staff-${Date.now()}` };
    setAdminStaff((prev) => [...prev, newStaff]);
    adminFetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff),
    }).catch((e) => console.warn('Admin staff save warning:', e));
    showToast(`নতুন স্টাফ মেম্বার যুক্ত হয়েছে: ${newStaff.name}`);
  };

  const updateAdminStaff = (staff: AdminStaff) => {
    setAdminStaff((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    showToast('স্টাফ তথ্য আপডেট হয়েছে');
  };

  const deleteAdminStaff = (id: string) => {
    setAdminStaff((prev) => prev.filter((s) => s.id !== id));
    showToast('স্টাফ মেম্বার মুছে ফেলা হয়েছে');
  };

  // Roles
  const switchAdminRole = (role: AdminRole) => {
    const user = adminUsers.find((u) => u.role === role) || {
      id: `admin-${role}`,
      name: role.replace('_', ' ').toUpperCase(),
      email: `${role}@bostroshoily.com`,
      role,
    };
    setCurrentAdmin(user);
    addAuditLog('Role Switched', `Admin active role switched to ${role}`, 'auth');
    showToast(`সুইচ করা হয়েছে: ${user.name} (${role})`);
  };

  // Full Database Backup & Restore
  const exportFullDatabase = (): string => {
    const fullBackup = {
      version: '2.6',
      exportDate: new Date().toISOString(),
      products,
      categories,
      navMenus,
      heroBanners,
      categoryBanners,
      collections,
      offerConfig,
      orders,
      customers,
      coupons,
      deliveryConfig,
      paymentConfig,
      productPageSettings,
      howToOrderSteps,
      clothingVideos,
      blogPosts,
      footerConfig,
      seoConfig,
      generalSettings,
      adminStaff,
      auditLogs,
      inventoryTransactions,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importFullDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products) setProducts(data.products);
      if (data.categories) setCategories(data.categories);
      if (data.navMenus) setNavMenus(data.navMenus);
      if (data.heroBanners) setHeroBanners(data.heroBanners);
      if (data.categoryBanners) setCategoryBanners(data.categoryBanners);
      if (data.collections) setCollections(data.collections);
      if (data.offerConfig) setOfferConfig(data.offerConfig);
      if (data.orders) setOrders(Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : []);
      if (data.customers) setCustomers(data.customers);
      if (data.coupons) setCoupons(data.coupons);
      if (data.deliveryConfig) setDeliveryConfig(data.deliveryConfig);
      if (data.paymentConfig) setPaymentConfig(data.paymentConfig);
      if (data.productPageSettings) setProductPageSettings(data.productPageSettings);
      if (data.howToOrderSteps) setHowToOrderSteps(data.howToOrderSteps);
      if (data.clothingVideos) setClothingVideos(data.clothingVideos);
      if (data.blogPosts) setBlogPosts(data.blogPosts);
      if (data.footerConfig) setFooterConfig(data.footerConfig);
      if (data.seoConfig) setSEOConfig(data.seoConfig);
      if (data.generalSettings) setGeneralSettings(data.generalSettings);
      if (data.adminStaff) setAdminStaff(data.adminStaff);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.inventoryTransactions) setInventoryTransactions(data.inventoryTransactions);
      showToast('সম্পূর্ণ ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetToDemoData = async () => {
    await syncAuthoritativeData();
    showToast('ডাটাবেজ (SQLite) থেকে সফলভাবে সর্বশেষ লাইভ ডাটা লোড হয়েছে!');
  };

  // Invoice Modal
  const openInvoiceModal = (order: Order) => setActiveInvoiceOrder(order);
  const closeInvoiceModal = () => setActiveInvoiceOrder(null);

  return (
    <ShopContext.Provider
      value={{
        currentView,
        currentProductSlug,
        currentCategorySlug,
        currentSubcategorySlug,
        setCurrentSubcategorySlug,
        currentLandingSlug,
        currentPolicySlug,
        navigateToHome,
        navigateToProduct,
        navigateToCategory,
        navigateToCheckout,
        navigateToTracking,
        navigateToTrackOrder,
        trackingSearchQuery,
        setTrackingSearchQuery,
        navigateToAdmin,
        navigateToAccount,
        navigateToCmsGuide,
        navigateToClothingGuide,
        navigateToLandingPage,
        navigateToPolicy,
        navigateBack,
        checkoutUpsells,
        fetchCheckoutUpsells,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        changeAdminPassword,
        updateAdminCredentials,
        categorySizeCharts,
        updateCategorySizeChart,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        openAiAssistant,
        closeAiAssistant,
        isSizeGuideModalOpen,
        sizeGuideCategory,
        openSizeGuideModal,
        closeSizeGuideModal,
        activeInvoiceOrder,
        openInvoiceModal,
        closeInvoiceModal,
        isCartOpen,
        setIsCartOpen,
        cart,
        directBuyItem,
        setDirectBuyItem,
        addToCart,
        buyNow,
        removeFromCart,
        updateCartQty,
        clearCart,
        syncCustomerServerCart,
        requireAdminPasswordChange,
        setRequireAdminPasswordChange,
        cartSubtotal,
        cartCount,
        products,
        isProductsLoading,
        productsLoadError,
        fetchProductByIdOrSlug,
        addProduct,
        updateProduct,
        deleteProduct,
        archiveProduct,
        restoreProduct,
        toggleProductStatus,
        duplicateProduct,
        updateProductStock,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        navMenus,
        updateNavMenus,
        updateNavMenu,
        addNavSubItem,
        removeNavSubItem,
        toggleNavSubItem,
        heroBanners,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        categoryBanners,
        addCategoryBanner,
        updateCategoryBanner,
        deleteCategoryBanner,
        saveCategoryBanners,
        sizeCharts,
        refreshSizeCharts,
        updateSizeCharts,
        collections,
        updateCollections,
        updateCollection,
        offerConfig,
        updateOfferConfig,
        megaFestiveOffers,
        addMegaFestiveOffer,
        updateMegaFestiveOffer,
        deleteMegaFestiveOffer,
        saveMegaFestiveOffers,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderPayment,
        updateOrderAdminNotes,
        addAdminNoteToOrder,
        requestOrderReturn,
        processOrderReturn,
        inventoryTransactions,
        adjustStock,
        customers,
        toggleCustomerStatus,
        updateCustomer,
        currentCustomer,
        isCustomerAuthModalOpen,
        isCustomerAccountModalOpen,
        authInitialMode,
        openCustomerAuthModal,
        closeCustomerAuthModal,
        openCustomerAccountModal,
        closeCustomerAccountModal,
        customerLogin,
        customerRegister,
        customerLogout,
        updateCurrentCustomerProfile,
        homePageSectionsConfig,
        updateHomePageSectionsConfig,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        applyCoupon,
        deliveryConfig,
        updateDeliveryConfig,
        paymentConfig,
        updatePaymentConfig,
        invoiceConfig,
        updateInvoiceConfig,
        productPageSettings,
        updateProductPageSettings,
        howToOrderSteps,
        updateHowToOrderSteps,
        updateHowToOrderStep,
        clothingVideos,
        addClothingVideo,
        updateClothingVideo,
        deleteClothingVideo,
        clothingStories,
        addClothingStory,
        updateClothingStory,
        deleteClothingStory,
        brandPartnerStories,
        addBrandPartnerStory,
        updateBrandPartnerStory,
        deleteBrandPartnerStory,
        saveBrandPartnerStories,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        footerConfig,
        updateFooterConfig,
        seoConfig,
        updateSEOConfig,
        generalSettings,
        updateGeneralSettings,
        adminUsers,
        currentAdmin,
        currentUser: currentAdmin,
        switchAdminRole,
        adminStaff,
        addAdminStaff,
        updateAdminStaff,
        deleteAdminStaff,
        auditLogs,
        addAuditLog,
        exportFullDatabase,
        importFullDatabase,
        syncFromDatabase: syncAuthoritativeData,
        syncAuthoritativeData,
        resetToDemoData,
        toastMessage,
        showToast,
        language,
        setLanguage,
        toggleLanguage,
        t: (key: string, fallback?: string) => getTranslation(language, key, fallback),
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        reviews,
        addProductReview,
        colors,
        sizes,
        refreshColorsAndSizes,
        comboOffers,
        fetchComboOffers,
        getComboDiscountForProduct,
        cartComboDiscount,
        storeDesign,
        updateStoreDesign,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-stone-900 text-stone-100 px-5 py-3 rounded-xl shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
