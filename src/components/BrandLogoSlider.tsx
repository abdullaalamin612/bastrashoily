import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import {
  HelpCircle,
  Play,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface SlideItem {
  id: string;
  badge: string;
  badgeBn: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  points: string[];
  buttonText: string;
  buttonTextEn: string;
  image: string;
  action: () => void;
}

export const BrandLogoSlider: React.FC = () => {
  const { navigateToCmsGuide, navigateToClothingGuide, navigateToCategory, language } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDES: SlideItem[] = [
    {
      id: 'slide-order',
      badge: 'Order Guide',
      badgeBn: 'সহজ নির্দেশিকা',
      title: 'বস্ত্র শৈলী (BOSTROSHOILY) থেকে কিভাবে অর্ডার করবেন?',
      titleEn: 'How to Order from BOSTROSHOILY?',
      subtitle: 'মাত্র কয়েকটি সহজ ধাপে পছন্দের খাঁটি পোশাক সরাসরি ঘরে বসে অর্ডার করুন',
      subtitleEn: 'Order your desired authentic handloom garments from home in just a few easy steps',
      points: [
        '১. ওয়েবসাইট থেকে পছন্দের লুঙ্গি, শাড়ি, পাঞ্জাবি বা পোশাক নির্বাচন করুন',
        '২. সঠিক কালার ও সাইজ যাচাই করে "Add to Cart" বা "Buy Now" চাপুন',
        '৩. আপনার পূর্ণ নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা পূরণ করুন',
        '৪. ক্যাশ অন ডেলিভারি (COD) বা বিকাশ/নগদ পেমেন্ট সম্পন্ন করুন',
        '৫. ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সারা দেশে নির্ভরযোগ্য হোম ডেলিভারি বুঝে নিন',
      ],
      buttonText: 'সম্পূর্ণ অর্ডার সহায়িকা দেখুন',
      buttonTextEn: 'View Full Order Guide',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      action: navigateToCmsGuide,
    },
    {
      id: 'slide-making',
      badge: 'Artisan Craft',
      badgeBn: 'তাঁত ঐতিহ্য',
      title: 'লুঙ্গি ও শাড়ি কীভাবে তৈরি হয়?',
      titleEn: "How Are Handloom Lungis & Sarees Made?",
      subtitle: 'সিরাজগঞ্জ ও রূপগঞ্জের অভিজ্ঞ তাঁতিদের শতবর্ষী বুনন শিল্প ও সুতার ঐতিহ্য',
      subtitleEn: 'Century-old weaving craftsmanship from Sirajganj and Rupganj master artisans',
      points: [
        'খাঁটি ১০০% কম্বড প্রিমিয়াম সুতা নির্বাচন ও সূক্ষ্ম স্পিনিং',
        'ঐতিহ্যবাহী কাঠের খটখটি তাঁতে টানা-পোড়েনের নিখুঁত বুনন',
        'রং পাকা করার প্রাকৃতিক ও পরিবেশবান্ধব আর্ট ডাইং পদ্ধতি',
        'প্রতিটি সুতার ঘন বুনন ও ত্বকবান্ধব সফট ফিনিশিং নিশ্চিতকরণ',
      ],
      buttonText: 'তৈরির ভিডিও ও গল্প দেখুন',
      buttonTextEn: "Watch How It's Made Video",
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
      action: navigateToClothingGuide,
    },
    {
      id: 'slide-wearing',
      badge: 'Style Tutorial',
      badgeBn: 'ব্যবহার ও যত্ন',
      title: 'কীভাবে পরিধান করবেন ও সঠিক মাপ নেবেন?',
      titleEn: 'How to Wear & Size Guide?',
      subtitle: 'লুঙ্গি পরার আরামদায়ক কৌশল ও শাড়ির আধুনিক ড্রেপিং টিউটোরিয়াল',
      subtitleEn: 'Comfortable lungi knot techniques & modern saree draping video tutorials',
      points: [
        'দৈনন্দিন চলাফেরায় লুঙ্গির নিখুঁত ও দীর্ঘস্থায়ী নট বাঁধার কৌশল',
        'আভিজাত্য বজায় রেখে দ্রুত ও পরিপাটি করে শাড়ির কুঁচি দেওয়ার নিয়ম',
        'আপনার শরীরের সঠিক ফিটিং ও পোশাকের দৈর্ঘ্য-প্রস্থ মাপার গাইডলাইন',
        'পোশাক দীর্ঘস্থায়ী রাখার ওয়াশ কেয়ার ও আয়রন সংক্রান্ত পরামর্শ',
      ],
      buttonText: 'টিউটোরিয়াল ভিডিও ও গাইড দেখুন',
      buttonTextEn: 'View Tutorial & Styling Guide',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
      action: navigateToClothingGuide,
    },
    {
      id: 'slide-sirajganj',
      badge: 'Certified Handloom',
      badgeBn: 'সার্টিফাইড পার্টনার',
      title: 'সিরাজগঞ্জ তাঁত পল্লী ও কারিগর অংশীদার',
      titleEn: 'Sirajganj Handloom Hub & Artisan Partners',
      subtitle: 'বস্ত্র শৈলী (BOSTROSHOILY)-এর নিবন্ধিত তাঁত সমবায় ও খাঁটি সুতি বস্ত্রের নির্ভরযোগ্য উৎস',
      subtitleEn: 'Registered handloom cooperatives and direct authentic weavers hub',
      points: [
        '৩০০০+ গ্রামীণ তাঁতি পরিবারকে সরাসরি ন্যায্যমূল্য প্রদান',
        'কোনো মধ্যস্বত্বভোগী ছাড়া সরাসরি তাঁতের সুতা থেকে ঘরে ঘরে পৌঁছানো',
        '১০০% প্রি-ওয়াশড কটন কাপড়, যা ধোয়ার পরও রং ও নরম ভাব ধরে রাখে',
      ],
      buttonText: 'সিরাজগঞ্জ তাঁতের পণ্য দেখুন',
      buttonTextEn: 'Browse Handloom Products',
      image: 'https://images.unsplash.com/photo-1606744888344-498238f0170a?auto=format&fit=crop&w=1200&q=80',
      action: () => navigateToCategory('lungi'),
    },
    {
      id: 'slide-jamdani',
      badge: 'Heritage Silk',
      badgeBn: 'ঐতিহ্যবাহী রেশম',
      title: 'ঢাকাই জামদানি ও টাঙ্গাইল সিল্ক সমবায়',
      titleEn: 'Dhakai Jamdani & Tangail Silk Guild',
      subtitle: 'শতাব্দী প্রাচীন রূপালী সুতার কাজ ও ইউনেস্কো স্বীকৃত ঐতিহ্যবাহী জামদানি',
      subtitleEn: 'Centuries-old silver thread weaves and UNESCO recognized heritage sarees',
      points: [
        'অভিজ্ঞ কারিগরদের নিখুঁত হাতের কাজে বোনা রাজকীয় জামদানি মোটিফ',
        'উচ্চমানের আরামদায়ক প্রাকৃতিক রেশম ও সিল্ক-কটনের সমন্বয়',
        'উৎসব ও পারিবারিক অনুষ্ঠানের জন্য প্রিমিয়াম এক্সক্লুসিভ সংগ্রহ',
      ],
      buttonText: 'শাড়ি ও জামদানি কালেকশন',
      buttonTextEn: 'View Saree & Jamdani Collection',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
      action: () => navigateToCategory('saree'),
    },
  ];

  // Auto-advance slide every 3 seconds (3000ms)
  useEffect(() => {
    if (isHovered) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentSlide, isHovered, SLIDES.length]);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section
      id="brand-artisan-slider-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 text-white rounded-3xl border border-amber-500/20 shadow-xl overflow-hidden p-6 sm:p-10 relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400">
                {language === 'bn'
                  ? 'ঐতিহ্য ও ব্র্যান্ড পার্টনার (Brand & Artisan Partners)'
                  : 'Heritage & Artisan Partners'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {language === 'bn'
                ? 'অর্ডার সহায়িকা, তাঁত বুনন শিল্প, পোশাক পরিধান টিউটোরিয়াল এবং আমাদের কারিগর সমবায়'
                : 'Order guides, weaving craftsmanship, styling tutorials, and artisan cooperatives'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
              {language === 'bn' ? 'প্রতি ৩ সেকেন্ডে স্বয়ংক্রিয় স্লাইড' : 'Auto slides every 3s'}
            </span>
          </div>
        </div>

        {/* Slider Area */}
        <div className="relative min-h-[360px] sm:min-h-[400px] flex items-center z-10">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`transition-all duration-700 w-full ${
                  isActive
                    ? 'opacity-100 relative pointer-events-auto'
                    : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Text Information */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? slide.badgeBn : slide.badge}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      {language === 'bn' ? slide.title : slide.titleEn}
                    </h2>

                    <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                      {language === 'bn' ? slide.subtitle : slide.subtitleEn}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="space-y-2 pt-2">
                      {slide.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-200">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        onClick={slide.action}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                      >
                        <span>{language === 'bn' ? slide.buttonText : slide.buttonTextEn}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Slide Image with Badge */}
                  <div className="lg:col-span-5 relative group">
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 border-2 border-amber-500/30 shadow-2xl bg-stone-950">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs font-bold text-amber-400 block mb-0.5">
                          {language === 'bn' ? slide.badgeBn : slide.badge}
                        </span>
                        <span className="text-sm font-semibold line-clamp-1">
                          {language === 'bn' ? slide.title : slide.titleEn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom ... Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-8 relative z-20">
          {SLIDES.map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 h-2.5 bg-amber-400'
                    : 'w-2.5 h-2.5 bg-stone-600 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
