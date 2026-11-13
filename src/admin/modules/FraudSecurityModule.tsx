import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminApi';
import { useShop } from '../../context/ShopContext';
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  RefreshCw,
  Lock,
  Phone,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface BlacklistItem {
  id: string;
  type: 'phone' | 'ip' | 'email';
  value: string;
  reason: string;
  risk_score: number;
  blocked_attempts: number;
  status: string;
  created_at: string;
}

export const FraudSecurityModule: React.FC = () => {
  const { showToast } = useShop();
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'phone',
    value: '',
    reason: '',
    riskScore: 90,
  });

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/security/blacklist');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setBlacklist(data.items);
      }
    } catch {
      showToast('ব্ল্যাকলিস্ট তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.value || !newEntry.reason) {
      showToast('সবগুলো ঘর পূরণ করুন');
      return;
    }
    try {
      const res = await adminFetch('/api/admin/security/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      const data = await res.json();
      if (data.success) {
        showToast('সফলভাবে ব্ল্যাকলিস্টে যুক্ত করা হয়েছে');
        setShowAddModal(false);
        setNewEntry({ type: 'phone', value: '', reason: '', riskScore: 90 });
        fetchBlacklist();
      } else {
        showToast(data.error || 'যুক্ত করতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ব্ল্যাকলিস্ট এন্ট্রিটি মুছে ফেলতে চান?')) return;
    try {
      const res = await adminFetch(`/api/admin/security/blacklist/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('ব্ল্যাকলিস্ট থেকে মুছে ফেলা হয়েছে');
        setBlacklist((prev) => prev.filter((item) => item.id !== id));
      } else {
        showToast(data.error || 'মুছতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const filteredItems = blacklist.filter(
    (item) =>
      item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>ফ্রড প্রতিরোধ ও নিরাপত্তা ব্যবস্থাপনা (Fraud &amp; Security)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ফেক অর্ডার শনাক্তকরণ, সন্দেহজনক মোবাইল/আইপি ব্ল্যাকলিস্ট ও ব্রুট-ফোর্স প্রতিরোধ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBlacklist}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>ব্ল্যাকলিস্টে যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold">নিরাপত্তা প্রতিরক্ষা ঢাল</p>
            <p className="text-lg font-black text-emerald-700">সক্রিয় (Active 24/7)</p>
            <p className="text-[11px] text-stone-400">CSRF + ১৫-মিনিট ব্রুট-ফোর্স লক</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold">ব্লক করা ফেক কাস্টমার/IP</p>
            <p className="text-xl font-black font-mono text-stone-900">{blacklist.length} টি</p>
            <p className="text-[11px] text-stone-400">সরাসরি চেকআউট ও লগইন প্রতিরোধ</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold">স্বয়ংক্রিয় ফেক অর্ডার স্কোরিং</p>
            <p className="text-lg font-black text-amber-700">রিস্ক স্কোর ফিল্টারিং</p>
            <p className="text-[11px] text-stone-400">অস্বাভাবিক ঠিকানার ক্ষেত্রে সতর্কবার্তা</p>
          </div>
        </div>
      </div>

      {/* Blacklist Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>ব্ল্যাকলিস্টে থাকা ফোন ও আইপি তালিকা ({blacklist.length})</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নম্বর বা আইপি খুঁজুন..."
              className="w-full px-3.5 py-1.5 pl-9 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">কোনো ব্ল্যাকলিস্ট এন্ট্রি পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">ধরন</th>
                  <th className="py-2.5 px-3">নম্বর / আইপি অ্যাড্রেস</th>
                  <th className="py-2.5 px-3">ব্লকের কারণ</th>
                  <th className="py-2.5 px-3">রিস্ক স্কোর</th>
                  <th className="py-2.5 px-3">প্রতিরোধকৃত চেষ্টা</th>
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        {item.type === 'phone' ? <Phone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{item.value}</td>
                    <td className="py-3 px-3 text-stone-700">{item.reason}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        {item.risk_score || 90}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">{item.blocked_attempts} বার</td>
                    <td className="py-3 px-3 text-stone-500 text-[11px]">{new Date(item.created_at).toLocaleDateString('bn-BD')}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="ব্ল্যাকলিস্ট থেকে মুছে দিন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>নতুন ব্ল্যাকলিস্ট যুক্ত করুন</span>
            </h3>

            <form onSubmit={handleAddBlacklist} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ব্লক টাইপ</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                >
                  <option value="phone">মোবাইল নম্বর (Phone)</option>
                  <option value="ip">আইপি অ্যাড্রেস (IP)</option>
                  <option value="email">ইমেইল (Email)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">নম্বর বা আইপি</label>
                <input
                  type="text"
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  placeholder={newEntry.type === 'phone' ? '01712345678' : '192.168.1.1'}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ব্লক করার কারণ</label>
                <input
                  type="text"
                  value={newEntry.reason}
                  onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                  placeholder="যেমন: ফেক অর্ডার করে পার্সেল রিসিভ করে না"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
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
