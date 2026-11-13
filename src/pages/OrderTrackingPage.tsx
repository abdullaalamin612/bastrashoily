import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { Search, Truck, CheckCircle2, Clock, PackageCheck, FileText, Phone, MapPin, ArrowLeft } from 'lucide-react';

const toAsciiDigits = (val: string) =>
  String(val || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

export const OrderTrackingPage: React.FC = () => {
  const { orders, openInvoiceModal, navigateToHome, navigateBack, trackingSearchQuery } = useShop();
  const [searchQuery, setSearchQuery] = useState(trackingSearchQuery || '');
  const [hasSearched, setHasSearched] = useState(Boolean(trackingSearchQuery));
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performRemoteTrack = async (rawQ: string) => {
    const q = toAsciiDigits(rawQ).trim();
    if (!q) {
      setRemoteOrders([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.orders)) {
        setRemoteOrders(data.orders);
      }
    } catch {
      // Fallback gracefully to in-memory orders
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (trackingSearchQuery) {
      setSearchQuery(trackingSearchQuery);
      setHasSearched(true);
      performRemoteTrack(trackingSearchQuery);
    }
  }, [trackingSearchQuery]);

  const normalizedQuery = toAsciiDigits(searchQuery).trim();
  const queryDigits = normalizedQuery.replace(/\D/g, '');
  const queryLower = normalizedQuery.toLowerCase();

  const matchedOrders = React.useMemo(() => {
    if (!normalizedQuery) return [];
    const combined = [...remoteOrders, ...(orders || [])];
    const deduped = new Map<string, Order>();
    for (const o of combined) {
      if (!o?.id) continue;
      const idMatch = String(o.id).toLowerCase().includes(queryLower);
      const rawPhone = String(o.customerPhone || '');
      const phoneDigits = toAsciiDigits(rawPhone).replace(/\D/g, '');
      const phoneMatch =
        rawPhone.includes(normalizedQuery) ||
        (queryDigits.length >= 6 && phoneDigits.endsWith(queryDigits.slice(-10)));
      if ((idMatch || phoneMatch) && !deduped.has(o.id)) {
        deduped.set(o.id, o);
      }
    }
    return Array.from(deduped.values());
  }, [normalizedQuery, queryDigits, queryLower, remoteOrders, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    performRemoteTrack(searchQuery);
  };

  const getStepStatus = (currentStatus: string, stepName: string) => {
    const orderFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = orderFlow.indexOf(currentStatus.toLowerCase());
    const stepIndex = orderFlow.indexOf(stepName.toLowerCase());

    if (currentStatus.toLowerCase() === 'cancelled') {
      return 'cancelled';
    }

    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={navigateBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer border border-stone-200"
          title="পূর্বের পেজে ফিরে যান (Back)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>পেছনে যান (Back)</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1A1] font-semibold">
          Order Status
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
          অর্ডার ট্র্যাকিং (Order Tracking)
        </h1>
        <p className="text-xs text-[#717171] max-w-md mx-auto font-light">
          আপনার অর্ডার আইডি (যেমন: <strong className="font-mono text-[#1A1A1A]">BS-1081</strong>) অথবা মোবাইল নম্বর দিয়ে অর্ডার ট্র্যাক করুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHasSearched(false);
            }}
            placeholder="অর্ডার আইডি বা মোবাইল নম্বর..."
            className="w-full bg-white border border-[#E0E0E0] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A] transition-colors placeholder:text-[#A1A1A1]"
          />
          <Search className="w-4 h-4 text-[#A1A1A1] absolute left-3 top-3" />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium rounded-lg uppercase tracking-wider transition-colors cursor-pointer shrink-0 active:scale-95"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6 pt-4">
          {isSearching && matchedOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-[#EAEAEA]">
              <Clock className="w-8 h-8 text-[#A1A1A1] mx-auto mb-2 animate-spin stroke-[1.5]" />
              <p className="font-medium text-xs text-[#1A1A1A]">অর্ডার অনুসন্ধান করা হচ্ছে...</p>
            </div>
          ) : matchedOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-[#EAEAEA]">
              <Truck className="w-10 h-10 text-[#A1A1A1] mx-auto mb-2 stroke-[1.5]" />
              <p className="font-medium text-xs text-[#1A1A1A]">কোনো অর্ডার খুঁজে পাওয়া যায়নি</p>
              <p className="text-[11px] text-[#A1A1A1] mt-1 font-light">
                দয়া করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর লিখুন।
              </p>
            </div>
          ) : (
            matchedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-[#EAEAEA] p-6 sm:p-7 space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#EAEAEA] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-semibold text-[#1A1A1A]">#{order.id}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-[#F5F5F5] text-[#1A1A1A] border border-[#EAEAEA]'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1A1] mt-0.5">অর্ডারের তারিখ: {order.orderDate || (order as any).order_date || ''}</p>
                  </div>

                  <button
                    onClick={() => openInvoiceModal(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#1A1A1A] rounded-lg text-xs font-medium transition-colors cursor-pointer border border-[#EAEAEA]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>ইনভয়েস দেখুন</span>
                  </button>
                </div>

                {/* Timeline visual tracker */}
                <div className="py-2">
                  <h4 className="text-[10px] font-semibold text-[#A1A1A1] uppercase tracking-[0.2em] mb-4">
                    ডেলিভারি অগ্রগতি (Status)
                  </h4>

                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                      const status = getStepStatus(order.orderStatus, step);
                      const isCompleted = status === 'completed';
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mb-1.5 transition-colors ${
                              isCompleted
                                ? 'bg-[#1A1A1A] text-white'
                                : 'bg-[#F5F5F5] text-[#A1A1A1] border border-[#EAEAEA]'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : `${idx + 1}`}
                          </div>
                          <span
                            className={`text-[10px] uppercase tracking-wider ${
                              isCompleted ? 'text-[#1A1A1A] font-medium' : 'text-[#A1A1A1]'
                            }`}
                          >
                            {step === 'pending'
                              ? 'অপেক্ষমান'
                              : step === 'confirmed'
                              ? 'কনফার্মড'
                              : step === 'processing'
                              ? 'প্রস্তুতি'
                              : step === 'shipped'
                              ? 'শিপড'
                              : 'ডেলিভার্ড'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer and Items recap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA] text-xs text-[#717171]">
                  <div className="space-y-1">
                    <p className="font-medium text-[#1A1A1A]">{order.customerName}</p>
                    <p className="flex items-center gap-1 text-[11px]">
                      <Phone className="w-3 h-3 text-[#A1A1A1]" />
                      <span>{order.customerPhone}</span>
                    </p>
                    <p className="flex items-start gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-[#A1A1A1] shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress}, {order.district}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <p className="font-semibold text-[#1A1A1A]">
                      মোট প্রদেয়: <span className="text-[#1A1A1A]">৳{order.total}</span>
                    </p>
                    <p className="text-[11px]">পেমেন্ট: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
                    <p className="text-[#A1A1A1] text-[11px]">আইটেম সংখ্যা: {order.items.length} টি</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Back button */}
      <div className="text-center pt-6">
        <button onClick={navigateToHome} className="text-xs text-[#717171] hover:text-[#1A1A1A] transition-colors cursor-pointer">
          ← কেনাকাটা চালিয়ে যেতে হোমে ফিরে যান
        </button>
      </div>
    </div>
  );
};
