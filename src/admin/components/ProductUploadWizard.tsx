import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant, Category, SizeChartData, ProductAddon } from '../../types';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import { uploadFileToGallery } from '../../utils/imageUtils';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Check,
  Eye,
  Sparkles,
  Layers,
  Palette,
  Ruler,
  DollarSign,
  Send,
  Save,
  Tag,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Star,
  RotateCcw,
  Search,
  Gift,
  Globe,
  Share2,
  PackageCheck,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface ProductUploadWizardProps {
  initialProduct?: Partial<Product> | null;
  categories: Category[];
  onSave: (product: Product) => void;
  onCancel: () => void;
}

interface ColorOption {
  id: string;
  name: string;
  banglaName: string;
  hex: string;
}

const PRESET_COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', banglaName: 'কালো', hex: '#18181b' },
  { id: 'blue', name: 'Blue', banglaName: 'নীল', hex: '#1e40af' },
  { id: 'green', name: 'Green', banglaName: 'সবুজ', hex: '#15803d' },
  { id: 'red', name: 'Red', banglaName: 'লাল', hex: '#b91c1c' },
  { id: 'white', name: 'White', banglaName: 'সাদা', hex: '#f8fafc' },
  { id: 'maroon', name: 'Maroon', banglaName: 'মেরুন', hex: '#881337' },
  { id: 'navy', name: 'Navy', banglaName: 'নেভি ব্লু', hex: '#0f172a' },
  { id: 'mustard', name: 'Mustard', banglaName: 'সরিষা হলুদ', hex: '#ca8a04' },
  { id: 'olive', name: 'Olive', banglaName: 'জলপাই', hex: '#4d7c0f' },
  { id: 'brown', name: 'Brown', banglaName: 'বাদামি', hex: '#78350f' },
  { id: 'grey', name: 'Grey', banglaName: 'ধূসর', hex: '#64748b' },
  { id: 'offwhite', name: 'Off-White', banglaName: 'অফ-হোয়াইট', hex: '#fef3c7' },
];

export interface SizeTemplate {
  id: string;
  name: string;
  banglaName: string;
  defaultSizes: string[];
  defaultChart: SizeChartData;
}

export const SIZE_TEMPLATES: SizeTemplate[] = [
  {
    id: 'lungi_chart',
    name: 'Lungi Size & Length (লুঙ্গি সাইজ ও হাত মাপ চার্ট)',
    banglaName: '২.৫ হাত, ২.৭৫ হাত, ৩ হাত, Free Size (দৈর্ঘ্য ও ঘের)',
    defaultSizes: ['২.৫ হাত', '২.৭৫ হাত', '৩ হাত', 'Free Size'],
    defaultChart: {
      headers: ['Size', 'Length (দৈর্ঘ্য)', 'Width (ঘের/প্রস্থ)', 'Recommended For (উপযোগী)'],
      rows: [
        { Size: '২.৫ হাত', 'Length (দৈর্ঘ্য)': '45 Inch', 'Width (ঘের/প্রস্থ)': '82 Inch', 'Recommended For (উপযোগী)': 'উচ্চতা ৫\'২" - ৫\'৫"' },
        { Size: '২.৭৫ হাত', 'Length (দৈর্ঘ্য)': '48 Inch', 'Width (ঘের/প্রস্থ)': '88 Inch', 'Recommended For (উপযোগী)': 'উচ্চতা ৫\'৬" - ৫\'১০" (স্ট্যান্ডার্ড)' },
        { Size: '৩ হাত', 'Length (দৈর্ঘ্য)': '52 Inch', 'Width (ঘের/প্রস্থ)': '92 Inch', 'Recommended For (উপযোগী)': 'উচ্চতা ৫\'১০"+ (লম্বা মানুষদের)' },
        { Size: 'Free Size', 'Length (দৈর্ঘ্য)': '48 Inch', 'Width (ঘের/প্রস্থ)': '88 Inch', 'Recommended For (উপযোগী)': 'রেগুলার যেকোনো উচ্চতা' },
      ],
    },
  },
  {
    id: 'saree_chart',
    name: 'Saree Standard (শাড়ি সাইজ ও আঁচল/ব্লাউজ চার্ট)',
    banglaName: '১২ হাত, ১২.৫ হাত, ১৪ হাত, Free Size (দৈর্ঘ্য ও ব্লাউজ পিস)',
    defaultSizes: ['১২ হাত (Standard)', '১২.৫ হাত (With Blouse)', 'Free Size'],
    defaultChart: {
      headers: ['Size', 'Length (দৈর্ঘ্য)', 'Blouse Piece (ব্লাউজ পিস)', 'Aanchal / Pallu (আঁচল)'],
      rows: [
        { Size: '১২ হাত (Standard)', 'Length (দৈর্ঘ্য)': '5.5 Meter', 'Blouse Piece (ব্লাউজ পিস)': 'Without Blouse Piece', 'Aanchal / Pallu (আঁচল)': 'Traditional Woven' },
        { Size: '১২.৫ হাত (With Blouse)', 'Length (দৈর্ঘ্য)': '6.0 Meter', 'Blouse Piece (ব্লাউজ পিস)': 'Included (0.8 Meter)', 'Aanchal / Pallu (আঁচল)': 'Designer Zari/Resham' },
        { Size: 'Free Size', 'Length (দৈর্ঘ্য)': '5.5 Meter (১২ হাত)', 'Blouse Piece (ব্লাউজ পিস)': 'রানিং ব্লাউজ পিস সহ', 'Aanchal / Pallu (আঁচল)': 'অভিজাত ট্র্যাডিশনাল' },
      ],
    },
  },
  {
    id: 'panjabi_chart',
    name: 'Panjabi Standard Fit (পাঞ্জাবি সাইজ ও মাপ চার্ট)',
    banglaName: '৩৮, ৪০, ৪২, ৪৪, ৪৬ (বুক, দৈর্ঘ্য, কাঁধ ও হাতা)',
    defaultSizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
    defaultChart: {
      headers: ['Size', 'Chest (বুক)', 'Length (দৈর্ঘ্য)', 'Shoulder (কাঁধ)', 'Sleeve (হাতা)'],
      rows: [
        { Size: '38 (S)', 'Chest (বুক)': '40"', 'Length (দৈর্ঘ্য)': '40"', 'Shoulder (কাঁধ)': '17.5"', 'Sleeve (হাতা)': '24"' },
        { Size: '40 (M)', 'Chest (বুক)': '42"', 'Length (দৈর্ঘ্য)': '42"', 'Shoulder (কাঁধ)': '18"', 'Sleeve (হাতা)': '24.5"' },
        { Size: '42 (L)', 'Chest (বুক)': '44"', 'Length (দৈর্ঘ্য)': '44"', 'Shoulder (কাঁধ)': '18.5"', 'Sleeve (হাতা)': '25"' },
        { Size: '44 (XL)', 'Chest (বুক)': '46"', 'Length (দৈর্ঘ্য)': '45"', 'Shoulder (কাঁধ)': '19"', 'Sleeve (হাতা)': '25.5"' },
        { Size: '46 (XXL)', 'Chest (বুক)': '48"', 'Length (দৈর্ঘ্য)': '46"', 'Shoulder (কাঁধ)': '19.5"', 'Sleeve (হাতা)': '26"' },
      ],
    },
  },
  {
    id: 'tshirt_chart',
    name: 'T-Shirt & Shirt (টি-শার্ট ও শার্ট সাইজ চার্ট)',
    banglaName: 'S, M, L, XL, XXL (বুক, বডি দৈর্ঘ্য ও হাতা)',
    defaultSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    defaultChart: {
      headers: ['Size', 'Chest (বুক)', 'Length (দৈর্ঘ্য)', 'Sleeve (হাতা)'],
      rows: [
        { Size: 'S', 'Chest (বুক)': '38"', 'Length (দৈর্ঘ্য)': '27"', 'Sleeve (হাতা)': '8"' },
        { Size: 'M', 'Chest (বুক)': '40"', 'Length (দৈর্ঘ্য)': '28"', 'Sleeve (হাতা)': '8.5"' },
        { Size: 'L', 'Chest (বুক)': '42"', 'Length (দৈর্ঘ্য)': '29"', 'Sleeve (হাতা)': '9"' },
        { Size: 'XL', 'Chest (বুক)': '44"', 'Length (দৈর্ঘ্য)': '30"', 'Sleeve (হাতা)': '9.5"' },
        { Size: 'XXL', 'Chest (বুক)': '46"', 'Length (দৈর্ঘ্য)': '31"', 'Sleeve (হাতা)': '10"' },
      ],
    },
  },
  {
    id: 'threepiece_chart',
    name: 'Three-Piece & Kurti (থ্রি-পিস ও কুর্তি সাইজ চার্ট)',
    banglaName: '৩৬, ৩৮, ৪০, ৪২, Unstitched (কামিজ, সালোয়ার ও ওড়না)',
    defaultSizes: ['36 (S)', '38 (M)', '40 (L)', '42 (XL)', 'Unstitched'],
    defaultChart: {
      headers: ['Size', 'Kameez Chest (কামিজ বুক)', 'Kameez Length (কামিজ দৈর্ঘ্য)', 'Salwar Length (সালোয়ার)', 'Dupatta (ওড়না)'],
      rows: [
        { Size: '36 (S)', 'Kameez Chest (কামিজ বুক)': '36"', 'Kameez Length (কামিজ দৈর্ঘ্য)': '44"', 'Salwar Length (সালোয়ার)': '38"', 'Dupatta (ওড়না)': '৫ হাত (2.5 Mtr)' },
        { Size: '38 (M)', 'Kameez Chest (কামিজ বুক)': '38"', 'Kameez Length (কামিজ দৈর্ঘ্য)': '45"', 'Salwar Length (সালোয়ার)': '39"', 'Dupatta (ওড়না)': '৫ হাত (2.5 Mtr)' },
        { Size: '40 (L)', 'Kameez Chest (কামিজ বুক)': '40"', 'Kameez Length (কামিজ দৈর্ঘ্য)': '46"', 'Salwar Length (সালোয়ার)': '40"', 'Dupatta (ওড়না)': '৫ হাত (2.5 Mtr)' },
        { Size: '42 (XL)', 'Kameez Chest (কামিজ বুক)': '42"', 'Kameez Length (কামিজ দৈর্ঘ্য)': '47"', 'Salwar Length (সালোয়ার)': '40"', 'Dupatta (ওড়না)': '৫ হাত (2.5 Mtr)' },
        { Size: 'Unstitched', 'Kameez Chest (কামিজ বুক)': 'Free / কাস্টমাইজ', 'Kameez Length (কামিজ দৈর্ঘ্য)': '48" Fabric', 'Salwar Length (সালোয়ার)': '2.5 গজ', 'Dupatta (ওড়না)': '৫ হাত কটন/শিফন' },
      ],
    },
  },
  {
    id: 'pajama_chart',
    name: 'Pajama Standard (পায়জামা সাইজ চার্ট)',
    banglaName: '৩৮, ৪০, ৪২, ৪৪ (কোমর, দৈর্ঘ্য ও পায়ের মোহরী)',
    defaultSizes: ['38', '40', '42', '44'],
    defaultChart: {
      headers: ['Size', 'Waist (কোমর)', 'Length (দৈর্ঘ্য)', 'Bottom Opening (পায়ের ঘের)'],
      rows: [
        { Size: '38', 'Waist (কোমর)': '30-34"', 'Length (দৈর্ঘ্য)': '38"', 'Bottom Opening (পায়ের ঘের)': '15"' },
        { Size: '40', 'Waist (কোমর)': '32-36"', 'Length (দৈর্ঘ্য)': '40"', 'Bottom Opening (পায়ের ঘের)': '16"' },
        { Size: '42', 'Waist (কোমর)': '34-38"', 'Length (দৈর্ঘ্য)': '42"', 'Bottom Opening (পায়ের ঘের)': '16.5"' },
        { Size: '44', 'Waist (কোমর)': '36-40"', 'Length (দৈর্ঘ্য)': '44"', 'Bottom Opening (পায়ের ঘের)': '17"' },
      ],
    },
  },
  {
    id: 'custom',
    name: 'Custom Chart (কাস্টম সাইজ চার্ট)',
    banglaName: 'অ্যাডমিন নিজের ইচ্ছামতো সাইজ ও পরিমাপ কলাম তৈরি করবেন',
    defaultSizes: ['Free Size'],
    defaultChart: {
      headers: ['Size', 'Measurement (মাপ)', 'Notes (মন্তব্য)'],
      rows: [
        { Size: 'Free Size', 'Measurement (মাপ)': 'Standard', 'Notes (মন্তব্য)': 'Regular Fit' },
      ],
    },
  },
];

