import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useShop } from '../context/ShopContext';
import { encodeCode128B } from '../utils/barcode128';
import {
  Printer,
  X,
  Download,
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ShoppingBasket,
  CheckSquare,
  FileText,
  Tag,
  Package,
  Layers,
  Copy,
} from 'lucide-react';

// Authoritative ISO/IEC 15417 Code 128 (Subset B) Barcode Component
const BarcodeSvg: React.FC<{ value: string; height?: number; className?: string; showText?: boolean }> = ({
  value,
  height = 42,
  className = '',
  showText = true,
}) => {
  const { elements, totalWidth, text } = encodeCode128B(value);

  let currentX = 0;
  const rects: React.ReactNode[] = [];

  elements.forEach((el, idx) => {
    const x = currentX;
    currentX += el.width;
    if (el.isBlack) {
      rects.push(
        <rect
          key={idx}
          x={x}
          y={0}
          width={el.width}
          height={height}
          fill="#09090b"
          shapeRendering="crispEdges"
        />
      );
    }
  });

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[260px] h-auto"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-[0.2em] font-bold text-stone-900 mt-1">
          *{text}*
        </span>
      )}
    </div>
  );
};

export const InvoiceModal: React.FC = () => {
  const {
    activeInvoiceOrder,
    closeInvoiceModal,
    footerConfig,
    invoiceConfig,
    products,
    navigateToHome,
    navigateToTracking,
    showToast,
  } = useShop();

  // 3 Distinct Invoice Tabs:
  // 1. 'customer' -> Customer Invoice (কাস্টমার ইনভয়েস)
  // 2. 'packing' -> Packing Slip (প্যাকিং স্লিপ — ওয়্যারহাউস প্যাক চেকলিস্ট)
  // 3. 'courier' -> Delivery/Courier Label (কুরিয়ার প্যাকেটে লাগানোর ৪x৬ স্টিকার লেবেল)
  const [activeTab, setActiveTab] = useState<'customer' | 'packing' | 'courier'>('customer');

  // Close on Escape key press
  useEffect(() => {
    if (!activeInvoiceOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInvoiceModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInvoiceOrder, closeInvoiceModal]);

  if (!activeInvoiceOrder) return null;

  const order = activeInvoiceOrder;
  const brandLogoUrl = '/assets/aistudio/______20261029_115735_0000_447a9ca4.png';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const isCourier = activeTab === 'courier';
      const isPacking = activeTab === 'packing';

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isCourier ? [100, 150] : 'a4',
      });

      const title = isCourier
        ? `BOSTROSHOILY - COURIER DELIVERY LABEL`
        : isPacking
        ? `BOSTROSHOILY - WAREHOUSE PACKING SLIP`
        : `BOSTROSHOILY - CUSTOMER INVOICE`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isCourier ? 13 : 16);
      doc.text('BOSTROSHOILY (বস্ত্র শৈলী)', 12, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(title, 12, 17);
      doc.text(`Order ID: #${order.id}`, 12, 21);
      doc.text(`Date: ${order.orderDate || new Date().toISOString().split('T')[0]}`, 12, 25);
      doc.text(`Hotline: 01864528488 | Belkuchi, Sirajganj`, 12, 29);

      // Customer Info Box
      const boxW = isCourier ? 76 : 186;
      doc.setDrawColor(180, 180, 180);
      doc.rect(12, 33, boxW, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('RECIPIENT / CUSTOMER:', 15, 38);
      doc.text(String(order.customerName || 'Customer'), 15, 43);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Phone: ${order.customerPhone || ''}`, 15, 48);
      const safeAddr = String(order.deliveryAddress || '').substring(0, isCourier ? 38 : 90);
      doc.text(`Address: ${safeAddr}`, 15, 52);
      doc.text(`District: ${order.district || 'Sirajganj'}`, 15, 56);

      // Items Table Header
      let y = 63;
      doc.setFillColor(24, 24, 27);
      doc.rect(12, y, boxW, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Item Description', 15, y + 5);
      doc.text('Qty', isCourier ? 65 : 125, y + 5);
      if (!isCourier) {
        doc.text('Unit Price', 145, y + 5);
        doc.text('Total', 175, y + 5);
      }
      y += 7;

      // Table Rows
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      (order.items || []).forEach((item, idx) => {
        const itemY = y + (idx * 6.5) + 5;
        const name = (item.productName || 'Item').substring(0, isCourier ? 26 : 50);
        doc.text(name, 15, itemY);
        doc.text(String(item.quantity || 1), isCourier ? 67 : 127, itemY);
        if (!isCourier) {
          doc.text(`BDT ${item.price || item.unitPrice || 0}`, 145, itemY);
          doc.text(`BDT ${(item.price || item.unitPrice || 0) * (item.quantity || 1)}`, 175, itemY);
        }
      });

      // Summary
      const summaryY = y + Math.max(1, (order.items?.length || 1)) * 6.5 + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Total Amount (COD): BDT ${order.total || 0}`, 15, summaryY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Payment: ${(order.paymentMethod || 'COD').toUpperCase()} (${order.paymentStatus || 'pending'})`, 15, summaryY + 5);

      if (isCourier) {
        const trackCode = order.courierTrackingCode || '[ Pending / Unassigned ]';
        doc.text(`Courier Tracking: ${trackCode}`, 15, summaryY + 10);
      }

      // Barcode text representation
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`*${order.id}*`, 15, summaryY + (isCourier ? 17 : 20));

      const filename = `${isCourier ? 'Courier-Label' : isPacking ? 'Packing-Slip' : 'Customer-Invoice'}-${order.id}.pdf`;
      doc.save(filename);
      showToast('পিডিএফ সফলভাবে ডাউনলোড হয়েছে');
    } catch (err: any) {
      console.warn('PDF export fallback:', err);
      window.print();
    }
  };

  const handleDownloadHtml = () => {
    try {
      const printableElement = document.getElementById('printable-invoice-content');
      if (!printableElement) {
        window.print();
        return;
      }

      const invoiceTitle =
        activeTab === 'customer'
          ? `Customer-Invoice-${order.id}`
          : activeTab === 'packing'
          ? `Packing-Slip-${order.id}`
          : `Courier-Label-${order.id}`;

      const standaloneHtml = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${invoiceTitle} - BOSTROSHOILY</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #fff; color: #1c1917; padding: 20px; font-size: 13px; line-height: 1.4; }
    @media print {
      body { padding: 0; }
      @page { margin: 8mm; }
    }
  </style>
</head>
<body>
  ${printableElement.innerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 200);
    };
  </script>
</body>
</html>
      `;

      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceTitle}-Bostroshoily.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('ডকুমেন্ট ডাউনলোড সম্পন্ন হয়েছে');
    } catch (err: any) {
      window.print();
    }
  };

  return (
    <div
      id="invoice-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeInvoiceModal();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        {/* Top Header / Action Bar */}
        <div className="no-print bg-stone-900 text-white px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between shrink-0 shadow-md gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                closeInvoiceModal();
                navigateToHome();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all border border-stone-700 cursor-pointer shadow-xs active:scale-95"
              title="হোমে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>হোমে ফিরুন</span>
            </button>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-bold text-xs sm:text-base tracking-tight">
                অর্ডার #{order.id}
              </span>
            </div>
          </div>

          {/* 3 Tab Switcher */}
          <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>১. কাস্টমার ইনভয়েস</span>
            </button>
            <button
              onClick={() => setActiveTab('packing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'packing'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>২. প্যাকিং স্লিপ</span>
            </button>
            <button
              onClick={() => setActiveTab('courier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courier'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>৩. কুরিয়ার লেবেল (4x6")</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              title="প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-stone-700 active:scale-95 cursor-pointer shadow-xs"
              title="পিডিএফ ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>PDF ডাউনলোড</span>
            </button>

            <button
              onClick={closeInvoiceModal}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 bg-stone-100/60 text-stone-900 text-sm">
          <div id="printable-invoice-content" className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-8 max-w-3xl mx-auto">
            {/* =========================================================================
                FORMAT 1: CUSTOMER INVOICE (কাস্টমার ইনভয়েস)
               ========================================================================= */}
            {activeTab === 'customer' && (
              <div className="space-y-6">
                {/* Header with User Logo & Brand Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-stone-900 pb-5 gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={brandLogoUrl}
                      alt="BOSTROSHOILY"
                      className="h-16 w-auto object-contain shrink-0"
                    />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                        বস্ত্র শৈলী (BOSTROSHOILY)
                      </h2>
                      <p className="text-xs text-amber-900 font-bold tracking-wide">
                        সিরাজগঞ্জের খাঁটি তাঁত পণ্য ও প্রিমিয়াম পোশাক
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ | হটলাইন: {footerConfig?.phone || '01864528488'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="inline-block bg-stone-900 text-white font-mono font-bold px-3 py-1 rounded-lg text-sm sm:text-base mb-1">
                      INVOICE #{order.id}
                    </div>
                    <p className="text-xs text-stone-600 flex items-center sm:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>তারিখ: {order.orderDate || (order as any).order_date || new Date().toLocaleDateString('bn-BD')}</span>
                    </p>
                    <div className="mt-1">
                      <BarcodeSvg value={order.id} height={32} />
                    </div>
                  </div>
                </div>

                {/* Customer Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                      গ্রাহকের বিবরণ (Customer Info):
                    </span>
                    <p className="font-extrabold text-stone-900 text-sm sm:text-base">{order.customerName}</p>
                    <p className="text-stone-700 flex items-center gap-1.5 mt-1 font-mono text-xs sm:text-sm font-bold">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{order.customerPhone}</span>
                    </p>
                    {order.customerEmail && (
                      <p className="text-stone-600 text-xs flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-amber-600" />
                        <span>{order.customerEmail}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
                      ডেলিভারি ঠিকানা ও পেমেন্ট (Shipping & Payment):
                    </span>
                    <p className="text-stone-800 text-xs sm:text-sm font-medium flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress}
                        {order.district && !order.deliveryAddress.includes(order.district) ? `, ${order.district}` : ''}
                      </span>
                    </p>
                    <div className="mt-2 text-xs text-stone-700 flex flex-wrap items-center gap-2">
                      <span className="font-bold">পেমেন্ট:</span>
                      <span className="uppercase font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                        {order.paymentMethod || 'COD'}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'পরিশোধিত (PAID)' : 'ক্যাশ অন ডেলিভারি (COD)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-stone-900 text-white font-bold text-xs uppercase">
                        <th className="p-3">পণ্য বিবরণী</th>
                        <th className="p-3 text-center">SKU</th>
                        <th className="p-3 text-right">একক মূল্য</th>
                        <th className="p-3 text-center">পরিমাণ</th>
                        <th className="p-3 text-right">মোট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const unitPrice = item.price || item.unitPrice || 0;
                          const qty = item.quantity || 1;
                          const total = item.totalPrice || unitPrice * qty;
                          const matchedProduct = products.find(
                            (p) => p.id === item.productId || p.slug === item.productId
                          );
                          const img =
                            item.image ||
                            matchedProduct?.mainImage ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80';

                          return (
                            <tr key={idx} className="hover:bg-stone-50">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={img}
                                    alt={item.productName}
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-stone-900">
                                      {item.productName || matchedProduct?.name || 'বস্ত্র শৈলী (BOSTROSHOILY) পোশাক'}
                                    </p>
                                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                                      {item.color && (
                                        <span>রং: <strong className="text-stone-800">{item.color}</strong></span>
                                      )}
                                      {item.size && (
                                        <span>সাইজ: <strong className="text-stone-800">{item.size}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono text-xs text-stone-600">
                                {item.sku || 'BS-GEN'}
                              </td>
                              <td className="p-3 text-right font-medium">৳{unitPrice.toLocaleString()}</td>
                              <td className="p-3 text-center font-bold">{qty}</td>
                              <td className="p-3 text-right font-bold text-stone-900">৳{total.toLocaleString()}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-stone-400">
                            কোনো পণ্য পাওয়া যায়নি
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Totals & Terms */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                  <div className="text-xs text-stone-500 max-w-sm space-y-1.5">
                    <p className="font-bold text-stone-800">পরামর্শ ও শর্তাবলী:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>পণ্য গ্রহণের সময় ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন।</li>
                      <li>যেকোনো সমস্যায় ৭ দিনের মধ্যে সহজ রিটার্ন বা এক্সচেঞ্জের সুযোগ রয়েছে।</li>
                      <li>বস্ত্র শৈলী (BOSTROSHOILY)-এর সাথে থাকার জন্য ধন্যবাদ!</li>
                    </ul>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>সাবটোটাল:</span>
                      <span className="font-medium">৳{(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-medium">৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>ডিসকাউন্ট:</span>
                        <span>-৳{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-stone-900 pt-2 flex justify-between text-base font-black text-stone-950">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-amber-800">৳{(order.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="pt-8 border-t border-stone-200 flex justify-between items-end text-xs text-stone-500">
                  <div>
                    <BarcodeSvg value={order.id} height={28} />
                  </div>
                  <div className="text-right">
                    <div className="border-t border-stone-800 pt-1 font-semibold text-stone-900 italic">
                      অনুমোদিত স্বাক্ষর (Authorized Signature)
                    </div>
                    <p className="text-[10px] text-stone-400">বস্ত্র শৈলী (BOSTROSHOILY) ডিজিটাল ইনভয়েস সিস্টেম</p>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                FORMAT 2: PACKING SLIP (প্যাকিং স্লিপ — ওয়্যারহাউস প্যাক ও চেকলিস্ট)
               ========================================================================= */}
            {activeTab === 'packing' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-stone-900 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={brandLogoUrl}
                      alt="BOSTROSHOILY"
                      className="h-14 w-auto object-contain"
                    />
                    <div>
                      <h2 className="text-xl font-black text-stone-900 tracking-tight">
                        ওয়্যারহাউস প্যাকিং স্লিপ (PACKING SLIP)
                      </h2>
                      <p className="text-xs text-stone-500 font-semibold">
                        প্যাকেট প্রস্তুত ও চেকিং ডকুমেন্ট — অর্ডার #{order.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <BarcodeSvg value={`PACK-${order.id}`} height={34} />
                    <p className="text-[11px] font-mono text-stone-600 mt-1">
                      প্যাক ডেট: {new Date().toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                {/* Dispatch Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">কাস্টমার নাম:</span>
                    <strong className="text-stone-900 text-sm">{order.customerName}</strong>
                    <p className="text-stone-600 font-mono">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">গন্তব্য জেলা ও থানা:</span>
                    <strong className="text-stone-900">{order.district || 'ঢাকা'}</strong>
                    <p className="text-stone-500 text-[11px] truncate">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">পেমেন্ট মেথড:</span>
                    <strong className="text-amber-800 uppercase">{order.paymentMethod}</strong>
                    <p className="text-stone-600">
                      কালেকশন: <strong className="text-stone-900 font-mono">৳{order.total}</strong>
                    </p>
                  </div>
                </div>

                {/* Packing Checklist Table */}
                <div className="border border-stone-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-900 text-white uppercase text-[11px] font-bold">
                        <th className="p-2.5 text-center w-12">চেক</th>
                        <th className="p-2.5">পণ্য ও ছবি</th>
                        <th className="p-2.5">SKU / বারকোড</th>
                        <th className="p-2.5 text-center">কালার</th>
                        <th className="p-2.5 text-center">সাইজ</th>
                        <th className="p-2.5 text-center w-20">অর্ডার সংখ্যা</th>
                        <th className="p-2.5 text-center w-24">প্যাকড স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                          const matchedProduct = products.find(
                            (p) => p.id === item.productId || p.slug === item.productId
                          );
                          const img =
                            item.image ||
                            matchedProduct?.mainImage ||
                            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80';

                          return (
                            <tr key={idx} className="hover:bg-amber-50/40">
                              <td className="p-2.5 text-center">
                                <div className="w-5 h-5 border-2 border-stone-400 rounded-md mx-auto" />
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={img}
                                    alt={item.productName}
                                    className="w-8 h-8 object-cover rounded border border-stone-200"
                                  />
                                  <span className="font-bold text-stone-900">
                                    {item.productName || matchedProduct?.name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2.5 font-mono text-[11px] font-semibold text-stone-700">
                                {item.sku || 'BS-SKU'}
                              </td>
                              <td className="p-2.5 text-center font-bold text-stone-800">
                                {item.color || 'Standard'}
                              </td>
                              <td className="p-2.5 text-center font-bold text-stone-800">
                                {item.size || 'Free Size'}
                              </td>
                              <td className="p-2.5 text-center font-black text-stone-900 text-sm">
                                {item.quantity || 1} টি
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="inline-block border border-dashed border-stone-400 px-2 py-0.5 rounded text-[10px] text-stone-500 font-mono">
                                  [ &nbsp; ] OK
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-stone-400">
                            কোনো আইটেম নেই
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Packing Verification Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-stone-300 rounded-xl bg-stone-50 text-xs">
                  <div>
                    <h5 className="font-bold text-stone-900 mb-1">প্যাকিং চেকলিস্ট শর্ত:</h5>
                    <p className="text-stone-600 text-[11px]">
                      ১. ফেব্রিকের কোনো ছেঁড়া বা দাগ আছে কি না চেক করুন।<br />
                      ২. সঠিক সাইজ ও কালার লেবেল মিলিয়ে প্যাকেটে ভরুন।<br />
                      ৩. প্রতিটি প্যাকেটের মুখে সিকিউরিটি সিল নিশ্চিত করুন।
                    </p>
                  </div>
                  <div className="flex justify-between items-end border-t sm:border-t-0 sm:border-l border-stone-300 sm:pl-4 pt-2 sm:pt-0">
                    <div>
                      <span className="text-[10px] text-stone-500 block">প্যাকার নাম: ________________</span>
                      <span className="text-[10px] text-stone-500 block mt-2">প্যাকের তারিখ: ______________</span>
                    </div>
                    <div className="text-right">
                      <div className="w-24 border-b border-stone-900 pb-1 mb-1 text-[11px] font-bold text-stone-900">
                        সিল / স্বাক্ষর
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                FORMAT 3: DELIVERY / COURIER LABEL (কুরিয়ার লেবেল — ৪x৬ স্টিকার সাইজ)
               ========================================================================= */}
            {activeTab === 'courier' && (
              <div className="max-w-[420px] mx-auto border-2 border-stone-950 p-4 rounded-xl bg-white text-stone-950 shadow-md font-sans">
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b-2 border-stone-950 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={brandLogoUrl}
                      alt="বস্ত্র শৈলী (BOSTROSHOILY)"
                      className="h-12 w-auto object-contain"
                    />
                    <div>
                      <h3 className="font-black text-sm tracking-tight leading-tight">বস্ত্র শৈলী (BOSTROSHOILY)</h3>
                      <p className="text-[10px] font-bold text-stone-600">PARCEL DELIVERY LABEL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-stone-950 text-white font-mono text-xs px-2 py-0.5 rounded font-black">
                      #{order.id}
                    </span>
                    <p className="text-[9px] font-mono text-stone-500 mt-0.5">
                      {new Date().toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                {/* Primary Courier Tracking Barcode */}
                <div className="text-center py-2 border-b-2 border-stone-950">
                  <BarcodeSvg value={order.id} height={46} showText={true} />
                  <p className="text-[10px] font-mono text-stone-600 mt-1 font-semibold">
                    COURIER BOOKING: <span className={order.courierTrackingCode ? 'text-stone-950 font-bold' : 'text-amber-800'}>{order.courierTrackingCode || '[ অপেক্ষমাণ / Pending ]'}</span>
                  </p>
                </div>

                {/* High Contrast COD Amount Box */}
                <div className="my-2.5 p-2.5 bg-stone-950 text-white rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                      ক্যাশ অন ডেলিভারি (COD)
                    </span>
                    <span className="text-xs text-stone-300">গ্রাহকের থেকে আদায়যোগ্য</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      ৳{(order.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Recipient Details (Customer Bill-To) */}
                <div className="border border-stone-950 rounded-lg p-3 my-2 bg-stone-50">
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-500 block mb-1">
                    প্রাপক (RECIPIENT / CUSTOMER):
                  </span>
                  <h4 className="font-black text-base text-stone-950 leading-tight">
                    {order.customerName}
                  </h4>
                  <p className="font-black font-mono text-sm sm:text-base text-amber-900 mt-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{order.customerPhone}</span>
                  </p>
                  <p className="text-xs font-semibold text-stone-800 mt-1 leading-snug">
                    ঠিকানা: {order.deliveryAddress}
                  </p>
                  <p className="text-xs font-black text-stone-950 mt-1">
                    জেলা: <span className="underline">{order.district || 'ঢাকা'}</span>
                  </p>
                </div>

                {/* Package Contents Summary */}
                <div className="border-t border-b border-stone-200 py-1.5 my-2 text-[11px] text-stone-600">
                  <span className="font-bold text-stone-900">আইটেম সংখ্যা:</span> {order.items?.length || 1} টি (
                  {order.items?.map((it) => `${it.productName} (${it.quantity})`).join(', ') || 'পোশাক'}
                  )
                </div>

                {/* Sender Details */}
                <div className="pt-2 text-[10px] text-stone-600 leading-tight">
                  <strong className="text-stone-900 block text-[11px]">প্রেরক (SENDER):</strong>
                  বস্ত্র শৈলী (BOSTROSHOILY), তাঁতপল্লী রোড, বেলকুচি, সিরাজগঞ্জ।
                  <br />
                  হটলাইন: <strong>01864528488</strong> | ওয়েব: {typeof window !== 'undefined' ? window.location.host : 'bostroshoily.onrender.com'}
                </div>

                {/* Warning / Courier Note */}
                <div className="mt-2 text-center bg-amber-50 border border-amber-300 rounded p-1 text-[10px] font-bold text-amber-950">
                  ⚠️ পণ্যটি চেক করে ডেলিভারি দিন। কোনো সমস্যায় হেল্পলাইনে কল করুন।
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
