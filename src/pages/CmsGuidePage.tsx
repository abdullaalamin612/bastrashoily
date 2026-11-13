import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  CheckCircle,
  HelpCircle,
  Video,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBasket,
  ArrowLeft,
} from 'lucide-react';

export const CmsGuidePage: React.FC = () => {
  const { currentView, howToOrderSteps, clothingStories, navigateToHome, navigateToCategory, navigateBack } =
    useShop();

  const isVideoPage = currentView === 'clothing_guide';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={navigateBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer border border-stone-200"
          title="পূর্বের পেজে ফিরে যান (Back)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>পেছনে যান (Back)</span>
        </button>
      </div>

      {/* 19. How to Order Guide Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1A1] font-semibold block">
            Ordering Guide
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
            বস্ত্র শৈলী (BOSTROSHOILY) থেকে কিভাবে অর্ডার করবেন?
          </h1>
          <p className="text-xs text-[#717171] font-light">
            সহজ ৩টি ধাপে ঘরে বসেই আপনার পছন্দের ঐতিহ্যবাহী পোশাক অর্ডার করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {howToOrderSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-lg p-6 border border-[#EAEAEA] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white font-mono text-xs flex items-center justify-center">
                    0{step.stepNumber}
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1A1] uppercase tracking-wider">
                    Step {step.stepNumber}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">
                  {step.banglaTitle}
                </h3>
                <p className="text-xs text-[#717171] leading-relaxed font-light">{step.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#EAEAEA] flex items-center justify-between text-[11px] text-[#A1A1A1]">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>সহজ ও সুরক্ষিত</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-6 sm:p-8 border border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-medium text-[#1A1A1A] text-sm">এখনই শুরু করতে চান?</h4>
            <p className="text-xs text-[#717171] mt-0.5 font-light">
              আমাদের ক্যাটাগরি ঘুরে দেখুন অথবা হোম পেজের অফারগুলো উপভোগ করুন।
            </p>
          </div>
          <button
            onClick={() => navigateToCategory('lungi')}
            className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium rounded-lg uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ShoppingBasket className="w-3.5 h-3.5" />
            <span>কালেকশন দেখুন</span>
          </button>
        </div>
      </section>

      {/* 21. Clothing Stories & Educational Videos */}
      <section className="pt-10 border-t border-[#EAEAEA] space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1A1] font-semibold block">
            Craft & Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
            বস্ত্র শৈলির গল্প ও শিক্ষণীয় ভিডিও
          </h2>
          <p className="text-xs text-[#717171] font-light">
            ঐতিহ্যবাহী তাঁত ও সুতার গল্প এবং নিখুঁত ব্যবহারের নানা তথ্য।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clothingStories
            .filter((s) => s.isActive !== false)
            .map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg overflow-hidden border border-[#EAEAEA] flex flex-col justify-between group"
              >
                {/* Video / Thumbnail preview */}
                <div className="relative aspect-video w-full bg-[#1A1A1A] overflow-hidden">
                  <img
                    src={story.thumbnail || story.thumbnailUrl}
                    alt={story.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <a
                      href={story.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105 cursor-pointer"
                      aria-label="Play video"
                    >
                      <Video className="w-5 h-5 ml-0.5" />
                    </a>
                  </div>
                  {story.duration && (
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      {story.duration}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1A1] font-semibold block mb-1">
                      ঐতিহ্য ও টিপস
                    </span>
                    <h3 className="text-base font-medium text-[#1A1A1A]">
                      {story.banglaTitle || story.title}
                    </h3>
                    <p className="text-xs text-[#717171] leading-relaxed mt-2 font-light">
                      {story.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
                    <a
                      href={story.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A] hover:underline transition-colors"
                    >
                      <span>ভিডিওটি দেখুন</span>
                      <ExternalLink className="w-3 h-3 text-[#A1A1A1]" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Back button */}
      <div className="text-center pt-6">
        <button onClick={navigateToHome} className="text-xs text-[#717171] hover:text-[#1A1A1A] transition-colors cursor-pointer">
          ← কেনাকাটা চালিয়ে যেতে হোমে ফিরে যান
        </button>
      </div>
    </div>
  );
};
