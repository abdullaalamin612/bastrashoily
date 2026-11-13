import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import { SizeChartDoc, SizeChartDesignSettings } from '../../types';
import { uploadFileToGallery } from '../../utils/imageUtils';
import {
  Ruler,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Upload,
  X,
  Sparkles,
  Check,
  FolderTree,
  Sliders,
  Layers,
} from 'lucide-react';

interface TableColumn {
  id: string;
  label: string;
}

interface TableRow {
  id: string;
  size: string;
  [colId: string]: string;
}

const DEFAULT_COLUMNS: TableColumn[] = [
  { id: 'chest', label: 'বুকের মাপ (Chest)' },
  { id: 'length', label: 'লম্বা (Length)' },
  { id: 'shoulder', label: 'কাঁধ (Shoulder)' },
  { id: 'sleeve', label: 'হাতা (Sleeve)' },
];

const DEFAULT_ROWS: TableRow[] = [
  { id: 'r-1', size: '38 (S)', chest: '38-40"', length: '40"', shoulder: '17.5"', sleeve: '24"' },
  { id: 'r-2', size: '40 (M)', chest: '40-42"', length: '42"', shoulder: '18"', sleeve: '24.5"' },
  { id: 'r-3', size: '42 (L)', chest: '42-44"', length: '44"', shoulder: '18.5"', sleeve: '25"' },
  { id: 'r-4', size: '44 (XL)', chest: '44-46"', length: '45"', shoulder: '19"', sleeve: '25.5"' },
  { id: 'r-5', size: '46 (XXL)', chest: '46-48"', length: '46"', shoulder: '19.5"', sleeve: '26"' },
];

