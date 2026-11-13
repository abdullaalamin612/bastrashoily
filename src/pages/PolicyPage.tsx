import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  ArrowLeft, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';

interface PolicyContent {
  slug: string;
  titleBn: string;
  titleEn: string;
  badge: string;
  lastUpdated: string;
  icon: React.ReactNode;
  summary: string;
  sections: {
    heading: string;
    points: string[];
  }[];
  faq?: { q: string; a: string }[];
}

const POLICIES: Record<string, PolicyContent> = {
  'returns-exchange': {
    slug: 'returns-exchange',
    titleBn: 'রিটার্ন ও এক্সচেঞ্জ পলিসি',
    titleEn: 'Returns & Exchange Policy',
    badge: 'সহজ ও নিরাপদ কেনাকাটা',
    lastUpdated: '২০২৬ হালনাগাদ',
    icon: <RotateCcw className="w-8 h-8 text-[#D4AF37]" />,
    summary: 'বস্ত্র শৈলী (BOSTROSHOILY) থেকে ক্রয়কৃত যেকোনো ঐতিহ্যবাহী তাঁতের পোশাক বা সামগ্রী ডেলিভারির সময় যাচাই করে নিতে পারবেন। কোনো ত্রুটি বা সাইজ অমিল থাকলে ৭ দিনের সহজ রিটার্ন বা এক্সচেঞ্জের সম্পূর্ণ নিশ্চয়তা পাবেন।',
    sections: [
      {
        heading: '১. ডেলিভারির সময় তাৎক্ষণিক পণ্য যাচাই (Doorstep Checking)',
        points: [
          'ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল খুলে শাড়ি, লুঙ্গি, পাঞ্জাবি বা অন্যান্য পণ্যটির রঙ, কোয়ালিটি ও সঠিক মাপ যাচাই করে নিন।',
          'যদি কোনো ফেব্রিক ত্রুটি (ড্যামেজ), ভুল সাইজ বা ভুল পণ্য দেখতে পান, তবে ডেলিভারি ম্যানের কাছে তাৎক্ষণিকভাবে পার্সেল ফেরত দিয়ে দিন—এক্ষেত্রে কোনো ডেলিভারি চার্জ প্রযোজ্য হবে না।',
          'ডেলিভারি গ্রহণ করার পরও ৭ (সাত) দিনের মধ্যে যেকোনো ত্রুটির জন্য রিটার্ন বা এক্সচেঞ্জের আবেদন করতে পারবেন।'
        ]
      },
      {
        heading: '২. রিটার্ন ও এক্সচেঞ্জ গ্রহণের শর্তাবলী',
        points: [
          'পণ্যটি অবশ্যই অব্যবহৃত (Unused), না-ধোয়া (Unwashed) এবং সম্পূর্ণ অক্ষত অবস্থায় থাকতে হবে।',
          'পণ্যের আসল ট্যাগ, বস্ত্র শৈলী (BOSTROSHOILY) বারকোড লেবেল এবং মূল বক্স/প্যাকেজিং সুরক্ষিত থাকতে হবে।',
          'পার্সেলের সাথে দেওয়া অরিজিনাল ক্যাশ মেমো / ইনভয়েস স্লিপ সাথে রাখতে হবে।',
          'কাস্টম মেড বা বিশেষ অর্ডারের তৈরি পাঞ্জাবি অথবা ব্যক্তিগত ব্যবহারের সামগ্রী (যেমন: আতর/টুপি আনসিল করা হলে) স্বাস্থ্যবিধি স্বার্থে ফেরতযোগ্য নয়।'
        ]
      },
      {
        heading: '৩. সাইজ পরিবর্তন ও এক্সচেঞ্জ প্রক্রিয়া',
        points: [
          'পোশাকের সাইজ বড় বা ছোট হলে পছন্দের সঠিক সাইজের স্টক থাকা সাপেক্ষে বিনামূল্যে এক্সচেঞ্জ সুবিধা উপভোগ করুন।',
          'আমাদের হটলাইন (+880 1700-000000) অথবা ফেসবুক পেজ/হোয়াটসঅ্যাপে ইনভয়েস নম্বরসহ মেসেজ দিন।',
          'আমাদের রাইডার আপনার ঠিকানা থেকে পূর্বের পণ্য সংগ্রহ করে নতুন সাইজের পণ্য পৌঁছে দেবে (সাধারণত ৪৮-৭২ ঘণ্টার মধ্যে)।'
        ]
      },
      {
        heading: '৪. রিফান্ড ও মূল্য ফেরত নীতি (Refund Policy)',
        points: [
          'অনলাইন পেমেন্ট (bKash, Nagad, কার্ড) করে থাকলে এবং পণ্য ফেরত নেওয়া হলে সর্বোচ্চ ৩-৫ কার্যদিবসের মধ্যে আপনার মূল অ্যাকাউন্টে সম্পূর্ণ মূল্য রিফান্ড করা হবে।',
          'ক্যাশ অন ডেলিভারি (COD) অর্ডারের ক্ষেত্রে রিটার্ন পণ্য আমাদের ওয়্যারহাউসে পৌঁছানোর ২৪ ঘণ্টার মধ্যে বিকাশ/নগদ এর মাধ্যমে টাকা ফেরত দেওয়া হবে।',
          'আমাদের কোনো ভুলের কারণে রিটার্ন হলে গ্রাহককে কোনো অতিরিক্ত ডেলিভারি বা রিটার্ন ফি প্রদান করতে হবে না।'
        ]
      }
    ],
    faq: [
      { q: 'আমি কি শুধু রঙের পছন্দের অমিলের কারণে রিটার্ন করতে পারব?', a: 'হ্যাঁ, পণ্যটি মূল ট্যাগযুক্ত ও অব্যবহৃত থাকলে ৭ দিনের ভেতর অন্য যেকোনো পছন্দের কালার বা ডিজাইনের সাথে এক্সচেঞ্জ করতে পারবেন।' },
      { q: 'রিফান্ড পেতে কত সময় লাগে?', a: 'রিটার্ন পণ্য যাচাইয়ের পর সর্বোচ্চ ৩ কার্যদিবসের মধ্যে বিকাশ/নগদে টাকা পৌঁছে দেওয়া হয়।' }
    ]
  },
  'terms-and-conditions': {
    slug: 'terms-and-conditions',
    titleBn: 'শর্তাবলী ও নিয়মাবলী',
    titleEn: 'Terms & Conditions',
    badge: 'আইনি ও গ্রাহক অধিকার সুরক্ষানীতি',
    lastUpdated: '২০২৬ হালনাগাদ',
    icon: <FileText className="w-8 h-8 text-[#D4AF37]" />,
    summary: 'বস্ত্র শৈলী (BOSTROSHOILY) ওয়েবসাইট ও প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী। আমরা সিরাজগঞ্জের খাঁটি ঐতিহ্যবাহী তাঁত শিল্প ও আধুনিক পোশাকের সর্বোচ্চ গুণগত মান বজায় রেখে সেবা প্রদানে অঙ্গীকারবদ্ধ।',
    sections: [
      {
        heading: '১. সাধারণ নীতিমালা ও গ্রাহক সম্মতি',
        points: [
          'ওয়েবসাইটে প্রবেশ এবং অর্ডার সম্পন্ন করার মাধ্যমে আপনি বস্ত্র শৈলীর সকল নিয়মাবলী ও শর্তাবলী মেনে নিচ্ছেন।',
          'বস্ত্র শৈলী (BOSTROSHOILY) যেকোনো সময় বিজ্ঞপ্তির মাধ্যমে নিয়মাবলী বা পণ্যের মূল্যের হালনাগাদ করার অধিকার সংরক্ষণ করে।',
          'প্রতিটি পণ্যের ছবি ও বর্ণনা বাস্তব পণ্যের প্রকৃত রঙের সাথে ৯৫% এর বেশি সামঞ্জস্যপূর্ণ রাখার চেষ্টা করা হয়; তবে ডিসপ্লে রেজুল্যুশন ও আলোর ভিন্নতার কারণে সামান্য ফারাক অনুভূত হতে পারে।'
        ]
      },
      {
        heading: '২. অর্ডার কনফার্মেশন ও মূল্য নির্ধারণ',
        points: [
          'ওয়েবসাইটে প্রদর্শিত সকল মূল্য বাংলাদেশী টাকায় (BDT ৳) ধার্য এবং প্রযোজ্য ভ্যাট অন্তর্ভুক্ত।',
          'অর্ডার সম্পন্ন করার পর স্বয়ংক্রিয় এসএমএস ও ফোন কলের মাধ্যমে অর্ডার ভেরিফাই করা হতে পারে।',
          'কোনো পণ্যের স্টক হঠাৎ ফুরিয়ে গেলে বা প্রযুক্তিগত মূল্যে ভুল থাকলে বস্ত্র শৈলী অর্ডার বাতিলের অধিকার রাখে এবং অগ্রিম পরিশোধিত মূল্য অবিলম্বে রিফান্ড করে।'
        ]
      },
      {
        heading: '৩. ঐতিহ্যবাহী তাঁতের খাঁটি নিশ্চয়তা',
        points: [
          'আমাদের প্রতিটি লুঙ্গি, শাড়ি ও পাঞ্জাবি সিরাজগঞ্জের অভিজ্ঞ তাঁতিদের দক্ষ হাতের তৈরি ১০০% নিখুঁত সুতি ও উন্নত সুতার প্রমাণিক বয়নে নির্মিত।',
          'হস্তচালিত তাঁতের নিজস্ব নান্দনিকতার কারণে কাপড়ে সামান্য সূক্ষ্ম বৈচিত্র্য থাকতে পারে, যা খাঁটি হস্তশিল্পের অনন্য প্রতীক।'
        ]
      },
      {
        heading: '৪. মেধা স্বত্ব ও কপিরাইট আইন',
        points: [
          'ওয়েবসাইটের লোগো, গ্রাফিক্স, পণ্যের ছবি, টেক্সট এবং সফ্টওয়্যার ডিজাইন বস্ত্র শৈলীর নিজস্ব মেধা সম্পদ।',
          'অনুমোদন ছাড়া কোনো ছবি বা সামগ্রী বাণিজ্যিক উদ্দেশ্যে পুনঃব্যবহার করা সম্পূর্ণ বেআইনি এবং কপিরাইট আইনের লঙ্ঘন।'
        ]
      }
    ]
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    titleBn: 'গোপনীয়তা নীতি',
    titleEn: 'Privacy Policy',
    badge: '১০০% নিরাপদ ও এনক্রিপ্টেড ডেটা',
    lastUpdated: '২০২৬ হালনাগাদ',
    icon: <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />,
    summary: 'আপনার ব্যক্তিগত তথ্যের নিরাপত্তা বস্ত্র শৈলী (BOSTROSHOILY)-র কাছে অত্যন্ত গুরুত্বপূর্ণ। আমরা কীভাবে আপনার তথ্য সংগ্রহ, সংরক্ষণ ও সুরক্ষা করি তা এখানে স্পষ্টভাবে বিবৃত করা হয়েছে।',
    sections: [
      {
        heading: '১. কি কি তথ্য আমরা সংগ্রহ করি',
        points: [
          'নাম, পূর্ণ ডেলিভারি ঠিকানা, জেলা, থানা এবং মোবাইল ফোন নম্বর (অর্ডার সঠিক ঠিকানায় পৌঁছানোর স্বার্থে)।',
          'অর্ডার ইতিহাস, পছন্দের পণ্য (উইশলিস্ট) এবং পণ্য সংক্রান্ত পর্যালোচনার তথ্য।',
          'আমরা কখনোই গ্রাহকের ক্রেডিট কার্ড বা পেমেন্ট গেটওয়ের পিন/পাসওয়ার্ড সংরক্ষণ করি না। সকল পেমেন্ট SSL এনক্রিপ্টেড সরকারি ব্যাংক অনুমোদিত গেটওয়ে দ্বারা প্রসেস হয়।'
        ]
      },
      {
        heading: '২. তথ্যের ব্যবহার ও গোপনীয়তা রক্ষা',
        points: [
          'আপনার তথ্য কেবল আপনার অর্ডার প্রসেসিং, ইনভয়েসিং এবং কাস্টমার সার্ভিসের প্রয়োজনে ব্যবহৃত হয়।',
          'আমরা কখনোই গ্রাহকের ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষ, বিজ্ঞাপন সংস্থা বা বিপণন এজেন্সির কাছে বিক্রি বা প্রকাশ করি না।',
          'জরুরি ডেলিভারির সুবিধার্থে শুধুমাত্র অনুমোদিত কুরিয়ার পার্টনারকে নাম, ঠিকানা ও মোবাইল নম্বর দেওয়া হয়।'
        ]
      },
      {
        heading: '৩. কুকিজ ও ব্রাউজিং অভিজ্ঞতা',
        points: [
          'ওয়েবসাইটের কার্ট সংরক্ষণ ও দ্রুত ব্রাউজিং অভিজ্ঞতার জন্য সীমিত ব্রাউজার কুকিজ ব্যবহৃত হয়।',
          'আপনি চাইলে আপনার ব্রাউজার সেটিং থেকে যেকোনো সময় কুকিজ মুছে ফেলতে পারেন।'
        ]
      },
      {
        heading: '৪. ডেটা সুরক্ষা ও নিয়ন্ত্রণ',
        points: [
          'সকল ডেটা আধুনিক ক্লাউড সার্ভারে এনক্রিপ্টেড ব্যাকআপের মাধ্যমে সুরক্ষিত থাকে।',
          'যেকোনো সময় আপনার অ্যাকাউন্ট বা সংরক্ষিত তথ্য মুছে ফেলার জন্য আমাদের সাপোর্ট সেন্টারে অনুরোধ করতে পারেন।'
        ]
      }
    ]
  },
  'delivery-information': {
    slug: 'delivery-information',
    titleBn: 'ডেলিভারি তথ্য ও চার্জ',
    titleEn: 'Delivery Information & Charges',
    badge: 'সারা দেশে দ্রুততম হোম ডেলিভারি',
    lastUpdated: '২০২৬ হালনাগাদ',
    icon: <Truck className="w-8 h-8 text-[#D4AF37]" />,
    summary: 'বস্ত্র শৈলী (BOSTROSHOILY) নিজস্ব লজিস্টিকস ও দেশের শীর্ষ কুরিয়ার সার্ভিসের মাধ্যমে দেশের ৬৪ জেলার প্রত্যন্ত অঞ্চলেও দ্রুততম ক্যাশ অন ডেলিভারি (COD) সেবা পৌঁছে দেয়।',
    sections: [
      {
        heading: '১. ডেলিভারি সময়সীমা',
        points: [
          'সিরাজগঞ্জ জেলা ও আশেপাশের এলাকায়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি।',
          'ঢাকা মেট্রোপলিটন এলাকা: ১ থেকে ২ কার্যদিবসের মধ্যে সরাসরি হোম ডেলিভারি।',
          'ঢাকা ও সিরাজগঞ্জের বাইরে সারা বাংলাদেশের যেকোনো জেলা/উপজেলায়: ২ থেকে ৩ কার্যদিবসের মধ্যে হোম ডেলিভারি।'
        ]
      },
      {
        heading: '২. ডেলিভারি চার্জের হার',
        points: [
          'সিরাজগঞ্জ লোকাল হোম ডেলিভারি: ৫০ টাকা মাত্র।',
          'ঢাকা সিটির ভেতর হোম ডেলিভারি: ৭০ টাকা মাত্র।',
          'ঢাকা সিটির বাইরে সমগ্র বাংলাদেশে: ১২০ টাকা মাত্র।',
          'বিশেষ অফার: ২০০০ টাকা বা তদূর্ধ্ব মূল্যের সকল অর্ডারে সারা দেশে সম্পূর্ণ ফ্রি ডেলিভারি!'
        ]
      },
      {
        heading: '৩. ক্যাশ অন ডেলিভারি (COD) ও ট্র্যাকিং',
        points: [
          'কোনো অগ্রিম টাকা ছাড়াই সম্পূর্ণ ক্যাশ অন ডেলিভারিতে অর্ডার করার সুবর্ণ সুযোগ।',
          'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।',
          'অর্ডার ডিসপ্যাচ হওয়ার সাথে সাথে আপনার ফোনে ট্র্যাকিং লিংক ও এসএমএস পাঠানো হবে যাতে রিয়েল-টাইম পার্সেল ট্র্যাক করতে পারেন।'
        ]
      },
      {
        heading: '৪. উৎসব ও আবহাওয়া জনিত সতর্কতা',
        points: [
          'ঈদ বা বিশেষ উৎসবের মৌসুমে কুরিয়ারের অতিরিক্ত চাপের কারণে ১ দিন বেশি সময় লাগতে পারে। সময়মতো পণ্য পেতে উৎসবের অন্তত ৫-৭ দিন আগে অর্ডার সম্পন্ন করার পরামর্শ দেওয়া হয়।'
        ]
      }
    ]
  }
};

