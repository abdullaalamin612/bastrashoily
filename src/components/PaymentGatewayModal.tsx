import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, X, Lock, ArrowRight, RefreshCw, CreditCard } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number;
  gateway: 'bkash' | 'nagad' | 'sslcommerz' | 'card';
  paymentUrl?: string;
  paymentId?: string;
  onSuccess: (verifiedData: { trxId: string; paymentStatus: string; order: any }) => void;
  onCancel: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  orderId,
  amount,
  gateway,
  paymentUrl,
  paymentId,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'card_info'>('number');
  const [accountNumber, setAccountNumber] = useState('01864528488');
  const [otp, setOtp] = useState('123456');
  const [pin, setPin] = useState('•••••');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isBkash = gateway === 'bkash';
  const isNagad = gateway === 'nagad';
  const isCard = gateway === 'sslcommerz' || gateway === 'card';

  const theme = isBkash
    ? {
        name: 'bKash Payment',
        banglaName: 'বিকাশ পেমেন্ট গেটওয়ে',
        primaryBg: 'bg-[#E2136E]',
        primaryHover: 'hover:bg-[#C10F5D]',
        textColor: 'text-[#E2136E]',
        borderColor: 'border-[#E2136E]',
        lightBg: 'bg-pink-50',
      }
    : isNagad
    ? {
        name: 'Nagad Payment',
        banglaName: 'নগদ পেমেন্ট গেটওয়ে',
        primaryBg: 'bg-[#F7931E]',
        primaryHover: 'hover:bg-[#DF7E0E]',
        textColor: 'text-[#F7931E]',
        borderColor: 'border-[#F7931E]',
        lightBg: 'bg-amber-50',
      }
    : {
        name: 'SSLCommerz Secure Checkout',
        banglaName: 'নিরাপদ ভিসা / মাস্টারকার্ড / ডেবিট কার্ড গেটওয়ে',
        primaryBg: 'bg-[#1E3A8A]',
        primaryHover: 'hover:bg-[#1E40AF]',
        textColor: 'text-[#1E3A8A]',
        borderColor: 'border-[#1E3A8A]',
        lightBg: 'bg-blue-50',
      };

  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payment/verify-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          gateway,
          paymentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data);
      } else {
        setErrorMessage(data.error || 'পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setIsVerifying(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'সার্ভার যোগাযোগ ব্যর্থ হয়েছে।');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col">
        {/* Header */}
        <div className={`${theme.primaryBg} text-white px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-white/90" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">{theme.name}</h3>
              <p className="text-[11px] text-white/80">{theme.banglaName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Invoice Banner */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 font-medium">অর্ডার নম্বর:</span>
            <span className="text-xs font-mono font-bold text-stone-800 ml-1.5">{orderId}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-stone-500 font-medium">পরিশোধযোগ্য মূল্য:</span>
            <span className="text-base font-black text-stone-900 ml-1.5">৳{amount.toLocaleString('en-BD')}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isCard ? (
            /* Card Payment View */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-stone-600 border-b border-stone-100 pb-2">
                <span className="font-bold">কার্ডের তথ্য প্রদান করুন</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-Bit SSL Encrypted
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">কার্ড নম্বর (Card Number)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-mono text-stone-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                  <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">মেয়াদ (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-mono text-stone-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">সিভিভি (CVV/CVC)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-mono text-stone-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={isVerifying}
                className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-4`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    পেমেন্ট ভেরিফাই করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    ৳{amount.toLocaleString('en-BD')} পরিশোধ নিশ্চিত করুন
                  </>
                )}
              </button>
            </div>
          ) : (
            /* bKash / Nagad Multi-Step View */
            <div className="space-y-4">
              {step === 'number' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      আপনার {isBkash ? 'বিকাশ' : 'নগদ'} একাউন্ট নম্বর লিখুন:
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      নম্বরে একটি ওটিপি (OTP) ভেরিফিকেশন কোড পাঠানো হবে।
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onCancel}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      onClick={() => setStep('otp')}
                      className={`flex-1 ${theme.primaryBg} ${theme.primaryHover} text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs`}
                    >
                      পরবর্তী ধাপ
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      এসএমএসে প্রাপ্ত ৬ সংখ্যার ভেরিফিকেশন কোড (OTP):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-[0.4em] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base font-mono font-black text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                    />
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ভেরিফিকেশন কোড পাঠানো হয়েছে {accountNumber}-এ
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep('number')}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      onClick={() => setStep('pin')}
                      className={`flex-1 ${theme.primaryBg} ${theme.primaryHover} text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs`}
                    >
                      কোড নিশ্চিত করুন
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 'pin' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      {isBkash ? 'বিকাশ' : 'নগদ'} পিন (PIN) প্রদান করুন:
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full text-center tracking-[0.5em] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-lg font-mono font-black text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 text-center">
                      🔒 আপনার পিন সম্পূর্ণ এনক্রিপ্টেড এবং সুরক্ষিত।
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep('otp')}
                      disabled={isVerifying}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isVerifying}
                      className={`flex-1 ${theme.primaryBg} ${theme.primaryHover} text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50`}
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          যাচাই হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          পেমেন্ট সম্পন্ন করুন
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust Badges */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              বাংলাদেশ ব্যাংক অনুমোদিত গেটওয়ে
            </span>
            <span className="font-mono text-[10px] text-stone-400">Ver. 2.6 Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