export const SizeChartManagementModule: React.FC = () => {
  const { categories, showToast, refreshSizeCharts } = useShop();

  const [charts, setCharts] = useState<SizeChartDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Active Main Categories from Category Management
  const mainCategories = useMemo(() => {
    return categories
      .filter((c) => Boolean(c.isMain))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  // Selected Main Category (default 'men')
  const [selectedMainSlug, setSelectedMainSlug] = useState<string>('men');

  const activeMain = useMemo(() => {
    return (
      mainCategories.find(
        (m) =>
          m.slug.toLowerCase() === selectedMainSlug.toLowerCase() ||
          m.id === selectedMainSlug ||
          m.name.toLowerCase() === selectedMainSlug.toLowerCase()
      ) ||
      mainCategories[0] || {
        id: 'cat-main-men',
        name: 'Men',
        banglaName: 'পুরুষ',
        slug: 'men',
        isMain: true,
      }
    );
  }, [mainCategories, selectedMainSlug]);

  // Subcategories of selected main category
  const availableSubcategories = useMemo(() => {
    if (!activeMain) return [];
    const parentMatches = [
      activeMain.id,
      activeMain.slug.toLowerCase(),
      activeMain.name.toLowerCase(),
      activeMain.name.toUpperCase(),
    ];

    if (
      activeMain.slug?.toLowerCase() === 'others' ||
      activeMain.name?.toUpperCase() === 'OTHERS' ||
      activeMain.name?.toUpperCase().includes('OTHER')
    ) {
      parentMatches.push(
        'OTHERS & ACCESSORIES',
        'others & accessories',
        'OTHER',
        'other',
        'ACCESSORIES',
        'accessories'
      );
    }

    return categories
      .filter((c) => {
        if (c.isMain || c.isArchived) return false;
        const p = (c.parentCategory || '').trim();
        return (
          parentMatches.includes(p) ||
          parentMatches.includes(p.toLowerCase()) ||
          (activeMain.id && c.parentCategoryId === activeMain.id)
        );
      })
      .sort((a, b) => (a.circleGalleryOrder || a.order || 0) - (b.circleGalleryOrder || b.order || 0));
  }, [categories, activeMain]);

  // Selected Subcategory (default first subcategory)
  const [selectedSubSlug, setSelectedSubSlug] = useState<string>('');

  useEffect(() => {
    if (availableSubcategories.length > 0) {
      // Keep existing selection if still available, else default to first
      const exists = availableSubcategories.some((s) => s.slug === selectedSubSlug);
      if (!exists) {
        setSelectedSubSlug(availableSubcategories[0].slug);
      }
    } else {
      setSelectedSubSlug('');
    }
  }, [availableSubcategories, selectedSubSlug]);

  // Active subcategory object
  const activeSub = useMemo(() => {
    return (
      availableSubcategories.find((s) => s.slug === selectedSubSlug) ||
      availableSubcategories[0] ||
      null
    );
  }, [availableSubcategories, selectedSubSlug]);

  // Form State for Active Subcategory
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [showImage, setShowImage] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [columns, setColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<TableRow[]>(DEFAULT_ROWS);
  const [unit, setUnit] = useState<'inch' | 'cm'>('inch');
  const [notes, setNotes] = useState<string>('সব মাপ ইঞ্চিতে উল্লেখ করা হলো। কাপড় সেলাই অনুযায়ী সামান্য (+- ০.৫") তারতম্য হতে পারে।');

  // Available Sizes for PDP Customer Selection & Product Upload Wizard
  const [availableSizes, setAvailableSizes] = useState<string[]>(['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)']);
  const [customSizeInput, setCustomSizeInput] = useState<string>('');

  // Fetch all charts from server
  const fetchCharts = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/size-charts');
      const data = await res.json().catch(() => ({}));
      if (data && data.charts) {
        setCharts(data.charts);
      }
    } catch {
      showToast('সাইজ চার্ট ডাটা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  // When selectedSubSlug changes, load its configured chart or presets
  useEffect(() => {
    if (!selectedSubSlug) return;

    const existing = charts.find(
      (c) =>
        (c.subCategory || '').toLowerCase() === selectedSubSlug.toLowerCase() ||
        (c.categorySlug || '').toLowerCase() === selectedSubSlug.toLowerCase()
    );

    if (existing) {
      setActiveChartId(existing.id);
      setShowTable(existing.showTable !== false);
      setShowImage(existing.showImage !== false && Boolean(existing.imageUrl));
      setImageUrl(existing.imageUrl || '');
      setUnit(existing.unit || 'inch');
      setNotes(existing.notes || '');

      // Parse measurements
      if (existing.measurementsJson) {
        try {
          const parsed = typeof existing.measurementsJson === 'string'
            ? JSON.parse(existing.measurementsJson)
            : existing.measurementsJson;
          if (parsed.columns && parsed.rows) {
            setColumns(parsed.columns);
            setRows(parsed.rows);
          }
        } catch {}
      }

      // Parse available sizes
      if (existing.availableSizesJson) {
        try {
          const sizes = typeof existing.availableSizesJson === 'string'
            ? JSON.parse(existing.availableSizesJson)
            : existing.availableSizesJson;
          if (Array.isArray(sizes) && sizes.length > 0) {
            setAvailableSizes(sizes);
          }
        } catch {}
      }
    } else {
      // Auto presets depending on subcategory slug
      setActiveChartId(null);
      const s = selectedSubSlug.toLowerCase();
      if (s.includes('lungi')) {
        setAvailableSizes(['ফ্রি সাইজ (Free Size)', '২.৫ হাত', '৩ হাত']);
        setShowTable(true);
        setShowImage(false);
        setImageUrl('');
        setColumns([
          { id: 'length', label: 'লম্বা (Length)' },
          { id: 'width', label: 'ঘের / বহর (Width)' },
        ]);
        setRows([
          { id: 'r-1', size: '২.৫ হাত (স্ট্যান্ডার্ড)', length: '৪৮ ইঞ্চি', width: '৮২ ইঞ্চি' },
          { id: 'r-2', size: '৩ হাত (লম্বা)', length: '৫২ ইঞ্চি', width: '৯২ ইঞ্চি' },
          { id: 'r-3', size: 'Free Size', length: '৪৮ ইঞ্চি', width: '৮৮ ইঞ্চি' },
        ]);
      } else if (s.includes('saree') || s.includes('shari')) {
        setAvailableSizes(['স্ট্যান্ডার্ড সাইজ (১২ হাত)', 'রানিং ব্লাউজ পিস সহ (১২.৫ হাত)', 'Free Size']);
        setShowTable(true);
        setShowImage(false);
        setImageUrl('');
        setColumns([
          { id: 'length', label: 'দৈর্ঘ্য (Length)' },
          { id: 'blouse', label: 'ব্লাউজ পিস (Blouse Piece)' },
        ]);
        setRows([
          { id: 'r-1', size: '১২ হাত', length: '৫.৫ মিটার', blouse: 'ব্লাউজ পিস ছাড়া' },
          { id: 'r-2', size: '১২.৫ হাত', length: '৬.০ মিটার', blouse: '০.৮ মিটার রানিং ব্লাউজ পিস সহ' },
          { id: 'r-3', size: 'Free Size', length: '১২ হাত', blouse: 'আঁচল ও পাড় সংযুক্ত' },
        ]);
      } else if (s.includes('tshirt') || s.includes('polo')) {
        setAvailableSizes(['S', 'M', 'L', 'XL', 'XXL']);
        setShowTable(true);
        setShowImage(false);
        setImageUrl('');
        setColumns([
          { id: 'chest', label: 'বুকের মাপ (Chest)' },
          { id: 'length', label: 'দৈর্ঘ্য (Length)' },
        ]);
        setRows([
          { id: 'r-s', size: 'S', chest: '38"', length: '27"' },
          { id: 'r-m', size: 'M', chest: '40"', length: '28"' },
          { id: 'r-l', size: 'L', chest: '42"', length: '29"' },
          { id: 'r-xl', size: 'XL', chest: '44"', length: '30"' },
          { id: 'r-xxl', size: 'XXL', chest: '46"', length: '31"' },
        ]);
      } else {
        setAvailableSizes(['S', 'M', 'L', 'XL', 'XXL', 'Free Size']);
        setShowTable(true);
        setShowImage(false);
        setImageUrl('');
        setColumns(DEFAULT_COLUMNS);
        setRows(DEFAULT_ROWS);
      }
    }
  }, [selectedSubSlug, charts]);

  // Handle Direct Gallery Photo Upload
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadFileToGallery(file);
      setImageUrl(url);
      setShowImage(true);
      showToast('সাইজ চার্ট ছবি সফলভাবে আপলোড হয়েছে!');
    } catch {
      showToast('ছবি আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add / Remove Available Sizes
  const handleAddCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    if (availableSizes.includes(val)) {
      showToast('এই সাইজটি ইতিমধ্যে যুক্ত রয়েছে!');
      return;
    }
    setAvailableSizes([...availableSizes, val]);
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sz: string) => {
    setAvailableSizes(availableSizes.filter((s) => s !== sz));
  };

  // Add Preset Sizes
  const applyPresetSizes = (presetList: string[]) => {
    setAvailableSizes(presetList);
    showToast('প্রিসেট সাইজ সফলভাবে সেট করা হয়েছে');
  };

  // Add Table Row
  const handleAddRow = () => {
    const newId = `r-${Date.now()}`;
    const newRow: TableRow = { id: newId, size: `সাইজ ${rows.length + 1}` };
    columns.forEach((c) => {
      newRow[c.id] = '-';
    });
    setRows([...rows, newRow]);
  };

  // Remove Table Row
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      showToast('কমপক্ষে ১টি সাইজের সারি থাকতে হবে');
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
  };

  // Save Size Chart to Server
  const handleSaveSizeChart = async () => {
    if (!activeSub) return;
    setIsSaving(true);

    const payload = {
      name: `${activeSub.name} Size Chart`,
      banglaName: `${activeSub.banglaName} সাইজ চার্ট`,
      mainCategory: activeMain.name,
      subCategory: activeSub.slug,
      categorySlug: activeSub.slug,
      unit,
      notes,
      mode: showTable && showImage ? 'both' : (showImage ? 'image' : 'table'),
      imageUrl,
      showTable,
      showImage,
      measurementsJson: JSON.stringify({ columns, rows }),
      availableSizesJson: JSON.stringify(availableSizes),
      active: true,
    };

    try {
      if (activeChartId) {
        await adminFetch(`/api/admin/size-charts/${activeChartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast(`"${activeSub.banglaName}" সাইজ চার্ট সফলভাবে আপডেট হয়েছে!`);
      } else {
        const res = await adminFetch('/api/admin/size-charts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const d = await res.json().catch(() => ({}));
        if (d && d.id) {
          setActiveChartId(d.id);
        }
      }

      // Persist available sizes per category to backend
      if (activeSub?.id || activeSub?.slug) {
        for (const sz of availableSizes) {
          try {
            await adminFetch('/api/admin/sizes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: sz,
                banglaName: sz,
                category_id: activeSub.id || activeSub.slug,
                category: activeSub.slug,
              }),
            });
          } catch {}
        }
      }

      await fetchCharts();
      await refreshSizeCharts();
    } catch {
      showToast('সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete / Reset Size Chart for Active Subcategory
  const handleDeleteSizeChart = async () => {
    if (!activeSub) return;
    const confirmMsg = `আপনি কি নিশ্চিত যে "${activeSub.banglaName}"-এর কাস্টম সাইজ চার্ট মুছে ফেলতে চান?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (activeChartId) {
        await adminFetch(`/api/admin/size-charts/${activeChartId}`, { method: 'DELETE' });
      }
      setActiveChartId(null);
      setImageUrl('');
      setShowImage(false);
      await fetchCharts();
      await refreshSizeCharts();
      showToast(`"${activeSub.banglaName}" সাইজ চার্ট মুছে ফেলা হয়েছে!`);
    } catch {
      showToast('সাইজ চার্ট মুছতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
              <Ruler className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-stone-900">সাইজ চার্ট ও সাইজ নির্বাচন কন্ট্রোলার</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              সেন্ট্রাল রুলস
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl">
            ক্যাটাগরি ম্যানেজমেন্ট থেকে তৈরি করা মূল ক্যাটাগরি ও সাব-ক্যাটাগরি অনুযায়ী সাইজ চার্ট (টেবিল বা গ্যালারি ছবি) এবং প্রোডাক্ট পেজে সাইজ নির্বাচনের অপশন (S, M, L, XL, Free Size ইত্যাদি) এক জায়গা থেকে নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeChartId && (
            <button
              type="button"
              onClick={handleDeleteSizeChart}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="এই সাব-ক্যাটাগরির সাইজ চার্ট মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
              <span>মুছুন</span>
            </button>
          )}

          <button
            onClick={handleSaveSizeChart}
            disabled={isSaving || !activeSub}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8C2D19] hover:bg-[#732414] text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সব পরিবর্তন সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      {/* 1. MAIN CATEGORY SELECTOR */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          ১. মূল ক্যাটাগরি নির্বাচন করুন
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mainCategories.map((m) => {
            const isSelected = activeMain.slug.toLowerCase() === m.slug.toLowerCase();
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMainSlug(m.slug)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-900/5 border-[#8C2D19] ring-2 ring-[#8C2D19]/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <h3 className="font-bold text-sm text-stone-900">{m.banglaName}</h3>
                  <p className="text-[11px] font-mono text-stone-500 uppercase">{m.name}</p>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8C2D19]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUBCATEGORY SELECTOR PILLS */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          ২. {activeMain.banglaName}-এর সাব-ক্যাটাগরি নির্বাচন করুন
        </span>

        {availableSubcategories.length === 0 ? (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            এই মূল ক্যাটাগরিতে এখনো কোনো সাব-ক্যাটাগরি যুক্ত করা হয়নি। অনুগ্রহ করে আগে ক্যাটাগরি ম্যানেজমেন্ট থেকে সাব-ক্যাটাগরি যোগ করুন।
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availableSubcategories.map((sub) => {
              const isSelected = activeSub?.slug === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubSlug(sub.slug)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? 'bg-[#240B07] text-[#FFF8ED] border-[#240B07] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <span>{sub.banglaName}</span>
                  <span className="text-[10px] opacity-70 uppercase font-mono">({sub.name})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DUAL CONFIGURATION FOR SELECTED SUBCATEGORY */}
      {activeSub && (
        <div className="space-y-6">
          {/* SECTION A: PRODUCT DETAILS PAGE SIZE CHART DISPLAY */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
                    <TableIcon className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-stone-900">
                    অপশন ১: প্রোডাক্ট ডিটেইলস পেজে সাইজ চার্ট প্রদর্শন
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  কাস্টমার প্রোডাক্ট ডিটেইলস পেজে &quot;সাইজ গাইড&quot; বাটনে ক্লিক করলে এই চার্টটি দেখতে পাবেন।
                </p>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 bg-stone-50 p-2 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTable}
                    onChange={(e) => setShowTable(e.target.checked)}
                    className="w-4 h-4 text-[#8C2D19] rounded cursor-pointer"
                  />
                  <span>টেবিল চার্ট সক্রিয়</span>
                </label>

                <div className="w-px h-4 bg-stone-300" />

                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showImage}
                    onChange={(e) => setShowImage(e.target.checked)}
                    className="w-4 h-4 text-[#8C2D19] rounded cursor-pointer"
                  />
                  <span>গ্যালারি ছবি চার্ট সক্রিয়</span>
                </label>
              </div>
            </div>

            {/* TAB 1: MEASUREMENT TABLE BUILDER */}
            {showTable && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    📊 পরিমাপের টেবিল (Measurement Matrix)
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-stone-500">একক:</span>
                      <button
                        type="button"
                        onClick={() => setUnit('inch')}
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          unit === 'inch' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        ইঞ্চি (Inch)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit('cm')}
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          unit === 'cm' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        সেমি (cm)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ সারি যোগ করুন</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#240B07] text-[#FFF8ED]">
                      <tr>
                        <th className="py-2.5 px-3">সাইজের লেবেল</th>
                        {columns.map((col) => (
                          <th key={col.id} className="py-2.5 px-3">
                            {col.label}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-right">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {rows.map((row, rIdx) => (
                        <tr key={row.id} className="hover:bg-amber-50/20">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => {
                                const next = [...rows];
                                next[rIdx].size = e.target.value;
                                setRows(next);
                              }}
                              className="w-28 px-2 py-1 border border-stone-300 rounded font-bold text-xs"
                            />
                          </td>
                          {columns.map((col) => (
                            <td key={col.id} className="py-2 px-3">
                              <input
                                type="text"
                                value={row[col.id] || ''}
                                onChange={(e) => {
                                  const next = [...rows];
                                  next[rIdx][col.id] = e.target.value;
                                  setRows(next);
                                }}
                                placeholder="মান..."
                                className="w-24 px-2 py-1 border border-stone-200 rounded text-xs"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="text-stone-400 hover:text-rose-600 p-1"
                              title="সারি মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    চার্ট নোট / পরামর্শ
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="পরামর্শ নোট লিখুন..."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: GALLERY IMAGE UPLOADER */}
            {showImage && (
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-800" />
                    <span className="text-xs font-bold text-stone-800">
                      📷 গ্যালারি থেকে সাইজ চার্ট ছবি (Fit & Responsive)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-900">মোবাইল ও ডেসকটপ স্ক্রিনে ১০০% ফিট হবে</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-full sm:w-64 h-44 rounded-2xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center relative shadow-xs">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Size chart uploaded"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow"
                          title="ছবি মুছুন"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-4 text-stone-400 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto" />
                        <p className="text-xs font-semibold">কোনো ছবি আপলোড করা হয়নি</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-2 w-full">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl cursor-pointer text-xs font-bold text-stone-800 transition shadow-2xs">
                      <Upload className="w-4 h-4 text-[#8C2D19]" />
                      <span>{isUploadingImage ? 'আপলোড হচ্ছে...' : 'গ্যালারি থেকে সাইজ চার্ট ছবি বাছুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImageFile}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>

                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন..."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: PDP SIZE SELECTION BADGES & PRODUCT UPLOAD OPTIONS */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800">
                  <Sliders className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-stone-900">
                  অপশন ২: প্রোডাক্ট ডিটেইলস পেজে সাইজ নির্বাচন অপশন
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                কাস্টমার এই সাব-ক্যাটাগরির পোশাকে ক্লিক করলে যে যে সাইজ বাটনগুলো নির্বাচন করতে পারবে (যেমন: S, M, L, XL, XXL, Free Size ইত্যাদি)। প্রোডাক্ট আপলোডের সময়ও এডমিন এখান থেকে সাইজ সিলেক্ট করবে।
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-stone-600">কুইক প্রিসেট:</span>
              <button
                type="button"
                onClick={() => applyPresetSizes(['ফ্রি সাইজ (Free Size)', '২.৫ হাত', '৩ হাত'])}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 transition"
              >
                + লুঙ্গি প্রিসেট
              </button>
              <button
                type="button"
                onClick={() => applyPresetSizes(['স্ট্যান্ডার্ড সাইজ (১২ হাত)', '১২.৫ হাত', 'Free Size'])}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 transition"
              >
                + শাড়ি প্রিসেট
              </button>
              <button
                type="button"
                onClick={() => applyPresetSizes(['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'])}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 transition"
              >
                + পাঞ্জাবি প্রিসেট
              </button>
              <button
                type="button"
                onClick={() => applyPresetSizes(['S', 'M', 'L', 'XL', 'XXL'])}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 transition"
              >
                + টি-শার্ট / পোলো প্রিসেট
              </button>
            </div>

            {/* Current Size Badges */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-700">
                বর্তমান সাইজ বাটনসমূহ ({availableSizes.length}টি সক্রিয়):
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {availableSizes.map((sz) => (
                  <span
                    key={sz}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 font-bold text-xs text-stone-800 shadow-2xs"
                  >
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(sz)}
                      className="text-stone-400 hover:text-rose-600 transition"
                      title="মুছুন"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Size Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  placeholder="কাস্টম সাইজের নাম লিখুন (যেমন: ৩৮, ৪০, XXL, Free Size)..."
                  className="flex-1 max-w-sm px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#8C2D19]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                >
                  + যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
