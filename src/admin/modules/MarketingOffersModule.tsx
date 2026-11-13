import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Clock,
  Tag,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  X,
  Layers,
  Gift,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import { CheckoutUpsell } from '../../types';

interface TimerOfferItem {
  id: string;
  offer_name: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_time: string;
  end_time: string;
  target_type: 'entire_store' | 'category' | 'product' | 'variant';
  target_ids: string;
  min_order_amount: number;
  status: string;
}

interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  status: string;
}

interface MarketingOffersModuleProps {
  initialTab?: 'timer_offers' | 'coupons' | 'campaigns' | 'checkout_upsells';
}

export const MarketingOffersModule: React.FC<MarketingOffersModuleProps> = ({ initialTab = 'timer_offers' }) => {
  const { showToast, products, fetchCheckoutUpsells } = useShop();
  const [activeTab, setActiveTab] = useState<'timer_offers' | 'coupons' | 'checkout_upsells'>(
    initialTab === 'coupons' ? 'coupons' : (initialTab === 'checkout_upsells' ? 'checkout_upsells' : 'timer_offers')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'coupons' ? 'coupons' : (initialTab === 'checkout_upsells' ? 'checkout_upsells' : 'timer_offers'));
    }
  }, [initialTab]);

  const [timerOffers, setTimerOffers] = useState<TimerOfferItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [upsells, setUpsells] = useState<CheckoutUpsell[]>([]);
  const [loading, setLoading] = useState(true);

  // Timer Offer Modal (Add & Edit)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState({
    offerName: '',
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    targetType: 'entire_store' as 'entire_store' | 'category' | 'product',
    minOrderAmount: 0,
    status: 'inactive',
  });

  // Coupon Modal (Add & Edit)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 100,
    minOrderAmount: 500,
    maxDiscountAmount: 0,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    active: false,
  });

  // Checkout Upsell Modal (Add & Edit)
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
  const [editingUpsellId, setEditingUpsellId] = useState<string | null>(null);
  const [upsellForm, setUpsellForm] = useState({
    titleBn: 'প্রিয়জনকে গিফট দিতে সুন্দর একটি Gift Box নিন!',
    titleEn: 'Luxury Gift Packaging Box',
    descriptionBn: 'অভিজাত্যের ছোঁয়ায় কাঠের ফিনিশ শক্ত গিফট বক্স।',
    productId: 'prod-gift-box',
    productName: 'এক্সক্লুসিভ হস্তশিল্প গিফট বক্স (Exclusive Gift Box)',
    productImage: '/bastra-shoily-logo.svg',
    targetCategory: 'ALL',
    originalPrice: 350,
    upsellPrice: 290,
    badgeTextBn: '🎁 স্পেশাল গিফট বক্স',
    isActive: true,
  });

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const [resOffers, resCoupons, resUpsells] = await Promise.all([
        adminFetch('/api/admin/timer-offers'),
        adminFetch('/api/admin/coupons'),
        adminFetch('/api/admin/checkout-upsells'),
      ]);
      const dataOffers = await resOffers.json();
      const dataCoupons = await resCoupons.json();
      const dataUpsells = await resUpsells.json();

      if (dataOffers.success) setTimerOffers(dataOffers.offers || []);
      if (dataCoupons.success) setCoupons(dataCoupons.coupons || []);
      if (dataUpsells.success) setUpsells(dataUpsells.upsells || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  // ---------------- TIMER OFFERS ACTIONS ----------------
  const handleOpenAddOffer = () => {
    setEditingOfferId(null);
    setOfferForm({
      offerName: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      targetType: 'entire_store',
      minOrderAmount: 0,
      status: 'inactive',
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (off: TimerOfferItem) => {
    setEditingOfferId(off.id);
    setOfferForm({
      offerName: off.offer_name,
      title: off.title,
      description: off.description || '',
      discountType: off.discount_type,
      discountValue: off.discount_value,
      startTime: off.start_time ? new Date(off.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endTime: off.end_time ? new Date(off.end_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      targetType: (off.target_type as any) || 'entire_store',
      minOrderAmount: off.min_order_amount || 0,
      status: off.status || 'inactive',
    });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.offerName || !offerForm.title || !offerForm.discountValue) {
      showToast('সকল আবশ্যক তথ্য পূরণ করুন');
      return;
    }

    try {
      if (editingOfferId) {
        const res = await adminFetch(`/api/admin/timer-offers/${editingOfferId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast('টাইমার অফার আপডেট সফল হয়েছে');
          setIsOfferModalOpen(false);
          fetchMarketingData();
        } else {
          showToast(data.error || 'আপডেট ব্যর্থ হয়েছে');
        }
      } else {
        const res = await adminFetch('/api/admin/timer-offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offerForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast('নতুন টাইমার অফার সফলভাবে যোগ হয়েছে');
          setIsOfferModalOpen(false);
          fetchMarketingData();
        } else {
          showToast(data.error || 'অফার তৈরিতে ত্রুটি');
        }
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleToggleOfferStatus = async (off: TimerOfferItem) => {
    const newStatus = off.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminFetch(`/api/admin/timer-offers/${off.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`টাইমার অফার এখন ${newStatus === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
        fetchMarketingData();
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  const handleDeleteOffer = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি "${name}" টাইমার অফারটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/timer-offers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('টাইমার অফার মুছে ফেলা হয়েছে');
        fetchMarketingData();
      } else {
        showToast(data.error || 'মুছে ফেলতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  // ---------------- COUPONS ACTIONS ----------------
  const handleOpenAddCoupon = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      description: '',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 500,
      maxDiscountAmount: 0,
      expiryDate: '2026-12-31',
      usageLimit: 100,
      active: false,
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: CouponItem) => {
    setEditingCouponId(c.id);
    setCouponForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType || 'fixed',
      discountValue: c.discountValue || 0,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      expiryDate: c.expiryDate || '2026-12-31',
      usageLimit: c.usageLimit || 100,
      active: Boolean(c.isActive),
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) {
      showToast('কুপন কোড ও ছাড়ের পরিমাণ আবশ্যক');
      return;
    }

    try {
      if (editingCouponId) {
        const res = await adminFetch(`/api/admin/coupons/${editingCouponId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast('কুপন কোড আপডেট সফল হয়েছে');
          setIsCouponModalOpen(false);
          fetchMarketingData();
        } else {
          showToast(data.error || 'আপডেট ব্যর্থ হয়েছে');
        }
      } else {
        const res = await adminFetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(couponForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast('নতুন কুপন কোড সফলভাবে যোগ হয়েছে');
          setIsCouponModalOpen(false);
          fetchMarketingData();
        } else {
          showToast(data.error || 'কুপন যোগ করতে ত্রুটি');
        }
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleToggleCouponStatus = async (c: CouponItem) => {
    const newActive = !c.isActive;
    try {
      const res = await adminFetch(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`কুপন "${c.code}" এখন ${newActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}`);
        fetchMarketingData();
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`আপনি কি কুপন "${code}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('কুপন মুছে ফেলা হয়েছে');
        fetchMarketingData();
      } else {
        showToast(data.error || 'মুছে ফেলতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  // ---------------- CHECKOUT UPSELLS ACTIONS ----------------
  const handleOpenAddUpsell = () => {
    setEditingUpsellId(null);
    setUpsellForm({
      titleBn: 'প্রিয়জনকে গিফট দিতে সুন্দর একটি Gift Box নিন!',
      titleEn: 'Luxury Gift Packaging Box',
      descriptionBn: 'অভিজাত্যের ছোঁয়ায় কাঠের ফিনিশ শক্ত গিফট বক্স।',
      productId: 'prod-gift-box',
      productName: 'এক্সক্লুসিভ হস্তশিল্প গিফট বক্স (Exclusive Gift Box)',
      productImage: '/bastra-shoily-logo.svg',
      targetCategory: 'ALL',
      originalPrice: 350,
      upsellPrice: 290,
      badgeTextBn: '🎁 স্পেশাল গিফট বক্স',
      isActive: true,
    });
    setIsUpsellModalOpen(true);
  };

  const handleOpenEditUpsell = (upsell: CheckoutUpsell) => {
    setEditingUpsellId(upsell.id);
    setUpsellForm({
      titleBn: upsell.titleBn,
      titleEn: upsell.titleEn,
      descriptionBn: upsell.descriptionBn,
      productId: upsell.productId,
      productName: upsell.productName,
      productImage: upsell.productImage,
      targetCategory: upsell.targetCategory,
      originalPrice: upsell.originalPrice,
      upsellPrice: upsell.upsellPrice,
      badgeTextBn: upsell.badgeTextBn,
      isActive: upsell.isActive,
    });
    setIsUpsellModalOpen(true);
  };

  const handleToggleUpsellStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await adminFetch(`/api/admin/checkout-upsells/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentStatus ? 'আপসেল অফার নিষ্ক্রিয় করা হয়েছে' : 'আপসেল অফার সক্রিয় করা হয়েছে');
        fetchMarketingData();
        fetchCheckoutUpsells();
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteUpsell = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই চেকআউট আপসেল অফারটি ডিলিট করতে চান?')) return;
    try {
      const res = await adminFetch(`/api/admin/checkout-upsells/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('আপসেল অফার ডিলিট করা হয়েছে');
        fetchMarketingData();
        fetchCheckoutUpsells();
      }
    } catch {
      showToast('ডিলিট ব্যর্থ হয়েছে');
    }
  };

  const handleSaveUpsell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUpsellId
        ? `/api/admin/checkout-upsells/${editingUpsellId}`
        : '/api/admin/checkout-upsells';
      const method = editingUpsellId ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upsellForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingUpsellId ? 'আপসেল সফলভাবে আপডেট হয়েছে' : 'নতুন আপসেল সফলভাবে তৈরি হয়েছে');
        setIsUpsellModalOpen(false);
        fetchMarketingData();
        fetchCheckoutUpsells();
      } else {
        showToast(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Flame className="w-5 h-5 text-amber-600" />
            <h1>মার্কেটিং, টাইমার অফার ও কুপন (Campaigns & Promotions)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            ডেমো অফার ও কুপনসমূহ ডিফল্টভাবে নিষ্ক্রিয় রাখা হয়েছে। আপনি যেকোনোটি সক্রিয়, এডিট বা ডিলিট করতে পারেন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMarketingData}
            className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-600 cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'timer_offers' && (
            <button
              onClick={handleOpenAddOffer}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন টাইমার অফার তৈরি করুন</span>
            </button>
          )}
          {activeTab === 'coupons' && (
            <button
              onClick={handleOpenAddCoupon}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কুপন কোড যোগ করুন</span>
            </button>
          )}
          {activeTab === 'checkout_upsells' && (
            <button
              onClick={handleOpenAddUpsell}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন চেকআউট আপসেল যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 space-y-1">
          <p className="font-bold text-amber-950">অ্যাডমিন প্রিভিলেজ ও নিয়ন্ত্রণ নীতি:</p>
          <p>
            সমস্ত অফার ও কুপন অ্যাডমিন প্যানেল থেকে যেকোনো সময় সক্রিয়, নিষ্ক্রিয় বা পরিবর্তন করা যায়। চেকআউট আপসেল সক্রিয় থাকলে ক্রেতারা চেকআউটে পণ্যটির সাথে গিফট বক্স বা আনুষঙ্গিক যোগ করতে পারবে।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-5 rounded-t-2xl gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timer_offers')}
          className={`py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'timer_offers'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          কাউন্টডাউন টাইমার অফার ({timerOffers.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'coupons'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          কুপন কোড তালিকা ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('checkout_upsells')}
          className={`py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'checkout_upsells'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>চেকআউট আপসেল ও গিফট বক্স ({upsells.length})</span>
        </button>
      </div>

      {/* Timer Offers Content */}
      {activeTab === 'timer_offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timerOffers.length === 0 ? (
            <div className="col-span-2 bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-xs">
              কোনো টাইমার অফার পাওয়া যায়নি। নতুন অফার তৈরি করুন।
            </div>
          ) : (
            timerOffers.map((off) => {
              const isActive = off.status === 'active';
              return (
                <div
                  key={off.id}
                  className={`bg-white p-5 rounded-2xl border transition-all space-y-3 ${
                    isActive ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-100' : 'border-stone-200 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 font-bold">{off.id}</span>
                      <h3 className="font-bold text-stone-900 text-sm mt-0.5">{off.offer_name}</h3>
                      <p className="text-xs text-amber-800 font-medium">{off.title}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full border border-amber-200">
                      {off.discount_type === 'percentage' ? `${off.discount_value}% ছাড়` : `৳${off.discount_value} ছাড়`}
                    </span>
                  </div>

                  {off.description && <p className="text-stone-600 text-xs">{off.description}</p>}

                  <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1.5 border border-stone-100">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>টার্গেট স্কোপ:</span>
                      <strong className="text-stone-900 capitalize">{off.target_type.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>মেয়াদ শেষ:</span>
                      <strong className="text-stone-900 font-mono">
                        {new Date(off.end_time).toLocaleString('bn-BD')}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border border-stone-300'
                        }`}
                      >
                        {isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Active Button */}
                      <button
                        onClick={() => handleToggleOfferStatus(off)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditOffer(off)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteOffer(off.id, off.offer_name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Coupons Content */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">কুপন কোড</th>
                  <th className="py-3.5 px-4">ছাড়ের বিবরণ</th>
                  <th className="py-3.5 px-4">ন্যূনতম অর্ডার</th>
                  <th className="py-3.5 px-4 text-center">ব্যবহার হয়েছে</th>
                  <th className="py-3.5 px-4">মেয়াদ</th>
                  <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      কোনো কুপন কোড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const isActive = Boolean(c.isActive);
                    return (
                      <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-amber-900 text-sm">{c.code}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-stone-800">
                            {c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                          </span>
                          {c.description && (
                            <span className="text-stone-500 text-[11px] block">{c.description}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-700">৳{c.minOrderAmount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-stone-800">{c.usedCount || 0} বার</td>
                        <td className="py-3.5 px-4 font-mono text-stone-600">{c.expiryDate}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-stone-100 text-stone-600 border border-stone-300'
                            }`}
                          >
                            {isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Toggle Active Button */}
                          <button
                            onClick={() => handleToggleCouponStatus(c)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                            title={isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          >
                            {isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditCoupon(c)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Upsells Content */}
      {activeTab === 'checkout_upsells' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>চেকআউট আপসেল অফার তালিকা (Checkout Cross-Sell Offers)</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  অন্যান্য (OTHER) ক্যাটাগরি থেকে যেকোনো পণ্য (যেমন: Gift Box, Ator, Tupi, Payjama ইত্যাদি) পাঞ্জাবি, লুঙ্গি, শাড়ি বা থ্রি-পিস অর্ডারের সময় চেকআউটে অফার করুন।
                </p>
              </div>
              <button
                onClick={handleOpenAddUpsell}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন আপসেল তৈরি</span>
              </button>
            </div>

            {upsells.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                কোনো চেকআউট আপসেল অফার পাওয়া যায়নি। &quot;নতুন আপসেল তৈরি&quot; বাটনে ক্লিক করে যোগ করুন।
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {upsells.map((up) => (
                  <div key={up.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                    <div className="flex items-start gap-4">
                      <img
                        src={up.productImage || '/bastra-shoily-logo.svg'}
                        alt={up.titleBn}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-200 bg-white shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                            {up.badgeTextBn || '🎁 গিফট বক্স'}
                          </span>
                          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                            টার্গেট: {up.targetCategory === 'ALL' ? 'সকল পোশাক' : up.targetCategory}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              up.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {up.isActive ? '● সক্রিয় (Active)' : '○ নিষ্ক্রিয়'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{up.titleBn}</h4>
                        <p className="text-xs text-stone-500">{up.descriptionBn}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-amber-700 font-mono text-sm">৳{up.upsellPrice}</span>
                          {up.originalPrice > up.upsellPrice && (
                            <span className="text-stone-400 line-through font-mono">৳{up.originalPrice}</span>
                          )}
                          <span className="text-stone-400">• সংযুক্ত পণ্য: {up.productName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleUpsellStatus(up.id, up.isActive)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                          up.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {up.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                      </button>
                      <button
                        onClick={() => handleOpenEditUpsell(up)}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpsell(up.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timer Offer Modal (Add & Edit) */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">
                {editingOfferId ? 'টাইমার অফার এডিট করুন' : 'নতুন ফ্ল্যাশ সেল / টাইমার অফার'}
              </h2>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ক্যাম্পেইনের নাম *</label>
                <input
                  type="text"
                  required
                  value={offerForm.offerName}
                  onChange={(e) => setOfferForm({ ...offerForm, offerName: e.target.value })}
                  placeholder="যেমন: উইকএন্ড মেগা সেল"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ব্যানার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  placeholder="যেমন: সীমিত সময়ের বিশেষ ধামাকা ছাড়!"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="অফারের বিস্তারিত তথ্য..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ছাড়ের ধরণ</label>
                  <select
                    value={offerForm.discountType}
                    onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="percentage">শতাংশ (%)</option>
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ছাড়ের পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">শুরুর সময়</label>
                  <input
                    type="datetime-local"
                    value={offerForm.startTime}
                    onChange={(e) => setOfferForm({ ...offerForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">শেষের সময় *</label>
                  <input
                    type="datetime-local"
                    required
                    value={offerForm.endTime}
                    onChange={(e) => setOfferForm({ ...offerForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">টার্গেট স্কোপ</label>
                  <select
                    value={offerForm.targetType}
                    onChange={(e) => setOfferForm({ ...offerForm, targetType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="entire_store">পুরো স্টোর (Entire Store)</option>
                    <option value="category">নির্দিষ্ট ক্যাটাগরি</option>
                    <option value="product">নির্দিষ্ট প্রোডাক্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">প্রাথমিক স্ট্যাটাস</label>
                  <select
                    value={offerForm.status}
                    onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="inactive">নিষ্ক্রিয় (Inactive - নিরাপদ)</option>
                    <option value="active">সক্রিয় (Active - লাইভ)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {editingOfferId ? 'আপডেট সংরক্ষণ করুন' : 'অফার তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal (Add & Edit) */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">
                {editingCouponId ? 'কুপন কোড এডিট করুন' : 'নতুন কুপন কোড তৈরি করুন'}
              </h2>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">কুপন কোড * (যেমন: EID2026)</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="BASTRA100"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">কুপনের বিবরণ</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="যেমন: ১,০০০ টাকার অর্ডারে ১০০ টাকা বিশেষ ছাড়"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ছাড়ের ধরণ</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                    <option value="percentage">শতাংশ (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ছাড়ের পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ন্যূনতম অর্ডার মূল্য (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ব্যবহারের সর্বোচ্চ সীমা</label>
                  <input
                    type="number"
                    min={1}
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">মেয়াদ উত্তীর্ণের তারিখ</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={couponForm.active ? 'active' : 'inactive'}
                    onChange={(e) => setCouponForm({ ...couponForm, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="inactive">নিষ্ক্রিয় (Inactive - নিরাপদ)</option>
                    <option value="active">সক্রিয় (Active - লাইভ)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {editingCouponId ? 'আপডেট সংরক্ষণ করুন' : 'কুপন যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Upsell Modal (Add & Edit) */}
      {isUpsellModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <span>{editingUpsellId ? 'চেকআউট আপসেল এডিট করুন' : 'নতুন চেকআউট আপসেল তৈরি করুন'}</span>
              </h2>
              <button
                onClick={() => setIsUpsellModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpsell} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">অ্যাড-অন পণ্যের নাম (বাংলায়)</label>
                <input
                  type="text"
                  required
                  value={upsellForm.titleBn}
                  onChange={(e) => setUpsellForm({ ...upsellForm, titleBn: e.target.value })}
                  placeholder="যেমন: প্রিয়জনকে গিফট দিতে সুন্দর একটি Gift Box নিন!"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ছোট বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  value={upsellForm.descriptionBn}
                  onChange={(e) => setUpsellForm({ ...upsellForm, descriptionBn: e.target.value })}
                  placeholder="যেমন: কাঠের টেক্সচারে প্রিমিয়াম রাজকীয় গিফট বক্স।"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">আপসেল মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={upsellForm.upsellPrice}
                    onChange={(e) => setUpsellForm({ ...upsellForm, upsellPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">আসল মূল্য (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={upsellForm.originalPrice}
                    onChange={(e) => setUpsellForm({ ...upsellForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    value={upsellForm.badgeTextBn}
                    onChange={(e) => setUpsellForm({ ...upsellForm, badgeTextBn: e.target.value })}
                    placeholder="যেমন: 🎁 স্পেশাল গিফট বক্স"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">টার্গেট ক্যাটাগরি</label>
                  <select
                    value={upsellForm.targetCategory}
                    onChange={(e) => setUpsellForm({ ...upsellForm, targetCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                  >
                    <option value="ALL">সকল পোশাক (Panjabi, Lungi, Saree, Three-Piece, etc.)</option>
                    <option value="Panjabi">শুধুমাত্র পাঞ্জাবি (Panjabi)</option>
                    <option value="Lungi">শুধুমাত্র লুঙ্গি (Lungi)</option>
                    <option value="Saree">শুধুমাত্র শাড়ি (Saree)</option>
                    <option value="Three-Piece">শুধুমাত্র থ্রি-পিস (Three-Piece)</option>
                    <option value="T-Shirt">শুধুমাত্র টি-শার্ট (T-Shirt)</option>
                    <option value="Others">অন্যান্য সামগ্রী (Others)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ছবির URL</label>
                <input
                  type="text"
                  value={upsellForm.productImage}
                  onChange={(e) => setUpsellForm({ ...upsellForm, productImage: e.target.value })}
                  placeholder="https://... অথবা /bastra-shoily-logo.svg"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="upsell-active-cb"
                  checked={upsellForm.isActive}
                  onChange={(e) => setUpsellForm({ ...upsellForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="upsell-active-cb" className="font-semibold text-stone-800 cursor-pointer">
                  অফারটি সক্রিয় রাখুন (সরাসরি চেকআউট পেজে দৃশ্যমান হবে)
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpsellModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {editingUpsellId ? 'আপডেট সংরক্ষণ করুন' : 'আপসেল সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
