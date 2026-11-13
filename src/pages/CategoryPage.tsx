import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import {
  ChevronRight,
  ArrowUpDown,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface CategoryHeroSlide {
  id: string;
  subCategoryKey: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  badge: string;
  badgeBn: string;
  image: string;
}

export const CategoryPage: React.FC = () => {
  const {
    currentCategorySlug,
    currentSubcategorySlug,
    categories,
    categoryBanners,
    products,
    navigateToHome,
    navigateToCategory,
    navigateBack,
    language,
    storeDesign,
  } = useShop();

  // Dynamic Main Categories from Shop Context
  const mainCategories = useMemo(() => {
    const list = categories.filter((c) => c.isMain && c.isActive !== false);
    if (list.length > 0) return list;
    return [
      { id: 'cat-main-men', name: 'MEN', banglaName: 'পুরুষ', slug: 'men', isMain: true },
      { id: 'cat-main-women', name: 'WOMEN', banglaName: 'নারী', slug: 'women', isMain: true },
      { id: 'cat-main-kids', name: 'KIDS', banglaName: 'শিশুদের', slug: 'kids', isMain: true },
      { id: 'cat-main-others', name: 'OTHERS', banglaName: 'অন্যান্য', slug: 'others', isMain: true },
    ];
  }, [categories]);

  const slugLower = (currentCategorySlug || 'men').toLowerCase();
  const isAllCategory = slugLower === 'all';

  // Find if slug directly matches a Main Category
  const matchedDirectMain = mainCategories.find(
    (m) =>
      m.slug?.toLowerCase() === slugLower ||
      m.id?.toLowerCase() === slugLower ||
      m.name?.toLowerCase() === slugLower
  );

  // Find if slug matches a Subcategory
  const matchedSubcategory = categories.find(
    (c) =>
      !c.isMain &&
      c.isActive !== false &&
      (c.slug?.toLowerCase() === slugLower ||
        c.id?.toLowerCase() === slugLower ||
        c.name?.toLowerCase() === slugLower)
  );

  // Determine activeMainCategory and initialSubCategory
  let activeMainCategory = matchedDirectMain || null;
  let initialSubCategory = 'all';

  if (!activeMainCategory && matchedSubcategory) {
    const pKey = (matchedSubcategory.parentCategory || '').toUpperCase();
    activeMainCategory =
      mainCategories.find(
        (m) =>
          m.name.toUpperCase() === pKey ||
          (m.slug && m.slug.toUpperCase() === pKey) ||
          m.id === matchedSubcategory.parentCategoryId
      ) || null;
    initialSubCategory = matchedSubcategory.name || matchedSubcategory.slug;
  }

  // Fallback slug matching for standard categories if not explicitly matched above
  if (!activeMainCategory) {
    if (['lungi', 'panjabi', 't-shirt', 'tshirt', 'polo-t-shirt', 'payjama', 'men'].includes(slugLower)) {
      activeMainCategory = mainCategories.find((m) => m.name.toUpperCase() === 'MEN') || mainCategories[0];
      if (slugLower !== 'men') initialSubCategory = slugLower === 'tshirt' ? 'T-Shirt' : slugLower;
    } else if (['saree', 'three-piece', 'threepiece', 'borka', 'hijab', 'kurti', 'women'].includes(slugLower)) {
      activeMainCategory = mainCategories.find((m) => m.name.toUpperCase() === 'WOMEN') || mainCategories[1] || mainCategories[0];
      if (slugLower !== 'women') initialSubCategory = slugLower === 'threepiece' ? 'Three-Piece' : slugLower;
    } else if (['kids', 'kids-item', 'kids-wear', 'শিশুদের-পোশাক', 'বাচ্চাদের'].some((k) => slugLower.includes(k))) {
      activeMainCategory = mainCategories.find((m) => m.name.toUpperCase() === 'KIDS') || mainCategories[2] || mainCategories[0];
    } else {
      activeMainCategory = mainCategories.find((m) => m.name.toUpperCase() === 'OTHERS') || mainCategories[3] || mainCategories[0];
      if (['gift-box', 'gift', 'ator', 'tupi', 'chador', 'shawl', 'gamcha'].includes(slugLower)) {
        initialSubCategory = slugLower;
      }
    }
  }

  const activeMainKey = (activeMainCategory?.name || 'MEN').toUpperCase();
  const mainCategory = activeMainKey === 'WOMEN' ? 'WOMEN' : activeMainKey === 'OTHERS' ? 'OTHERS' : 'MEN';

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(initialSubCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest'>('featured');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync subcategory when slug or query param changes
  useEffect(() => {
    if (currentSubcategorySlug && currentSubcategorySlug !== 'all') {
      setSelectedSubCategory(currentSubcategorySlug);
    } else if (initialSubCategory !== 'all') {
      setSelectedSubCategory(initialSubCategory);
    } else {
      setSelectedSubCategory('all');
    }
    setActiveSlide(0);
  }, [currentCategorySlug, currentSubcategorySlug, initialSubCategory]);

  // Slides configuration for each of the 3 primary pages
  const MEN_SLIDES: CategoryHeroSlide[] = [
    {
      id: 'men-lungi',
      subCategoryKey: 'Lungi',
      title: 'সিরাজগঞ্জের ঐতিহ্যবাহী প্রিমিয়াম তাঁতের লুঙ্গি',
      titleEn: 'Authentic Handloom Premium Lungi',
      subtitle: '১০০% সুতি, আরামদায়ক ও নিখুঁত ফিনিশিংয়ে বোনা বাহারি রঙের লুঙ্গি কালেকশন',
      subtitleEn: '100% combed cotton, extremely comfortable handloom lungis',
      badge: 'Lungi Collection',
      badgeBn: 'লুঙ্গি কালেকশন',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'men-tshirt',
      subCategoryKey: 'T-Shirt',
      title: '১০০% কম্বড কটন ব্রিদেবল প্রিমিয়াম টি-শার্ট',
      titleEn: '100% Combed Cotton Daily T-Shirts',
      subtitle: 'দৈনন্দিন স্টাইল ও ক্যাজুয়াল ব্যবহারের জন্য আধুনিক ফিটিংয়ের টি-শার্ট',
      subtitleEn: 'Breathable, ultra-soft fabric tailored for modern daily comfort',
      badge: 'T-Shirt Collection',
      badgeBn: 'টি-শার্ট কালেকশন',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'men-panjabi',
      subCategoryKey: 'Panjabi',
      title: 'উৎসব ও আভিজাত্যের প্রিমিয়াম সুতি ও সিল্ক পাঞ্জাবি',
      titleEn: 'Royal Handcrafted Silk & Cotton Panjabi',
      subtitle: 'উৎসবের আমেজ ও রাজকীয় লুকে নিপুণ কারুকাজ খচিত আকর্ষণীয় পাঞ্জাবি',
      subtitleEn: 'Exclusive embroidered and handloom Panjabis for celebrations',
      badge: 'Panjabi Collection',
      badgeBn: 'পাঞ্জাবি কালেকশন',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  const WOMEN_SLIDES: CategoryHeroSlide[] = [
    {
      id: 'women-saree',
      subCategoryKey: 'Saree',
      title: 'খাঁটি ঢাকাই জামদানি, সিল্ক ও সুতি শাড়ির অনুপম সমাহার',
      titleEn: 'Heritage Dhakai Jamdani, Silk & Cotton Sarees',
      subtitle: 'বাংলার শতাব্দীর গৌরব ও হস্তশিল্পের অপরূপ রাজকীয় ঐতিহ্যবাহী শাড়ি',
      subtitleEn: 'Woven with UNESCO recognized motifs by master handloom weavers',
      badge: 'Saree Collection',
      badgeBn: 'শাড়ি কালেকশন',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'women-threepiece',
      subCategoryKey: 'Three-Piece',
      title: 'মার্জিত এমব্রয়ডারি ও ডিজাইনার সুতি থ্রি-পিস কালেকশন',
      titleEn: 'Designer Embroidered Cotton Three-Piece Suits',
      subtitle: 'উৎসব ও দৈনন্দিন চলাফেরার অনন্য রুচিশীল ও আরামদায়ক থ্রি-পিস সেট',
      subtitleEn: 'Comfortable, lightweight fabrics with contemporary ethnic detailing',
      badge: 'Three-Piece Collection',
      badgeBn: 'থ্রি-পিস কালেকশন',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  const OTHERS_SLIDES: CategoryHeroSlide[] = [
    {
      id: 'others-gamcha',
      subCategoryKey: 'Gamcha',
      title: 'খাঁটি সুতি গামছা ও ঐতিহ্যবাহী লোকশিল্প সামগ্রী',
      titleEn: 'Traditional Handloom Gamcha & Crafts',
      subtitle: 'তাঁতিদের তৈরি দীর্ঘস্থায়ী ও স্বাস্থ্যসম্মত সুতি পোশাক ও আনুষঙ্গিক',
      subtitleEn: 'Authentic pure cotton everyday essentials and craft items',
      badge: 'Accessories & Crafts',
      badgeBn: 'গামছা ও হ্যান্ডিক্রাফট',
      image: 'https://images.unsplash.com/photo-1606744888344-498238f0170a?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'others-shawl',
      subCategoryKey: 'Shawl',
      title: 'শীতের আভিজাত্য ও উষ্ণ আরামের প্রিমিয়াম শাল ও চাদর',
      titleEn: 'Winter Shawls & Heritage Wraps',
      subtitle: 'পরম উষ্ণতা ও আভিজাত্যের ঐতিহ্যবাহী সুতি ও উল চাদর সংগ্রহ',
      subtitleEn: 'Elegant and warm handcrafted wraps for all seasons',
      badge: 'Winter Collection',
      badgeBn: 'শাল ও চাদর',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  // Men and Women category slugs mapping
  const menSlugKeys = ['men', 'lungi', 'panjabi', 'tshirt', 't-shirt'];
  const womenSlugKeys = ['women', 'saree', 'three-piece', 'threepiece'];
  const otherSlugKeys = ['others', 'other', 'gamcha', 'shawl'];

  const activeConfiguredBanners = (categoryBanners || []).filter((b) => {
    if (b.isActive === false) return false;
    const bSlug = (b.categorySlug || '').toLowerCase();
    if (mainCategory === 'MEN') {
      return menSlugKeys.includes(bSlug);
    } else if (mainCategory === 'WOMEN') {
      return womenSlugKeys.includes(bSlug);
    } else if (mainCategory === 'OTHERS') {
      return otherSlugKeys.includes(bSlug);
    }
    return bSlug === slugLower || bSlug === 'men' || bSlug === 'women';
  });

  // Sort banners so selected subcategory banner appears first, followed by general category banner
  const prioritizedBanners = [...activeConfiguredBanners].sort((a, b) => {
    const slugA = (a.categorySlug || '').toLowerCase();
    const slugB = (b.categorySlug || '').toLowerCase();
    const selSub = selectedSubCategory.toLowerCase();
    const matchA = slugA === selSub ? 2 : (slugA === mainCategory.toLowerCase() ? 1 : 0);
    const matchB = slugB === selSub ? 2 : (slugB === mainCategory.toLowerCase() ? 1 : 0);
    return matchB - matchA;
  });

  const dynamicSlides: CategoryHeroSlide[] = prioritizedBanners.map((cb, idx) => ({
    id: cb.id || `dyn-slide-${idx}`,
    subCategoryKey: cb.categorySlug || 'all',
    title: cb.banglaTitle || cb.title,
    titleEn: cb.title || '',
    subtitle: cb.description || '',
    subtitleEn: cb.description || '',
    badge: cb.categorySlug?.toUpperCase() || 'COLLECTION',
    badgeBn: cb.banglaTitle || 'কালেকশন',
    image: cb.desktopImage,
  }));

  const currentSlides = dynamicSlides.length > 0
    ? dynamicSlides
    : (mainCategory === 'MEN' ? MEN_SLIDES : (mainCategory === 'WOMEN' ? WOMEN_SLIDES : OTHERS_SLIDES));

  // Safe active slide index to prevent blank slider
  const safeActiveSlide = currentSlides.length > 0 ? activeSlide % currentSlides.length : 0;

  // Auto-slide every 3.5 seconds (3500ms)
  useEffect(() => {
    if (isHovered || currentSlides.length <= 1) return;

    slideTimerRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % currentSlides.length);
    }, 3500);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [safeActiveSlide, isHovered, currentSlides.length]);

  // Strictly filter ONLY the subcategories belonging to this active main category!
  const currentSubcategories = useMemo(() => {
    const fromProps = categories.filter((c) => {
      if (c.isMain || c.isActive === false) return false;
      const p = (c.parentCategory || '').toUpperCase();
      return p === activeMainKey || (activeMainCategory?.id && c.parentCategoryId === activeMainCategory.id);
    });

    if (fromProps.length > 0) return fromProps;

    if (activeMainKey === 'MEN') {
      return [
        { id: 'sub-lungi', name: 'Lungi', banglaName: 'লুঙ্গি', slug: 'lungi' },
        { id: 'sub-tshirt', name: 'T-Shirt', banglaName: 'টি-শার্ট', slug: 't-shirt' },
        { id: 'sub-polotshirt', name: 'Polo T-Shirt', banglaName: 'পোলো টি-শার্ট', slug: 'polo-t-shirt' },
        { id: 'sub-panjabi', name: 'Panjabi', banglaName: 'পাঞ্জাবি', slug: 'panjabi' },
        { id: 'sub-pajama', name: 'Payjama', banglaName: 'পায়জামা', slug: 'payjama' },
      ];
    } else if (activeMainKey === 'WOMEN') {
      return [
        { id: 'sub-saree', name: 'Saree', banglaName: 'শাড়ি', slug: 'saree' },
        { id: 'sub-3pc', name: 'Three-Piece', banglaName: 'থ্রি-পিস', slug: 'three-piece' },
        { id: 'sub-borka', name: 'Borka', banglaName: 'বোরকা', slug: 'borka' },
        { id: 'sub-hijab', name: 'Hijab', banglaName: 'হিজাব', slug: 'hijab' },
      ];
    } else if (activeMainKey === 'KIDS') {
      return [
        { id: 'sub-kids-wear', name: 'Kids Item', banglaName: 'শিশুদের পোশাক', slug: 'kids-item' },
      ];
    } else {
      return [
        { id: 'sub-giftbox', name: 'Gift Box', banglaName: 'উপহার বক্স', slug: 'gift-box' },
        { id: 'sub-ator', name: 'Ator', banglaName: 'আতর ও সুগন্ধি', slug: 'ator' },
        { id: 'sub-tupi', name: 'Tupi', banglaName: 'টুপি', slug: 'tupi' },
        { id: 'sub-chadar', name: 'Chador', banglaName: 'চাদর / শাল', slug: 'chador' },
      ];
    }
  }, [categories, activeMainKey, activeMainCategory?.id]);

  // Calculate count for all subcategories in active category
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const mainProducts = products.filter((p) => {
      if (p.status === 'archived' || p.status === 'inactive') return false;
      if (isAllCategory) return true;
      const pCat = (p.category || '').toUpperCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      const pBangla = (p.banglaName || '').toLowerCase();

      return (
        pCat === activeMainKey ||
        pCat.includes(activeMainKey) ||
        (activeMainKey === 'MEN' && ['lungi', 'panjabi', 't-shirt', 'polo', 'shirt', 'payjama', 'পায়জামা', 'লুঙ্গি', 'পাঞ্জাবি'].some((k) => pSub.includes(k) || pName.includes(k) || pBangla.includes(k))) ||
        (activeMainKey === 'WOMEN' && ['saree', 'three-piece', 'borka', 'hijab', 'kurti', 'শাড়ি', 'থ্রি-পিস', 'বোরকা', 'হিজাব'].some((k) => pSub.includes(k) || pName.includes(k) || pBangla.includes(k))) ||
        (activeMainKey === 'KIDS' && ['kid', 'বাচ্চা', 'শিশু', 'baby', 'child'].some((k) => pSub.includes(k) || pCat.toLowerCase().includes(k) || pName.includes(k) || pBangla.includes(k))) ||
        (activeMainKey === 'OTHERS' && ['gift', 'ator', 'tupi', 'chador', 'shawl', 'আতর', 'টুপি', 'উপহার', 'শাল'].some((k) => pSub.includes(k) || pCat.toLowerCase().includes(k) || pName.includes(k) || pBangla.includes(k)))
      );
    });

    counts['all'] = mainProducts.length;

    currentSubcategories.forEach((c) => {
      const catKeywords = [
        c.name.toLowerCase(),
        (c.slug || '').toLowerCase(),
        (c.banglaName || '').toLowerCase(),
      ].filter(Boolean);

      const cnt = mainProducts.filter((p) => {
        const pSub = (p.subCategory || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pBangla = (p.banglaName || '').toLowerCase();
        return catKeywords.some(
          (kw) =>
            pSub === kw ||
            pSub.includes(kw) ||
            kw.includes(pSub) ||
            pName.includes(kw) ||
            pBangla.includes(kw)
        );
      }).length;
      counts[c.name.toLowerCase()] = cnt;
      if (c.slug) counts[c.slug.toLowerCase()] = cnt;
    });

    return counts;
  }, [products, isAllCategory, activeMainKey, currentSubcategories]);

  const subCategoryTabs = useMemo(() => {
    return [
      { key: 'all', label: 'সকল', labelEn: 'All', count: subcategoryCounts['all'] || 0, slug: 'all' },
      ...currentSubcategories.map((c) => ({
        key: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        label: c.banglaName || c.name,
        labelEn: c.name,
        count: subcategoryCounts[c.name.toLowerCase()] ?? (c.slug ? subcategoryCounts[c.slug.toLowerCase()] : 0) ?? 0,
      })),
    ];
  }, [currentSubcategories, subcategoryCounts]);

  // Filter products by activeMainCategory and selectedSubCategory
  const categoryProducts = products.filter((p) => {
    if (p.status === 'archived' || p.status === 'inactive') return false;

    // If 'all' catalog view
    if (isAllCategory) return true;

    // Match mainCategory ('MEN', 'WOMEN', 'KIDS', 'OTHERS', etc.)
    const pCat = (p.category || '').toUpperCase();
    const pSub = (p.subCategory || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pBangla = (p.banglaName || '').toLowerCase();

    const matchesMain =
      pCat === activeMainKey ||
      pCat.includes(activeMainKey) ||
      (activeMainKey === 'MEN' && ['lungi', 'panjabi', 't-shirt', 'polo', 'shirt', 'payjama', 'পায়জামা', 'লুঙ্গি', 'পাঞ্জাবি'].some((k) => pSub.includes(k) || pName.includes(k) || pBangla.includes(k))) ||
      (activeMainKey === 'WOMEN' && ['saree', 'three-piece', 'borka', 'hijab', 'kurti', 'শাড়ি', 'থ্রি-পিস', 'বোরকা', 'হিজাব'].some((k) => pSub.includes(k) || pName.includes(k) || pBangla.includes(k))) ||
      (activeMainKey === 'KIDS' && ['kid', 'বাচ্চা', 'শিশু', 'baby', 'child'].some((k) => pSub.includes(k) || pCat.toLowerCase().includes(k) || pName.includes(k) || pBangla.includes(k))) ||
      (activeMainKey === 'OTHERS' && ['gift', 'ator', 'tupi', 'chador', 'shawl', 'আতর', 'টুপি', 'উপহার', 'শাল'].some((k) => pSub.includes(k) || pCat.toLowerCase().includes(k) || pName.includes(k) || pBangla.includes(k)));

    if (!matchesMain) return false;

    // Match subCategory
    if (selectedSubCategory !== 'all') {
      const selSub = selectedSubCategory.toLowerCase();
      const matchedCat = currentSubcategories.find(
        (c) =>
          c.name.toLowerCase() === selSub ||
          (c.slug && c.slug.toLowerCase() === selSub) ||
          (c.banglaName && c.banglaName.toLowerCase() === selSub)
      );

      const catKeywords = matchedCat
        ? [
            matchedCat.name.toLowerCase(),
            (matchedCat.slug || '').toLowerCase(),
            (matchedCat.banglaName || '').toLowerCase(),
          ].filter(Boolean)
        : [selSub];

      const match = catKeywords.some(
        (kw) =>
          pSub === kw ||
          pSub.includes(kw) ||
          kw.includes(pSub) ||
          pName.includes(kw) ||
          pBangla.includes(kw)
      );

      return match;
    }

    return true;
  });

  // Sort
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortBy === 'price_low') return priceA - priceB;
    if (sortBy === 'price_high') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (b.salesCount || 0) - (a.salesCount || 0);
  });

  const pageTitle = isAllCategory
    ? language === 'bn'
      ? 'সকল পোশাক ও কালেকশন'
      : 'All Products & Collections'
    : mainCategory === 'MEN'
    ? language === 'bn'
      ? 'পুরুষদের পোশাক কালেকশন'
      : "Men's Collection"
    : mainCategory === 'WOMEN'
    ? language === 'bn'
      ? 'নারীদের পোশাক কালেকশন'
      : "Women's Collection"
    : language === 'bn'
    ? 'ঐতিহ্যবাহী অন্যান্য পোশাক ও অনুষঙ্গ'
    : 'Others & Accessories';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* HERO SLIDER (Product Category Banner Slide - Dynamic Pixel Height Controlled by Admin) */}
      {currentSlides.length > 0 && (
        <div
          id="category-hero-slider"
          className="relative w-full rounded-3xl overflow-hidden bg-stone-950 text-white border border-amber-500/20 shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            style={{
              '--cat-desktop': `${storeDesign?.categoryBannerHeightDesktop || 240}px`,
              '--cat-mobile': `${storeDesign?.categoryBannerHeightMobile || 160}px`,
            } as React.CSSProperties}
            className="relative w-full h-[var(--cat-mobile)] sm:h-[var(--cat-desktop)] transition-all duration-300"
          >
            {currentSlides.map((slide, index) => {
              const isCurrent = index === safeActiveSlide;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Ambient Blur Backdrop */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <img
                      src={slide.image}
                      alt=""
                      className="w-full h-full object-cover blur-2xl opacity-35 scale-110"
                    />
                    <div className="absolute inset-0 bg-stone-950/40" />
                  </div>

                  {/* 100% Responsive Slide Banner with object-fit: cover */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center drop-shadow-xl"
                    />
                  </div>
                </div>
              );
            })}

            {/* Slider Arrows */}
            {currentSlides.length > 1 && (
              <>
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % currentSlides.length)}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-amber-500 text-white hover:text-stone-950 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Dots */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
              {currentSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === activeSlide ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY FILTER BAR (সফল - লুঙ্গি - টি-শার্ট - পাঞ্জাবি / সফল - শাড়ি - থ্রি-পিস) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Subcategory Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
              {language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}
            </span>
            {subCategoryTabs.map((tab) => {
              const isSelected = selectedSubCategory.toLowerCase() === tab.key.toLowerCase() ||
                (tab.slug && selectedSubCategory.toLowerCase() === tab.slug.toLowerCase());
              return (
                <button
                  key={tab.key}
                  id={`cat-filter-${tab.key.toLowerCase()}`}
                  onClick={() => {
                    setSelectedSubCategory(tab.key);
                    if (tab.key === 'all') {
                      window.location.hash = `/category/${activeMainCategory?.slug || slugLower}`;
                    } else {
                      window.location.hash = `/category/${activeMainCategory?.slug || slugLower}?subcategory=${encodeURIComponent(tab.slug || tab.key)}`;
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/40'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  <span>{language === 'bn' ? tab.label : tab.labelEn}</span>
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-stone-600 ml-auto sm:ml-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-medium">{language === 'bn' ? 'সর্ট করুন:' : 'Sort by:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-amber-600 transition-colors cursor-pointer"
            >
              <option value="featured">{language === 'bn' ? 'জনপ্রিয় (Featured)' : 'Featured'}</option>
              <option value="price_low">{language === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="price_high">{language === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
              <option value="newest">{language === 'bn' ? 'নতুন কালেকশন (Newest)' : 'Newest'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200 text-stone-600">
          <p className="font-bold text-base text-stone-900">
            {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'bn'
              ? 'অনুগ্রহ করে "সকল" অথবা অন্য কোনো ক্যাটাগরি নির্বাচন করে দেখুন।'
              : 'Please select "All" or another category tab.'}
          </p>
          <button
            onClick={() => setSelectedSubCategory('all')}
            className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
          >
            {language === 'bn' ? 'সকল পোশাক দেখুন' : 'View All Products'}
          </button>
        </div>
      )}
    </div>
  );
};
