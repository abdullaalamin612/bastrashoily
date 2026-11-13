import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Search, Filter, CheckCircle2, Clock, AlertCircle, RefreshCw, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface PaymentTxn {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  amount: number;
  payment_status: string;
  payment_txn_id?: string;
  order_status: string;
  created_at: string;
  updated_at: string;
}

interface PaymentSummary {
  totalCollected: number;
  pendingCod: number;
  refundedTotal: number;
  pendingCount: number;
}

export const PaymentsModule: React.FC = () => {
  const { showToast, currentAdmin } = useShop();
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'gateways'>('transactions');
  const [transactions, setTransactions] = useState<PaymentTxn[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalCollected: 0,
    pendingCod: 0,
    refundedTotal: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [inputTxnId, setInputTxnId] = useState('');
  const [inputReason, setInputReason] = useState('ম্যানুয়াল ব্যাংক/মোবাইল ব্যাংকিং স্টেটমেন্ট যাচাইপূর্বক অনুমোদিত');

  const [gatewaysList, setGatewaysList] = useState<any[]>([]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/payments');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.orders || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
      const gwRes = await adminFetch('/api/admin/payments/gateways');
      const gwData = await gwRes.json();
      if (gwData.success && gwData.gateways) {
        setGatewaysList(gwData.gateways);
      }
    } catch (err) {
      console.error('Failed to fetch payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerifyPayment = async (orderId: string) => {
    try {
      const res = await adminFetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          txnId: inputTxnId.trim() || undefined,
          reason: inputReason.trim() || 'ম্যানুয়াল ভেরিফিকেশন সম্পন্ন',
          adminName: currentAdmin?.name || 'Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'পেমেন্ট ভেরিফাই সফল হয়েছে।');
        setVerifyingOrderId(null);
        setInputTxnId('');
        fetchPayments();
      } else {
        showToast(data.error || 'পেমেন্ট ভেরিফাই ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      showToast('সার্ভার এরর: পেমেন্ট ভেরিফাই করা যায়নি।');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_phone.includes(searchQuery) ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.payment_txn_id && t.payment_txn_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : t.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <h1>পেমেন্ট ও ট্রানজেকশন অডিট (Payments & Gateways)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            ক্যাশ অন ডেলিভারি কালেকশন, বিকাশ/নগদ ট্রানজেকশন অডিট ও পেমেন্ট রিকনসিলিয়েশন।
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ ডাটা</span>
        </button>
      </div>

      {/* Real Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">মোট সংগৃহীত পেমেন্ট</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 mt-2">
            ৳{summary.totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> পরিশোধিত ট্রানজেকশন
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">বাকি COD কালেকশন</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 mt-2">
            ৳{summary.pendingCod.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
            ইন-ট্রানজিট / কুরিয়ার কালেকশন
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">পেন্ডিং ভেরিফিকেশন</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 mt-2">
            {summary.pendingCount} টি
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">
            ভেরিফাইয়ের অপেক্ষায়
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">রিফান্ডকৃত অর্থ</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-stone-900 mt-2">
            ৳{summary.refundedTotal.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            গ্রাহককে ফেরত দেওয়া
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-5 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'transactions' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ট্রানজেকশন তালিকা ({transactions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('gateways')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'gateways' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          পেমেন্ট গেটওয়ে কনফিগারেশন
        </button>
      </div>

      {/* Transactions Tab */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white rounded-b-xl border border-stone-200 overflow-hidden space-y-4">
          {/* Controls: Search & Filter */}
          <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="অর্ডার আইডি, ফোন বা TrxID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {(['all', 'paid', 'pending', 'refunded'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    statusFilter === status
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {status === 'all' && 'সকল'}
                  {status === 'paid' && 'পরিশোধিত (Paid)'}
                  {status === 'pending' && 'পেন্ডিং (Pending)'}
                  {status === 'refunded' && 'রিফান্ড (Refunded)'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">অর্ডার আইডি</th>
                  <th className="py-3 px-4">কাস্টমার ও মোবাইল</th>
                  <th className="py-3 px-4">পেমেন্ট মেথড</th>
                  <th className="py-3 px-4 text-right">টাকা</th>
                  <th className="py-3 px-4">TrxID / রেফারেন্স</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-stone-400">
                      কোনো ট্রানজেকশন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.order_id} className="hover:bg-stone-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">#{t.order_id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-800">{t.customer_name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{t.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 capitalize">
                        {t.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : t.payment_method}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-stone-900 font-mono">
                        ৳{t.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                        {t.payment_txn_id || (t.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন পেমেন্ট')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          t.payment_status === 'refunded' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.payment_status === 'paid' ? 'পরিশোধিত' : t.payment_status === 'refunded' ? 'রিফান্ডেড' : 'পেন্ডিং'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {t.payment_status === 'pending' ? (
                          verifyingOrderId === t.order_id ? (
                            <div className="flex items-center gap-1.5 justify-center">
                              <input
                                type="text"
                                placeholder="TrxID (ঐচ্ছিক)"
                                value={inputTxnId || ''}
                                onChange={(e) => setInputTxnId(e.target.value)}
                                className="w-24 text-[11px] px-1.5 py-1 border rounded"
                              />
                              <button
                                onClick={() => handleVerifyPayment(t.order_id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2 py-1 rounded font-semibold cursor-pointer"
                              >
                                কনফার্ম
                              </button>
                              <button
                                onClick={() => {
                                  setVerifyingOrderId(null);
                                  setInputTxnId('');
                                }}
                                className="text-stone-400 hover:text-stone-600 text-[11px] px-1 py-1"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setVerifyingOrderId(t.order_id)}
                              className="bg-stone-900 hover:bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded transition cursor-pointer"
                            >
                              ভেরিফাই করুন
                            </button>
                          )
                        ) : (
                          <span className="text-stone-400 text-[11px]">নিশ্চিত</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gateways Tab */}
      {activeSubTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gatewaysList.length > 0 ? (
            gatewaysList.map((gw) => (
              <div key={gw.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{gw.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      gw.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                    }`}
                  >
                    {gw.active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  {gw.description || (gw.hasApiCredentials ? 'API মোড সক্রিয়' : 'ইন্টারেক্টিভ সিমুলেশন ও ট্র্যাকিং মোড')}
                </p>
                {gw.merchantNumber && (
                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl font-mono">
                    নম্বর: {gw.merchantNumber}
                  </div>
                )}
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  মোড: {gw.mode || 'standard'} {gw.isLive ? '• LIVE' : '• TEST'}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-stone-400 text-xs">
              গেটওয়ে তথ্য লোড হচ্ছে...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
