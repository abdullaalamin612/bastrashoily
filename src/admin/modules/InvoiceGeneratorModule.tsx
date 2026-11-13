import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Printer,
  FileText,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  Truck,
  Sparkles,
} from 'lucide-react';

export type InvoiceFormat = 'customer_sales' | 'wholesale_b2b' | 'cash_memo';

interface InvoiceLineItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  rate: number;
  quantity: number;
  total: number;
}

export const InvoiceGeneratorModule: React.FC = () => {
  const { products, orders, showToast } = useShop();

  const [activeFormat, setActiveFormat] = useState<InvoiceFormat>('customer_sales');

  // General Invoice Header Details
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => `INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('ক্যাশ অন ডেলিভারি (COD)');
  const [paymentStatus, setPaymentStatus] = useState<'পরিশোধিত' | 'বাকি' | 'আংশিক পরিশোধিত'>('পরিশোধিত');

  // Customer / Business Info
  const [customerName, setCustomerName] = useState('রহিমুল ইসলাম');
  const [customerPhone, setCustomerPhone] = useState('01864-528488');
  const [customerAddress, setCustomerAddress] = useState('ধানমন্ডি, ঢাকা');
  
  // B2B Wholesale Info
  const [businessName, setBusinessName] = useState('মেসার্স সিরাজগঞ্জ টেক্সটাইল ট্রেডার্স');
  const [transportName, setTransportName] = useState('সুন্দরবন কুরিয়ার / করতোয়া কুরিয়ার সার্ভিস');
  const [previousDue, setPreviousDue] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      id: 'item-1',
      name: 'সিরাজগঞ্জের সুতি তাঁতের লুঙ্গি (প্রিমিয়াম কালেকশন)',
      sku: 'BS-LNG-01',
      unit: 'পিস',
      rate: 950,
      quantity: 2,
      total: 1900,
    },
    {
      id: 'item-2',
      name: 'লাক্সারি সিল্ক এমব্রয়ডারি পাঞ্জাবি',
      sku: 'BS-PAN-04',
      unit: 'পিস',
      rate: 2200,
      quantity: 1,
      total: 2200,
    },
  ]);

  // Adjustments
  const [deliveryCharge, setDeliveryCharge] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number>(150);
  const [note, setNote] = useState<string>('বস্ত্র শৈলী থেকে কেনাকাটার জন্য আন্তরিক ধন্যবাদ।');

  // Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, itm) => acc + (itm.total || 0), 0);
  }, [lineItems]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + Number(deliveryCharge || 0) - Number(discountAmount || 0));
  }, [subtotal, deliveryCharge, discountAmount]);

  const netBalanceDue = useMemo(() => {
    return Math.max(0, grandTotal + Number(previousDue || 0) - Number(paidAmount || 0));
  }, [grandTotal, previousDue, paidAmount]);

  // Add line item
  const handleAddItem = (productName = '', sku = '', rate = 0) => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}-${Math.random().toString().slice(-4)}`,
      name: productName || 'নতুন পোশাক সামগ্রী',
      sku: sku || 'BS-PROD',
      unit: activeFormat === 'wholesale_b2b' ? 'থান / বান্ডিল' : 'পিস',
      rate: rate || 500,
      quantity: activeFormat === 'wholesale_b2b' ? 10 : 1,
      total: (rate || 500) * (activeFormat === 'wholesale_b2b' ? 10 : 1),
    };
    setLineItems([...lineItems, newItem]);
  };

  // Update line item
  const handleUpdateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'rate' || field === 'quantity') {
            const r = field === 'rate' ? Number(value) : item.rate;
            const q = field === 'quantity' ? Number(value) : item.quantity;
            updated.total = (r || 0) * (q || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Delete line item
  const handleDeleteItem = (id: string) => {
    if (lineItems.length <= 1) {
      showToast('চালানে কমপক্ষে ১টি আইটেম থাকতে হবে');
      return;
    }
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  // Quick load from order
  const handleLoadFromOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setInvoiceNumber(`INV-${ord.id}`);
    setCustomerName(ord.customerName || 'সম্মানিত ক্রেতা');
    setCustomerPhone(ord.customerPhone || '');
    setCustomerAddress(ord.deliveryAddress || '');
    setDeliveryCharge(ord.deliveryCharge || 0);
    setDiscountAmount(ord.discount || 0);
    setPaymentMethod(ord.paymentMethod?.toUpperCase() || 'ক্যাশ অন ডেলিভারি');
    setPaymentStatus(ord.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বাকি');

    if (ord.items && ord.items.length > 0) {
      const mapped = ord.items.map((it, idx) => ({
        id: `ord-it-${idx}`,
        name: it.banglaName || it.productName || 'পোশাক',
        sku: it.sku || 'BS-ORD',
        unit: 'পিস',
        rate: it.unitPrice || it.price || 0,
        quantity: it.quantity || 1,
        total: (it.unitPrice || it.price || 0) * (it.quantity || 1),
      }));
      setLineItems(mapped);
    }
    showToast(`অর্ডার #${ord.id} থেকে চালানের তথ্য লোড হয়েছে!`);
  };

  // Direct print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-800">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-stone-900">ইনভয়েস ও মেমো জেনারেটর (Invoice Generator)</h1>
              <p className="text-xs text-stone-500">
                কাস্টমার সেলস চালান, পাইকারি বি২বি চালান এবং পিওএস ক্যাশ মেমো তৈরির পূর্ণাঙ্গ সিস্টেম
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Order Importer */}
          {orders.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadFromOrder(e.target.value);
              }}
              defaultValue=""
              className="text-xs px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
            >
              <option value="">অর্ডার থেকে লোড করুন...</option>
              {orders.slice(0, 15).map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} - {o.customerName} (৳{o.total})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট / PDF সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* 3 FORMAT TABS SWITCHER */}
      <div className="bg-stone-100/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1 border border-stone-200">
        <button
          onClick={() => setActiveFormat('customer_sales')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeFormat === 'customer_sales'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4 text-amber-700" />
          <span>১. কাস্টমার সেলস চালান (Customer Sales Invoice)</span>
        </button>

        <button
          onClick={() => setActiveFormat('wholesale_b2b')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeFormat === 'wholesale_b2b'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building className="w-4 h-4 text-blue-700" />
          <span>২. পাইকারি / হোলসেল চালান (Wholesale B2B Invoice)</span>
        </button>

        <button
          onClick={() => setActiveFormat('cash_memo')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeFormat === 'cash_memo'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-700" />
          <span>৩. ক্যাশ মেমো / পিওএস রসিদ (Cash Memo / POS Receipt)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          {/* General Metadata Box */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">
              চালানের সাধারণ তথ্য ও ক্রেতার বিবরণ
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">চালান নম্বর</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">তারিখ</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {/* B2B specific fields */}
            {activeFormat === 'wholesale_b2b' && (
              <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">প্রতিষ্ঠান / শোরুমের নাম *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-blue-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">পরিবহন / কুরিয়ার সার্ভিস</label>
                  <input
                    type="text"
                    value={transportName}
                    onChange={(e) => setTransportName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-blue-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">পূর্বের বাকি (৳)</label>
                    <input
                      type="number"
                      value={previousDue}
                      onChange={(e) => setPreviousDue(Number(e.target.value))}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">জমা প্রদান (৳)</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-emerald-800 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">ক্রেতার নাম</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">ঠিকানা / ডেলিভারি গন্তব্য</label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">পেমেন্ট মাধ্যম</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">পেমেন্ট স্ট্যাটাস</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="পরিশোধিত">পরিশোধিত (Paid)</option>
                  <option value="বাকি">বাকি (Due / COD)</option>
                  <option value="আংশিক পরিশোধিত">আংশিক পরিশোধিত (Partial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line items editor */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-xs font-bold text-stone-900">আইটেম তালিকা ({lineItems.length} টি)</h3>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ আইটেম যোগ করুন</span>
              </button>
            </div>

            {/* Quick catalog adder */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-stone-500 uppercase">ক্যাটালগ থেকে যোগ করুন:</label>
              <select
                onChange={(e) => {
                  const p = products.find((pr) => pr.id === e.target.value);
                  if (p) {
                    handleAddItem(p.banglaName || p.name, p.sku, p.discountPrice || p.price);
                  }
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-800"
              >
                <option value="">ক্যাটালগ পণ্য নির্বাচন করুন...</option>
                {products.slice(0, 30).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.banglaName || p.name} — ৳{p.discountPrice || p.price} ({p.subCategory})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {lineItems.map((item, idx) => (
                <div key={item.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 font-mono">আইটেম #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 cursor-pointer p-0.5"
                      title="আইটেম মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="পণ্যের নাম ও বিবরণ"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-medium"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-stone-500">দর (৳)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                        className="w-full text-xs px-2 py-1 rounded border border-stone-300 bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-stone-500">পরিমাণ</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full text-xs px-2 py-1 rounded border border-stone-300 bg-white font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-stone-500">মোট (৳)</label>
                      <div className="text-xs font-bold text-stone-900 pt-1 font-mono">৳{item.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Adjustments */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">ডেলিভারি চার্জ (৳)</label>
                <input
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">ছাড় / ডিসকাউন্ট (৳)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-stone-300 text-rose-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Printable Invoice Canvas (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <div className="bg-stone-50 p-3 sm:p-6 rounded-2xl border border-stone-200">
            {/* FORMAT 1: CUSTOMER SALES INVOICE */}
            {activeFormat === 'customer_sales' && (
              <div id="printable-invoice" className="bg-white rounded-xl p-8 sm:p-10 shadow-sm border border-stone-300 text-stone-900 font-sans max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5 mb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-stone-950">BOSTROSHOILY</h2>
                    <p className="text-[11px] font-bold text-amber-800 tracking-wider">বস্ত্র শৈলী • খাঁটি তাঁতের আভিজাত্য</p>
                    <p className="text-[10px] text-stone-500 mt-1">সিরাজগঞ্জ, বাংলাদেশ | হটলাইন: +880 1864-528488</p>
                    <p className="text-[10px] text-stone-500">{typeof window !== 'undefined' ? window.location.host : 'bostroshoily.onrender.com'} | bostroshoily@gmail.com</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-stone-950 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                      বিক্রয় চালান (SALES INVOICE)
                    </span>
                    <div className="mt-2 text-xs font-bold text-stone-800 font-mono">নং: {invoiceNumber}</div>
                    <div className="text-[11px] text-stone-500">তারিখ: {invoiceDate}</div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">অবস্থা: {paymentStatus}</div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 text-xs">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block mb-0.5">ক্রেতার বিবরণ (Bill To):</span>
                    <div className="font-bold text-stone-900 text-sm">{customerName}</div>
                    <div className="text-stone-600 font-mono mt-0.5">{customerPhone}</div>
                  </div>
                  <div>
                    <span className="font-bold text-[10px] uppercase text-stone-400 block mb-0.5">ডেলিভারি ঠিকানা:</span>
                    <div className="text-stone-700 leading-snug">{customerAddress || 'ঠিকানা নির্ধারিত হয়নি'}</div>
                    <div className="text-[11px] text-stone-500 mt-1">মাধ্যম: {paymentMethod}</div>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-xs border border-stone-200 rounded-lg overflow-hidden mb-6">
                  <thead>
                    <tr className="bg-stone-900 text-white text-[11px] uppercase">
                      <th className="py-2.5 px-3 text-left">ক্রম</th>
                      <th className="py-2.5 px-3 text-left">পোশাকের বিবরণ</th>
                      <th className="py-2.5 px-3 text-right">দর (Rate)</th>
                      <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-mono text-stone-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-stone-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono">৳{item.rate}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono">৳{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-between items-start border-t border-stone-200 pt-4">
                  <div className="max-w-xs text-[11px] text-stone-500 space-y-1">
                    <p className="font-bold text-stone-800">বিশেষ দ্রষ্টব্য:</p>
                    <p>{note}</p>
                    <p className="text-[10px]">৭ দিনের রিপ্লেসমেন্ট সুবিধা প্রযোজ্য। ডেলিভারির সময় পণ্য দেখে গ্রহণ করুন।</p>
                  </div>

                  <div className="w-56 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>সাব-টোটাল:</span>
                      <span className="font-bold font-mono text-stone-900">৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-bold font-mono text-stone-900">৳{deliveryCharge}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-rose-700 font-bold">
                        <span>বিশেষ ছাড়:</span>
                        <span className="font-mono">-৳{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black border-t-2 border-stone-900 pt-2 text-stone-950">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-base text-amber-900 font-mono">৳{grandTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-12 mt-8 text-center text-xs text-stone-500 border-t border-stone-100">
                  <div>
                    <div className="border-t border-dashed border-stone-400 w-36 mx-auto pt-1 font-bold text-stone-700">
                      ক্রেতার স্বাক্ষর
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-dashed border-stone-400 w-36 mx-auto pt-1 font-bold text-stone-700">
                      কর্তৃপক্ষের স্বাক্ষর
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 2: WHOLESALE B2B INVOICE */}
            {activeFormat === 'wholesale_b2b' && (
              <div id="printable-invoice" className="bg-white rounded-xl p-8 sm:p-10 shadow-sm border border-blue-200 text-stone-900 font-sans max-w-2xl mx-auto">
                <div className="flex items-start justify-between border-b-2 border-blue-900 pb-5 mb-6">
                  <div>
                    <div className="text-2xl font-black tracking-tight text-blue-950">BOSTROSHOILY</div>
                    <p className="text-[11px] font-bold text-blue-700">হোলসেল ও টেক্সটাইল সাপ্লাই বিভাগ</p>
                    <p className="text-[10px] text-stone-500 mt-1">তাঁতপল্লী, বেলকুচি, সিরাজগঞ্জ | মোবাইল: +880 1864-528488</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                      পাইকারি চালান (B2B COMMERCIAL BILL)
                    </span>
                    <div className="mt-2 text-xs font-bold font-mono">বিল নং: {invoiceNumber}</div>
                    <div className="text-[11px] text-stone-500">তারিখ: {invoiceDate}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-200 mb-6 text-xs">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-blue-800 block mb-0.5">ক্রেতা প্রতিষ্ঠান (Buyer / Party):</span>
                    <div className="font-black text-stone-950 text-sm">{businessName}</div>
                    <div className="text-stone-700 mt-0.5">প্রতিনিধি: {customerName}</div>
                    <div className="text-stone-600 font-mono">{customerPhone}</div>
                  </div>
                  <div>
                    <span className="font-bold text-[10px] uppercase text-blue-800 block mb-0.5">পরিবহন ও কুরিয়ার:</span>
                    <div className="font-semibold text-stone-800">{transportName}</div>
                    <div className="text-stone-600 mt-0.5">গন্তব্য: {customerAddress}</div>
                  </div>
                </div>

                <table className="w-full text-xs border border-stone-200 rounded-lg overflow-hidden mb-6">
                  <thead>
                    <tr className="bg-blue-900 text-white text-[11px] uppercase">
                      <th className="py-2.5 px-3 text-left">নং</th>
                      <th className="py-2.5 px-3 text-left">আইটেম বিবরণী</th>
                      <th className="py-2.5 px-3 text-center">একক</th>
                      <th className="py-2.5 px-3 text-right">পাইকারি দর</th>
                      <th className="py-2.5 px-3 text-center">লট / থান</th>
                      <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-mono text-stone-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-stone-900">{item.name}</td>
                        <td className="py-2 px-3 text-center text-stone-600">{item.unit || 'পিস'}</td>
                        <td className="py-2 px-3 text-right font-mono">৳{item.rate}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono">৳{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* B2B Totals with Previous Due */}
                <div className="flex justify-between items-start border-t border-stone-200 pt-4">
                  <div className="max-w-xs text-[11px] text-stone-600 space-y-1">
                    <p className="font-bold text-stone-800">পেমেন্ট শর্তাবলী:</p>
                    <p>চালান প্রাপ্তির ৭২ ঘণ্টার মধ্যে ব্যাংকিং চ্যানেল বা কুরিয়ার কন্ডিশনে অবশিষ্ট মূল্য পরিশোধযোগ্য।</p>
                  </div>

                  <div className="w-60 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>চলতি বিল মোট:</span>
                      <span className="font-bold font-mono text-stone-900">৳{subtotal}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>পরিবহন / লেবার:</span>
                        <span className="font-bold font-mono text-stone-900">৳{deliveryCharge}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>হোলসেল ছাড়:</span>
                        <span className="font-mono">-৳{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-900 font-bold pt-1 border-t border-stone-200">
                      <span>সর্বমোট চলতি বিল:</span>
                      <span className="font-mono">৳{grandTotal}</span>
                    </div>
                    {previousDue > 0 && (
                      <div className="flex justify-between text-amber-900 font-bold">
                        <span>পূর্বের বকেয়া:</span>
                        <span className="font-mono">+৳{previousDue}</span>
                      </div>
                    )}
                    {paidAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>নগদ / ব্যাংক জমা:</span>
                        <span className="font-mono">-৳{paidAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black border-t-2 border-blue-900 pt-2 text-blue-950">
                      <span>নিট প্রদেয় বকেয়া:</span>
                      <span className="text-base text-rose-800 font-mono">৳{netBalanceDue}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-12 mt-8 text-center text-xs text-stone-500 border-t border-stone-100">
                  <div>
                    <div className="border-t border-dashed border-stone-400 w-36 mx-auto pt-1 font-bold text-stone-700">
                      গ্রহীতার স্বাক্ষর ও সিল
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-dashed border-stone-400 w-36 mx-auto pt-1 font-bold text-stone-700">
                      বস্ত্র শৈলী হিসাব বিভাগ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 3: CASH MEMO / POS RECEIPT */}
            {activeFormat === 'cash_memo' && (
              <div id="printable-invoice" className="bg-white rounded-xl p-6 shadow-sm border border-stone-300 text-stone-900 font-mono text-xs max-w-sm mx-auto space-y-4">
                <div className="text-center border-b border-dashed border-stone-300 pb-3">
                  <h3 className="font-black text-base text-stone-950 tracking-wider">BOSTROSHOILY</h3>
                  <p className="text-[10px] text-stone-600 font-sans">বস্ত্র শৈলী • সিরাজগঞ্জ শোরুম</p>
                  <p className="text-[10px] text-stone-500">ফোন: 01864-528488</p>
                  <div className="inline-block px-2 py-0.5 mt-2 bg-stone-100 rounded text-[10px] font-bold">
                    ক্যাশ মেমো / পিওএস রসিদ
                  </div>
                </div>

                <div className="text-[11px] space-y-0.5 border-b border-dashed border-stone-300 pb-2">
                  <div className="flex justify-between">
                    <span>রসিদ নং:</span>
                    <span className="font-bold">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>তারিখ ও সময়:</span>
                    <span>{invoiceDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ক্রেতা:</span>
                    <span className="font-sans font-bold">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>মোবাইল:</span>
                    <span>{customerPhone}</span>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-stone-300 text-stone-600">
                      <th className="text-left pb-1 font-normal font-sans">আইটেম</th>
                      <th className="text-center pb-1 font-normal">পরি.</th>
                      <th className="text-right pb-1 font-normal">দর</th>
                      <th className="text-right pb-1 font-normal">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dashed divide-stone-200">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="pt-1">
                        <td className="py-1.5 font-sans font-medium max-w-[130px] truncate">{item.name}</td>
                        <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-1.5 text-right font-mono">৳{item.rate}</td>
                        <td className="py-1.5 text-right font-bold font-mono">৳{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>সাব-টোটাল:</span>
                    <span>৳{subtotal}</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ:</span>
                      <span>৳{deliveryCharge}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>ছাড় / অফার:</span>
                      <span>-৳{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm border-t border-stone-900 pt-1">
                    <span>সর্বমোট:</span>
                    <span>৳{grandTotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-600 pt-1">
                    <span>পেমেন্ট:</span>
                    <span>{paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500 font-sans space-y-1">
                  <p className="font-bold text-stone-800">ধন্যবাদ! আবার আসবেন।</p>
                  <p>বস্ত্র শৈলী — খাঁটি দেশীয় ঐতিহ্যের বিশ্বস্ত ঠিকানা</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
