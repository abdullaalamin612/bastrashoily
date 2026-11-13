import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const toBengaliDigits = (val: number | string | undefined): string => {
  if (val === undefined || val === null || val === '') return '২০';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (w) => bengaliDigits[+w]);
};

export const ComboOffersSlider: React.FC = () => {
  const { navigateToCategory, comboOffers: contextCombos } = useShop();

  const [comboOffers, setComboOffers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCombos = async () => {
      try {
        const res = await fetch('/api/combo-offers');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.comboOffers)) {
          const activeOnly = data.comboOffers.filter(
            (c: any) => c.isActive !== false && c.active !== 0
          );
          setComboOffers(activeOnly);
        }
      } catch (err) {
        console.warn('Failed to load combo offers from API:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCombos();
    return () => {
      isMounted = false;
    };
  }, [contextCombos]);

  // Auto-slide effect if multiple combo offers exist
  useEffect(() => {
    if (comboOffers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % comboOffers.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [comboOffers.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + comboOffers.length) % comboOffers.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % comboOffers.length);
  };

  if (isLoading || comboOffers.length === 0) {
    return null;
  }

  const activeCombo = comboOffers[currentIndex];

  const discPercent =
    activeCombo.discountPercent !== undefined && activeCombo.discountPercent !== null
      ? activeCombo.discountPercent
      : (activeCombo.discount_percent || activeCombo.savingsPercent || activeCombo.savings_percent || 20);

  const bengaliPercentStr = toBengaliDigits(discPercent);

  const headlineText =
    activeCombo.headline ||
    activeCombo.bangla_title ||
    activeCombo.banglaTitle ||
    'সকল গিফট বক্সে';

  const badgeCircleText =
    activeCombo.badgeCircleText ||
    activeCombo.badge_circle_text ||
    'কাঁথাফোঁড়';

  const themeColor =
    activeCombo.themeColor ||
    activeCombo.theme_color ||
    '#2C140E';

  const accentColor =
    activeCombo.accentColor ||
    activeCombo.accent_color ||
    '#DFB788';

  const circleImageSrc =
    activeCombo.circleImage ||
    activeCombo.circle_image ||
    activeCombo.image ||
    '/assets/aistudio/Screenshot_2026-11-01-22-43-47-24_99c04817c0de5652397fc8b56c3b3817_48ce3279.jpg';

  const targetCategorySlug = activeCombo.categorySlug || activeCombo.category_slug || 'gift-box';
  const boxWidth = Number(activeCombo.boxWidth || activeCombo.box_width || 780);
  const circleSize = Number(activeCombo.circleSize || activeCombo.circle_size || 180);

  const handleClickBanner = () => {
    navigateToCategory(targetCategorySlug);
  };

  return (
    <section className="w-full px-2 sm:px-6 lg:px-8 py-4 sm:py-7 select-none">
      {/* Container with dynamic box size strictly controlled by admin settings */}
      <div
        className="mx-auto relative w-full transition-all duration-300"
        style={{ maxWidth: `${boxWidth}px` }}
      >
        {/* =========================================================================
            COMBO OFFER BANNER CARD (Authentic 1:1 Match to User Reference Screenshot)
            - No price / taka shown
            - No "পণ্যগুলো দেখুন" or "কার্টে নিন" buttons
            - Proportional box size strictly constrained & resizable by Admin
            - Circle photo resizable by Admin
            - Permanent side-by-side horizontal layout across ALL devices (No 1-column mobile collapse)
            - 1-Click navigation directly to admin-selected category
            - Admin-customizable theme color, circular product image, small circle text ("কাঁথাফোঁড়"), and discount %
            ========================================================================= */}
        <div
          onClick={handleClickBanner}
          style={{ backgroundColor: themeColor }}
          className="group relative rounded-2xl sm:rounded-4xl text-[#F7EEDB] shadow-2xl border-2 border-[#DFB788]/40 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-amber-950/40 hover:scale-[1.008] active:scale-[0.995]"
        >
          {/* Subtle Ambient Vignette / Texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 pointer-events-none" />

          {/* Inset Hairline Border Line around the inner perimeter */}
          <div className="absolute inset-1.5 sm:inset-3 rounded-xl sm:rounded-3xl border border-[#DFB788]/30 pointer-events-none z-10" />

          {/* Corner Filigree Flourishes (Antique Golden Victorian Swirls) */}
          {/* Top-Left Corner */}
          <div className="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 w-5 h-5 sm:w-10 sm:h-10 pointer-events-none opacity-85 select-none z-20">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
              <path d="M 12 88 C 12 40 40 12 88 12" />
              <path d="M 22 88 C 22 50 50 22 88 22" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
              <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
              <circle cx="28" cy="28" r="2" fill="#DFB788" />
            </svg>
          </div>

          {/* Top-Right Corner */}
          <div className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-5 h-5 sm:w-10 sm:h-10 pointer-events-none opacity-85 select-none scale-x-[-1] z-20">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
              <path d="M 12 88 C 12 40 40 12 88 12" />
              <path d="M 22 88 C 22 50 50 22 88 22" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
              <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
              <circle cx="28" cy="28" r="2" fill="#DFB788" />
            </svg>
          </div>

          {/* Bottom-Left Corner */}
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-10 sm:h-10 pointer-events-none opacity-85 select-none scale-y-[-1] z-20">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
              <path d="M 12 88 C 12 40 40 12 88 12" />
              <path d="M 22 88 C 22 50 50 22 88 22" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
              <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
              <circle cx="28" cy="28" r="2" fill="#DFB788" />
            </svg>
          </div>

          {/* Bottom-Right Corner */}
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-10 sm:h-10 pointer-events-none opacity-85 select-none scale-[-1] z-20">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#DFB788] stroke-[2.5]">
              <path d="M 12 88 C 12 40 40 12 88 12" />
              <path d="M 22 88 C 22 50 50 22 88 22" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="12" cy="12" r="4.5" fill="#DFB788" />
              <path d="M 16 16 C 36 16 46 36 16 46 Z" fill="#DFB788" fillOpacity="0.4" />
              <circle cx="28" cy="28" r="2" fill="#DFB788" />
            </svg>
          </div>

          {/* Banner Internal Content Grid - PERMANENT HORIZONTAL 2-COLUMN LAYOUT ACROSS ALL SCREENS */}
          <div className="relative grid grid-cols-12 gap-2 sm:gap-5 md:gap-6 p-2.5 sm:p-6 md:p-8 items-center min-h-[150px] sm:min-h-[220px]">
            {/* Left: Cane Basket Platter Holding Product Image (col-span-5) */}
            <div className="col-span-5 flex items-center justify-center py-1 sm:py-0">
              {/* Cane / Bamboo Wicker Rim with Dynamic Circle Size */}
              <div
                style={{
                  width: `min(${circleSize}px, 34vw)`,
                  height: `min(${circleSize}px, 34vw)`,
                  minWidth: '80px',
                  minHeight: '80px',
                }}
                className="relative rounded-full p-1.5 sm:p-2.5 bg-gradient-to-tr from-[#9B6634] via-[#75441E] to-[#4A260D] shadow-2xl border-2 sm:border-[3px] border-[#DFB788]/60 shrink-0 transition-all duration-300"
              >
                {/* Inner Dashed Stitch Rim */}
                <div className="w-full h-full rounded-full overflow-hidden border border-dashed sm:border-2 border-[#F7EEDB]/40 relative bg-stone-950">
                  <img
                    src={circleImageSrc}
                    alt={activeCombo.title || 'Combo Offer'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Subtle edge vignette */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: Typography Callouts Matching Exact Screenshot Layout (col-span-7) */}
            <div className="col-span-7 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2 py-0.5 sm:py-1">
              {/* 1. Top Small Circular Emblem with Concentric/Dashed Stitched Border */}
              <div className="relative w-9 h-9 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-dashed border-[#DFB788]/80 flex items-center justify-center p-0.5 sm:p-1 bg-black/25 shadow-md shrink-0">
                <div className="w-full h-full rounded-full border border-[#DFB788]/50 flex items-center justify-center text-center px-0.5 sm:px-1">
                  <span className="text-[9px] sm:text-[11px] md:text-xs font-serif font-black text-[#F7EEDB] tracking-tight leading-tight select-none">
                    {badgeCircleText}
                  </span>
                </div>
              </div>

              {/* 2. Headline with 3 Radiating Rays on each side: \ \ \ Headline / / / */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 pt-0.5 max-w-full">
                {/* 3 Left Radiating Rays */}
                <div className="flex items-center gap-0.5 text-[#DFB788] text-[9px] sm:text-xs md:text-sm font-black select-none opacity-90 shrink-0">
                  <span className="inline-block transform -rotate-12">\</span>
                  <span className="inline-block transform -rotate-6">\</span>
                  <span className="inline-block">\</span>
                </div>

                <h3 className="text-xs sm:text-lg md:text-2xl font-black text-[#F7EEDB] tracking-tight drop-shadow-sm truncate max-w-[130px] sm:max-w-none">
                  {headlineText}
                </h3>

                {/* 3 Right Radiating Rays */}
                <div className="flex items-center gap-0.5 text-[#DFB788] text-[9px] sm:text-xs md:text-sm font-black select-none opacity-90 shrink-0">
                  <span className="inline-block">/</span>
                  <span className="inline-block transform rotate-6">/</span>
                  <span className="inline-block transform rotate-12">/</span>
                </div>
              </div>

              {/* 3. Decorative Filigree Divider: — চলছে — */}
              <div className="flex items-center justify-center gap-1.5 py-0">
                <span className="text-[#DFB788]/70 text-[9px] sm:text-xs">—</span>
                <span className="text-[9px] sm:text-[11px] font-black text-[#DFB788] tracking-widest uppercase">
                  চলছে
                </span>
                <span className="text-[#DFB788]/70 text-[9px] sm:text-xs">—</span>
              </div>

              {/* 4. Giant Bengali Calligraphy Discount Callout: ফ্ল্যাট [XX]% ডিসকাউন্ট */}
              <div className="space-y-0 text-center pt-0.5">
                <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#F7EEDB] tracking-tight leading-none drop-shadow-md">
                  ফ্ল্যাট {bengaliPercentStr}%
                </div>
                <div className="text-[11px] sm:text-xl md:text-2xl lg:text-3xl font-black text-[#F7EEDB] tracking-tight leading-tight flex items-center justify-center gap-1 sm:gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F7EEDB] inline-block shadow-sm" />
                  <span>ডিসকাউন্ট</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Arrows (Discreet, only shown if multiple active combos exist) */}
          {comboOffers.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 sm:inset-x-3 flex items-center justify-between pointer-events-none z-30">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-[#DFB788] border border-[#DFB788]/30 flex items-center justify-center transition-all cursor-pointer pointer-events-auto active:scale-90"
                aria-label="Previous combo offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-[#DFB788] border border-[#DFB788]/30 flex items-center justify-center transition-all cursor-pointer pointer-events-auto active:scale-90"
                aria-label="Next combo offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Pagination Dots if multiple */}
        {comboOffers.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {comboOffers.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-[#DFB788] shadow-xs'
                    : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to combo offer ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
