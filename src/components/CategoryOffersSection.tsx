import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Tag, Check, Copy, ArrowRight, Sparkles, Percent } from 'lucide-react';

export interface CategoryOffer {
  id: string;
  categorySlug: string;
  categoryName: string;
  offerHeadline: string;
  offerDetails: string;
  couponCode: string;
  badge: string;
  accentColor: string;
}

export const CATEGORY_OFFERS: CategoryOffer[] = [
  {
    id: 'off-lungi',
    categorySlug: 'lungi',
    categoryName: 'তাঁতের লুঙ্গি (Lungi)',
    offerHeadline: '৩টি লুঙ্গি অর্ডারে ১৫% ছাড় ও ফ্রি ডেলিভারি',
    offerDetails: 'সিরাজগঞ্জ ও পাবনার খাঁটি সুতি লুঙ্গির যেকোনো ৩টি অর্ডারে প্রযোজ্য।',
    couponCode: 'LUNGI15',
    badge: 'সেরা অফার',
    accentColor: 'border-blue-200 bg-blue-50/50 text-blue-900',
  },
  {
    id: 'off-saree',
    categorySlug: 'saree',
    categoryName: 'জামদানি শাড়ি (Saree)',
    offerHeadline: 'ঐতিহ্যবাহী জামদানি শাড়িতে ৫০০ টাকা ফ্ল্যাট ছাড়',
    offerDetails: 'হাতে বোনা ঢাকাই জামদানি শাড়ির কালেকশনে যেকোনো অর্ডারে ছাড়।',
    couponCode: 'SAREE500',
    badge: 'ফ্ল্যাট ছাড়',
    accentColor: 'border-rose-200 bg-rose-50/50 text-rose-900',
  },
  {
    id: 'off-panjabi',
    categorySlug: 'panjabi',
    categoryName: 'উৎসবের পাঞ্জাবি (Panjabi)',
    offerHeadline: 'রয়েল সিল্ক ও কটন পাঞ্জাবিতে ১২% উৎসব ছাড়',
    offerDetails: 'পাঞ্জাবি ও পায়জামা কম্বো অর্ডারে বিশেষ ডিসকাউন্ট।',
    couponCode: 'FESTIVE12',
    badge: 'উৎসব স্পেশাল',
    accentColor: 'border-amber-200 bg-amber-50/50 text-amber-900',
  },
  {
    id: 'off-three-piece',
    categorySlug: 'three-piece',
    categoryName: 'ডিজাইনার থ্রি-পিস (Three-Piece)',
    offerHeadline: 'ডিজাইনার সুতি থ্রি-পিসে ১০% বিশেষ ডিসকাউন্ট',
    offerDetails: 'উন্নত মানের সুতি কাপড় ও ডিজিটাল ওড়নার মেলবন্ধন।',
    couponCode: 'SUIT10',
    badge: 'উইমেন স্পেশাল',
    accentColor: 'border-purple-200 bg-purple-50/50 text-purple-900',
  },
  {
    id: 'off-tshirt',
    categorySlug: 't-shirt',
    categoryName: 'পিওর কটন টি-শার্ট (T-Shirt)',
    offerHeadline: '৩টি ১৮০ জিএসএম টি-শার্ট মাত্র ১,৪৯৯ টাকায়',
    offerDetails: '১০০% পিওর কম্বড কটন ব্রিদেবল ফেব্রিকের আরামদায়ক পোশাক।',
    couponCode: 'COMBO3',
    badge: 'কম্বো ডিল',
    accentColor: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
  },
];

export const CategoryOffersSection: React.FC = () => {
  const { navigateToCategory, showToast } = useShop();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`কুপন কোড কপি হয়েছে: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>ক্যাটাগরি অফার ড্যাশবোর্ড</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              কোন ক্যাটাগরির জন্য কী অফার?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              প্রোডাক্টের ছবি পরিষ্কার রাখতে প্রতিটি ক্যাটাগরির নির্দিষ্ট ছাড় ও কুপন কোড এখানে উল্লেখ করা হলো। কুপন কপি করে চেকআউটে ব্যবহার করুন।
            </p>
          </div>
        </div>

        {/* Offer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORY_OFFERS.map((item) => {
            const isCopied = copiedCode === item.couponCode;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border ${item.accentColor} flex flex-col justify-between transition-all hover:shadow-md group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-xs text-stone-900">{item.categoryName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug mb-1.5">
                    {item.offerHeadline}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {item.offerDetails}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  {/* Coupon Copy Pill */}
                  <button
                    onClick={() => handleCopy(item.couponCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer shadow-2xs active:scale-95"
                    title="কুপন কোড কপি করুন"
                  >
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{item.couponCode}</span>
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-400 ml-1" />
                    )}
                  </button>

                  {/* Shop Category Button */}
                  <button
                    onClick={() => navigateToCategory(item.categorySlug)}
                    className="flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <span>পণ্য দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
