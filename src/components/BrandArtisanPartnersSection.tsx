import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { BrandPartnerStory } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlayCircle,
  BookOpen,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';

export const BrandArtisanPartnersSection: React.FC = () => {
  const { brandPartnerStories = [] } = useShop();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState<BrandPartnerStory | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const activeStories = brandPartnerStories.filter((s) => s.isActive);
  const storyList = activeStories.length > 0 ? activeStories : brandPartnerStories;

  // 5-second automatic sliding horizontally in one line
  useEffect(() => {
    if (isHovered || storyList.length <= 1) return;

    slideTimerRef.current = setInterval(() => {
      setActiveStoryIndex((prev) => {
        const next = (prev + 1) % storyList.length;
        if (carouselRef.current) {
          const container = carouselRef.current;
          if (next === 0) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            const cardWidth = container.children[0]?.clientWidth || 320;
            container.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
          }
        }
        return next;
      });
    }, 5000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isHovered, storyList.length]);

  const scrollToIndex = (idx: number) => {
    setActiveStoryIndex(idx);
    if (carouselRef.current) {
      const container = carouselRef.current;
      const targetChild = container.children[idx] as HTMLElement;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
    }
  };

  const handleNext = () => {
    if (storyList.length === 0) return;
    const nextIdx = (activeStoryIndex + 1) % storyList.length;
    scrollToIndex(nextIdx);
  };

  const handlePrev = () => {
    if (storyList.length === 0) return;
    const prevIdx = (activeStoryIndex - 1 + storyList.length) % storyList.length;
    scrollToIndex(prevIdx);
  };

  if (storyList.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div
        id="brand-artisan-partners-section"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-white rounded-3xl p-6 sm:p-9 border border-stone-200/90 shadow-sm"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">
            ঐতিহ্য ও ব্র্যান্ড পার্টনার (Brand & Artisan Partners)
          </h2>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Next story"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Horizontal Slideable Story Boxes in One Single Row */}
        <div
          ref={carouselRef}
          className="mt-6 flex gap-4 sm:gap-5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {storyList.map((story, index) => {
            const isHighlighted = index === activeStoryIndex;
            return (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className={`group relative shrink-0 w-[280px] sm:w-[320px] md:w-[340px] snap-start flex flex-col bg-stone-50 rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isHighlighted
                    ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-400/20'
                    : 'border-stone-200 hover:border-amber-400 hover:shadow-sm'
                }`}
              >
                {/* 1. Clean Title Above Box Image (No badges, numbers or extra icons) */}
                <div className="mb-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                    {story.title}
                  </h3>
                </div>

                {/* 2. Pure Slide Image (No text or badges overlay on top of the image) */}
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-200">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* No text below the slide as requested: "O স্লাইড এর নিচে ও কিছু লেখা থাকবে না" */}
              </div>
            );
          })}
        </div>

        {/* Slider Bottom Dots */}
        <div className="flex items-center justify-center mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            {storyList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeStoryIndex ? 'w-8 bg-amber-600' : 'w-2 bg-stone-200 hover:bg-stone-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Modal (Opens on Card Click) */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedStory(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  ঐতিহ্য ও ব্র্যান্ড পার্টনার
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {selectedStory.title}
                </h3>
                {selectedStory.titleEn && (
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    {selectedStory.titleEn}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Optional Video Player */}
              {selectedStory.videoUrl && (
                <div className="space-y-2">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-950 shadow-md">
                    <iframe
                      src={selectedStory.videoUrl}
                      title={selectedStory.videoTitle || selectedStory.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {selectedStory.videoTitle && (
                    <p className="text-xs font-bold text-stone-600 flex items-center gap-1">
                      <PlayCircle className="w-3.5 h-3.5 text-rose-500" />
                      ভিডিও: {selectedStory.videoTitle}
                    </p>
                  )}
                </div>
              )}

              {/* Story Image */}
              {!selectedStory.videoUrl && (
                <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-stone-100 shadow-xs">
                  <img
                    src={selectedStory.image}
                    alt={selectedStory.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Detailed Text Description */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2.5">
                  বিস্তারিত বিবরণ ও নির্দেশিকা
                </h4>
                <div className="text-sm text-stone-800 whitespace-pre-line leading-relaxed space-y-2">
                  {selectedStory.detailedText}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
