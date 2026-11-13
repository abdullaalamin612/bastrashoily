import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Logo } from './Logo';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Store,
  ChevronRight,
  MessageCircle,
  X,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    footerConfig,
    navigateToHome,
    navigateToCmsGuide,
    navigateToClothingGuide,
    navigateToTracking,
    navigateToPolicy,
    showToast,
  } = useShop();

  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic social links from footerConfig or defaults
  const facebookUrl = footerConfig.facebookUrl || 'https://facebook.com/bostroshoily';
  const instagramUrl = footerConfig.instagramUrl || 'https://instagram.com/bostroshoily';
  const youtubeUrl = footerConfig.youtubeUrl || 'https://youtube.com/@bostroshoily';
  const tiktokUrl = (footerConfig as any).tiktokUrl || 'https://tiktok.com/@bostroshoily';
  const whatsappUrl =
    (footerConfig as any).whatsappUrl ||
    'https://wa.me/8801864528488?text=' + encodeURIComponent('আসসালামু আলাইকুম বস্ত্র শৈলী, আমি পণ্য সম্পর্কে জানতে চাই।');

  const phone = footerConfig.phone || '+8801864-528488';
  const email = footerConfig.email || 'bostroshoily@gmail.com';
  const address = footerConfig.address || 'দ্বারিয়াপুর, শাহজাদপুর, সিরাজগঞ্জ - ৬৭৭০, বাংলাদেশ';

  const brandBio =
    footerConfig.aboutUs ||
    'বস্ত্র শৈলী (BOSTROSHOILY) সিরাজগঞ্জ ও পাবনার তাঁত কারিগরদের নিপুণ হাতের ছোঁয়ায় বোনা খাঁটি সুতি তাঁতের লুঙ্গি, প্রিমিয়াম রয়্যাল পাঞ্জাবি ও ঐতিহ্যবাহী জামদানি শাড়ির সবচেয়ে নির্ভরযোগ্য অনলাইন ঠিকানা। শতভাগ আরামদায়ক কাপড়ে দেশীয় ঐতিহ্যের আভিজাত্য।';

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    showToast('ধন্যবাদ! বস্ত্র শৈলীর বিশেষ ছাড় ও নতুন কালেকশনের আপডেটে যুক্ত হলেন।');
    setNewsletterEmail('');
  };

  // Dynamic lists if configured by admin in FooterManagementModule
  const customQuickLinks = footerConfig.quickLinks || [];
  const customPolicies = footerConfig.policies || [];
  const customContacts = footerConfig.contactItems || [];

  // Phase 1.1 Appearance controls
  const bgColor = footerConfig.bgColor || '#240B07';
  const textColor = footerConfig.textColor || '#E8D5C4';
  const headingColor = footerConfig.headingColor || '#FFF7ED';
  const borderColor = footerConfig.borderColor || '#3E140D';
  const bgImage = footerConfig.bgImage;
  const paddingY = footerConfig.paddingY ?? 48;

  const newsletterTitle = footerConfig.newsletterTitle || 'বস্ত্র শৈলী প্রিমিয়াম ক্লাবে যুক্ত হোন';
  const newsletterSubtitle = footerConfig.newsletterSubtitle || 'নতুন কালেকশন ও এক্সক্লুসিভ অফারের খবর সবার আগে পেতে ইমেইল সাবস্ক্রাইব করুন।';
  const newsletterBtnText = footerConfig.newsletterButtonText || 'সাবস্ক্রাইব';

  const headingAbout = footerConfig.headings?.about || 'বস্ত্র শৈলী পরিচিতি';
  const headingLinks = footerConfig.headings?.links || 'দ্রুত লিংকসমূহ (Quick Links)';
  const headingPolicies = footerConfig.headings?.policies || 'সার্ভিস ও পলিসি (Policies)';
  const headingContacts = footerConfig.headings?.contacts || 'যোগাযোগ করুন (Contact Us)';

  return (
    <footer 
      style={{ 
        backgroundColor: bgColor, 
        color: textColor, 
        borderColor: borderColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} 
      className="border-t font-sans selection:bg-[#D4AF37] selection:text-[#240B07]"
    >
      {/* Newsletter / Value strip */}
      <div 
        style={{ borderColor: borderColor }}
        className="border-b bg-black/20 py-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 style={{ color: headingColor }} className="text-sm sm:text-base font-bold">{newsletterTitle}</h4>
              <p style={{ color: textColor }} className="text-xs opacity-80">{newsletterSubtitle}</p>
            </div>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto items-center gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="আপনার ইমেইল ঠিকানা দিন..."
              className="w-full sm:w-72 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-black/25 border border-white/10 text-white placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c09d2f] text-[#240B07] font-bold text-xs sm:text-sm rounded-xl transition-all shadow shrink-0"
            >
              {newsletterBtnText}
            </button>
          </form>
        </div>
      </div>

      {/* Main 4-Column Footer Content */}
      <div 
        style={{ paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px` }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Logo, Bio & Social Links */}
          <div className="space-y-5">
            <div className="cursor-pointer inline-block" onClick={navigateToHome}>
              <Logo variant="light" />
            </div>

            <p className="text-sm text-[#E8D5C4] leading-relaxed">
              {brandBio}
            </p>

            <div className="pt-2">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-3">
                সোশ্যাল মিডিয়ায় যুক্ত থাকুন:
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2E0F0A] hover:bg-[#1877F2] text-[#F5E6D3] hover:text-white flex items-center justify-center border border-[#4E1E14] hover:border-[#1877F2] transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2E0F0A] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-[#F5E6D3] hover:text-white flex items-center justify-center border border-[#4E1E14] hover:border-transparent transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                {/* TikTok */}
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2E0F0A] hover:bg-black text-[#F5E6D3] hover:text-[#00f2fe] flex items-center justify-center border border-[#4E1E14] hover:border-[#00f2fe] transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="TikTok"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.47V8.71a8.19 8.19 0 0 0 4.9 1.63v-3.45a4.85 4.85 0 0 1-1-.2z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2E0F0A] hover:bg-[#FF0000] text-[#F5E6D3] hover:text-white flex items-center justify-center border border-[#4E1E14] hover:border-[#FF0000] transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#2E0F0A] hover:bg-[#25D366] text-[#F5E6D3] hover:text-white flex items-center justify-center border border-[#4E1E14] hover:border-[#25D366] transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="WhatsApp Direct Chat"
                  aria-label="WhatsApp Direct Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Artisan Guarantee */}
            <div className="pt-2 flex items-center gap-2.5 text-xs text-[#D4AF37] font-medium">
              <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>শাহজাদপুর-সিরাজগঞ্জের ১০০% আসল তাঁত শিল্প</span>
            </div>
          </div>

          {/* Column 2: দ্রুত লিংকসমূহ (Quick Links) */}
          <div className="space-y-4">
            <h4 style={{ color: headingColor, borderColor: borderColor }} className="text-base font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-3">
              <span className="w-2 h-4 bg-[#D4AF37] rounded-full" />
              <span>{headingLinks}</span>
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button
                  onClick={navigateToHome}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>হোম পেজ (Home)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTracking()}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>অর্ডার ট্র্যাক করুন (Track Order)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={navigateToCmsGuide}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>কিভাবে অর্ডার করবেন? (How to Order)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={navigateToClothingGuide}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>কাপড়ের যত্ন ও সাইজ গাইড (Care & Size)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsOutletModalOpen(true)}
                  className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>শোরুম ও আউটলেটসমূহ (Outlets)</span>
                </button>
              </li>

              {/* Admin configured custom links */}
              {customQuickLinks.filter((l) => l.isActive).map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-[#E8D5C4] hover:translate-x-1"
                  >
                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    <span>{l.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: সার্ভিস ও পলিসি (Policies) — Dedicated Pages, No Floating Popups */}
          <div className="space-y-4">
            <h4 style={{ color: headingColor, borderColor: borderColor }} className="text-base font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-3">
              <span className="w-2 h-4 bg-[#D4AF37] rounded-full" />
              <span>{headingPolicies}</span>
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button
                  onClick={() => navigateToPolicy('returns-exchange')}
                  className="hover:text-[#D4AF37] transition-colors text-left flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>রিটার্ন ও এক্সচেঞ্জ পলিসি (Returns)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPolicy('terms-and-conditions')}
                  className="hover:text-[#D4AF37] transition-colors text-left flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>শর্তাবলী (Terms & Conditions)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPolicy('privacy-policy')}
                  className="hover:text-[#D4AF37] transition-colors text-left flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>গোপনীয়তা নীতি (Privacy Policy)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToPolicy('delivery-information')}
                  className="hover:text-[#D4AF37] transition-colors text-left flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                >
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  <span>ডেলিভারি তথ্য (Delivery Info)</span>
                </button>
              </li>

              {/* Admin custom policies */}
              {customPolicies.filter((p) => p.isActive).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => navigateToPolicy(p.id || 'returns-exchange')}
                    className="hover:text-[#D4AF37] transition-colors text-left flex items-center gap-2 cursor-pointer text-[#E8D5C4] hover:translate-x-1"
                  >
                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    <span>{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: যোগাযোগ ও কাস্টমার কেয়ার (Contact Us) */}
          <div className="space-y-4">
            <h4 style={{ color: headingColor, borderColor: borderColor }} className="text-base font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-3">
              <span className="w-2 h-4 bg-[#D4AF37] rounded-full" />
              <span>{headingContacts}</span>
            </h4>

            <div className="space-y-3.5 text-sm text-[#E8D5C4]">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="text-[#D4AF37] hover:underline font-bold text-sm"
                  >
                    {phone}
                  </a>
                  <span className="text-xs text-[#A88E80] block mt-0.5">
                    (সকাল ৯:০০টা - রাত ১১:০০টা)
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-[#E8D5C4] hover:text-[#D4AF37] transition-colors text-sm"
                >
                  {email}
                </a>
              </div>

              {/* WhatsApp Chat Button */}
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন</span>
                </a>
              </div>

              {/* Admin custom contact items */}
              {customContacts.filter((c) => c.isActive).map((c) => (
                <div key={c.id} className="flex items-center gap-2 pt-1 text-[#E8D5C4]">
                  <span className="font-bold text-[#D4AF37]">{c.label}:</span>
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR: Outlets Trigger & Copyright */}
      <div className="border-t border-[#3E140D] bg-[#1A0704] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Outlets Button */}
          <button
            onClick={() => setIsOutletModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#2E0F0A] hover:bg-[#3E140D] text-[#E8D5C4] hover:text-white border border-[#4E1E14] hover:border-[#D4AF37] font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>আমাদের শোরুম ও আউটলেটসমূহ</span>
          </button>

          {/* Copyright Text — Admin Editable from footerConfig */}
          <div className="text-xs text-[#C5B0A2] text-center font-medium">
            {footerConfig.copyrightText || (
              <>
                © ২০২৬ <span className="text-[#FFF7ED] font-bold">বস্ত্র শৈলী (BOSTROSHOILY)</span> - সর্বস্বত্ব সংরক্ষিত।
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shopping Outlets Modal */}
      {isOutletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#240B07] border border-[#4E1E14] rounded-3xl max-w-lg w-full p-6 text-[#F5E6D3] shadow-2xl relative">
            <button
              onClick={() => setIsOutletModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#C5B0A2] hover:text-white rounded-full bg-[#34110A] hover:bg-[#4E1E14] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-[#D4AF37] font-extrabold text-base mb-1">
              <Store className="w-5 h-5" />
              <span>বস্ত্র শৈলী শোরুম ও আউটলেটসমূহ</span>
            </div>
            <p className="text-xs text-[#C5B0A2] mb-4">আমাদের প্রধান শোরুম ও আউটলেটের তথ্য</p>

            <div className="space-y-3.5 text-xs bg-[#1A0704] p-4 rounded-2xl border border-[#3E140D]">
              <div>
                <span className="font-bold text-[#D4AF37] block mb-0.5">শাহজাদপুর ফ্ল্যাগশিপ আউটলেট:</span>
                <span className="text-[#E8D5C4]">দ্বারিয়াপুর বাজার মোড়, শাহজাদপুর, সিরাজগঞ্জ - ৬৭৭০</span>
              </div>
              <div>
                <span className="font-bold text-[#D4AF37] block mb-0.5">খোলা থাকার সময়:</span>
                <span className="text-[#E8D5C4]">সকাল ৯:০০টা থেকে রাত ১০:০০টা (প্রতিদিন খোলা)</span>
              </div>
              <div>
                <span className="font-bold text-[#D4AF37] block mb-0.5">আউটলেট হটলাইন:</span>
                <span className="text-[#E8D5C4]">+8801864-528488</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsOutletModalOpen(false)}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c09d2f] text-[#240B07] font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
export default Footer;
