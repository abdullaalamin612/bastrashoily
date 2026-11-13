import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Tag, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export interface PromoSubBanner {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  image: string;
  link: string;
  bgGradient: string;
}

const DEFAULT_PROMO_BANNERS: PromoSubBanner[] = [
  {
    id: 'sub-banner-1',
    title: 'SUMMER FASHION SALE',
    badge: '70% OFF',
    subtitle: 'এক্সক্লুসিভ সামার কালেকশন',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700',
    link: '/category/women',
    bgGradient: 'from-amber-600/90 via-rose-600/80 to-stone-950/90',
  },
  {
    id: 'sub-banner-2',
    title: 'MEGA FASHION SALE',
    badge: 'SPRING 2026',
    subtitle: 'ট্রেন্ডি ও প্রিমিয়াম ডিজাইন',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=700',
    link: '/category/men',
    bgGradient: 'from-emerald-700/90 via-teal-800/80 to-stone-950/90',
  },
  {
    id: 'sub-banner-3',
    title: 'Weekend Special Sale',
    badge: '50% OFF',
    subtitle: 'সীমিত সময়ের বিশেষ মূল্যছাড়',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=700',
    link: '/category/all',
    bgGradient: 'from-violet-700/90 via-indigo-900/80 to-stone-950/90',
  },
];

export const PromoSubBannersSection: React.FC = () => {
  const { navigateToCategory } = useShop();
  const [banners, setBanners] = useState<PromoSubBanner[]>(DEFAULT_PROMO_BANNERS);

  useEffect(() => {
    fetch('/api/promo-banners')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  const handleBannerClick = (link: string) => {
    if (!link) return;
    const cleanCategory = link.replace('/category/', '').replace('/', '');
    if (cleanCategory) {
      navigateToCategory(cleanCategory);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* 3-Column Promo Banner Grid matching the Video Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {banners.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => handleBannerClick(item.link)}
            className="group relative h-48 sm:h-56 md:h-52 lg:h-60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-200/80"
          >
            {/* Background Image with Zoom */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Scrim for High-Contrast Text */}
            <div className={`absolute inset-0 bg-gradient-to-r ${item.bgGradient} opacity-75 group-hover:opacity-65 transition-opacity duration-300`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Floating Top Badge */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs sm:text-xs tracking-wider uppercase shadow-md animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span>{item.badge}</span>
              </span>
            </div>

            {/* Banner Content (Bottom Positioned) */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
              <span className="text-[11px] sm:text-xs font-semibold text-amber-200 uppercase tracking-widest block mb-0.5 drop-shadow-sm">
                {item.subtitle}
              </span>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight drop-shadow-md text-white group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                <span>কালেকশন এক্সপ্লোর করুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
