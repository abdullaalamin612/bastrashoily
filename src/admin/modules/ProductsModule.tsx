import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariant } from '../../types';
import { ProductUploadWizard } from '../components/ProductUploadWizard';
import { adminFetch } from '../adminApi';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Flame,
  Layers,
  Image,
  Tag,
  ExternalLink,
  Archive,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
  Ruler,
  Truck,
  Copy,
  Palette,
  RotateCcw,
} from 'lucide-react';

interface ColorData {
  id: string;
  name: string;
  bangla_name: string;
  hex_code: string;
  active: number;
}

interface SizeData {
  id: string;
  name: string;
  bangla_name: string;
  code: string;
  active: number;
}

export const ProductsModule: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, restoreProduct, categories, showToast } = useShop();

  const [productSubTab, setProductSubTab] = useState<'products' | 'colors' | 'sizes'>('products');
  const [colors, setColors] = useState<ColorData[]>([]);
  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', banglaName: '', hexCode: '#1e3a8a' });
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSize, setNewSize] = useState({ name: '', banglaName: '', code: '' });

  const loadColors = () => {
    adminFetch('/api/colors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.colors)) setColors(data.colors);
      })
      .catch(() => {});
  };

  const loadSizes = () => {
    adminFetch('/api/sizes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.sizes)) setSizes(data.sizes);
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    loadColors();
    loadSizes();
  }, []);

  const handleCreateColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColor.name || !newColor.banglaName || !newColor.hexCode) {
      showToast('সবগুলো তথ্য পূরণ করুন');
      return;
    }
    try {
      const res = await adminFetch('/api/admin/colors', {
        method: 'POST',
        body: JSON.stringify(newColor),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('নতুন রঙ যুক্ত হয়েছে');
        setNewColor({ name: '', banglaName: '', hexCode: '#1e3a8a' });
        setIsAddingColor(false);
        loadColors();
      } else {
        showToast(data.error || 'রঙ তৈরিতে ত্রুটি');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleDeleteColor = async (id: string, name: string) => {
    if (!window.confirm(`রঙ "${name}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/colors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('রঙ মুছে ফেলা হয়েছে');
        loadColors();
      } else {
        showToast(data.error || 'রঙ মুছতে ত্রুটি');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleCreateSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.name || !newSize.banglaName || !newSize.code) {
      showToast('সবগুলো তথ্য পূরণ করুন');
      return;
    }
    try {
      const res = await adminFetch('/api/admin/sizes', {
        method: 'POST',
        body: JSON.stringify(newSize),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('নতুন সাইজ যুক্ত হয়েছে');
        setNewSize({ name: '', banglaName: '', code: '' });
        setIsAddingSize(false);
        loadSizes();
      } else {
        showToast(data.error || 'সাইজ তৈরিতে ত্রুটি');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleDeleteSize = async (id: string, name: string) => {
    if (!window.confirm(`সাইজ "${name}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/sizes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('সাইজ মুছে ফেলা হয়েছে');
        loadSizes();
      } else {
        showToast(data.error || 'সাইজ মুছতে ত্রুটি');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for Add / Edit with reload survival
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return (
        sessionStorage.getItem('bastra_admin_product_modal_open') === 'true' ||
        Boolean(localStorage.getItem('bastra_product_wizard_draft'))
      );
    } catch {
      return false;
    }
  });

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(() => {
    try {
      const editId = sessionStorage.getItem('bastra_admin_product_editing_id');
      if (editId) {
        const found = products.find((p) => p.id === editId);
        if (found) return found;
      }
    } catch {}
    return null;
  });

  // Filter products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.banglaName.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      filterCategory === 'all' ||
      p.category.toLowerCase() === filterCategory.toLowerCase() ||
      p.subCategory.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleCopyLink = (product: Product) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}#/product/${product.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(product.id);
    showToast(`ফেসবুক পোস্টের জন্য প্রোডাক্ট লিঙ্ক কপি করা হয়েছে: ${product.name}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      banglaName: '',
      slug: '',
      sku: `BS-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'MEN',
      subCategory: 'Lungi',
      brand: 'BOSTROSHOILY',
      price: 900,
      discountPrice: 720,
      stock: 20,
      lowStockThreshold: 5,
      description: '১০০% খাঁটি কটন সুতা এবং আরামদায়ক বুননে প্রস্তুত প্রিমিয়াম পোশাক।',
      shortDescription: 'খাঁটি দেশীয় সুতি পোশাক, আরামদায়ক ও নিখুঁত ফিনিশিং।',
      mainImage:
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      galleryImages: [],
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isOffer: false,
      variants: [],
    });
    try {
      sessionStorage.setItem('bastra_admin_product_modal_open', 'true');
      sessionStorage.removeItem('bastra_admin_product_editing_id');
    } catch {}
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    try {
      sessionStorage.setItem('bastra_admin_product_modal_open', 'true');
      sessionStorage.setItem('bastra_admin_product_editing_id', prod.id);
    } catch {}
    setIsModalOpen(true);
  };

  // Feature 2: Duplicate Product (কপি করুন)
  const handleDuplicateProduct = (prod: Product) => {
    const cloned: Partial<Product> = {
      ...prod,
      id: undefined,
      name: `${prod.name} (Copy)`,
      banglaName: prod.banglaName ? `${prod.banglaName} (কপি)` : `${prod.name} (কপি)`,
      slug: '',
      sku: `BS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'draft',
      variants: (prod.variants || []).map((v, idx) => ({
        ...v,
        id: `v-${Date.now()}-${idx}`,
        sku: `${v.sku}-COPY`,
      })),
    };
    setEditingProduct(cloned);
    try {
      sessionStorage.setItem('bastra_admin_product_modal_open', 'true');
      sessionStorage.removeItem('bastra_admin_product_editing_id');
    } catch {}
    setIsModalOpen(true);
    showToast(`"${prod.name}"-এর ডুপ্লিকেট তৈরি হয়েছে। প্রয়োজনীয় এডিট করে প্রকাশ করুন।`);
  };

  const handleSaveFromWizard = async (productPayload: Product) => {
    let success = false;
    if (productPayload.id && products.some((p) => p.id === productPayload.id)) {
      success = (await updateProduct(productPayload)) !== false;
    } else {
      success = (await addProduct(productPayload)) !== false;
    }
    if (success) {
      setIsModalOpen(false);
      setEditingProduct(null);
      try {
        sessionStorage.removeItem('bastra_admin_product_modal_open');
        sessionStorage.removeItem('bastra_admin_product_editing_id');
        localStorage.removeItem('bastra_product_wizard_draft');
        if (productPayload.id) {
          localStorage.removeItem(`bastra_product_edit_draft_${productPayload.id}`);
        }
      } catch {}
    }
  };

  const productStats = React.useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const catCounts: Record<string, number> = {};

    products.forEach((p) => {
      const stock = p.stock ?? 0;
      if (stock === 0) outOfStock++;
      else if (stock <= 5) lowStock++;
      else inStock++;

      const c = p.category || 'General';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    return {
      total: products.length || 1,
      realTotal: products.length,
      inStock,
      lowStock,
      outOfStock,
      catCounts,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            প্রোডাক্ট ও ভ্যারিয়েন্ট ক্যাটালগ (Product & Variant Management)
          </h2>
          <p className="text-xs text-stone-500">
            নতুন পণ্য যুক্ত, স্টক আপডেট, ফেসবুক বিক্রির লিঙ্ক কপি ও ভ্যারিয়েন্ট কন্ট্রোল
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন Product Add করুন</span>
        </button>
      </div>

      {/* Product Sector Charts & Inventory Health */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
              <span>📈</span>
              <span>প্রোডাক্ট ইনভেন্টরি ও ক্যাটাগরি বিস্তার চার্ট (Catalog Analytics)</span>
            </h3>
            <p className="text-[11px] text-stone-500">স্টক স্বাস্থ্য ও ক্যাটাগরিভিত্তিক পণ্য সংখ্যার গ্রাফিক্যাল ওভারভিউ</p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
            মোট ক্যাটালগ: {productStats.realTotal} টি পণ্য
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Category Distribution Bar Progress */}
          <div className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
              ক্যাটাগরি অনুযায়ী পণ্য সংখ্যা:
            </span>
            {Object.entries(productStats.catCounts).map(([cat, count], i) => {
              const pct = Math.round((count / productStats.total) * 100);
              const colors = ['bg-amber-500', 'bg-blue-500', 'bg-rose-500', 'bg-emerald-500', 'bg-indigo-500'];
              const color = colors[i % colors.length];
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-800">{cat}</span>
                    <span className="text-stone-600">{count} টি ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stock Health Donut */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase">ইনভেন্টরি স্টক হেলথ:</span>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.8" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray={`${Math.round((productStats.inStock / productStats.total) * 100)} 100`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute font-black text-xs text-emerald-700 font-mono">
                  {Math.round((productStats.inStock / productStats.total) * 100)}%
                </span>
              </div>
              <div className="text-xs space-y-1.5 font-bold">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>পর্যাপ্ত স্টক: {productStats.inStock} টি</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>সীমিত স্টক: {productStats.lowStock} টি</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>স্টক আউট: {productStats.outOfStock} টি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search by name/sku */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রোডাক্ট নাম, বাংলা নাম বা SKU খুঁজুন..."
            className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
        >
          <option value="all">সকল ক্যাটাগরি (All Categories)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} ({c.banglaName})
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
        >
          <option value="all">সকল স্ট্যাটাস (All Status)</option>
          <option value="active">Active (সক্রিয়)</option>
          <option value="draft">Draft (খসড়া)</option>
          <option value="archived">Archived (আর্কাইভ)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 font-bold uppercase border-b border-stone-200">
                <th className="p-3.5">পণ্য ও ছবি</th>
                <th className="p-3.5">ক্যাটাগরি ও SKU</th>
                <th className="p-3.5">মূল্য ও ছাড়</th>
                <th className="p-3.5">স্টক ও ভ্যারিয়েন্ট</th>
                <th className="p-3.5">ট্যাগ</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">Facebook Link / অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Image & Title */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-14 object-cover rounded-lg border border-stone-200 bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 text-xs line-clamp-1">{prod.name}</p>
                        <p className="text-[11px] text-stone-500 font-serif line-clamp-1">{prod.banglaName}</p>
                        <span className="text-[10px] font-mono text-stone-400">/{prod.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category & SKU */}
                  <td className="p-3.5">
                    <p className="font-semibold text-stone-800">{prod.subCategory}</p>
                    <p className="text-[10px] text-stone-400 font-mono">SKU: {prod.sku}</p>
                  </td>

                  {/* Price */}
                  <td className="p-3.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-stone-900">৳{prod.discountPrice || prod.price}</span>
                      {prod.discountPrice && (
                        <span className="text-[10px] text-stone-400 line-through">৳{prod.price}</span>
                      )}
                    </div>
                  </td>

                  {/* Stock & Variants */}
                  <td className="p-3.5">
                    <span
                      className={`font-bold ${
                        prod.stock <= prod.lowStockThreshold ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {prod.stock} pcs
                    </span>
                    <p className="text-[10px] text-stone-500">{prod.variants?.length || 0} টি ভ্যারিয়েন্ট</p>
                  </td>

                  {/* Badges */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {prod.isBestSeller && (
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Best Seller
                        </span>
                      )}
                      {prod.isNewArrival && (
                        <span className="bg-stone-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                      {prod.isOffer && (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Offer
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        prod.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.status === 'draft'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </td>

                  {/* Actions & Copy Link */}
                  <td className="p-3.5 text-right space-x-1.5">
                    {/* Copy Product Link for Facebook */}
                    <button
                      onClick={() => handleCopyLink(prod)}
                      className="p-1.5 bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-700 rounded-lg transition-colors"
                      title="Copy direct product URL for Facebook Post Buy Now"
                    >
                      {copiedId === prod.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Duplicate Product (কপি করুন) */}
                    <button
                      onClick={() => handleDuplicateProduct(prod)}
                      className="p-1.5 bg-stone-100 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      title="ডুপ্লিকেট / কপি করুন (Duplicate Product)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Restore Archived Product */}
                    {prod.status === 'archived' && (
                      <button
                        onClick={async () => {
                          await restoreProduct(prod.id);
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        title="রিস্টোর করুন (Restore to Active Catalog)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete / Archive */}
                    <button
                      onClick={async () => {
                        if (confirm(`আপনি কি "${prod.name}" ডিলিট করতে চান? অর্ডারের রেকর্ড না থাকলে এটি স্থায়ীভাবে ডিলিট হবে, রেকর্ড থাকলে নিরাপদে আর্কাইভ হবে।`)) {
                          await deleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 bg-stone-100 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="মুছে ফেলুন (Delete Product)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Step Product Upload & Edit Wizard */}
      {isModalOpen && (
        <ProductUploadWizard
          initialProduct={editingProduct}
          categories={categories}
          onSave={handleSaveFromWizard}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};