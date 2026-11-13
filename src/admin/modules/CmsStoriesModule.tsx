import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { HowToOrderStep, ClothingStory, BrandPartnerStory } from '../../types';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Video,
  ExternalLink,
  HelpCircle,
  Save,
  CheckCircle2,
  Award,
  Sparkles,
  Upload,
  PlayCircle,
  BookOpen,
} from 'lucide-react';

interface CmsStoriesModuleProps {
  initialTab?: 'cms_pages' | 'order_guide' | 'videos' | 'partner_stories';
}

export const CmsStoriesModule: React.FC<CmsStoriesModuleProps> = ({ initialTab = 'cms_pages' }) => {
  const {
    howToOrderSteps,
    updateHowToOrderStep,
    clothingStories,
    addClothingStory,
    updateClothingStory,
    deleteClothingStory,
    brandPartnerStories = [],
    addBrandPartnerStory,
    updateBrandPartnerStory,
    deleteBrandPartnerStory,
    saveBrandPartnerStories,
    footerConfig,
    updateFooterConfig,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'cms_pages' | 'order_guide' | 'videos' | 'partner_stories'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [editingStory, setEditingStory] = useState<Partial<ClothingStory> | null>(null);

  // Local state for partner stories to allow direct editing and explicit saving
  const [localPartnerStories, setLocalPartnerStories] = useState<BrandPartnerStory[]>(brandPartnerStories);

  // Local state for CMS Pages
  const [cmsForms, setCmsForms] = useState({
    aboutUs: footerConfig?.aboutUs || '',
    termsAndConditions: footerConfig?.termsAndConditions || '',
    privacyPolicy: footerConfig?.privacyPolicy || '',
    returnPolicy: footerConfig?.returnPolicy || '',
    shippingPolicy: footerConfig?.shippingPolicy || '',
  });

  useEffect(() => {
    if (footerConfig) {
      setCmsForms({
        aboutUs: footerConfig.aboutUs || '',
        termsAndConditions: footerConfig.termsAndConditions || '',
        privacyPolicy: footerConfig.privacyPolicy || '',
        returnPolicy: footerConfig.returnPolicy || '',
        shippingPolicy: footerConfig.shippingPolicy || '',
      });
    }
  }, [footerConfig]);

  const handleSaveCmsPages = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterConfig({
      ...footerConfig,
      aboutUs: cmsForms.aboutUs,
      termsAndConditions: cmsForms.termsAndConditions,
      privacyPolicy: cmsForms.privacyPolicy,
      returnPolicy: cmsForms.returnPolicy,
      shippingPolicy: cmsForms.shippingPolicy,
    });
    showToast('সকল CMS পলিসি পেজ সফলভাবে সংরক্ষিত হয়েছে!');
  };

  useEffect(() => {
    setLocalPartnerStories(brandPartnerStories);
  }, [brandPartnerStories]);

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory?.title || !editingStory?.videoUrl) {
      showToast('ভিডিও টাইটেল এবং URL আবশ্যক');
      return;
    }
    if (editingStory.id) {
      updateClothingStory(editingStory as ClothingStory);
    } else {
      addClothingStory(editingStory as ClothingStory);
    }
    setEditingStory(null);
  };

  const headerInfo = activeTab === 'cms_pages'
    ? {
        title: 'ওয়েবসাইট CMS পেজ ও পলিসি কনটেন্ট (CMS Pages)',
        subtitle: 'আমাদের পরিচিতি (About Us), শর্তাবলী, গোপনীয়তা, রিটার্ন ও শিপিং পলিসি পরিচালনা করুন',
        badge: 'CMS Pages',
      }
    : activeTab === 'partner_stories'
    ? {
        title: 'ঐতিহ্য ও ব্র্যান্ড পার্টনার স্টোরিজ (Brand Stories)',
        subtitle: 'হোম পেজে ঘূর্ণায়মান ঐতিহ্য ও তাঁতশিল্পী পার্টনার স্লাইডার কার্ড ও তথ্য পরিচালনা করুন',
        badge: 'Brand Stories',
      }
    : activeTab === 'order_guide'
    ? {
        title: '১৯. "কিভাবে অর্ডার করবেন" সহায়িকা ধাপ (Order Guides)',
        subtitle: 'গ্রাহকদের সহজ নির্দেশিকা ও ধাপে ধাপে অর্ডারিং টিউটোরিয়াল পরিচালনা করুন',
        badge: 'Order Guides',
      }
    : {
        title: '২১. কাপড়ের তথ্য ও শিক্ষণীয় ভিডিও (Educational Videos)',
        subtitle: 'লুঙ্গি ও ঐতিহ্যবাহী কাপড়ের গুণমান ও শিক্ষণীয় ভিডিও গ্যালারি পরিচালনা করুন',
        badge: 'Videos',
      };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-stone-900">
              {headerInfo.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {headerInfo.badge}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('cms_pages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cms_pages'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          CMS Pages (পলিসি ও পেজসমূহ)
        </button>
        <button
          onClick={() => setActiveTab('partner_stories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'partner_stories'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          ঐতিহ্য ও ব্র্যান্ড পার্টনার (Brand & Artisan Partners - ৪টি কার্ড)
        </button>
        <button
          onClick={() => setActiveTab('order_guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'order_guide'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          ১৯. "কিভাবে অর্ডার করবেন" সহায়িকা ধাপ
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          ২১. কাপড়ের তথ্য ও শিক্ষণীয় ভিডিও
        </button>
      </div>

      {/* CMS Static Pages Tab */}
      {activeTab === 'cms_pages' && (
        <form onSubmit={handleSaveCmsPages} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">ওয়েবসাইট CMS পেজ ও পলিসি কনটেন্ট</h3>
              <p className="text-xs text-stone-500">গ্রাহকদের জন্য আমাদের পরিচিতি, শর্তাবলী, গোপনীয়তা ও রিটার্ন পলিসি সম্পাদনা করুন</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>পলিসি পেজ সংরক্ষণ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-800">আমাদের সম্পর্কে / পরিচিতি (About Us)</label>
              <textarea
                rows={5}
                value={cmsForms.aboutUs}
                onChange={(e) => setCmsForms({ ...cmsForms, aboutUs: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none"
                placeholder="বস্ত্র শৈলী (BOSTROSHOILY)-এর ইতিহাস ও বেলকুচি তাঁত ঐতিহ্য..."
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-800">ব্যবহারের শর্তাবলী (Terms & Conditions)</label>
              <textarea
                rows={5}
                value={cmsForms.termsAndConditions}
                onChange={(e) => setCmsForms({ ...cmsForms, termsAndConditions: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none"
                placeholder="শর্তাবলী..."
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-800">গোপনীয়তা নীতি (Privacy Policy)</label>
              <textarea
                rows={5}
                value={cmsForms.privacyPolicy}
                onChange={(e) => setCmsForms({ ...cmsForms, privacyPolicy: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none"
                placeholder="গ্রাহকের তথ্যের গোপনীয়তা সম্পর্কিত নীতিমালা..."
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
              <label className="block text-xs font-bold text-stone-800">রিটার্ন ও এক্সচেঞ্জ নীতি (Return & Refund Policy)</label>
              <textarea
                rows={5}
                value={cmsForms.returnPolicy}
                onChange={(e) => setCmsForms({ ...cmsForms, returnPolicy: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none"
                placeholder="রিটার্ন ও সাইজ পরিবর্তনের নিয়ম..."
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-stone-800">ডেলিভারি ও শিপিং নীতি (Shipping Policy)</label>
              <textarea
                rows={3}
                value={cmsForms.shippingPolicy}
                onChange={(e) => setCmsForms({ ...cmsForms, shippingPolicy: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:bg-white focus:border-amber-600 outline-none"
                placeholder="সারা দেশে ক্যাশ অন ডেলিভারি এবং ডেলিভারি সময়সীমা..."
              />
            </div>
          </div>
        </form>
      )}

      {/* Brand & Artisan Partner Stories (4-box Slider) */}
      {activeTab === 'partner_stories' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-black">
                  <Award className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                  ঐতিহ্য ও ব্র্যান্ড পার্টনার (Brand & Artisan Partners - ৪টি স্লাইড)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {localPartnerStories.length} টি কার্ড
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                হোম পেজে ৫ সেকেন্ড পর পর ঘূর্ণায়মান ৪টি কার্ড। বক্সের ছবির উপরে টাইটেল, ছবি, বিস্তারিত বিবরণ ও ভিডিও টিউটোরিয়াল নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newStory: BrandPartnerStory = {
                    id: `story-${Date.now()}`,
                    orderNumber: localPartnerStories.length + 1,
                    title: 'নতুন নির্দেশিকা বা ঐতিহ্য',
                    titleEn: 'New Artisan Partner Guide',
                    shortDesc: 'সংক্ষিপ্ত বর্ণনা এখানে লিখুন',
                    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
                    detailedText: 'বিস্তারিত তথ্য ও গ্রাহক সহায়িকা এখানে লিখুন...',
                    isActive: true,
                  };
                  const updated = [...localPartnerStories, newStory];
                  setLocalPartnerStories(updated);
                  saveBrandPartnerStories(updated);
                }}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন পার্টনার কার্ড</span>
              </button>

              <button
                type="button"
                onClick={() => saveBrandPartnerStories(localPartnerStories)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>সকল পার্টনার কার্ড সেভ করুন</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {localPartnerStories.map((story, idx) => (
              <div
                key={story.id || idx}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs p-5 space-y-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-black text-xs flex items-center justify-center">
                      {story.orderNumber || idx + 1}
                    </span>
                    <span className="font-bold text-xs text-stone-800">
                      কার্ড #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={story.isActive}
                        onChange={(e) => {
                          const updated = [...localPartnerStories];
                          updated[idx] = { ...updated[idx], isActive: e.target.checked };
                          setLocalPartnerStories(updated);
                        }}
                        className="w-4 h-4 text-amber-600 cursor-pointer"
                      />
                      <span>সক্রিয়</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = localPartnerStories.filter((_, i) => i !== idx);
                        setLocalPartnerStories(updated);
                        saveBrandPartnerStories(updated);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3 text-xs">
                  {/* Title (Shown above the image box) */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      কার্ডের শিরোনাম (ছবির বক্সের উপরে প্রদর্শিত টাইটেল)
                    </label>
                    <input
                      type="text"
                      value={story.title || ''}
                      onChange={(e) => {
                        const updated = [...localPartnerStories];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setLocalPartnerStories(updated);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">ইংরেজি টাইটেল</label>
                    <input
                      type="text"
                      value={story.titleEn || ''}
                      onChange={(e) => {
                        const updated = [...localPartnerStories];
                        updated[idx] = { ...updated[idx], titleEn: e.target.value };
                        setLocalPartnerStories(updated);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-700"
                    />
                  </div>

                  {/* Image Preview & URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-stone-700">ছবির লিংক বা ছবি আপলোড</label>
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ডিভাইস থেকে আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const dataUrl = evt.target?.result as string;
                              if (dataUrl) {
                                const updated = [...localPartnerStories];
                                updated[idx] = { ...updated[idx], image: dataUrl };
                                setLocalPartnerStories(updated);
                                showToast('ছবি আপলোড সম্পন্ন হয়েছে');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={story.image || ''}
                      onChange={(e) => {
                        const updated = [...localPartnerStories];
                        updated[idx] = { ...updated[idx], image: e.target.value };
                        setLocalPartnerStories(updated);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs"
                    />

                    {story.image && (
                      <div className="aspect-16/9 mt-2 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">সংক্ষিপ্ত বিবরণ (কার্ডের নিচে)</label>
                    <textarea
                      rows={2}
                      value={story.shortDesc || ''}
                      onChange={(e) => {
                        const updated = [...localPartnerStories];
                        updated[idx] = { ...updated[idx], shortDesc: e.target.value };
                        setLocalPartnerStories(updated);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                    />
                  </div>

                  {/* Video Embed Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        ভিডিও URL (YouTube Embed Link)
                      </label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/embed/..."
                        value={story.videoUrl || ''}
                        onChange={(e) => {
                          const updated = [...localPartnerStories];
                          updated[idx] = { ...updated[idx], videoUrl: e.target.value };
                          setLocalPartnerStories(updated);
                        }}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ভিডিও টাইটেল</label>
                      <input
                        type="text"
                        placeholder="যেমন: ঐতিহ্যবাহী তাঁত বুনন"
                        value={story.videoTitle || ''}
                        onChange={(e) => {
                          const updated = [...localPartnerStories];
                          updated[idx] = { ...updated[idx], videoTitle: e.target.value };
                          setLocalPartnerStories(updated);
                        }}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Detailed Text for Modal */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      বিস্তারিত বিবরণ ও নির্দেশিকা (কার্ডে ক্লিক করলে পপআপে যা দেখাবে)
                    </label>
                    <textarea
                      rows={4}
                      value={story.detailedText || ''}
                      onChange={(e) => {
                        const updated = [...localPartnerStories];
                        updated[idx] = { ...updated[idx], detailedText: e.target.value };
                        setLocalPartnerStories(updated);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => saveBrandPartnerStories(localPartnerStories)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>সকল পার্টনার কার্ড সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 19. How to Order Steps */}
      {activeTab === 'order_guide' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            গ্রাহক যখন হোম পেজ বা "কিভাবে অর্ডার করবেন" পেজে প্রবেশ করবেন, তখন এই ৫টি ধাপ দেখানো হবে।
            আপনি নিচের ইনপুট ফিল্ডগুলোতে যেকোনো সময় লেখা আপডেট করতে পারবেন।
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {howToOrderSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center">
                    0{step.stepNumber}
                  </span>
                  <span className="text-xs font-bold text-stone-400 uppercase">
                    Step {step.stepNumber}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-stone-600 text-[10px] uppercase">
                      ধাপের শিরোনাম
                    </label>
                    <input
                      type="text"
                      value={step.banglaTitle || ''}
                      onChange={(e) =>
                        updateHowToOrderStep({ ...step, banglaTitle: e.target.value })
                      }
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 text-[10px] uppercase">
                      বিস্তারিত নির্দেশনা
                    </label>
                    <textarea
                      rows={3}
                      value={step.description || ''}
                      onChange={(e) =>
                        updateHowToOrderStep({ ...step, description: e.target.value })
                      }
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 21. Clothing Stories & Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800">
              ভিডিও ও টিউটোরিয়াল সংগ্রহ ({clothingStories.length} টি)
            </span>
            <button
              onClick={() =>
                setEditingStory({
                  title: 'How to Wear a Traditional Bengali Lungi',
                  banglaTitle: 'লুঙ্গি পরার সহজ ও সঠিক নিয়ম',
                  description: 'কীভাবে লুঙ্গি সুন্দরভাবে পরিধান করবেন তার সহজ ভিডিও টিউটোরিয়াল।',
                  videoUrl: 'https://www.youtube.com',
                  thumbnail:
                    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
                  duration: '3:45 min',
                  isActive: true,
                })
              }
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ভিডিও যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clothingStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-stone-900">
                  <img src={story.thumbnail} alt={story.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-stone-900/90 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    {story.duration}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-stone-900 text-sm">{story.banglaTitle || story.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2">{story.description}</p>
                  <p className="text-[11px] font-mono text-stone-400 truncate">{story.videoUrl}</p>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        story.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {story.isActive ? 'Active' : 'Hidden'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingStory({ ...story })}
                        className="p-1 text-stone-600 hover:text-amber-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('আপনি কি এই ভিডিওটি মুছে ফেলতে চান?')) {
                            deleteClothingStory(story.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">ভিডিও তথ্য সম্পাদনা</h3>
            <form onSubmit={handleSaveStory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">ভিডিও টাইটেল (বাংলা)</label>
                <input
                  type="text"
                  required
                  value={editingStory.banglaTitle || ''}
                  onChange={(e) =>
                    setEditingStory({ ...editingStory, banglaTitle: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ভিডিও URL (YouTube Link)</label>
                <input
                  type="text"
                  required
                  value={editingStory.videoUrl || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, videoUrl: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">থাম্বনেইল ইমেজ URL</label>
                <input
                  type="text"
                  value={editingStory.thumbnail || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, thumbnail: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ভিডিও বিবরণ</label>
                <textarea
                  rows={3}
                  value={editingStory.description || ''}
                  onChange={(e) =>
                    setEditingStory({ ...editingStory, description: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-4 py-2 bg-stone-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
