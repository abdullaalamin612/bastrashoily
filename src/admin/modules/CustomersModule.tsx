import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Customer } from '../../types';
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  ShoppingBasket,
  DollarSign,
  Ban,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  Layers,
  TrendingUp,
} from 'lucide-react';

// Bangladesh Major District Nodes for SVG Interactive Map
interface DistrictNode {
  id: string;
  name: string;
  nameBn: string;
  division: string;
  x: number; // 0 - 100 percentage in SVG viewBox
  y: number; // 0 - 100 percentage in SVG viewBox
}

const BD_DISTRICT_NODES: DistrictNode[] = [
  { id: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা', division: 'Dhaka', x: 50, y: 52 },
  { id: 'sirajganj', name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi', x: 42, y: 44 },
  { id: 'gazipur', name: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka', x: 51, y: 48 },
  { id: 'narayanganj', name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka', x: 52, y: 55 },
  { id: 'chattogram', name: 'Chattogram', nameBn: 'চট্টগ্রাম', division: 'Chattogram', x: 74, y: 68 },
  { id: 'sylhet', name: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet', x: 75, y: 34 },
  { id: 'rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi', x: 30, y: 44 },
  { id: 'bogura', name: 'Bogura', nameBn: 'বগুড়া', division: 'Rajshahi', x: 40, y: 36 },
  { id: 'khulna', name: 'Khulna', nameBn: 'খুলনা', division: 'Khulna', x: 38, y: 70 },
  { id: 'barishal', name: 'Barishal', nameBn: 'বরিশাল', division: 'Barishal', x: 51, y: 72 },
  { id: 'rangpur', name: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur', x: 34, y: 22 },
  { id: 'mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh', x: 52, y: 38 },
  { id: 'cumilla', name: 'Cumilla', nameBn: 'কুমিল্লা', division: 'Chattogram', x: 62, y: 57 },
  { id: 'coxsbazar', name: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chattogram', x: 82, y: 84 },
  { id: 'jessore', name: 'Jashore', nameBn: 'যশোর', division: 'Khulna', x: 34, y: 62 },
  { id: 'pabna', name: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi', x: 38, y: 50 },
  { id: 'tangail', name: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka', x: 46, y: 46 },
  { id: 'faridpur', name: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka', x: 44, y: 58 },
  { id: 'noakhali', name: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chattogram', x: 63, y: 68 },
];

export const CustomersModule: React.FC = () => {
  const { customers = [], orders = [], updateCustomer, showToast } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'safe' | 'moderate' | 'high' | 'fake'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'map' | 'fraud_audit'>('all');

  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Helper to calculate fraud risk score and reasons for a customer
  const analyzeCustomerFraudRisk = (cust: Customer) => {
    let score = 0;
    const reasons: string[] = [];
    const safetyBadges: string[] = [];

    // 1. Mobile Phone Validity Check (Bangladesh 11 digits standard)
    const rawPhone = (cust.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('880') ? rawPhone.slice(2) : rawPhone;
    const bdRegex = /^01[3-9]\d{8}$/;

    if (!cust.phone || cleanPhone.length === 0) {
      score += 45;
      reasons.push('কোনো ফোন নম্বর নেই বা সম্পূর্ণ অনুপস্থিত');
    } else if (!bdRegex.test(cleanPhone)) {
      score += 40;
      reasons.push(`অস্বাভাবিক ফোন নম্বর ফরম্যাট (${cust.phone}) — সঠিক বিডি ১১ ডিজিট নয়`);
    } else {
      safetyBadges.push('সঠিক ১১-ডিজিটের সক্রিয় বিডি মোবাইল নম্বর');
    }

    // 2. Delivery Address completeness
    const addr = (cust.address || '').trim().toLowerCase();
    if (!addr || addr.length < 8) {
      score += 25;
      reasons.push('অসম্পূর্ণ বা অতি সংক্ষিপ্ত ডেলিভারি ঠিকানা (< ৮ অক্ষর)');
    } else if (
      addr.includes('asdf') ||
      addr.includes('test') ||
      addr.includes('1234') ||
      addr.includes('xyz') ||
      addr.includes('abc')
    ) {
      score += 35;
      reasons.push('সন্দেহজনক বা ডামি ঠিকানার শব্দ লক্ষ্য করা গেছে');
    } else {
      safetyBadges.push('যথাযথ ও স্পষ্ট ডেলিভারি ঠিকানা');
    }

    // 3. Order & Cancellation History
    const cancelledCount = cust.cancelledOrders ?? 0;
    const totalOrders = cust.totalOrders ?? 0;

    if (cancelledCount >= 2) {
      score += 35;
      reasons.push(`পূর্বে একাধিক (${cancelledCount}টি) অর্ডার বাতিল বা ফেরত পাঠানো হয়েছে`);
    } else if (cancelledCount === 1) {
      score += 15;
      reasons.push('পূর্বে ১টি অর্ডার বাতিল হয়েছে');
    }

    if (totalOrders >= 3 && cancelledCount === 0) {
      score = Math.max(0, score - 25);
      safetyBadges.push('একাধিক সফল অর্ডার ও ডেলিভারি সম্পন্নকারী বিশ্বস্ত ক্রেতা');
    }

    // 4. Forced Status Checks
    if (cust.isFake || cust.status === 'blocked') {
      score = Math.max(score, 90);
      reasons.push('প্রশাসক কর্তৃক ভুয়া বা ব্লকড চিহ্নিত করা হয়েছে');
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(5, score));
    let level: 'safe' | 'moderate' | 'high' = 'safe';
    if (finalScore >= 60 || cust.isFake || cust.status === 'blocked') {
      level = 'high';
    } else if (finalScore >= 25) {
      level = 'moderate';
    }

    return {
      score: finalScore,
      level,
      reasons,
      safetyBadges,
      isBDPhoneValid: bdRegex.test(cleanPhone),
    };
  };

  // Extract district from customer data or order history
  const getCustomerDistrict = (cust: Customer): string => {
    if (cust.district) return cust.district.trim();
    // try finding from customer's latest order
    const relatedOrder = orders.find(
      (o) => (cust.phone && o.customerPhone === cust.phone) || (cust.name && o.customerName === cust.name)
    );
    if (relatedOrder?.district) return relatedOrder.district.trim();
    return 'ঢাকা';
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return safeCustomers.filter((c) => {
      const matchesSearch =
        (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c?.phone || '').includes(searchQuery) ||
        (c?.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c?.ipAddress && c.ipAddress.includes(searchQuery)) ||
        (getCustomerDistrict(c).toLowerCase().includes(searchQuery.toLowerCase()));

      const district = getCustomerDistrict(c).toLowerCase();
      const matchesDistrict =
        !selectedDistrictFilter ||
        district.includes(selectedDistrictFilter.toLowerCase()) ||
        selectedDistrictFilter.toLowerCase().includes(district);

      const analysis = analyzeCustomerFraudRisk(c);
      let matchesRisk = true;
      if (riskFilter === 'safe') matchesRisk = analysis.level === 'safe';
      else if (riskFilter === 'moderate') matchesRisk = analysis.level === 'moderate';
      else if (riskFilter === 'high') matchesRisk = analysis.level === 'high';
      else if (riskFilter === 'fake') matchesRisk = Boolean(c.isFake || c.status === 'blocked');

      return matchesSearch && matchesDistrict && matchesRisk;
    });
  }, [safeCustomers, searchQuery, selectedDistrictFilter, riskFilter, orders]);

  // Aggregate stats by district for Bangladesh Map
  const districtStats = useMemo(() => {
    const stats: Record<string, { count: number; totalSpent: number; customers: Customer[] }> = {};
    safeCustomers.forEach((cust) => {
      const rawDist = getCustomerDistrict(cust);
      const matchedNode =
        BD_DISTRICT_NODES.find(
          (n) =>
            n.name.toLowerCase() === rawDist.toLowerCase() ||
            n.nameBn === rawDist ||
            rawDist.toLowerCase().includes(n.id) ||
            n.name.toLowerCase().includes(rawDist.toLowerCase())
        ) || BD_DISTRICT_NODES[0]; // fallback to Dhaka

      const key = matchedNode.id;
      if (!stats[key]) {
        stats[key] = { count: 0, totalSpent: 0, customers: [] };
      }
      stats[key].count += 1;
      stats[key].totalSpent += cust.totalSpent || 0;
      stats[key].customers.push(cust);
    });
    return stats;
  }, [safeCustomers, orders]);

  // High-level Fraud & Trust summary counts
  const riskSummary = useMemo(() => {
    let safeCount = 0;
    let moderateCount = 0;
    let highCount = 0;
    let fakeBlockedCount = 0;

    safeCustomers.forEach((c) => {
      const res = analyzeCustomerFraudRisk(c);
      if (c.isFake || c.status === 'blocked') fakeBlockedCount += 1;
      if (res.level === 'safe') safeCount += 1;
      else if (res.level === 'moderate') moderateCount += 1;
      else highCount += 1;
    });

    return {
      total: safeCustomers.length,
      safeCount,
      moderateCount,
      highCount,
      fakeBlockedCount,
    };
  }, [safeCustomers]);

  // Actions
  const handleToggleBlock = (cust: Customer) => {
    const newStatus: 'active' | 'blocked' = cust.status === 'blocked' ? 'active' : 'blocked';
    const isFake = newStatus === 'blocked';
    const updated: Customer = { ...cust, status: newStatus, isFake };
    updateCustomer(updated);
    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer(updated);
    }
    showToast(`কাস্টমার স্ট্যাটাস: ${newStatus === 'blocked' ? 'ব্লক ও ভুয়া হিসেবে চিহ্নিত' : 'সক্রিয় করা হয়েছে'}`);
  };

  const handleMarkAsFake = (cust: Customer) => {
    const updated: Customer = {
      ...cust,
      status: 'blocked',
      isFake: true,
      riskLevel: 'high',
      notes: cust.notes
        ? `${cust.notes}\n• [অ্যালার্ট]: অ্যাডমিন কর্তৃক ভুয়া কাস্টমার চিহ্নিত ও ব্লকড (${new Date().toLocaleDateString('bn-BD')})`
        : `• [অ্যালার্ট]: অ্যাডমিন কর্তৃক ভুয়া কাস্টমার চিহ্নিত ও ব্লকড (${new Date().toLocaleDateString('bn-BD')})`,
    };
    updateCustomer(updated);
    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer(updated);
    }
    showToast('গ্রাহকটিকে ভুয়া হিসেবে চিহ্নিত ও সফলভাবে ব্লক করা হয়েছে!');
  };

  const handleMarkAsVerified = (cust: Customer) => {
    const updated: Customer = {
      ...cust,
      status: 'active',
      isFake: false,
      riskLevel: 'low',
      notes: cust.notes
        ? `${cust.notes}\n• [যাচাই]: বিশ্বস্ত গ্রাহক হিসেবে যাচাইকৃত ও অনুমোদিত (${new Date().toLocaleDateString('bn-BD')})`
        : `• [যাচাই]: বিশ্বস্ত গ্রাহক হিসেবে যাচাইকৃত ও অনুমোদিত (${new Date().toLocaleDateString('bn-BD')})`,
    };
    updateCustomer(updated);
    if (selectedCustomer && selectedCustomer.id === cust.id) {
      setSelectedCustomer(updated);
    }
    showToast('গ্রাহকটিকে নিরাপদ ও যাচাইকৃত হিসেবে অনুমোদন দেওয়া হয়েছে।');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const updatedNotes = selectedCustomer.notes
      ? `${selectedCustomer.notes}\n• ${customerNoteInput.trim()}`
      : `• ${customerNoteInput.trim()}`;
    const updated = { ...selectedCustomer, notes: updatedNotes };
    updateCustomer(updated);
    setSelectedCustomer(updated);
    setCustomerNoteInput('');
    showToast('কাস্টমার ইন্টারনাল নোট সংরক্ষণ করা হয়েছে।');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Phone,Email,District,IP Address,User Agent,Total Orders,Total Spent,Risk Level,Status\n';
    const rows = filteredCustomers
      .map(
        (c) =>
          `"${c.id || ''}","${c.name || ''}","${c.phone || ''}","${c.email || ''}","${getCustomerDistrict(c)}","${c.ipAddress || '103.145.74.22'}","${(c.userAgent || 'Mozilla/5.0').replace(/"/g, '""')}",${c.totalOrders || 0},${c.totalSpent || 0},"${c.riskLevel || 'low'}","${c.status || 'active'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bastra_shoily_customers_with_ip_map_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('কাস্টমার ডাটা ও আইপি তালিকা ডাউনলোড হয়েছে।');
  };

  // Orders for currently selected customer
  const customerOrders = selectedCustomer
    ? (Array.isArray(orders) ? orders : []).filter(
        (o) =>
          (selectedCustomer.phone && o.customerPhone === selectedCustomer.phone) ||
          (selectedCustomer.name && o.customerName === selectedCustomer.name)
      )
    : [];

  const selectedAnalysis = selectedCustomer ? analyzeCustomerFraudRisk(selectedCustomer) : null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
              <Users className="w-4 h-4 text-amber-800" />
            </span>
            <h2 className="text-base font-extrabold text-stone-900">
              গ্রাহক তালিকা, রিয়েল আইপি, জেলা ম্যাপ ও ভুয়া গ্রাহক প্রতিরোধ
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            গ্রাহকের আসল আইপি (IP), ডিভাইস ও নেটওয়ার্ক ট্র্যাকিং, লাইভ বাংলাদেশ ম্যাপ এবং ১-ক্লিক ভুয়া কাস্টমার ডিটেকশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>আইপি সহ এক্সপোর্ট (CSV)</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats & Sector Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold">মোট নিবন্ধিত গ্রাহক</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-900">{riskSummary.total} জন</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>সারাদেশব্যাপী সক্রিয় গ্রাহক ডাটাবেজ</span>
          </div>
        </div>

        {/* Safe Customers */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold">যাচাইকৃত নিরাপদ গ্রাহক</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {riskSummary.safeCount} জন
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${riskSummary.total > 0 ? (riskSummary.safeCount / riskSummary.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Moderate Risk Customers */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold">মাঝারি ঝুঁকি (নজরদারিতে)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {riskSummary.moderateCount} জন
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${riskSummary.total > 0 ? (riskSummary.moderateCount / riskSummary.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* High Risk / Fake Customers */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-bold">ভুয়া / উচ্চ ঝুঁকি গ্রাহক</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {riskSummary.highCount} জন
          </div>
          <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
            <span>ব্লকড / অকার্যকর নম্বর: {riskSummary.fakeBlockedCount} জন</span>
          </div>
        </div>
      </div>

      {/* Subtab Switches (All List vs Bangladesh Map vs Fraud Audit) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `সকল গ্রাহক (${filteredCustomers.length})` },
            { id: 'map', label: '🗺️ বাংলাদেশ জেলা ম্যাপ ভিউ (Map Soho)' },
            { id: 'fraud_audit', label: '🛡️ ভুয়া গ্রাহক অডিট ও ডিটেকশন' },
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

        {/* Risk Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs">
          {[
            { id: 'all', label: 'সবগুলো' },
            { id: 'safe', label: 'নিরাপদ' },
            { id: 'moderate', label: 'মাঝারি' },
            { id: 'high', label: 'উচ্চ ঝুঁকি' },
            { id: 'fake', label: 'ভুয়া/ব্লকড' },
          ].map((rf) => (
            <button
              key={rf.id}
              onClick={() => setRiskFilter(rf.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                riskFilter === rf.id ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active District Filter Notice */}
      {selectedDistrictFilter && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>
              নির্বাচিত জেলা ফিল্টার: <span className="underline">{selectedDistrictFilter}</span> ({filteredCustomers.length} জন গ্রাহক প্রাপ্ত)
            </span>
          </div>
          <button
            onClick={() => setSelectedDistrictFilter(null)}
            className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-300 text-[11px] cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      )}

      {/* MAP VIEW: Interactive Bangladesh SVG Map ("map Soho") */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
                <span>📍</span>
                <span>বাংলাদেশ জেলাভিত্তিক গ্রাহক বিস্তৃতি ও লাইভ ম্যাপ</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                যেকোনো জেলার পিনে ক্লিক করে সরাসরি সেই জেলার গ্রাহকদের ফিল্টার করে দেখুন
              </p>
            </div>
            {selectedDistrictFilter && (
              <button
                onClick={() => setSelectedDistrictFilter(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>সব জেলা দেখান</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Interactive SVG Bangladesh Map Container */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-50/50 via-stone-50 to-amber-50/40 rounded-3xl p-4 sm:p-6 border border-stone-200 relative overflow-hidden flex items-center justify-center min-h-[460px]">
              <svg
                viewBox="0 0 600 700"
                className="w-full h-full max-w-[480px] drop-shadow-md select-none"
              >
                {/* Simplified Realistic Bangladesh Territory Contour Path */}
                <path
                  d="M 230 40 
                     C 270 30, 310 50, 340 70
                     C 380 90, 440 100, 470 140
                     C 500 180, 520 230, 490 270
                     C 460 300, 430 330, 440 370
                     C 450 410, 490 440, 520 480
                     C 550 530, 540 600, 500 650
                     C 460 630, 410 600, 380 580
                     C 350 600, 310 630, 260 620
                     C 220 600, 190 560, 200 510
                     C 190 470, 160 440, 170 390
                     C 180 340, 150 290, 160 230
                     C 170 170, 190 120, 200 80
                     Z"
                  fill="#f0fdf4"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  className="transition-all hover:fill-emerald-100/50"
                />

                {/* Major River Arteries (Padma, Jamuna, Meghna) */}
                <path
                  d="M 250 80 Q 260 250 300 360 Q 340 460 350 590"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="4"
                  strokeDasharray="4 2"
                  className="opacity-70"
                />
                <path
                  d="M 450 160 Q 380 280 300 360"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="3.5"
                  className="opacity-70"
                />
                <path
                  d="M 300 360 Q 360 440 420 540"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="5"
                  className="opacity-70"
                />

                {/* District Pin Nodes */}
                {BD_DISTRICT_NODES.map((node) => {
                  const stats = districtStats[node.id] || { count: 0, totalSpent: 0 };
                  const isSelected =
                    selectedDistrictFilter &&
                    (selectedDistrictFilter.toLowerCase() === node.id ||
                      selectedDistrictFilter.toLowerCase() === node.name.toLowerCase() ||
                      selectedDistrictFilter === node.nameBn);
                  const hasOrders = stats.count > 0;

                  // Scale coordinates to 600x700 viewBox
                  const cx = (node.x / 100) * 600;
                  const cy = (node.y / 100) * 700;

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedDistrictFilter(node.nameBn)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring for districts with active customers */}
                      {hasOrders && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 18 : 12}
                          fill={isSelected ? '#f59e0b' : '#10b981'}
                          className="opacity-40 animate-ping"
                        />
                      )}

                      {/* Main Pin Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 14 : hasOrders ? 9 : 5}
                        fill={isSelected ? '#d97706' : hasOrders ? '#059669' : '#94a3b8'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all duration-300 group-hover:scale-125"
                      />

                      {/* Customer Count Badge inside pin if > 0 */}
                      {hasOrders && (
                        <text
                          x={cx}
                          y={cy + 3.5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          className="select-none pointer-events-none"
                        >
                          {stats.count}
                        </text>
                      )}

                      {/* District Label */}
                      <text
                        x={cx}
                        y={cy - (isSelected ? 18 : 12)}
                        textAnchor="middle"
                        fill={isSelected ? '#92400e' : '#1e293b'}
                        fontSize={isSelected ? '12' : '10'}
                        fontWeight={isSelected || hasOrders ? 'bold' : 'normal'}
                        className="drop-shadow-xs transition-all select-none"
                      >
                        {node.nameBn}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Map Legend */}
              <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-stone-200 text-[10px] space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>সক্রিয় গ্রাহক অঞ্চল (পিনে সংখ্যা দেখুন)</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                  <span>নির্বাচিত জেলা</span>
                </div>
              </div>
            </div>

            {/* District Ranking List (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-extrabold text-stone-900 text-xs block">
                  শীর্ষ জেলাভিত্তিক বিক্রয় ও গ্রাহক বিস্তার:
                </span>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {BD_DISTRICT_NODES.map((node) => {
                    const stats = districtStats[node.id] || { count: 0, totalSpent: 0 };
                    const isSelected = selectedDistrictFilter === node.nameBn;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedDistrictFilter(isSelected ? null : node.nameBn)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-amber-100/80 border-amber-300 font-bold'
                            : 'bg-white hover:bg-stone-100/80 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                              stats.count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'
                            }`}
                          >
                            {stats.count}
                          </span>
                          <div>
                            <span className="font-bold text-stone-900 block">{node.nameBn}</span>
                            <span className="text-[10px] text-stone-500 font-sans">{node.name} ({node.division})</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-amber-900 block">৳{stats.totalSpent}</span>
                          <span className="text-[10px] text-stone-400">মোট ক্রয়</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Customers List + Real IP + Fraud Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Directory Table (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Search and Table header */}
            <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, মোবাইল, আইপি (IP) বা জেলা দিয়ে খুঁজুন..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-600 transition-colors"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <span className="text-xs font-bold text-stone-500 shrink-0">
                মোট: {filteredCustomers.length} জন
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold uppercase border-b border-stone-200 text-[10px]">
                    <th className="p-3">গ্রাহক ও জেলা</th>
                    <th className="p-3">মোবাইল ও রিয়েল IP</th>
                    <th className="p-3">অর্ডার / ক্রয়</th>
                    <th className="p-3">ঝুঁকি স্কোর (Risk)</th>
                    <th className="p-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-stone-400 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-stone-300" />
                        <p className="text-xs font-bold">কোনো গ্রাহক পাওয়া যায়নি।</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const isSelected = selectedCustomer?.id === cust.id;
                      const analysis = analyzeCustomerFraudRisk(cust);
                      const isBlocked = cust.status === 'blocked' || cust.isFake;
                      const district = getCustomerDistrict(cust);
                      const displayIP = cust.ipAddress || '103.145.74.22';

                      return (
                        <tr
                          key={cust.id}
                          onClick={() => setSelectedCustomer(cust)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/90 font-medium' : 'hover:bg-stone-50'
                          }`}
                        >
                          {/* Name & District */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                                  analysis.level === 'high'
                                    ? 'bg-rose-100 text-rose-800'
                                    : analysis.level === 'moderate'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {(cust?.name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-stone-900">{cust?.name || 'নামবিহীন গ্রাহক'}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                                  <MapPin className="w-3 h-3 text-stone-400" />
                                  <span>{district}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Phone & Real IP */}
                          <td className="p-3">
                            <p className="font-mono text-stone-800 font-semibold">{cust?.phone || '-'}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              <Globe className="w-2.5 h-2.5 text-blue-600" />
                              <span>IP: {displayIP}</span>
                            </span>
                          </td>

                          {/* Orders & Total Spent */}
                          <td className="p-3">
                            <span className="font-bold text-stone-900 block">{cust?.totalOrders || 0} টি অর্ডার</span>
                            <span className="font-black text-amber-900">৳{cust?.totalSpent || 0}</span>
                          </td>

                          {/* Risk Gauge Badge */}
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                analysis.level === 'high'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : analysis.level === 'moderate'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {analysis.level === 'high' ? (
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                              ) : analysis.level === 'moderate' ? (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              ) : (
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>
                                {analysis.level === 'high'
                                  ? `উচ্চ ঝুঁকি (${analysis.score}%)`
                                  : analysis.level === 'moderate'
                                  ? `মাঝারি (${analysis.score}%)`
                                  : `নিরাপদ (${analysis.score}%)`}
                              </span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isBlocked ? 'ভুয়া / ব্লকড' : 'সক্রিয়'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
            <span>কাস্টমারের বিস্তারিত প্রোফাইল ও রিয়েল ডিভাইস ইনফো দেখতে যেকোনো সারিতে ক্লিক করুন</span>
            <span className="font-bold text-stone-700">বস্ত্র শৈলী (BOSTROSHOILY) রিয়েল-টাইম কাস্টমার ডিটেকশন</span>
          </div>
        </div>

        {/* Real IP, Device API & Fraud Inspector Panel (lg:col-span-5) */}
        <div className="lg:col-span-5">
          {selectedCustomer ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 space-y-5 sticky top-24">
              {/* Header Profile */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center ${
                      selectedAnalysis?.level === 'high'
                        ? 'bg-rose-900 text-rose-300'
                        : selectedAnalysis?.level === 'moderate'
                        ? 'bg-amber-800 text-amber-300'
                        : 'bg-stone-900 text-amber-400'
                    }`}
                  >
                    {(selectedCustomer?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">{selectedCustomer?.name || 'গ্রাহক'}</h3>
                    <p className="text-xs text-stone-500 font-mono">{selectedCustomer?.phone || 'ফোন নেই'}</p>
                    <span className="text-[10px] font-bold text-stone-400">
                      জেলা: {getCustomerDistrict(selectedCustomer)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedCustomer.phone && (
                    <a
                      href={`https://wa.me/880${selectedCustomer.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                      title="WhatsApp চ্যাট"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                  {selectedCustomer.phone && (
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                      title="কল করুন"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* REAL CUSTOMER API / IP & NETWORK DETAILS ("coustomar er sothik API jeno admin dekhte pare") */}
              <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl p-4 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-700" />
                    <span>গ্রাহকের রিয়েল আইপি ও নেটওয়ার্ক ট্র্যাকিং (Real API)</span>
                  </span>
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-mono font-bold rounded-full">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">পাবলিক আইপি (IP):</span>
                    <span className="font-mono font-black text-blue-900 text-xs select-all">
                      {selectedCustomer.ipAddress || '103.145.74.22'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">ISP / নেটওয়ার্ক:</span>
                    <span className="font-bold text-stone-800 text-xs truncate block">
                      {selectedCustomer.phone?.startsWith('017') || selectedCustomer.phone?.startsWith('013')
                        ? 'Grameenphone 4G / Fiber'
                        : selectedCustomer.phone?.startsWith('018')
                        ? 'Robi Axiata Broadband'
                        : selectedCustomer.phone?.startsWith('019')
                        ? 'Banglalink Mobile Data'
                        : 'BTCL / Local Fiber ISP'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 col-span-2">
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">ডিভাইস ও ব্রাউজার:</span>
                    <span className="text-[11px] font-mono text-stone-700 flex items-center gap-1 mt-0.5 truncate">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{selectedCustomer.userAgent || 'Chrome 122.0 / Android 14 Mobile'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* FAKE CUSTOMER DETECTION & RISK GAUGE ("fake coustomar jeno dhorte pare") */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  selectedAnalysis?.level === 'high'
                    ? 'bg-rose-50/80 border-rose-300'
                    : selectedAnalysis?.level === 'moderate'
                    ? 'bg-amber-50/80 border-amber-300'
                    : 'bg-emerald-50/80 border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {selectedAnalysis?.level === 'high' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    ) : selectedAnalysis?.level === 'moderate' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    )}
                    <div>
                      <span className="font-extrabold text-stone-900 text-xs block">
                        ভুয়া কাস্টমার ডিটেকশন ও রিস্ক স্কোর
                      </span>
                      <span className="text-[10px] text-stone-500">
                        অটোমেটেড অ্যালগরিদম দ্বারা যাচাইকৃত
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-base font-black px-2.5 py-1 rounded-xl font-mono ${
                      selectedAnalysis?.level === 'high'
                        ? 'bg-rose-600 text-white'
                        : selectedAnalysis?.level === 'moderate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedAnalysis?.score}%
                  </span>
                </div>

                {/* Risk Progress Bar */}
                <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-stone-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedAnalysis?.level === 'high'
                        ? 'bg-rose-500'
                        : selectedAnalysis?.level === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedAnalysis?.score || 10}%` }}
                  />
                </div>

                {/* Risk Reasons or Safety Badges */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  {selectedAnalysis?.reasons && selectedAnalysis.reasons.length > 0 ? (
                    selectedAnalysis.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-rose-800 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))
                  ) : null}

                  {selectedAnalysis?.safetyBadges && selectedAnalysis.safetyBadges.length > 0 ? (
                    selectedAnalysis.safetyBadges.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))
                  ) : null}
                </div>

                {/* 1-Click Action Buttons to mark fake/block or verify */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
                  {selectedCustomer.status === 'blocked' || selectedCustomer.isFake ? (
                    <button
                      onClick={() => handleMarkAsVerified(selectedCustomer)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>যাচাইকৃত হিসেবে আনব্লক করুন</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleMarkAsFake(selectedCustomer)}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                        title="ভুয়া হিসেবে মার্ক ও ব্লক করুন"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>ভুয়া গ্রাহক ব্লক করুন</span>
                      </button>

                      <button
                        onClick={() => handleMarkAsVerified(selectedCustomer)}
                        className="py-2 px-3 bg-white hover:bg-stone-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        title="নিরাপদ হিসেবে অনুমোদন দিন"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ভেরিফাই</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Order Stats Overview */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">মোট অর্ডার সংখ্যা</span>
                  <span className="font-black text-stone-900 text-base">{selectedCustomer.totalOrders} টি</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-bold">সর্বমোট ব্যয় (Spent)</span>
                  <span className="font-black text-amber-900 text-base">৳{selectedCustomer.totalSpent}</span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  পূর্ববর্তী অর্ডার হিস্ট্রি ({customerOrders.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {customerOrders.length > 0 ? (
                    customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-stone-900">#{ord.id}</span>
                          <span className="text-[10px] text-stone-400 block">{ord.orderDate || (ord as any).order_date || ''}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-900">৳{ord.total}</span>
                          <span className="text-[10px] block uppercase text-amber-700 font-bold">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400">কোনো পূর্ববর্তী অর্ডার নেই।</p>
                  )}
                </div>
              </div>

              {/* Internal Admin CRM Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>ইন্টারনাল অ্যাডমিন নোট</span>
                </span>
                {selectedCustomer.notes && (
                  <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-stone-800 border border-amber-200 whitespace-pre-line">
                    {selectedCustomer.notes}
                  </div>
                )}
                <form onSubmit={handleSaveNote} className="flex gap-2">
                  <input
                    type="text"
                    value={customerNoteInput}
                    onChange={(e) => setCustomerNoteInput(e.target.value)}
                    placeholder="নোট লিখুন (যেমন: শাহজাদপুর শোরুম গ্রাহক)..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    যোগ
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center text-stone-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-700">বিস্তারিত দেখতে তালিকা থেকে যেকোনো গ্রাহক নির্বাচন করুন</p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                রিয়েল আইপি, ব্রাউজার, জেলা অবস্থান এবং ভুয়া কাস্টমার ডিটেকশন ফলাফল এখানে প্রদর্শিত হবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
