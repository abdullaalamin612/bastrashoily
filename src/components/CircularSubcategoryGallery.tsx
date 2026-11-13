import React, { useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Fallback images for subcategories
const getSubcategoryFallbackImage = (slugOrName: string) => {
  const s = (slugOrName || '').toLowerCase();
  if (s.includes('lungi')) return 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=300';
  if (s.includes('saree') || s.includes('shari')) return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300';
  if (s.includes('panjabi') || s.includes('punjabi')) return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300';
  if (s.includes('tshirt') || s.includes('t-shirt') || s.includes('shirt')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300';
  if (s.includes('three-piece') || s.includes('kamiz') || s.includes('kurti')) return 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300';
  if (s.includes('ator') || s.includes('attar') || s.includes('perfume')) return 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=300';
  if (s.includes('tupi') || s.includes('cap') || s.includes('prayer')) return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=300';
  if (s.includes('gift') || s.includes('box')) return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=300';
  return 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&q=80&w=300';
};

export const CircularSubcategoryGallery: React.FC = () => {
  const { categories, navigateToCategory } = useShop();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter subcategories that are active and not archived
  // Explicitly check showInCircleGallery !== false; if none found, show active non-main subcategories
  const nonMainCats = categories.filter((c) => !c.isMain && c.isActive !== false && !c.isArchived);
  const explicitCircleItems = nonMainCats.filter((c) => c.showInCircleGallery !== false);
  const circleItems = (explicitCircleItems.length > 0 ? explicitCircleItems : nonMainCats)
    .sort((a, b) => (a.circleGalleryOrder || a.order || 0) - (b.circleGalleryOrder || b.order || 0));

  if (circleItems.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: typeof circleItems[0]) => {
    const parentKey = (cat.parentCategory || '').toUpperCase();
    let mainSlug = 'men';
    if (parentKey === 'WOMEN') {
      mainSlug = 'women';
    } else if (parentKey === 'KIDS') {
      mainSlug = 'kids';
    } else if (
      parentKey === 'OTHERS' ||
      parentKey.includes('OTHER') ||
      cat.slug === 'gift-box' ||
      cat.slug?.includes('gift') ||
      cat.slug === 'ator' ||
      cat.slug === 'tupi' ||
      cat.slug === 'chador'
    ) {
      mainSlug = 'others';
    } else {
      const parent = categories.find(
        (c) =>
          c.isMain &&
          (c.id === cat.parentCategoryId ||
            c.name.toUpperCase() === parentKey ||
            c.slug.toUpperCase() === parentKey)
      );
      if (parent?.slug) {
        mainSlug = parent.slug;
      }
    }

    navigateToCategory(mainSlug, cat.slug);
  };

  return (
    <section className="py-6 sm:py-8 bg-[#FFF8ED]/40 border-y border-[#240B07]/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B8860B]" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#240B07] tracking-tight">
              জনপ্রিয় ক্যাটাগরি সমূহ
            </h2>
            <span className="text-[11px] sm:text-xs text-stone-500 hidden sm:inline">
              (এক ক্লিকে পছন্দের পোশাক বেছে নিন)
            </span>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full border border-stone-300 hover:border-[#240B07] bg-white text-[#240B07] hover:bg-[#240B07] hover:text-[#FFF8ED] transition-colors shadow-xs"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full border border-stone-300 hover:border-[#240B07] bg-white text-[#240B07] hover:bg-[#240B07] hover:text-[#FFF8ED] transition-colors shadow-xs"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Circular Items Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {circleItems.map((cat) => {
            const fallbackImg = getSubcategoryFallbackImage(cat.slug || cat.name);
            const displayImage = cat.circleImage || cat.image || fallbackImg;
            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleCategoryClick(cat)}
                className="group flex flex-col items-center flex-shrink-0 focus:outline-none transition-transform hover:-translate-y-1"
                title={`${cat.banglaName} কালেকশন`}
              >
                {/* Circular Image Frame */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full p-0.5 bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#8B4513] shadow-sm group-hover:shadow-md transition-all">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                    <img
                      src={displayImage}
                      alt={cat.banglaName || cat.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImg;
                      }}
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Subtle decorative dot */}
                  <span className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-[#240B07] border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Category Title */}
                <span className="mt-2 text-xs sm:text-sm font-semibold text-[#240B07] group-hover:text-[#B8860B] transition-colors text-center line-clamp-1 max-w-[85px] sm:max-w-[100px]">
                  {cat.banglaName || cat.name}
                </span>

                {/* Subtitle / English name if available */}
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono opacity-80 group-hover:opacity-100 hidden sm:block">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
