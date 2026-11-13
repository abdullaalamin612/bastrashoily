import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Flame, Sparkles, Tag, ArrowRight, ChevronLeft, ChevronRight, Copy, Check, Clock } from 'lucide-react';

interface CategoryOfferItem {
  id: string;
  categoryName: string;
  categorySlug: string;
  offerBadge: string;
  headline: string;
  discountSummary: string;
  couponCode: string;
  minAmount: number;
}

const DEFAULT_CATEGORY_OFFERS: CategoryOfferItem[] = [
  {
    id: 'off-lungi',
    categoryName: 'তাঁতের লুঙ্গি কালেকশন',
    categorySlug: 'lungi',
    offerBadge: 'ফ্ল্যাট ২৫% ছাড়',
    headline: 'সিরাজগঞ্জ হ্যান্ডলুম লুঙ্গিতে বিশেষ উৎসব ছাড়',
    discountSummary: 'যেকোনো ৩টি লুঙ্গি অর্ডারে ফ্রি ডেলিভারি ও অতিরিক্ত ২৫% ছাড়',
    couponCode: 'LUNGI25',
    minAmount: 1200,
  },
  {
    id: 'off-saree',
    categoryName: 'শাড়ি ও জামদানি',
    categorySlug: 'saree',
    offerBadge: '১৫% ছাড় + ফ্রি ডেলিভারি',
    headline: 'খাঁটি ঢাকাই জামদানি ও টাঙ্গাইল সিল্কে মেগা উৎসব উপহার',
    discountSummary: 'অভিজাত শাড়ি ক্রয়ে ইনস্ট্যান্ট ৫০০ টাকা পর্যন্ত ছাড়',
    couponCode: 'SAREE15',
    minAmount: 2500,
  },
  {
    id: 'off-panjabi',
    categoryName: 'পাঞ্জাবি কালেকশন',
    categorySlug: 'panjabi',
    offerBadge: 'ফ্ল্যাট ২০% ছাড়',
    headline: 'প্রিমিয়াম সুতি ও সিল্ক পাঞ্জাবিতে সীমিত সময়ের ডিল',
    discountSummary: 'উৎসবের সাজে রাজকীয় ডিজাইনের পাঞ্জাবিতে বিশেষ মূল্যছাড়',
    couponCode: 'PANJABI20',
    minAmount: 1800,
  },
  {
    id: 'off-tshirt',
    categoryName: 'প্রিমিয়াম টি-শার্ট',
    categorySlug: 'tshirt',
    offerBadge: 'বাই ২ গেট ১ বা ২০% অফ',
    headline: '১০০% কম্বড কটন ব্রিদেবল টি-শার্ট অফার',
    discountSummary: 'প্রতিদিনের কমফোর্ট টি-শার্টে আকর্ষণীয় বান্ডেল ছাড়',
    couponCode: 'TSHIRT20',
    minAmount: 990,
  },
  {
    id: 'off-threepiece',
    categoryName: 'থ্রি-পিস কালেকশন',
    categorySlug: 'three-piece',
    offerBadge: '১৮% স্পেশাল অফার',
    headline: 'সুতি ও জর্জেট এক্সক্লুসিভ থ্রি-পিসে উৎসবের বিশেষ ছাড়',
    discountSummary: 'আকর্ষণীয় এমব্রয়ডারি থ্রি-পিস কালেকশনে তাৎক্ষণিক সেভিংস',
    couponCode: 'THREE18',
    minAmount: 2200,
  },
];

// Helper to parse any date format, ISO string, Bengali digits or relative times
function parseTargetDate(dateStr?: string): number {
  if (!dateStr || !dateStr.trim()) {
    return Date.now() + (2 * 86400000) + (14 * 3600000) + (36 * 60000) + (45 * 1000);
  }

  // Convert Bengali digits (০-৯) to English (0-9)
  const normalized = dateStr.trim().replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));

  // Try direct Date parsing (handles ISO, datetime-local, standard formats)
  const direct = new Date(normalized).getTime();
  if (!isNaN(direct) && direct > 0) {
    return direct;
  }

  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = normalized.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const hours = ddmmyyyy[4] ? parseInt(ddmmyyyy[4], 10) : 23;
    const mins = ddmmyyyy[5] ? parseInt(ddmmyyyy[5], 10) : 59;
    const secs = ddmmyyyy[6] ? parseInt(ddmmyyyy[6], 10) : 59;
    const parsed = new Date(year, month, day, hours, mins, secs).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  // Try relative hours/days like "3 days" or "3 দিন" or "24 hours"
  const relMatch = normalized.match(/(\d+)\s*(দিন|day|days|ঘণ্টা|ঘন্টা|hour|hours|মিনিট|min|mins)/i);
  if (relMatch) {
    const amount = parseInt(relMatch[1], 10);
    const unit = relMatch[2].toLowerCase();
    if (unit.includes('দিন') || unit.includes('day')) {
      return Date.now() + amount * 86400000;
    } else if (unit.includes('ঘণ্টা') || unit.includes('ঘন্টা') || unit.includes('hour')) {
      return Date.now() + amount * 3600000;
    } else {
      return Date.now() + amount * 60000;
    }
  }

  return Date.now() + (2 * 86400000) + (14 * 3600000) + (36 * 60000) + (45 * 1000);
}

