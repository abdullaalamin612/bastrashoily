import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Tag,
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  Eye,
  RefreshCw,
  Gift,
  Upload,
  Palette,
  Image as ImageIcon,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

const toBengaliDigits = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '২০';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
};

export interface ComboItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface ComboOffer {
  id: string;
  title: string;
  banglaTitle?: string;
  tagline?: string;
  description?: string;
  badge?: string;
  headline?: string;
  discountText?: string;
  discountPercent?: number;
  categorySlug?: string;
  categoryName?: string;
  badgeCircleText?: string;
  themeColor?: string;
  accentColor?: string;
  circleImage?: string;
  productIds?: string[];
  logoImage?: string;
  originalPrice: number;
  comboPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  items: ComboItem[];
  image?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  displayOrder: number;
  boxWidth?: number;
  circleSize?: number;
}

const THEME_PRESETS = [
  { name: 'চকোলেট / মেহগনি (ডিফল্ট)', color: '#2B1208' },
  { name: 'রয়্যাল নেভি ব্লু', color: '#0B1B3D' },
  { name: 'ডীপ এমারেল্ড গ্রিন', color: '#0D2818' },
  { name: 'রয়্যাল মেরুন / রুবি', color: '#3B0A11' },
  { name: 'ক্লাসিক চারকোল / ব্ল্যাক', color: '#161616' },
  { name: 'এম্বার উড', color: '#381B09' },
];

const ACCENT_PRESETS = [
  { name: 'অ্যান্টিক গোল্ড (ডিফল্ট)', color: '#DFB788' },
  { name: 'উজ্জ্বল এম্বার', color: '#E6A868' },
  { name: 'রোজ গোল্ড', color: '#E2A99D' },
  { name: 'সিলভার হোয়াইট', color: '#E2E8F0' },
];

const DEFAULT_REFERENCE_IMAGE =
  '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg';

