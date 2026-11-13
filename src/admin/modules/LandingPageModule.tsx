import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { LandingPage, Product } from '../../types';
import { adminFetch } from '../adminApi';
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Check,
  Eye,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Video,
  Flame,
  Globe,
} from 'lucide-react';

export const LandingPageModule: React.FC = () => {
  const { products, showToast } = useShop();

  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaign' | 'create'>('campaign');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State for Create / Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    productId: products[0]?.id || '',
    template: 'template_1',
    badgeText: 'সীমিত সময়ের ধামাকা অফার!',
    headline: '',
    subheadline: '',
    videoUrl: '',
    benefitsText: '১০০% খাঁটি সুতি ও আরামদায়ক টেক্সচার\nরং পাকা ও দীর্ঘস্থায়ী কোয়ালিটির নিশ্চয়তা\nসরাসরি ঐতিহ্যবাহী তাঁতপল্লী থেকে সংগৃহীত\nক্যাশ অন ডেলিভারি সুবিধা',
    offerPrice: '',
    regularPrice: '',
    deliveryInsideDhaka: '70',
    deliveryOutsideDhaka: '120',
    whatsappNumber: '01890123456',
    callNumber: '01890123456',
    status: 'active' as 'active' | 'inactive',
  });

  const loadPages = () => {
    setLoading(true);
    adminFetch('/api/admin/landing-pages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.pages)) {
          setLandingPages(data.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/#/campaign/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showToast(`ল্যান্ডিং পেজ লিঙ্ক কপি করা হয়েছে: ${fullUrl}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleEdit = (page: LandingPage) => {
    setEditingId(page.id);
    setFormData({
      title: page.title,
      slug: page.slug,
      productId: page.product_id,
      template: page.template || 'template_1',
      badgeText: page.badge_text || '',
      headline: page.headline || '',
      subheadline: page.subheadline || '',
      videoUrl: page.video_url || '',
      benefitsText: (page.benefits || []).join('\n'),
      offerPrice: String(page.offer_price || ''),
      regularPrice: String(page.regular_price || ''),
      deliveryInsideDhaka: String(page.delivery_inside_dhaka || 70),
      deliveryOutsideDhaka: String(page.delivery_outside_dhaka || 120),
      whatsappNumber: page.whatsapp_number || '01890123456',
      callNumber: page.call_number || '01890123456',
      status: page.status || 'active',
    });
    setActiveTab('create');
  };

  const handleDuplicate = (page: LandingPage) => {
    setEditingId(null);
    setFormData({
      title: `${page.title} (কপি)`,
      slug: `${page.slug}-copy-${Date.now().toString().slice(-4)}`,
      productId: page.product_id,
      template: page.template || 'template_1',
      badgeText: page.badge_text || '',
      headline: page.headline || '',
      subheadline: page.subheadline || '',
      videoUrl: page.video_url || '',
      benefitsText: (page.benefits || []).join('\n'),
      offerPrice: String(page.offer_price || ''),
      regularPrice: String(page.regular_price || ''),
      deliveryInsideDhaka: String(page.delivery_inside_dhaka || 70),
      deliveryOutsideDhaka: String(page.delivery_outside_dhaka || 120),
      whatsappNumber: page.whatsapp_number || '01890123456',
      callNumber: page.call_number || '01890123456',
      status: 'active',
    });
    setActiveTab('create');
    showToast(`"${page.title}" কপি করা হয়েছে! নতুন তথ্য পরিবর্তন করে প্রকাশ করুন।`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${title}" ল্যান্ডিং পেজটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/landing-pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ল্যান্ডিং পেজ মুছে ফেলা হয়েছে');
        loadPages();
      } else {
        showToast(data.error || 'মুছতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.productId) {
      showToast('শিরোনাম এবং প্রোডাক্ট সিলেক্ট করা আবশ্যক');
      return;
    }

    const benefits = formData.benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      productId: formData.productId,
      template: formData.template,
      badgeText: formData.badgeText.trim(),
      headline: formData.headline.trim() || formData.title.trim(),
      subheadline: formData.subheadline.trim(),
      videoUrl: formData.videoUrl.trim(),
      benefits,
      offerPrice: Number(formData.offerPrice) || 0,
      regularPrice: Number(formData.regularPrice) || 0,
      deliveryInsideDhaka: Number(formData.deliveryInsideDhaka) || 70,
      deliveryOutsideDhaka: Number(formData.deliveryOutsideDhaka) || 120,
      whatsappNumber: formData.whatsappNumber.trim(),
      callNumber: formData.callNumber.trim(),
      status: formData.status,
    };

    try {
      const url = editingId ? `/api/admin/landing-pages/${editingId}` : '/api/admin/landing-pages';
      const method = editingId ? 'PUT' : 'POST';
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(editingId ? 'ল্যান্ডিং পেজ আপডেট সম্পন্ন হয়েছে' : 'নতুন ল্যান্ডিং পেজ তৈরি সম্পন্ন হয়েছে');
        setEditingId(null);
        setActiveTab('campaign');
        loadPages();
      } else {
        showToast(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const filteredPages = landingPages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>ল্যান্ডিং পেজ ও ক্যাম্পেইন ম্যানেজার (Landing Pages)</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            ফেসবুক অ্যাড ও মার্কেটিংয়ের জন্য আনলিমিটেড হাই-কনভার্টিং সেলস ল্যান্ডিং পেজ তৈরি করুন
          </p>
        </div>

        {/* Tab Navigation (Matching Video 02:49) */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button
            onClick={() => {
              setActiveTab('campaign');
              setEditingId(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ক্যাম্পেইন তালিকা (Campaign)
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? 'পেজ এডিট করুন' : 'নতুন তৈরি (Create)'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Campaign Manage Table (Exact Video 02:51 Table Style) */}
      {activeTab === 'campaign' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ক্যাম্পেইন খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div className="text-xs text-stone-500 font-semibold">
              মোট সক্রিয় ক্যাম্পেইন: <span className="font-bold text-stone-900">{filteredPages.length}</span> টি
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">SL</th>
                  <th className="py-3 px-4 font-bold">Landing Page Title</th>
                  <th className="py-3 px-4 font-bold">Slug / URL</th>
                  <th className="py-3 px-4 font-bold">Template</th>
                  <th className="py-3 px-4 font-bold">Views</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                      কোনো ল্যান্ডিং পেজ পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page, index) => (
                    <tr key={page.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-500">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{page.title}</div>
                        <div className="text-[11px] text-stone-400 line-clamp-1">{page.badge_text}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <code className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[11px]">
                          /campaign/{page.slug}
                        </code>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-600">
                        {page.template || 'Template 1'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800">{page.view_count || 0}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            page.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {page.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Link */}
                          <a
                            href={`/#/campaign/${page.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                            title="পেজটি দেখুন"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(page.slug)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="লিঙ্ক কপি করুন"
                          >
                            {copiedSlug === page.slug ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(page)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Clone / Duplicate */}
                          <button
                            onClick={() => handleDuplicate(page)}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                            title="এই পেজটি ক্লোন / কপি করে নতুন তৈরি করুন"
                          >
                            <Layers className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Create / Edit Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-base font-bold text-stone-900">
              {editingId ? 'ল্যান্ডিং পেজ সম্পাদনা করুন' : 'নতুন সেলস ল্যান্ডিং পেজ তৈরি করুন'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setActiveTab('campaign');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
              >
                বাতিল করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ক্যাম্পেইনের নাম / শিরোনাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="যেমন: প্রিমিয়াম সিল্ক শাড়ি স্পেশাল অফার"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ইউআরএল স্লাগ (Slug)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="যেমন: special-saree-offer (ফাঁকা রাখলে স্বয়ংক্রিয় হবে)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                টার্গেট পণ্য নির্বাচন করুন <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => {
                  const selProd = products.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    productId: e.target.value,
                    offerPrice: selProd ? String(selProd.price) : formData.offerPrice,
                    regularPrice: selProd ? String(selProd.originalPrice || selProd.price + 400) : formData.regularPrice,
                  });
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (৳{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                টেমপ্লেট ডিজাইন
              </label>
              <select
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="template_1">টেমপ্লেট ১ - হাই-কনভার্সন ভিডিও ও ডিরেক্ট ফর্ম</option>
                <option value="template_2">টেমপ্লেট ২ - মিনিমালিস্ট ফটো গ্যালারি</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                টপ ব্যানার ব্যাজ টেক্সট
              </label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="যেমন: সীমিত সময়ের ধামাকা অফার! সরাসরি কারখানা থেকে হোম ডেলিভারি"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ইউটিউব প্রোডাক্ট ভিডিও ইউআরএল (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                অফার প্রাইস (Offer Price) ৳
              </label>
              <input
                type="number"
                value={formData.offerPrice}
                onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                placeholder="1450"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                আগের মূল্য (Regular Price) ৳
              </label>
              <input
                type="number"
                value={formData.regularPrice}
                onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                placeholder="1850"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              পণ্যের প্রধান আকর্ষণ ও সুবিধাসমূহ (প্রতি লাইনে একটি)
            </label>
            <textarea
              rows={4}
              value={formData.benefitsText}
              onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">ঢাকার ভিতরে ডেলিভারি ৳</label>
              <input
                type="number"
                value={formData.deliveryInsideDhaka}
                onChange={(e) => setFormData({ ...formData, deliveryInsideDhaka: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">ঢাকার বাইরে ডেলিভারি ৳</label>
              <input
                type="number"
                value={formData.deliveryOutsideDhaka}
                onChange={(e) => setFormData({ ...formData, deliveryOutsideDhaka: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">কল নাম্বার</label>
              <input
                type="text"
                value={formData.callNumber}
                onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">স্ট্যাটাস</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="inactive">Inactive (বন্ধ)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setActiveTab('campaign');
              }}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              {editingId ? 'আপডেট সংরক্ষণ করুন' : 'ল্যান্ডিং পেজ তৈরি করুন'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