export const FestiveOfferSlider: React.FC = () => {
  const { navigateToCategory, megaFestiveOffers = [], offerConfig } = useShop();
  const offers = megaFestiveOffers;
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer calculated dynamically from offerConfig.endDate
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = parseTargetDate(offerConfig?.endDate);
      const now = Date.now();
      const difference = target - now;
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [offerConfig?.endDate]);

  // 5-second automatic slide transition as explicitly requested
  useEffect(() => {
    if (isHovered || offers.length <= 1) return;

    slideTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isHovered, offers.length]);

  if (!offerConfig?.isActive || offers.length === 0) {
    return null;
  }

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const safeIndex = activeSlide < offers.length ? activeSlide : 0;
  const currentOffer = offers[safeIndex] || offers[0];

  const sliderTitle = offerConfig?.banglaTitle || offerConfig?.title || 'বিশেষ মেগা উৎসব ছাড়!';
  const sliderSubtitle =
    offerConfig?.subtitle || 'উৎসবের আনন্দ ছড়িয়ে দিতে প্রতিটি ক্যাটাগরিতে নিয়মিত ঘূর্ণায়মান মেগা ছাড়';
  const showCountdown = offerConfig ? offerConfig.showCountdown !== false : true;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Compact Outer Box */}
      <div
        id="festive-mega-offer-section"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/90 text-white rounded-3xl p-5 sm:p-7 border border-amber-500/40 shadow-xl overflow-hidden"
      >
        {/* Subtle Decorative Background Element */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header: বিশেষ মেগা উৎসব ছাড়! */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                  {sliderTitle}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-[10px] font-extrabold uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  সীমিত অফার
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {sliderSubtitle}
              </p>
            </div>
          </div>

          {/* 2. Countdown Timer: thik niche time show korbe */}
          {showCountdown && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-900/90 px-3.5 py-2 rounded-2xl border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mr-1" />
              <span className="text-[11px] text-stone-300 font-bold mr-1">বাকি:</span>
              <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm text-amber-300">
                <span className="bg-stone-950 px-2 py-1 rounded-md border border-stone-800">
                  {String(timeLeft.days).padStart(2, '0')}দ
                </span>
                <span className="text-stone-500">:</span>
                <span className="bg-stone-950 px-2 py-1 rounded-md border border-stone-800">
                  {String(timeLeft.hours).padStart(2, '0')}ঘ
                </span>
                <span className="text-stone-500">:</span>
                <span className="bg-stone-950 px-2 py-1 rounded-md border border-stone-800">
                  {String(timeLeft.minutes).padStart(2, '0')}ম
                </span>
                <span className="text-stone-500">:</span>
                <span className="bg-stone-950 px-2 py-1 rounded-md border border-stone-800 text-amber-400 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}সে
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Compact Slide Box (slides every 5 seconds) */}
        <div className="mt-4 relative">
          <div className="bg-stone-900/80 rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
            {/* Slide Content */}
            <div className="space-y-1.5 flex-1 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950">
                  {currentOffer.categoryName}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  {currentOffer.offerBadge}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-stone-100">
                {currentOffer.headline}
              </h3>

              <p className="text-xs text-stone-300">
                {currentOffer.discountSummary}
              </p>
            </div>

            {/* Slide Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Coupon Pill */}
              <button
                onClick={(e) => handleCopy(currentOffer.couponCode, e)}
                title="কুপন কোড কপি করুন"
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-950 hover:bg-stone-800 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentOffer.couponCode}</span>
                {copiedCode === currentOffer.couponCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-stone-400 ml-1" />
                )}
              </button>

              {/* View Category Products */}
              <button
                onClick={() => navigateToCategory(currentOffer.categorySlug)}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>পণ্য দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Slider Controls: Arrows & Indicators */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlide ? 'w-6 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-stone-400 ml-2 font-mono">
                ৫ সেকেন্ড পর পর স্লাইড হয়
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevSlide}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-amber-500 text-stone-300 hover:text-stone-950 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous Offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-amber-500 text-stone-300 hover:text-stone-950 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next Offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
