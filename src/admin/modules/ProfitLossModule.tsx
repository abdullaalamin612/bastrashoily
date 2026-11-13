import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminApi';
import { useShop } from '../../context/ShopContext';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  Percent,
} from 'lucide-react';

export const ProfitLossModule: React.FC = () => {
  const { showToast } = useShop();
  const [metrics, setMetrics] = useState<any>({
    totalOrders: 0,
    totalGrossRevenue: 0,
    estimatedCogs: 0,
    totalDeliveryCollected: 0,
    totalCourierExpense: 0,
    totalDiscountsGiven: 0,
    netProfit: 0,
    profitMarginPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/reports/profit-loss');
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      showToast('লাভ-লোকসান তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'খাত (Head),পরিমাণ (BDT)',
        `মোট মোট বিক্রয় (Gross Revenue),৳${metrics.totalGrossRevenue}`,
        `পণ্য তৈরির খরচ (COGS),-৳${metrics.estimatedCogs}`,
        `গ্রাহক থেকে সংগৃহীত ডেলিভারি ফি,৳${metrics.totalDeliveryCollected}`,
        `কুরিয়ার ডেলিভারি খরচ,-৳${metrics.totalCourierExpense}`,
        `কুপন ও ছাড় বাবদ খরচ,-৳${metrics.totalDiscountsGiven}`,
        `নিট মুনাফা (Net Profit),৳${metrics.netProfit}`,
        `মুনাফার হার (Profit Margin),${metrics.profitMarginPercentage}%`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bastra_shoily_profit_loss_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('লাভ-লোকসান রিপোর্ট ডাউনলোড সম্পন্ন হয়েছে');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>লাভ-লোকসান ও আর্থিক হিসাব (Profit &amp; Loss / P&amp;L)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            মোট বিক্রয়, উৎপাদন খরচ (COGS), কুরিয়ার চার্জ এবং প্রকৃত নিট মুনাফার বিশ্লেষণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white text-stone-700 focus:outline-hidden"
          >
            <option value="today">আজকের হিসাব</option>
            <option value="week">এই সপ্তাহ</option>
            <option value="month">এই মাস</option>
            <option value="year">এই বছর</option>
            <option value="all">সর্বমোট (All Time)</option>
          </select>

          <button
            onClick={fetchMetrics}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">মোট বিক্রি (Gross Sales)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-stone-900">৳{metrics.totalGrossRevenue.toLocaleString('bn-BD')}</p>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
            <span>মোট সম্পন্ন অর্ডার: {metrics.totalOrders} টি</span>
          </div>
        </div>

        {/* Product Cost (COGS) */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">তাঁত ও উৎপাদন খরচ (COGS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700">৳{metrics.estimatedCogs.toLocaleString('bn-BD')}</p>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1">
            <span>সুতা, শানা, মজুরি ও কারিগরি ব্যয় (~৬২%)</span>
          </div>
        </div>

        {/* Courier & Logistics Expense */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold">কুরিয়ার ও ডেলিভারি ব্যয়</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-purple-700">৳{metrics.totalCourierExpense.toLocaleString('bn-BD')}</p>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1">
            <span>সংগৃহীত ডেলিভারি ফি: ৳{metrics.totalDeliveryCollected.toLocaleString('bn-BD')}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-900 shadow-md">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-bold">প্রকৃত নিট মুনাফা (Net Profit)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/80 text-emerald-200 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-300">৳{metrics.netProfit.toLocaleString('bn-BD')}</p>
          <div className="mt-2 text-[11px] text-emerald-200/80 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5" />
            <span>প্রফিট মার্জিন: <strong>{metrics.profitMarginPercentage}%</strong></span>
          </div>
        </div>
      </div>

      {/* Detailed Income Statement Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" />
            <span>আর্থিক বিবরণী কাঠামো (Income Statement Breakdown)</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            রিয়েল-টাইম ডেটাবেজ রিপোর্ট
          </span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {/* Revenue */}
          <div className="p-4 bg-stone-50/70 flex items-center justify-between font-bold text-stone-800">
            <span>১. মোট বিক্রয় আয় (Gross Sales Revenue)</span>
            <span className="font-mono text-sm text-stone-900">৳{metrics.totalGrossRevenue.toLocaleString('bn-BD')}</span>
          </div>

          <div className="p-4 flex items-center justify-between pl-8 text-stone-600">
            <span>ক. পণ্য বিক্রয় থেকে আয় (Subtotal)</span>
            <span className="font-mono">৳{(metrics.totalGrossRevenue - metrics.totalDeliveryCollected + metrics.totalDiscountsGiven).toLocaleString('bn-BD')}</span>
          </div>

          <div className="p-4 flex items-center justify-between pl-8 text-stone-600">
            <span>খ. ডেলিভারি চার্জ বাবদ সংগৃহীত ফি</span>
            <span className="font-mono">৳{metrics.totalDeliveryCollected.toLocaleString('bn-BD')}</span>
          </div>

          {/* Deductions / COGS */}
          <div className="p-4 bg-amber-50/50 flex items-center justify-between font-bold text-amber-900">
            <span>২. পণ্য উৎপাদন ও কারিগরি খরচ (Cost of Goods Sold - COGS)</span>
            <span className="font-mono text-sm text-amber-800">- ৳{metrics.estimatedCogs.toLocaleString('bn-BD')}</span>
          </div>

          {/* Operating / Courier Expenses */}
          <div className="p-4 bg-purple-50/40 flex items-center justify-between font-bold text-purple-900">
            <span>৩. লজিস্টিকস ও কুরিয়ার খরচ (Logistics Expenses)</span>
            <span className="font-mono text-sm text-purple-800">- ৳{metrics.totalCourierExpense.toLocaleString('bn-BD')}</span>
          </div>

          {/* Discounts */}
          <div className="p-4 flex items-center justify-between pl-8 text-stone-600">
            <span>৪. কুপন ছাড় ও প্রোমোশন খরচ (Marketing Discounts Given)</span>
            <span className="font-mono text-rose-600">- ৳{metrics.totalDiscountsGiven.toLocaleString('bn-BD')}</span>
          </div>

          {/* Final Net Profit */}
          <div className="p-5 bg-emerald-50 flex items-center justify-between font-black text-sm text-emerald-950 border-t-2 border-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>চূড়ান্ত নিট মুনাফা (Net Profit after Cost)</span>
            </div>
            <span className="font-mono text-lg text-emerald-800">৳{metrics.netProfit.toLocaleString('bn-BD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
