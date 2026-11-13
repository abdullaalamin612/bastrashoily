import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminApi';
import { useShop } from '../../context/ShopContext';
import { StoreDesignSettings } from '../../types';
import {
  Palette,
  Layout,
  Type,
  Sliders,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  Eye,
} from 'lucide-react';

export const StoreDesignModule: React.FC = () => {
  const { showToast, storeDesign, updateStoreDesign } = useShop();
  const [design, setDesign] = useState<StoreDesignSettings>({
    primaryColor: '#92400E',
    accentColor: '#B45309',
    bannerHeight: 'compact', // compact, medium, tall
    heroBannerHeightDesktop: 320,
    heroBannerHeightMobile: 190,
    heroBannerWidthDesktop: '100%',
    heroBannerWidthMobile: '100%',
    heroBannerBorderRadius: 0,
    heroBannerImageFit: 'cover',
    heroBannerImagePosition: 'center',
    categoryBannerHeightDesktop: 240,
    categoryBannerHeightMobile: 160,
    announcementBarText: '✨ সিরাজগঞ্জের আসল তাঁতের লুঙ্গি ও প্রিমিয়াম পাঞ্জাবিতে বিশেষ ছাড়! ক্যাশ অন ডেলিভারি সুবিধা।',
    showAnnouncementBar: true,
    fontFamily: 'Hind Siliguri',
    showFloatingChat: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeDesign) {
      setDesign((prev) => ({ ...prev, ...storeDesign }));
    }
    adminFetch('/api/admin/store-design')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.design) {
          setDesign((prev) => ({ ...prev, ...data.design }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeDesign]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ok = await updateStoreDesign(design);
      if (ok) {
        showToast('স্টোর ডিজাইন সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        showToast('সংরক্ষণ সম্পন্ন হয়েছে');
      }
    } catch {
      showToast('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-amber-600" />
            <span>স্টোর ডিজাইন ও ভিজ্যুয়াল থিম (Store Design &amp; Theme)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            স্লাইডার ব্যানার উচ্চতা, অ্যানাউন্সমেন্ট বার, কালার প্যালেট ও ফ্রন্টএন্ড লেআউট কাস্টমাইজেশন
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'ডিজাইন সেভ করুন'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Design Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Height & Dimensions (Custom Pixel Size Controls) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>ব্যানারের ছবির সাইজ ও উচ্চতা পিক্সেল নির্ধারণ (Banner Pixel Sizing)</span>
              </h2>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                যেকোনো পিক্সেল সেট করুন
              </span>
            </div>

            <p className="text-xs text-stone-500">
              এডমিন হোমপেজ ও প্রোডাক্ট/ক্যাটাগরি পেজের ব্যানারের উচ্চতা যত পিক্সেল (px) ইচ্ছা সেট করতে পারবেন। সেভ করার সাথে সাথে মূল ওয়েবসাইটে তা কার্যকর হবে।
            </p>

            {/* 1. Home Page Hero Banner Pixel Heights */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-bold text-stone-900">১. হোমপেজ ব্যানার সাইজ (Home Page Hero Banner)</span>
                </div>
              </div>

              {/* Desktop Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">ডেস্কটপ উচ্চতা (Desktop Height in Pixels):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.heroBannerHeightDesktop || 280} px
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'কমপ্যাক্ট (200px)', val: 200 },
                    { label: 'স্ট্যান্ডার্ড (280px)', val: 280 },
                    { label: 'মাঝারি (350px)', val: 350 },
                    { label: 'বড় (450px)', val: 450 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDesign({ ...design, heroBannerHeightDesktop: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (design.heroBannerHeightDesktop || 280) === p.val
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="140"
                    max="650"
                    step="10"
                    value={design.heroBannerHeightDesktop || 280}
                    onChange={(e) => setDesign({ ...design, heroBannerHeightDesktop: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="140"
                    max="650"
                    value={design.heroBannerHeightDesktop || 280}
                    onChange={(e) => setDesign({ ...design, heroBannerHeightDesktop: Number(e.target.value) })}
                    className="w-18 px-2 py-1 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                  />
                  <span className="text-xs text-stone-500 font-mono">px</span>
                </div>
              </div>

              {/* Mobile Height */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">মোবাইল উচ্চতা (Mobile Height in Pixels):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.heroBannerHeightMobile || 180} px
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'ছোট (140px)', val: 140 },
                    { label: 'স্ট্যান্ডার্ড (180px)', val: 180 },
                    { label: 'মাঝারি (220px)', val: 220 },
                    { label: 'বড় (280px)', val: 280 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDesign({ ...design, heroBannerHeightMobile: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (design.heroBannerHeightMobile || 180) === p.val
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
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
                    max="450"
                    step="10"
                    value={design.heroBannerHeightMobile || 180}
                    onChange={(e) => setDesign({ ...design, heroBannerHeightMobile: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="90"
                    max="450"
                    value={design.heroBannerHeightMobile || 180}
                    onChange={(e) => setDesign({ ...design, heroBannerHeightMobile: Number(e.target.value) })}
                    className="w-18 px-2 py-1 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                  />
                  <span className="text-xs text-stone-500 font-mono">px</span>
                </div>
              </div>

              {/* Desktop Width */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">ডেস্কটপ ব্যানার প্রস্থ (Desktop Width):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.heroBannerWidthDesktop || '100%'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'ফুল স্ক্রিন (100%)', val: '100%' },
                    { label: 'আল্ট্রা ওয়াইড (1440px)', val: '1440px' },
                    { label: 'স্ট্যান্ডার্ড (1200px)', val: '1200px' },
                    { label: 'কমপ্যাক্ট (1000px)', val: '1000px' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDesign({ ...design, heroBannerWidthDesktop: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (design.heroBannerWidthDesktop || '100%') === p.val
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="যেমন: 100% অথবা 1280px"
                  value={design.heroBannerWidthDesktop || '100%'}
                  onChange={(e) => setDesign({ ...design, heroBannerWidthDesktop: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono bg-white mt-1"
                />
              </div>

              {/* Banner Border Radius */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">ব্যানার কোণার গোলাকৃতি (Border Radius):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.heroBannerBorderRadius || 0} px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={design.heroBannerBorderRadius || 0}
                    onChange={(e) => setDesign({ ...design, heroBannerBorderRadius: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <span className="text-xs text-stone-500 font-mono">{design.heroBannerBorderRadius || 0}px</span>
                </div>
              </div>

              {/* Image Position / Focal Point */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">ছবির ফোকাল পয়েন্ট / পজিশন (Image Focal Point):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.heroBannerImagePosition || 'center'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { label: 'মাঝখানে (Center)', val: 'center' },
                    { label: 'উপরে (Top)', val: 'top' },
                    { label: 'নিচে (Bottom)', val: 'bottom' },
                    { label: 'বামে (Left)', val: 'left' },
                    { label: 'ডানে (Right)', val: 'right' },
                  ].map((pos) => (
                    <button
                      key={pos.val}
                      type="button"
                      onClick={() => setDesign({ ...design, heroBannerImagePosition: pos.val })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition cursor-pointer text-center ${
                        (design.heroBannerImagePosition || 'center') === pos.val
                          ? 'bg-amber-700 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  ✓ অটো-ফিটিং সক্রিয়: যেকোনো সাইজের ছবি আপলোড করলে তা কোনো স্ট্রেচিং বা বিকৃতি ছাড়া স্বয়ংক্রিয়ভাবে পুরো ব্যানার পূর্ণ করবে এবং সাদা গ্যাপ তৈরি হবে না।
                </p>
              </div>
            </div>

            {/* 2. Category & Product Page Banner Pixel Heights */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-stone-700" />
                  <span className="text-xs font-bold text-stone-900">২. ক্যাটাগরি ও প্রোডাক্ট পেজ ব্যানার সাইজ (Category &amp; Product Banners)</span>
                </div>
              </div>

              {/* Desktop Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">ডেস্কটপ উচ্চতা (Desktop Height in Pixels):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.categoryBannerHeightDesktop || 240} px
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'কমপ্যাক্ট (180px)', val: 180 },
                    { label: 'স্ট্যান্ডার্ড (240px)', val: 240 },
                    { label: 'মাঝারি (300px)', val: 300 },
                    { label: 'বড় (380px)', val: 380 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDesign({ ...design, categoryBannerHeightDesktop: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (design.categoryBannerHeightDesktop || 240) === p.val
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="120"
                    max="550"
                    step="10"
                    value={design.categoryBannerHeightDesktop || 240}
                    onChange={(e) => setDesign({ ...design, categoryBannerHeightDesktop: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="120"
                    max="550"
                    value={design.categoryBannerHeightDesktop || 240}
                    onChange={(e) => setDesign({ ...design, categoryBannerHeightDesktop: Number(e.target.value) })}
                    className="w-18 px-2 py-1 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                  />
                  <span className="text-xs text-stone-500 font-mono">px</span>
                </div>
              </div>

              {/* Mobile Height */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">মোবাইল উচ্চতা (Mobile Height in Pixels):</label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-stone-300">
                    {design.categoryBannerHeightMobile || 160} px
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'ছোট (120px)', val: 120 },
                    { label: 'স্ট্যান্ডার্ড (160px)', val: 160 },
                    { label: 'মাঝারি (200px)', val: 200 },
                    { label: 'বড় (250px)', val: 250 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setDesign({ ...design, categoryBannerHeightMobile: p.val })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        (design.categoryBannerHeightMobile || 160) === p.val
                          ? 'bg-amber-700 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="80"
                    max="400"
                    step="10"
                    value={design.categoryBannerHeightMobile || 160}
                    onChange={(e) => setDesign({ ...design, categoryBannerHeightMobile: Number(e.target.value) })}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="80"
                    max="400"
                    value={design.categoryBannerHeightMobile || 160}
                    onChange={(e) => setDesign({ ...design, categoryBannerHeightMobile: Number(e.target.value) })}
                    className="w-18 px-2 py-1 rounded-lg border border-stone-300 text-xs font-mono font-bold text-center bg-white"
                  />
                  <span className="text-xs text-stone-500 font-mono">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Layout className="w-4 h-4 text-amber-600" />
                <span>হেডার অ্যানাউন্সমেন্ট ও অফার বার (Top Announcement Bar)</span>
              </h2>
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={design.showAnnouncementBar}
                  onChange={(e) => setDesign({ ...design, showAnnouncementBar: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>চালু রাখুন</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">অ্যানাউন্সমেন্ট টেক্সট</label>
              <textarea
                rows={2}
                value={design.announcementBarText}
                onChange={(e) => setDesign({ ...design, announcementBarText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                placeholder="যেমন: বিশেষ অফার চলছে..."
              />
            </div>
          </div>

          {/* Global Website Appearance System (Phase 2) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>ওয়েবসাইটের সার্বিক ব্যাকগ্রাউন্ড ও কালার থিম (Global Website Appearance / Phase 2)</span>
              </h2>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                সেন্ট্রালাইজড CSS সিস্টেম
              </span>
            </div>

            <p className="text-xs text-stone-500">
              ওয়েবসাইটের মূল ব্যাকগ্রাউন্ড কালার (যেমন: ওয়ার্ম ক্রিম #FFF8ED বা পিওর হোয়াইট #FFFFFF), কার্ড ব্যাকগ্রাউন্ড, হেডার ও বাটন কালার এক ক্লিকে পরিবর্তন করুন।
            </p>

            {/* Global Theme Presets */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                গ্লোবাল কালার থিম প্রিসেট (One-Click Theme Presets):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: 'ওয়ার্ম ক্রিম ও ঐতিহ্যবাহী (ডিফল্ট)',
                    siteBg: '#FFF8ED',
                    cardBg: '#FFFFFF',
                    headerBg: '#FFFFFF',
                    footerBg: '#240B07',
                    btnBg: '#8C2D19',
                    text: '#2B0D08',
                  },
                  {
                    name: 'পিওর হোয়াইট মডার্ন (Pure White)',
                    siteBg: '#FFFFFF',
                    cardBg: '#F8FAFC',
                    headerBg: '#FFFFFF',
                    footerBg: '#0F172A',
                    btnBg: '#0F172A',
                    text: '#0F172A',
                  },
                  {
                    name: 'রয়্যাল সিল্ক ও গোল্ড (Royal Silk)',
                    siteBg: '#FAF7F2',
                    cardBg: '#FFFFFF',
                    headerBg: '#2B0D08',
                    footerBg: '#2B0D08',
                    btnBg: '#92400E',
                    text: '#1C1917',
                  },
                ].map((th, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() =>
                      setDesign((prev) => ({
                        ...prev,
                        siteBgColor: th.siteBg,
                        cardBgColor: th.cardBg,
                        headerBgColor: th.headerBg,
                        footerBgColor: th.footerBg,
                        buttonBgColor: th.btnBg,
                        textPrimaryColor: th.text,
                      }))
                    }
                    className="p-3 rounded-xl border border-stone-200 text-left hover:border-amber-500 transition-all cursor-pointer bg-stone-50"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: th.siteBg }} />
                      <span className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: th.headerBg }} />
                      <span className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: th.btnBg }} />
                    </div>
                    <span className="text-xs font-bold text-stone-800 block">{th.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono">সাইট BG: {th.siteBg}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Global Color Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Site Background */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  ওয়েবসাইট ব্যাকগ্রাউন্ড (Site Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.siteBgColor || '#FFF8ED'}
                    onChange={(e) => setDesign({ ...design, siteBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.siteBgColor || '#FFF8ED'}
                    onChange={(e) => setDesign({ ...design, siteBgColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>

              {/* Card Background */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  পণ্য কার্ড ব্যাকগ্রাউন্ড (Card Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.cardBgColor || '#FFFFFF'}
                    onChange={(e) => setDesign({ ...design, cardBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.cardBgColor || '#FFFFFF'}
                    onChange={(e) => setDesign({ ...design, cardBgColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>

              {/* Button Background */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  বাটন ব্যাকগ্রাউন্ড (Button Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.buttonBgColor || '#8C2D19'}
                    onChange={(e) => setDesign({ ...design, buttonBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.buttonBgColor || '#8C2D19'}
                    onChange={(e) => setDesign({ ...design, buttonBgColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>

              {/* Text Primary */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  প্রধান টেক্সট কালার (Primary Text)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.textPrimaryColor || '#2B0D08'}
                    onChange={(e) => setDesign({ ...design, textPrimaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.textPrimaryColor || '#2B0D08'}
                    onChange={(e) => setDesign({ ...design, textPrimaryColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>

              {/* Header Background */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  হেডার ব্যাকগ্রাউন্ড (Header Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.headerBgColor || '#FFFFFF'}
                    onChange={(e) => setDesign({ ...design, headerBgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.headerBgColor || '#FFFFFF'}
                    onChange={(e) => setDesign({ ...design, headerBgColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>

              {/* Link Accent Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  লিংক ও হাইলাইট কালার (Link Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.linkColor || '#8C2D19'}
                    onChange={(e) => setDesign({ ...design, linkColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={design.linkColor || '#8C2D19'}
                    onChange={(e) => setDesign({ ...design, linkColor: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-stone-600" />
              <span>লাইভ প্রিভিউ (Live Preview)</span>
            </h2>

            {/* Simulated Mobile Mockup */}
            <div className="border border-stone-300 rounded-2xl overflow-hidden bg-[#FBFBFB] shadow-inner text-xs">
              {/* Top Announcement Bar */}
              {design.showAnnouncementBar && (
                <div
                  style={{ backgroundColor: design.primaryColor }}
                  className="px-3 py-1.5 text-[10px] text-white text-center font-medium truncate"
                >
                  {design.announcementBarText}
                </div>
              )}

              {/* Simulated Header */}
              <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between">
                <span className="font-bold text-stone-900">BOSTROSHOILY</span>
                <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-bold">🛒 কার্ট (২)</span>
              </div>

              {/* Simulated Slider Banner */}
              <div
                className={`w-full bg-stone-800 text-white flex flex-col items-center justify-center p-4 transition-all ${
                  design.bannerHeight === 'compact' ? 'h-24' : design.bannerHeight === 'medium' ? 'h-32' : 'h-40'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">সিরাজগঞ্জ তাঁতের লুঙ্গি</span>
                <span className="text-xs font-black mt-0.5">ঐতিহ্যবাহী খাঁটি সুতি ফ্যাশন</span>
              </div>

              {/* Simulated Product Card */}
              <div className="p-3 space-y-2">
                <div className="h-16 bg-stone-200 rounded-lg animate-pulse" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 text-[11px]">৮০ কাউন্ট সিরাজগঞ্জ লুঙ্গি</span>
                  <span style={{ color: design.primaryColor }} className="font-mono font-bold">৳৮৫০</span>
                </div>
                <button
                  type="button"
                  style={{ backgroundColor: design.primaryColor }}
                  className="w-full py-1 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  অর্ডার করুন
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-center">
              সব পরিবর্তন সরাসরি সেভ বাটনে ক্লিক করলেই মূল ওয়েবসাইটে সক্রিয় হবে।
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
