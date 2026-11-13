import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { AdminStaff, AdminRole, GeneralSettings } from '../../types';
import { removeImageBackground } from '../../utils/imageUtils';
import { FooterManagementModule } from './FooterManagementModule';
import { adminFetch } from '../adminApi';
import {
  Shield,
  Settings,
  History,
  BarChart3,
  Database,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Users,
  Building,
  Phone,
  Mail,
  Share2,
  Wand2,
  Save,
  Link as LinkIcon,
} from 'lucide-react';

interface AdminStaffSystemModuleProps {
  initialTab?: 'settings' | 'footer' | 'staff' | 'audit' | 'analytics' | 'backup';
}

export const AdminStaffSystemModule: React.FC<AdminStaffSystemModuleProps> = ({ initialTab = 'settings' }) => {
  const {
    generalSettings,
    updateGeneralSettings,
    adminStaff,
    addAdminStaff,
    updateAdminStaff,
    deleteAdminStaff,
    auditLogs,
    products,
    orders,
    exportFullDatabase,
    importFullDatabase,
    syncFromDatabase,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'settings' | 'footer' | 'staff' | 'audit' | 'analytics' | 'backup'>(
    initialTab
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);

  // Dedicated Form State for 23. General Settings & Logo to allow editing any text and saving
  const [settingsForm, setSettingsForm] = useState<GeneralSettings>(generalSettings);

  useEffect(() => {
    setSettingsForm(generalSettings);
  }, [generalSettings]);

  const handleSaveGeneralSettings = () => {
    updateGeneralSettings(settingsForm);
  };

  // New staff form state
  const [newStaff, setNewStaff] = useState<Partial<AdminStaff>>({
    name: '',
    email: '',
    role: 'order_manager',
    status: 'active',
  });
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    addAdminStaff({
      ...newStaff,
      permissions:
        newStaff.role === 'order_manager'
          ? ['manage_orders']
          : newStaff.role === 'inventory_manager'
          ? ['manage_inventory', 'manage_products']
          : ['manage_products', 'manage_orders', 'manage_inventory', 'manage_settings'],
    } as AdminStaff);
    setShowAddStaff(false);
    setNewStaff({ name: '', email: '', role: 'order_manager', status: 'active' });
  };

  const handleBackupDownload = () => {
    const jsonStr = exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bastra_shoily_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('সম্পূর্ণ ওয়েবসাইটের ব্যাকআপ JSON ফাইল ডাউনলোড সম্পন্ন হয়েছে।');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importFullDatabase(content);
      if (success) {
        showToast('ডাটা সফলভাবে রিস্টোর হয়েছে!');
      } else {
        showToast('ফাইলটি সঠিক JSON ফরম্যাটে নেই।');
      }
    };
    reader.readAsText(file);
  };

  // 25. Analytics calculations
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Category sales breakdown
  const catSales: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      catSales[item.productName] = (catSales[item.productName] || 0) + item.price * item.quantity;
    });
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            এডমিন সিস্টেম ও সাধারণ সেটিংস (Settings & System Administration)
          </h2>
          <p className="text-xs text-stone-500">
            সাইট লোগো, যোগাযোগ ঠিকানা, স্টাফ পারমিশন, অডিট লগ, সেলস রিপোর্ট ও ডাটা ব্যাকআপ
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'settings', label: '২৩. সাধারণ সেটিংস ও লোগো' },
          { id: 'footer', label: '২৭. ফুটার কন্ট্রোল (লিংক, পলিসি ও সোশ্যাল আইকন)' },
          { id: 'staff', label: '২২. এডমিন ও স্টাফ রোল' },
          { id: 'analytics', label: '২৫. রিপোর্ট ও এনালাইটিক্স' },
          { id: 'audit', label: '২৪. অডিট ও অ্যাক্টিভিটি লগ' },
          { id: 'backup', label: '২৬. ব্যাকআপ ও রিস্টোর' },
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

      {/* 27. Footer Management */}
      {activeTab === 'footer' && <FooterManagementModule />}

      {/* 23. General Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">ওয়েবসাইট ও ব্র্যান্ড সেটিংস</h3>
              <p className="text-xs text-stone-500">লোগো, ট্যাগলাইন, হটলাইন ও ফেসবুক পেজ লিংক</p>
            </div>
            <button
              type="button"
              onClick={handleSaveGeneralSettings}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>সেভ করুন</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">ওয়েবসাইট নাম</label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, siteName: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ট্যাগলাইন (Tagline)</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, tagline: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-serif text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">কাস্টমার সাপোর্ট ফোন নম্বর</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, phone: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">সাপোর্ট ইমেইল</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, email: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">অফিস ও শোরুমের ঠিকানা</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, address: e.target.value })
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Facebook Page URL</label>
                <input
                  type="text"
                  value={settingsForm.facebookUrl}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-[11px] text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settingsForm.instagramUrl}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-[11px] text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">WhatsApp নম্বর</label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-900"
                />
              </div>
            </div>

            {/* Store Logo Management */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-stone-800 text-xs">স্টোর ব্র্যান্ড লোগো (Store Logo)</label>
                  <p className="text-[11px] text-stone-500">গ্যালারি/ডিভাইস থেকে লোগো আপলোড করুন বা ইমেজ লিঙ্ক দিন</p>
                </div>
                {settingsForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm({ ...settingsForm, logoUrl: '' });
                      showToast('ডিফল্ট লোগোতে রিস্টোর করা হয়েছে');
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    ডিফল্ট লোগো ব্যবহার করুন
                  </button>
                )}
              </div>

              {/* Upload from Gallery / Device */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isProcessingLogo ? 'প্রসেসিং হচ্ছে...' : 'ডিভাইস / গ্যালারি থেকে লোগো আপলোড'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isProcessingLogo}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsProcessingLogo(true);
                      const reader = new FileReader();
                      reader.onload = async (uploadEvt) => {
                        const rawDataUrl = uploadEvt.target?.result as string;
                        if (rawDataUrl) {
                          try {
                            // Auto remove background for clean transparent placement
                            const transparentLogo = await removeImageBackground(rawDataUrl);
                            setSettingsForm((prev) => ({ ...prev, logoUrl: transparentLogo }));
                            showToast('নতুন লোগোর ব্যাকগ্রাউন্ড রিমুভ করে যুক্ত করা হয়েছে! সেভ করতে "সেভ করুন" চাপুন।');
                          } catch {
                            setSettingsForm((prev) => ({ ...prev, logoUrl: rawDataUrl }));
                            showToast('নতুন লোগো যুক্ত হয়েছে! সেভ করতে "সেভ করুন" চাপুন।');
                          } finally {
                            setIsProcessingLogo(false);
                          }
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {settingsForm.logoUrl && (
                  <button
                    type="button"
                    disabled={isProcessingLogo}
                    onClick={async () => {
                      if (!settingsForm.logoUrl) return;
                      setIsProcessingLogo(true);
                      try {
                        const transparentLogo = await removeImageBackground(settingsForm.logoUrl);
                        setSettingsForm((prev) => ({ ...prev, logoUrl: transparentLogo }));
                        showToast('লোগোর ব্যাকগ্রাউন্ড রিমুভ করা হয়েছে!');
                      } catch {
                        showToast('ব্যাকগ্রাউন্ড রিমুভ করা যায়নি');
                      } finally {
                        setIsProcessingLogo(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>অটো ব্যাকগ্রাউন্ড রিমুভ করুন</span>
                  </button>
                )}
                <span className="text-[11px] text-stone-400">অথবা সরাসরি লিঙ্ক দিন:</span>
              </div>

              {/* Direct Image URL input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/your-brand-logo.png"
                  value={settingsForm.logoUrl}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, logoUrl: e.target.value })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 font-mono text-xs text-stone-900"
                />
              </div>

              {/* Real-time Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white border border-stone-200 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase mb-2">লাইট ব্যাকগ্রাউন্ডে প্রিভিউ</span>
                  <div className="h-14 flex items-center justify-center">
                    <img
                      src={settingsForm.logoUrl || '/bastra-shoily-logo.svg'}
                      alt="Light Logo Preview"
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-[10px] text-stone-400 font-bold uppercase mb-2">ডার্ক ব্যাকগ্রাউন্ডে প্রিভিউ</span>
                  <div className="h-14 flex items-center justify-center">
                    <img
                      src={settingsForm.logoUrl || '/bastra-shoily-logo-light.svg'}
                      alt="Dark Logo Preview"
                      className="max-h-12 max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Button */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveGeneralSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>সব সেটিংস সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 22. Admin Staff & Role */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-800">
              এডমিন ও স্টাফ তালিকা ({adminStaff.length} জন)
            </span>
            <button
              onClick={() => setShowAddStaff(!showAddStaff)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন স্টাফ যুক্ত করুন</span>
            </button>
          </div>

          {showAddStaff && (
            <form
              onSubmit={handleCreateStaff}
              className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3 text-xs animate-in fade-in"
            >
              <h4 className="font-bold text-stone-900 text-sm">নতুন এডমিন কর্মকর্তা তথ্য</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">নাম</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পদবী ও ভূমিকা (Role)</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as AdminRole })}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold"
                  >
                    <option value="admin">Admin (ফুল এক্সেস)</option>
                    <option value="order_manager">Order Manager (অর্ডার কন্ট্রোল)</option>
                    <option value="inventory_manager">Inventory Manager (স্টক কন্ট্রোল)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="px-3 py-1.5 bg-stone-200 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-lg"
                >
                  স্টাফ সংরক্ষণ
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold uppercase text-stone-600">
                <tr>
                  <th className="p-3">কর্মকর্তা</th>
                  <th className="p-3">ইমেইল</th>
                  <th className="p-3">রোল (Role)</th>
                  <th className="p-3">পারমিশন</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {adminStaff.map((st) => (
                  <tr key={st.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">{st.name}</td>
                    <td className="p-3 font-mono text-stone-600">{st.email}</td>
                    <td className="p-3 font-bold uppercase text-amber-800">{st.role}</td>
                    <td className="p-3 text-[10px] text-stone-500">
                      {st.permissions.join(', ') || 'All'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {st.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {st.role !== 'super_admin' && (
                        <button
                          onClick={() => deleteAdminStaff(st.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 25. Reports & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase">মোট বিক্রয় (Total Revenue)</span>
              <h3 className="text-2xl font-black text-amber-900 mt-2">৳{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase">মোট সফল ডেলিভারি</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-2">
                {orders.filter((o) => o.orderStatus === 'delivered').length} টি
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase">গড় অর্ডার মূল্য (AOV)</span>
              <h3 className="text-2xl font-black text-stone-900 mt-2">
                ৳{orders.length ? Math.round(totalRevenue / orders.length) : 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">
              সর্বাধিক বিক্রিত পণ্য ও রেভিনিউ র‍্যাংকিং (Top Selling Products)
            </h3>
            <div className="space-y-3 text-xs">
              {Object.entries(catSales).map(([pName, revenue]) => {
                const pct = Math.round((revenue / (totalRevenue || 1)) * 100);
                return (
                  <div key={pName} className="space-y-1">
                    <div className="flex justify-between font-medium text-stone-800">
                      <span>{pName}</span>
                      <span className="font-bold">৳{revenue.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 24. Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm">
              অ্যাক্টিভিটি ও নিরাপত্তা লগ (Audit Trail)
            </h3>
            <p className="text-xs text-stone-500">কে কোন প্রোডাক্ট বা অর্ডারে কি পরিবর্তন করেছেন তার প্রমাণ</p>
          </div>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-900">{log.action}</span>
                  <p className="text-stone-600 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-amber-900 block">{log.userName}</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 26. Backup & Restore Data */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 max-w-xl space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm">
              ডাটাবেজ ব্যাকআপ ও রিস্টোর (Database Backup & Restore)
            </h3>
            <p className="text-xs text-stone-500">
              ওয়েবসাইটের সকল প্রোডাক্ট, অর্ডার, কাস্টমার, কুপন ও সেটিংস এক ক্লিকে ডাউনলোড বা রিস্টোর করুন
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Download Backup */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900">সম্পূর্ণ সাইট ব্যাকআপ ডাউনলোড</p>
                <p className="text-[11px] text-stone-500">JSON ফরম্যাটে আপনার সব ডাটা নিরাপদে সেভ রাখুন</p>
              </div>
              <button
                onClick={handleBackupDownload}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Backup</span>
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <p className="font-bold text-stone-900">ব্যাকআপ ফাইল রিস্টোর করুন (Restore)</p>
              <p className="text-[11px] text-stone-500">পূর্বে ডাউনলোড করা JSON ফাইল নির্বাচন করুন</p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="block w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
              />
            </div>

            {/* Live Database Sync */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-emerald-900">ডাটাবেজ থেকে ডাটা সিঙ্ক করুন</p>
                <p className="text-[11px] text-emerald-700">সার্ভার ডাটাবেজ (SQLite) থেকে সর্বশেষ লাইভ ডাটা লোড করুন</p>
              </div>
              <button
                onClick={async () => {
                  await syncFromDatabase();
                  showToast('ডাটাবেজ থেকে সফলভাবে সর্বশেষ লাইভ ডাটা লোড হয়েছে!');
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync DB</span>
              </button>
            </div>

            {/* Clean Demo Catalog for Real Production Products */}
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-rose-950 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>প্রোডাকশন ক্যাটালগ ক্লিনআপ (Wipe Demo Products)</span>
                </p>
                <p className="text-[11px] text-rose-700">
                  সকল ডেমো পণ্য ও ডেমো ভ্যারিয়েন্ট মুছে ফেলুন যাতে শুধুমাত্র আপনার আসল পণ্য থাকে (ক্যাটাগরি বজায় থাকবে)।
                </p>
              </div>

              {!showWipeConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs text-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe Demo Catalog</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-rose-300 shadow-md">
                  <span className="text-[11px] font-bold text-rose-800">নিশ্চিত তো?</span>
                  <button
                    type="button"
                    disabled={isWiping}
                    onClick={async () => {
                      setIsWiping(true);
                      try {
                        const res = await adminFetch('/api/admin/catalog/clean-demo-data', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                        });
                        const data = await res.json().catch(() => ({}));
                        if (data.success) {
                          try {
                            localStorage.removeItem('bastra_product_wizard_draft');
                            sessionStorage.removeItem('bastra_admin_product_modal_open');
                            sessionStorage.removeItem('bastra_admin_product_editing_id');
                          } catch {}
                          await syncFromDatabase();
                          showToast(data.message || 'সকল ডেমো প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!');
                          setShowWipeConfirm(false);
                        } else {
                          showToast(data.error || 'ডেমো ডাটা মুছতে ব্যর্থ হয়েছে');
                        }
                      } catch (err: any) {
                        showToast('সার্ভার এরর: ডেমো ডাটা মুছতে ব্যর্থ হয়েছে');
                      } finally {
                        setIsWiping(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {isWiping ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ক্লিন করুন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWipeConfirm(false)}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer transition"
                  >
                    বাতিল
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
