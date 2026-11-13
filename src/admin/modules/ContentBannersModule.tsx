import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Category,
  HeroBanner,
  CollectionItem,
  CollectionGridItem,
  CategoryBanner,
  NavigationMenu,
  NavigationMenuItem,
  CategoryOfferItem,
  OfferSectionConfig,
} from '../../types';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Clock,
  Flame,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  Layers,
  ChevronDown,
  Upload,
  Save,
  Tag,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ContentBannersModuleProps {
  initialSubTab?: 'hero' | 'men_banner' | 'women_banner' | 'collections' | 'categories' | 'navigation' | 'offers' | 'cat_banners';
}

export const ContentBannersModule: React.FC<ContentBannersModuleProps> = ({ initialSubTab = 'hero' }) => {
  const {
    heroBanners,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    collections,
    updateCollection,
    updateCollections,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    navMenus,
    updateNavMenu,
    addNavSubItem,
    removeNavSubItem,
    categoryBanners,
    updateCategoryBanner,
    saveCategoryBanners,
    offerConfig,
    updateOfferConfig,
    megaFestiveOffers = [],
    addMegaFestiveOffer,
    updateMegaFestiveOffer,
    deleteMegaFestiveOffer,
    saveMegaFestiveOffers,
    storeDesign,
    updateStoreDesign,
    showToast,
  } = useShop();

  const [addingSubItemMenuId, setAddingSubItemMenuId] = useState<string | null>(null);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newSubBn, setNewSubBn] = useState('');
  const [newSubUrl, setNewSubUrl] = useState('');

  const [localOffers, setLocalOffers] = useState<CategoryOfferItem[]>(megaFestiveOffers);
  const [localOfferConfig, setLocalOfferConfig] = useState<OfferSectionConfig>(offerConfig);
  const [localCollections, setLocalCollections] = useState<CollectionGridItem[]>(collections);
  const [localCatBanners, setLocalCatBanners] = useState<CategoryBanner[]>(categoryBanners);

  // Sync if megaFestiveOffers changes from external source
  React.useEffect(() => {
    setLocalOffers(megaFestiveOffers);
  }, [megaFestiveOffers]);

  React.useEffect(() => {
    setLocalOfferConfig(offerConfig);
  }, [offerConfig]);

  React.useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  React.useEffect(() => {
    if (!categories || categories.length === 0) {
      setLocalCatBanners(categoryBanners);
      return;
    }

    const existingMap = new Map<string, CategoryBanner>();
    (categoryBanners || []).forEach((b) => {
      if (b.categorySlug) existingMap.set(b.categorySlug.toLowerCase(), b);
    });

    const merged: CategoryBanner[] = [];

    // 1. Automatically ensure every category from Category Management is included
    categories.forEach((cat) => {
      const slug = (cat.slug || '').toLowerCase();
      if (!slug) return;
      const existing = existingMap.get(slug);
      if (existing) {
        merged.push(existing);
        existingMap.delete(slug);
      } else {
        merged.push({
          id: `cat-ban-${slug}`,
          categorySlug: slug,
          title: `${cat.name} Collection Banner`,
          banglaTitle: `${cat.banglaName || cat.name} কালেকশন ব্যানার`,
          description: cat.description || `${cat.banglaName || cat.name}-এর ঐতিহ্যবাহী ও প্রিমিয়াম পোশাকের সেরা সমাহার`,
          desktopImage: cat.banner || cat.image || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=1200',
          isActive: true,
        });
      }
    });

    // 2. Add any remaining custom category banners
    existingMap.forEach((ban) => {
      merged.push(ban);
    });

    setLocalCatBanners(merged);
  }, [categoryBanners, categories]);

  const handleSaveOfferConfig = () => {
    updateOfferConfig(localOfferConfig);
    showToast('অফার ব্যানার ও টাইমার সেটিংস সংরক্ষিত হয়েছে');
  };

  const handleSaveAllFestiveOffers = () => {
    updateOfferConfig(localOfferConfig);
    saveMegaFestiveOffers(localOffers);
    showToast('সকল মেগা উৎসব অফার ও টাইমার সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveCollections = () => {
    updateCollections(localCollections);
    showToast('কালেকশন গ্রিড ৫টি আইটেম সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveCatBanners = () => {
    saveCategoryBanners(localCatBanners);
    showToast('সকল ক্যাটাগরি ব্যানার সফলভাবে সংরক্ষিত হয়েছে');
  };

  const [activeSubTab, setActiveSubTab] = useState<
    'hero' | 'men_banner' | 'women_banner' | 'collections' | 'categories' | 'navigation' | 'offers' | 'cat_banners'
  >(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Modal for Hero Banner
  const [editingHero, setEditingHero] = useState<Partial<HeroBanner> | null>(null);

  // Modal for Category
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Modal for Category Banner (Men / Women / Other)
  const [editingCatBanner, setEditingCatBanner] = useState<Partial<CategoryBanner> | null>(null);
  const [catBannerView, setCatBannerView] = useState<'categories' | 'home'>('categories');
  const [catBannerSearch, setCatBannerSearch] = useState('');

  // Save Hero Banner
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHero?.title || !editingHero?.desktopImage) {
      showToast('ব্যানার টাইটেল ও ছবি আবশ্যক।');
      return;
    }
    if (editingHero.id) {
      updateHeroBanner(editingHero as HeroBanner);
    } else {
      addHeroBanner(editingHero as HeroBanner);
    }
    setEditingHero(null);
  };

  // Save Category Banner
  const handleSaveCatBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatBanner?.categorySlug || !editingCatBanner?.desktopImage) {
      showToast('ক্যাটাগরি স্লাগ ও ব্যানার ছবি আবশ্যক');
      return;
    }
    if (editingCatBanner.id) {
      const updated = localCatBanners.map((b) => (b.id === editingCatBanner.id ? ({ ...b, ...editingCatBanner } as CategoryBanner) : b));
      setLocalCatBanners(updated);
      saveCategoryBanners(updated);
      showToast('ক্যাটাগরি ব্যানার আপডেট হয়েছে');
    } else {
      const newBanner: CategoryBanner = {
        id: `cat-ban-${Date.now()}`,
        categorySlug: editingCatBanner.categorySlug,
        title: editingCatBanner.title || 'Category Banner',
        banglaTitle: editingCatBanner.banglaTitle || 'ক্যাটাগরি ব্যানার',
        description: editingCatBanner.description || '',
        desktopImage: editingCatBanner.desktopImage || '',
        mobileImage: editingCatBanner.mobileImage || editingCatBanner.desktopImage || '',
        isActive: editingCatBanner.isActive !== false,
      };
      const updated = [newBanner, ...localCatBanners];
      setLocalCatBanners(updated);
      saveCategoryBanners(updated);
      showToast('নতুন ক্যাটাগরি ব্যানার যুক্ত হয়েছে');
    }
    setEditingCatBanner(null);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    const slug =
      editingCategory.slug ||
      editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (editingCategory.id) {
      updateCategory({ ...editingCategory, slug } as Category);
    } else {
      addCategory({ ...editingCategory, slug } as Category);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            ব্যানার, কালেকশন, মেনু ও অফার নিয়ন্ত্রণ
          </h2>
          <p className="text-xs text-stone-500">
            ওয়েবসাইটের স্লাইডার, মেগা মেনু, কালেকশন গ্রিড ও অফার কাউন্টডাউন সহজে পরিবর্তন করুন
          </p>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'hero', label: 'হোম পেজ মেইন ব্যানার (হিরো স্লাইডার ও বাটন)' },
          { id: 'men_banner', label: 'মেন (পুরুষ) পেজ ব্যানার' },
          { id: 'women_banner', label: 'ওমেন (নারী) পেজ ব্যানার' },
          { id: 'collections', label: 'হোম পেজ গ্যালারি ব্যানার (গ্রিড)' },
          { id: 'cat_banners', label: 'অন্যান্য ক্যাটাগরি ব্যানার' },
          { id: 'offers', label: 'অফার ও কাউন্টডাউন টাইমার' },
          { id: 'categories', label: 'ক্যাটাগরি ও সাব-ক্যাটাগরি' },
          { id: 'navigation', label: 'হেডার ও ড্রপডাউন মেনু' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Hero Slider Management */}
      {activeSubTab === 'hero' && (
        <div className="space-y-4">
          {/* Quick Banner Pixel Height Control */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block">ব্যানার উচ্চতা / সাইজ পিক্সেল কন্ট্রোল (Pixel Size):</span>
                <span className="text-[11px] text-stone-600">
                  বর্তমান সাইজ — ডেস্কটপ: <strong className="font-mono text-amber-900">{storeDesign?.heroBannerHeightDesktop || 280}px</strong> | মোবাইল: <strong className="font-mono text-amber-900">{storeDesign?.heroBannerHeightMobile || 180}px</strong>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-semibold">ডেস্কটপ:</span>
                <input
                  type="number"
                  min="140"
                  max="650"
                  value={storeDesign?.heroBannerHeightDesktop || 280}
                  onChange={(e) => updateStoreDesign({ heroBannerHeightDesktop: Number(e.target.value) })}
                  className="w-16 text-center font-mono font-bold text-xs border border-stone-300 rounded p-0.5 bg-stone-50 focus:bg-white"
                />
                <span className="text-[10px] text-stone-400 font-mono">px</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 font-semibold">মোবাইল:</span>
                <input
                  type="number"
                  min="90"
                  max="450"
                  value={storeDesign?.heroBannerHeightMobile || 180}
                  onChange={(e) => updateStoreDesign({ heroBannerHeightMobile: Number(e.target.value) })}
                  className="w-16 text-center font-mono font-bold text-xs border border-stone-300 rounded p-0.5 bg-stone-50 focus:bg-white"
                />
                <span className="text-[10px] text-stone-400 font-mono">px</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <span className="text-xs font-extrabold text-stone-900 block">
                হোম ও প্রোডাক্ট পেজের স্লাইডার ব্যানার ({heroBanners.length} টি ব্যানার | সক্রিয়: {heroBanners.filter((b) => b.isActive).length} টি)
              </span>
              <span className="text-[11px] text-stone-500">
                যেকোনো ব্যানার ও ব্যানারের নিচের "Shop for men" / "Shop for women" বাটন ১ ক্লিকে সক্রিয় (Active) বা বন্ধ (Inactive) করুন।
              </span>
            </div>
            <button
              onClick={() =>
                setEditingHero({
                  title: 'New Fashion Arrival',
                  banglaTitle: 'নতুন আকর্ষণীয় পোশাক সংগ্রহ',
                  subtitle: 'প্রিমিয়াম সুতি ও আধুনিক ডিজাইনের মেলবন্ধন',
                  desktopImage:
                    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1600&q=80',
                  mobileImage:
                    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
                  buttonText: 'কালেকশন দেখুন',
                  buttonUrl: '/category/lungi',
                  tag: 'New',
                  order: heroBanners.length + 1,
                  isActive: true,
                  showMenButton: true,
                  showWomenButton: true,
                  menButtonText: 'Shop for men',
                  menButtonUrl: '/category/men',
                  womenButtonText: 'Shop for women',
                  womenButtonUrl: '/category/women',
                })
              }
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ব্যানার যুক্ত করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroBanners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-16/7 bg-stone-100">
                  <img src={banner.desktopImage} alt={banner.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !banner.isActive;
                      updateHeroBanner(banner.id, { isActive: nextState });
                      showToast(`ব্যানারটি ${nextState ? 'সক্রিয় (Active)' : 'অসক্রিয় (Inactive)'} করা হয়েছে`);
                    }}
                    className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                      banner.isActive
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700'
                    }`}
                    title="স্লাইড ব্যানার সক্রিয় বা অসক্রিয় করতে ক্লিক করুন"
                  >
                    <span className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                    <span>{banner.isActive ? 'সক্রিয় (Active)' : 'অসক্রিয় (Inactive)'}</span>
                  </button>
                  <span className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    Order: {banner.order}
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <h4 className="font-bold text-stone-900 text-sm">{banner.banglaTitle || banner.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-1">{banner.subtitle}</p>

                  {/* Independent Men and Women Button Controls for this Hero Banner */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-600 uppercase block">
                      হোম পেজ ব্যানার বাটন অন/অফ সুইচ:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const next = banner.showMenButton === false ? true : false;
                          updateHeroBanner(banner.id, { showMenButton: next });
                          showToast(`Shop for Men বাটন ${next ? 'সক্রিয়' : 'বন্ধ'} করা হয়েছে`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          banner.showMenButton !== false
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-stone-400 border-stone-300 line-through'
                        }`}
                        title="Shop for men বাটন চালু বা বন্ধ করতে ক্লিক করুন"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${banner.showMenButton !== false ? 'bg-white' : 'bg-stone-400'}`} />
                        <span>{banner.showMenButton !== false ? '✓ Men বাটন (Active)' : '✕ Men বাটন (Off)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = banner.showWomenButton === false ? true : false;
                          updateHeroBanner(banner.id, { showWomenButton: next });
                          showToast(`Shop for Women বাটন ${next ? 'সক্রিয়' : 'বন্ধ'} করা হয়েছে`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          banner.showWomenButton !== false
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-stone-400 border-stone-300 line-through'
                        }`}
                        title="Shop for women বাটন চালু বা বন্ধ করতে ক্লিক করুন"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${banner.showWomenButton !== false ? 'bg-white' : 'bg-stone-400'}`} />
                        <span>{banner.showWomenButton !== false ? '✓ Women বাটন (Active)' : '✕ Women বাটন (Off)'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-mono text-amber-800 font-semibold truncate max-w-[200px]">
                      CTA: {banner.buttonText} → {banner.buttonUrl}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingHero({ ...banner })}
                        className="p-1 text-stone-600 hover:text-amber-800 cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('আপনি কি এই ব্যানারটি মুছে ফেলতে চান?')) {
                            deleteHeroBanner(banner.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="Delete Banner"
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

      {/* 2. Men Page Banner Management */}
      {activeSubTab === 'men_banner' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <span className="text-xs font-extrabold text-stone-900 block">
                মেন (পুরুষ) পেজ ব্যানার কন্ট্রোল
              </span>
              <p className="text-[11px] text-stone-500">
                /category/men পেজের উপরে প্রদর্শিত ব্যানার আলাদাভাবে যোগ করুন ও সক্রিয়/নিষ্ক্রিয় করুন
              </p>
            </div>
            <button
              onClick={() =>
                setEditingCatBanner({
                  categorySlug: 'men',
                  title: 'Men Collection Banner',
                  banglaTitle: 'পুরুষের আভিজাত্য ও ঐতিহ্যের সেরা সমাহার',
                  description: 'সিরাজগঞ্জের তাঁতের ঐতিহ্যবাহী লুঙ্গি, রাজকীয় পাঞ্জাবি ও প্রিমিয়াম টি-শার্ট',
                  desktopImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200',
                  isActive: true,
                })
              }
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন মেন ব্যানার যুক্ত করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localCatBanners
              .filter((b) => ['men', 'lungi', 'panjabi', 'tshirt', 't-shirt'].includes(b.categorySlug?.toLowerCase()))
              .map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-16/7 relative bg-stone-100">
                    <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localCatBanners.map((item) =>
                          item.id === b.id ? { ...item, isActive: !item.isActive } : item
                        );
                        setLocalCatBanners(updated);
                        saveCategoryBanners(updated);
                        showToast(`মেন ব্যানার ${!b.isActive ? 'সক্রিয়' : 'অসক্রিয়'} করা হয়েছে`);
                      }}
                      className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                        b.isActive !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900/90 text-stone-300 border border-stone-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${b.isActive !== false ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                      <span>{b.isActive !== false ? 'সক্রিয় (Active)' : 'অসক্রিয় (Inactive)'}</span>
                    </button>
                    <span className="absolute bottom-2 right-2 bg-blue-900/90 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      /{b.categorySlug}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm">{b.banglaTitle || b.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{b.description}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-blue-700">ক্যাটাগরি: {b.categorySlug}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCatBanner({ ...b })}
                          className="p-1 text-stone-600 hover:text-blue-700 cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই মেন ব্যানারটি মুছে ফেলতে চান?')) {
                              const updated = localCatBanners.filter((item) => item.id !== b.id);
                              setLocalCatBanners(updated);
                              saveCategoryBanners(updated);
                              showToast('মেন ব্যানার মুছে ফেলা হয়েছে');
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="মুছে ফেলুন"
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

      {/* 3. Women Page Banner Management */}
      {activeSubTab === 'women_banner' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <span className="text-xs font-extrabold text-stone-900 block">
                ওমেন (নারী) পেজ ব্যানার কন্ট্রোল
              </span>
              <p className="text-[11px] text-stone-500">
                /category/women পেজের উপরে প্রদর্শিত ব্যানার আলাদাভাবে যোগ করুন ও সক্রিয়/নিষ্ক্রিয় করুন
              </p>
            </div>
            <button
              onClick={() =>
                setEditingCatBanner({
                  categorySlug: 'women',
                  title: 'Women Collection Banner',
                  banglaTitle: 'মহিলাদের ঐতিহ্য ও আধুনিক ফ্যাশন',
                  description: 'ঢাকাই জামদানি, সুতি ও সিল্ক শাড়ির সাথে আকর্ষণীয় ডিজাইনার থ্রি-পিস',
                  desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
                  isActive: true,
                })
              }
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ওমেন ব্যানার যুক্ত করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localCatBanners
              .filter((b) => ['women', 'saree', 'three-piece', 'threepiece'].includes(b.categorySlug?.toLowerCase()))
              .map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-16/7 relative bg-stone-100">
                    <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localCatBanners.map((item) =>
                          item.id === b.id ? { ...item, isActive: !item.isActive } : item
                        );
                        setLocalCatBanners(updated);
                        saveCategoryBanners(updated);
                        showToast(`ওমেন ব্যানার ${!b.isActive ? 'সক্রিয়' : 'অসক্রিয়'} করা হয়েছে`);
                      }}
                      className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                        b.isActive !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900/90 text-stone-300 border border-stone-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${b.isActive !== false ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                      <span>{b.isActive !== false ? 'সক্রিয় (Active)' : 'অসক্রিয় (Inactive)'}</span>
                    </button>
                    <span className="absolute bottom-2 right-2 bg-rose-900/90 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      /{b.categorySlug}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-stone-900 text-sm">{b.banglaTitle || b.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{b.description}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-rose-700">ক্যাটাগরি: {b.categorySlug}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCatBanner({ ...b })}
                          className="p-1 text-stone-600 hover:text-rose-700 cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই ওমেন ব্যানারটি মুছে ফেলতে চান?')) {
                              const updated = localCatBanners.filter((item) => item.id !== b.id);
                              setLocalCatBanners(updated);
                              saveCategoryBanners(updated);
                              showToast('ওমেন ব্যানার মুছে ফেলা হয়েছে');
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="মুছে ফেলুন"
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

      {/* 4. Category Management */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-800">
              ক্যাটাগরি ও সাব-ক্যাটাগরি তালিকা ({categories.length} টি)
            </span>
            <button
              onClick={() =>
                setEditingCategory({
                  name: '',
                  banglaName: '',
                  slug: '',
                  parentCategory: 'MEN',
                  description: 'প্রিমিয়াম কালেকশন',
                  order: categories.length + 1,
                  isActive: true,
                })
              }
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ক্যাটাগরি</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-600">
                <tr>
                  <th className="p-3">নাম ও বাংলা নাম</th>
                  <th className="p-3">Parent Group</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">ক্রম (Order)</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">
                      {cat.name} ({cat.banglaName})
                    </td>
                    <td className="p-3 font-semibold text-amber-800">{cat.parentCategory}</td>
                    <td className="p-3 font-mono text-stone-500">/{cat.slug}</td>
                    <td className="p-3 font-bold">{cat.order}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = !cat.isActive;
                          updateCategory(cat.id, { isActive: newStatus, active: newStatus ? 1 : 0 } as any);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs ${
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                        <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-1 hover:text-amber-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${cat.name}" মুছে ফেলতে চান?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Navigation & Header Menus */}
      {activeSubTab === 'navigation' && (
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>মেনু ও সাব-আইটেম নিয়ন্ত্রণ:</strong> MEN এর ভেতর Lungi, Panjabi, T-Shirt; WOMEN এর ভেতর
            Saree, Three-Piece ইত্যাদি আপনি এখান থেকেই সম্পূর্ণ নিয়ন্ত্রণ করতে পারেন।
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {navMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      {menu.label} ({menu.banglaLabel})
                    </h3>
                    <p className="text-[11px] text-stone-400">ড্রপডাউন সাব-আইটেম সংখ্যা: {menu.items.length}</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menu.isActive}
                      onChange={(e) => updateNavMenu({ ...menu, isActive: e.target.checked })}
                    />
                    <span>সক্রিয়</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">সাব-আইটেম তালিকা</span>
                  {menu.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-900">{it.label}</span>
                        <span className="text-stone-500 ml-1">({it.banglaLabel})</span>
                        <span className="text-[10px] font-mono text-stone-400 block">{it.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={it.isActive}
                            onChange={(e) => {
                              const updatedItems = [...menu.items];
                              updatedItems[idx] = { ...updatedItems[idx], isActive: e.target.checked };
                              updateNavMenu({ ...menu, items: updatedItems });
                            }}
                          />
                          <span>Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি "${it.label}" সাব-আইটেমটি মুছে ফেলতে চান?`)) {
                              removeNavSubItem(menu.id, it.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Sub-Item Inline Form / Button */}
                  {addingSubItemMenuId === menu.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSubLabel.trim()) return;
                        const slug = newSubUrl.trim().replace(/^\/category\//, '') || newSubLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        addNavSubItem(menu.id, {
                          label: newSubLabel.trim(),
                          banglaLabel: newSubBn.trim() || newSubLabel.trim(),
                          url: newSubUrl.trim() || `/category/${slug}`,
                          categorySlug: slug,
                        });
                        setAddingSubItemMenuId(null);
                        setNewSubLabel('');
                        setNewSubBn('');
                        setNewSubUrl('');
                      }}
                      className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2 text-xs"
                    >
                      <span className="font-bold text-stone-800 block">নতুন সাব-ক্যাটাগরি যুক্ত করুন:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={newSubLabel}
                          onChange={(e) => setNewSubLabel(e.target.value)}
                          placeholder="নাম (যেমন: Lungi)"
                          className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          required
                          value={newSubBn}
                          onChange={(e) => setNewSubBn(e.target.value)}
                          placeholder="বাংলা নাম (যেমন: লুঙ্গি)"
                          className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={newSubUrl}
                          onChange={(e) => setNewSubUrl(e.target.value)}
                          placeholder="লিঙ্ক (যেমন: /category/lungi)"
                          className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setAddingSubItemMenuId(null)}
                          className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs"
                        >
                          যোগ করুন
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingSubItemMenuId(menu.id);
                        setNewSubLabel('');
                        setNewSubBn('');
                        setNewSubUrl('');
                      }}
                      className="w-full py-1.5 border border-dashed border-stone-300 hover:border-amber-500 rounded-xl text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন সাব-আইটেম যোগ করুন</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Collection Grid Management */}
      {activeSubTab === 'collections' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div>
              <span className="font-extrabold text-stone-900 text-sm block">
                হোম পেজ কালেকশন গ্যালারি ব্যানার ({localCollections.length} টি আইটেম)
              </span>
              <p className="text-stone-500 text-[11px] mt-0.5">
                লুঙ্গি, শাড়ি, টি-শার্ট, থ্রি-পিস ও পাঞ্জাবির ছবি, শিরোনাম, লিঙ্ক এবং নতুন গ্যালারি ব্যানার যুক্ত করুন
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newItem: CollectionGridItem = {
                    id: `col-custom-${Date.now()}`,
                    title: 'New Gallery Banner',
                    banglaTitle: 'নতুন গ্যালারি ব্যানার',
                    subtitle: 'এক্সক্লুসিভ দেশীয় ফ্যাশন সম্ভার',
                    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200',
                    link: '/category/men',
                    position: localCollections.length + 1,
                    isActive: true,
                  };
                  setLocalCollections([...localCollections, newItem]);
                  showToast('নতুন গ্যালারি ব্যানার যুক্ত হয়েছে। ছবি ও নাম পরিবর্তন করে সংরক্ষণ করুন।');
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন গ্যালারি ব্যানার যোগ করুন</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCollections}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>কালেকশন সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localCollections.map((col, idx) => (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="aspect-4/3 relative bg-stone-100">
                  <img src={col.image} alt={col.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    Position: {col.position}
                  </span>
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <label className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs">
                      <input
                        type="checkbox"
                        checked={col.isActive !== false}
                        onChange={(e) => {
                          const updated = [...localCollections];
                          updated[idx] = { ...updated[idx], isActive: e.target.checked };
                          setLocalCollections(updated);
                        }}
                        className="w-3 h-3 text-emerald-600 rounded"
                      />
                      <span>{col.isActive !== false ? 'সক্রিয়' : 'বন্ধ'}</span>
                    </label>
                    {localCollections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি এই গ্যালারি ব্যানারটি মুছে ফেলতে চান?')) {
                            const updated = localCollections.filter((_, i) => i !== idx);
                            setLocalCollections(updated);
                            showToast('গ্যালারি ব্যানার অপসারিত হয়েছে। সংরক্ষণ বাটনে চাপুন।');
                          }
                        }}
                        className="p-1 bg-white/95 hover:bg-rose-50 text-stone-500 hover:text-rose-600 rounded-lg shadow-2xs cursor-pointer transition-colors"
                        title="গ্যালারি ব্যানার মুছুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">বাংলা শিরোনাম:</label>
                    <input
                      type="text"
                      value={col.banglaTitle}
                      onChange={(e) => {
                        const updated = [...localCollections];
                        updated[idx] = { ...updated[idx], banglaTitle: e.target.value };
                        setLocalCollections(updated);
                      }}
                      className="w-full font-bold text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">উপ-শিরোনাম:</label>
                    <input
                      type="text"
                      value={col.subtitle}
                      onChange={(e) => {
                        const updated = [...localCollections];
                        updated[idx] = { ...updated[idx], subtitle: e.target.value };
                        setLocalCollections(updated);
                      }}
                      className="w-full text-[11px] text-stone-700 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">ক্যাটাগরি লিঙ্ক (URL):</label>
                    <input
                      type="text"
                      value={col.link}
                      onChange={(e) => {
                        const updated = [...localCollections];
                        updated[idx] = { ...updated[idx], link: e.target.value };
                        setLocalCollections(updated);
                      }}
                      placeholder="/category/lungi"
                      className="w-full font-mono text-[11px] text-amber-900 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">ছবি (Upload বা URL):</label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>আপলোড</span>
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
                                const updated = [...localCollections];
                                updated[idx] = { ...updated[idx], image: dataUrl };
                                setLocalCollections(updated);
                                showToast('ছবি আপলোড সম্পন্ন হয়েছে!');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={col.image}
                        onChange={(e) => {
                          const updated = [...localCollections];
                          updated[idx] = { ...updated[idx], image: e.target.value };
                          setLocalCollections(updated);
                        }}
                        placeholder="https://..."
                        className="w-full font-mono text-[10px] text-stone-500 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Bar */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs text-stone-600 font-medium">
              সবগুলো কালেকশন কার্ডের পরিবর্তন ওয়েবসাইটে প্রয়োগ করতে নিচের বাটনে ক্লিক করুন
            </span>
            <button
              type="button"
              onClick={handleSaveCollections}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>কালেকশন গ্রিড সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 10. Offer & Countdown Timer */}
      {activeSubTab === 'offers' && (
        <div className="space-y-6">
          {/* Top Box: Offer Headline & Live Countdown Timer Settings */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                    হোম পেজ অফার ব্যানার ও লাইভ কাউন্টডাউন টাইমার কন্ট্রোল
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  হোম পেজে প্রদর্শিত বিশেষ উৎসব অফারের মূল শিরোনাম, বিবরণ ও টাইমার শেষ হওয়ার সময় নির্ধারণ করুন
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition-colors">
                  <input
                    type="checkbox"
                    checked={localOfferConfig.isActive !== false}
                    onChange={(e) =>
                      setLocalOfferConfig({ ...localOfferConfig, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-stone-800">অফার সেকশন চালু রাখুন</span>
                </label>

                <button
                  type="button"
                  onClick={handleSaveOfferConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>টাইমার সেটিংস সেভ করুন</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  অফার বাংলা শিরোনাম (হোম পেজে বড় করে দেখাবে)
                </label>
                <input
                  type="text"
                  value={localOfferConfig.banglaTitle || ''}
                  onChange={(e) =>
                    setLocalOfferConfig({ ...localOfferConfig, banglaTitle: e.target.value })
                  }
                  placeholder="যেমন: বিশেষ মেগা উৎসব ছাড়!"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-serif font-bold text-stone-900 focus:bg-white focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">সাবটাইটেল বা অফার বিবরণ</label>
                <input
                  type="text"
                  value={localOfferConfig.subtitle || ''}
                  onChange={(e) =>
                    setLocalOfferConfig({ ...localOfferConfig, subtitle: e.target.value })
                  }
                  placeholder="যেমন: উৎসবের আনন্দ ছড়িয়ে দিতে প্রতিটি ক্যাটাগরিতে নিয়মিত ঘূর্ণায়মান মেগা ছাড়"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:bg-white focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Countdown Timer Configuration */}
              <div className="md:col-span-2 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700" />
                      লাইভ কাউন্টডাউন টাইমার সমাপ্তির তারিখ ও সময়
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      ওয়েবসাইটে এই সময় অনুযায়ী লাইভ দিন, ঘণ্টা, মিনিট ও সেকেন্ড গণনা করা হবে
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={localOfferConfig.showCountdown !== false}
                      onChange={(e) =>
                        setLocalOfferConfig({ ...localOfferConfig, showCountdown: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">হোম পেজে টাইমার দেখান</span>
                  </label>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1.5">
                    কুইক প্রিসেট (আজ থেকে কতদিন টাইমার চলবে):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: '+১ দিন (২৪ ঘণ্টা)', days: 1 },
                      { label: '+২ দিন (৪৮ ঘণ্টা)', days: 2 },
                      { label: '+৩ দিন (৭২ ঘণ্টা)', days: 3 },
                      { label: '+৭ দিন (১ সপ্তাহ)', days: 7 },
                      { label: '+১৫ দিন (অর্ধেক মাস)', days: 15 },
                      { label: '+৩০ দিন (১ মাস)', days: 30 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => {
                          const target = new Date(Date.now() + preset.days * 86400000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          const isoStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T23:59:59`;
                          setLocalOfferConfig((prev) => ({ ...prev, endDate: isoStr }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      তারিখ ও সময় সিলেক্টর (Calendar & Clock):
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        localOfferConfig.endDate && !isNaN(new Date(localOfferConfig.endDate).getTime())
                          ? new Date(localOfferConfig.endDate).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const d = new Date(e.target.value);
                          setLocalOfferConfig({ ...localOfferConfig, endDate: d.toISOString() });
                        }
                      }}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-900 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      বর্তমান সমাপ্তি তারিখ মান (ISO বা টেক্সট):
                    </label>
                    <input
                      type="text"
                      value={localOfferConfig.endDate || ''}
                      onChange={(e) =>
                        setLocalOfferConfig({ ...localOfferConfig, endDate: e.target.value })
                      }
                      placeholder="2026-10-31T23:59:59 বা 3 days"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Box: Mega Festive Offer 5-Sec Rotating Slides Management */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                    বিশেষ মেগা উৎসব ছাড়! (৫ সেকেন্ড পর পর ঘূর্ণায়মান অফার স্লাইডার)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    {localOffers.length} টি স্লাইড সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  হোম পেজে প্রদর্শিত প্রতিটি ক্যাটাগরির মেগা উৎসব অফার, হেডলাইন ও কুপন কোড এখান থেকে এডিট করুন
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newOfferItem: CategoryOfferItem = {
                      id: `off-${Date.now()}`,
                      categoryName: 'নতুন ক্যাটাগরি',
                      categorySlug: 'all',
                      offerBadge: 'বিশেষ উৎসব ছাড়',
                      headline: 'আকর্ষণীয় নতুন পোশাক কালেকশন অফার',
                      discountSummary: 'সীমিত সময়ের জন্য বিশেষ ছাড় ও ফ্রি ডেলিভারি অফার',
                      couponCode: 'FESTIVE10',
                      minAmount: 1000,
                    };
                    const updated = [...localOffers, newOfferItem];
                    setLocalOffers(updated);
                  }}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন অফার স্লাইড যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllFestiveOffers}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সকল মেগা অফার সেভ করুন</span>
                </button>
              </div>
            </div>

            {/* List of Offers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {localOffers.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-3.5 relative hover:border-amber-400 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-stone-900 text-white">
                        স্লাইড #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-amber-800">
                        {item.categoryName || 'ক্যাটাগরি'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localOffers.filter((_, i) => i !== idx);
                        setLocalOffers(updated);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="স্লাইড মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick category preset chips */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                      কুইক ক্যাটাগরি প্রিসেট:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'তাঁতের লুঙ্গি কালেকশন', slug: 'lungi', badge: '২৫% স্পেশাল ছাড়', headline: 'প্রিমিয়াম সুতি ও আরামদায়ক লুঙ্গিতে বিশাল ছাড়', coupon: 'LUNGI25', min: 1200 },
                        { name: 'আভিজাত্যের পাঞ্জাবি', slug: 'panjabi', badge: '২০% উৎসব ছাড়', headline: 'উৎসবে আভিজাত্য প্রকাশে ক্লাসিক ও সেমি-লং পাঞ্জাবি', coupon: 'FESTIVE20', min: 1500 },
                        { name: 'ঐতিহ্যবাহী তাঁতের শাড়ি', slug: 'saree', badge: '৩০% মেগা ছাড়', headline: 'খাঁটি তাঁতের সুতি ও জামদানি শাড়িতে অবিশ্বাস্য অফার', coupon: 'SAREE30', min: 2000 },
                        { name: 'প্রিমিয়াম ক্যাজুয়াল টি-শার্ট', slug: 't-shirt', badge: '১৫% কম্বো অফার', headline: '১০০% কম্বড কটন টি-শার্ট ও পোলোতে এক্সক্লুসিভ সেভিংস', coupon: 'TSHIRT15', min: 1000 },
                        { name: 'এক্সক্লুসিভ থ্রি-পিস', slug: 'three-piece', badge: '১৮% স্পেশাল অফার', headline: 'সুতি ও জর্জেট এক্সক্লুসিভ থ্রি-পিসে উৎসবের বিশেষ ছাড়', coupon: 'THREE18', min: 2200 },
                      ].map((preset) => (
                        <button
                          key={preset.slug}
                          type="button"
                          onClick={() => {
                            const updated = [...localOffers];
                            updated[idx] = {
                              ...updated[idx],
                              categoryName: preset.name,
                              categorySlug: preset.slug,
                              offerBadge: preset.badge,
                              headline: preset.headline,
                              couponCode: preset.coupon,
                              minAmount: preset.min,
                            };
                            setLocalOffers(updated);
                          }}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {preset.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        ক্যাটাগরির নাম
                      </label>
                      <input
                        type="text"
                        value={item.categoryName}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], categoryName: e.target.value };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-bold text-stone-900 text-xs focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        ক্যাটাগরি Slug (URL)
                      </label>
                      <input
                        type="text"
                        value={item.categorySlug}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], categorySlug: e.target.value };
                          setLocalOffers(updated);
                        }}
                        placeholder="lungi, saree, panjabi..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-mono text-xs text-stone-800 focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        অফার ব্যাজ (যেমন: ফ্ল্যাট ২৫% ছাড়)
                      </label>
                      <input
                        type="text"
                        value={item.offerBadge}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], offerBadge: e.target.value };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-bold text-amber-800 text-xs focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        প্রধান আকর্ষণীয় হেডলাইন
                      </label>
                      <input
                        type="text"
                        value={item.headline}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], headline: e.target.value };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-bold text-stone-900 text-xs focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        ছাড়ের বিস্তারিত বিবরণ
                      </label>
                      <textarea
                        rows={2}
                        value={item.discountSummary}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], discountSummary: e.target.value };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 text-xs text-stone-800 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        কুপন কোড
                      </label>
                      <input
                        type="text"
                        value={item.couponCode}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], couponCode: e.target.value.toUpperCase() };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-mono uppercase font-bold text-amber-700 text-xs focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        সর্বনিম্ন অর্ডার (৳)
                      </label>
                      <input
                        type="number"
                        value={item.minAmount}
                        onChange={(e) => {
                          const updated = [...localOffers];
                          updated[idx] = { ...updated[idx], minAmount: Number(e.target.value) };
                          setLocalOffers(updated);
                        }}
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-2 font-mono text-xs text-stone-900 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Unified Save bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                সেভ বাটনে ক্লিক করলে মেগা উৎসবের টাইমার এবং সকল স্লাইড হোম পেজে তাৎক্ষণিকভাবে প্রদর্শিত হবে
              </span>

              <button
                type="button"
                onClick={handleSaveAllFestiveOffers}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>সকল মেগা উৎসব অফার ও টাইমার সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Category Specific & Unified Banners Panel */}
      {activeSubTab === 'cat_banners' && (
        <div className="space-y-4">
          {/* Top Unified Switcher: Category Banners vs Home Hero Banners */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  ক্যাটাগরি ও হোম পেজ ব্যানার ম্যানেজমেন্ট
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  স্বয়ংক্রিয় সিঙ্ক
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ক্যাটাগরি ম্যানেজমেন্ট থেকে যুক্ত হওয়া সকল ক্যাটাগরির জন্য ব্যানার এবং হোম পেজ হিরো ব্যানার এক জায়গা থেকে নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCatBannerView('categories')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catBannerView === 'categories'
                    ? 'bg-[#8C2D19] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                📂 ক্যাটাগরি ব্যানারসমূহ ({localCatBanners.length}টি)
              </button>

              <button
                type="button"
                onClick={() => setCatBannerView('home')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  catBannerView === 'home'
                    ? 'bg-[#8C2D19] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                🏠 হোম পেজ হিরো ব্যানার ({heroBanners.length}টি)
              </button>
            </div>
          </div>

          {/* VIEW 1: CATEGORY BANNERS */}
          {catBannerView === 'categories' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={catBannerSearch}
                      onChange={(e) => setCatBannerSearch(e.target.value)}
                      placeholder="ক্যাটাগরি ব্যানার খুঁজুন..."
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white focus:border-[#8C2D19]"
                    />
                    <span className="absolute left-2.5 top-2 text-stone-400">🔍</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const firstCat = categories[0]?.slug || 'men';
                      setEditingCatBanner({
                        categorySlug: firstCat,
                        banglaTitle: '',
                        title: '',
                        description: '',
                        desktopImage: '',
                        isActive: true,
                      });
                    }}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ নতুন ব্যানার যোগ করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCatBanners}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>সকল ব্যানার সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localCatBanners
                  .filter((b) => {
                    if (!catBannerSearch.trim()) return true;
                    const q = catBannerSearch.toLowerCase().trim();
                    return (
                      b.categorySlug?.toLowerCase().includes(q) ||
                      b.banglaTitle?.toLowerCase().includes(q) ||
                      b.title?.toLowerCase().includes(q)
                    );
                  })
                  .map((catBan, idx) => {
                    const matchedCategory = categories.find(
                      (c) => c.slug?.toLowerCase() === catBan.categorySlug?.toLowerCase()
                    );

                    return (
                      <div
                        key={catBan.id || idx}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs uppercase text-amber-800">
                              ক্যাটাগরি: {catBan.categorySlug}
                            </span>
                            {matchedCategory && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                                {matchedCategory.isMain ? 'মূল ক্যাটাগরি' : 'সাব-ক্যাটাগরি'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingCatBanner(catBan)}
                              className="text-stone-500 hover:text-[#8C2D19] flex items-center gap-1 text-[11px] font-semibold"
                              title="সম্পূর্ণ মডালে এডিট করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>এডিট</span>
                            </button>

                            <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={catBan.isActive}
                                onChange={(e) => {
                                  const updated = [...localCatBanners];
                                  updated[idx] = { ...updated[idx], isActive: e.target.checked };
                                  setLocalCatBanners(updated);
                                }}
                                className="w-3 h-3 text-emerald-600 rounded"
                              />
                              <span>সক্রিয়</span>
                            </label>
                          </div>
                        </div>

                        <div className="aspect-16/7 relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                          <img
                            src={catBan.desktopImage || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=800'}
                            alt={catBan.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">বাংলা শিরোনাম:</label>
                            <input
                              type="text"
                              value={catBan.banglaTitle}
                              onChange={(e) => {
                                const updated = [...localCatBanners];
                                updated[idx] = { ...updated[idx], banglaTitle: e.target.value };
                                setLocalCatBanners(updated);
                              }}
                              className="w-full font-bold bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">বিবরণ:</label>
                            <input
                              type="text"
                              value={catBan.description}
                              onChange={(e) => {
                                const updated = [...localCatBanners];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setLocalCatBanners(updated);
                              }}
                              className="w-full text-stone-700 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:bg-white focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 mb-0.5">ব্যানার ছবি (Upload বা URL):</label>
                            <div className="flex items-center gap-2">
                              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>ছবি আপলোড</span>
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
                                        const updated = [...localCatBanners];
                                        updated[idx] = { ...updated[idx], desktopImage: dataUrl };
                                        setLocalCatBanners(updated);
                                        showToast('ক্যাটাগরি ব্যানার ছবি লোড হয়েছে!');
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <input
                                type="text"
                                value={catBan.desktopImage}
                                onChange={(e) => {
                                  const updated = [...localCatBanners];
                                  updated[idx] = { ...updated[idx], desktopImage: e.target.value };
                                  setLocalCatBanners(updated);
                                }}
                                placeholder="https://..."
                                className="flex-1 font-mono text-stone-500 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-[10px] focus:bg-white focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Save Bar */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">
                  ক্যাটাগরি ব্যানারের সকল পরিবর্তন স্থায়ীভাবে সংরক্ষণ করতে বাটনে ক্লিক করুন
                </span>
                <button
                  type="button"
                  onClick={handleSaveCatBanners}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>সকল ক্যাটাগরি ব্যানার সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: HOMEPAGE HERO BANNERS */}
          {catBannerView === 'home' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">হোম পেজ হিরো স্লাইডার ব্যানারসমূহ</h4>
                  <p className="text-[11px] text-stone-500">হোম পেজের প্রধান স্লাইডার ব্যানারগুলো এখান থেকে ম্যানেজ করুন।</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingHero({
                      title: 'NEW HERO BANNER',
                      banglaTitle: 'নতুন কালেকশন',
                      subtitle: '',
                      buttonText: 'কালেকশন দেখুন',
                      buttonUrl: '/category/all',
                      desktopImage: '',
                      order: heroBanners.length + 1,
                      isActive: true,
                    })
                  }
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ নতুন হিরো ব্যানার যোগ করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBanners.map((hero) => (
                  <div key={hero.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-bold text-xs text-stone-900">
                        {hero.banglaTitle || hero.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingHero(hero)}
                          className="text-[#8C2D19] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHeroBanner(hero.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="aspect-16/7 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                      <img src={hero.desktopImage} alt={hero.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      <p><span className="font-bold">বাটন:</span> {hero.buttonText} ({hero.buttonUrl})</p>
                      <p><span className="font-bold">স্ট্যাটাস:</span> {hero.isActive !== false ? '✓ সক্রিয়' : '✕ নিষ্ক্রিয়'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hero Banner Add/Edit Modal */}
      {editingHero && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-stone-200">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/60">
              <h3 className="font-bold text-base text-stone-900">Hero Slider ব্যানার সম্পাদনা</h3>
              <button
                type="button"
                onClick={() => setEditingHero(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form id="hero-banner-form" onSubmit={handleSaveHero} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">বাংলা টাইটেল</label>
                <input
                  type="text"
                  required
                  value={editingHero.banglaTitle || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, banglaTitle: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">সাবটাইটেল</label>
                <input
                  type="text"
                  value={editingHero.subtitle || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-700">ব্যানার ছবি (Desktop Image)</label>
                  {editingHero.desktopImage && (
                    <span className="text-[10px] text-emerald-600 font-semibold">ছবি সংযুক্ত হয়েছে</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>গ্যালারি/ডিভাইস থেকে ছবি আপলোড</span>
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
                            setEditingHero({ ...editingHero, desktopImage: dataUrl });
                            showToast('ব্যানার ছবি সফলভাবে আপলোড হয়েছে!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <span className="text-stone-400 text-xs">অথবা সরাসরি লিঙ্ক দিন:</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={editingHero.desktopImage || ''}
                  onChange={(e) => setEditingHero({ ...editingHero, desktopImage: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs"
                />

                {editingHero.desktopImage && (
                  <div className="aspect-16/7 relative rounded-xl overflow-hidden border border-stone-200 mt-2 bg-stone-100">
                    <img
                      src={editingHero.desktopImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={editingHero.buttonText || ''}
                    onChange={(e) => setEditingHero({ ...editingHero, buttonText: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">বাটন লিংক</label>
                  <input
                    type="text"
                    value={editingHero.buttonUrl || ''}
                    onChange={(e) => setEditingHero({ ...editingHero, buttonUrl: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-stone-700 block uppercase">
                  ব্যানার বাটন কনফিগারেশন:
                </span>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingHero.showMenButton !== false}
                      onChange={(e) => setEditingHero({ ...editingHero, showMenButton: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-bold text-xs text-blue-900">Shop for men বাটন সক্রিয় রাখুন</span>
                  </label>
                  {editingHero.showMenButton !== false && (
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      <input
                        type="text"
                        placeholder="বাটন টেক্সট (Shop for men)"
                        value={editingHero.menButtonText || ''}
                        onChange={(e) => setEditingHero({ ...editingHero, menButtonText: e.target.value })}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="বাটন লিংক (/category/men)"
                        value={editingHero.menButtonUrl || ''}
                        onChange={(e) => setEditingHero({ ...editingHero, menButtonUrl: e.target.value })}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-stone-200 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingHero.showWomenButton !== false}
                      onChange={(e) => setEditingHero({ ...editingHero, showWomenButton: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="font-bold text-xs text-rose-900">Shop for women বাটন সক্রিয় রাখুন</span>
                  </label>
                  {editingHero.showWomenButton !== false && (
                    <div className="grid grid-cols-2 gap-2 pl-6">
                      <input
                        type="text"
                        placeholder="বাটন টেক্সট (Shop for women)"
                        value={editingHero.womenButtonText || ''}
                        onChange={(e) => setEditingHero({ ...editingHero, womenButtonText: e.target.value })}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="বাটন লিংক (/category/women)"
                        value={editingHero.womenButtonUrl || ''}
                        onChange={(e) => setEditingHero({ ...editingHero, womenButtonUrl: e.target.value })}
                        className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200 p-2.5 rounded-xl hover:bg-stone-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingHero.isActive !== false}
                    onChange={(e) => setEditingHero({ ...editingHero, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-xs text-stone-800">হোম পেজ স্লাইডারে ব্যানারটি সক্রিয় (Active) রাখুন</span>
                </label>
              </div>

            </form>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0 sticky bottom-0">
              <button
                type="button"
                onClick={() => setEditingHero(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="submit"
                form="hero-banner-form"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer text-xs shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Banner Add/Edit Modal (Men / Women / Category) */}
      {editingCatBanner && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-stone-200">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/60">
              <h3 className="font-bold text-base text-stone-900">
                {editingCatBanner.id ? 'ক্যাটাগরি ব্যানার সম্পাদনা' : 'নতুন ক্যাটাগরি ব্যানার তৈরি'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCatBanner(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form id="category-banner-form" onSubmit={handleSaveCatBanner} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">ক্যাটাগরি গ্রুপ / স্লাগ নির্বাচন করুন</label>
                <select
                  value={editingCatBanner.categorySlug || (categories[0]?.slug || 'men')}
                  onChange={(e) => {
                    const selSlug = e.target.value;
                    const matchedCat = categories.find((c) => c.slug.toLowerCase() === selSlug.toLowerCase());
                    setEditingCatBanner({
                      ...editingCatBanner,
                      categorySlug: selSlug,
                      banglaTitle: editingCatBanner.banglaTitle || (matchedCat ? `${matchedCat.banglaName} কালেকশন ব্যানার` : ''),
                      title: editingCatBanner.title || (matchedCat ? `${matchedCat.name} Collection Banner` : ''),
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {c.banglaName} ({c.name} - /category/{c.slug}) {c.isMain ? '[মূল ক্যাটাগরি]' : '[সাব-ক্যাটাগরি]'}
                    </option>
                  ))}
                  {/* Fallback standard categories if not in list */}
                  {!categories.some((c) => c.slug === 'men') && <option value="men">Men (/category/men)</option>}
                  {!categories.some((c) => c.slug === 'women') && <option value="women">Women (/category/women)</option>}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">বাংলা শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={editingCatBanner.banglaTitle || ''}
                  onChange={(e) => setEditingCatBanner({ ...editingCatBanner, banglaTitle: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  placeholder="যেমন: পুরুষের আভিজাত্য ও ঐতিহ্যের সেরা সমাহার"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ইংলিশ টাইটেল</label>
                <input
                  type="text"
                  value={editingCatBanner.title || ''}
                  onChange={(e) => setEditingCatBanner({ ...editingCatBanner, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  placeholder="Men Collection Banner"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  value={editingCatBanner.description || ''}
                  onChange={(e) => setEditingCatBanner({ ...editingCatBanner, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                  placeholder="ব্যানারের সংক্ষিপ্ত বিবরণ লিখুন..."
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-stone-700">ব্যানার ছবি (Desktop Image URL বা Upload)</label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>আপলোড</span>
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
                            setEditingCatBanner({ ...editingCatBanner, desktopImage: dataUrl });
                            showToast('ব্যানার ছবি আপলোড হয়েছে!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={editingCatBanner.desktopImage || ''}
                    onChange={(e) => setEditingCatBanner({ ...editingCatBanner, desktopImage: e.target.value })}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs"
                  />
                </div>
                {editingCatBanner.desktopImage && (
                  <div className="aspect-16/7 rounded-xl overflow-hidden border border-stone-200 mt-2 bg-stone-100">
                    <img src={editingCatBanner.desktopImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200 p-2.5 rounded-xl hover:bg-stone-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingCatBanner.isActive !== false}
                    onChange={(e) => setEditingCatBanner({ ...editingCatBanner, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-xs text-stone-800">ব্যানারটি পেজে সক্রিয় (Active) রাখুন</span>
                </label>
              </div>
            </form>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2 shrink-0 sticky bottom-0">
              <button
                type="button"
                onClick={() => setEditingCatBanner(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="submit"
                form="category-banner-form"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer text-xs shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900">ক্যাটাগরি তথ্য</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">ক্যাটাগরি নাম (English)</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">বাংলা নাম</label>
                <input
                  type="text"
                  value={editingCategory.banglaName || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, banglaName: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Parent Group</label>
                <select
                  value={editingCategory.parentCategory || 'MEN'}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      parentCategory: e.target.value as any,
                    })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2"
                >
                  <option value="MEN">MEN</option>
                  <option value="WOMEN">WOMEN</option>
                  <option value="OTHERS">OTHERS</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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