export const ComboOffersModule: React.FC = () => {
  const { products, categories, showToast } = useShop();

  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboOffer | null>(null);
  const [previewCombo, setPreviewCombo] = useState<ComboOffer | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('স্পেশাল কম্বো');
  const [headline, setHeadline] = useState('সকল গিফট বক্সে');
  const [discountText, setDiscountText] = useState('ফ্ল্যাট ২০% ডিসকাউন্ট');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [categorySlug, setCategorySlug] = useState('gift-box');
  const [categoryName, setCategoryName] = useState('সকল গিফট বক্স');
  const [badgeCircleText, setBadgeCircleText] = useState('কাঁথাফোঁড়');
  const [themeColor, setThemeColor] = useState('#2B1208');
  const [accentColor, setAccentColor] = useState('#DFB788');
  const [circleImage, setCircleImage] = useState(DEFAULT_REFERENCE_IMAGE);
  const [logoImage, setLogoImage] = useState('');
  const [boxWidth, setBoxWidth] = useState<number>(780);
  const [circleSize, setCircleSize] = useState<number>(180);
  const [comboPrice, setComboPrice] = useState<number>(1500);
  const [originalPrice, setOriginalPrice] = useState<number>(2000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Combos
  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/combo-offers');
      const data = await res.json();
      if (data && data.comboOffers) {
        const formatted: ComboOffer[] = data.comboOffers.map((c: any) => ({
          id: c.id,
          title: c.title,
          banglaTitle: c.bangla_title || c.title,
          tagline: c.tagline || '',
          description: c.description || '',
          badge: c.badge || 'স্পেশাল কম্বো',
          headline: c.headline || 'সকল গিফট বক্সে',
          discountText: c.discount_text || `ফ্ল্যাট ${c.discount_percent || 20}% ডিসকাউন্ট`,
          discountPercent: Number(c.discount_percent !== null && c.discount_percent !== undefined ? c.discount_percent : 20),
          categorySlug: c.category_slug || 'gift-box',
          categoryName: c.category_name || 'সকল গিফট বক্স',
          badgeCircleText: c.badge_circle_text || 'কাঁথাফোঁড়',
          themeColor: c.theme_color || '#2B1208',
          accentColor: c.accent_color || '#DFB788',
          circleImage: c.circle_image || c.image || DEFAULT_REFERENCE_IMAGE,
          logoImage: c.logo_image || '',
          boxWidth: Number(c.box_width || c.boxWidth || 780),
          circleSize: Number(c.circle_size || c.circleSize || 180),
          productIds: Array.isArray(c.productIds)
            ? c.productIds
            : typeof c.product_ids_json === 'string'
            ? JSON.parse(c.product_ids_json || '[]')
            : [],
          originalPrice: Number(c.original_price || c.originalPrice || 0),
          comboPrice: Number(c.combo_price || c.comboPrice || 0),
          savingsAmount: Number(c.savings_amount || c.savingsAmount || 0),
          savingsPercent: Number(c.discount_percent || c.savings_percent || 20),
          items: Array.isArray(c.items)
            ? c.items
            : typeof c.items_json === 'string'
            ? JSON.parse(c.items_json)
            : [],
          image: c.circle_image || c.image || DEFAULT_REFERENCE_IMAGE,
          startDate: c.start_date || c.startDate || '',
          endDate: c.end_date || c.endDate || '',
          isActive: Boolean(c.active !== undefined ? c.active : c.isActive),
          displayOrder: Number(c.display_order || c.displayOrder || 1),
        }));
        setCombos(formatted);
        if (formatted.length > 0) {
          setPreviewCombo((prev) => (prev ? formatted.find((x) => x.id === prev.id) || formatted[0] : formatted[0]));
        }
      }
    } catch {
      // Fallback sample data if network issue
      const sample: ComboOffer = {
        id: 'combo-1',
        title: 'Special Gift Box Flat Discount',
        banglaTitle: 'সকল গিফট বক্সে ফ্ল্যাট ২০% ডিসকাউন্ট',
        tagline: 'শতভাগ আরামদায়ক ও খাঁটি দেশীয় বুননের প্রিমিয়াম উপহার বক্স',
        description: 'ঐতিহ্যবাহী তাঁত ও সুতি পোশাকের বিশেষ প্যাকেজ।',
        badge: 'স্পেশাল কম্বো',
        headline: 'সকল গিফট বক্সে',
        discountText: 'ফ্ল্যাট ২০% ডিসকাউন্ট',
        discountPercent: 20,
        categorySlug: 'gift-box',
        categoryName: 'সকল গিফট বক্স',
        badgeCircleText: 'কাঁথাফোঁড়',
        themeColor: '#2B1208',
        accentColor: '#DFB788',
        circleImage: DEFAULT_REFERENCE_IMAGE,
        boxWidth: 780,
        circleSize: 180,
        originalPrice: 2500,
        comboPrice: 2000,
        savingsAmount: 500,
        savingsPercent: 20,
        items: [],
        image: DEFAULT_REFERENCE_IMAGE,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isActive: true,
        displayOrder: 1,
      };
      setCombos([sample]);
      setPreviewCombo(sample);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const openCreateModal = () => {
    setEditingCombo(null);
    setTitle('Special Gift Box Discount');
    setBanglaTitle('সকল গিফট বক্সে ফ্ল্যাট ২০% ডিসকাউন্ট');
    setTagline('শতভাগ দেশীয় তাঁতের ঐতিহ্য ও আরামদায়ক ফ্যাশন বান্ডেল');
    setDescription('ঐতিহ্যবাহী তাঁতের তৈরি খাঁটি দেশীয় সুতি পোশাক ও উৎসবের বিশেষ উপহার বান্ডেল।');
    setBadge('স্পেশাল কম্বো');
    setHeadline('সকল গিফট বক্সে');
    setDiscountText('ফ্ল্যাট ২০% ডিসকাউন্ট');
    setDiscountPercent(20);
    setCategorySlug('gift-box');
    setCategoryName('সকল গিফট বক্স');
    setBadgeCircleText('কাঁথাফোঁড়');
    setThemeColor('#2B1208');
    setAccentColor('#DFB788');
    setCircleImage(DEFAULT_REFERENCE_IMAGE);
    setLogoImage('');
    setBoxWidth(780);
    setCircleSize(180);
    setComboPrice(1500);
    setOriginalPrice(2000);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('2026-12-31');
    setIsActive(true);
    setDisplayOrder(combos.length + 1);
    setSelectedItems([]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ComboOffer) => {
    setEditingCombo(c);
    setTitle(c.title);
    setBanglaTitle(c.banglaTitle || c.title);
    setTagline(c.tagline || '');
    setDescription(c.description || '');
    setBadge(c.badge || 'স্পেশাল কম্বো');
    setHeadline(c.headline || 'সকল গিফট বক্সে');
    setDiscountText(c.discountText || `ফ্ল্যাট ${c.discountPercent || 20}% ডিসকাউন্ট`);
    setDiscountPercent(c.discountPercent || 20);
    setCategorySlug(c.categorySlug || 'gift-box');
    setCategoryName(c.categoryName || 'সকল গিফট বক্স');
    setBadgeCircleText(c.badgeCircleText || 'কাঁথাফোঁড়');
    setThemeColor(c.themeColor || '#2B1208');
    setAccentColor(c.accentColor || '#DFB788');
    setCircleImage(c.circleImage || c.image || DEFAULT_REFERENCE_IMAGE);
    setLogoImage(c.logoImage || '');
    setBoxWidth(Number(c.boxWidth || 780));
    setCircleSize(Number(c.circleSize || 180));
    setComboPrice(c.comboPrice || 1500);
    setOriginalPrice(c.originalPrice || 2000);
    setStartDate(c.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(c.endDate || '2026-12-31');
    setIsActive(c.isActive);
    setDisplayOrder(c.displayOrder || 1);
    setSelectedItems(c.items || []);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await adminFetch('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({ image: base64Data, filename: file.name }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setCircleImage(data.url);
          showToast('ছবি সফলভাবে আপলোড করা হয়েছে!');
        } else {
          setCircleImage(base64Data);
          showToast('ছবি যুক্ত করা হয়েছে!');
        }
      } catch {
        setCircleImage(base64Data);
        showToast('ছবি যুক্ত করা হয়েছে!');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !banglaTitle.trim()) {
      showToast('অনুগ্রহ করে কম্বোর শিরোনাম লিখুন');
      return;
    }

    const discPct = Number(discountPercent || 20);
    const payload = {
      title: title.trim(),
      banglaTitle: banglaTitle.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      badge,
      headline: headline.trim() || 'সকল গিফট বক্সে',
      discountText: `ফ্ল্যাট ${discPct}% ডিসকাউন্ট`,
      discountPercent: discPct,
      categorySlug,
      categoryName,
      badgeCircleText: badgeCircleText.trim() || 'কাঁথাফোঁড়',
      themeColor: themeColor.trim() || '#2B1208',
      accentColor: accentColor.trim() || '#DFB788',
      circleImage: circleImage.trim() || DEFAULT_REFERENCE_IMAGE,
      image: circleImage.trim() || DEFAULT_REFERENCE_IMAGE,
      logoImage: logoImage.trim(),
      boxWidth: Number(boxWidth || 780),
      circleSize: Number(circleSize || 180),
      originalPrice,
      comboPrice,
      savingsAmount: originalPrice > comboPrice ? originalPrice - comboPrice : 0,
      savingsPercent: discPct,
      items: selectedItems,
      startDate,
      endDate,
      active: isActive ? 1 : 0,
      displayOrder,
    };

    try {
      if (editingCombo) {
        const res = await adminFetch(`/api/admin/combo-offers/${editingCombo.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('কম্বো অফার ডিজাইন ও সেটিংস সফলভাবে আপডেট হয়েছে!');
        }
      } else {
        const res = await adminFetch('/api/admin/combo-offers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('নতুন কম্বো অফার সফলভাবে তৈরি হয়েছে!');
        }
      }
      setIsModalOpen(false);
      fetchCombos();
    } catch {
      showToast('সার্ভার এরর: কম্বো সংরক্ষণ করা যায়নি');
    }
  };

  const handleToggleActive = async (combo: ComboOffer) => {
    try {
      const res = await adminFetch(`/api/admin/combo-offers/${combo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: combo.isActive ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          combo.isActive
            ? 'কম্বো অফার নিষ্ক্রিয় করা হয়েছে'
            : 'কম্বো অফার সক্রিয় করা হয়েছে'
        );
        fetchCombos();
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই কম্বো অফারটি মুছে ফেলতে চান?')) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/combo-offers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('কম্বো অফার মুছে ফেলা হয়েছে');
        fetchCombos();
      }
    } catch {
      showToast('কম্বো ডিলিট করা যায়নি');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header with Bengali & English Typography */}
      <div className="bg-gradient-to-r from-stone-900 via-[#2B1208] to-neutral-900 text-white rounded-2xl p-6 lg:p-8 shadow-xl border border-[#DFB788]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DFB788]/20 text-[#DFB788] text-xs font-bold mb-3 border border-[#DFB788]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#E6A868]" />
              <span>রেফারেন্স ফটো ভিত্তিক কম্বো অফার কন্ট্রোল প্যানেল</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#F7EEDB]">
              কম্বো অফার ও ব্যানার ডিজাইন ম্যানেজমেন্ট
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2 max-w-2xl font-light">
              রেফারেন্স ছবির আদলে হুবহু নান্দনিক ব্যানার ডিজাইন। মূল্য টাকা বা বাটন ছাড়া সম্পূর্ণ ক্লিকেবল ব্যানার—যে ক্যাটাগরি সিলেক্ট করবেন ক্লিক করলে সরাসরি সেই ক্যাটাগরির পণ্য প্রদর্শিত হবে।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCombos}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition flex items-center gap-2 border border-neutral-700 cursor-pointer"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-950/40 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কম্বো তৈরি করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">মোট অফার ব্যানার</div>
            <div className="text-xl md:text-2xl font-bold text-stone-900 mt-0.5">
              {combos.length} টি
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">সক্রিয় স্টোর ব্যানার</div>
            <div className="text-xl md:text-2xl font-bold text-emerald-700 mt-0.5">
              {combos.filter((c) => c.isActive).length} টি
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">ডিজাইন থিম</div>
            <div className="text-sm md:text-base font-bold text-rose-700 mt-0.5">
              কাস্টমাইজেবল
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">লিঙ্কড ক্যাটাগরি মোড</div>
            <div className="text-sm md:text-base font-bold text-indigo-700 mt-0.5">
              ১-ক্লিক ডিরেক্ট
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Available Combos List + Live Storefront Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Combos Management Table / Cards (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              <span>উপলব্ধ কম্বো অফার তালিকা</span>
            </h2>
            <span className="text-xs text-stone-500 font-medium">
              সর্বমোট {combos.length} টি ব্যানার
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-3" />
              <span>কম্বো তালিকা লোড হচ্ছে...</span>
            </div>
          ) : combos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
              <Gift className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <div className="font-semibold text-stone-700">কোনো কম্বো অফার পাওয়া যায়নি</div>
              <p className="text-xs text-stone-400 mt-1">
                রেফারেন্স ছবির আদলে আকর্ষণীয় ব্যানার তৈরি করতে &quot;নতুন কম্বো তৈরি করুন&quot; বাটনে ক্লিক করুন।
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition cursor-pointer"
              >
                প্রথম কম্বো তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {combos.map((combo) => {
                const isSelectedForPreview = previewCombo?.id === combo.id;
                return (
                  <div
                    key={combo.id}
                    onClick={() => setPreviewCombo(combo)}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer relative ${
                      isSelectedForPreview
                        ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                        : 'border-stone-200 hover:border-amber-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Thumbnail in Round Circle Frame */}
                      <div
                        style={{ backgroundColor: combo.themeColor || '#2B1208' }}
                        className="w-full sm:w-24 h-24 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-stone-300 relative overflow-hidden"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300/60 bg-stone-900 shadow-md">
                          <img
                            src={combo.circleImage || combo.image || DEFAULT_REFERENCE_IMAGE}
                            alt={combo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Content & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                                {combo.badgeCircleText || 'কাঁথাফোঁড়'}
                              </span>
                              <span className="text-xs font-bold text-amber-700">
                                ফ্ল্যাট {toBengaliDigits(combo.discountPercent || 20)}% ছাড়
                              </span>
                            </div>
                            <h3 className="font-serif font-black text-stone-900 text-base leading-snug mt-1 truncate">
                              {combo.headline || combo.banglaTitle || combo.title}
                            </h3>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                              combo.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                combo.isActive ? 'bg-emerald-600' : 'bg-stone-400'
                              }`}
                            />
                            {combo.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </div>

                        {/* Linked Category Callout */}
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/70">
                          <Tag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="text-[11px] text-stone-500">ক্লিক করলে যাবে:</span>
                          <span className="font-bold text-stone-800">
                            {combo.categoryName || combo.categorySlug || 'সকল গিফট বক্স'}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            ({combo.categorySlug || 'gift-box'})
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                          <div className="flex items-center gap-1 text-[11px] text-stone-400">
                            <span>থিম:</span>
                            <span
                              className="w-3 h-3 rounded-full border border-stone-300 inline-block shadow-xs"
                              style={{ backgroundColor: combo.themeColor || '#2B1208' }}
                            />
                            <span className="font-mono">{combo.themeColor || '#2B1208'}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(combo);
                              }}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                                combo.isActive
                                  ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {combo.isActive ? 'পজ' : 'চালু'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(combo);
                              }}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCombo(combo.id);
                              }}
                              className="p-1.5 rounded-lg border border-stone-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Storefront Card Preview (Exact 1:1 Reference Match) (lg:col-span-6) */}
        <div className="lg:col-span-6 sticky top-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-700" />
              <span>লাইভ স্টোরফ্রন্ট প্রিভিউ (Live Preview)</span>
            </h2>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              মূল্য বা বাটন ছাড়া হুবহু ছবির মতো
            </span>
          </div>

          {previewCombo ? (
            <div className="space-y-3">
              {/* Interactive Banner Box */}
              <div
                style={{
                  backgroundColor: previewCombo.themeColor || '#2B1208',
                  maxWidth: `${previewCombo.boxWidth || 780}px`,
                }}
                className="group relative rounded-3xl text-[#F7EEDB] shadow-2xl border-2 border-[#DFB788]/40 overflow-hidden cursor-default transition-all p-3.5 sm:p-6 mx-auto w-full"
              >
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 pointer-events-none" />

                {/* Inset Hairline Border */}
                <div className="absolute inset-2 sm:inset-2.5 rounded-2xl border border-[#DFB788]/30 pointer-events-none z-10" />

                {/* Corner Filigrees */}
                <div className="absolute top-2 left-2 w-7 h-7 pointer-events-none opacity-85 select-none z-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
                    <path d="M 12 88 C 12 40 40 12 88 12" />
                    <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
                    <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
                  </svg>
                </div>
                <div className="absolute top-2 right-2 w-7 h-7 pointer-events-none opacity-85 select-none scale-x-[-1] z-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
                    <path d="M 12 88 C 12 40 40 12 88 12" />
                    <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
                    <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-2 w-7 h-7 pointer-events-none opacity-85 select-none scale-y-[-1] z-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
                    <path d="M 12 88 C 12 40 40 12 88 12" />
                    <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
                    <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2 w-7 h-7 pointer-events-none opacity-85 select-none scale-[-1] z-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
                    <path d="M 12 88 C 12 40 40 12 88 12" />
                    <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
                    <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
                  </svg>
                </div>

                {/* Grid Content - Always 2 columns */}
                <div className="relative grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  {/* Left: Cane Basket with Round Product Photo (col-span-5) */}
                  <div className="col-span-5 flex items-center justify-center">
                    <div
                      style={{
                        width: `min(${previewCombo.circleSize || 180}px, 34vw)`,
                        height: `min(${previewCombo.circleSize || 180}px, 34vw)`,
                        minWidth: '75px',
                        minHeight: '75px',
                      }}
                      className="relative rounded-full p-1.5 sm:p-2 bg-gradient-to-tr from-[#9B6634] via-[#75441E] to-[#4A260D] shadow-xl border-2 border-[#DFB788]/60 shrink-0 transition-all duration-300"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden border border-dashed border-[#F7EEDB]/40 bg-stone-950">
                        <img
                          src={previewCombo.circleImage || previewCombo.image || DEFAULT_REFERENCE_IMAGE}
                          alt={previewCombo.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Typography matching exact screenshot (col-span-7) */}
                  <div className="col-span-7 flex flex-col items-center justify-center text-center space-y-1">
                    {/* Small Circle with Bengali Calligraphy Text */}
                    <div className="relative w-12 h-12 rounded-full border border-dashed border-[#DFB788]/80 flex items-center justify-center p-0.5 bg-black/25">
                      <div className="w-full h-full rounded-full border border-[#DFB788]/50 flex items-center justify-center text-center px-1">
                        <span className="text-[10px] font-serif font-black text-[#F7EEDB] leading-tight select-none">
                          {previewCombo.badgeCircleText || 'কাঁথাফোঁড়'}
                        </span>
                      </div>
                    </div>

                    {/* Headline with 3 Radiating Rays */}
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      <span className="text-[#DFB788] text-xs font-black select-none">\ \ \</span>
                      <h4 className="text-sm sm:text-base font-black text-[#F7EEDB] tracking-tight">
                        {previewCombo.headline || 'সকল গিফট বক্সে'}
                      </h4>
                      <span className="text-[#DFB788] text-xs font-black select-none">/ / /</span>
                    </div>

                    {/* Subtitle Divider: — চলছে — */}
                    <div className="flex items-center justify-center gap-1 py-0 text-[#DFB788]">
                      <span className="text-[10px]">—</span>
                      <span className="text-[10px] font-black tracking-widest uppercase">চলছে</span>
                      <span className="text-[10px]">—</span>
                    </div>

                    {/* Giant Calligraphy Discount */}
                    <div className="text-center pt-0.5">
                      <div className="text-2xl sm:text-3xl font-black text-[#F7EEDB] leading-none">
                        ফ্ল্যাট {toBengaliDigits(previewCombo.discountPercent || 20)}%
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#F7EEDB] flex items-center justify-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F7EEDB] inline-block" />
                        <span>ডিসকাউন্ট</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior Note Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <span>গ্রাহক ক্লিক অ্যাকশন ভেরিফিকেশন:</span>
                </div>
                <p className="text-stone-700">
                  ওয়েবসাইটে গ্রাহক এই কম্বো অফার বক্সে ক্লিক করলে স্বয়ংক্রিয়ভাবে{' '}
                  <strong className="text-amber-900 font-black underline">
                    &quot;{previewCombo.categoryName || previewCombo.categorySlug}&quot;
                  </strong>{' '}
                  ক্যাটাগরি পেজ ওপেন হবে এবং সেই ক্যাটাগরির সমস্ত পোশাক ও পণ্য প্রদর্শিত হবে।
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-400">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>প্রিভিউ দেখতে বামের তালিকা থেকে যেকোনো একটি কম্বো সিলেক্ট করুন</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Create / Edit Modal with Comprehensive User Customization */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-stone-900 via-[#2B1208] to-neutral-900 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-[#F7EEDB]">
                  {editingCombo ? 'কম্বো অফার সম্পাদনা' : 'নতুন কম্বো অফার ব্যানার তৈরি'}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  রেফারেন্স ফটো অনুসারে থিম কালার, বৃত্তের ভেতরের ছবি, ছোট গোল ব্যাজের লেখা ও ক্যাটাগরি কনফিগার করুন
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCombo} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. Theme Color & Design Selection */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      ১. ব্যানার ব্যাকগ্রাউন্ড ও কালার থিম (Design Theme)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-stone-500">
                    {themeColor}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    থিম কালার প্রিসেট নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = themeColor.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setThemeColor(preset.color)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/30 font-bold'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span className="text-xs text-stone-800 truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hex Color Picker */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs font-semibold text-stone-700 shrink-0">
                    কাস্টম কালার:
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#2B1208"
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Circular Product Image (ডালা/বৃত্তের ভেতরের পণ্য ছবি) */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      ২. অফার বক্সের গোল ফ্রেমের পণ্য ছবি (Circular Product Photo)
                    </h4>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Round Preview */}
                  <div
                    style={{ backgroundColor: themeColor }}
                    className="w-28 h-28 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-stone-300 shadow-md"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-300/70 bg-stone-900 shadow-md">
                      <img
                        src={circleImage || DEFAULT_REFERENCE_IMAGE}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 w-full">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        ছবির URL অথবা ডিভাইস থেকে ছবি আপলোড করুন
                      </label>
                      <input
                        type="text"
                        value={circleImage}
                        onChange={(e) => setCircleImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCircleImage(DEFAULT_REFERENCE_IMAGE)}
                        className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-semibold transition cursor-pointer"
                      >
                        ডিফল্ট রেফারেন্স ছবি
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Catalog Picker */}
                {products.length > 0 && (
                  <div className="pt-2 border-t border-stone-200">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      অথবা স্টোর ক্যাটালগ থেকে নির্বাচন করুন:
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {products.slice(0, 8).map((p) => {
                        const img = p.mainImage || p.images?.[0] || '';
                        if (!img) return null;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setCircleImage(img)}
                            className="w-12 h-12 rounded-full overflow-hidden border-2 hover:border-amber-500 shrink-0 transition cursor-pointer"
                            title={p.name}
                          >
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Small Circle Badge Text & Discount % Settings */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                    ৩. গোল ব্যাজের ভেতরের লেখা ও ডিসকাউন্ট শতাংশ (%)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Small Circle Badge Text ("কাঁথাফোঁড়") */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      উপরের ছোট গোলের ভেতরের লেখা *
                    </label>
                    <input
                      type="text"
                      required
                      value={badgeCircleText}
                      onChange={(e) => setBadgeCircleText(e.target.value)}
                      placeholder="যেমন: কাঁথাফোঁড়"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-serif font-black focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      রেফারেন্স ছবিতে থাকা &quot;কাঁথাফোঁড়&quot; লেখার স্থানে প্রদর্শিত হবে।
                    </p>
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      ফ্ল্যাট ডিসকাউন্ট শতাংশ (%) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        max="99"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <span className="text-sm font-black text-amber-800 shrink-0">
                        = ফ্ল্যাট {toBengaliDigits(discountPercent)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      আপনি যত % দিবেন, ব্যানারে ঠিক তত % বড় কলিগ্রাফি আকারে প্রদর্শিত হবে।
                    </p>
                  </div>
                </div>

                {/* Banner Headline */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    ব্যানার হেডলাইন লেখা *
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="যেমন: সকল গিফট বক্সে"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-black focus:ring-2 focus:ring-amber-500 bg-white font-serif"
                  />
                  <p className="text-[11px] text-stone-500 mt-1 font-mono">
                    প্রিভিউ: \ \ \ {headline} / / /
                  </p>
                </div>
              </div>

              {/* 4. Sizing Controls: Box Width & Inner Circle Photo Size */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                    ৪. অফার বক্সের সাইজ ও ভেতরের গোল ছবির সাইজ (Box & Circle Sizing)
                  </h4>
                </div>

                {/* Box Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800">
                      কম্বো অফার বক্সের প্রস্থ / সাইজ (Box Width in Pixels)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      {boxWidth} px
                    </span>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'ছোট (৫৮০px)', val: 580 },
                      { label: 'মাঝারি (৬৮০px)', val: 680 },
                      { label: 'স্বাভাবিক (৭৮০px - ডিফল্ট)', val: 780 },
                      { label: 'বড় (৯২০px)', val: 920 },
                      { label: 'ফুল (১০৫০px)', val: 1050 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setBoxWidth(p.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          boxWidth === p.val
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="450"
                      max="1100"
                      step="10"
                      value={boxWidth}
                      onChange={(e) => setBoxWidth(Number(e.target.value))}
                      className="flex-1 accent-amber-700 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="450"
                      max="1100"
                      value={boxWidth}
                      onChange={(e) => setBoxWidth(Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                    />
                    <span className="text-xs text-stone-500 font-mono">px</span>
                  </div>
                </div>

                {/* Inner Circle Size */}
                <div className="space-y-2 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800">
                      অফার বক্সের ভিতরের গোল ছবির সাইজ (Inner Circle Photo Size)
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      {circleSize} px
                    </span>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'ছোট (১২০px)', val: 120 },
                      { label: 'মাঝারি (১৫০px)', val: 150 },
                      { label: 'স্বাভাবিক (১৮০px - ডিফল্ট)', val: 180 },
                      { label: 'বড় (২২০px)', val: 220 },
                      { label: 'অতিরিক্ত বড় (২৬০px)', val: 260 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setCircleSize(p.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          circleSize === p.val
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="90"
                      max="280"
                      step="5"
                      value={circleSize}
                      onChange={(e) => setCircleSize(Number(e.target.value))}
                      className="flex-1 accent-amber-700 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="90"
                      max="280"
                      value={circleSize}
                      onChange={(e) => setCircleSize(Number(e.target.value))}
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                    />
                    <span className="text-xs text-stone-500 font-mono">px</span>
                  </div>
                </div>
              </div>

              {/* 5. Click Navigation: Linked Category Selection */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                  <Tag className="w-4 h-4 text-amber-800" />
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                    ৫. কম্বো অফার বক্সে ক্লিক করলে যে ক্যাটাগরির পণ্য দেখাবে *
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    লক্ষ্য ক্যাটাগরি (Linked Category)
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategorySlug(val);
                      const matched = categories.find((c) => c.slug === val);
                      if (matched) {
                        setCategoryName(matched.banglaName || matched.name);
                        setHeadline(`সকল ${matched.banglaName || matched.name} কালেকশনে`);
                      } else if (val === 'gift-box') {
                        setCategoryName('সকল গিফট বক্স');
                        setHeadline('সকল গিফট বক্সে');
                      } else if (val === 'lungi') {
                        setCategoryName('সিরাজগঞ্জ তাঁতের লুঙ্গি');
                        setHeadline('সকল লুঙ্গি কালেকশনে');
                      } else if (val === 'panjabi') {
                        setCategoryName('রয়েল সুতি পাঞ্জাবি');
                        setHeadline('সকল পাঞ্জাবি কালেকশনে');
                      } else if (val === 'saree') {
                        setCategoryName('ঐতিহ্যবাহী শাড়ি ও জামদানি');
                        setHeadline('সকল শাড়ি কালেকশনে');
                      } else if (val === 't-shirt' || val === 'tshirt') {
                        setCategoryName('প্রিমিয়াম সুতি টি-শার্ট');
                        setHeadline('সকল টি-শার্ট কালেকশনে');
                      } else if (val === 'three-piece') {
                        setCategoryName('ডিজাইনার থ্রি-পিস');
                        setHeadline('সকল থ্রি-পিস কালেকশনে');
                      } else if (val === 'all') {
                        setCategoryName('সকল পণ্য ও পোশাক');
                        setHeadline('সকল পোশাকে');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                  >
                    <option value="gift-box">🎁 গিফট বক্স (Gift Box - রেফারেন্স ডিফল্ট)</option>
                    <option value="lungi">🧵 সিরাজগঞ্জ তাঁতের লুঙ্গি (Lungi)</option>
                    <option value="panjabi">👑 রয়েল সুতি পাঞ্জাবি (Panjabi)</option>
                    <option value="saree">🌸 ঐতিহ্যবাহী শাড়ি ও জামদানি (Saree)</option>
                    <option value="t-shirt">👕 প্রিমিয়াম সুতি টি-শার্ট (T-Shirt)</option>
                    <option value="three-piece">✨ ডিজাইনার থ্রি-পিস (Three-Piece)</option>
                    <option value="all">🌟 সকল পণ্য ও পোশাক (All Store Products)</option>
                    {categories
                      .filter(
                        (c) =>
                          !['gift-box', 'lungi', 'panjabi', 'saree', 't-shirt', 'tshirt', 'three-piece'].includes(
                            c.slug
                          )
                      )
                      .map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.banglaName || c.name} ({c.slug})
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-stone-600 mt-1">
                    গ্রাহক স্টোরফ্রন্টে এই কম্বো অফার বক্সে ক্লিক করা মাত্র সরাসরি এই ক্যাটাগরিতে প্রবেশ করবেন।
                  </p>
                </div>
              </div>

              {/* 5. Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    বাংলা নাম / টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={banglaTitle}
                    onChange={(e) => setBanglaTitle(e.target.value)}
                    placeholder="যেমন: সকল গিফট বক্সে ফ্ল্যাট ২০% অফ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ইংরেজি নাম (English Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Special Gift Box Flat Discount"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Active & Order */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-stone-800">
                    ওয়েবসাইটে এই কম্বো অফার ব্যানার সক্রিয় রাখুন
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">ক্রম:</span>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1 rounded-lg border border-stone-300 text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-black shadow-lg shadow-amber-950/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingCombo ? 'পরিবর্তন সংরক্ষণ করুন' : 'কম্বো প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
