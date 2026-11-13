import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { FooterConfig, FooterLinkItem, FooterPolicyItem, FooterContactItem, PolicyPageDoc } from '../../types';
import { adminFetch } from '../adminApi';
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  Eye,
  ChevronRight,
  Palette,
  Layout,
  Sliders,
  Check,
  Truck,
  Globe,
} from 'lucide-react';

const PRESET_ROUTES = [
  { label: 'হোম পেজ (Home)', value: 'home' },
  { label: 'কিভাবে অর্ডার করবেন? (How to Order)', value: 'guide' },
  { label: 'কাপড়ের যত্ন ও ভিডিও গাইড (Fabric Care)', value: 'clothing-guide' },
  { label: 'অর্ডার ট্র্যাকিং (Order Tracking)', value: 'tracking' },
  { label: 'রিটার্ন পলিসি (Returns)', value: 'policy/returns-exchange' },
  { label: 'শর্তাবলী (Terms)', value: 'policy/terms-and-conditions' },
  { label: 'গোপনীয়তা নীতি (Privacy)', value: 'policy/privacy-policy' },
  { label: 'ডেলিভারি তথ্য (Delivery)', value: 'policy/delivery-information' },
  { label: 'তাঁতের লুঙ্গি কালেকশন (Lungi)', value: 'lungi' },
  { label: 'জামদানি ও তাঁতের শাড়ি (Saree)', value: 'saree' },
  { label: 'প্রিমিয়াম পাঞ্জাবি (Panjabi)', value: 'panjabi' },
  { label: 'থ্রি-পিস কালেকশন (Three-Piece)', value: 'three-piece' },
  { label: 'কম্বড কটন টি-শার্ট (T-Shirt)', value: 't-shirt' },
  { label: 'অন্যান্য / কাস্টম লিংক', value: 'custom' },
];

