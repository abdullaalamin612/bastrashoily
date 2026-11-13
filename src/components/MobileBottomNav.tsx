import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { isExactAdminUrl } from './Header';
import {
  Home,
  Search,
  Heart,
  ShoppingBasket,
  User,
  X,
  ArrowRight,
  Sparkles,
  Bot,
  MessageCircle,
  Send,
  Headphones,
  MoreHorizontal,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    navigateToHome,
    navigateToAdmin,
    cartCount,
    setIsCartOpen,
    wishlist,
    openWishlist,
    products,
    navigateToProduct,
    navigateToCategory,
    openAiAssistant,
    generalSettings,
    language,
    t,
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);

  const isAdminSearch = isExactAdminUrl(searchQuery);

  const searchResults = (!isAdminSearch && searchQuery.trim().length >= 1)
    ? (products || []).filter((p) => {
        if (!p || p.status !== 'active') return false;
        const q = searchQuery.trim().toLowerCase();
        const name = String(p.name || '').toLowerCase();
        const bangla = String(p.banglaName || (p as any).bangla_name || '').toLowerCase();
        const subCat = String(p.subCategory || (p as any).sub_category || '').toLowerCase();
        const cat = String(p.category || (p as any).category_name || '').toLowerCase();
        return name.includes(q) || bangla.includes(q) || subCat.includes(q) || cat.includes(q);
      }).slice(0, 5)
    : [];

  const handleWhatsAppClick = () => {
    const phone = generalSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '8801864528488';
    const text = encodeURIComponent('আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY) থেকে পণ্য কিনতে ও বিস্তারিত জানতে যোগাযোগ করছি।');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setIsSupportMenuOpen(false);
  };

  const handleMessengerClick = () => {
    const fbUrl = generalSettings.facebookUrl || 'https://facebook.com/bostroshoily';
    const pageHandle = fbUrl.split('/').filter(Boolean).pop() || 'bostroshoily';
    window.open(`https://m.me/${pageHandle}`, '_blank');
    setIsSupportMenuOpen(false);
  };

  const handleAiClick = () => {
    setIsSupportMenuOpen(false);
    openAiAssistant();
  };

  return (
    <>
      {/* Search Overlay Drawer on Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col md:hidden animate-in fade-in duration-200">
          <div className="bg-white p-4 border-b border-stone-200 rounded-b-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="mobile-search-input"
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (isAdminSearch) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToAdmin();
                        return;
                      }
                      if (searchResults.length > 0) {
                        const topProd = searchResults[0];
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToProduct(topProd.slug || topProd.id);
                        return;
                      }
                      const q = searchQuery.trim().toLowerCase();
                      if (['lungi', 'লুঙ্গি'].some((k) => q.includes(k))) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToCategory('lungi');
                        return;
                      }
                      if (['saree', 'শাড়ি', 'শাড়ি', 'jamdani', 'জামদানি'].some((k) => q.includes(k))) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToCategory('saree');
                        return;
                      }
                      if (['panjabi', 'পাঞ্জাবি'].some((k) => q.includes(k))) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToCategory('panjabi');
                        return;
                      }
                      if (['tshirt', 't-shirt', 'টি-শার্ট', 'টিশার্ট'].some((k) => q.includes(k))) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToCategory('tshirt');
                        return;
                      }
                      if (['three-piece', 'threepiece', 'থ্রি-পিস', 'থ্রিপিস'].some((k) => q.includes(k))) {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigateToCategory('three-piece');
                        return;
                      }
                    }
                  }}
                  placeholder="লুঙ্গি, শাড়ি, পাঞ্জাবি বা টি-শার্ট খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Results */}
            {isAdminSearch ? (
              <div
                id="mobile-search-admin-direct-link"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  navigateToAdmin();
                }}
                className="flex items-center gap-3 p-3 bg-stone-900 text-white rounded-xl cursor-pointer border border-amber-500/40"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  🔐
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-400">Admin Login এ প্রবেশ করুন</p>
                  <p className="text-[11px] text-stone-300">Enter চাপুন অথবা ক্লিক করে এডমিন পেজে যান</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
                  প্রোডাক্ট ফলাফল ({searchResults.length})
                </p>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigateToProduct(product.slug || product.id);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer border border-stone-100 transition-colors"
                  >
                    <img
                      src={product.mainImage || (product as any).main_image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'}
                      alt={product.name || ''}
                      className="w-10 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {product.banglaName || (product as any).bangla_name || product.name || 'পণ্য'}
                      </p>
                      <p className="text-[11px] text-amber-700 font-extrabold">
                        ৳{((product.discountPrice ?? (product as any).discount_price ?? product.price) || 0).toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length >= 1 ? (
              <div className="p-4 text-center space-y-1 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-xs text-stone-700 font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                <p className="text-[11px] text-stone-400">বানান সঠিক কিনা যাচাই করুন অথবা অন্য নাম দিয়ে খুঁজুন</p>
              </div>
            ) : null}
          </div>
          <div className="flex-1" onClick={() => setIsSearchOpen(false)} />
        </div>
      )}

      {/* Mobile Instant Support Menu (AI Assistant, WhatsApp, Messenger) */}
      {isSupportMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsSupportMenuOpen(false)}
          />

          {/* Bottom sheet content right above nav */}
          <div className="relative z-10 bg-white rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-stone-200 animate-in slide-in-from-bottom duration-250 space-y-4 max-w-lg mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {language === 'bn' ? 'বস্ত্র শৈলী (BOSTROSHOILY) সহায়তা কেন্দ্র' : 'BOSTROSHOILY Support'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {language === 'bn' ? 'যেকোনো প্রশ্নে সরাসরি কথা বলুন বা AI সাহায্য নিন' : 'Chat directly or ask our AI assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Channels */}
            <div className="space-y-2.5">
              {/* Option 1: AI Assistant */}
              <button
                onClick={handleAiClick}
                className="w-full flex items-center justify-between p-3.5 bg-stone-900 hover:bg-black text-white rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'AI সহকারী (বস্ত্র শৈলী)' : 'AI Shopping Assistant'}</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-stone-300">
                      {language === 'bn' ? 'সাইজ নির্বাচন, স্টক ও দ্রুত পণ্য খুঁজে পেতে' : 'Size guide, stock check & recommendations'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              {/* Option 2: WhatsApp */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-between p-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-stone-900 rounded-2xl transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-900">
                      {language === 'bn' ? 'হোয়াটসঅ্যাপে সরাসরি চ্যাট' : 'Chat on WhatsApp'}
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      {language === 'bn' ? 'কাস্টমার কেয়ার প্রতিনিধিদের সাথে তাৎক্ষণিক কথা বলুন' : 'Talk with customer care agent instantly'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>

              {/* Option 3: Messenger */}
              <button
                onClick={handleMessengerClick}
                className="w-full flex items-center justify-between p-3.5 bg-[#0084FF]/10 hover:bg-[#0084FF]/20 border border-[#0084FF]/30 text-stone-900 rounded-2xl transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-blue-900">
                      {language === 'bn' ? 'ফেসবুক মেসেঞ্জার' : 'Facebook Messenger'}
                    </div>
                    <p className="text-[11px] text-blue-700">
                      {language === 'bn' ? 'অফিসিয়াল ফেসবুক পেজে মেসেজ পাঠান' : 'Message on official Facebook page'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Navigation Bar (Jol-Chapa Translucent & Compact Height) */}
      <nav
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/25 backdrop-blur-[3px] border-t border-stone-200/30 shadow-md px-2 py-0.5 pb-safe transition-all"
      >
        <div className="grid grid-cols-5 items-end justify-around text-center">
          {/* 1. Home */}
          <button
            onClick={navigateToHome}
            className={`flex flex-col items-center justify-center py-0.5 rounded-lg transition-all cursor-pointer ${
              currentView === 'home'
                ? 'text-amber-800 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-0.5 font-medium">{t('home', 'হোম')}</span>
          </button>

          {/* 2. Wishlist */}
          <button
            onClick={openWishlist}
            className="relative flex flex-col items-center justify-center py-0.5 rounded-lg text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          >
            <div className="relative">
              <Heart className="w-4.5 h-4.5 text-rose-500" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 font-medium">{t('wishlist', 'পছন্দ')}</span>
          </button>

          {/* 3. Floating Action Button with ... (More/Dot-Dot) Support Icon */}
          <div className="relative -top-2 flex flex-col items-center justify-center">
            <button
              id="mobile-center-floating-support-btn"
              onClick={() => setIsSupportMenuOpen(!isSupportMenuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-stone-950 shadow-md shadow-amber-500/30 border-2 border-white/80 ring-2 ring-amber-500/20 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
              aria-label="Instant Support & AI (...)"
            >
              <MoreHorizontal className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </button>
            <span className="text-[8px] mt-0.5 font-bold text-amber-900 tracking-tight">
              {language === 'bn' ? 'সহায়তা' : 'Support'}
            </span>
          </div>

          {/* 4. Cart / Jhuri */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center py-0.5 rounded-lg text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          >
            <div className="relative">
              <span className="text-base leading-none inline-block" role="img" aria-label="cart">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 font-medium">{language === 'bn' ? 'ঝুড়ি' : 'Basket'}</span>
          </button>

          {/* 5. Search */}
          <button
            id="mobile-bottom-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center py-0.5 rounded-lg text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
            aria-label="Search Products"
          >
            <Search className="w-4.5 h-4.5 text-stone-600" />
            <span className="text-[9px] mt-0.5 font-medium">
              {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
