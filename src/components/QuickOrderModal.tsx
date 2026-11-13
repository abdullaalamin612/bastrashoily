import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, ColorItem, SizeItem } from '../types';
import { useShop } from '../context/ShopContext';
import {
  X,
  ShoppingBasket,
  Truck,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  ShieldCheck,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface QuickOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialVariant?: ProductVariant;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  product,
  isOpen,
  onClose,
  initialVariant,
}) => {
  const { createOrder, colors, sizes, openInvoiceModal, showToast, navigateToTracking } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(initialVariant);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');

  // Form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [customerNotes, setCustomerNotes] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Sync state when product opens
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setConfirmedOrder(null);
      setIsSubmitting(false);

      if (product.variants && product.variants.length > 0) {
        const activeVars = product.variants.filter((v) => v.active !== 0 && v.stock > 0);
        const def = initialVariant || activeVars[0] || product.variants[0];
        setSelectedVariant(def);
        setSelectedColorId(def.colorId || '');
        setSelectedSizeId(def.sizeId || '');
      } else {
        setSelectedVariant(undefined);
        setSelectedColorId('');
        setSelectedSizeId('');
      }
    }
  }, [product, initialVariant, isOpen]);

  // Handle color change
  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    if (!product?.variants) return;
    const matched = product.variants.find(
      (v) => v.colorId === colorId && (selectedSizeId ? v.sizeId === selectedSizeId : true)
    );
    if (matched) {
      setSelectedVariant(matched);
    } else {
      const anyWithColor = product.variants.find((v) => v.colorId === colorId);
      if (anyWithColor) {
        setSelectedVariant(anyWithColor);
        if (anyWithColor.sizeId) setSelectedSizeId(anyWithColor.sizeId);
      }
    }
  };

  // Handle size change
  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    if (!product?.variants) return;
    const matched = product.variants.find(
      (v) => v.sizeId === sizeId && (selectedColorId ? v.colorId === selectedColorId : true)
    );
    if (matched) {
      setSelectedVariant(matched);
    }
  };

  if (!isOpen || !product) return null;

  // Price calculations
  const unitPrice =
    selectedVariant?.offerPrice ||
    (selectedVariant ? selectedVariant.price : product.discountPrice || product.price);
  const regularPrice = selectedVariant ? selectedVariant.price : product.price;
  const deliveryCharge = deliveryArea === 'inside_dhaka' ? 70 : 130;
  const subtotal = unitPrice * quantity;
  const grandTotal = subtotal + deliveryCharge;

  // Available colors/sizes
  const availableColors = (product.variants || []).reduce((acc: ColorItem[], v) => {
    const c = colors.find((col) => col.id === v.colorId);
    if (c && !acc.find((item) => item.id === c.id)) acc.push(c);
    return acc;
  }, []);

  const availableSizes = (product.variants || []).reduce((acc: SizeItem[], v) => {
    if (!v.sizeId) return acc;
    const s = sizes.find((sz) => sz.id === v.sizeId);
    if (s && !acc.find((item) => item.id === s.id)) acc.push(s);
    return acc;
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('অনুগ্রহ করে আপনার পুরো নাম লিখুন');
      return;
    }
    const toAsciiDigits = (val: string) =>
      String(val || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
    let cleanPhone = toAsciiDigits(customerPhone).replace(/\D/g, '');
    if (cleanPhone.startsWith('00880')) cleanPhone = cleanPhone.slice(4);
    else if (cleanPhone.startsWith('8801')) cleanPhone = cleanPhone.slice(2);
    else if (cleanPhone.startsWith('880')) cleanPhone = '0' + cleanPhone.slice(3);
    else if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) cleanPhone = '0' + cleanPhone;

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর (যেমন: 017XXXXXXXX) লিখুন');
      return;
    }
    if (!deliveryAddress.trim()) {
      showToast('অনুগ্রহ করে ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: '',
        deliveryAddress: deliveryAddress.trim(),
        district: deliveryArea === 'inside_dhaka' ? 'ঢাকা (Dhaka)' : 'ঢাকার বাইরে (Outside Dhaka)',
        deliveryArea: deliveryArea === 'inside_dhaka' ? 'inside_dhaka' : 'outside_dhaka',
        paymentMethod,
        orderStatus: 'pending' as const,
        paymentStatus: 'pending' as const,
        customerNotes: customerNotes.trim(),
        deliveryCharge,
        discount: 0,
        subtotal,
        total: grandTotal,
        orderSource: 'quick_express_checkout',
        items: [
          {
            productId: product.id,
            productName: product.name,
            banglaName: product.banglaName,
            variantId: selectedVariant?.id || 'default',
            color: colors.find((c) => c.id === selectedColorId)?.bangla_name || '',
            size: sizes.find((s) => s.id === selectedSizeId)?.name || '',
            sku: selectedVariant?.sku || product.sku,
            quantity,
            price: unitPrice,
            unitPrice,
            totalPrice: subtotal,
            image: selectedVariant?.image || product.mainImage,
          },
        ],
      };

      let confirmed: any = null;
      let shouldFallbackLocal = false;

      try {
        const res = await fetch('/api/checkout/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && (data.order || data.orderId)) {
          const bo = data.order || {};
          const finalOrderId = data.orderId || bo.id;
          const synced = createOrder(
            {
              ...orderData,
              ...bo,
              id: finalOrderId,
              items: Array.isArray(bo.items) && bo.items.length > 0 ? bo.items : orderData.items,
            },
            true
          );
          confirmed = bo.id ? bo : synced;
        } else if (!res.ok && res.status >= 400 && res.status < 500) {
          showToast(data?.error || 'অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে তথ্য যাচাই করুন।');
          return;
        } else {
          shouldFallbackLocal = true;
        }
      } catch {
        shouldFallbackLocal = true;
      }

      if (!confirmed && shouldFallbackLocal) {
        confirmed = createOrder(orderData);
      }

      if (confirmed) {
        setConfirmedOrder(confirmed);
        showToast('অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে');
      } else {
        showToast('অর্ডার সম্পন্ন করা যায়নি, অনুগ্রহ করে পুনরায় চেষ্টা করুন');
      }
    } catch (err: any) {
      showToast(err?.message || 'অর্ডার করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-stone-200/90 text-stone-900">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow-md">
              <ShoppingBasket className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-base sm:text-lg tracking-tight">
                ১-ক্লিকে দ্রুত অর্ডার (Express Checkout)
              </h2>
              <p className="text-stone-300 text-xs flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা পরিশোধ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {confirmedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                ধন্যবাদ! অর্ডার কনফার্ম হয়েছে
              </h3>
              <p className="text-stone-600 text-sm">
                অর্ডার নম্বর:{' '}
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {confirmedOrder.id}
                </span>
              </p>
              <p className="text-xs text-stone-500">
                আমাদের কাস্টমার সাপোর্ট প্রতিনিধি খুব দ্রুত আপনার সাথে ফোনে যোগাযোগ করবে।
              </p>
            </div>

            {/* Order Brief Box */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">পণ্য:</span>
                <span className="font-bold text-stone-900">{product.name} ({quantity} টি)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">গ্রাহক:</span>
                <span className="font-semibold text-stone-800">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ঠিকানা:</span>
                <span className="text-stone-800 text-right max-w-[240px] truncate">{confirmedOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-black text-sm text-stone-900">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-amber-800">৳{confirmedOrder.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  openInvoiceModal(confirmedOrder);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>ইনভয়েস দেখুন / প্রিন্ট</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all cursor-pointer"
              >
                আরও কেনাকাটা করুন
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Product Summary Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <img
                src={selectedVariant?.image || product.mainImage}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 mb-1">
                  ইন স্টক • সরাসরি ফ্যাক্টরি মূল্য
                </span>
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-black text-sm sm:text-base text-stone-950">
                    ৳{unitPrice}
                  </span>
                  {regularPrice > unitPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ৳{regularPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-xs overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold text-base cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-black text-xs sm:text-sm text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold text-base cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Variants Selector (Color & Size) */}
            {availableColors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  রঙ নির্বাচন করুন (Color)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((col) => {
                    const isSelected = selectedColorId === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleColorSelect(col.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-950 text-white border-stone-950 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: col.hex_code }}
                        />
                        <span>{col.bangla_name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  সাইজ নির্বাচন করুন (Size)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSizeId === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => handleSizeSelect(sz.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {sz.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customer Information Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  আপনার পুরো নাম (Full Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: মোঃ আব্দুল্লাহ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  মোবাইল নম্বর (১১ ডিজিট) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm font-medium outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা, থানা এবং জেলা"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm font-medium outline-hidden resize-none"
                />
              </div>
            </div>

            {/* Delivery Area Options */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                ডেলিভারি এরিয়া নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryArea('inside_dhaka')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    deliveryArea === 'inside_dhaka'
                      ? 'border-amber-600 bg-amber-50/80 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs sm:text-sm text-stone-900">ঢাকার ভিতরে</span>
                    <span className="font-black text-xs text-amber-800">৳৭০</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1">হোম ডেলিভারি (২৪-৪৮ ঘণ্টা)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryArea('outside_dhaka')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    deliveryArea === 'outside_dhaka'
                      ? 'border-amber-600 bg-amber-50/80 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs sm:text-sm text-stone-900">ঢাকার বাইরে</span>
                    <span className="font-black text-xs text-amber-800">৳১৩০</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1">সমগ্র বাংলাদেশ (৪৮-৭২ ঘণ্টা)</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                পেমেন্ট পদ্ধতি
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  ক্যাশ অন ডেলিভারি
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                    paymentMethod === 'bkash'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  বিকাশ (bKash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  নগদ (Nagad)
                </button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 space-y-1.5">
              <div className="flex justify-between text-xs text-stone-300">
                <span>পণ্যের মূল্য ({quantity} টি):</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-300">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-amber-400 pt-2 border-t border-stone-800">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-lg">৳{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-stone-950 hover:text-white font-black text-base sm:text-lg tracking-wide uppercase shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-stone-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>অর্ডার কনফার্ম করুন • ৳{grandTotal}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            {/* Trust Points */}
            <div className="flex items-center justify-around text-[11px] text-stone-500 pt-1 border-t border-stone-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ১০০% আসল পণ্য
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                সারাদেশে দ্রুত ডেলিভারি
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                পণ্য দেখে পেমেন্ট
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