export const PolicyPage: React.FC = () => {
  const { currentPolicySlug, navigateToHome, navigateToPolicy, footerConfig } = useShop();

  const activeSlug = currentPolicySlug || 'returns-exchange';
  const policy = POLICIES[activeSlug] || POLICIES['returns-exchange'];

  const [dbPolicy, setDbPolicy] = React.useState<any>(null);

  // Fetch live CMS policy from SQLite database
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/policy-pages/${activeSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.page) {
          setDbPolicy(data.page);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  // Scroll to top on slug change and update document title for SEO
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const pageTitle = dbPolicy?.seo_title || `${policy.titleBn} | বস্ত্র শৈলী (BOSTROSHOILY)`;
    document.title = pageTitle;
  }, [activeSlug, dbPolicy, policy]);

  // Check if admin customized text in footerConfig or DB policy content
  const customAdminContent = (() => {
    if (dbPolicy?.content_bn) {
      return dbPolicy.content_bn;
    }
    if (!footerConfig) return null;
    if (activeSlug === 'returns-exchange' && (footerConfig.returnsPolicyText || footerConfig.returnPolicy)) {
      return footerConfig.returnsPolicyText || footerConfig.returnPolicy;
    }
    if (activeSlug === 'terms-and-conditions' && (footerConfig.termsText || footerConfig.termsAndConditions)) {
      return footerConfig.termsText || footerConfig.termsAndConditions;
    }
    if (activeSlug === 'privacy-policy' && (footerConfig.privacyText || footerConfig.privacyPolicy)) {
      return footerConfig.privacyText || footerConfig.privacyPolicy;
    }
    if (activeSlug === 'delivery-information' && (footerConfig.deliveryInfoText || footerConfig.shippingPolicy)) {
      return footerConfig.deliveryInfoText || footerConfig.shippingPolicy;
    }
    return null;
  })();

  const pageTitleBn = dbPolicy?.title_bn || policy.titleBn;
  const pageTitleEn = dbPolicy?.title_en || policy.titleEn;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B0D08] pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-[#2B0D08] text-[#F5E6D3] border-b border-[#3D140C] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <button
              onClick={() => navigateToHome()}
              className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-white transition-colors py-1.5 px-3 rounded-lg bg-[#3D140C]/60 hover:bg-[#3D140C]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>হোম পেজে ফিরুন</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs text-[#F5E6D3]/80 hover:text-white py-1.5 px-3 rounded-lg border border-[#F5E6D3]/20 hover:border-[#D4AF37] transition-all"
                title="প্রিন্ট করুন"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট</span>
              </button>
              <span className="inline-flex items-center gap-1 text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                <Clock className="w-3 h-3" />
                {policy.lastUpdated}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#3D140C] rounded-2xl border border-[#D4AF37]/30 shadow-inner flex-shrink-0">
              {policy.icon}
            </div>
            <div>
              <span className="inline-block text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                {policy.badge} • {pageTitleEn}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#F5E6D3] tracking-wide">
                {pageTitleBn}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#F5E6D3]/80 max-w-3xl leading-relaxed">
                {policy.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Policy Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-[#E8DFD8] p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C2D19] mb-3 px-2">
                সকল পলিসি ও শর্তাবলী
              </h3>
              <nav className="space-y-1.5">
                {[
                  { slug: 'returns-exchange', label: 'রিটার্ন ও এক্সচেঞ্জ পলিসি', icon: RotateCcw },
                  { slug: 'delivery-information', label: 'ডেলিভারি তথ্য ও চার্জ', icon: Truck },
                  { slug: 'terms-and-conditions', label: 'শর্তাবলী ও নিয়মাবলী', icon: FileText },
                  { slug: 'privacy-policy', label: 'গোপনীয়তা নীতি', icon: ShieldCheck },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => navigateToPolicy(item.slug)}
                      className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#2B0D08] text-[#F5E6D3] shadow-md border-l-4 border-[#D4AF37]'
                          : 'text-[#5A3825] hover:bg-[#F5EBE1] hover:text-[#2B0D08]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8C2D19]'}`} />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Need help box */}
              <div className="mt-6 pt-6 border-t border-[#E8DFD8] px-2 text-xs text-[#5A3825]">
                <p className="font-bold text-[#2B0D08] mb-2">সরাসরি সহায়তা প্রয়োজন?</p>
                <div className="space-y-2">
                  <a 
                    href="tel:+8801700000000" 
                    className="flex items-center gap-2 text-[#8C2D19] hover:underline font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>০১৭০০-০০০০০০</span>
                  </a>
                  <div className="flex items-center gap-2 text-[#6B5E55]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>bostroshoily@gmail.com</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#6B5E55]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>তাঁত কুটির, শাহজাদপুর, সিরাজগঞ্জ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Body Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* If admin provided customized text */}
            {customAdminContent && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                  <span>বস্ত্র শৈলী (BOSTROSHOILY) অফিসিয়াল নোটিশ</span>
                </div>
                <div className="text-sm text-stone-800 whitespace-pre-line leading-relaxed">
                  {customAdminContent}
                </div>
              </div>
            )}

            {/* Standard Comprehensive Policy Clauses */}
            <div className="bg-white rounded-2xl border border-[#E8DFD8] p-6 sm:p-8 shadow-sm space-y-8">
              {policy.sections.map((section, idx) => (
                <div key={idx} className="space-y-3 pb-6 border-b border-[#F0E6DE] last:border-b-0 last:pb-0">
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2B0D08] flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    {section.heading}
                  </h2>
                  <ul className="space-y-2.5 pl-2 sm:pl-4">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#4A3222] leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#8C2D19] flex-shrink-0 mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* FAQ Accordion Section if available */}
            {policy.faq && policy.faq.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8DFD8] p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold font-serif text-[#2B0D08] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#8C2D19]" />
                  <span>সাধারণ কিছু প্রশ্ন ও উত্তর (FAQ)</span>
                </h3>
                <div className="space-y-4">
                  {policy.faq.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EFE5DB]">
                      <h4 className="font-semibold text-sm sm:text-base text-[#2B0D08] mb-1.5">
                        প্র: {item.q}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#5A3825] leading-relaxed">
                        উ: {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-[#2B0D08] rounded-2xl text-[#F5E6D3] shadow-md">
              <div>
                <h4 className="font-bold text-base text-[#F5E6D3]">খাঁটি তাঁতের কাপড়ে সেরা অভিজ্ঞতা নিশ্চিত করুন</h4>
                <p className="text-xs text-[#F5E6D3]/80 mt-0.5">যেকোনো জিজ্ঞাসা বা পরামর্শে আমাদের কল করুন অথবা ফেসবুক মেসেঞ্জারে যুক্ত হোন।</p>
              </div>
              <button
                onClick={() => navigateToHome()}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c09d2f] text-[#2B0D08] font-bold text-sm rounded-xl transition-all shadow"
              >
                কেনাকাটা চালিয়ে যান
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
export default PolicyPage;