export const FooterManagementModule: React.FC = () => {
  const { footerConfig, updateFooterConfig, showToast } = useShop();

  const [formConfig, setFormConfig] = useState<FooterConfig>(footerConfig);
  const [activeTab, setActiveTab] = useState<'appearance' | 'policy_pages' | 'links' | 'policies' | 'contacts' | 'social' | 'about'>('appearance');

  // Policy Pages CMS State (Phase 1.3)
  const [policyPages, setPolicyPages] = useState<PolicyPageDoc[]>([]);
  const [selectedPolicySlug, setSelectedPolicySlug] = useState<string>('returns-exchange');
  const [editingPolicy, setEditingPolicy] = useState<Partial<PolicyPageDoc>>({});
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Sync when context changes
  useEffect(() => {
    setFormConfig({
      ...footerConfig,
      quickLinks: footerConfig.quickLinks || [],
      policies: footerConfig.policies || [],
      contactItems: footerConfig.contactItems || [],
      headings: footerConfig.headings || {
        about: 'বস্ত্র শৈলী (BOSTROSHOILY) পরিচিতি',
        links: 'দ্রুত লিংকসমূহ (Quick Links)',
        policies: 'সার্ভিস ও পলিসি (Policies)',
        contacts: 'যোগাযোগ করুন (Contact Us)',
      },
      bgColor: footerConfig.bgColor || '#240B07',
      textColor: footerConfig.textColor || '#E8D5C4',
      headingColor: footerConfig.headingColor || '#FFF7ED',
      linkColor: footerConfig.linkColor || '#E8D5C4',
      linkHoverColor: footerConfig.linkHoverColor || '#D4AF37',
      borderColor: footerConfig.borderColor || '#3E140D',
      paddingY: footerConfig.paddingY ?? 48,
    });
  }, [footerConfig]);

  // Fetch policy pages from database
  const fetchPolicyPages = async () => {
    try {
      const res = await adminFetch('/api/policy-pages');
      const data = await res.json();
      if (data?.pages) {
        setPolicyPages(data.pages);
        const curr = data.pages.find((p: any) => p.slug === selectedPolicySlug) || data.pages[0];
        if (curr) {
          setEditingPolicy({
            id: curr.id,
            slug: curr.slug,
            titleBn: curr.title_bn,
            titleEn: curr.title_en,
            contentBn: curr.content_bn,
            contentEn: curr.content_en,
            seoTitle: curr.seo_title,
            metaDescription: curr.meta_description,
            status: curr.status,
            lastUpdated: curr.last_updated,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch policy pages:', e);
    }
  };

  useEffect(() => {
    fetchPolicyPages();
  }, [selectedPolicySlug]);

  const handleSelectPolicy = (slug: string) => {
    setSelectedPolicySlug(slug);
    const curr = policyPages.find((p) => p.slug === slug);
    if (curr) {
      setEditingPolicy({
        id: curr.id,
        slug: curr.slug,
        titleBn: (curr as any).title_bn || curr.titleBn,
        titleEn: (curr as any).title_en || curr.titleEn,
        contentBn: (curr as any).content_bn || curr.contentBn,
        contentEn: (curr as any).content_en || curr.contentEn,
        seoTitle: (curr as any).seo_title || curr.seoTitle,
        metaDescription: (curr as any).meta_description || curr.metaDescription,
        status: curr.status || 'published',
        lastUpdated: (curr as any).last_updated || curr.lastUpdated,
      });
    }
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy.slug) return;
    setIsSavingPolicy(true);
    try {
      const res = await adminFetch(`/api/admin/policy-pages/${editingPolicy.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_bn: editingPolicy.titleBn,
          title_en: editingPolicy.titleEn,
          content_bn: editingPolicy.contentBn,
          content_en: editingPolicy.contentEn,
          seo_title: editingPolicy.seoTitle,
          meta_description: editingPolicy.metaDescription,
          status: editingPolicy.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('পলিসি পেজ সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
        fetchPolicyPages();
      } else {
        showToast(data.error || 'পলিসি সেভ করা যায়নি');
      }
    } catch (err: any) {
      showToast(err.message || 'নেটওয়ার্ক এরর');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Save all footer appearance & content settings
  const handleSaveAll = () => {
    updateFooterConfig(formConfig);
    showToast('ফুটারের সকল ডিজাইন ও কনটেন্ট সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // --- QUICK LINKS ACTIONS ---
  const handleAddLink = () => {
    const newLink: FooterLinkItem = {
      id: `ql-${Date.now()}`,
      title: 'নতুন লিংক',
      url: 'home',
      isActive: true,
    };
    setFormConfig((prev) => ({
      ...prev,
      quickLinks: [...(prev.quickLinks || []), newLink],
    }));
  };

  const handleUpdateLink = (id: string, updates: Partial<FooterLinkItem>) => {
    setFormConfig((prev) => ({
      ...prev,
      quickLinks: (prev.quickLinks || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const handleDeleteLink = (id: string) => {
    setFormConfig((prev) => ({
      ...prev,
      quickLinks: (prev.quickLinks || []).filter((l) => l.id !== id),
    }));
  };

  // --- POLICIES ACTIONS ---
  const handleAddPolicy = () => {
    const newPolicy: FooterPolicyItem = {
      id: `pol-${Date.now()}`,
      title: 'নতুন পলিসির নাম',
      content: 'এখানে বিস্তারিত পলিসি এবং গ্রাহক সেবা নির্দেশিকা লিখুন...',
      isActive: true,
    };
    setFormConfig((prev) => ({
      ...prev,
      policies: [...(prev.policies || []), newPolicy],
    }));
  };

  const handleUpdatePolicy = (id: string, updates: Partial<FooterPolicyItem>) => {
    setFormConfig((prev) => ({
      ...prev,
      policies: (prev.policies || []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const handleDeletePolicy = (id: string) => {
    setFormConfig((prev) => ({
      ...prev,
      policies: (prev.policies || []).filter((p) => p.id !== id),
    }));
  };

  // --- CONTACTS ACTIONS ---
  const handleAddContact = () => {
    const newContact: FooterContactItem = {
      id: `cnt-${Date.now()}`,
      type: 'phone',
      label: 'নতুন যোগাযোগ ক্ষেত্র',
      value: '+880 1864-528488',
      link: '',
      isActive: true,
    };
    setFormConfig((prev) => ({
      ...prev,
      contactItems: [...(prev.contactItems || []), newContact],
    }));
  };

  const handleUpdateContact = (id: string, updates: Partial<FooterContactItem>) => {
    setFormConfig((prev) => ({
      ...prev,
      contactItems: (prev.contactItems || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const handleDeleteContact = (id: string) => {
    setFormConfig((prev) => ({
      ...prev,
      contactItems: (prev.contactItems || []).filter((c) => c.id !== id),
    }));
  };

  const currentLinks = formConfig.quickLinks || [];
  const currentPolicies = formConfig.policies || [];
  const currentContacts = formConfig.contactItems || [];

  return (
    <div className="space-y-6">
      {/* Module Header with Save Action */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              ফুটার ও পলিসি পেজ ব্যবস্থাপনা (Footer & Policy Management System)
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            রঙ, ব্যাকগ্রাউন্ড, স্পেসিং, শিরোনাম, সোশ্যাল মিডিয়া, প্রয়োজনীয় লিংক ও ৪টি পূর্ণাঙ্গ পলিসি পেজ পরিচালনা করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>সকল ফুটার পরিবর্তন সংরক্ষণ করুন</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'appearance', label: '🎨 ফুটার ডিজাইন ও রঙ (Appearance)', icon: Palette },
          { id: 'policy_pages', label: '📄 পলিসি পেজসমূহ (CMS Pages)', icon: FileText },
          { id: 'links', label: `🔗 দ্রুত লিংকসমূহ (${currentLinks.length})`, icon: LinkIcon },
          { id: 'policies', label: `📜 ফুটার শর্ট পলিসি (${currentPolicies.length})`, icon: ShieldCheck },
          { id: 'contacts', label: `📞 যোগাযোগ ও ঠিকানা (${currentContacts.length})`, icon: MapPin },
          { id: 'social', label: '🌐 সোশ্যাল মিডিয়া আইকন', icon: Globe },
          { id: 'about', label: '✍️ পরিচিতি ও কপিরাইট', icon: Edit2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#240B07] text-[#FFF7ED] shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE CONTROLS (PHASE 1.1) */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-stone-100">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>ফুটার ডিজাইন, রঙ ও স্পেসিং কন্ট্রোল (Phase 1.1)</span>
              </h3>
              <p className="text-xs text-stone-500">
                ফুটারের ব্যাকগ্রাউন্ড কালার, টেক্সট কালার, বর্ডার, প্যাডিং ও ব্যাকগ্রাউন্ড ইমেজ কাস্টমাইজ করুন।
              </p>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                কালার থিম প্রিসেট (Quick Color Presets):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    name: 'রিচ চকলেট (ডিফল্ট)',
                    bg: '#240B07',
                    text: '#E8D5C4',
                    heading: '#FFF7ED',
                    border: '#3E140D',
                  },
                  {
                    name: 'রয়্যাল ব্ল্যাক ও গোল্ড',
                    bg: '#121212',
                    text: '#E2E8F0',
                    heading: '#F6E05E',
                    border: '#27272A',
                  },
                  {
                    name: 'ডিপ মেরুন ট্র্যাডিশনাল',
                    bg: '#3B0910',
                    text: '#FDE8E8',
                    heading: '#FFF',
                    border: '#5C141E',
                  },
                  {
                    name: 'ডিপ ফরেস্ট গ্রিন',
                    bg: '#0F291E',
                    text: '#D1FAE5',
                    heading: '#FFF',
                    border: '#1B4734',
                  },
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() =>
                      setFormConfig((prev) => ({
                        ...prev,
                        bgColor: preset.bg,
                        textColor: preset.text,
                        headingColor: preset.heading,
                        borderColor: preset.border,
                      }))
                    }
                    className="p-3 rounded-xl border border-stone-200 text-left hover:border-amber-500 transition-all cursor-pointer bg-stone-50"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                      <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.text }} />
                      <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: preset.heading }} />
                    </div>
                    <span className="text-xs font-bold text-stone-800 block">{preset.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{preset.bg}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers & HEX Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Bg Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  ফুটার ব্যাকগ্রাউন্ড রঙ (Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.bgColor || '#240B07'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={formConfig.bgColor || '#240B07'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  টেক্সট ও বর্ণনার রঙ (Text Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.textColor || '#E8D5C4'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={formConfig.textColor || '#E8D5C4'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Heading Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  শিরোনামের রঙ (Heading Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.headingColor || '#FFF7ED'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, headingColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={formConfig.headingColor || '#FFF7ED'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, headingColor: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Link Hover Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  লিংক হোভার / অ্যাকসেন্ট রঙ (Hover Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.linkHoverColor || '#D4AF37'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, linkHoverColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={formConfig.linkHoverColor || '#D4AF37'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, linkHoverColor: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1.5">
                  বর্ডার ও ডিভাইডার রঙ (Border Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formConfig.borderColor || '#3E140D'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={formConfig.borderColor || '#3E140D'}
                    onChange={(e) => setFormConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-stone-800"
                  />
                </div>
              </div>

              {/* Vertical Padding Slider */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase">
                    উপরে-নিচে প্যাডিং (Vertical Padding)
                  </label>
                  <span className="text-xs font-bold text-amber-700 font-mono">
                    {formConfig.paddingY ?? 48}px
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="4"
                  value={formConfig.paddingY ?? 48}
                  onChange={(e) => setFormConfig((prev) => ({ ...prev, paddingY: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Optional Background Image */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ঐচ্ছিক ব্যাকগ্রাউন্ড প্যাটার্ন বা ইমেজ URL (Background Image):
              </label>
              <input
                type="text"
                value={formConfig.bgImage || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, bgImage: e.target.value }))}
                placeholder="যেমন: https://... অথবা খালি রাখুন"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono text-stone-800"
              />
            </div>

            {/* Section Headings Control (Phase 1.2) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                কলামসমূহের কাস্টম শিরোনাম (Custom Section Headings):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    কলাম ২: দ্রুত লিংক শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={formConfig.headings?.links || 'দ্রুত লিংকসমূহ (Quick Links)'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({
                        ...prev,
                        headings: { ...(prev.headings || {}), links: e.target.value },
                      }))
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    কলাম ৩: পলিসি শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={formConfig.headings?.policies || 'সার্ভিস ও পলিসি (Policies)'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({
                        ...prev,
                        headings: { ...(prev.headings || {}), policies: e.target.value },
                      }))
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    কলাম ৪: যোগাযোগ শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={formConfig.headings?.contacts || 'যোগাযোগ করুন (Contact Us)'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({
                        ...prev,
                        headings: { ...(prev.headings || {}), contacts: e.target.value },
                      }))
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Realistic Live Footer Preview */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>লাইভ ফুটার ভিজুয়াল প্রিভিউ (Live Footer Preview)</span>
              </div>
              <span className="text-[11px] text-stone-500">পরিবর্তন করার সাথে সাথে এখানে রিয়েল-টাইম প্রিভিউ দেখুন</span>
            </div>

            <div
              style={{
                backgroundColor: formConfig.bgColor || '#240B07',
                color: formConfig.textColor || '#E8D5C4',
                borderColor: formConfig.borderColor || '#3E140D',
                backgroundImage: formConfig.bgImage ? `url(${formConfig.bgImage})` : undefined,
                backgroundSize: 'cover',
                paddingTop: `${Math.round((formConfig.paddingY ?? 48) * 0.7)}px`,
                paddingBottom: `${Math.round((formConfig.paddingY ?? 48) * 0.7)}px`,
              }}
              className="rounded-2xl border p-6 transition-all shadow-inner"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                {/* Col 1 */}
                <div className="space-y-3">
                  <div className="font-serif font-black text-lg text-white">বস্ত্র শৈলী (BOSTROSHOILY)</div>
                  <p className="opacity-80 leading-relaxed text-[11px] line-clamp-3">
                    {formConfig.aboutUs || 'ঐতিহ্যবাহী সিরাজগঞ্জের তাঁতের খাঁটি পোশাক ও আধুনিক রুচিশীল আভিজাত্য।'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center text-white text-[10px]">f</span>
                    <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center text-white text-[10px]">ig</span>
                    <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center text-white text-[10px]">yt</span>
                    <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center text-white text-[10px]">wa</span>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-2">
                  <h4 style={{ color: formConfig.headingColor || '#FFF7ED' }} className="font-bold text-xs uppercase pb-1 border-b border-white/10">
                    {formConfig.headings?.links || 'দ্রুত লিংকসমূহ'}
                  </h4>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li>• হোম পেজ (Home)</li>
                    <li>• অর্ডার ট্র্যাক করুন</li>
                    <li>• কাপড়ের যত্ন গাইড</li>
                  </ul>
                </div>

                {/* Col 3 */}
                <div className="space-y-2">
                  <h4 style={{ color: formConfig.headingColor || '#FFF7ED' }} className="font-bold text-xs uppercase pb-1 border-b border-white/10">
                    {formConfig.headings?.policies || 'সার্ভিস ও পলিসি'}
                  </h4>
                  <ul className="space-y-1.5 opacity-80 text-[11px]">
                    <li>• রিটার্ন ও এক্সচেঞ্জ পলিসি</li>
                    <li>• শর্তাবলী (Terms & Conditions)</li>
                    <li>• গোপনীয়তা নীতি (Privacy)</li>
                    <li>• ডেলিভারি তথ্য (Delivery Info)</li>
                  </ul>
                </div>

                {/* Col 4 */}
                <div className="space-y-2">
                  <h4 style={{ color: formConfig.headingColor || '#FFF7ED' }} className="font-bold text-xs uppercase pb-1 border-b border-white/10">
                    {formConfig.headings?.contacts || 'যোগাযোগ করুন'}
                  </h4>
                  <div className="space-y-1.5 opacity-80 text-[11px]">
                    <p>{formConfig.address || 'দ্বারিয়াপুর, শাহজাদপুর, সিরাজগঞ্জ'}</p>
                    <p style={{ color: formConfig.linkHoverColor || '#D4AF37' }} className="font-bold">
                      {formConfig.phone || '+880 1864-528488'}
                    </p>
                    <p>{formConfig.email || 'bostroshoily@gmail.com'}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright Strip */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] opacity-70">
                {formConfig.copyrightText || '© ২০২৬ বস্ত্র শৈলী (BOSTROSHOILY) - সর্বস্বত্ব সংরক্ষিত।'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CMS POLICY PAGES (PHASE 1.3 - DEDICATED FULL PAGES) */}
      {activeTab === 'policy_pages' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>সিএমএস পলিসি পেজসমূহ (CMS Policy Pages Editor / Phase 1.3)</span>
              </h3>
              <p className="text-xs text-stone-500">
                গ্রাহকদের জন্য ৪টি পৃথক ডেডিকেটেড পেজের কন্টেন্ট, বাংলা ও ইংরেজি শিরোনাম এবং এসইও মেটাডাটা সরাসরি ডাটাবেজে সংরক্ষণ করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={handleSavePolicy}
              disabled={isSavingPolicy}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingPolicy ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি পেজ সেভ করুন'}</span>
            </button>
          </div>

          {/* Policy Page Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { slug: 'returns-exchange', name: 'রিটার্ন ও এক্সচেঞ্জ', icon: RotateCcw, url: '/pages/returns-exchange' },
              { slug: 'terms-and-conditions', name: 'শর্তাবলী ও নিয়মাবলী', icon: FileText, url: '/pages/terms-and-conditions' },
              { slug: 'privacy-policy', name: 'গোপনীয়তা নীতি', icon: ShieldCheck, url: '/pages/privacy-policy' },
              { slug: 'delivery-information', name: 'ডেলিভারি তথ্য ও চার্জ', icon: Truck, url: '/pages/delivery-information' },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPolicySlug === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleSelectPolicy(p.slug)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-600'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`} />
                    <span className="text-xs font-bold text-stone-800">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono block truncate">{p.url}</span>
                </button>
              );
            })}
          </div>

          {/* Policy Page Editor Form */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  বাংলা শিরোনাম (Title BN)
                </label>
                <input
                  type="text"
                  value={editingPolicy.titleBn || ''}
                  onChange={(e) => setEditingPolicy((prev) => ({ ...prev, titleBn: e.target.value }))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  ইংরেজি শিরোনাম (Title EN)
                </label>
                <input
                  type="text"
                  value={editingPolicy.titleEn || ''}
                  onChange={(e) => setEditingPolicy((prev) => ({ ...prev, titleEn: e.target.value }))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  স্ট্যাটাস (Status)
                </label>
                <select
                  value={editingPolicy.status || 'published'}
                  onChange={(e) => setEditingPolicy((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-bold text-stone-800"
                >
                  <option value="published">প্রকাশিত (Published / লাইভ)</option>
                  <option value="draft">ড্রাফট (Draft)</option>
                </select>
              </div>
            </div>

            {/* Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">
                  পূর্ণাঙ্গ পলিসি বিবরণ ও শর্তাবলী (Full Body Content)
                </label>
                <span className="text-[10px] text-stone-500">গ্রাহকদের জন্য সম্পূর্ণ বিস্তারিত নিয়মাবলি</span>
              </div>
              <textarea
                rows={12}
                value={editingPolicy.contentBn || ''}
                onChange={(e) => setEditingPolicy((prev) => ({ ...prev, contentBn: e.target.value }))}
                placeholder="এখানে বিস্তারিত রিটার্ন, এক্সচেঞ্জ, শিপিং বা শর্তাবলীর ধারা লিখুন..."
                className="w-full bg-white border border-stone-300 rounded-xl p-3.5 text-xs text-stone-800 leading-relaxed font-sans"
              />
            </div>

            {/* SEO Metadata */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>এসইও ও সার্চ ইঞ্জিন মেটাডাটা (SEO Settings)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    এসইও পেজ টাইটেল (SEO Meta Title)
                  </label>
                  <input
                    type="text"
                    value={editingPolicy.seoTitle || ''}
                    onChange={(e) => setEditingPolicy((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="রিটার্ন ও এক্সচেঞ্জ পলিসি | বস্ত্র শৈলী (BOSTROSHOILY)"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    মেটা ডেসক্রিপশন (Meta Description)
                  </label>
                  <input
                    type="text"
                    value={editingPolicy.metaDescription || ''}
                    onChange={(e) => setEditingPolicy((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="বস্ত্র শৈলী (BOSTROSHOILY)-র ৭ দিনের সহজ রিটার্ন ও ক্যাশ রিফান্ড পলিসি।"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUICK LINKS (PHASE 1.2) */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>প্রয়োজনীয় লিংক (Quick Links Manager)</span>
              </h3>
              <p className="text-xs text-stone-500">
                ফুটারের ২য় কলামে প্রদর্শিত লিংকগুলো পরিবর্তন, নতুন লিংক অ্যাড অথবা ডিলিট করুন
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>নতুন লিংক যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentLinks.map((link, idx) => (
              <div
                key={link.id}
                className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 shrink-0">
                  <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    লিংকের নাম (Title)
                  </label>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>

                <div className="w-full md:w-56">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    গন্তব্য প্রিসেট
                  </label>
                  <select
                    value={PRESET_ROUTES.some((p) => p.value === link.url) ? link.url : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        handleUpdateLink(link.id, { url: e.target.value });
                      }
                    }}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800 font-medium"
                  >
                    {PRESET_ROUTES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    URL বা পাথ
                  </label>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-mono text-stone-700"
                  />
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-4 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.isActive !== false}
                      onChange={(e) => handleUpdateLink(link.id, { isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>সক্রিয়</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHORT POLICIES (PHASE 1.2) */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>ফুটার শর্ট পলিসি তালিকা (Footer Policies)</span>
              </h3>
              <p className="text-xs text-stone-500">
                ফুটারের ৩য় কলামে প্রদর্শিত পলিসির তালিকা
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPolicy}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>নতুন পলিসি যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {currentPolicies.map((p, idx) => (
              <div key={p.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-800">{p.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePolicy(p.id)}
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => handleUpdatePolicy(p.id, { title: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-900"
                />
                <textarea
                  rows={2}
                  value={p.content}
                  onChange={(e) => handleUpdatePolicy(p.id, { content: e.target.value })}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-700"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTACTS (PHASE 1.2) */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
            <div>
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>যোগাযোগ তথ্য ও ঠিকানা (Contact Information)</span>
              </h3>
              <p className="text-xs text-stone-500">
                ফুটারের ৪র্থ কলামের ফোন, ঠিকানা ও হেল্পলাইন তথ্য
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddContact}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>নতুন যোগাযোগ ফিল্ড</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                প্রধান অফিস ও শোরুম ঠিকানা
              </label>
              <input
                type="text"
                value={formConfig.address}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                প্রধান ফোন / হেল্পলাইন
              </label>
              <input
                type="text"
                value={formConfig.phone}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                সাপোর্ট ইমেইল এড্রেস
              </label>
              <input
                type="email"
                value={formConfig.email}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-stone-700">কাস্টম যোগাযোগ আইটেমসমূহ:</h4>
            {currentContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center gap-3"
              >
                <div className="w-full md:w-36">
                  <select
                    value={contact.type}
                    onChange={(e) => handleUpdateContact(contact.id, { type: e.target.value as any })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                  >
                    <option value="address">ঠিকানা (Address)</option>
                    <option value="phone">ফোন (Phone)</option>
                    <option value="email">ইমেইল (Email)</option>
                    <option value="whatsapp">হোয়াটসঅ্যাপ</option>
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={contact.label}
                    onChange={(e) => handleUpdateContact(contact.id, { label: e.target.value })}
                    placeholder="লেবেল"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-800"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={contact.value}
                    onChange={(e) => handleUpdateContact(contact.id, { value: e.target.value })}
                    placeholder="মান বা নম্বর"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SOCIAL MEDIA (PHASE 1.2) */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-stone-100">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>সোশ্যাল মিডিয়া প্রোফাইল লিংকসমূহ (Social Media Links)</span>
            </h3>
            <p className="text-xs text-stone-500">
              ফুটারে মার্জিত ছোট আইকন হিসেবে প্রদর্শিত হবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" /> Facebook Page URL
              </span>
              <input
                type="text"
                value={formConfig.facebookUrl || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-700"
              />
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" /> Instagram Profile URL
              </span>
              <input
                type="text"
                value={formConfig.instagramUrl || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-700"
              />
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" /> YouTube Channel URL
              </span>
              <input
                type="text"
                value={formConfig.youtubeUrl || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-700"
              />
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Direct Link
              </span>
              <input
                type="text"
                value={formConfig.whatsappUrl || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, whatsappUrl: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-700"
              />
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                TikTok Profile URL
              </span>
              <input
                type="text"
                value={formConfig.tiktokUrl || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, tiktokUrl: e.target.value }))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ABOUT US & COPYRIGHT (PHASE 1.2) */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="text-sm font-black text-stone-900">
              ফুটার ব্র্যান্ড পরিচিতি ও কপিরাইট টেক্সট
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                ১ম কলামের ব্র্যান্ড পরিচিতি (About Us Bio)
              </label>
              <textarea
                rows={4}
                value={formConfig.aboutUs}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, aboutUs: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                কপিরাইট বার্তা (Copyright Notice)
              </label>
              <textarea
                rows={4}
                value={formConfig.copyrightText || ''}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, copyrightText: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-800 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Save Bar */}
      <div className="sticky bottom-4 z-20 bg-stone-900/95 backdrop-blur-sm text-white p-4 rounded-2xl border border-stone-700 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">পরিবর্তনগুলো সেভ করলেই হোম পেজ ও ওয়েবসাইটের ফুটারে লাইভ আপডেট হবে</span>
          <span className="sm:hidden">ফুটার লাইভ আপডেট হবে</span>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>সকল ফুটার পরিবর্তন সংরক্ষণ করুন</span>
        </button>
      </div>
    </div>
  );
};
export default FooterManagementModule;
