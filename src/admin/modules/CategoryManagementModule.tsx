import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Category } from '../../types';
import { uploadFileToGallery } from '../../utils/imageUtils';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
  FolderTree,
  FolderPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CategoryManagementModule: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products, showToast } = useShop();

  // Selected Main Category filter: default to 'men'
  const [selectedMainId, setSelectedMainId] = useState<string>('men');
  const [activeSection, setActiveSection] = useState<'tree' | 'circle_gallery'>('tree');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isUploadingCircle, setIsUploadingCircle] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'main' | 'sub'>('sub');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separate active Main Categories vs Subcategories
  const mainCategories = useMemo(() => {
    return categories
      .filter((c) => Boolean(c.isMain))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  // Selected main category object
  const activeMain = useMemo(() => {
    return (
      mainCategories.find(
        (m) =>
          m.id === selectedMainId ||
          m.slug.toLowerCase() === selectedMainId.toLowerCase() ||
          m.name.toLowerCase() === selectedMainId.toLowerCase()
      ) ||
      mainCategories[0] || {
        id: 'cat-main-men',
        name: 'Men',
        banglaName: 'পুরুষ',
        slug: 'men',
        isMain: true,
      }
    );
  }, [mainCategories, selectedMainId]);

  // Subcategories belonging strictly to the selected Main Category
  const subcategoriesOfSelectedMain = useMemo(() => {
    if (!activeMain) return [];
    const parentMatches = [
      activeMain.id,
      activeMain.slug.toLowerCase(),
      activeMain.name.toLowerCase(),
      activeMain.name.toUpperCase(),
    ];

    return categories
      .filter((c) => {
        if (c.isMain || c.isArchived) return false;
        const p = (c.parentCategory || '').trim();
        return parentMatches.includes(p) || parentMatches.includes(p.toLowerCase());
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.banglaName?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.circleGalleryOrder || a.order || 0) - (b.circleGalleryOrder || b.order || 0));
  }, [categories, activeMain, searchQuery]);

  // Product counts per category/subcategory
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const keys = [p.subCategory, p.categoryId, p.slug];
      keys.forEach((k) => {
        if (k) map[k.toLowerCase()] = (map[k.toLowerCase()] || 0) + 1;
      });
    });
    return map;
  }, [products]);

  // Open modal to add a Main Category
  const handleOpenAddMain = () => {
    setModalMode('main');
    setEditingCategory({
      name: '',
      banglaName: '',
      slug: '',
      isMain: true,
      parentCategory: 'ROOT',
      image: '',
      banner: '',
      order: mainCategories.length + 1,
      isActive: true,
      description: '',
    });
    setIsModalOpen(true);
  };

  // Open modal to add a Subcategory under selected Main Category
  const handleOpenAddSub = (parentSlug?: string) => {
    setModalMode('sub');
    const targetParent = parentSlug || activeMain?.slug || 'men';
    setEditingCategory({
      name: '',
      banglaName: '',
      slug: '',
      isMain: false,
      parentCategory: targetParent,
      image: '',
      circleImage: '',
      banner: '',
      showInCircleGallery: true,
      circleGalleryOrder: subcategoriesOfSelectedMain.length + 1,
      order: subcategoriesOfSelectedMain.length + 1,
      isActive: true,
      description: '',
      seoTitle: '',
      seoDescription: '',
    });
    setIsModalOpen(true);
  };

  // Open modal to edit existing category/subcategory
  const handleOpenEdit = (cat: Category) => {
    setModalMode(cat.isMain ? 'main' : 'sub');
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  // Auto-generate slug on English name change
  const handleNameChange = (name: string) => {
    if (!editingCategory) return;
    const cleanSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setEditingCategory((prev) => ({
      ...prev,
      name,
      slug: prev?.slug ? prev.slug : cleanSlug,
    }));
  };

  // Direct Gallery File Upload Handler
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'circleImage' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;

    if (field === 'circleImage') setIsUploadingCircle(true);
    else setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadFileToGallery(file);
      setEditingCategory((prev) => ({
        ...prev,
        [field]: uploadedUrl,
        // If main image was set and circleImage is empty, auto-sync
        ...(field === 'image' && !prev?.circleImage ? { circleImage: uploadedUrl } : {}),
      }));
      showToast('ছবি সফলভাবে আপলোড হয়েছে!');
    } catch {
      showToast('ছবি আপলোডে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploadingImage(false);
      setIsUploadingCircle(false);
    }
  };

  // Save Category / Subcategory
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const name = (editingCategory.name || '').trim();
    const banglaName = (editingCategory.banglaName || '').trim();

    if (!name || !banglaName) {
      showToast('ইংরেজি ও বাংলা নাম উভয়ই আবশ্যক!');
      return;
    }

    const finalSlug = (
      editingCategory.slug ||
      name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
    )
      .trim()
      .toLowerCase();

    setIsSubmitting(true);
    try {
      if (editingCategory.id) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          ...editingCategory,
          name,
          banglaName,
          slug: finalSlug,
          isMain: modalMode === 'main',
          parentCategory: modalMode === 'main' ? 'ROOT' : (editingCategory.parentCategory || activeMain.slug),
          circleGalleryOrder: Number(editingCategory.circleGalleryOrder || editingCategory.order || 1),
          order: Number(editingCategory.order || 1),
          isActive: editingCategory.isActive !== false,
        });
        showToast(`"${banglaName}" সফলভাবে হালনাগাদ করা হয়েছে`);
      } else {
        // Create new category
        const newId = modalMode === 'main' ? `cat-main-${finalSlug}` : `cat-sub-${Date.now()}`;
        await addCategory({
          id: newId,
          name,
          banglaName,
          slug: finalSlug,
          isMain: modalMode === 'main',
          parentCategory: modalMode === 'main' ? 'ROOT' : (editingCategory.parentCategory || activeMain.slug),
          image: editingCategory.image || editingCategory.circleImage || '',
          circleImage: editingCategory.circleImage || editingCategory.image || '',
          banner: editingCategory.banner || '',
          showInCircleGallery: editingCategory.showInCircleGallery !== false,
          circleGalleryOrder: Number(editingCategory.circleGalleryOrder || editingCategory.order || 1),
          order: Number(editingCategory.order || 1),
          isActive: editingCategory.isActive !== false,
          description: editingCategory.description || '',
          seoTitle: editingCategory.seoTitle || '',
          seoDescription: editingCategory.seoDescription || '',
        });
        showToast(`"${banglaName}" সফলভাবে তৈরি হয়েছে`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Category save error:', err);
      showToast('ক্যাটাগরি সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category / Subcategory
  const handleDelete = async (cat: Category) => {
    const linkedCount = productCountMap[cat.slug.toLowerCase()] || productCountMap[cat.id.toLowerCase()] || 0;
    const confirmMsg =
      linkedCount > 0
        ? `"${cat.banglaName}" ক্যাটাগরির সাথে ${linkedCount}টি পণ্য যুক্ত আছে। এটি ডাটাবেজ থেকে মুছে ফেলার বদলে নিষ্ক্রিয় (Archive) করা হবে। আপনি কি নিশ্চিত?`
        : `আপনি কি নিশ্চিতভাবে "${cat.banglaName}" ক্যাটাগরি মুছে ফেলতে চান?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteCategory(cat.id);
      showToast('ক্যাটাগরি সফলভাবে অপসারিত হয়েছে');
    } catch {
      showToast('ক্যাটাগরি মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
              <FolderTree className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">ক্যাটাগরি ম্যানেজমেন্ট সিস্টেম</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              সক্রিয় কন্ট্রোলার
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            এখান থেকে মূল ক্যাটাগরি (Men, Women, Kids, Others) এবং প্রতিটির জন্য সুনির্দিষ্ট সাব-ক্যাটাগরি ও গ্যালারি ছবি নিয়ন্ত্রণ করুন। এখানে যা কনফিগার করবেন, স্টোরফ্রন্ট ও প্রোডাক্ট পেজে হুবহু তাই প্রদর্শিত হবে।
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleOpenAddMain}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>+ নতুন মূল ক্যাটাগরি</span>
          </button>
          <button
            onClick={() => handleOpenAddSub(activeMain?.slug)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#8C2D19] hover:bg-[#732414] text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন সাব-ক্যাটাগরি</span>
          </button>
        </div>
      </div>

      {/* Subtab Switcher: Categories Tree vs Circular Gallery Controller */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('tree')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'tree'
              ? 'bg-[#8C2D19] text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>১. ক্যাটাগরি ও সাব-ক্যাটাগরি ট্রিসমূহ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('circle_gallery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'circle_gallery'
              ? 'bg-[#8C2D19] text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>২. ⭕ সার্কুলার সাব-ক্যাটাগরি গ্যালারি কন্ট্রোলার</span>
        </button>
      </div>

      {activeSection === 'tree' && (
        <>
          {/* 1. MAIN CATEGORIES TABS / CARDS */}
          <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            ১. মূল ক্যাটাগরি নির্বাচন করুন ({mainCategories.length}টি সক্রিয়)
          </span>
          <span className="text-xs text-stone-400">
            ক্লিক করে নিচের সংশ্লিষ্ট সাব-ক্যাটাগরিগুলো দেখুন
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mainCategories.map((mainCat) => {
            const isSelected =
              activeMain.id === mainCat.id ||
              activeMain.slug.toLowerCase() === mainCat.slug.toLowerCase();

            // Count subcategories under this main category
            const subCount = categories.filter(
              (c) =>
                !c.isMain &&
                !c.isArchived &&
                (c.parentCategory === mainCat.id ||
                  c.parentCategory.toLowerCase() === mainCat.slug.toLowerCase() ||
                  c.parentCategory.toLowerCase() === mainCat.name.toLowerCase())
            ).length;

            return (
              <div
                key={mainCat.id}
                onClick={() => setSelectedMainId(mainCat.slug)}
                className={`relative p-4 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-900/5 border-[#8C2D19] ring-2 ring-[#8C2D19]/20 shadow-md'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {mainCat.image ? (
                      <img
                        src={mainCat.image}
                        alt={mainCat.name}
                        className="w-8 h-8 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
                        {mainCat.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 leading-tight">
                        {mainCat.banglaName}
                      </h3>
                      <p className="text-[11px] font-mono text-stone-500 uppercase">
                        {mainCat.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(mainCat);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                    title="মূল ক্যাটাগরি সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="text-[11px] font-medium text-stone-500">
                    {subCount}টি সাব-ক্যাটাগরি
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8C2D19]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>সিলেক্টেড</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SUBCATEGORIES SECTION FOR THE SELECTED MAIN CATEGORY */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Subcategories Filter & Search Bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-900">
              {activeMain.banglaName} ({activeMain.name}) - এর সাব-ক্যাটাগরি সমূহ
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">
              {subcategoriesOfSelectedMain.length} টি
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সাব-ক্যাটাগরি খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#8C2D19]"
              />
              <span className="absolute left-2.5 top-2 text-stone-400">🔍</span>
            </div>

            <button
              onClick={() => handleOpenAddSub(activeMain.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C2D19] hover:bg-[#732414] text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ সাব-ক্যাটাগরি</span>
            </button>
          </div>
        </div>

        {/* Subcategories Table */}
        <div className="overflow-x-auto">
          {subcategoriesOfSelectedMain.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-700 border border-amber-200">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-800">
                {activeMain.banglaName} ক্যাটাগরিতে কোনো সাব-ক্যাটাগরি নেই
              </p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                উপরের "+ সাব-ক্যাটাগরি" বাটনে ক্লিক করে লুঙ্গি, টি-শার্ট, শাড়ি বা নতুন যেকোনো সাব-ক্যাটাগরি ও গ্যালারি ছবি যুক্ত করুন।
              </p>
              <button
                onClick={() => handleOpenAddSub(activeMain.slug)}
                className="px-4 py-2 bg-[#8C2D19] text-white rounded-xl text-xs font-bold hover:bg-[#732414]"
              >
                + প্রথম সাব-ক্যাটাগরি যোগ করুন
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ছবি (গ্যালারি)</th>
                  <th className="py-3 px-4">সাব-ক্যাটাগরির নাম (বাংলা ও English)</th>
                  <th className="py-3 px-4">স্লাগ / প্রোডাক্ট লিংক</th>
                  <th className="py-3 px-4 text-center">হোমপেজ সার্কেল</th>
                  <th className="py-3 px-4 text-center">ক্রম (Order)</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {subcategoriesOfSelectedMain.map((cat) => {
                  const displayImg = cat.circleImage || cat.image;
                  const pCount =
                    productCountMap[cat.slug.toLowerCase()] ||
                    productCountMap[cat.id.toLowerCase()] ||
                    0;

                  return (
                    <tr key={cat.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Photo / Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 border border-stone-200 shadow-2xs flex items-center justify-center">
                          {displayImg ? (
                            <img
                              src={displayImg}
                              alt={cat.banglaName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </td>

                      {/* Names */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-sm">{cat.banglaName}</div>
                        <div className="text-stone-500 font-mono text-[11px]">{cat.name}</div>
                        <span className="inline-block mt-0.5 text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {pCount} টি পণ্য লিঙ্কড
                        </span>
                      </td>

                      {/* Slug / Link */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          /category/{activeMain.slug}?sub={cat.slug}
                        </span>
                      </td>

                      {/* Homepage Circle */}
                      <td className="py-3 px-4 text-center">
                        {cat.showInCircleGallery !== false ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium text-[10px]">
                            সার্কেলে দৃশ্যমান
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full font-medium text-[10px]">
                            লুকানো
                          </span>
                        )}
                      </td>

                      {/* Order */}
                      <td className="py-3 px-4 text-center font-bold text-stone-700">
                        {cat.circleGalleryOrder || cat.order || 1}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {cat.isActive !== false ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-semibold">
                            সক্রিয়
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-semibold">
                            নিষ্ক্রিয়
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-stone-600 hover:text-[#8C2D19] hover:bg-stone-100 rounded-lg transition"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </>
      )}

      {/* 2. CIRCULAR SUBCATEGORY GALLERY CONTROLLER SECTION */}
      {activeSection === 'circle_gallery' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </span>
                <h3 className="text-base font-bold text-stone-900">
                  হোমপেজ সার্কুলার সাব-ক্যাটাগরি গ্যালারি কন্ট্রোলার
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  লাইভ স্টোরফ্রন্ট কন্ট্রোল
                </span>
              </div>
              <p className="text-xs text-stone-500">
                হোমপেজে স্লাইডারের নিচে &quot;জনপ্রিয় ক্যাটাগরি সমূহ&quot; গোল সার্কেল আইটেমগুলোতে কোন কোন সাব-ক্যাটাগরি দৃশ্যমান থাকবে, তা সক্রিয়/নিষ্ক্রিয় করুন এবং প্রতিটি সাব-ক্যাটাগরির গোল আইকন ছবি ও ক্রম পরিবর্তন করুন।
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                  <th className="py-3 px-4">সার্কেল প্রিভিউ (Live Ring)</th>
                  <th className="py-3 px-4">সাব-ক্যাটাগরির নাম</th>
                  <th className="py-3 px-4">মূল ক্যাটাগরি</th>
                  <th className="py-3 px-4 text-center">সার্কেল ছবি (Upload / URL)</th>
                  <th className="py-3 px-4 text-center">ডিসপ্লে ক্রম</th>
                  <th className="py-3 px-4 text-center">হোমপেজে স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories
                  .filter((c) => !c.isMain && !c.isArchived)
                  .sort((a, b) => (a.circleGalleryOrder || a.order || 0) - (b.circleGalleryOrder || b.order || 0))
                  .map((sub) => {
                    const isVisibleInCircle = sub.showInCircleGallery !== false;
                    const previewImg =
                      sub.circleImage ||
                      sub.image ||
                      'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=200';

                    return (
                      <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                        {/* Live Circular Preview with Gold Ring */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#8B4513] shadow-xs shrink-0">
                              <img
                                src={previewImg}
                                alt={sub.name}
                                className="w-full h-full object-cover rounded-full bg-white"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-stone-900 block text-xs">{sub.banglaName}</span>
                              <span className="text-[10px] text-stone-400 font-mono">/{sub.slug}</span>
                            </div>
                          </div>
                        </td>

                        {/* Name & Slug */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-800">{sub.banglaName}</span>
                          <span className="block text-[11px] text-stone-500 font-mono">{sub.name}</span>
                        </td>

                        {/* Parent Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg font-semibold text-[11px] uppercase">
                            {sub.parentCategory || 'MEN'}
                          </span>
                        </td>

                        {/* Image Controller: Upload & URL */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0">
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
                                      updateCategory(sub.id, { circleImage: dataUrl });
                                      showToast(`"${sub.banglaName}" সার্কেল ছবি আপডেট হয়েছে!`);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            <input
                              type="text"
                              value={sub.circleImage || ''}
                              placeholder="অথবা ইমেজের লিঙ্ক..."
                              onChange={(e) => {
                                updateCategory(sub.id, { circleImage: e.target.value });
                              }}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-mono text-stone-700 focus:bg-white focus:border-amber-500"
                            />
                          </div>
                        </td>

                        {/* Display Order */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={sub.circleGalleryOrder || sub.order || 1}
                            onChange={(e) => {
                              const ord = parseInt(e.target.value, 10) || 1;
                              updateCategory(sub.id, { circleGalleryOrder: ord, order: ord });
                            }}
                            className="w-16 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-center font-bold text-stone-800 text-xs focus:bg-white focus:border-amber-500"
                          />
                        </td>

                        {/* Active / Inactive Toggle Switch */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = !isVisibleInCircle;
                              updateCategory(sub.id, { showInCircleGallery: nextVal });
                              showToast(
                                nextVal
                                  ? `"${sub.banglaName}" হোমপেজ সার্কেলে দৃশ্যমান করা হয়েছে`
                                  : `"${sub.banglaName}" হোমপেজ সার্কেলে লুকানো হয়েছে`
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 mx-auto ${
                              isVisibleInCircle
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                                : 'bg-stone-200 hover:bg-stone-300 text-stone-600'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isVisibleInCircle ? 'bg-white' : 'bg-stone-400'}`} />
                            <span>{isVisibleInCircle ? 'সক্রিয় (Active)' : 'লুকানো (Inactive)'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                  <FolderTree className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    {editingCategory.id
                      ? (modalMode === 'main' ? 'মূল ক্যাটাগরি সম্পাদনা' : 'সাব-ক্যাটাগরি সম্পাদনা')
                      : (modalMode === 'main' ? 'নতুন মূল ক্যাটাগরি তৈরি' : 'নতুন সাব-ক্যাটাগরি তৈরি')}
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    {modalMode === 'main'
                      ? 'একটি নতুন প্রধান প্রোডাক্ট বিভাগ যোগ করুন (যেমন: Men, Women, Kids, ইত্যাদি)'
                      : `"${activeMain.banglaName}"-এর অধীনে নতুন সাব-ক্যাটাগরি যোগ করুন`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Type Switcher (if creating new) */}
              {!editingCategory.id && (
                <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('sub');
                      setEditingCategory((prev) => ({
                        ...prev,
                        isMain: false,
                        parentCategory: activeMain.slug,
                      }));
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                      modalMode === 'sub'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🏷️ সাব-ক্যাটাগরি
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('main');
                      setEditingCategory((prev) => ({
                        ...prev,
                        isMain: true,
                        parentCategory: 'ROOT',
                      }));
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                      modalMode === 'main'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    📁 মূল ক্যাটাগরি (Main Category)
                  </button>
                </div>
              )}

              {/* If Subcategory: Select Parent Main Category */}
              {modalMode === 'sub' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    মূল ক্যাটাগরি (Parent Category) *
                  </label>
                  <select
                    value={editingCategory.parentCategory || activeMain.slug}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, parentCategory: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-xs font-medium focus:ring-1 focus:ring-[#8C2D19]"
                  >
                    {mainCategories.map((m) => (
                      <option key={m.id} value={m.slug}>
                        {m.banglaName} ({m.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Fields: English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    ক্যাটাগরির নাম (English) *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Lungi, Saree, Panjabi"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#8C2D19]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    ক্যাটাগরির নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.banglaName || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, banglaName: e.target.value })
                    }
                    placeholder="যেমন: লুঙ্গি, শাড়ি, পাঞ্জাবি"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#8C2D19]"
                    required
                  />
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  ইউআরএল স্লাগ (URL Slug) *
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  placeholder="lungi, saree, panjabi"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:ring-1 focus:ring-[#8C2D19]"
                  required
                />
              </div>

              {/* DIRECT DEVICE GALLERY IMAGE UPLOAD */}
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-800">
                    📷 গ্যালারি থেকে ছবি আপলোড (Category Image)
                  </label>
                  <span className="text-[11px] text-amber-900">ডিভাইস / ফাইল থেকে সরাসরি</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Image Preview Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-stone-200 shrink-0 flex items-center justify-center shadow-xs relative">
                    {editingCategory.circleImage || editingCategory.image ? (
                      <>
                        <img
                          src={editingCategory.circleImage || editingCategory.image}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingCategory((prev) => ({ ...prev, image: '', circleImage: '' }))
                          }
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                          title="মুছুন"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1 space-y-1.5">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl cursor-pointer text-xs font-bold text-stone-800 transition shadow-2xs">
                      <Upload className="w-4 h-4 text-[#8C2D19]" />
                      <span>{isUploadingImage ? 'আপলোড হচ্ছে...' : 'ডিভাইস / গ্যালারি থেকে ছবি বাছুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'circleImage')}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>

                    {/* Or URL input */}
                    <input
                      type="text"
                      value={editingCategory.circleImage || editingCategory.image || ''}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          image: e.target.value,
                          circleImage: e.target.value,
                        }))
                      }
                      placeholder="অথবা ছবির URL দিন (https://...)"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Order and Visibility Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ক্রম / অর্ডার</label>
                  <input
                    type="number"
                    value={editingCategory.circleGalleryOrder || editingCategory.order || 1}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        circleGalleryOrder: Number(e.target.value),
                        order: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs bg-white"
                    min={1}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="showInCircleToggle"
                    checked={editingCategory.showInCircleGallery !== false}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        showInCircleGallery: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-[#8C2D19] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="showInCircleToggle"
                    className="font-semibold text-stone-700 cursor-pointer text-xs"
                  >
                    হোমপেজ সার্কেলে দেখান
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="catActiveToggle"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-[#8C2D19] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="catActiveToggle"
                    className="font-semibold text-stone-700 cursor-pointer text-xs"
                  >
                    সক্রিয় রাখুন
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#8C2D19] hover:bg-[#732414] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
