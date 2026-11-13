import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Coupon, DeliveryConfig, PaymentConfig, ProductPageSettings, InvoiceConfig, InvoiceTermItem } from '../../types';
import { adminFetch } from '../adminApi';
import {
  Tag,
  Truck,
  CreditCard,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Percent,
  Edit2,
  X,
  FileText,
} from 'lucide-react';

interface CommerceSettingsModuleProps {
  initialTab?: 'coupons' | 'delivery' | 'courier' | 'payments' | 'pdp' | 'invoice';
}

export const CommerceSettingsModule: React.FC<CommerceSettingsModuleProps> = ({ initialTab = 'delivery' }) => {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    deliveryConfig,
    updateDeliveryConfig,
    paymentConfig,
    updatePaymentConfig,
    invoiceConfig,
    updateInvoiceConfig,
    productPageSettings,
    updateProductPageSettings,
    footerConfig,
    updateFooterConfig,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'coupons' | 'delivery' | 'courier' | 'payments' | 'pdp' | 'invoice'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Delivery local form state for explicit saving
  const [deliveryForm, setDeliveryForm] = useState<DeliveryConfig>(deliveryConfig);
  const [shippingPolicyText, setShippingPolicyText] = useState(footerConfig.shippingPolicy || '');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCharge, setNewZoneCharge] = useState(130);
  const [newZoneDays, setNewZoneDays] = useState('২-৩ দিন');

  // Courier API state
  const [courierForm, setCourierForm] = useState({
    provider: 'steadfast',
    steadfastApiKey: '',
    steadfastSecretKey: '',
    steadfastBaseUrl: 'https://portal.steadfast.com.bd/api/v1',
    pathaoClientId: '',
    pathaoClientSecret: '',
    pathaoUsername: '',
    pathaoPassword: '',
    redxToken: '',
    paperflyUsername: '',
    paperflyPassword: '',
    paperflyKey: '',
    senderName: 'BOSTROSHOILY',
    senderPhone: '01864528488',
    senderAddress: 'শাহজাদপুর / বেলকুচি, সিরাজগঞ্জ, বাংলাদেশ',
  });

  // Load saved courier settings from Admin API
  React.useEffect(() => {
    adminFetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.courier_config) {
          setCourierForm((prev) => ({ ...prev, ...data.settings.courier_config }));
        }
      })
      .catch(() => {});
  }, []);

  // Payment local form state for explicit saving
  const [paymentForm, setPaymentForm] = useState<PaymentConfig>(paymentConfig);

  React.useEffect(() => {
    if (paymentConfig) {
      setPaymentForm(paymentConfig);
    }
  }, [paymentConfig]);

  // Invoice local form state for customization
  const [invoiceForm, setInvoiceForm] = useState<InvoiceConfig>(invoiceConfig);
  const [newTermText, setNewTermText] = useState('');

  React.useEffect(() => {
    if (invoiceConfig) setInvoiceForm(invoiceConfig);
  }, [invoiceConfig]);

  // Edit Coupon Modal state
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // New Coupon Form state
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 1000,
    usageLimit: 100,
    expiryDate: '2026-12-31',
    expiryTime: '23:59',
    status: 'active',
  });
  const [showAddCoupon, setShowAddCoupon] = useState(false);

  const handleSaveDeliveryConfig = () => {
    const updatedCfg: DeliveryConfig = {
      ...deliveryForm,
      insideSirajganjCharge: Number(deliveryForm.insideDhakaCharge),
      outsideSirajganjCharge: Number(deliveryForm.outsideDhakaCharge),
    };
    updateDeliveryConfig(updatedCfg);
    if (shippingPolicyText !== footerConfig.shippingPolicy) {
      updateFooterConfig({
        ...footerConfig,
        shippingPolicy: shippingPolicyText,
      });
    }
    showToast('ডেলিভারি চার্জ ও এরিয়া সেটিংস সফলভাবে সেভ হয়েছে');
  };

  const handleSaveCourierConfig = async () => {
    try {
      await adminFetch('/api/admin/settings/courier_config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courierForm),
      });
      showToast('কুরিয়ার API ও বুকিং কনফিগারেশন সফলভাবে সেভ হয়েছে');
    } catch {
      showToast('কুরিয়ার সেটিংস সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  const handleAddCustomZone = () => {
    if (!newZoneName.trim()) return;
    const newZone = {
      id: `zone-${Date.now()}`,
      name: newZoneName.trim(),
      charge: Number(newZoneCharge) || 120,
      estimatedDays: newZoneDays.trim() || '২-৪ দিন',
      isActive: true,
    };
    const updatedZones = [...(deliveryForm.customZones || []), newZone];
    const updatedCfg = { ...deliveryForm, customZones: updatedZones };
    setDeliveryForm(updatedCfg);
    updateDeliveryConfig(updatedCfg);
    setNewZoneName('');
    showToast(`নতুন ডেলিভারি জোন (${newZone.name}) যোগ ও সেভ হয়েছে`);
  };

  const handleDeleteCustomZone = (zoneId: string) => {
    const updatedZones = (deliveryForm.customZones || []).filter((z) => z.id !== zoneId);
    const updatedCfg = { ...deliveryForm, customZones: updatedZones };
    setDeliveryForm(updatedCfg);
    updateDeliveryConfig(updatedCfg);
    showToast('ডেলিভারি জোন মুছে ফেলা হয়েছে');
  };

  const handleSavePaymentConfig = () => {
    updatePaymentConfig(paymentForm);
    showToast('বিকাশ, নগদ, রকেট সহ সকল পেমেন্ট তথ্য সফলভাবে সেভ হয়েছে');
  };

  const handleAddInvoiceTerm = () => {
    if (!newTermText.trim()) return;
    const newTerm: InvoiceTermItem = {
      id: `term-${Date.now()}`,
      text: newTermText.trim(),
    };
    const updatedTerms = [...(invoiceForm.terms || []), newTerm];
    const updated = { ...invoiceForm, terms: updatedTerms };
    setInvoiceForm(updated);
    updateInvoiceConfig(updated);
    setNewTermText('');
    showToast('ইনভয়েসে নতুন শর্ত যোগ করা হয়েছে');
  };

  const handleUpdateInvoiceTerm = (id: string, text: string) => {
    const updatedTerms = (invoiceForm.terms || []).map((t) => (t.id === id ? { ...t, text } : t));
    setInvoiceForm({ ...invoiceForm, terms: updatedTerms });
  };

  const handleDeleteInvoiceTerm = (id: string) => {
    const updatedTerms = (invoiceForm.terms || []).filter((t) => t.id !== id);
    const updated = { ...invoiceForm, terms: updatedTerms };
    setInvoiceForm(updated);
    updateInvoiceConfig(updated);
    showToast('ইনভয়েস শর্ত মুছে ফেলা হয়েছে');
  };

  const handleSaveInvoiceConfig = () => {
    updateInvoiceConfig(invoiceForm);
    showToast('ইনভয়েস টেক্সট ও শর্তাবলী সফলভাবে সেভ হয়েছে');
  };

  const handleSaveNewCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) return;
    addCoupon({
      ...newCoupon,
      code: newCoupon.code.toUpperCase().trim(),
      usedCount: 0,
    } as Coupon);
    setShowAddCoupon(false);
    setNewCoupon({
      code: '',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 1000,
      usageLimit: 100,
      expiryDate: '2026-12-31',
      expiryTime: '23:59',
      status: 'active',
    });
  };

  const handleSaveEditedCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    updateCoupon(editingCoupon);
    setEditingCoupon(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            বাণিজ্যিক সেটিংস (Coupons, Delivery & Payments)
          </h2>
          <p className="text-xs text-stone-500">
            কুপন কোড, সিরাজগঞ্জের ভিতরে ও বাহিরে ডেলিভারি চার্জ, বিকাশ/নগদ পেমেন্ট ও প্রোডাক্ট পেজ অপশন
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'coupons', label: '১৫. কুপন ও ডিসকাউন্ট' },
          { id: 'delivery', label: '১৬. ডেলিভারি চার্জ ও শিপিং' },
          { id: 'courier', label: '১৮. এক-ক্লিক কুরিয়ার ও API' },
          { id: 'payments', label: '১৭. পেমেন্ট ও বিকাশ/নগদ' },
          { id: 'invoice', label: '১৯. ইনভয়েস টেক্সট ও শর্তাবলী' },
          { id: 'pdp', label: '২০. প্রোডাক্ট পেজ সেটিংস' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 15. Coupons */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800">
              সক্রিয় কুপন তালিকা ({coupons.length} টি)
            </span>
            <button
              onClick={() => setShowAddCoupon(!showAddCoupon)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন কুপন কোড তৈরি করুন</span>
            </button>
          </div>

          {/* Add Coupon Form */}
          {showAddCoupon && (
            <form
              onSubmit={handleSaveNewCoupon}
              className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-4 text-xs animate-in fade-in"
            >
              <h4 className="font-bold text-stone-900 text-sm">নতুন কুপন কনফিগার করুন</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">কুপন কোড</label>
                  <input
                    type="text"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BOISHAKH15"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ডিসকাউন্ট ধরন</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discountType: e.target.value as any })
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  >
                    <option value="fixed">ফিক্সড টাকা (Fixed BDT ৳)</option>
                    <option value="percentage">শতকরা হার (Percentage %)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ছাড়ের পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-amber-200/60">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মেয়াদের তারিখ (Expiry Date)</label>
                  <input
                    type="date"
                    required
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">মেয়াদের সময় (Expiry Time)</label>
                  <input
                    type="time"
                    value={newCoupon.expiryTime || '23:59'}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryTime: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ব্যবহারের সর্বোচ্চ সীমা</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">কুপন স্ট্যাটাস</label>
                  <select
                    value={newCoupon.status || 'active'}
                    onChange={(e) => setNewCoupon({ ...newCoupon, status: e.target.value as any })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="disabled">নিষ্ক্রিয় (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoupon(false)}
                  className="px-3 py-1.5 bg-stone-200 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  কুপন সেভ করুন
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold uppercase text-stone-600">
                <tr>
                  <th className="p-3">কুপন কোড</th>
                  <th className="p-3">ছাড়ের ধরন ও পরিমাণ</th>
                  <th className="p-3">সর্বনিম্ন অর্ডার</th>
                  <th className="p-3">ব্যবহার সংখ্যা</th>
                  <th className="p-3">মেয়াদ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">{c.code}</td>
                    <td className="p-3 font-bold text-amber-900">
                      {(c.discountType === 'percent' || c.discountType === 'percentage') ? `${c.discountValue}% Off` : `৳${c.discountValue} ছাড়`}
                    </td>
                    <td className="p-3">৳{c.minOrderAmount}</td>
                    <td className="p-3 font-mono">{c.usedCount} বার {c.usageLimit ? `/ ${c.usageLimit}` : ''}</td>
                    <td className="p-3 text-stone-600 font-mono">
                      <div>{c.expiryDate}</div>
                      {c.expiryTime && (
                        <div className="text-[10px] text-stone-400">সময়: {c.expiryTime}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          const isNowActive = c.status === 'active' || c.isActive === true;
                          updateCoupon(c.id, {
                            status: isNowActive ? 'disabled' : 'active',
                            isActive: !isNowActive,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          (c.status === 'active' || c.isActive === true)
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          (c.status === 'active' || c.isActive === true) ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                        }`} />
                        <span>{(c.status === 'active' || c.isActive === true) ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(c)}
                        className="p-1 text-stone-400 hover:text-amber-600 cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(c.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Coupon Modal */}
          {editingCoupon && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-base text-stone-900">
                    কুপন কোড সম্পাদনা ({editingCoupon.code})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingCoupon(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditedCoupon} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">কুপন কোড</label>
                      <input
                        type="text"
                        required
                        value={editingCoupon.code}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono uppercase font-bold text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ডিসকাউন্ট ধরন</label>
                      <select
                        value={editingCoupon.discountType}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                      >
                        <option value="fixed">ফিক্সড টাকা (Fixed BDT ৳)</option>
                        <option value="percent">শতাংশ ছাড় (Percentage %)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        ছাড়ের পরিমাণ ({editingCoupon.discountType === 'percent' ? '%' : '৳'})
                      </label>
                      <input
                        type="number"
                        required
                        value={editingCoupon.discountValue}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            discountValue: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        সর্বনিম্ন অর্ডার মূল্য (৳)
                      </label>
                      <input
                        type="number"
                        value={editingCoupon.minOrderAmount}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            minOrderAmount: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">মেয়াদ উত্তীর্ণ তারিখ</label>
                      <input
                        type="date"
                        value={editingCoupon.expiryDate}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">মেয়াদের সময় (Expiry Time)</label>
                      <input
                        type="time"
                        value={editingCoupon.expiryTime || '23:59'}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, expiryTime: e.target.value })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">ব্যবহার সীমা (Usage Limit)</label>
                      <input
                        type="number"
                        value={editingCoupon.usageLimit || 100}
                        onChange={(e) =>
                          setEditingCoupon({
                            ...editingCoupon,
                            usageLimit: Number(e.target.value),
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">স্ট্যাটাস</label>
                      <select
                        value={editingCoupon.status || 'active'}
                        onChange={(e) =>
                          setEditingCoupon({ ...editingCoupon, status: e.target.value as any })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                      >
                        <option value="active">Active (সক্রিয়)</option>
                        <option value="disabled">Disabled (নিষ্ক্রিয়)</option>
                        <option value="expired">Expired (মেয়াদোত্তীর্ণ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingCoupon(null)}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>পরিবর্তন সেভ করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 16. Delivery Charges */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                ডেলিভারি চার্জ ও কুরিয়ার এরিয়া সেটিংস
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                সিরাজগঞ্জের ভিতরে ও বাহিরে এবং যেকোনো বিশেষ জোনের কুরিয়ার চার্জ পরিবর্তন করে সেভ করুন
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveDeliveryConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেভ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                সিরাজগঞ্জের ভেতরে ডেলিভারি চার্জ (টাকা ৳)
              </label>
              <input
                type="number"
                value={deliveryForm.insideDhakaCharge}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    insideDhakaCharge: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                সিরাজগঞ্জের বাইরে ডেলিভারি চার্জ (টাকা ৳)
              </label>
              <input
                type="number"
                value={deliveryForm.outsideDhakaCharge}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    outsideDhakaCharge: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                ফ্রি ডেলিভারির সর্বনিম্ন অর্ডার মূল্য (টাকা ৳)
              </label>
              <input
                type="number"
                value={deliveryForm.freeDeliveryThreshold}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    freeDeliveryThreshold: Number(e.target.value),
                  })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                এই পরিমাণের বেশি অর্ডারে স্বয়ংক্রিয়ভাবে ডেলিভারি ফ্রি হয়ে যাবে। (বর্তমান: ৳{deliveryForm.freeDeliveryThreshold})
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">সম্ভাব্য ডেলিভারি সময় নোট</label>
              <input
                type="text"
                value={deliveryForm.estimatedDeliveryDays}
                onChange={(e) =>
                  setDeliveryForm({
                    ...deliveryForm,
                    estimatedDeliveryDays: e.target.value,
                  })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                শিপিং ও ডেলিভারি পলিসি / নিয়মাবলী (ওয়েবসাইটে তাৎক্ষণিক আপডেট হবে)
              </label>
              <textarea
                rows={2}
                value={shippingPolicyText}
                onChange={(e) => setShippingPolicyText(e.target.value)}
                placeholder="যেমন: সিরাজগঞ্জের ভিতর মাত্র ৳70, সিরাজগঞ্জের বাইরে ৳130 (২০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং)..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800"
              />
            </div>
          </div>

          {/* Custom Delivery Zones Section */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-2">
              বিশেষ ডেলিভারি জোন ও চার্জ (Custom Delivery Zones)
            </h4>

            {/* List of custom zones */}
            <div className="space-y-2 mb-3">
              {(deliveryForm.customZones || []).length === 0 ? (
                <p className="text-xs text-stone-400 italic bg-stone-50 p-3 rounded-xl">
                  কোনো কাস্টম জোন যোগ করা নেই। নিচে থেকে যেকোনো বিভাগ/জেলা/উপজেলার জন্য আলাদা চার্জ নির্ধারণ করতে পারেন।
                </p>
              ) : (
                deliveryForm.customZones?.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{zone.name}</span>
                      <span className="text-stone-500 ml-2 font-mono">৳{zone.charge}</span>
                      <span className="text-stone-400 ml-2">({zone.estimatedDays})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomZone(zone.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Zone Form */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="জোনের নাম (যেমন: চট্টগ্রাম সিটি)"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 sm:col-span-2 text-xs"
              />
              <input
                type="number"
                placeholder="চার্জ ৳"
                value={newZoneCharge}
                onChange={(e) => setNewZoneCharge(Number(e.target.value))}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleAddCustomZone}
                className="bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
              >
                + জোন যোগ
              </button>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-3 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={handleSaveDeliveryConfig}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>ডেলিভারি সেটিংস সেভ করুন (Save Delivery Settings)</span>
            </button>
          </div>
        </div>
      )}

      {/* 18. Courier Integration & API */}
      {activeTab === 'courier' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-3xl space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>এক-ক্লিক কুরিয়ার ইন্টিগ্রেশন ও এপিআই (Courier API Settings)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Steadfast, Pathao, RedX ও Paperfly কুরিয়ার API কনফিগারেশন সেট করুন। অর্ডার থেকে ১-ক্লিকে পার্সেল বুকিং পাঠাতে পারবেন।
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveCourierConfig}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেভ করুন</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">ডিফল্ট কুরিয়ার সার্ভিস নির্বাচন করুন</label>
              <select
                value={courierForm.provider}
                onChange={(e) => setCourierForm({ ...courierForm, provider: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
              >
                <option value="steadfast">Steadfast Courier (স্টেডফাস্ট - সর্বাধিক ব্যবহৃত)</option>
                <option value="pathao">Pathao Courier (পাঠাও কুরিয়ার)</option>
                <option value="redx">RedX Logistics (রেডএক্স)</option>
                <option value="paperfly">Paperfly (পেপারফ্লাই)</option>
              </select>
            </div>

            {/* Steadfast settings */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                <span>Steadfast API ক্রেডেনশিয়ালস</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">সক্রিয় ইন্টিগ্রেশন</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Steadfast API Key</label>
                  <input
                    type="password"
                    value={courierForm.steadfastApiKey}
                    onChange={(e) => setCourierForm({ ...courierForm, steadfastApiKey: e.target.value })}
                    placeholder="আপনার Steadfast পোর্টালে প্রাপ্ত API Key লিখুন"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Steadfast Secret Key</label>
                  <input
                    type="password"
                    value={courierForm.steadfastSecretKey}
                    onChange={(e) => setCourierForm({ ...courierForm, steadfastSecretKey: e.target.value })}
                    placeholder="আপনার Steadfast Secret Key লিখুন"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">API Base URL</label>
                  <input
                    type="text"
                    value={courierForm.steadfastBaseUrl}
                    onChange={(e) => setCourierForm({ ...courierForm, steadfastBaseUrl: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Pathao & RedX credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h5 className="font-bold text-stone-800">Pathao Courier API</h5>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Client ID</label>
                  <input
                    type="text"
                    value={courierForm.pathaoClientId}
                    onChange={(e) => setCourierForm({ ...courierForm, pathaoClientId: e.target.value })}
                    placeholder="Pathao Client ID"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Client Secret</label>
                  <input
                    type="password"
                    value={courierForm.pathaoClientSecret}
                    onChange={(e) => setCourierForm({ ...courierForm, pathaoClientSecret: e.target.value })}
                    placeholder="Pathao Client Secret"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h5 className="font-bold text-stone-800">RedX / Paperfly API</h5>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">RedX Token</label>
                  <input
                    type="password"
                    value={courierForm.redxToken}
                    onChange={(e) => setCourierForm({ ...courierForm, redxToken: e.target.value })}
                    placeholder="RedX API Bearer Token"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Paperfly Key</label>
                  <input
                    type="text"
                    value={courierForm.paperflyKey}
                    onChange={(e) => setCourierForm({ ...courierForm, paperflyKey: e.target.value })}
                    placeholder="Paperfly API Key"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Sender / Pickup Store Information */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h5 className="font-bold text-stone-800">পার্সেল পিকআপ ও প্রেরক ঠিকানা (Sender Info)</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">দোকান/প্রেরকের নাম</label>
                  <input
                    type="text"
                    value={courierForm.senderName}
                    onChange={(e) => setCourierForm({ ...courierForm, senderName: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">প্রেরকের ফোন</label>
                  <input
                    type="text"
                    value={courierForm.senderPhone}
                    onChange={(e) => setCourierForm({ ...courierForm, senderPhone: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">পিকআপ ঠিকানা</label>
                  <input
                    type="text"
                    value={courierForm.senderAddress}
                    onChange={(e) => setCourierForm({ ...courierForm, senderAddress: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCourierConfig}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>কুরিয়ার সেটিংস সেভ করুন (Save Courier Settings)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 17. Payment Gateways */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                পেমেন্ট মেথড ও বিকাশ, নগদ, রকেট, উপায় একাউন্ট সেটিংস
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                মোবাইল ব্যাংকিং নম্বর, নির্দেশনাসমূহ পরিবর্তন করুন এবং সেভ করুন
              </p>
            </div>
            <button
              type="button"
              onClick={handleSavePaymentConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেভ করুন</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* COD toggle */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="font-bold text-stone-900 block">ক্যাশ অন ডেলিভারি (COD)</span>
                <span className="text-[11px] text-stone-500">গ্রাহক পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা পরিশোধ করবেন</span>
              </div>
              <input
                type="checkbox"
                checked={paymentForm.enableCod}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, enableCod: e.target.checked })
                }
                className="w-4 h-4 text-amber-600 cursor-pointer"
              />
            </div>

            {/* bKash */}
            <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                  bKash (বিকাশ) পেমেন্ট
                </span>
                <input
                  type="checkbox"
                  checked={paymentForm.enableBkash}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, enableBkash: e.target.checked })
                  }
                  className="w-4 h-4 text-pink-600 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">বিকাশ মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={paymentForm.bkashNumber}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, bkashNumber: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">বিকাশ নির্দেশনা</label>
                  <input
                    type="text"
                    value={paymentForm.instructions?.bkash || ''}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        instructions: { ...paymentForm.instructions, bkash: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Nagad */}
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  Nagad (নগদ) পেমেন্ট
                </span>
                <input
                  type="checkbox"
                  checked={paymentForm.enableNagad}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, enableNagad: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">নগদ মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={paymentForm.nagadNumber}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, nagadNumber: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">নগদ নির্দেশনা</label>
                  <input
                    type="text"
                    value={paymentForm.instructions?.nagad || ''}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        instructions: { ...paymentForm.instructions, nagad: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Rocket (রকেট) */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  Rocket (রকেট) পেমেন্ট
                </span>
                <input
                  type="checkbox"
                  checked={paymentForm.enableRocket ?? true}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, enableRocket: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">রকেট মোবাইল নম্বর (১২ ডিজিট)</label>
                  <input
                    type="text"
                    value={paymentForm.rocketNumber || '01712-345678-9'}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, rocketNumber: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">রকেট নির্দেশনা</label>
                  <input
                    type="text"
                    value={paymentForm.instructions?.rocket || 'রকেট নম্বরে Send Money করুন ও ট্রানজেকশন আইডি দিন'}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        instructions: { ...paymentForm.instructions, rocket: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Upay (উপায়) */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Upay (উপায়) পেমেন্ট
                </span>
                <input
                  type="checkbox"
                  checked={paymentForm.enableUpay ?? true}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, enableUpay: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">উপায় মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={paymentForm.upayNumber || '01712-345678'}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, upayNumber: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">উপায় নির্দেশনা</label>
                  <input
                    type="text"
                    value={paymentForm.instructions?.upay || 'উপায় পারসোনাল নম্বরে সেন্ড মানি বা ক্যাশ ইন করুন'}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        instructions: { ...paymentForm.instructions, upay: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SSLCommerz */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="font-bold text-stone-900 block">অনলাইন কার্ড / গেটওয়ে (SSLCommerz)</span>
                <span className="text-[11px] text-stone-500">ভিসা, মাস্টারকার্ড ও অনলাইন ব্যাংকিং</span>
              </div>
              <input
                type="checkbox"
                checked={paymentForm.enableSslCommerz}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, enableSslCommerz: e.target.checked })
                }
                className="w-4 h-4 text-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-3 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={handleSavePaymentConfig}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>পেমেন্ট সেটিংস সেভ করুন (Save Payment Settings)</span>
            </button>
          </div>
        </div>
      )}

      {/* 20. Product Details Page Settings */}
      {activeTab === 'pdp' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-xl space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm">
              প্রোডাক্ট পেজ ডিসপ্লে কন্ট্রোল (PDP Settings)
            </h3>
            <p className="text-xs text-stone-500">
              প্রোডাক্ট পেজে কি কি ফিচার দেখানো হবে তা এখান থেকে ঠিক করুন
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">পণ্য পেজে SKU কোড প্রদর্শন করুন</span>
              <input
                type="checkbox"
                checked={productPageSettings.showSku}
                onChange={(e) =>
                  updateProductPageSettings({
                    ...productPageSettings,
                    showSku: e.target.checked,
                  })
                }
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">মজুত/স্টক সংখ্যা গ্রাহকদের দেখান</span>
              <input
                type="checkbox"
                checked={productPageSettings.showStockCount}
                onChange={(e) =>
                  updateProductPageSettings({
                    ...productPageSettings,
                    showStockCount: e.target.checked,
                  })
                }
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">
                ফেসবুক পোস্টের জন্য "Copy Product Link" বাটন দেখান
              </span>
              <input
                type="checkbox"
                checked={productPageSettings.showShareButton}
                onChange={(e) =>
                  updateProductPageSettings({
                    ...productPageSettings,
                    showShareButton: e.target.checked,
                  })
                }
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <span className="font-bold text-stone-800">সাইজ গাইড ও হাতের মাপের ট্যাব দেখান</span>
              <input
                type="checkbox"
                checked={productPageSettings.showSizeGuide}
                onChange={(e) =>
                  updateProductPageSettings({
                    ...productPageSettings,
                    showSizeGuide: e.target.checked,
                  })
                }
              />
            </label>
          </div>
        </div>
      )}

      {/* 19. Invoice Terms & Text Customizer */}
      {activeTab === 'invoice' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-stone-900">
                  ইনভয়েস টেক্সট, শর্তাবলী ও নিয়মাবলী এডিটর (Invoice Editor)
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                গ্রাহক অর্ডার করার পর ইনভয়েসে যেসকল লেখা, শর্তাবলী, পরামর্শ ও ফুটার টেক্সট দেখতে পান তা এখান থেকে ইচ্ছামতো যোগ, এডিট বা ডিলিট করুন।
              </p>
            </div>
            <button
              onClick={handleSaveInvoiceConfig}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>ইনভয়েস সেটিংস সেভ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Header Information */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
                  ১. ইনভয়েস হেডার ও টাইটেল
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">ব্র্যান্ড নাম / টাইটেল</label>
                    <input
                      type="text"
                      value={invoiceForm.headerTitle}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, headerTitle: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">সাব-টাইটেল / স্লোগান</label>
                    <input
                      type="text"
                      value={invoiceForm.headerSubtitle}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, headerSubtitle: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <label className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 cursor-pointer">
                  <div className="text-xs">
                    <span className="font-bold text-stone-900">ইনভয়েসে পণ্যের ছবি (Product Image) প্রদর্শন করুন</span>
                    <p className="text-[11px] text-stone-600">অন থাকলে গ্রাহক ইনভয়েসে প্রতিটি পণ্যের ছবি দেখতে পাবেন</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={invoiceForm.showProductImage !== false}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, showProductImage: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </label>
              </div>

              {/* 2. Terms & Conditions (Add, Edit, Delete) */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                    ২. পরামর্শ ও শর্তাবলী (পয়েন্ট আকারে প্রদর্শন)
                  </h4>
                  <span className="text-[11px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full">
                    {invoiceForm.terms?.length || 0} টি শর্ত সক্রিয়
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 text-xs">শর্তাবলীর হেডিং / শিরোনাম</label>
                  <input
                    type="text"
                    value={invoiceForm.termsTitle}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, termsTitle: e.target.value })}
                    placeholder="পরামর্শ ও শর্তাবলী:"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:bg-white"
                  />
                </div>

                {/* List of Editable Terms with Delete */}
                <div className="space-y-2.5">
                  <label className="block font-bold text-stone-700 text-xs">বিদ্যমান শর্ত ও পরামর্শসমূহ (সরাসরি এডিট করুন):</label>
                  {invoiceForm.terms && invoiceForm.terms.length > 0 ? (
                    invoiceForm.terms.map((term, idx) => (
                      <div key={term.id} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 group">
                        <span className="text-xs font-bold text-stone-500 w-5 text-center">{idx + 1}.</span>
                        <input
                          type="text"
                          value={term.text}
                          onChange={(e) => handleUpdateInvoiceTerm(term.id, e.target.value)}
                          className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoiceTerm(term.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="এই শর্তটি মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic py-2">কোনো শর্ত যোগ করা নেই। নিচের ফর্ম থেকে নতুন শর্ত যোগ করুন।</p>
                  )}
                </div>

                {/* Add New Term Input */}
                <div className="pt-2 border-t border-stone-100 flex gap-2">
                  <input
                    type="text"
                    value={newTermText}
                    onChange={(e) => setNewTermText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInvoiceTerm();
                      }
                    }}
                    placeholder="নতুন শর্ত বা নিয়ম লিখুন (যেমন: ছেঁড়া বা ত্রুটিযুক্ত পণ্য ডেলিভারিম্যান থাকতে পরিবর্তনযোগ্য)..."
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddInvoiceTerm}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* 3. Footer & Authority Signatures */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
                  ৩. ফুটার বার্তা ও অনুমোদিত স্বাক্ষরকারী
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">কাস্টমার সার্ভিস / সিস্টেম নোট</label>
                    <input
                      type="text"
                      value={invoiceForm.customerServiceNote}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerServiceNote: e.target.value })}
                      placeholder="বস্ত্র শৈলী (BOSTROSHOILY) ডিজিটাল ইনভয়েস সিস্টেম"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">ধন্যবাদ বার্তা (Footer Note)</label>
                    <input
                      type="text"
                      value={invoiceForm.footerNote}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, footerNote: e.target.value })}
                      placeholder="আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">স্বাক্ষরকারীর নাম বা সিল</label>
                    <input
                      type="text"
                      value={invoiceForm.authorityName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, authorityName: e.target.value })}
                      placeholder="Authorized Signature"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">কর্তৃপক্ষের পদবী / নাম</label>
                    <input
                      type="text"
                      value={invoiceForm.authoritySignatureTitle}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, authoritySignatureTitle: e.target.value })}
                      placeholder="BOSTROSHOILY Authority"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveInvoiceConfig}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>সকল ইনভয়েস তথ্য সেভ করুন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Realistic Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 bg-white p-5 rounded-2xl border-2 border-stone-300 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    লাইভ ইনভয়েস প্রিভিউ
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">Sample Invoice</span>
                </div>

                {/* Sample Invoice Mock Card */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                    <div>
                      <h5 className="font-black text-sm text-stone-900">{invoiceForm.headerTitle || 'BOSTROSHOILY'}</h5>
                      <p className="text-[10px] text-stone-500">{invoiceForm.headerSubtitle || 'ঐতিহ্যবাহী পোশাক ও তাঁত পণ্য'}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-stone-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                        #ORD-2026
                      </span>
                    </div>
                  </div>

                  {/* Sample Item Row */}
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200 flex items-center gap-2.5">
                    {invoiceForm.showProductImage !== false && (
                      <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-amber-700" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-xs truncate">সিরাজগঞ্জ প্রিমিয়াম সুতি লুঙ্গি</p>
                      <p className="text-[10px] text-stone-500">স্ট্যান্ডার্ড বহর • কোড: BS-LUN-01</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900 text-xs">৳৭৫০</p>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">অফার ছাড়</span>
                    </div>
                  </div>

                  {/* Live Dynamic Terms */}
                  <div className="pt-2 border-t border-stone-200">
                    <p className="font-bold text-stone-800 text-[11px] mb-1">
                      {invoiceForm.termsTitle || 'পরামর্শ ও শর্তাবলী:'}
                    </p>
                    <div className="space-y-1 text-[10px] text-stone-600">
                      {invoiceForm.terms && invoiceForm.terms.length > 0 ? (
                        invoiceForm.terms.map((t) => <p key={t.id}>• {t.text}</p>)
                      ) : (
                        <p className="italic text-stone-400">• কোনো শর্তাবলী নির্ধারণ করা নেই</p>
                      )}
                    </div>
                  </div>

                  {/* Footer Live Preview */}
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-end text-[10px] text-stone-500">
                    <div>
                      <p className="font-medium text-stone-700">{invoiceForm.customerServiceNote}</p>
                      <p className="text-[9px]">{invoiceForm.footerNote}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif italic text-stone-800 text-[11px]">{invoiceForm.authorityName}</p>
                      <p className="text-[9px] font-bold text-stone-900 border-t border-stone-400 pt-0.5">
                        {invoiceForm.authoritySignatureTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
