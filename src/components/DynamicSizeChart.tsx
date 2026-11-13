import React, { useState } from 'react';
import { Ruler, Sparkles, CheckCircle2, ZoomIn, X, Image as ImageIcon } from 'lucide-react';
import { SizeChartData } from '../types';
import { useShop } from '../context/ShopContext';

interface DynamicSizeChartProps {
  category?: string;
  subCategory?: string;
  productName?: string;
  sizeChart?: SizeChartData;
}

export const DynamicSizeChart: React.FC<DynamicSizeChartProps> = ({
  category = '',
  subCategory = '',
  productName = '',
  sizeChart,
}) => {
  const { categorySizeCharts } = useShop();
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const normalized = `${subCategory} ${category} ${productName}`.toLowerCase();

  const getDetectedCategory = (): 'panjabi' | 'tshirt' | 'lungi' | 'saree' | 'threepiece' => {
    if (normalized.includes('lungi') || normalized.includes('লুঙ্গি')) return 'lungi';
    if (normalized.includes('saree') || normalized.includes('শাড়ি') || normalized.includes('শাড়ি') || normalized.includes('jamdani')) return 'saree';
    if (normalized.includes('three-piece') || normalized.includes('three piece') || normalized.includes('থ্রি-পিস') || normalized.includes('থ্রী পিস') || normalized.includes('salwar') || normalized.includes('kameez')) return 'threepiece';
    if (normalized.includes('t-shirt') || normalized.includes('tshirt') || normalized.includes('টি শার্ট') || normalized.includes('টি-শার্ট') || normalized.includes('tee')) return 'tshirt';
    return 'panjabi';
  };

  const [activeTab, setActiveTab] = React.useState<'panjabi' | 'tshirt' | 'lungi' | 'saree' | 'threepiece'>(getDetectedCategory);

  React.useEffect(() => {
    setActiveTab(getDetectedCategory());
  }, [category, subCategory, productName]);

  const isLungi = activeTab === 'lungi';
  const isSaree = activeTab === 'saree';
  const isThreePiece = activeTab === 'threepiece';
  const isTshirt = activeTab === 'tshirt';
  const isPanjabi = activeTab === 'panjabi';

  // Active uploaded image (product custom image takes precedence, then category custom image)
  const productCustomImage = sizeChart?.imageUrl;
  const categoryCustomImage = categorySizeCharts?.[activeTab]?.imageUrl;
  const activeImage = productCustomImage || categoryCustomImage;
  const activeNote = sizeChart?.note || categorySizeCharts?.[activeTab]?.note;
  const hasCustomRows = Boolean(sizeChart?.rows && sizeChart.rows.length > 0 && sizeChart.headers && sizeChart.headers.length > 0);

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Header bar */}
      <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-amber-500" />
          <span className="font-extrabold uppercase tracking-wider">
            {activeImage && productCustomImage
              ? 'পণ্যের নিজস্ব সাইজ চার্ট (Product Size Chart)'
              : isLungi
              ? 'লুঙ্গি সাইজ ও তাঁত পরিমাপ চার্ট (Lungi Size Diagram)'
              : isSaree
              ? 'শাড়ি পরিমাপ ও বহর গাইড (Saree Size Diagram)'
              : isThreePiece
              ? 'থ্রি-পিস সাইজ ও কাটিং চার্ট (Three-Piece Size Diagram)'
              : isTshirt
              ? 'টি-শার্ট মেজারমেন্ট চার্ট (T-Shirt Size Diagram)'
              : 'পাঞ্জাবি মেজারমেন্ট চার্ট (Panjabi Size Diagram)'}
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded-full">
          {activeImage ? 'ছবি সহ চার্ট' : isLungi ? 'সিরাজগঞ্জ তাঁত প্রমিত মাপ' : isSaree ? 'গজ ও ইঞ্চি মাপ' : 'ইন ইঞ্চি (Inches)'}
        </span>
      </div>

      {/* TOP: UPLOADED SIZE CHART IMAGE DISPLAY */}
      {activeImage && (
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 flex flex-col items-center">
          <div
            className="relative group cursor-pointer max-w-xl w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white"
            onClick={() => setIsZoomOpen(true)}
            title="বড় করে দেখতে ক্লিক করুন"
          >
            <img
              src={activeImage}
              alt="Size Chart"
              className="w-full max-h-[460px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-2xs">
              <ZoomIn className="w-5 h-5 text-amber-400" />
              <span>বড় করে দেখতে ক্লিক করুন (Click to Zoom)</span>
            </div>
            <div className="absolute top-2.5 right-2.5 bg-stone-900/85 text-white p-1.5 rounded-lg shadow-sm flex items-center gap-1 text-[10px] font-semibold">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>বড় ভিউ</span>
            </div>
          </div>
          {activeNote && (
            <p className="mt-3 text-xs text-stone-700 text-center font-medium max-w-lg bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl">
              {activeNote}
            </p>
          )}
        </div>
      )}

      {/* TOP: VISUAL LINE DIAGRAM (Only shown when no custom image is uploaded) */}
      {!activeImage && (
        <div className="bg-gradient-to-b from-stone-50 to-white p-4 sm:p-6 border-b border-stone-200 flex flex-col items-center justify-center">
        {/* PANJABI DIAGRAM */}
        {isPanjabi && (
          <div className="relative w-full max-w-sm flex flex-col items-center py-2">
            <svg
              viewBox="0 0 300 320"
              className="w-56 h-60 drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Panjabi Body Outline */}
              <path
                d="M120 20 L180 20 L210 50 L270 90 L245 125 L210 100 L210 300 L90 300 L90 100 L55 125 L30 90 L90 50 Z"
                fill="#f8fafc"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Collar / Placket */}
              <path d="M135 20 C135 35 165 35 165 20" stroke="#334155" strokeWidth="2.5" />
              <line x1="150" y1="30" x2="150" y2="120" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="150" cy="55" r="2" fill="#d97706" />
              <circle cx="150" cy="75" r="2" fill="#d97706" />
              <circle cx="150" cy="95" r="2" fill="#d97706" />

              {/* Chest Measurement Line (বুক) */}
              <line x1="90" y1="110" x2="210" y2="110" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="95,107 90,110 95,113" fill="#dc2626" />
              <polygon points="205,107 210,110 205,113" fill="#dc2626" />

              {/* Length Measurement Line (দৈর্ঘ্য / ঝুল) */}
              <line x1="75" y1="20" x2="75" y2="300" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="72,25 75,20 78,25" fill="#2563eb" />
              <polygon points="72,295 75,300 78,295" fill="#2563eb" />

              {/* Sleeve Measurement Line (হাতা) */}
              <line x1="210" y1="50" x2="270" y2="90" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="214,56 210,50 216,50" fill="#16a34a" />
              <polygon points="266,85 270,90 264,90" fill="#16a34a" />
            </svg>

            {/* Measurement Labels */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>দৈর্ঘ্য / ঝুল (Length)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>বুক (Chest)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>হাতা (Sleeve)</span>
              </div>
            </div>
          </div>
        )}

        {/* T-SHIRT DIAGRAM */}
        {isTshirt && (
          <div className="relative w-full max-w-sm flex flex-col items-center py-2">
            <svg
              viewBox="0 0 300 280"
              className="w-56 h-56 drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M110 30 L190 30 L220 50 L285 85 L260 125 L220 100 L220 260 L80 260 L80 100 L40 125 L15 85 L80 50 Z"
                fill="#f8fafc"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M115 30 C125 50 175 50 185 30" stroke="#334155" strokeWidth="2.5" />

              {/* Chest Line */}
              <line x1="80" y1="110" x2="220" y2="110" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="85,107 80,110 85,113" fill="#dc2626" />
              <polygon points="215,107 220,110 215,113" fill="#dc2626" />

              {/* Length Line */}
              <line x1="65" y1="30" x2="65" y2="260" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="62,35 65,30 68,35" fill="#2563eb" />
              <polygon points="62,255 65,260 68,255" fill="#2563eb" />

              {/* Sleeve Line */}
              <line x1="220" y1="50" x2="285" y2="85" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs font-bold">
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">দৈর্ঘ্য (Length)</span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">বুক (Chest)</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">হাতা (Sleeve)</span>
            </div>
          </div>
        )}

        {/* LUNGI DIAGRAM */}
        {isLungi && (
          <div className="relative w-full max-w-md flex flex-col items-center py-2">
            <svg
              viewBox="0 0 340 220"
              className="w-72 h-48 drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lungi Cylinder Pattern */}
              <rect x="50" y="30" width="240" height="150" rx="10" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
              {/* Checked pattern lines */}
              <line x1="50" y1="65" x2="290" y2="65" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="105" x2="290" y2="105" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="145" x2="290" y2="145" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="110" y1="30" x2="110" y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="170" y1="30" x2="170" y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="230" y1="30" x2="230" y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

              {/* Length Line (দৈর্ঘ্য) */}
              <line x1="30" y1="30" x2="30" y2="180" stroke="#2563eb" strokeWidth="2.5" />
              <polygon points="26,36 30,30 34,36" fill="#2563eb" />
              <polygon points="26,174 30,180 34,174" fill="#2563eb" />
              <text x="5" y="110" fill="#2563eb" fontSize="11" fontWeight="bold" transform="rotate(-90 15,110)">
                দৈর্ঘ্য (Length)
              </text>

              {/* Width Line (চওড়া / ঘের) */}
              <line x1="50" y1="195" x2="290" y2="195" stroke="#d97706" strokeWidth="2.5" />
              <polygon points="56,191 50,195 56,199" fill="#d97706" />
              <polygon points="284,191 290,195 284,199" fill="#d97706" />
              <text x="120" y="212" fill="#d97706" fontSize="11" fontWeight="bold">
                চওড়া / ঘের (Width)
              </text>
            </svg>

            {/* Handloom Weave Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-2 text-center text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 font-bold text-amber-900">
                <span className="text-[10px] text-amber-600 block">সুতার কাউন্ট</span>
                <span>৮০ কাউন্ট (80s)</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 font-bold text-blue-900">
                <span className="text-[10px] text-blue-600 block">দৈর্ঘ্য</span>
                <span>৩ হাত / ৫৪ ইঞ্চি</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 font-bold text-emerald-900">
                <span className="text-[10px] text-emerald-600 block">চওড়া / বহর</span>
                <span>৬ হাত / সাড়ে ৫ হাত</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-2 font-bold text-purple-900">
                <span className="text-[10px] text-purple-600 block">তাঁত শানা</span>
                <span>১৩০ শানা</span>
              </div>
            </div>
          </div>
        )}

        {/* SAREE DIAGRAM */}
        {isSaree && (
          <div className="relative w-full max-w-md flex flex-col items-center py-2">
            <svg
              viewBox="0 0 340 180"
              className="w-72 h-40 drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Saree Draped Border */}
              <rect x="40" y="20" width="260" height="110" rx="8" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
              {/* Aanchal / Pallu */}
              <rect x="230" y="20" width="70" height="110" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
              <text x="240" y="80" fill="#b45309" fontSize="10" fontWeight="bold">আঁচল (Pallu)</text>

              {/* Length Line */}
              <line x1="40" y1="145" x2="300" y2="145" stroke="#2563eb" strokeWidth="2.5" />
              <polygon points="46,141 40,145 46,149" fill="#2563eb" />
              <polygon points="294,141 300,145 294,149" fill="#2563eb" />
              <text x="120" y="165" fill="#2563eb" fontSize="11" fontWeight="bold">
                দৈর্ঘ্য (১২ থেকে ১২.৫ হাত / ৫.৫-৬.০ মিটার)
              </text>

              {/* Width Line */}
              <line x1="25" y1="20" x2="25" y2="130" stroke="#dc2626" strokeWidth="2" />
              <polygon points="22,25 25,20 28,25" fill="#dc2626" />
              <polygon points="22,125 25,130 28,125" fill="#dc2626" />
              <text x="5" y="80" fill="#dc2626" fontSize="10" fontWeight="bold" transform="rotate(-90 15,80)">
                বহর (৪৪-৪৮")
              </text>
            </svg>
            <div className="flex gap-4 mt-2 text-xs font-bold text-stone-700">
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">দৈর্ঘ্য: ১২ - ১২.৫ হাত</span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">বহর / চওড়া: ৪৬-৪৮ ইঞ্চি</span>
            </div>
          </div>
        )}

        {/* THREE-PIECE DIAGRAM */}
        {isThreePiece && (
          <div className="relative w-full max-w-md flex flex-col items-center py-2">
            <div className="grid grid-cols-3 gap-3 w-full text-center text-xs">
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                <span className="font-extrabold text-amber-700 block mb-1">১. কামিজ (Kameez)</span>
                <span className="text-stone-500 block">বুক: ৩৮&quot; - ৪৬&quot;</span>
                <span className="text-stone-500 block">দৈর্ঘ্য: ৪২&quot; - ৪৫&quot;</span>
              </div>
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                <span className="font-extrabold text-blue-700 block mb-1">২. সালোয়ার (Salwar)</span>
                <span className="text-stone-500 block">ঝুল: ৩৮&quot; - ৪১&quot;</span>
                <span className="text-stone-500 block">ঘের: আরামদায়ক</span>
              </div>
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50">
                <span className="font-extrabold text-emerald-700 block mb-1">৩. ওড়না (Dupatta)</span>
                <span className="text-stone-500 block">দৈর্ঘ্য: ৫ হাত (৯০&quot;)</span>
                <span className="text-stone-500 block">বহর: ৩৬&quot; (পিউর সুতি)</span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* BOTTOM: MEASUREMENT MATRIX TABLES */}
      <div className="p-2 sm:p-4 bg-white">
        {/* CUSTOM TABLE ROWS (If provided for product) */}
        {hasCustomRows ? (
          <div className="overflow-x-auto p-1">
            <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200 rounded-t-lg">
              {sizeChart?.note || 'নির্দিষ্ট পণ্যের মাপতালিকা (Product Measurement Table)'}
            </div>
            <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-xs border-b border-stone-200">
                <tr>
                  {sizeChart!.headers.map((h, i) => (
                    <th key={h} className={`p-2.5 ${i < sizeChart!.headers.length - 1 ? 'border-r border-stone-200' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs font-semibold text-stone-800">
                {sizeChart!.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-amber-50/30">
                    {sizeChart!.headers.map((h, cIdx) => (
                      <td
                        key={h}
                        className={`p-2.5 ${cIdx === 0 ? 'bg-stone-50/60 font-bold' : ''} ${
                          cIdx < sizeChart!.headers.length - 1 ? 'border-r border-stone-200' : ''
                        }`}
                      >
                        {row[h] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* PANJABI TABLE (Matching user reference 1791822717359.jpg - Panjabi size chart In Inch) */}
            {isPanjabi && (
              <div className="overflow-x-auto p-1">
                <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200">
                  Panjabi size chart In Inch
                </div>
                <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-xs border-b border-stone-200">
                <tr>
                  <th className="p-2.5 border-r border-stone-200">Size</th>
                  <th className="p-2.5 border-r border-stone-200">S</th>
                  <th className="p-2.5 border-r border-stone-200">M</th>
                  <th className="p-2.5 border-r border-stone-200">L</th>
                  <th className="p-2.5 border-r border-stone-200">XL</th>
                  <th className="p-2.5">XXL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs font-semibold text-stone-800">
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Chest</td>
                  <td className="p-2.5 border-r border-stone-200">38</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">42</td>
                  <td className="p-2.5 border-r border-stone-200">44</td>
                  <td className="p-2.5">46</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Sleeve</td>
                  <td className="p-2.5 border-r border-stone-200">23</td>
                  <td className="p-2.5 border-r border-stone-200">23.5</td>
                  <td className="p-2.5 border-r border-stone-200">24</td>
                  <td className="p-2.5 border-r border-stone-200">24.5</td>
                  <td className="p-2.5">25</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Length</td>
                  <td className="p-2.5 border-r border-stone-200">38</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">42</td>
                  <td className="p-2.5 border-r border-stone-200">44</td>
                  <td className="p-2.5">46</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* T-SHIRT TABLE (Matching user reference 1791822717359.jpg - T-Shirt size chart In Inch) */}
        {isTshirt && (
          <div className="overflow-x-auto p-1">
            <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200">
              T-Shirt size chart In Inch
            </div>
            <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-xs border-b border-stone-200">
                <tr>
                  <th className="p-2.5 border-r border-stone-200">Size</th>
                  <th className="p-2.5 border-r border-stone-200">M</th>
                  <th className="p-2.5 border-r border-stone-200">L</th>
                  <th className="p-2.5 border-r border-stone-200">XL</th>
                  <th className="p-2.5">XXL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs font-semibold text-stone-800">
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Chest</td>
                  <td className="p-2.5 border-r border-stone-200">39</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">41</td>
                  <td className="p-2.5">45</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Sleeve</td>
                  <td className="p-2.5 border-r border-stone-200">8.5</td>
                  <td className="p-2.5 border-r border-stone-200">9</td>
                  <td className="p-2.5 border-r border-stone-200">9.5</td>
                  <td className="p-2.5">9.5</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Length</td>
                  <td className="p-2.5 border-r border-stone-200">26</td>
                  <td className="p-2.5 border-r border-stone-200">27.5</td>
                  <td className="p-2.5 border-r border-stone-200">28.5</td>
                  <td className="p-2.5">29</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* LUNGI TABLE (Matching exactly USER provided image - ১. লুঙ্গী পরিমাপ) */}
        {isLungi && (
          <div className="overflow-x-auto p-1">
            <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200">
              ১. লুঙ্গী পরিমাপ নির্দেশিকা
            </div>
            <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-[11px] sm:text-xs border-b border-stone-200">
                <tr>
                  <th className="p-3 border-r border-stone-200">সাইজ</th>
                  <th className="p-3 border-r border-stone-200">সুতার কাউন্ট</th>
                  <th className="p-3 border-r border-stone-200">দৈর্ঘ্য Length</th>
                  <th className="p-3 border-r border-stone-200">বহর Width</th>
                  <th className="p-3">শানা/REED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800">
                <tr className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-3.5 border-r border-stone-200 font-bold text-stone-950">Free Size</td>
                  <td className="p-3.5 border-r border-stone-200">80 Count</td>
                  <td className="p-3.5 border-r border-stone-200">54 Inchi</td>
                  <td className="p-3.5 border-r border-stone-200">5.5 হতে/ 104 inchi</td>
                  <td className="p-3.5 font-mono">130</td>
                </tr>
                <tr className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-3.5 border-r border-stone-200 font-bold text-stone-950">Free Size</td>
                  <td className="p-3.5 border-r border-stone-200">80 Count</td>
                  <td className="p-3.5 border-r border-stone-200">54 Inchi</td>
                  <td className="p-3.5 border-r border-stone-200">5.5 তাকে/ 104 inchi</td>
                  <td className="p-3.5 font-mono">130</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SAREE TABLE (Matching user reference - ২. শাড়ী পরিমাপ) */}
        {isSaree && (
          <div className="overflow-x-auto p-1">
            <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200">
              ২. শাড়ী পরিমাপ নির্দেশিকা (গজ এবং ইঞ্চিতে)
            </div>
            <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-xs border-b border-stone-200">
                <tr>
                  <th className="p-3 border-r border-stone-200">Size</th>
                  <th className="p-3 border-r border-stone-200">Length</th>
                  <th className="p-3 border-r border-stone-200">Length</th>
                  <th className="p-3 border-r border-stone-200">Width</th>
                  <th className="p-3">ব্লাউজ পিস (Gaj)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800">
                <tr className="hover:bg-amber-50/30">
                  <td className="p-3.5 border-r border-stone-200 font-bold text-stone-950">Standard</td>
                  <td className="p-3.5 border-r border-stone-200">6 yards</td>
                  <td className="p-3.5 border-r border-stone-200">6 yards</td>
                  <td className="p-3.5 border-r border-stone-200">46-48 inchi</td>
                  <td className="p-3.5">0.7 Gaj</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* THREE-PIECE TABLE (Matching user reference - ৩. থ্রি-পিস পরিমাপ নির্দেশিকা) */}
        {isThreePiece && (
          <div className="overflow-x-auto p-1">
            <div className="text-center font-bold text-stone-800 text-xs py-2 bg-stone-100 border-b border-stone-200">
              ৩. থ্রি-পিস পরিমাপ নির্দেশিকা
            </div>
            <table className="w-full text-center border-collapse">
              <thead className="bg-stone-50 font-bold text-stone-800 text-xs border-b border-stone-200">
                <tr>
                  <th className="p-2.5 border-r border-stone-200">Size</th>
                  <th className="p-2.5 border-r border-stone-200">S</th>
                  <th className="p-2.5 border-r border-stone-200">M</th>
                  <th className="p-2.5 border-r border-stone-200">L</th>
                  <th className="p-2.5 border-r border-stone-200">XL</th>
                  <th className="p-2.5">XXL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white text-xs font-semibold text-stone-800">
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Kamiz</td>
                  <td className="p-2.5 border-r border-stone-200">42</td>
                  <td className="p-2.5 border-r border-stone-200">43</td>
                  <td className="p-2.5 border-r border-stone-200">44</td>
                  <td className="p-2.5 border-r border-stone-200">45</td>
                  <td className="p-2.5">46</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Length</td>
                  <td className="p-2.5 border-r border-stone-200">42</td>
                  <td className="p-2.5 border-r border-stone-200">43</td>
                  <td className="p-2.5 border-r border-stone-200">44</td>
                  <td className="p-2.5 border-r border-stone-200">45</td>
                  <td className="p-2.5">46</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Waist</td>
                  <td className="p-2.5 border-r border-stone-200">37</td>
                  <td className="p-2.5 border-r border-stone-200">39</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">41</td>
                  <td className="p-2.5">46</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Length</td>
                  <td className="p-2.5 border-r border-stone-200">38</td>
                  <td className="p-2.5 border-r border-stone-200">39</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">41</td>
                  <td className="p-2.5">42</td>
                </tr>
                <tr className="hover:bg-amber-50/30">
                  <td className="p-2.5 bg-stone-50/60 font-bold border-r border-stone-200">Dopatta</td>
                  <td className="p-2.5 border-r border-stone-200">36</td>
                  <td className="p-2.5 border-r border-stone-200">39</td>
                  <td className="p-2.5 border-r border-stone-200">40</td>
                  <td className="p-2.5 border-r border-stone-200">41</td>
                  <td className="p-2.5">42</td>
                </tr>
              </tbody>
            </table>
          </div>
            )}
          </>
        )}
      </div>

      <div className="bg-stone-50 p-2.5 px-4 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-200">
        <span>* সমস্ত মাপ স্ট্যান্ডার্ড ইঞ্চিতে পরিমাপ করা।</span>
        <span className="font-bold text-amber-700">১০০% প্রিমিয়াম সুতা ও তাঁত নিশ্চয়তা</span>
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-3 sm:p-5 overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 p-2 bg-stone-900 text-white hover:bg-stone-800 rounded-full cursor-pointer z-10 shadow-md"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center p-2">
              <img
                src={activeImage}
                alt="Size Chart Enlarged"
                className="max-w-full max-h-[78vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-2 text-center text-xs text-stone-600 font-medium">
              বস্ত্র শৈলী (BOSTROSHOILY) সাইজ চার্ট (হাই-রেজোলিউশন ভিউ)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
