import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import {
  Building2,
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  FileText,
  Calendar,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Tag,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';

export interface SupplierItem {
  id: string;
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  total_purchased: number;
  balance_due: number;
  status: string;
  created_at: string;
}

export interface PurchaseOrderItem {
  productId?: string;
  variantId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseRecord {
  id: string;
  purchase_no: string;
  supplier_id: string;
  supplier_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: 'paid' | 'partial' | 'due';
  status: 'received' | 'ordered' | 'cancelled';
  purchase_date: string;
  items: PurchaseOrderItem[];
  note: string;
  created_by: string;
  created_at: string;
}

export const SuppliersPurchasesModule: React.FC = () => {
  const { products, showToast, syncAuthoritativeData } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<PurchaseRecord | null>(null);

  // Form states for Supplier
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supCategory, setSupCategory] = useState('সুতা ও তাঁত কাপড়');
  const [supStatus, setSupStatus] = useState('active');

  // Form states for Purchase
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNote, setPoNote] = useState('');
  const [poPaidAmount, setPoPaidAmount] = useState<number>(0);
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([
    { productName: '', quantity: 1, unitCost: 0, lineTotal: 0 },
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [supRes, poRes] = await Promise.all([
        adminFetch('/api/admin/suppliers').then((r) => r.json()),
        adminFetch('/api/admin/purchases').then((r) => r.json()),
      ]);

      if (supRes.success && Array.isArray(supRes.suppliers)) {
        setSuppliers(supRes.suppliers);
      }
      if (poRes.success && Array.isArray(poRes.purchases)) {
        setPurchases(poRes.purchases);
      }
    } catch (err) {
      console.warn('Failed to load suppliers/purchases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const totalSuppliersCount = suppliers.length;
  const activeSuppliersCount = suppliers.filter((s) => s.status === 'active').length;
  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const totalDueAmount = purchases.reduce((acc, p) => acc + (Number(p.due_amount) || 0), 0);

  // Filtered lists
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.company_name && s.company_name.toLowerCase().includes(q)) ||
        s.phone.includes(q) ||
        (s.category && s.category.toLowerCase().includes(q))
    );
  }, [suppliers, searchQuery]);

  const filteredPurchases = useMemo(() => {
    if (!searchQuery.trim()) return purchases;
    const q = searchQuery.toLowerCase();
    return purchases.filter(
      (p) =>
        p.purchase_no.toLowerCase().includes(q) ||
        p.supplier_name.toLowerCase().includes(q) ||
        (p.note && p.note.toLowerCase().includes(q))
    );
  }, [purchases, searchQuery]);

  // Open Add/Edit Supplier Modal
  const handleOpenSupplierModal = (sup?: SupplierItem) => {
    if (sup) {
      setEditingSupplier(sup);
      setSupName(sup.name);
      setSupCompany(sup.company_name || '');
      setSupPhone(sup.phone);
      setSupEmail(sup.email || '');
      setSupAddress(sup.address || '');
      setSupCategory(sup.category || 'সুতা ও তাঁত কাপড়');
      setSupStatus(sup.status || 'active');
    } else {
      setEditingSupplier(null);
      setSupName('');
      setSupCompany('');
      setSupPhone('');
      setSupEmail('');
      setSupAddress('');
      setSupCategory('সুতা ও তাঁত কাপড়');
      setSupStatus('active');
    }
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      showToast('সাপ্লায়ারের নাম ও মোবাইল নম্বর আবশ্যক');
      return;
    }

    try {
      if (editingSupplier) {
        const res = await adminFetch(`/api/admin/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: supName,
            companyName: supCompany,
            phone: supPhone,
            email: supEmail,
            address: supAddress,
            category: supCategory,
            status: supStatus,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('সাপ্লায়ার তথ্য সফলভাবে আপডেট হয়েছে');
          setIsSupplierModalOpen(false);
          loadData();
        } else {
          showToast(data.error || 'আপডেট করতে সমস্যা হয়েছে');
        }
      } else {
        const res = await adminFetch('/api/admin/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: supName,
            companyName: supCompany,
            phone: supPhone,
            email: supEmail,
            address: supAddress,
            category: supCategory,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('নতুন সাপ্লায়ার সফলভাবে যুক্ত হয়েছে');
          setIsSupplierModalOpen(false);
          loadData();
        } else {
          showToast(data.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
        }
      }
    } catch {
      showToast('সার্ভার যোগাযোগে সমস্যা হয়েছে');
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" সাপ্লায়ার মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('সাপ্লায়ার সফলভাবে মুছে ফেলা হয়েছে');
        loadData();
      } else {
        showToast(data.error || 'মুছে ফেলতে সমস্যা হয়েছে');
      }
    } catch {
      showToast('সার্ভার ত্রুটি');
    }
  };

  // Purchase Order calculation helpers
  const calculatedPoTotal = useMemo(() => {
    return poItems.reduce((acc, item) => acc + (Number(item.lineTotal) || 0), 0);
  }, [poItems]);

  const calculatedPoDue = Math.max(0, calculatedPoTotal - (Number(poPaidAmount) || 0));

  const handleOpenPurchaseModal = () => {
    if (suppliers.length === 0) {
      showToast('আগে অন্তত একজন সাপ্লায়ার যুক্ত করুন');
      return;
    }
    setPoSupplierId(suppliers[0]?.id || '');
    setPoDate(new Date().toISOString().split('T')[0]);
    setPoNote('');
    setPoPaidAmount(0);
    setPoItems([{ productName: products[0]?.name || '', quantity: 10, unitCost: 500, lineTotal: 5000 }]);
    setIsPurchaseModalOpen(true);
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setPoItems((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitCost') {
        const q = Number(target.quantity) || 0;
        const c = Number(target.unitCost) || 0;
        target.lineTotal = q * c;
      }
      next[index] = target;
      return next;
    });
  };

  const handleSelectProductForItem = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const v = prod.variants?.[0];
    setPoItems((prev) => {
      const next = [...prev];
      const q = next[index]?.quantity || 10;
      const cost = Math.round(prod.price * 0.65);
      next[index] = {
        productId: prod.id,
        variantId: v?.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: q,
        unitCost: cost,
        lineTotal: q * cost,
      };
      return next;
    });
  };

  const handleAddItemRow = () => {
    setPoItems((prev) => [
      ...prev,
      { productName: '', quantity: 5, unitCost: 0, lineTotal: 0 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (poItems.length === 1) return;
    setPoItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      showToast('সাপ্লায়ার নির্বাচন করুন');
      return;
    }
    if (poItems.some((i) => !i.productName || i.quantity <= 0)) {
      showToast('সমস্ত পণ্যের বিবরণ এবং সঠিক পরিমাণ দিন');
      return;
    }

    const supObj = suppliers.find((s) => s.id === poSupplierId);
    const payload = {
      supplierId: poSupplierId,
      supplierName: supObj ? `${supObj.name} (${supObj.company_name || 'Mill'})` : 'Supplier',
      totalAmount: calculatedPoTotal,
      paidAmount: poPaidAmount,
      dueAmount: calculatedPoDue,
      paymentStatus: calculatedPoDue <= 0 ? 'paid' : poPaidAmount > 0 ? 'partial' : 'due',
      status: 'received',
      purchaseDate: poDate,
      items: poItems,
      note: poNote,
    };

    try {
      const res = await adminFetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'ক্রয় চালান সফলভাবে সংরক্ষিত হয়েছে এবং স্টক যুক্ত হয়েছে');
        setIsPurchaseModalOpen(false);
        loadData();
        syncAuthoritativeData();
      } else {
        showToast(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার যোগাযোগে সমস্যা হয়েছে');
    }
  };

  const handleDeletePurchase = async (id: string, poNo: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে ক্রয় চালান "${poNo}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await adminFetch(`/api/admin/purchases/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ক্রয় চালান সফলভাবে মুছে ফেলা হয়েছে');
        loadData();
      } else {
        showToast(data.error || 'মুছে ফেলতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার ত্রুটি');
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-stone-900">
              সাপ্লায়ার ও ক্রয় চালান (Suppliers & Purchases)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            তাঁত সুতা, কাপড় ও কাঁচামাল সাপ্লায়ার তালিকা, ক্রয় চালান তৈরি এবং ইনওয়ার্ড স্টক অটোমেশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {activeSubTab === 'suppliers' ? (
            <button
              onClick={() => handleOpenSupplierModal()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সাপ্লায়ার যোগ করুন</span>
            </button>
          ) : (
            <button
              onClick={handleOpenPurchaseModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ক্রয় চালান (Stock In)</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">মোট সাপ্লায়ার</div>
            <div className="text-lg font-black text-stone-900">{totalSuppliersCount} টি</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">সক্রিয় সাপ্লায়ার</div>
            <div className="text-lg font-black text-stone-900">{activeSuppliersCount} জন</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">মোট ক্রয় খরচ</div>
            <div className="text-lg font-black text-stone-900">৳{totalPurchasesAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">মোট বকেয়া পাওনা</div>
            <div className="text-lg font-black text-rose-600">৳{totalDueAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'suppliers'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            🏪 সাপ্লায়ার তালিকা ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'purchases'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            📦 ক্রয় চালান ও ইনওয়ার্ড ({purchases.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'suppliers'
                ? 'সাপ্লায়ারের নাম, ফোন বা মিল খুঁজুন...'
                : 'চালান নং বা সাপ্লায়ার খুঁজুন...'
            }
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tab 1: Suppliers Directory */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">সাপ্লায়ার / মিলের নাম</th>
                  <th className="p-3.5">যোগাযোগ</th>
                  <th className="p-3.5">ক্যাটাগরি</th>
                  <th className="p-3.5">ঠিকানা</th>
                  <th className="p-3.5 text-right">মোট ক্রয়</th>
                  <th className="p-3.5 text-right">বকেয়া</th>
                  <th className="p-3.5 text-center">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400">
                      কোনো সাপ্লায়ার পাওয়া যায়নি। &quot;নতুন সাপ্লায়ার যোগ করুন&quot; বাটনে ক্লিক করে যোগ করুন।
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">
                        <div>{sup.name}</div>
                        {sup.company_name && (
                          <div className="text-[11px] font-normal text-stone-500">{sup.company_name}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-stone-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          <span>{sup.phone}</span>
                        </div>
                        {sup.email && (
                          <div className="text-[11px] text-stone-400">{sup.email}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {sup.category || 'সুতা ও কাপড়'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500 max-w-xs truncate">
                        {sup.address || '-'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-stone-900">
                        ৳{(Number(sup.total_purchased) || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold">
                        {Number(sup.balance_due) > 0 ? (
                          <span className="text-rose-600">৳{(Number(sup.balance_due) || 0).toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-600">পরিশোধিত</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sup.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {sup.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenSupplierModal(sup)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="এডিট"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Purchases List */}
      {activeSubTab === 'purchases' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">চালান নম্বর</th>
                  <th className="p-3.5">সাপ্লায়ার</th>
                  <th className="p-3.5">তারিখ</th>
                  <th className="p-3.5 text-center">পণ্যের সংখ্যা</th>
                  <th className="p-3.5 text-right">মোট মূল্য</th>
                  <th className="p-3.5 text-right">পরিশোধিত</th>
                  <th className="p-3.5 text-right">বকেয়া</th>
                  <th className="p-3.5 text-center">পেমেন্ট স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-400">
                      কোনো ক্রয় চালান পাওয়া যায়নি। &quot;নতুন ক্রয় চালান (Stock In)&quot; বাটনে ক্লিক করে পণ্য স্টক ইন করুন।
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((po) => (
                    <tr key={po.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-amber-700">
                        {po.purchase_no}
                      </td>
                      <td className="p-3.5 font-medium text-stone-900">
                        {po.supplier_name}
                      </td>
                      <td className="p-3.5 text-stone-500">
                        {po.purchase_date?.split('T')[0] || po.purchase_date}
                      </td>
                      <td className="p-3.5 text-center font-bold text-stone-700">
                        {po.items?.length || 0} টি আইটেম
                      </td>
                      <td className="p-3.5 text-right font-black text-stone-900">
                        ৳{(Number(po.total_amount) || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        ৳{(Number(po.paid_amount) || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-600">
                        ৳{(Number(po.due_amount) || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : po.payment_status === 'partial'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {po.payment_status === 'paid' ? 'পরিশোধিত' : po.payment_status === 'partial' ? 'আংশিক' : 'বকেয়া'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedPurchaseDetail(po)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="বিস্তারিত দেখুন"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePurchase(po.id, po.purchase_no)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">
                  {editingSupplier ? 'সাপ্লায়ার তথ্য সম্পাদনা' : 'নতুন সাপ্লায়ার যোগ করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">সাপ্লায়ারের নাম *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="যেমন: হাজী আব্দুল লতিফ"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">প্রতিষ্ঠান / মিলের নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={supCompany}
                  onChange={(e) => setSupCompany(e.target.value)}
                  placeholder="যেমন: শাহজাদপুর খাঁটি তাঁত মিল"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="supplier@mail.com"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                >
                  <option value="সুতা ও তাঁত কাপড়">সুতা ও তাঁত কাপড় (Yarn & Fabric)</option>
                  <option value="লুঙ্গি প্রস্তুতকারক">লুঙ্গি প্রস্তুতকারক (Lungi Weaver)</option>
                  <option value="জামদানি শাড়ি কারিগর">জামদানি শাড়ি কারিগর (Jamdani Artisan)</option>
                  <option value="পাঞ্জাবি ফেব্রিক্স ও এম্ব্রয়ডারি">পাঞ্জাবি ফেব্রিক্স ও এম্ব্রয়ডারি</option>
                  <option value="প্যাকেজিং ও আনুষঙ্গিক">প্যাকেজিং ও আনুষঙ্গিক (Packaging & Boxes)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="যেমন: দ্বারিয়াপুর বাজার, শাহজাদপুর, সিরাজগঞ্জ"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              {editingSupplier && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={supStatus}
                    onChange={(e) => setSupStatus(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden animate-in fade-in max-h-[90vh] flex flex-col">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-sm">নতুন ক্রয় চালান ও ইনওয়ার্ড স্টক এন্ট্রি</h3>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">সাপ্লায়ার নির্বাচন করুন *</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company_name || 'Mill'}) - {s.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ক্রয়ের তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>ক্রয়কৃত পণ্যের তালিকা (Purchase Items)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>আইটেম যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-white p-3 rounded-xl border border-stone-200 items-center"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">পণ্য / বিবরণ</label>
                        <div className="flex gap-1.5">
                          <select
                            onChange={(e) => handleSelectProductForItem(idx, e.target.value)}
                            className="w-28 text-[11px] bg-stone-50 border border-stone-200 rounded-lg p-1 text-stone-700"
                          >
                            <option value="">নির্বাচন...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name.slice(0, 20)}...
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            required
                            value={item.productName}
                            onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                            placeholder="পণ্যের নাম লিখুন"
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">পরিমাণ (Qty)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-center font-bold"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">একক মূল্য (৳)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitCost}
                          onChange={(e) => handleUpdateItem(idx, 'unitCost', Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-center font-bold"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-right">
                        <label className="block text-[10px] font-bold text-stone-400 mb-0.5">মোট মূল্য</label>
                        <div className="font-black text-stone-900 text-xs">
                          ৳{item.lineTotal.toLocaleString()}
                        </div>
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Payments */}
                <div className="bg-stone-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-stone-500">স্টক ইন স্ট্যাটাস:</span>
                    <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>সংরক্ষণ করলেই অটোমেটিক প্রোডাক্ট স্টকে যুক্ত হবে</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-bold text-stone-600">মোট চালানের মূল্য:</span>
                      <span className="text-base font-black text-stone-900">৳{calculatedPoTotal.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <span className="font-bold text-stone-600">নগদ পরিশোধ (Paid):</span>
                      <input
                        type="number"
                        min="0"
                        max={calculatedPoTotal}
                        value={poPaidAmount}
                        onChange={(e) => setPoPaidAmount(Number(e.target.value))}
                        className="w-28 bg-white border border-stone-300 rounded-lg px-2 py-1 text-right font-bold text-emerald-700"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 text-rose-600">
                      <span className="font-bold">অবশিষ্ট বকেয়া (Due):</span>
                      <span className="font-black text-sm">৳{calculatedPoDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">মন্তব্য বা চালান নোট (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={poNote}
                  onChange={(e) => setPoNote(e.target.value)}
                  placeholder="যেমন: সুতার কোয়ালিটি ৮০ কাউন্ট, শাহজাদপুর তাঁত শেড থেকে সরবরাহ..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  চালান সম্পন্ন ও স্টক ইন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-amber-400 font-bold uppercase">ক্রয় চালান বিবরণ</div>
                <h3 className="font-black text-base">{selectedPurchaseDetail.purchase_no}</h3>
              </div>
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-stone-400 font-bold">সাপ্লায়ার:</span>
                  <div className="font-bold text-stone-900">{selectedPurchaseDetail.supplier_name}</div>
                </div>
                <div>
                  <span className="text-stone-400 font-bold">তারিখ:</span>
                  <div className="font-bold text-stone-900">{selectedPurchaseDetail.purchase_date?.split('T')[0]}</div>
                </div>
              </div>

              <div>
                <span className="text-stone-400 font-bold block mb-2">আইটেম তালিকা:</span>
                <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {selectedPurchaseDetail.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-700">
                      <div>
                        <span className="font-bold">{it.productName}</span>
                        <span className="text-stone-400 text-[11px] ml-1">({it.quantity} x ৳{it.unitCost})</span>
                      </div>
                      <div className="font-bold text-stone-900">৳{it.lineTotal?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-stone-100 p-3.5 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-600">মোট চালানের মূল্য:</span>
                  <span className="font-black text-stone-900">৳{selectedPurchaseDetail.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>পরিশোধিত:</span>
                  <span className="font-bold">৳{selectedPurchaseDetail.paid_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>বকেয়া পাওনা:</span>
                  <span className="font-bold">৳{selectedPurchaseDetail.due_amount?.toLocaleString()}</span>
                </div>
              </div>

              {selectedPurchaseDetail.note && (
                <div className="text-stone-500 italic text-[11px]">
                  নোট: {selectedPurchaseDetail.note}
                </div>
              )}

              <div className="text-right pt-2">
                <button
                  onClick={() => setSelectedPurchaseDetail(null)}
                  className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