export const CATEGORY_MAPPINGS: Record<
  string,
  { parent: 'MEN' | 'WOMEN' | 'OTHERS'; bangla: string; defaultTemplate: string; skuPrefix: string }
> = {
  Lungi: { parent: 'MEN', bangla: 'লুঙ্গি', defaultTemplate: 'lungi_chart', skuPrefix: 'LNG' },
  Saree: { parent: 'WOMEN', bangla: 'শাড়ি', defaultTemplate: 'saree_chart', skuPrefix: 'SAR' },
  Panjabi: { parent: 'MEN', bangla: 'পাঞ্জাবি', defaultTemplate: 'panjabi_chart', skuPrefix: 'PAN' },
  'T-Shirt': { parent: 'MEN', bangla: 'টি-শার্ট', defaultTemplate: 'tshirt_chart', skuPrefix: 'TSH' },
  'Three-Piece': { parent: 'WOMEN', bangla: 'থ্রি-পিস', defaultTemplate: 'threepiece_chart', skuPrefix: '3PC' },
  Kurti: { parent: 'WOMEN', bangla: 'কুর্তি', defaultTemplate: 'threepiece_chart', skuPrefix: 'KUR' },
  Pajama: { parent: 'MEN', bangla: 'পায়জামা', defaultTemplate: 'pajama_chart', skuPrefix: 'PAJ' },
  Fotua: { parent: 'MEN', bangla: 'ফতুয়া', defaultTemplate: 'tshirt_chart', skuPrefix: 'FOT' },
  'Gift Box': { parent: 'OTHERS', bangla: 'উপহার বক্স', defaultTemplate: 'custom', skuPrefix: 'GFT' },
  Ator: { parent: 'OTHERS', bangla: 'আতর / সুগন্ধি', defaultTemplate: 'custom', skuPrefix: 'ATR' },
  Tupi: { parent: 'OTHERS', bangla: 'টুপি', defaultTemplate: 'custom', skuPrefix: 'TUP' },
  'Chadar/Shawl': { parent: 'OTHERS', bangla: 'চাদর / শাল', defaultTemplate: 'lungi_chart', skuPrefix: 'SHL' },
  'Kids Item': { parent: 'OTHERS', bangla: 'বাচ্চাদের পোশাক', defaultTemplate: 'lungi_chart', skuPrefix: 'KID' },
};

