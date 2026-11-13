import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Ruler, X, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideModalOpen, closeSizeGuideModal, sizeGuideCategory } = useShop();
  const [activeTab, setActiveTab] = useState<'lungi' | 'panjabi' | 'saree' | 'tshirt'>(() => {
    const cat = (sizeGuideCategory || '').toLowerCase();
    if (cat.includes('panjabi')) return 'panjabi';
    if (cat.includes('saree')) return 'saree';
    if (cat.includes('t-shirt') || cat.includes('tshirt')) return 'tshirt';
    return 'lungi';
  });

  if (!isSizeGuideModalOpen) return null;

  return (
    <div
      id="size-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="size-guide-modal-box"
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">বস্ত্র শৈলী (BOSTROSHOILY) সাইজ গাইড (Size & Fit Guide)</h3>
              <p className="text-xs text-stone-500">আপনার জন্য নিখুঁত মাপ নিশ্চিত করুন</p>
            </div>
          </div>
          <button
            onClick={closeSizeGuideModal}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-stone-200 pb-2 overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'lungi', label: 'লুঙ্গির মাপ (Lungi)' },
            { id: 'panjabi', label: 'পাঞ্জাবির মাপ (Panjabi)' },
            { id: 'saree', label: 'শাড়ির মাপ (Saree)' },
            { id: 'tshirt', label: 'টি-শার্ট মাপ (T-Shirt)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-stone-700">
          {/* Lungi Size Table */}
          {activeTab === 'lungi' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  বস্ত্র শৈলী (BOSTROSHOILY)-এর সুতি তাঁতের লুঙ্গিগুলো সিরাজগঞ্জের ঐতিহ্যবাহী প্রমিত মাপে তৈরি। কোমরের ঘের ফ্রি-সাইজ (যেকোনো বয়সের পুরুষদের জন্য মানানসই)।
                </p>
              </div>

              {/* Exact Lungi Size Chart requested by user */}
              <div className="p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-md">
                <div className="text-xs font-bold text-amber-400 mb-3 border-b border-stone-800 pb-2 flex items-center justify-between">
                  <span>লুঙ্গির সুতা ও মাপের চার্ট (Lungi Size Chart)</span>
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">প্রিমিয়াম সিরাজগঞ্জ তাঁত</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center sm:text-left">
                  <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700/80">
                    <p className="text-[11px] text-stone-400 font-semibold mb-1">সুতার কাউন্ট</p>
                    <p className="text-xl font-black font-mono text-amber-400">80</p>
                  </div>

                  <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700/80">
                    <p className="text-[11px] text-stone-400 font-semibold mb-1">দৈর্ঘ্য</p>
                    <p className="text-base sm:text-lg font-bold text-white">3 হাত / 54 ইঞ্চি</p>
                  </div>

                  <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700/80">
                    <p className="text-[11px] text-stone-400 font-semibold mb-1">শানা</p>
                    <p className="text-xl font-black font-mono text-amber-400">130</p>
                  </div>

                  <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700/80">
                    <p className="text-[11px] text-stone-400 font-semibold mb-1">চওড়া</p>
                    <p className="text-base sm:text-lg font-bold text-white">৬ হাত / সাড়ে ৫ হাত</p>
                  </div>
                </div>

                {/* Preformatted exact text layout display */}
                <div className="mt-3 p-3 bg-black/60 rounded-lg border border-stone-800 font-mono text-xs sm:text-sm text-stone-300 overflow-x-auto whitespace-pre">
{`সুতার কাউন্ট                দৈর্ঘ্য
     80                      3 হাত/ 54 ইঞ্চি

 শানা                               চওড়া
130                         ৬ হাত / সাড়ে ৫ হাত`}
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-stone-200 text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 font-bold">
                    <th className="p-2.5 border border-stone-200">সাইজের নাম</th>
                    <th className="p-2.5 border border-stone-200">দৈর্ঘ্য (হাত / ইঞ্চি)</th>
                    <th className="p-2.5 border border-stone-200">বহর / প্রস্থ (ইঞ্চি)</th>
                    <th className="p-2.5 border border-stone-200">উপযুক্ততা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold text-stone-900">২.৫ হাত (Standard)</td>
                    <td className="p-2.5 border border-stone-200">২.৫ হাত (~৪৫ ইঞ্চি)</td>
                    <td className="p-2.5 border border-stone-200">৮০ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">দৈনন্দিন ব্যবহারের আদর্শ মাপ</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-amber-50/40">
                    <td className="p-2.5 border border-stone-200 font-bold text-stone-900">৩ হাত (Large / 54")</td>
                    <td className="p-2.5 border border-stone-200 font-bold text-amber-800">৩ হাত / ৫৪ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200 font-bold text-amber-800">৬ হাত / সাড়ে ৫ হাত</td>
                    <td className="p-2.5 border border-stone-200">লম্বা বা আরামদায়ক বড় বহর পছন্দকারীদের জন্য</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 text-[11px] text-stone-600">
                <p className="font-semibold text-stone-800">💡 লুঙ্গি পরার টিপস:</p>
                <p>• প্রতিটি লুঙ্গি ৮০ কাউন্টের মিহি সুতা এবং ১৩০ শানায় বোনা, ধোয়ার পর সংকুচিত (shrink) হয় না।</p>
                <p>• দুই প্রান্ত মজবুত লক-স্টিচিং দিয়ে পাকা সেলাই করা থাকে, খুলে যাওয়ার কোনো সম্ভাবনা নেই।</p>
              </div>
            </div>
          )}

          {/* Panjabi Size Table */}
          {activeTab === 'panjabi' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                আমাদের সেমি-লং ও কাবলি পাঞ্জাবির প্রতিটি সাইজের নিখুঁত মাপ নিচে দেওয়া হলো (সব মাপ ইঞ্চিতে):
              </p>

              <table className="w-full text-left border-collapse border border-stone-200 text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 font-bold">
                    <th className="p-2.5 border border-stone-200">সাইজ</th>
                    <th className="p-2.5 border border-stone-200">বুকের মাপ (Chest)</th>
                    <th className="p-2.5 border border-stone-200">লম্বা (Length)</th>
                    <th className="p-2.5 border border-stone-200">হাতা (Sleeve)</th>
                    <th className="p-2.5 border border-stone-200">কলার (Collar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">S (36)</td>
                    <td className="p-2.5 border border-stone-200">৩৬ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">৩৮ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৩ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৪.৫ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">M (38)</td>
                    <td className="p-2.5 border border-stone-200">৩৮ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">৪০ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৪ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৫.০ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">L (40)</td>
                    <td className="p-2.5 border border-stone-200">৪০ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">৪২ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৪.৫ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৫.৫ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">XL (42)</td>
                    <td className="p-2.5 border border-stone-200">৪২ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">৪৪ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৫ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৬.০ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">XXL (44)</td>
                    <td className="p-2.5 border border-stone-200">৪৪ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">৪৫ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৫.৫ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৬.৫ ইঞ্চি</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Saree Size Table */}
          {activeTab === 'saree' && (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse border border-stone-200 text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 font-bold">
                    <th className="p-2.5 border border-stone-200">পোশাকের অংশ</th>
                    <th className="p-2.5 border border-stone-200">প্রমিত দৈর্ঘ্য</th>
                    <th className="p-2.5 border border-stone-200">প্রস্থ / বহর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">শাড়ির মূল অংশ</td>
                    <td className="p-2.5 border border-stone-200">৫.৫ - ৬.০ মিটার (১২ হাত)</td>
                    <td className="p-2.5 border border-stone-200">১.১৫ মিটার (৪৫ ইঞ্চি)</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">ম্যাচিং ব্লাউজ পিস</td>
                    <td className="p-2.5 border border-stone-200">০.৮ - ১.০ মিটার (রানিং পিস)</td>
                    <td className="p-2.5 border border-stone-200">১.১৫ মিটার</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* T-Shirt Size Table */}
          {activeTab === 'tshirt' && (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse border border-stone-200 text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-900 font-bold">
                    <th className="p-2.5 border border-stone-200">সাইজ</th>
                    <th className="p-2.5 border border-stone-200">বুক (Chest)</th>
                    <th className="p-2.5 border border-stone-200">দৈর্ঘ্য (Length)</th>
                    <th className="p-2.5 border border-stone-200">কাঁধ (Shoulder)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">M</td>
                    <td className="p-2.5 border border-stone-200">৩৮ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৭ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৭ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">L</td>
                    <td className="p-2.5 border border-stone-200">৪০ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৮ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৮ ইঞ্চি</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-2.5 border border-stone-200 font-bold">XL</td>
                    <td className="p-2.5 border border-stone-200">৪২ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">২৯ ইঞ্চি</td>
                    <td className="p-2.5 border border-stone-200">১৯ ইঞ্চি</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 pt-3 flex items-center justify-between shrink-0 text-xs">
          <span className="text-stone-500">সঠিক মাপ বাছাইয়ে দ্বিধা থাকলে WhatsApp-এ নক দিন।</span>
          <button
            onClick={closeSizeGuideModal}
            className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
