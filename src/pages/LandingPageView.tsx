import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { LandingPage, Product } from '../types';
import {
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ShoppingBasket,
  Star,
  ChevronDown,
  ArrowRight,
  Flame,
  Clock,
  Award,
} from 'lucide-react';

interface LandingPageViewProps {
  slug?: string;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ slug: propSlug }) => {
  const {
    products,
    createOrder,
    showToast,
    navigateToHome,
    openInvoiceModal,
  } = useShop();

  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Determine current slug from prop or URL hash
  const currentSlug = propSlug || window.location.hash.replace('#/campaign/', '').replace('#/landing/', '') || 'special-handloom-offer';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/landing-pages/${currentSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.page) {
          setLandingPage(data.page);
          if (data.product) {
            setProduct(data.product);
          } else {
            const matched = products.find((p) => p.id === data.page.product_id);
            if (matched) setProduct(matched);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentSlug, products]);

  const activeProduct = product || products[0];
  const unitPrice = landingPage?.offer_price || activeProduct?.price || 1450;
  const regularPrice = landingPage?.regular_price || activeProduct?.originalPrice || (unitPrice + 400);
  const deliveryCharge = deliveryArea === 'inside_dhaka' ? (landingPage?.delivery_inside_dhaka ?? 70) : (landingPage?.delivery_outside_dhaka ?? 120);
  const subtotal = unitPrice * quantity;
  const totalAmount = subtotal + deliveryCharge;

  const scrollToOrderForm = () => {
    const el = document.getElementById('landing-order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('অনুগ্রহ করে আপনার নাম লিখুন');
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
      showToast('সঠিক ১১ ডিজিটের ফোন নাম্বার দিন (যেমন: 017XXXXXXXX)');
      return;
    }
    if (!customerAddress.trim()) {
      showToast('অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা লিখুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: customerAddress.trim(),
        district: deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
        deliveryCharge,
        subtotal,
        total: totalAmount,
        discount: Math.max(0, (regularPrice - unitPrice) * quantity),
        paymentMethod: 'cod' as const,
        orderSource: `landing_page:${landingPage?.slug || 'campaign'}`,
        items: [
          {
            productId: activeProduct?.id || 'prod-1',
            productName: activeProduct?.name || landingPage?.title || 'স্পেশাল প্রোডাক্ট',
            variantId: activeProduct?.variants?.[0]?.id || 'default',
            quantity,
            price: unitPrice,
            image: activeProduct?.mainImage || activeProduct?.featuredImage || activeProduct?.galleryImages?.[0] || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=500&q=80',
            selectedColor: activeProduct?.variants?.[0]?.color || activeProduct?.colors?.[0] || 'Default',
            selectedSize: activeProduct?.variants?.[0]?.size || activeProduct?.sizes?.[0] || 'Regular',
          },
        ],
      };

      const res = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && (data.order || data.orderId)) {
        const syncedOrder = createOrder(
          {
            ...orderPayload,
            ...(data.order || {}),
            id: data.orderId || data.order?.id,
            paymentStatus: 'pending',
            orderStatus: 'pending',
          },
          true
        );
        setOrderSuccess(data.order || syncedOrder);
        showToast('অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।');
      } else {
        showToast(data.error || 'অর্ডার করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      showToast('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract YouTube embed URL safely
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
  };

  const videoEmbed = getEmbedUrl(landingPage?.video_url);

  if (loading && !landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-600">ল্যান্ডিং পেজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // If order was just placed, display Order Success & Invoice Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Congratulations! অর্ডার নিশ্চিত হয়েছে
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              আপনার অর্ডারটি আমাদের কাছে সফলভাবে পৌঁছেছে!
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              আমাদের একজন প্রতিনিধি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি কনফার্ম করবেন।
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 sm:p-6 text-left border border-stone-200 space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">ইনভয়েস আইডি:</span>
              <span className="font-bold text-amber-700">#{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">গ্রাহকের নাম:</span>
              <span className="font-bold text-stone-800">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">মোবাইল নাম্বার:</span>
              <span className="font-bold text-stone-800">{orderSuccess.customerPhone}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-medium">পেমেন্ট মেথড:</span>
              <span className="font-bold text-emerald-700">Cash On Delivery</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg font-black pt-1 text-stone-900">
              <span>সর্বমোট পরিশোধযোগ্য:</span>
              <span className="text-amber-800">৳{orderSuccess.total?.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => openInvoiceModal(orderSuccess)}
              className="flex-1 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              ইনভয়েস ডাউনলোড / প্রিন্ট করুন
            </button>
            <button
              onClick={() => {
                setOrderSuccess(null);
                navigateToHome();
              }}
              className="py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
            >
              হোমপেজে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* 1. Top Urgency Announcement Bar (Video Style) */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-center py-2.5 px-4 shadow-sm text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>{landingPage?.badge_text || 'সীমিত সময়ের ধামাকা অফার! সরাসরি কারখানা থেকে হোম ডেলিভারি'}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* 2. Headline & Subheadline */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-950 leading-tight tracking-tight">
            {landingPage?.headline || activeProduct?.name || 'প্রিমিয়াম হ্যান্ডলুম সুতি লুঙ্গি ও পাঞ্জাবি স্পেশাল অফার'}
          </h1>
          {landingPage?.subheadline && (
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {landingPage.subheadline}
            </p>
          )}
        </div>

        {/* 3. Hero Visuals & Product Showcase Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
              <img
                src={activeProduct?.featuredImage || activeProduct?.images?.[0] || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'}
                alt={activeProduct?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-wider uppercase shadow-md">
                স্পেশাল ডিসকাউন্ট
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
                  100% খাঁটি দেশীয় তৈরি
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  {landingPage?.title || activeProduct?.name}
                </h2>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-3xl sm:text-4xl font-black text-rose-600">
                  ৳{unitPrice.toLocaleString('bn-BD')}
                </span>
                <span className="text-lg sm:text-xl text-stone-400 line-through">
                  ৳{regularPrice.toLocaleString('bn-BD')}
                </span>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                  ৳{(regularPrice - unitPrice).toLocaleString('bn-BD')} সাশ্রয়!
                </span>
              </div>

              {/* Direct Scroll to Order Button */}
              <button
                onClick={scrollToOrderForm}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <ShoppingBasket className="w-5 h-5" />
                <span>অর্ডার করতে ক্লিক করুন</span>
              </button>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${landingPage?.call_number || '01890123456'}`}
                  className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-xs sm:text-sm text-stone-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>আমাদের কল করুন</span>
                </a>
                <a
                  href={`https://wa.me/88${(landingPage?.whatsapp_number || '01890123456').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs sm:text-sm text-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Highlight Badges / 3 Guarantees (Exact Video Feature 03:13) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
          {(landingPage?.highlights && landingPage.highlights.length > 0
            ? landingPage.highlights
            : [
                { title: 'স্বাদে গন্ধে ইনস্ট্যান্ট রিচার্জ!', desc: 'শতভাগ আরামদায়ক ও পরিচ্ছন্ন সুতা' },
                { title: '১০০% অর্গানিক ও খাঁটি কোয়ালিটি', desc: 'মজবুত বুনন ও টেকসই সেলাই' },
                { title: 'শতভাগ প্রিমিয়াম নিশ্চয়তা', desc: 'দেখে বুঝে নেওয়ার পূর্ণ সুবিধা' },
              ]
          ).map((hl, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm sm:text-base text-stone-900">{hl.title}</h4>
              <p className="text-xs text-stone-500">{hl.desc}</p>
            </div>
          ))}
        </div>

        {/* 5. Product Video (Video Feature 03:17) */}
        {videoEmbed && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-stone-200 text-center space-y-4">
            <h3 className="text-lg sm:text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
              <span>প্রোডাক্টের ভিডিও দেখুন</span>
            </h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={videoEmbed}
                title="Product Showcase Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <button
              onClick={scrollToOrderForm}
              className="py-3.5 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              অর্ডার করতে ক্লিক করুন
            </button>
          </div>
        )}

        {/* 6. Product Benefits & Checklist (Video Feature 03:19) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-4">
          <h3 className="text-lg sm:text-2xl font-black text-stone-900 border-b border-stone-200 pb-3">
            আমাদের পণ্যের বিশেষ বৈশিষ্ট্যসমূহ
          </h3>
          <ul className="space-y-3">
            {(landingPage?.benefits && landingPage.benefits.length > 0
              ? landingPage.benefits
              : [
                  '১০০% খাঁটি সুতি ও আরামদায়ক টেক্সচার',
                  'রং পাকা ও দীর্ঘস্থায়ী কোয়ালিটির নিশ্চয়তা',
                  'সরাসরি ঐতিহ্যবাহী তাঁতপল্লী থেকে সংগৃহীত',
                  'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দেওয়ার সুবিধা)',
                  '৭ দিনের সহজ পরিবর্তন ও মানিব্যাক গ্যারান্টি',
                ]
            ).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base font-semibold text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Customer Reviews / Photo Proofs (Video Feature 03:20) */}
        {landingPage?.customerReviews && landingPage.customerReviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200 space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">সম্মানিত গ্রাহক মতামত</span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">২০+ কাস্টমার রিভিউ ও ফটো প্রুফ</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {landingPage.customerReviews.map((rev, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  {rev.photo ? (
                    <img src={rev.photo} alt={rev.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-amber-300" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0">
                      {rev.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-sm text-stone-900">{rev.name}</h5>
                    <div className="flex text-amber-500 my-0.5">
                      {'★'.repeat(5)}
                    </div>
                    <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Direct Embedded Checkout Form (Video Feature 03:21) */}
        <div id="landing-order-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500 space-y-6">
          <div className="text-center border-b border-stone-200 pb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              অর্ডার ফর্ম
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-stone-950">
              অর্ডারটি নিশ্চিত করার জন্য নিচের ফর্মটি পূরণ করুন
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              ডেলিভারি ম্যান পৌঁছানোর পর পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
            </p>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-6">
            {/* Product Summary & Quantity */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <img
                  src={activeProduct?.featuredImage || activeProduct?.images?.[0] || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover border border-stone-300"
                />
                <div>
                  <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                    {landingPage?.title || activeProduct?.name}
                  </h4>
                  <p className="text-xs text-amber-800 font-black">
                    ৳{unitPrice.toLocaleString('bn-BD')} / পিস
                  </p>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 font-bold text-stone-700 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-black text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 font-bold text-stone-700 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  মোবাইল নাম্বার <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="০১XXXXXXXXX"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                সম্পূর্ণ ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা উল্লেখ করুন"
                required
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Delivery Area Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                ডেলিভারি এরিয়া নির্বাচন করুন
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setDeliveryArea('inside_dhaka')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    deliveryArea === 'inside_dhaka'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryArea === 'inside_dhaka'}
                      onChange={() => setDeliveryArea('inside_dhaka')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs sm:text-sm font-bold text-stone-800">ঢাকার ভিতরে</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-800">৳{landingPage?.delivery_inside_dhaka ?? 70}</span>
                </label>

                <label
                  onClick={() => setDeliveryArea('outside_dhaka')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    deliveryArea === 'outside_dhaka'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryArea === 'outside_dhaka'}
                      onChange={() => setDeliveryArea('outside_dhaka')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs sm:text-sm font-bold text-stone-800">ঢাকার বাইরে</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-800">৳{landingPage?.delivery_outside_dhaka ?? 120}</span>
                </label>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>পণ্যের মূল্য ({quantity} টি):</span>
                <span>৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between font-black text-base sm:text-lg text-stone-900 border-t border-stone-200 pt-2">
                <span>সর্বমোট:</span>
                <span className="text-emerald-800">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-98'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
