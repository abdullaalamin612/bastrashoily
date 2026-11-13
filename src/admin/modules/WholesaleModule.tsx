import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Filter, Phone, Mail, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const WholesaleModule: React.FC = () => {
  const { showToast } = useShop();
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'customers' | 'pricing'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample real data
  const [wholesaleCustomers, setWholesaleCustomers] = useState([
    {
      id: 'wc-1',
      businessName: 'আমান ট্রেডার্স',
      contactPerson: 'মোহাম্মদ আমানুল্লাহ',
      phone: '01712000111',
      email: 'aman.traders@gmail.com',
      district: 'সিরাজগঞ্জ',
      address: 'নিউ মার্কেট, সিরাজগঞ্জ সদর',
      creditLimit: 100000,
      discountRate: 20,
      status: 'active',
      totalOrders: 6,
      totalPurchases: 285000,
    },
    {
      id: 'wc-2',
      businessName: 'বস্ত্র মেলা শোরুম',
      contactPerson: 'ফারুক হোসেন',
      phone: '01819222333',
      email: 'bastramela.ctg@yahoo.com',
      district: 'চট্টগ্রাম',
      address: 'তেরীবাজার, কোতোয়ালী, চট্টগ্রাম',
      creditLimit: 150000,
      discountRate: 25,
      status: 'active',
      totalOrders: 4,
      totalPurchases: 420000,
    },
    {
      id: 'wc-3',
      businessName: 'রংধনু ফ্যাশন পয়েন্ট',
      contactPerson: 'সোহেল রানা',
      phone: '01915666777',
      email: 'rongdhonu.bogura@gmail.com',
      district: 'বগুড়া',
      address: 'রেলওয়ে মার্কেট, বগুড়া',
      creditLimit: 75000,
      discountRate: 18,
      status: 'active',
      totalOrders: 3,
      totalPurchases: 195000,
    },
  ]);

  const [wholesaleOrders, setWholesaleOrders] = useState([
    {
      id: 'WO-801',
      businessName: 'আমান ট্রেডার্স',
      contactPerson: 'মোহাম্মদ আমানুল্লাহ',
      phone: '01712000111',
      itemsCount: 50,
      itemsDescription: '৫০ পিস সিরাজগঞ্জ সুতি তাঁতের লুঙ্গি (মিক্সড কালার)',
      totalAmount: 34000,
      paymentTerms: '১৫ দিন (Credit)',
      status: 'delivered',
      date: '২০২৬-০৯-০৫',
    },
    {
      id: 'WO-802',
      businessName: 'বস্ত্র মেলা শোরুম',
      contactPerson: 'ফারুক হোসেন',
      phone: '01819222333',
      itemsCount: 30,
      itemsDescription: '৩০ পিস রয়্যাল সেমি সিল্ক এমব্রয়ডারি পাঞ্জাবি (সাইজ ৪০, ৪২, ৪৪)',
      totalAmount: 48375,
      paymentTerms: 'নগদ / ব্যাংক ট্রান্সফার',
      status: 'processing',
      date: '২০২৬-০৯-০৯',
    },
    {
      id: 'WO-803',
      businessName: 'রংধনু ফ্যাশন পয়েন্ট',
      contactPerson: 'সোহেল রানা',
      phone: '01915666777',
      itemsCount: 20,
      itemsDescription: '২০ পিস ঐতিহ্যবাহী ঢাকাই জামদানি তাঁতের শাড়ি',
      totalAmount: 61600,
      paymentTerms: '৩০ দিন (Credit)',
      status: 'pending',
      date: '২০২৬-০৯-১১',
    },
  ]);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    district: 'Dhaka',
    address: '',
    creditLimit: 50000,
    discountRate: 20,
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.businessName || !newCustomer.phone) {
      showToast('প্রতিষ্ঠানের নাম এবং মোবাইল নম্বর আবশ্যক');
      return;
    }
    const created = {
      ...newCustomer,
      id: `wc-${Date.now()}`,
      status: 'active',
      totalOrders: 0,
      totalPurchases: 0,
    };
    setWholesaleCustomers([created, ...wholesaleCustomers]);
    setIsCustomerModalOpen(false);
    showToast(`পাইকারি ক্রেতা '${newCustomer.businessName}' সফলভাবে তালিকাভুক্ত হয়েছে!`);
    setNewCustomer({
      businessName: '',
      contactPerson: '',
      phone: '',
      email: '',
      district: 'Dhaka',
      address: '',
      creditLimit: 50000,
      discountRate: 20,
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setWholesaleOrders(wholesaleOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`পাইকারি অর্ডার #${orderId} স্ট্যাটাস '${newStatus}' করা হয়েছে।`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Building2 className="w-5 h-5 text-amber-700" />
            <h1>হোলসেল ও বাল্ক অর্ডার ম্যানেজমেন্ট (Wholesale B2B)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            তাঁত পল্লীর শোরুম ও খুচরা ব্যবসায়ীদের বাল্ক সাপ্লাই, ক্রেডিট লিমিট ও অর্ডার ট্র্যাকিং।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'customers' && (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন হোলসেলার যোগ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-5 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'orders' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          পাইকারি অর্ডার সমূহ ({wholesaleOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('customers')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'customers' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          হোলসেলার তালিকা ({wholesaleCustomers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'pricing' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          বাল্ক ডিসকাউন্ট পলিসি ও টিয়ার
        </button>
      </div>

      {/* Sub-Tab 1: Orders */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-b-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase font-medium tracking-wider">
                <tr>
                  <th className="py-3 px-4">অর্ডার আইডি</th>
                  <th className="py-3 px-4">হোলসেলার / শোরুম</th>
                  <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                  <th className="py-3 px-4 text-right">মোট টাকা</th>
                  <th className="py-3 px-4">পেমেন্ট টার্মস</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {wholesaleOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">{ord.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{ord.businessName}</div>
                      <div className="text-stone-500 text-[11px]">{ord.contactPerson} ({ord.phone})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">{ord.itemsCount} পিস</div>
                      <div className="text-stone-500 text-[11px] line-clamp-1">{ord.itemsDescription}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                      ৳{ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {ord.paymentTerms}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        ord.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {ord.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'processing')}
                          className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700"
                        >
                          প্রসেস শুরু
                        </button>
                      )}
                      {ord.status === 'processing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                        >
                          ডেলিভারি সম্পন্ন
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

      {/* Sub-Tab 2: Customers */}
      {activeSubTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wholesaleCustomers.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{c.businessName}</h3>
                  <p className="text-xs text-stone-500">{c.contactPerson}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {c.discountRate}% বাল্ক ডিসকাউন্ট
                </span>
              </div>

              <div className="text-xs text-stone-600 space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{c.address}, {c.district}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">ক্রেডিট লিমিট</span>
                  <span className="font-bold text-stone-800">৳{c.creditLimit.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px]">মোট কেনাকাটা</span>
                  <span className="font-bold text-emerald-700">৳{c.totalPurchases.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 3: Bulk Pricing Policy */}
      {activeSubTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
          <h2 className="font-bold text-stone-900 text-sm">পাইকারি ও বাল্ক অর্ডার ডিসকাউন্ট স্ল্যাব (টায়ার পলিসি)</h2>
          <p className="text-xs text-stone-500">
            নির্দিষ্ট কোয়ান্টিটি কিনলে স্বয়ংক্রিয়ভাবে পাইকারি রেট প্রযোজ্য হবে:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <div className="font-bold text-stone-900 text-sm">টিয়ার ১ (ছোট শোরুম)</div>
              <div className="text-xs text-stone-500 mt-1">ন্যূনতম ২০ - ৪৯ পিস</div>
              <div className="text-2xl font-black text-amber-800 mt-3">১৫% ছাড়</div>
              <p className="text-[11px] text-stone-600 mt-2">লুঙ্গি, পাঞ্জাবি ও শাড়ির যেকোনো মিক্সড ভ্যারিয়েন্ট।</p>
            </div>

            <div className="p-4 rounded-xl border-2 border-amber-600 bg-amber-50/50">
              <div className="font-bold text-amber-900 text-sm">টিয়ার ২ (মাঝারি ডিলার)</div>
              <div className="text-xs text-amber-700 mt-1">৫০ - ৯৯ পিস</div>
              <div className="text-2xl font-black text-amber-800 mt-3">২০% ছাড়</div>
              <p className="text-[11px] text-stone-600 mt-2">ফ্রি হোম ডেলিভারি ও ১৫ দিনের ক্রেডিট সুবিধা।</p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <div className="font-bold text-stone-900 text-sm">টিয়ার ৩ (বড় ডিস্ট্রিবিউটর)</div>
              <div className="text-xs text-stone-500 mt-1">১০০+ পিস</div>
              <div className="text-2xl font-black text-stone-900 mt-3">২৫% ছাড়</div>
              <p className="text-[11px] text-stone-600 mt-2">এক্সক্লুসিভ প্যাকেজিং, কাস্টম ট্যাগিং ও ৩০ দিনের ক্রেডিট।</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">নতুন হোলসেলার তালিকাভুক্তি</h2>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.businessName || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                  placeholder="যেমন: পাবনা তাঁত ঘর"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">যোগাযোগকারী ব্যক্তি</label>
                  <input
                    type="text"
                    value={newCustomer.contactPerson || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                    placeholder="নাম"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={newCustomer.phone || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ক্রেডিট লিমিট (টাকা)</label>
                  <input
                    type="number"
                    value={newCustomer.creditLimit ?? 0}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">হোলসেল ডিসকাউন্ট (%)</label>
                  <input
                    type="number"
                    value={newCustomer.discountRate ?? 0}
                    onChange={(e) => setNewCustomer({ ...newCustomer, discountRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ঠিকানা ও মার্কেট</label>
                <textarea
                  rows={2}
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="মার্কেট বা দোকান নম্বর ও জেলা"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-xs cursor-pointer"
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
