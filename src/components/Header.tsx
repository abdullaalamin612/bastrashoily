import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Logo } from './Logo';
import {
  ShoppingBasket,
  Search,
  ChevronDown,
  Menu,
  X,
  Truck,
  PhoneCall,
  ShieldCheck,
  HelpCircle,
  Video,
  User,
  ArrowLeft,
  Lock,
  Ruler,
  MessageCircle,
  Package,
  LogOut,
  Sparkles,
} from 'lucide-react';

export function isExactAdminUrl(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim().toLowerCase();
  let clean = trimmed.replace(/^https?:\/\//, '');
  clean = clean.replace(/^www\./, '');
  const currentHost = typeof window !== 'undefined' ? window.location.host.toLowerCase().replace(/^www\./, '') : '';
  if (
    currentHost &&
    (clean === `${currentHost}/account` ||
      clean === `${currentHost}/account/login` ||
      clean === `${currentHost}/admin` ||
      clean === `${currentHost}/admin/login`)
  ) {
    return true;
  }
  return (
    clean === 'bostroshoily.com/account' ||
    clean === 'bostroshoily.com/account/login' ||
    clean === 'bostroshoily.com/admin' ||
    clean === 'bostroshoily.com/admin/login' ||
    clean === 'bostrosoily.com/account' ||
    clean === 'bostrosoily.com/account/login' ||
    clean === 'bostrosoily.com/admin' ||
    clean === 'bostrosoily.com/admin/login' ||
    clean === 'bastrashoily.com/admin'
  );
}

export const Header: React.FC = () => {
  const {
    navMenus,
    navigateToHome,
    navigateToCategory,
    navigateToTracking,
    navigateToAdmin,
    navigateToCmsGuide,
    navigateToClothingGuide,
    currentView,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    products,
    navigateToProduct,
    currentCustomer,
    customerLogout,
    openCustomerAuthModal,
    openCustomerAccountModal,
    navigateBack,
    isAdminAuthenticated,
    openSizeGuideModal,
    language,
    toggleLanguage,
    generalSettings,
    footerConfig,
    deliveryConfig,
  } = useShop();

  const helplinePhone = footerConfig?.phone || generalSettings?.phone || '+880 1864-528488';
  const whatsappUrl = footerConfig?.whatsappUrl || `https://wa.me/${(generalSettings?.whatsappNumber || '8801864528488').replace(/[^0-9]/g, '')}`;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click or tap
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isAdminSearch = isExactAdminUrl(searchQuery);

  const filteredProducts = (!isAdminSearch && searchQuery.trim())
    ? (products || [])
        .filter((p) => {
          if (!p || p.status !== 'active') return false;
          const q = searchQuery.trim().toLowerCase();
          const name = String(p.name || '').toLowerCase();
          const bangla = String(p.banglaName || (p as any).bangla_name || '').toLowerCase();
          const subCat = String(p.subCategory || (p as any).sub_category || '').toLowerCase();
          const cat = String(p.category || (p as any).category_name || '').toLowerCase();
          return name.includes(q) || bangla.includes(q) || subCat.includes(q) || cat.includes(q);
        })
        .slice(0, 5)
    : [];

  const handleDesktopSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchDropdownOpen(false);
      (e.target as HTMLElement).blur();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isAdminSearch) {
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        navigateToAdmin();
        return;
      }
      if (filteredProducts.length > 0) {
        const topProd = filteredProducts[0];
        navigateToProduct(topProd.slug || topProd.id);
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      const q = searchQuery.trim().toLowerCase();
      if (['lungi', 'লুঙ্গি'].some((k) => q.includes(k))) {
        navigateToCategory('lungi');
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      if (['saree', 'শাড়ি', 'শাড়ি', 'jamdani', 'জামদানি'].some((k) => q.includes(k))) {
        navigateToCategory('saree');
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      if (['panjabi', 'পাঞ্জাবি'].some((k) => q.includes(k))) {
        navigateToCategory('panjabi');
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      if (['tshirt', 't-shirt', 'টি-শার্ট', 'টিশার্ট'].some((k) => q.includes(k))) {
        navigateToCategory('tshirt');
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      if (['three-piece', 'threepiece', 'থ্রি-পিস', 'থ্রিপিস'].some((k) => q.includes(k))) {
        navigateToCategory('three-piece');
        setSearchQuery('');
        setIsSearchDropdownOpen(false);
        (e.target as HTMLElement).blur();
        return;
      }
      setIsSearchDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/25 backdrop-blur-[3px] border-b border-stone-200/30 shadow-xs transition-all">
      {/* Top Banner Bar - Slim & Translucent */}
      <div className="bg-stone-900/80 backdrop-blur-xs text-stone-300 text-[11px] py-1 px-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="hidden sm:inline">সারা দেশে ক্যাশ অন ডেলিভারি</span>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <span className="text-amber-300 font-medium">৳{(deliveryConfig?.freeDeliveryThreshold ?? 2000).toLocaleString()} টাকার বেশি অর্ডারে ফ্রি ডেলিভারি</span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] ml-auto">
            <a
              href={`tel:${helplinePhone.replace(/[\s-]/g, '')}`}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 hidden md:flex"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>{helplinePhone}</span>
            </a>
            <span className="text-stone-700 hidden md:inline">|</span>

            {/* Language Switcher Button (Bn / En) */}
            <button
              id="header-lang-switch-btn"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-[11px] font-bold border border-stone-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <span className={language === 'bn' ? 'text-amber-400 font-extrabold' : 'text-stone-400 font-normal'}>
                বাং
              </span>
              <span className="text-stone-600">/</span>
              <span className={language === 'en' ? 'text-amber-400 font-extrabold' : 'text-stone-400 font-normal'}>
                EN
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Bar - Ultra Compact Height & Translucent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-13 gap-2 sm:gap-3">
          {/* Brand Logo (Left on Mobile & Desktop) */}
          <div className="flex items-center gap-2">
            <div className="cursor-pointer" onClick={navigateToHome}>
              <Logo />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            <button
              onClick={navigateToHome}
              className={`px-3 py-1.5 text-xs xl:text-sm font-semibold rounded-xl transition-colors ${
                currentView === 'home'
                  ? 'text-amber-800 font-bold bg-amber-50'
                  : 'text-stone-700 hover:text-amber-800 hover:bg-stone-50'
              }`}
            >
              হোম (Home)
            </button>

            {/* Dynamic Categories Dropdown Menus configured from Admin */}
            {navMenus
              .filter((menu) => menu.isActive)
              .sort((a, b) => a.order - b.order)
              .map((menu) => (
                <div key={menu.id} className="relative group py-1">
                  <button
                    onClick={() => navigateToCategory(menu.mainCategory.toLowerCase())}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs xl:text-sm font-semibold text-stone-700 hover:text-amber-800 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <span>{menu.label}</span>
                    <span className="text-[11px] text-stone-500 font-normal">({menu.banglaLabel})</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform duration-200" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 w-64 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl border border-stone-200 p-2 space-y-1 shadow-xl">
                      {menu.items
                        .filter((item) => item.isActive)
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (item.categorySlug) {
                                navigateToCategory(item.categorySlug);
                              } else {
                                navigateToCategory(item.url.replace('/category/', ''));
                              }
                            }}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center justify-between group/item"
                          >
                            <div>
                              <span className="font-bold block">{item.label}</span>
                              <span className="text-xs text-stone-500">{item.banglaLabel}</span>
                            </div>
                            <span className="text-xs text-amber-600 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all">
                              →
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}

            <button
              onClick={navigateToCmsGuide}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                currentView === 'how_to_order'
                  ? 'text-amber-800 font-bold bg-amber-50'
                  : 'text-stone-700 hover:text-amber-800 hover:bg-stone-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>অর্ডার নির্দেশিকা</span>
            </button>

            <button
              onClick={navigateToClothingGuide}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                currentView === 'clothing_guide'
                  ? 'text-amber-800 font-bold bg-amber-50'
                  : 'text-stone-700 hover:text-amber-800 hover:bg-stone-50'
              }`}
            >
              <Video className="w-4 h-4 text-amber-600" />
              <span>ভিডিও গাইড</span>
            </button>
          </nav>

          {/* Right Actions: Search & Cart */}
          <div className="flex items-center gap-3">
            {/* Search Input on Desktop */}
            <div ref={searchContainerRef} className="relative hidden md:block w-56 xl:w-72">
              <input
                id="desktop-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onKeyDown={handleDesktopSearchKeyDown}
                placeholder="লুঙ্গি, শাড়ি বা পাঞ্জাবি খুঁজুন..."
                className="w-full bg-stone-100/80 border border-stone-200 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-600 focus:bg-white transition-all placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5 pointer-events-none" />

              {/* Instant Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5 rounded-full hover:bg-stone-200 transition-colors"
                  title="ক্লিয়ার করুন"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search Dropdown Results */}
              {searchQuery.trim() && isSearchDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 p-2 z-50 shadow-xl max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  {isAdminSearch ? (
                    <div
                      id="desktop-search-admin-direct-link"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchDropdownOpen(false);
                        navigateToAdmin();
                      }}
                      className="flex items-center gap-3 p-3 bg-stone-900 text-white hover:bg-stone-800 rounded-xl cursor-pointer transition-colors border border-amber-500/40"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                        🔐
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-400">Admin Login এ প্রবেশ করুন</p>
                        <p className="text-[11px] text-stone-300">Enter চাপুন অথবা ক্লিক করে এডমিন পেজে যান</p>
                      </div>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          navigateToProduct(p.slug || p.id);
                          setSearchQuery('');
                          setIsSearchDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <img
                          src={p.mainImage || (p as any).main_image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'}
                          alt={p.name || ''}
                          className="w-12 h-12 object-cover rounded-lg shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-stone-800 truncate">{p.name || 'পণ্য'}</p>
                          <p className="text-xs text-stone-500 truncate">{p.banglaName || (p as any).bangla_name || ''}</p>
                          <p className="text-xs font-bold text-amber-800">৳{((p.discountPrice ?? (p as any).discount_price ?? p.price) || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center space-y-1">
                      <p className="text-xs text-stone-600 font-medium">কোনো পণ্য পাওয়া যায়নি</p>
                      <p className="text-[11px] text-stone-400">বানান সঠিক কিনা যাচাই করুন অথবা অন্য শব্দ দিয়ে খুঁজুন</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              id="header-mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search Products"
              title="পণ্য খুঁজুন"
            >
              <Search className="w-5 h-5 text-stone-700" />
            </button>

            {/* Customer Account Button (Visible on Mobile and Desktop) */}
            <button
              id="header-customer-account-btn"
              onClick={() => (currentCustomer ? openCustomerAccountModal() : openCustomerAuthModal('login'))}
              className="flex p-2 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
              aria-label="Customer Account"
              title={currentCustomer ? `আমার একাউন্ট: ${currentCustomer.name}` : (language === 'bn' ? 'লগইন / রেজিস্টার করুন' : 'Login / Register')}
            >
              <User className="w-5 h-5" />
              {currentCustomer && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Cart Button (Visible on Mobile & Desktop - Clean transparent/ghost background without heavy color) */}
            <button
              id="header-cart-drawer-trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-stone-800 hover:text-amber-800 hover:bg-stone-100/80 rounded-full transition-all active:scale-95 cursor-pointer"
              aria-label="View shopping basket"
            >
              <div className="relative flex items-center justify-center">
                <span className="text-2xl leading-none inline-block filter drop-shadow-2xs select-none" role="img" aria-label="cart">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                <span className="text-stone-500 text-[10px] uppercase font-bold">{language === 'bn' ? 'ঝুড়ি' : 'Basket'}</span>
                <span className="font-extrabold text-stone-900">৳{cartSubtotal}</span>
              </div>
            </button>

            {/* Mobile / Tablet Menu Bar Button (Placed on the RIGHT of navigation bar as requested) */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-800 hover:text-amber-800 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              title="মেনু বার (Menu)"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[2.2]" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => {
              navigateToHome();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-stone-800 hover:bg-amber-50"
          >
            হোম (Home)
          </button>

          {navMenus
            .filter((m) => m.isActive)
            .map((menu) => (
              <div key={menu.id} className="border-b border-stone-100 pb-2">
                <button
                  onClick={() =>
                    setActiveMobileDropdown(activeMobileDropdown === menu.id ? null : menu.id)
                  }
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-stone-800"
                >
                  <span>
                    {menu.label} <span className="text-xs text-stone-500 font-normal">({menu.banglaLabel})</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      activeMobileDropdown === menu.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeMobileDropdown === menu.id && (
                  <div className="pl-4 pt-1 space-y-1">
                    {menu.items
                      .filter((it) => it.isActive)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.categorySlug) {
                              navigateToCategory(item.categorySlug);
                            } else {
                              navigateToCategory(item.url.replace('/category/', ''));
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                        >
                          {item.label} ({item.banglaLabel})
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}

          <button
            onClick={() => {
              navigateToCmsGuide();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>কিভাবে অর্ডার করবেন?</span>
          </button>

          <button
            onClick={() => {
              navigateToClothingGuide();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-amber-600" />
            <span>বস্ত্র শৈলি তথ্য ও ভিডিও</span>
          </button>

          <div className="pt-2 space-y-2">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-3 bg-stone-100 rounded-xl">
              <span className="text-xs font-bold text-stone-700">ভাষা / Language</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 shadow-2xs">
                <button
                  onClick={() => {
                    if (language !== 'bn') toggleLanguage();
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    language === 'bn' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => {
                    if (language !== 'en') toggleLanguage();
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    language === 'en' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col md:hidden animate-in fade-in duration-150">
          <div className="bg-white p-4 border-b border-stone-200 rounded-b-3xl shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="mobile-header-search-input"
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
                      if (filteredProducts.length > 0) {
                        const topProd = filteredProducts[0];
                        navigateToProduct(topProd.slug || topProd.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        return;
                      }
                    }
                  }}
                  placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
                  className="w-full bg-stone-100 border border-stone-200 rounded-full pl-10 pr-9 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results or Direct Links */}
            <div className="max-h-[60vh] overflow-y-auto space-y-1.5 pt-1">
              {isAdminSearch ? (
                <div
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    navigateToAdmin();
                  }}
                  className="flex items-center gap-3 p-3 bg-stone-900 text-white rounded-2xl cursor-pointer border border-amber-500/50"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                    🔐
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400">Admin Login এ প্রবেশ করুন</p>
                    <p className="text-[11px] text-stone-400">ক্লিক করে এডমিন পেজে যান</p>
                  </div>
                </div>
              ) : searchQuery.trim().length > 0 ? (
                filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigateToProduct(p.slug || p.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-amber-50 rounded-xl cursor-pointer border border-stone-100"
                    >
                      <img
                        src={p.mainImage || (p as any).main_image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'}
                        alt={p.name || ''}
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-xs text-stone-500 truncate">{p.banglaName || (p as any).bangla_name}</p>
                        <p className="text-xs font-bold text-amber-700">৳{((p.discountPrice ?? (p as any).discount_price ?? p.price) || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium text-stone-600">কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-xs text-stone-400 mt-1">লুঙ্গি, শাড়ি বা পাঞ্জাবি লিখে খুঁজুন</p>
                  </div>
                )
              ) : (
                <div className="py-2 text-xs text-stone-500">
                  <p className="font-semibold text-stone-700 mb-2">জনপ্রিয় ক্যাটাগরি:</p>
                  <div className="flex flex-wrap gap-2">
                    {['lungi', 'saree', 'panjabi'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          navigateToCategory(cat);
                          setIsSearchOpen(false);
                        }}
                        className="px-3 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-full text-xs font-medium"
                      >
                        {cat === 'lungi' ? 'লুঙ্গি' : cat === 'saree' ? 'শাড়ি' : 'পাঞ্জাবি'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsSearchOpen(false)} />
        </div>
      )}
    </header>
  );
};