export const ProductUploadWizard: React.FC<ProductUploadWizardProps> = ({
  initialProduct,
  categories,
  onSave,
  onCancel,
}) => {
  const { showToast, products: allProducts, sizeCharts: contextSizeCharts, refreshSizeCharts } = useShop();

  // Read any saved draft
  const savedDraft = useMemo(() => {
    try {
      const key = initialProduct?.id
        ? `bastra_product_edit_draft_${initialProduct.id}`
        : 'bastra_product_wizard_draft';
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [initialProduct?.id]);

  // 8-Step Wizard Stepper (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(() => savedDraft?.currentStep || 1);

  // Dynamic Main Categories from Category Management
  const mainCategoriesList = useMemo(() => {
    const list = categories.filter((c) => c.isMain && c.isActive !== false);
    if (list.length > 0) return list;
    return [
      { id: 'cat-main-men', name: 'MEN', banglaName: 'পুরুষ', slug: 'men', isMain: true, icon: '👨' },
      { id: 'cat-main-women', name: 'WOMEN', banglaName: 'নারী', slug: 'women', isMain: true, icon: '👩' },
      { id: 'cat-main-kids', name: 'KIDS', banglaName: 'শিশুদের', slug: 'kids', isMain: true, icon: '🧒' },
      { id: 'cat-main-others', name: 'OTHERS', banglaName: 'অন্যান্য', slug: 'others', isMain: true, icon: '🎁' },
    ];
  }, [categories]);

  // STEP 1: Main Category & Dynamic Subcategory Selection
  const [mainCategory, setMainCategory] = useState<string>(() => {
    if (initialProduct?.category) {
      return initialProduct.category.toUpperCase();
    }
    const mapped = CATEGORY_MAPPINGS[initialProduct?.subCategory || ''];
    if (mapped) return mapped.parent;
    return savedDraft?.mainCategory || 'MEN';
  });

  const [subCategory, setSubCategory] = useState<string>(
    initialProduct?.subCategory || savedDraft?.subCategory || 'Lungi'
  );

  // Inline Subcategory Creator
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubBangla, setNewSubBangla] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  // Available subcategories filtered strictly by selected main category
  const filteredSubcategories = useMemo(() => {
    const currentMainObj = mainCategoriesList.find(
      (m) =>
        m.name.toUpperCase() === mainCategory.toUpperCase() ||
        (m.slug && m.slug.toUpperCase() === mainCategory.toUpperCase()) ||
        (m.id && m.id === mainCategory)
    );
    const mainKey = currentMainObj?.name?.toUpperCase() || mainCategory.toUpperCase();
    const mainId = currentMainObj?.id;

    const fromProps = categories.filter((c) => {
      if (c.isMain || c.isActive === false) return false;
      const p = (c.parentCategory || '').toUpperCase();
      return p === mainKey || (mainId && c.parentCategoryId === mainId);
    });

    if (fromProps.length > 0) return fromProps;

    // Standard fallback subcategories per main category if none in db yet
    if (mainKey === 'MEN') {
      return [
        { id: 'sub-lungi', name: 'Lungi', banglaName: 'লুঙ্গি', slug: 'lungi', parentCategory: 'MEN' as const, order: 1, isActive: true },
        { id: 'sub-tshirt', name: 'T-Shirt', banglaName: 'টি-শার্ট', slug: 't-shirt', parentCategory: 'MEN' as const, order: 2, isActive: true },
        { id: 'sub-polotshirt', name: 'Polo T-Shirt', banglaName: 'পোলো টি-শার্ট', slug: 'polo-t-shirt', parentCategory: 'MEN' as const, order: 3, isActive: true },
        { id: 'sub-panjabi', name: 'Panjabi', banglaName: 'পাঞ্জাবি', slug: 'panjabi', parentCategory: 'MEN' as const, order: 4, isActive: true },
        { id: 'sub-pajama', name: 'Payjama', banglaName: 'পায়জামা', slug: 'payjama', parentCategory: 'MEN' as const, order: 5, isActive: true },
      ];
    } else if (mainKey === 'WOMEN') {
      return [
        { id: 'sub-saree', name: 'Saree', banglaName: 'শাড়ি', slug: 'saree', parentCategory: 'WOMEN' as const, order: 1, isActive: true },
        { id: 'sub-3pc', name: 'Three-Piece', banglaName: 'থ্রি-পিস', slug: 'three-piece', parentCategory: 'WOMEN' as const, order: 2, isActive: true },
        { id: 'sub-borka', name: 'Borka', banglaName: 'বোরকা', slug: 'borka', parentCategory: 'WOMEN' as const, order: 3, isActive: true },
        { id: 'sub-hijab', name: 'Hijab', banglaName: 'হিজাব', slug: 'hijab', parentCategory: 'WOMEN' as const, order: 4, isActive: true },
      ];
    } else if (mainKey === 'KIDS') {
      return [
        { id: 'sub-kids-wear', name: 'Kids Item', banglaName: 'শিশুদের পোশাক', slug: 'kids-item', parentCategory: 'KIDS' as const, order: 1, isActive: true },
      ];
    } else {
      return [
        { id: 'sub-giftbox', name: 'Gift Box', banglaName: 'উপহার বক্স', slug: 'gift-box', parentCategory: 'OTHERS' as const, order: 1, isActive: true },
        { id: 'sub-ator', name: 'Ator', banglaName: 'আতর ও সুগন্ধি', slug: 'ator', parentCategory: 'OTHERS' as const, order: 2, isActive: true },
        { id: 'sub-tupi', name: 'Tupi', banglaName: 'টুপি', slug: 'tupi', parentCategory: 'OTHERS' as const, order: 3, isActive: true },
        { id: 'sub-chadar', name: 'Chador', banglaName: 'চাদর / শাল', slug: 'chador', parentCategory: 'OTHERS' as const, order: 4, isActive: true },
      ];
    }
  }, [categories, mainCategoriesList, mainCategory]);

  // STEP 2: Basic Info & SEO
  const [productName, setProductName] = useState(initialProduct?.name || savedDraft?.productName || '');
  const [banglaName, setBanglaName] = useState(initialProduct?.banglaName || savedDraft?.banglaName || '');
  const [description, setDescription] = useState(
    initialProduct?.description || savedDraft?.description ||
      '১০০% খাঁটি দেশীয় সুতা ও নিখুঁত ফিনিশিংয়ে তৈরি বস্ত্র শৈলীর প্রিমিয়াম কালেকশন।'
  );
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription || savedDraft?.shortDescription || 'আরামদায়ক ও ঐতিহ্যবাহী হস্তশিল্প।'
  );
  const [brand, setBrand] = useState(initialProduct?.brand || savedDraft?.brand || 'BOSTROSHOILY');
  const [skuPrefix, setSkuPrefix] = useState<string>(() => {
    return CATEGORY_MAPPINGS[initialProduct?.subCategory || 'Lungi']?.skuPrefix || 'BS';
  });
  const [basePrice, setBasePrice] = useState<number>(initialProduct?.price || 900);
  const [baseOfferPrice, setBaseOfferPrice] = useState<number>(initialProduct?.discountPrice || 0);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(initialProduct?.compareAtPrice || 0);
  const [baseStock, setBaseStock] = useState<number>(initialProduct?.stock || 20);
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(
    (initialProduct?.status as any) || savedDraft?.status || 'active'
  );
  const [availability, setAvailability] = useState<'in_stock' | 'out_of_stock' | 'pre_order'>(
    initialProduct?.availability || savedDraft?.availability || 'in_stock'
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || savedDraft?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct?.isNewArrival ?? (savedDraft?.isNewArrival ?? true));
  const [isBestSeller, setIsBestSeller] = useState(initialProduct?.isBestSeller || savedDraft?.isBestSeller || false);
  const [isOffer, setIsOffer] = useState(initialProduct?.isOffer || savedDraft?.isOffer || false);

  // SEO Fields (Optional)
  const [slug, setSlug] = useState<string>(() => {
    if (initialProduct?.slug) return initialProduct.slug;
    return savedDraft?.slug || '';
  });
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || savedDraft?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || savedDraft?.seoDescription || '');
  const [imageAlt, setImageAlt] = useState(initialProduct?.imageAlt || savedDraft?.imageAlt || '');
  const [tags, setTags] = useState<string[]>(
    initialProduct?.seoKeywords ? initialProduct.seoKeywords.split(',').map((s) => s.trim()) : (savedDraft?.tags || ['Cotton', 'Premium'])
  );
  const [tagInput, setTagInput] = useState('');
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);

  // Auto-generate slug when product name changes if slug is empty or user requests
  const generateSlugFromName = () => {
    const raw = (productName || banglaName || 'product').toLowerCase().trim();
    const clean = raw
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(clean || `prod-${Date.now().toString().slice(-6)}`);
    showToast('পণ্যের নাম থেকে এসইও স্লাগ তৈরি হয়েছে!');
  };

  // STEP 3: Colors & Gallery Mapping - ZERO color pre-selected by default as requested
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      const uniqueNames = Array.from(new Set(initialProduct.variants.map((v) => String(v.color)))) as string[];
      return uniqueNames.map((name: string) => {
        const found = PRESET_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return (
          found || {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            banglaName: name,
            hex: initialProduct.variants?.find((v) => v.color === name)?.colorCode || '#3b82f6',
          }
        );
      });
    }
    return savedDraft?.selectedColors || []; // No color preselected for new products
  });

  const [colorGalleries, setColorGalleries] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    if (initialProduct?.colorGalleries && typeof initialProduct.colorGalleries === 'object') {
      Object.assign(map, initialProduct.colorGalleries);
    }
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      initialProduct.variants.forEach((v) => {
        if (v.color) {
          if (!map[v.color]) map[v.color] = [];
          if (v.galleryImages && Array.isArray(v.galleryImages)) {
            v.galleryImages.forEach((img) => {
              if (img && !map[v.color].includes(img)) map[v.color].push(img);
            });
          }
          if (v.image && !map[v.color].includes(v.image)) {
            map[v.color].push(v.image);
          }
        }
      });
    }

    const primaryColor = selectedColors[0]?.name || 'Default';
    const legacyImages = [
      ...(initialProduct?.mainImage ? [initialProduct.mainImage] : []),
      ...(initialProduct?.galleryImages || []),
    ].filter(Boolean);
    if (legacyImages.length > 0) {
      if (!map[primaryColor]) map[primaryColor] = [];
      legacyImages.forEach((img) => {
        if (!map[primaryColor].includes(img)) map[primaryColor].push(img);
      });
    }

    if (savedDraft?.colorGalleries && Object.keys(savedDraft.colorGalleries).length > 0) {
      Object.assign(map, savedDraft.colorGalleries);
    }

    return map;
  });

  const [activeGalleryColor, setActiveGalleryColor] = useState<string>(() => {
    return initialProduct?.variants?.[0]?.color || selectedColors[0]?.name || 'Black';
  });
  const [customMainImage, setCustomMainImage] = useState<string>(
    initialProduct?.mainImage || savedDraft?.customMainImage || ''
  );
  const [bulkUrlInput, setBulkUrlInput] = useState('');
  const [showAddCustomColor, setShowAddCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorBangla, setCustomColorBangla] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#6366f1');
  const [isUploading, setIsUploading] = useState(false);

  // STEP 4: Size Template & Dynamic Size Chart
  const [selectedSizeTemplate, setSelectedSizeTemplate] = useState<string>(() => {
    const defaultCat = CATEGORY_MAPPINGS[subCategory || 'Lungi'];
    return defaultCat?.defaultTemplate || 'lungi_chart';
  });

  const [activeSizes, setActiveSizes] = useState<string[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return Array.from(new Set(initialProduct.variants.map((v) => String(v.size)))) as string[];
    }
    const defaultCat = CATEGORY_MAPPINGS[subCategory || 'Lungi'];
    const tmpl = SIZE_TEMPLATES.find((t) => t.id === defaultCat?.defaultTemplate) || SIZE_TEMPLATES[0];
    return tmpl.defaultSizes;
  });

  const [sizeChart, setSizeChart] = useState<SizeChartData>(() => {
    if (initialProduct?.sizeChart && initialProduct.sizeChart.headers?.length > 0) {
      return JSON.parse(JSON.stringify(initialProduct.sizeChart));
    }
    const defaultCat = CATEGORY_MAPPINGS[subCategory || 'Lungi'];
    const tmpl = SIZE_TEMPLATES.find((t) => t.id === defaultCat?.defaultTemplate) || SIZE_TEMPLATES[0];
    return tmpl?.defaultChart ? JSON.parse(JSON.stringify(tmpl.defaultChart)) : SIZE_TEMPLATES[0].defaultChart;
  });

  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [sizeChartUnit, setSizeChartUnit] = useState<'inch' | 'cm'>('inch');
  const [isUploadingSizeChart, setIsUploadingSizeChart] = useState(false);

  // STEP 5: Variant Matrix
  const [variantsMatrix, setVariantsMatrix] = useState<
    Array<{
      id: string;
      color: string;
      colorCode: string;
      size: string;
      sku: string;
      price: number;
      offerPrice: number;
      stock: number;
      enabled: boolean;
    }>
  >([]);

  // Auto-generate SKU & Matrix
  useEffect(() => {
    const initialMap: Record<string, ProductVariant> = {};
    if (initialProduct?.variants) {
      initialProduct.variants.forEach((v) => {
        initialMap[`${v.color}-${v.size}`] = v;
      });
    }

    const newMatrix: typeof variantsMatrix = [];
    selectedColors.forEach((color) => {
      activeSizes.forEach((size) => {
        const key = `${color.name}-${size}`;
        const existing = initialMap[key];

        const colorCodeStr = color.name.slice(0, 3).toUpperCase();
        const sizeCodeStr = size.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'FS';
        const autoSku = `${skuPrefix}-${colorCodeStr}-${sizeCodeStr}`;

        newMatrix.push({
          id: existing?.id || `v-${Date.now()}-${color.name.toLowerCase()}-${size.toLowerCase()}`,
          color: color.name,
          colorCode: color.hex,
          size,
          sku: existing?.sku || autoSku,
          price: existing?.price || basePrice,
          offerPrice: (existing as any)?.discountPrice || baseOfferPrice,
          stock: existing?.stock ?? baseStock,
          enabled: existing ? existing.status === 'active' : true,
        });
      });
    });

    setVariantsMatrix(newMatrix);
  }, [selectedColors, activeSizes, skuPrefix, basePrice, baseOfferPrice, baseStock]);

  // DB Size Charts (Phase 4 & 5.4)
  const [dbSizeCharts, setDbSizeCharts] = useState<any[]>(contextSizeCharts || []);
  const [customSizeInput, setCustomSizeInput] = useState('');

  useEffect(() => {
    if (contextSizeCharts && contextSizeCharts.length > 0) {
      setDbSizeCharts(contextSizeCharts);
    }
  }, [contextSizeCharts]);

  useEffect(() => {
    fetch('/api/size-charts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.charts)) {
          setDbSizeCharts(data.charts);
        }
      })
      .catch((err) => console.warn('Could not load DB size charts:', err));
  }, []);

  // Matched DB Size Chart for current subcategory
  const matchedDbChart = useMemo(() => {
    if (!subCategory) return undefined;
    const sub = subCategory.toLowerCase().trim();
    return dbSizeCharts.find(
      (c) =>
        c.subCategory?.toLowerCase().trim() === sub ||
        c.categorySlug?.toLowerCase().trim() === sub ||
        c.name?.toLowerCase().trim() === sub ||
        c.banglaName?.toLowerCase().trim() === sub
    );
  }, [dbSizeCharts, subCategory]);

  // Derived available sizes for this subcategory from Size Chart Management
  const candidateSizes = useMemo(() => {
    if (matchedDbChart?.availableSizesJson) {
      try {
        const parsed = typeof matchedDbChart.availableSizesJson === 'string'
          ? JSON.parse(matchedDbChart.availableSizesJson)
          : matchedDbChart.availableSizesJson;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    if (matchedDbChart?.measurementsJson) {
      try {
        const parsed = typeof matchedDbChart.measurementsJson === 'string'
          ? JSON.parse(matchedDbChart.measurementsJson)
          : matchedDbChart.measurementsJson;
        if (parsed.rows && Array.isArray(parsed.rows)) {
          const rowSizes = parsed.rows.map((r: any) => r.Size || r.size).filter(Boolean);
          if (rowSizes.length > 0) return rowSizes;
        }
      } catch {}
    }
    const defaultCat = CATEGORY_MAPPINGS[subCategory || ''] || {
      parent: (mainCategory as any) || 'MEN',
      bangla: subCategory || '',
      defaultTemplate:
        mainCategory === 'WOMEN'
          ? 'saree_chart'
          : mainCategory === 'OTHERS'
          ? 'lungi_chart'
          : 'panjabi_chart',
      skuPrefix: (subCategory || 'BS').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'BS',
    };
    const tmpl = SIZE_TEMPLATES.find((t) => t.id === defaultCat?.defaultTemplate) || SIZE_TEMPLATES[0];
    return tmpl.defaultSizes;
  }, [matchedDbChart, subCategory, mainCategory]);

  // Automatically sync activeSizes when candidateSizes updates for new product
  useEffect(() => {
    if (!initialProduct?.variants || initialProduct.variants.length === 0) {
      setActiveSizes(candidateSizes);
    }
  }, [candidateSizes, initialProduct?.variants]);

  // Automatically sync sizeChart table and image from Size Chart Management
  useEffect(() => {
    if (initialProduct?.sizeChart && (initialProduct.sizeChart.headers?.length > 0 || initialProduct.sizeChart.imageUrl)) {
      return;
    }
    if (!matchedDbChart) return;

    if (matchedDbChart.measurementsJson) {
      try {
        const parsed = typeof matchedDbChart.measurementsJson === 'string'
          ? JSON.parse(matchedDbChart.measurementsJson)
          : matchedDbChart.measurementsJson;
        if (parsed.columns && parsed.rows && parsed.rows.length > 0) {
          const headers = ['Size', ...parsed.columns.map((c: any) => c.label)];
          const rows = parsed.rows.map((r: any) => {
            const rowObj: Record<string, string> = { Size: r.size };
            parsed.columns.forEach((col: any) => {
              rowObj[col.label] = r[col.id] || '';
            });
            return rowObj;
          });
          setSizeChart({
            headers,
            rows,
            unit: matchedDbChart.unit || 'inch',
            imageUrl: (matchedDbChart.showImage !== false && matchedDbChart.imageUrl) ? matchedDbChart.imageUrl : '',
          });
          setSizeChartUnit((matchedDbChart.unit as 'inch' | 'cm') || 'inch');
        }
      } catch {}
    } else if (matchedDbChart.imageUrl && matchedDbChart.showImage !== false) {
      setSizeChart((prev) => ({
        ...prev,
        imageUrl: matchedDbChart.imageUrl,
      }));
    }

    if (matchedDbChart.imageUrl && matchedDbChart.showImage !== false) {
      setSizeChart((prev) => ({ ...prev, imageUrl: matchedDbChart.imageUrl }));
    }
  }, [matchedDbChart, initialProduct?.id]);

  // STEP 6: Related Products (2 Dedicated Subcategory Selection Slots)
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>(() => {
    if (initialProduct?.relatedProductIds && Array.isArray(initialProduct.relatedProductIds)) {
      return initialProduct.relatedProductIds;
    }
    return savedDraft?.selectedRelatedIds || [];
  });
  const [activeRelatedSlot, setActiveRelatedSlot] = useState<1 | 2>(1);
  const [relatedSlot1Main, setRelatedSlot1Main] = useState<string>('MEN');
  const [relatedSlot1Sub, setRelatedSlot1Sub] = useState<string>('all');
  const [relatedSlot2Main, setRelatedSlot2Main] = useState<string>('OTHERS');
  const [relatedSlot2Sub, setRelatedSlot2Sub] = useState<string>('all');
  const [relatedSearch, setRelatedSearch] = useState('');

  // STEP 7: Product Add-on System (Exactly Two Options)
  const [addons, setAddons] = useState<ProductAddon[]>(() => {
    if (initialProduct?.addons && Array.isArray(initialProduct.addons)) {
      return initialProduct.addons;
    }
    return savedDraft?.addons || [
      {
        id: `addon-${Date.now()}-0`,
        productId: initialProduct?.id || 'new',
        addonProductId: 'prod-gift-box',
        addonType: 'existing',
        customTitleBn: 'প্রিয়জনকে উপহার দিতে সুন্দর লাক্সারি ম্যাগনেটিক গিফট বক্স নিন',
        customDescriptionBn: 'সাটিন রিবন ও স্পেশাল গ্রিটিংস কার্ডসহ রিজিড ম্যাগনেটিক গিফট বক্স। পাঞ্জাবি বা শাড়ি সুন্দরভাবে প্যাক করার উপযোগী।',
        priceOverride: 350,
        sortOrder: 1,
        isActive: true,
      },
    ];
  });

  const [addonMode, setAddonMode] = useState<'option1_upload' | 'option2_catalog'>('option2_catalog');
  // Option 1: Device Gallery Upload
  const [customAddonImage, setCustomAddonImage] = useState('');
  const [customAddonTitle, setCustomAddonTitle] = useState('');
  const [customAddonDesc, setCustomAddonDesc] = useState('');
  const [customAddonPrice, setCustomAddonPrice] = useState<number | ''>('');
  // Option 2: Catalog Selector
  const [addonCatalogMain, setAddonCatalogMain] = useState('OTHERS & ACCESSORIES');
  const [addonCatalogSub, setAddonCatalogSub] = useState('all');
  const [addonCatalogSearch, setAddonCatalogSearch] = useState('');

  // Client-side instant image compression
  const compressImage = async (file: File, maxDim = 1000, quality = 0.80): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload handler for color photos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileList = Array.from(files) as File[];
      const uploadedUrls: string[] = [];

      await Promise.all(
        fileList.map(async (file) => {
          try {
            const base64Data = await compressImage(file);
            const res = await adminFetch('/api/admin/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: base64Data,
                filename: file.name.replace(/\.[^/.]+$/, '.jpg'),
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (data.success && data.url) {
              uploadedUrls.push(data.url);
            } else {
              uploadedUrls.push(base64Data);
            }
          } catch (fileErr) {
            console.warn('File upload warning:', fileErr);
          }
        })
      );

      if (uploadedUrls.length > 0) {
        setColorGalleries((prev) => ({
          ...prev,
          [activeGalleryColor]: [...(prev[activeGalleryColor] || []), ...uploadedUrls],
        }));
        if (!customMainImage && uploadedUrls[0]) {
          setCustomMainImage(uploadedUrls[0]);
        }
        showToast(`${uploadedUrls.length} টি ছবি গ্যালারিতে যুক্ত হয়েছে।`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('ছবি আপলোডে সমস্যা হয়েছে।');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Remove image from gallery
  const handleRemoveImage = async (colorName: string, index: number) => {
    const targetUrl = colorGalleries[colorName]?.[index];
    const filteredList = (colorGalleries[colorName] || []).filter((_, i) => i !== index);
    const updatedGalleries = {
      ...colorGalleries,
      [colorName]: filteredList,
    };
    setColorGalleries(updatedGalleries);

    let nextMain = customMainImage;
    if (targetUrl && customMainImage === targetUrl) {
      const remaining = Object.values(updatedGalleries).flat().filter(Boolean);
      nextMain = remaining[0] || '';
      setCustomMainImage(nextMain);
    }

    if (targetUrl) {
      try {
        await adminFetch('/api/admin/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });
      } catch {}
    }
    showToast('ছবিটি মুছে ফেলা হয়েছে।');
  };

  // Resolved main image
  const resolvedMainImage = useMemo(() => {
    if (customMainImage) return customMainImage;
    const firstColor = selectedColors[0]?.name;
    const colorImages = firstColor ? colorGalleries[firstColor] : [];
    if (colorImages && colorImages.length > 0) return colorImages[0];
    const anyAvailableImage = Object.values(colorGalleries).flat().find(Boolean);
    if (anyAvailableImage) return anyAvailableImage;
    return '/bastra-shoily-logo.svg';
  }, [customMainImage, selectedColors, colorGalleries]);

  // Total stock across variants
  const totalCalculatedStock = useMemo(() => {
    return variantsMatrix.filter((v) => v.enabled).reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [variantsMatrix]);

  // Create Subcategory Inline
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) {
      showToast('সাব-ক্যাটাগরির নাম লিখুন');
      return;
    }
    setIsCreatingSub(true);
    try {
      const generatedSlug = newSubSlug.trim() || newSubName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const res = await adminFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName.trim(),
          banglaName: newSubBangla.trim() || newSubName.trim(),
          slug: generatedSlug,
          parentCategory: mainCategory,
          order: 99,
          isActive: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success || data.category) {
        setSubCategory(newSubName.trim());
        setShowAddSubModal(false);
        setNewSubName('');
        setNewSubBangla('');
        setNewSubSlug('');
        showToast(`'${newSubName}' সাব-ক্যাটাগরি তৈরি ও নির্বাচন করা হয়েছে!`);
      } else {
        showToast(data.error || 'সাব-ক্যাটাগরি তৈরিতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setIsCreatingSub(false);
    }
  };

  // Submit product
  const handleFinalSubmit = (publishStatus: 'active' | 'draft') => {
    if (!productName.trim() && !banglaName.trim()) {
      showToast('দয়া করে পণ্যের নাম লিখুন (ধাপ ২)।');
      setCurrentStep(2);
      return;
    }

    // Build ProductVariant list
    let finalVariants: ProductVariant[] = variantsMatrix
      .filter((v) => v.enabled)
      .map((v) => {
        const colorImgs = colorGalleries[v.color] || [];
        const matchedColor = selectedColors.find((c) => c.name === v.color);
        return {
          id: v.id,
          sku: v.sku,
          color: v.color,
          colorId: matchedColor?.id || `col-${v.color.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          colorCode: v.colorCode || matchedColor?.hex,
          size: v.size,
          sizeId: v.size ? `sz-${v.size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined,
          price: v.offerPrice || v.price,
          stock: v.stock,
          image: colorImgs[0] || resolvedMainImage,
          galleryImages: colorImgs,
          status: 'active' as const,
        };
      });

    if (finalVariants.length === 0) {
      const defColor = selectedColors[0] || PRESET_COLORS[0];
      const defSize = activeSizes[0] || 'Free Size';
      finalVariants = [
        {
          id: `var-${Date.now()}-0`,
          sku: `${skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}-01`,
          color: defColor.name,
          colorId: defColor.id,
          colorCode: defColor.hex,
          size: defSize,
          sizeId: `sz-${defSize.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          price: baseOfferPrice && baseOfferPrice < basePrice ? baseOfferPrice : basePrice,
          stock: baseStock || 10,
          image: resolvedMainImage,
          galleryImages: [resolvedMainImage],
          status: 'active' as const,
        },
      ];
    }

    const allGalleryImages = Array.from(
      new Set(Object.values(colorGalleries).flatMap((imgs) => imgs))
    );

    const latinSlug = (slug.trim() || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) || `prod-${Date.now()}`;

    const newProductPayload: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: productName.trim() || banglaName.trim(),
      banglaName: banglaName.trim() || productName.trim(),
      slug: latinSlug,
      sku: initialProduct?.sku || `${skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: mainCategory,
      subCategory: subCategory,
      brand: brand.trim() || 'BOSTROSHOILY',
      price: basePrice,
      discountPrice: baseOfferPrice < basePrice ? baseOfferPrice : undefined,
      compareAtPrice: compareAtPrice || undefined,
      stock: totalCalculatedStock,
      lowStockThreshold: 5,
      description,
      shortDescription,
      mainImage: resolvedMainImage,
      galleryImages: allGalleryImages.length > 0 ? allGalleryImages : [resolvedMainImage],
      colorGalleries: Object.keys(colorGalleries).length > 0 ? colorGalleries : undefined,
      variants: finalVariants,
      status: publishStatus,
      availability,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isOffer: baseOfferPrice < basePrice,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: tags.join(', '),
      imageAlt: imageAlt || undefined,
      relatedProductIds: selectedRelatedIds,
      addons,
      createdAt: initialProduct?.createdAt || new Date().toISOString().split('T')[0],
      salesCount: initialProduct?.salesCount || 0,
      sizeChart: (sizeChart?.imageUrl || (sizeChart?.headers && sizeChart.headers.length > 0)) ? sizeChart : undefined,
    };

    onSave(newProductPayload);

    try {
      const key = initialProduct?.id
        ? `bastra_product_edit_draft_${initialProduct.id}`
        : 'bastra_product_wizard_draft';
      localStorage.removeItem(key);
      localStorage.removeItem('bastra_product_wizard_draft');
    } catch {}
  };

  // Steps Definition
  const STEPS = [
    { num: 1, title: 'Category', bangla: '১. ক্যাটাগরি', icon: Layers },
    { num: 2, title: 'Basic & SEO', bangla: '২. বিবরণ ও এসইও', icon: Tag },
    { num: 3, title: 'Color & Photos', bangla: '৩. কালার ও ছবি', icon: Palette },
    { num: 4, title: 'Size Chart', bangla: '৪. সাইজ চার্ট', icon: Ruler },
    { num: 5, title: 'Variants', bangla: '৫. ভ্যারিয়েন্ট ও স্টক', icon: DollarSign },
    { num: 6, title: 'Related', bangla: '৬. সংশ্লিষ্ট পণ্য', icon: ShoppingBag },
    { num: 7, title: 'Add-ons', bangla: '৭. উপহার সামগ্রী', icon: Gift },
    { num: 8, title: 'Preview', bangla: '৮. প্রিভিউ ও প্রকাশ', icon: Eye },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="bg-stone-900 text-white px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                Phase 4 — 8-Step Wizard
              </span>
              <h2 className="text-sm sm:text-base font-bold">
                {initialProduct?.id ? 'প্রোডাক্ট এডিট করুন (Edit Product)' : 'নতুন প্রোডাক্ট আপলোড ও সম্পূর্ণ নিয়ন্ত্রণ'}
              </h2>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 font-sans">
              ক্যাটাগরি, এসইও, কালার গ্যালারি, সাইজ চার্ট, ভ্যারিয়েন্ট, রিলেটেড প্রোডাক্ট ও উপহার অ্যাড-অনসহ পূর্ণাঙ্গ উইজার্ড
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8-Step Stepper Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-3 sm:px-6 py-2.5 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] max-w-4xl mx-auto gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;

              return (
                <div key={step.num} className="flex items-center flex-1 last:flex-initial">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className="flex items-center gap-1.5 text-left group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shadow-xs ${
                        isActive
                          ? 'bg-amber-600 text-white ring-3 ring-amber-100 scale-105'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    <div>
                      <span className={`text-[11px] font-bold block whitespace-nowrap ${isActive ? 'text-amber-900' : 'text-stone-700'}`}>
                        {step.bangla}
                      </span>
                    </div>
                  </button>

                  {idx < 7 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 hidden sm:block ${
                        currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-stone-50/50">

          {/* ================= STEP 1: CATEGORY & SUBCATEGORY ================= */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ১: মূল ক্যাটাগরি ও সাব-ক্যাটাগরি নির্বাচন (Category Selection)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    পণ্যটি কোন মূল গ্রুপের আওতাভুক্ত এবং নির্দিষ্ট সাব-ক্যাটাগরি কী তা নির্ধারণ করুন।
                  </p>
                </div>

                {/* Main Category Cards */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    মূল ক্যাটাগরি নির্বাচন করুন (Main Category) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {mainCategoriesList.map((cat) => {
                      const catKey = (cat.name || cat.slug || '').toUpperCase();
                      const isSel = mainCategory.toUpperCase() === catKey || (cat.id && mainCategory === cat.id);
                      const icon = cat.icon || (catKey === 'MEN' ? '👨' : catKey === 'WOMEN' ? '👩' : catKey === 'KIDS' ? '🧒' : '🎁');
                      return (
                        <button
                          key={cat.id || cat.slug || cat.name}
                          type="button"
                          onClick={() => {
                            setMainCategory(catKey);
                            const firstSub = categories.find((c) => !c.isMain && ((c.parentCategory || '').toUpperCase() === catKey || c.parentCategoryId === cat.id));
                            if (firstSub) {
                              setSubCategory(firstSub.name);
                              const mapped = CATEGORY_MAPPINGS[firstSub.name];
                              if (mapped) setSkuPrefix(mapped.skuPrefix);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{icon}</span>
                            {isSel && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                          </div>
                          <div className="mt-2">
                            <span className="font-bold text-xs text-stone-900 block">{cat.banglaName || cat.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono block">{cat.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategory Select & Creator */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700">
                      সাব-ক্যাটাগরি নির্বাচন করুন ({mainCategory} Subcategory) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddSubModal(true)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন সাব-ক্যাটাগরি তৈরি করুন</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredSubcategories.map((sub) => {
                      const isSel = subCategory.toLowerCase() === sub.name.toLowerCase() || subCategory.toLowerCase() === (sub.slug || '').toLowerCase();
                      return (
                        <button
                          key={sub.id || sub.name}
                          type="button"
                          onClick={() => {
                            setSubCategory(sub.name);
                            const mapping = CATEGORY_MAPPINGS[sub.name];
                            if (mapping) {
                              setSkuPrefix(mapping.skuPrefix);
                              setSelectedSizeTemplate(mapping.defaultTemplate);
                              const tmpl = SIZE_TEMPLATES.find((t) => t.id === mapping.defaultTemplate);
                              if (tmpl) {
                                setActiveSizes(tmpl.defaultSizes);
                                setSizeChart(JSON.parse(JSON.stringify(tmpl.defaultChart)));
                              }
                            }
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                              : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                          }`}
                        >
                          <div className="font-bold text-xs">{sub.banglaName || sub.name}</div>
                          <div className={`text-[10px] ${isSel ? 'text-stone-300' : 'text-stone-400'}`}>
                            {sub.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Subcategory Creator Modal / Box */}
                {showAddSubModal && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">
                        {mainCategory} গ্রুপে নতুন সাব-ক্যাটাগরি যুক্ত করুন
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddSubModal(false)}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="নাম (English, e.g. Tupi)"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="নাম (বাংলা, যেমন: টুপি)"
                        value={newSubBangla}
                        onChange={(e) => setNewSubBangla(e.target.value)}
                        className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Slug (e.g. tupi)"
                        value={newSubSlug}
                        onChange={(e) => setNewSubSlug(e.target.value)}
                        className="text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSubModal(false)}
                        className="px-3 py-1.5 text-xs text-stone-600 bg-white border border-stone-200 rounded-lg"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        disabled={isCreatingSub}
                        onClick={handleCreateSubcategory}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        {isCreatingSub ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: BASIC INFO & SEO ================= */}
          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>ধাপ ২: পণ্যের সাধারণ তথ্য ও এসইও (Basic Info & SEO)</span>
                </h3>

                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      পণ্যের নাম (বাংলায়) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: ঐতিহ্যবাহী সিরাজগঞ্জের সুতি লুঙ্গি"
                      value={banglaName}
                      onChange={(e) => setBanglaName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sirajganj Handloom Cotton Lungi"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 bg-white text-stone-900"
                    />
                  </div>
                </div>

                {/* Brand & SKU Prefix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">ব্র্যান্ড (Brand)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      SKU Prefix (অটো জেনারেটর কোড)
                    </label>
                    <input
                      type="text"
                      value={skuPrefix}
                      onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      বিক্রয় মূল্য (Price ৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ছাড় মূল্য (Offer Price ৳)
                    </label>
                    <input
                      type="number"
                      value={baseOfferPrice}
                      onChange={(e) => setBaseOfferPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-amber-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      পূর্বের মূল্য (Compare At Price ৳)
                    </label>
                    <input
                      type="number"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-500"
                    />
                  </div>
                </div>

                {/* Availability & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">স্ট্যাটাস (Status)</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="active">সক্রিয় (Active / Live in Store)</option>
                      <option value="draft">ড্রাফট (Draft / Hidden)</option>
                      <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">লভ্যতা (Availability)</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as any)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="in_stock">ইন স্টক (In Stock)</option>
                      <option value="out_of_stock">স্টক শেষ (Out of Stock)</option>
                      <option value="pre_order">প্রি-অর্ডার (Pre-Order)</option>
                    </select>
                  </div>
                </div>

                {/* Flags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-stone-800">নতুন (New Arrival)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-stone-800">ফিচার্ড (Featured)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-stone-800">হট সেলস (Best Seller)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOffer}
                      onChange={(e) => setIsOffer(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-stone-800">অফার যোগ্য (Offer)</span>
                  </label>
                </div>

                {/* Descriptions */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      সংক্ষিপ্ত বিবরণ (Short Description)
                    </label>
                    <input
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 bg-white"
                      placeholder="আরামদায়ক ও ঐতিহ্যবাহী শতভাগ সুতি পোশাক"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      বিস্তারিত বিবরণ (Full Description)
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl border border-stone-300 bg-white"
                      placeholder="বস্ত্র শৈলীর বৈশিষ্ট্য, সুতা এবং যত্নের বিবরণ লিখুন..."
                    />
                  </div>
                </div>

                {/* Advanced SEO Section */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>গুগল সার্চ ও সোশ্যাল এসইও (Search Engine Optimization)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowJsonLdModal(!showJsonLdModal)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>JSON-LD Preview</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-stone-700">SEO URL Slug *</label>
                        <button
                          type="button"
                          onClick={generateSlugFromName}
                          className="text-[10px] text-amber-700 font-bold hover:underline"
                        >
                          নাম থেকে অটো তৈরি করুন
                        </button>
                      </div>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. sirajganj-handloom-cotton-lungi"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        ছবির Alt টেক্সট (Image Alt Text)
                      </label>
                      <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="e.g. সিরাজগঞ্জের সুতি লুঙ্গি কটন ফ্যাব্রিক"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-stone-700">SEO Meta Title (Title Tag)</label>
                      <span className="text-[10px] text-stone-400">{seoTitle.length}/60 Chars</span>
                    </div>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={banglaName ? `${banglaName} | BOSTROSHOILY` : 'BOSTROSHOILY'}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-stone-700">SEO Meta Description</label>
                      <span className="text-[10px] text-stone-400">{seoDescription.length}/160 Chars</span>
                    </div>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="খাঁটি দেশীয় সুতি কাপড়ের প্রিমিয়াম হস্তশিল্প পোশাক। ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পান সারা বাংলাদেশে।"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  {/* Google SERP Snippet Preview */}
                  <div className="p-3 bg-white rounded-xl border border-stone-200 mt-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      গুগল সার্চে যেভাবে প্রদর্শিত হবে (SERP Preview)
                    </span>
                    <div className="text-[11px] text-emerald-800 font-mono truncate">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://bostroshoily.onrender.com'}/product/{slug || 'product-slug'}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                      {seoTitle || banglaName || productName || 'BOSTROSHOILY — Authentic Handloom'}
                    </div>
                    <div className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                      {seoDescription || shortDescription || description.slice(0, 140)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: COLOR & PHOTOS PER COLOR ================= */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ৩: কালার ও প্রতি কালারের ছবি গ্যালারি (Color & Gallery Management)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    যেকোনো রঙের জন্য একাধিক ছবি আপলোড করুন। গ্রাহক ওয়েবসাইটে কালার নির্বাচন করলে কেবল সেই কালারের ছবিই প্রদর্শিত হবে।
                  </p>
                </div>

                {/* Color Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-800">উপলব্ধ কালার নির্বাচন করুন (Available Colors):</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomColor(!showAddCustomColor)}
                      className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>কাস্টম কালার যোগ করুন</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => {
                      const isSel = selectedColors.some((sc) => sc.name.toLowerCase() === c.name.toLowerCase());
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              if (selectedColors.length <= 1) {
                                showToast('অন্তত একটি কালার থাকতে হবে');
                                return;
                              }
                              setSelectedColors(selectedColors.filter((sc) => sc.name.toLowerCase() !== c.name.toLowerCase()));
                            } else {
                              setSelectedColors([...selectedColors, c]);
                              if (!colorGalleries[c.name]) {
                                setColorGalleries((prev) => ({ ...prev, [c.name]: [] }));
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSel
                              ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: c.hex }} />
                          <span>{c.banglaName}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-amber-700 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Creator */}
                {showAddCustomColor && (
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Color Name (EN)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="কালারের নাম (বাংলা)"
                      value={customColorBangla}
                      onChange={(e) => setCustomColorBangla(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customColorName.trim()) return;
                        const newC: ColorOption = {
                          id: customColorName.toLowerCase().replace(/\s+/g, '-'),
                          name: customColorName.trim(),
                          banglaName: customColorBangla.trim() || customColorName.trim(),
                          hex: customColorHex,
                        };
                        setSelectedColors([...selectedColors, newC]);
                        setColorGalleries((prev) => ({ ...prev, [newC.name]: [] }));
                        setActiveGalleryColor(newC.name);
                        setCustomColorName('');
                        setCustomColorBangla('');
                        setShowAddCustomColor(false);
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                )}

                {/* Gallery per color tabs */}
                <div className="pt-4 border-t border-stone-200 space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedColors.map((col) => {
                      const isActive = activeGalleryColor === col.name;
                      const count = (colorGalleries[col.name] || []).length;
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setActiveGalleryColor(col.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                          <span>{col.banglaName}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-700'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Color Photo Upload Box */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-stone-800 block">
                          &apos;{activeGalleryColor}&apos; কালারের জন্য ছবি আপলোড করুন
                        </span>
                        <span className="text-[11px] text-stone-500">
                          কম্পিউটার বা মোবাইল থেকে একসাথে একাধিক ছবি নির্বাচন করতে পারেন।
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs">
                          <Upload className="w-4 h-4" />
                          <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            disabled={isUploading}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Bulk URL input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন (https://...)"
                        value={bulkUrlInput}
                        onChange={(e) => setBulkUrlInput(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!bulkUrlInput.trim()) return;
                          setColorGalleries((prev) => ({
                            ...prev,
                            [activeGalleryColor]: [...(prev[activeGalleryColor] || []), bulkUrlInput.trim()],
                          }));
                          setBulkUrlInput('');
                        }}
                        className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        যুক্ত করুন
                      </button>
                    </div>

                    {/* Thumbnails grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {(colorGalleries[activeGalleryColor] || []).map((imgUrl, idx) => {
                        const isMainCover = customMainImage === imgUrl;
                        return (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-xl overflow-hidden border bg-stone-100 shadow-2xs ${
                              isMainCover ? 'ring-2 ring-amber-500 border-amber-500' : 'border-stone-200'
                            }`}
                          >
                            <img src={imgUrl} alt="Variant" className="w-full h-full object-cover" />

                            {/* Badge */}
                            {isMainCover && (
                              <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
                                প্রধান কভার
                              </span>
                            )}

                            {/* Delete Cross (✕) Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(activeGalleryColor, idx)}
                              title="ছবি মুছে ফেলুন"
                              className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-110"
                            >
                              ✕
                            </button>

                            {/* Set Cover Photo Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setCustomMainImage(imgUrl);
                                showToast('প্রধান কভার ছবি হিসেবে সেট করা হয়েছে');
                              }}
                              className={`absolute bottom-1 inset-x-1 py-1 rounded text-[10px] font-bold text-center transition-colors shadow-xs z-10 cursor-pointer ${
                                isMainCover
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-stone-900/80 hover:bg-stone-950 text-white'
                              }`}
                            >
                              {isMainCover ? '★ কভার ছবি' : 'কভার ছবি বানান'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SIZE CHART MANAGEMENT ================= */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ৪: সাইজ চার্ট ও পরিমাপ ব্যবস্থাপনা (Size Chart Management)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    পণ্যের জন্য সঠিক সাইজ চার্ট নির্বাচন করুন অথবা কাস্টম পরিমাপ টেবিল তৈরি করুন।
                  </p>
                </div>

                {/* 1. Available Sizes Checkbox Selection from Size Chart Management */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-700" />
                        <span>সাব-ক্যাটাগরির সাইজ নির্বাচন ({subCategory} Sizes) *</span>
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        সাইজ চার্ট ম্যানেজমেন্ট থেকে লোড করা সাইজগুলো নিচে প্রদর্শিত। যে যে সাইজ এই পণ্যে থাকবে সেগুলোতে টিক চিহ্ন দিন:
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                      নির্বাচিত: {activeSizes.length} টি সাইজ
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {candidateSizes.map((sz: string) => {
                      const isChecked = activeSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (activeSizes.length <= 1) {
                                showToast('কমপক্ষে ১টি সাইজ সিলেক্ট থাকতে হবে');
                                return;
                              }
                              setActiveSizes(activeSizes.filter((s) => s !== sz));
                            } else {
                              setActiveSizes([...activeSizes, sz]);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-stone-300 bg-stone-50'}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{sz}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size */}
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60 max-w-sm">
                    <input
                      type="text"
                      placeholder="নতুন সাইজ লিখতে পারেন..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customSizeInput.trim()) return;
                        const val = customSizeInput.trim();
                        if (!activeSizes.includes(val)) {
                          setActiveSizes([...activeSizes, val]);
                        }
                        setCustomSizeInput('');
                        showToast(`'${val}' সাইজ যুক্ত হয়েছে`);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>

                {/* DB Size Charts Integration (Phase 4 & 5.4) */}
                {(() => {
                  const assignedDbChart = dbSizeCharts.find(
                    (c) =>
                      c.subCategory?.toLowerCase() === subCategory?.toLowerCase() ||
                      c.categorySlug?.toLowerCase() === subCategory?.toLowerCase()
                  );

                  return (
                    <div className="space-y-4">
                      {assignedDbChart ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span className="font-bold text-xs text-emerald-950">
                                সাইজ চার্ট ম্যানেজমেন্ট থেকে স্বয়ংক্রিয়ভাবে সংযুক্ত চার্ট:
                              </span>
                            </div>
                            <h4 className="font-black text-sm text-stone-900 pl-7">
                              {assignedDbChart.banglaName || assignedDbChart.name}
                            </h4>
                            <p className="text-[11px] text-stone-600 pl-7">
                              মোড: {assignedDbChart.mode === 'image' ? 'ছবি চার্ট' : (assignedDbChart.mode === 'both' ? 'ছবি + মাপ টেবিল' : 'পরিমাপ টেবিল')} • একক: {assignedDbChart.unit === 'cm' ? 'সেমি' : 'ইঞ্চি'} • সাব-ক্যাটাগরি: {assignedDbChart.subCategory}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 pl-7 md:pl-0">
                            {assignedDbChart.imageUrl && (
                              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200">
                                <img
                                  src={assignedDbChart.imageUrl}
                                  alt="Chart Preview"
                                  className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                                />
                                <span className="text-[10px] font-bold text-emerald-800">
                                  ছবি চার্ট সক্রিয়
                                </span>
                              </div>
                            )}
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shrink-0">
                              সক্রিয় চার্ট লিংকড
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900">
                            <span className="font-bold">নোট:</span> &quot;{subCategory}&quot; সাবক্যাটাগরির জন্য সাইজ চার্ট ম্যানেজমেন্টে কোনো ডেডিকেটেড চার্ট পাওয়া যায়নি। আপনি নিচের তৈরি করা সাইজ টেমপ্লেট থেকে একটি নির্বাচন করতে পারেন অথবা কাস্টম মাপ টেবিল সম্পাদনা করতে পারেন।
                          </div>
                        </div>
                      )}

                      {/* DB Size Charts Picker */}
                      {dbSizeCharts.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-2">
                            ডাটাবেজে সংরক্ষিত সাইজ চার্ট তালিকা থেকে নির্বাচন করুন:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {dbSizeCharts.map((chart) => {
                              const isChartSel =
                                chart.subCategory?.toLowerCase() === subCategory?.toLowerCase() ||
                                selectedSizeTemplate === chart.id;
                              return (
                                <button
                                  key={chart.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSizeTemplate(chart.id);
                                    if (chart.measurementsJson) {
                                      try {
                                        const parsed =
                                          typeof chart.measurementsJson === 'string'
                                            ? JSON.parse(chart.measurementsJson)
                                            : chart.measurementsJson;
                                        if (parsed.columns && parsed.rows) {
                                          const headers = ['Size', ...parsed.columns.map((c: any) => c.label)];
                                          const rows = parsed.rows.map((r: any) => {
                                            const rowObj: Record<string, string> = { Size: r.size };
                                            parsed.columns.forEach((col: any) => {
                                              rowObj[col.label] = r[col.id] || '';
                                            });
                                            return rowObj;
                                          });
                                          setSizeChart({
                                            headers,
                                            rows,
                                            unit: chart.unit || 'inch',
                                            imageUrl: chart.imageUrl || '',
                                          });
                                          setSizeChartUnit((chart.unit as 'inch' | 'cm') || 'inch');
                                          setActiveSizes(parsed.rows.map((r: any) => r.size));
                                        }
                                      } catch {}
                                    } else if (chart.imageUrl) {
                                      setSizeChart((prev) => ({
                                        ...prev,
                                        imageUrl: chart.imageUrl,
                                      }));
                                    }
                                    if (chart.availableSizesJson) {
                                      try {
                                        const parsedSizes = typeof chart.availableSizesJson === 'string'
                                          ? JSON.parse(chart.availableSizesJson)
                                          : chart.availableSizesJson;
                                        if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                                          setActiveSizes(parsedSizes);
                                        }
                                      } catch {}
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                                    isChartSel
                                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                                      : 'border-stone-200 bg-white hover:border-stone-300'
                                  }`}
                                >
                                  <div className="font-bold text-xs text-stone-900">{chart.banglaName || chart.name}</div>
                                  <div className="text-[10px] text-stone-500 mt-0.5">
                                    {chart.subCategory} • {chart.mode === 'image' ? 'ছবি চার্ট' : 'পরিমাপ টেবিল'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Templates Selector */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    ডিফল্ট সাইজ টেমপ্লেট নির্বাচন করুন (Built-in Standard Templates):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SIZE_TEMPLATES.map((tmpl) => {
                      const isSel = selectedSizeTemplate === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => {
                            setSelectedSizeTemplate(tmpl.id);
                            if (tmpl.defaultSizes) setActiveSizes(tmpl.defaultSizes);
                            if (tmpl.defaultChart) setSizeChart(JSON.parse(JSON.stringify(tmpl.defaultChart)));
                          }}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            isSel
                              ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="font-bold text-xs text-stone-900">{tmpl.name.split('(')[0]}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{tmpl.banglaName}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Table */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden pt-2 bg-stone-50/50">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-stone-200">
                    <span className="text-xs font-bold text-stone-800">পরিমাপ তালিকা (Measurement Matrix)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newRow: Record<string, string> = {};
                          sizeChart.headers.forEach((h) => {
                            newRow[h] = h === 'Size' ? `Size ${sizeChart.rows.length + 1}` : '';
                          });
                          setSizeChart((prev) => ({ ...prev, rows: [...prev.rows, newRow] }));
                        }}
                        className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg"
                      >
                        + রো যোগ করুন
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-3">
                    <table className="w-full text-xs text-left bg-white rounded-xl border border-stone-200">
                      <thead>
                        <tr className="bg-stone-100 text-stone-700 font-bold">
                          {sizeChart.headers.map((h, i) => (
                            <th key={i} className="p-2.5 border-b border-stone-200">{h}</th>
                          ))}
                          <th className="p-2.5 border-b border-stone-200 w-10 text-center">মুছুন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeChart.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-stone-100 hover:bg-stone-50">
                            {sizeChart.headers.map((h, hIdx) => (
                              <td key={hIdx} className="p-2">
                                <input
                                  type="text"
                                  value={row[h] || ''}
                                  onChange={(e) => {
                                    const updated = [...sizeChart.rows];
                                    updated[rIdx] = { ...updated[rIdx], [h]: e.target.value };
                                    setSizeChart((prev) => ({ ...prev, rows: updated }));
                                  }}
                                  className="w-full px-2 py-1 border border-stone-200 rounded text-xs"
                                />
                              </td>
                            ))}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (sizeChart.rows.length <= 1) return;
                                  setSizeChart((prev) => ({
                                    ...prev,
                                    rows: prev.rows.filter((_, i) => i !== rIdx),
                                  }));
                                }}
                                className="text-stone-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: COLOR X SIZE VARIANT MATRIX ================= */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>ধাপ ৫: কালার x সাইজ ভ্যারিয়েন্ট ও স্টক ম্যাট্রিক্স (Variant Matrix)</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      প্রতিটি কালার ও সাইজ কম্বিনেশনের জন্য পৃথক SKU, মূল্য এবং স্টক ট্র্যাক করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl">
                      মোট স্টক: {totalCalculatedStock} টি
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantsMatrix((prev) =>
                          prev.map((v) => ({
                            ...v,
                            price: basePrice,
                            offerPrice: baseOfferPrice,
                            stock: baseStock,
                          }))
                        );
                        showToast('সকল ভ্যারিয়েন্টে বেস মূল্য ও স্টক প্রয়োগ করা হয়েছে!');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition cursor-pointer"
                    >
                      বেস মূল্য ও স্টক প্রয়োগ করুন
                    </button>
                  </div>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">সক্রিয়</th>
                        <th className="p-3">কালার</th>
                        <th className="p-3">সাইজ</th>
                        <th className="p-3">SKU কোড</th>
                        <th className="p-3">মূল্য (৳)</th>
                        <th className="p-3">অফার মূল্য (৳)</th>
                        <th className="p-3">স্টক</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {variantsMatrix.map((v, idx) => (
                        <tr key={v.id || idx} className={v.enabled ? 'hover:bg-stone-50' : 'bg-stone-100/60 opacity-60'}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={v.enabled}
                              onChange={(e) => {
                                const copy = [...variantsMatrix];
                                copy[idx].enabled = e.target.checked;
                                setVariantsMatrix(copy);
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                          </td>
                          <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: v.colorCode }} />
                            <span>{v.color}</span>
                          </td>
                          <td className="p-3 font-semibold text-stone-800">{v.size}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const copy = [...variantsMatrix];
                                copy[idx].sku = e.target.value.toUpperCase();
                                setVariantsMatrix(copy);
                              }}
                              className="px-2 py-1 rounded border border-stone-200 font-mono text-[11px] w-28 uppercase"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const copy = [...variantsMatrix];
                                copy[idx].price = Number(e.target.value);
                                setVariantsMatrix(copy);
                              }}
                              className="px-2 py-1 rounded border border-stone-200 w-20 font-bold text-stone-900"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.offerPrice}
                              onChange={(e) => {
                                const copy = [...variantsMatrix];
                                copy[idx].offerPrice = Number(e.target.value);
                                setVariantsMatrix(copy);
                              }}
                              className="px-2 py-1 rounded border border-stone-200 w-20 font-bold text-amber-700"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const copy = [...variantsMatrix];
                                copy[idx].stock = Number(e.target.value);
                                setVariantsMatrix(copy);
                              }}
                              className="px-2 py-1 rounded border border-stone-200 w-16 font-bold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: RELATED PRODUCTS ================= */}
          {currentStep === 6 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ৬: সংশ্লিষ্ট পণ্য নির্বাচন (Related Products / Recommendations)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    পণ্য বিবরণী পেজের (PDP) নিচে প্রদর্শনের জন্য বিভিন্ন ক্যাটাগরি ও সাবক্যাটাগরি থেকে পছন্দের পণ্য নির্বাচন করুন। নির্বাচনের তালিকা স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
                  </p>
                </div>

                {/* Selected Counter & Chips */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950">
                      নির্বাচিত সংশ্লিষ্ট পণ্য: <span className="font-mono text-amber-700">{selectedRelatedIds.length}</span> টি
                    </span>
                    {selectedRelatedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRelatedIds([])}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        সব নির্বাচন বাতিল
                      </button>
                    )}
                  </div>
                  {selectedRelatedIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {selectedRelatedIds.map((id) => {
                        const p = allProducts.find((prod) => prod.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-amber-300 text-stone-800 shadow-2xs"
                          >
                            <img src={p?.mainImage || '/bastra-shoily-logo.svg'} alt="" className="w-4 h-4 rounded object-cover" />
                            <span className="truncate max-w-[140px]">{p?.banglaName || p?.name || id}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedRelatedIds(selectedRelatedIds.filter((x) => x !== id))}
                              className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 italic">এখনও কোনো সংশ্লিষ্ট পণ্য নির্বাচন করা হয়নি।</p>
                  )}
                </div>

                {/* Two Subcategory Selection Tabs as requested */}
                <div className="space-y-4">
                  <div className="flex border-b border-stone-200">
                    <button
                      type="button"
                      onClick={() => setActiveRelatedSlot(1)}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeRelatedSlot === 1
                          ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                          : 'border-transparent text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <span>অপশন ১: প্রথম সাব-ক্যাটাগরি</span>
                      {relatedSlot1Sub !== 'all' && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900">
                          {relatedSlot1Sub}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveRelatedSlot(2)}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                        activeRelatedSlot === 2
                          ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                          : 'border-transparent text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <span>অপশন ২: দ্বিতীয় সাব-ক্যাটাগরি</span>
                      {relatedSlot2Sub !== 'all' && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900">
                          {relatedSlot2Sub}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Active Slot Controls */}
                  {activeRelatedSlot === 1 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">১ম মূল ক্যাটাগরি নির্বাচন</label>
                        <select
                          value={relatedSlot1Main}
                          onChange={(e) => {
                            setRelatedSlot1Main(e.target.value);
                            setRelatedSlot1Sub('all');
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          {mainCategoriesList.map((m) => (
                            <option key={m.id || m.name} value={(m.name || m.slug).toUpperCase()}>
                              {m.banglaName || m.name} ({m.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">১ম সাব-ক্যাটাগরি নির্বাচন</label>
                        <select
                          value={relatedSlot1Sub}
                          onChange={(e) => setRelatedSlot1Sub(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="all">-- সাব-ক্যাটাগরি বেছে নিন --</option>
                          {categories
                            .filter((c) => !c.isMain && (c.parentCategory || '').toUpperCase() === relatedSlot1Main.toUpperCase())
                            .map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.banglaName || c.name} ({c.name})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অনুসন্ধান (নাম বা SKU)</label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                          <input
                            type="text"
                            placeholder="পণ্য খুঁজুন..."
                            value={relatedSearch}
                            onChange={(e) => setRelatedSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">২য় মূল ক্যাটাগরি নির্বাচন</label>
                        <select
                          value={relatedSlot2Main}
                          onChange={(e) => {
                            setRelatedSlot2Main(e.target.value);
                            setRelatedSlot2Sub('all');
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          {mainCategoriesList.map((m) => (
                            <option key={m.id || m.name} value={(m.name || m.slug).toUpperCase()}>
                              {m.banglaName || m.name} ({m.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">২য় সাব-ক্যাটাগরি নির্বাচন</label>
                        <select
                          value={relatedSlot2Sub}
                          onChange={(e) => setRelatedSlot2Sub(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="all">-- সাব-ক্যাটাগরি বেছে নিন --</option>
                          {categories
                            .filter((c) => !c.isMain && (c.parentCategory || '').toUpperCase() === relatedSlot2Main.toUpperCase())
                            .map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.banglaName || c.name} ({c.name})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অনুসন্ধান (নাম বা SKU)</label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                          <input
                            type="text"
                            placeholder="পণ্য খুঁজুন..."
                            value={relatedSearch}
                            onChange={(e) => setRelatedSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Grid with Checkboxes for Active Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-stone-200 rounded-2xl p-3 bg-stone-50/40">
                  {allProducts
                    .filter((p) => p.id !== initialProduct?.id)
                    .filter((p) => {
                      const currentMain = activeRelatedSlot === 1 ? relatedSlot1Main : relatedSlot2Main;
                      const currentSub = activeRelatedSlot === 1 ? relatedSlot1Sub : relatedSlot2Sub;

                      if (currentMain) {
                        const pCat = (p.category || '').toUpperCase();
                        if (pCat !== currentMain.toUpperCase() && !pCat.includes(currentMain.toUpperCase())) return false;
                      }
                      if (currentSub !== 'all') {
                        const pSub = (p.subCategory || '').toLowerCase();
                        if (pSub !== currentSub.toLowerCase() && !pSub.includes(currentSub.toLowerCase())) return false;
                      }
                      if (relatedSearch.trim()) {
                        const q = relatedSearch.toLowerCase();
                        const mName = p.name?.toLowerCase().includes(q);
                        const mBn = p.banglaName?.toLowerCase().includes(q);
                        const mSku = p.sku?.toLowerCase().includes(q);
                        return mName || mBn || mSku;
                      }
                      return true;
                    })
                    .map((p) => {
                      const isSel = selectedRelatedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isSel) {
                              setSelectedRelatedIds(selectedRelatedIds.filter((id) => id !== p.id));
                            } else {
                              setSelectedRelatedIds([...selectedRelatedIds, p.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${
                            isSel
                              ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-500/20 shadow-xs'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer shrink-0"
                          />
                          <img
                            src={p.mainImage || '/bastra-shoily-logo.svg'}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-stone-900 block truncate">{p.banglaName || p.name}</span>
                            <span className="text-[10px] text-stone-500 block">
                              ৳{p.discountPrice || p.price} • {p.subCategory}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 7: PRODUCT ADD-ONS / OPTIONAL EXTRAS ================= */}
          {currentStep === 7 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ৭: পণ্য অ্যাড-অন সিস্টেম (Product Add-on & Upsell System)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    পণ্য অর্ডারের সময় গ্রাহকের জন্য সাথে গিফট বক্স, আতর, টুপি ইত্যাদি অ্যাড-অন যুক্ত করার সুনির্দিষ্ট দুটি বিকল্প:
                  </p>
                </div>

                {/* TWO OPTIONS SWITCHER TABS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddonMode('option1_upload')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      addonMode === 'option1_upload'
                        ? 'border-[#240B07] bg-[#240B07]/5 ring-2 ring-[#240B07]'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Upload className={`w-5 h-5 shrink-0 ${addonMode === 'option1_upload' ? 'text-[#240B07]' : 'text-stone-400'}`} />
                    <div>
                      <div className="font-bold text-xs text-stone-900">অপশন ১: ডিভাইস গ্যালারি থেকে আপলোড</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        ডিভাইস থেকে কাস্টম ছবি, নাম, বিবরণ ও মূল্য দিয়ে নতুন অ্যাড-অন তৈরি করুন।
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddonMode('option2_catalog')}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      addonMode === 'option2_catalog'
                        ? 'border-[#240B07] bg-[#240B07]/5 ring-2 ring-[#240B07]'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <ShoppingBag className={`w-5 h-5 shrink-0 ${addonMode === 'option2_catalog' ? 'text-[#240B07]' : 'text-stone-400'}`} />
                    <div>
                      <div className="font-bold text-xs text-stone-900">অপশন ২: বিদ্যমান পণ্য থেকে নির্বাচন</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        ক্যাটাগরি ও সাবক্যাটাগরি ফিল্টার করে ক্যাটালগের পণ্য সরাসরি অ্যাড-অন হিসেবে যুক্ত করুন।
                      </div>
                    </div>
                  </button>
                </div>

                {/* OPTION 1: DEVICE GALLERY UPLOAD */}
                {addonMode === 'option1_upload' && (
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-4">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#240B07]" />
                      <span>কাস্টম অ্যাড-অন তথ্য প্রদান করুন</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অ্যাড-অন ছবির URL অথবা সরাসরি গ্যালারি থেকে আপলোড *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="ছবির URL অথবা পাশে গ্যালারি থেকে আপলোড করুন"
                            value={customAddonImage}
                            onChange={(e) => setCustomAddonImage(e.target.value)}
                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                          />
                          <label className="px-3 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>গ্যালারি</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await uploadFileToGallery(file);
                                    setCustomAddonImage(url);
                                    showToast('অ্যাড-অন ছবি সফলভাবে আপলোড হয়েছে!');
                                  } catch {
                                    showToast('ছবি আপলোডে ত্রুটি হয়েছে');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {customAddonImage && (
                          <div className="mt-2 flex items-center gap-2">
                            <img src={customAddonImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                            <span className="text-[10px] text-emerald-700 font-bold">✓ ছবি সংযুক্ত হয়েছে</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অ্যাড-অন নাম / শিরোনাম (বাংলা) *</label>
                        <input
                          type="text"
                          placeholder="যেমন: আকর্ষণীয় প্রিমিয়াম গিফট বক্স"
                          value={customAddonTitle}
                          onChange={(e) => setCustomAddonTitle(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অ্যাড-অন অতিরিক্ত মূল্য (৳) *</label>
                        <input
                          type="number"
                          placeholder="যেমন: ২৯০"
                          value={customAddonPrice}
                          onChange={(e) => setCustomAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-amber-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                        <input
                          type="text"
                          placeholder="রিজিড ম্যাগনেটিক বক্স, রিবন ও স্পেশাল কার্ডসহ"
                          value={customAddonDesc}
                          onChange={(e) => setCustomAddonDesc(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!customAddonTitle.trim()) {
                          showToast('অ্যাড-অন নাম প্রদান করুন');
                          return;
                        }
                        const newAddon: ProductAddon = {
                          id: `addon-custom-${Date.now()}`,
                          productId: initialProduct?.id || 'new',
                          addonProductId: `custom-prod-${Date.now()}`,
                          addonType: 'custom',
                          customImage: customAddonImage || '/bastra-shoily-logo.svg',
                          customName: customAddonTitle.trim(),
                          customTitleBn: customAddonTitle.trim(),
                          customDescriptionBn: customAddonDesc.trim(),
                          priceOverride: customAddonPrice === '' ? 0 : Number(customAddonPrice),
                          sortOrder: addons.length + 1,
                          isActive: true,
                        };
                        setAddons([...addons, newAddon]);
                        setCustomAddonTitle('');
                        setCustomAddonImage('');
                        setCustomAddonDesc('');
                        setCustomAddonPrice('');
                        showToast('কাস্টম অ্যাড-অন তালিকায় যোগ হয়েছে');
                      }}
                      className="px-4 py-2 bg-[#240B07] text-[#FFF8ED] rounded-xl text-xs font-bold hover:bg-[#38120B] transition"
                    >
                      + তালিকায় যোগ করুন
                    </button>
                  </div>
                )}

                {/* OPTION 2: EXISTING PRODUCT SELECTION */}
                {addonMode === 'option2_catalog' && (
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-4">
                    <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#240B07]" />
                      <span>ক্যাটালগ থেকে পণ্য নির্বাচন</span>
                    </h4>

                    {/* Step 1 & 2: Category & Subcategory Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">১. মূল ক্যাটাগরি</label>
                        <select
                          value={addonCatalogMain}
                          onChange={(e) => {
                            setAddonCatalogMain(e.target.value);
                            setAddonCatalogSub('all');
                          }}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="OTHERS & ACCESSORIES">OTHERS & ACCESSORIES (উপহার ও আনুষঙ্গিক)</option>
                          <option value="MEN">MEN (পুরুষদের পোশাক)</option>
                          <option value="WOMEN">WOMEN (মহিলাদের পোশাক)</option>
                          <option value="KIDS">KIDS (শিশুদের পোশাক)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">২. সাবক্যাটাগরি</label>
                        <select
                          value={addonCatalogSub}
                          onChange={(e) => setAddonCatalogSub(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="all">সকল সাবক্যাটাগরি</option>
                          {categories
                            .filter((c) => !c.isMain && (addonCatalogMain === 'all' || c.parentCategory === addonCatalogMain))
                            .map((c) => (
                              <option key={c.id} value={c.slug}>
                                {c.banglaName} ({c.name})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">অনুসন্ধান</label>
                        <input
                          type="text"
                          placeholder="নাম দিয়ে খুঁজুন..."
                          value={addonCatalogSearch}
                          onChange={(e) => setAddonCatalogSearch(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>

                    {/* Published Product Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto border border-stone-200 rounded-xl p-3 bg-white">
                      {allProducts
                        .filter((p) => p.id !== initialProduct?.id)
                        .filter((p) => {
                          if (addonCatalogMain !== 'all') {
                            const pCat = (p.category || '').toUpperCase();
                            if (pCat !== addonCatalogMain && !pCat.includes(addonCatalogMain)) {
                              // Special case for OTHERS
                              if (addonCatalogMain.includes('OTHERS') && pCat !== 'OTHERS') return false;
                            }
                          }
                          if (addonCatalogSub !== 'all') {
                            if ((p.subCategory || '').toLowerCase() !== addonCatalogSub.toLowerCase()) return false;
                          }
                          if (addonCatalogSearch.trim()) {
                            const q = addonCatalogSearch.toLowerCase();
                            return p.name.toLowerCase().includes(q) || p.banglaName.toLowerCase().includes(q);
                          }
                          return true;
                        })
                        .map((p) => {
                          const isAlreadyAdded = addons.some((a) => a.addonProductId === p.id);
                          return (
                            <div key={p.id} className="p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2 bg-stone-50/50">
                              <img src={p.mainImage || '/bastra-shoily-logo.svg'} alt="" className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-xs text-stone-900 block truncate">{p.banglaName || p.name}</span>
                                <span className="text-[10px] text-amber-700 font-bold block font-mono">৳{p.discountPrice || p.price}</span>
                              </div>
                              <button
                                type="button"
                                disabled={isAlreadyAdded}
                                onClick={() => {
                                  setAddons([
                                    ...addons,
                                    {
                                      id: `addon-${Date.now()}-${addons.length}`,
                                      productId: initialProduct?.id || 'new',
                                      addonProductId: p.id,
                                      addonType: 'existing',
                                      customTitleBn: p.banglaName || p.name,
                                      customDescriptionBn: p.shortDescription || '',
                                      priceOverride: p.discountPrice || p.price,
                                      sortOrder: addons.length + 1,
                                      isActive: true,
                                      addonProduct: p,
                                    },
                                  ]);
                                  showToast(`"${p.banglaName || p.name}" অ্যাড-অন যুক্ত হয়েছে`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                                  isAlreadyAdded
                                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                                    : 'bg-[#240B07] text-[#FFF8ED] hover:bg-[#38120B]'
                                }`}
                              >
                                {isAlreadyAdded ? 'যুক্ত আছে' : '+ নির্বাচন'}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* CURRENT CONFIGURED ADD-ONS LIST */}
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <h4 className="font-bold text-xs text-stone-900">
                    কনফিগার করা অ্যাড-অন তালিকা ({addons.length} টি):
                  </h4>

                  {addons.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">কোনো অ্যাড-অন কনফিগার করা হয়নি। উপরের অপশন ১ বা ২ থেকে যুক্ত করুন।</p>
                  ) : (
                    addons.map((a, idx) => {
                      const matchedProd = allProducts.find((p) => p.id === a.addonProductId);
                      const displayImg = a.customImage || matchedProd?.mainImage || '/bastra-shoily-logo.svg';
                      return (
                        <div key={a.id || idx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={displayImg} alt="" className="w-12 h-12 rounded-lg object-cover border border-amber-200 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-stone-900">
                                  {a.customTitleBn || a.customName || matchedProd?.banglaName || matchedProd?.name}
                                </span>
                                <span className="text-[10px] font-bold bg-[#240B07]/10 text-[#240B07] px-2 py-0.5 rounded">
                                  {a.addonType === 'custom' ? 'কাস্টম আপলোড' : 'বিদ্যমান পণ্য'}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {a.customDescriptionBn || matchedProd?.shortDescription || 'কোনো বিবরণ নেই'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pl-15 sm:pl-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold text-stone-600">মূল্য:</span>
                              <input
                                type="number"
                                value={a.priceOverride ?? 0}
                                onChange={(e) => {
                                  const copy = [...addons];
                                  copy[idx].priceOverride = Number(e.target.value);
                                  setAddons(copy);
                                }}
                                className="w-20 px-2 py-1 text-xs font-bold border border-stone-300 rounded-lg text-amber-900 bg-white"
                              />
                              <span className="text-xs font-bold text-stone-700">৳</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setAddons(addons.filter((_, i) => i !== idx))}
                              className="text-stone-400 hover:text-rose-600 p-1"
                              title="মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 8: PREVIEW & PUBLISH ================= */}
          {currentStep === 8 && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>ধাপ ৮: লাইভ প্রিভিউ ও প্রকাশনা (Live Customer Preview & Publish)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    গ্রাহকের ওয়েবসাইটে পণ্যটি ঠিক যেভাবে দৃশ্যমান হবে তা যাচাই করে সরাসরি প্রকাশ করুন।
                  </p>
                </div>

                {/* PDP Card Preview */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 max-w-xl mx-auto space-y-4">
                  <div className="aspect-4/5 rounded-2xl overflow-hidden bg-stone-200 relative shadow-sm">
                    <img src={resolvedMainImage} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-stone-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {mainCategory} • {subCategory}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-stone-900">
                      {banglaName || productName || 'পণ্যের নাম'}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-amber-700 font-mono">
                        ৳{baseOfferPrice < basePrice ? baseOfferPrice : basePrice}
                      </span>
                      {baseOfferPrice < basePrice && (
                        <span className="text-xs text-stone-400 line-through font-mono">
                          ৳{basePrice}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {availability === 'in_stock' ? 'স্টকে আছে' : 'প্রি-অর্ডার'}
                      </span>
                    </div>

                    {/* Colors preview */}
                    <div className="pt-2">
                      <span className="text-xs font-bold text-stone-700 block mb-1.5">কালার নির্বাচন:</span>
                      <div className="flex gap-2">
                        {selectedColors.map((c) => (
                          <div key={c.name} className="flex items-center gap-1 text-[11px] font-bold bg-white px-2 py-1 rounded-lg border border-stone-200">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                            <span>{c.banglaName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add-on Card Preview on PDP */}
                    {addons.length > 0 && (
                      <div className="pt-3 border-t border-stone-200">
                        <span className="text-xs font-bold text-amber-900 block mb-2">
                          🎁 সাথে আকর্ষণীয় উপহার সামগ্রী যুক্ত করুন:
                        </span>
                        {addons.map((a, i) => (
                          <div key={i} className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" readOnly className="rounded text-amber-600" />
                              <div>
                                <span className="text-xs font-bold text-stone-900 block">{a.customTitleBn}</span>
                                <span className="text-[10px] text-stone-500 block">{a.customDescriptionBn}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-900 font-mono">+৳{a.priceOverride}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pre-Publish Checklist */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                  <span className="text-xs font-bold text-stone-800 block">প্রকাশের পূর্ববর্তী চেকলিস্ট:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ক্যাটাগরি: {mainCategory} / {subCategory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>মূল্য: ৳{basePrice} (অফার: ৳{baseOfferPrice})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>কালার সংখ্যা: {selectedColors.length} টি</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>মোট ভ্যারিয়েন্ট স্টক: {totalCalculatedStock} টি</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-white border-t border-stone-200 px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী ধাপ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
              >
                বাতিল করুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFinalSubmit('draft')}
              className="px-4 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ড্রাফট সেভ করুন</span>
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>পরবর্তী ধাপ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinalSubmit('active')}
                className="px-6 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>সরাসরি প্রকাশ করুন (Publish)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
