import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import {
  MessageSquare,
  Bot,
  MessageCircle,
  X,
  Sparkles,
  Send,
} from 'lucide-react';

export const FloatingAssistant: React.FC = () => {
  const { openAiAssistant, generalSettings } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide floating button during scroll, show back when scrolling stops
  useEffect(() => {
    const handleScroll = () => {
      // While user is actively scrolling, hide floating button
      setIsVisible(false);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Show back immediately once scrolling stops (after 180ms debounce)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleWhatsAppClick = () => {
    const phone = generalSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '8801864528488';
    const text = encodeURIComponent('আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY) থেকে পণ্য কিনতে ও বিস্তারিত জানতে যোগাযোগ করছি।');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const handleMessengerClick = () => {
    const fbUrl = generalSettings.facebookUrl || 'https://facebook.com/bostroshoily';
    const pageHandle = fbUrl.split('/').filter(Boolean).pop() || 'bostroshoily';
    window.open(`https://m.me/${pageHandle}`, '_blank');
    setIsOpen(false);
  };

  const handleAiClick = () => {
    setIsOpen(false);
    openAiAssistant();
  };

  return (
    <div
      id="floating-support-container"
      className={`fixed bottom-6 right-5 sm:right-6 z-40 flex flex-col items-end transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-2xs cursor-pointer"
        />
      )}

      {/* Expanded 3 Options Menu */}
      {isOpen && (
        <div
          id="floating-options-menu"
          className="mb-3 z-40 flex flex-col items-end gap-2.5 animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          {/* Option 1: Live Chat / AI Assistant */}
          <button
            onClick={handleAiClick}
            className="flex items-center gap-3 bg-stone-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="text-right">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                <span>১. বস্ত্র শৈলী (BOSTROSHOILY) - সহকারী</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[10px] text-stone-400">সাইজ, দাম, স্টক ও তাৎক্ষণিক তথ্য</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors shrink-0">
              <Bot className="w-5 h-5" />
            </div>
          </button>

          {/* Option 2: WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="text-right">
              <div className="text-xs font-bold">২. WhatsApp (01864528488)</div>
              <div className="text-[10px] text-emerald-100">সরাসরি কথা ও ছবি আদান-প্রদান</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            </div>
          </button>

          {/* Option 3: Messenger */}
          <button
            onClick={handleMessengerClick}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="text-right">
              <div className="text-xs font-bold">৩. Messenger (মেসেঞ্জার)</div>
              <div className="text-[10px] text-blue-100">ফেসবুক পেজে সরাসরি চ্যাট</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4 fill-white text-blue-600 rotate-45" />
            </div>
          </button>
        </div>
      )}

      {/* Main Single Floating Action Button */}
      <button
        id="main-floating-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="কাস্টমার সাপোর্ট ও লাইভ চ্যাট"
        className={`relative z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-stone-800 rotate-90 scale-95 shadow-stone-800/40'
            : 'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 hover:scale-105 active:scale-95 shadow-amber-600/50'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 stroke-[2.2]" />
            {/* Pulsing indicator ring */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};
