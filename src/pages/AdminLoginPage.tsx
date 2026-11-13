import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  UserCheck,
  ArrowLeft,
  Store,
  Mail,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Clock,
  Key,
  HelpCircle,
} from 'lucide-react';

type RecoveryStage = 'REQUEST' | 'VERIFY' | 'RESET' | 'SUCCESS';

interface RecoveryOptions {
  emailAvailable: boolean;
  emailProvider: string;
  smsAvailable: boolean;
  smsProvider: string;
  maskedEmail?: string;
  maskedPhone?: string;
  targetEmail?: string;
  targetPhone?: string;
}

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, navigateToHome } = useShop();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState<RecoveryStage>('REQUEST');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryChannel, setRecoveryChannel] = useState<'email' | 'sms'>('email');
  const [recoveryOptions, setRecoveryOptions] = useState<RecoveryOptions | null>(null);

  // OTP & Reset Token State
  const [otpInput, setOtpInput] = useState('');
  const [maskedDestination, setMaskedDestination] = useState('');
  const [targetAdminId, setTargetAdminId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and Timers
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(0);

  // Fetch server recovery options on open
  useEffect(() => {
    if (isRecoveryOpen) {
      fetch('/api/admin/auth/recovery-options')
        .then((res) => res.json())
        .then((data) => {
          setRecoveryOptions(data);
          if (data.emailAvailable && !data.smsAvailable) {
            setRecoveryChannel('email');
          } else if (!data.emailAvailable && data.smsAvailable) {
            setRecoveryChannel('sms');
          }
        })
        .catch(() => {});
    }
  }, [isRecoveryOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // OTP 5-minute expiration countdown timer
  useEffect(() => {
    if (otpExpirySeconds > 0 && recoveryStage === 'VERIFY') {
      const timer = setTimeout(() => setOtpExpirySeconds((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpirySeconds, recoveryStage]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('অনুগ্রহ করে এডমিন ইউজারনেম, ইমেইল অথবা মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('অনুগ্রহ করে এডমিন পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminLogin(password, identifier.trim());
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleOpenRecovery = () => {
    setRecoveryStage('REQUEST');
    setRecoveryIdentifier(identifier.trim() || 'bastrashoily@gmail.com');
    setRecoveryError('');
    setRecoverySuccess('');
    setOtpInput('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setIsRecoveryOpen(true);
  };

  // 1. Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (cooldownSeconds > 0) {
      setRecoveryError(`নতুন ওটিপি কোড পাঠানোর জন্য আরও ${cooldownSeconds} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: recoveryIdentifier.trim() || 'admin',
          channel: recoveryChannel,
        }),
      });

      const data = await res.json();
      setRecoveryLoading(false);

      if (res.ok && data.success) {
        setMaskedDestination(data.destinationMasked || '');
        setTargetAdminId(data.adminId || '');
        setCooldownSeconds(data.cooldownSeconds || 60);
        setOtpExpirySeconds(data.expiresInSeconds || 300);
        setRecoverySuccess(data.message || 'ওটিপি কোড পাঠানো হয়েছে');
        setRecoveryStage('VERIFY');
      } else {
        setRecoveryError(data.error || 'ওটিপি অনুরোধ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError('সার্ভারে সংযোগ করা সম্ভব হয়নি। সার্ভার স্ট্যাটাস যাচাই করুন।');
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setRecoveryError('অনুগ্রহ করে সঠিক ৬-সংখ্যার ওটিপি কোড প্রদান করুন');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: targetAdminId,
          identifier: recoveryIdentifier.trim(),
          otp: otpInput.trim(),
        }),
      });

      const data = await res.json();
      setRecoveryLoading(false);

      if (res.ok && data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setRecoverySuccess('ওটিপি সফলভাবে যাচাই হয়েছে। এখন নতুন পাসওয়ার্ড নির্ধারণ করুন।');
        setRecoveryStage('RESET');
      } else {
        setRecoveryError(data.error || 'ভুল ওটিপি কোড প্রদান করা হয়েছে।');
      }
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError('ওটিপি যাচাই সার্ভারে সংযোগ করা যায়নি।');
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (!newPassword || newPassword.trim().length < 6) {
      setRecoveryError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setRecoveryError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না');
      return;
    }

    setRecoveryLoading(true);
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const data = await res.json();
      setRecoveryLoading(false);

      if (res.ok && data.success) {
        setRecoverySuccess(data.message || 'এডমিন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
        setIdentifier('admin');
        setPassword(newPassword.trim());
        setRecoveryStage('SUCCESS');
      } else {
        setRecoveryError(data.error || 'পাসওয়ার্ড রিসেট করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setRecoveryLoading(false);
      setRecoveryError('পাসওয়ার্ড রিসেট সার্ভারে সংযোগ করা যায়নি।');
    }
  };



  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-500 selection:text-stone-950">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <button
          onClick={navigateToHome}
          className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-amber-400 bg-stone-900/80 hover:bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ওয়েবসাইটে ফিরে যান (Storefront)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Store className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-stone-300">BOSTROSHOILY</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-stone-900/90 backdrop-blur-md rounded-3xl border border-stone-800 p-7 sm:p-9 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span>🔐</span>
                <span>{typeof window !== 'undefined' ? `${window.location.host}/account` : 'bostroshoily.com/account'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                বস্ত্র শৈলী এডমিন ও স্টাফ পোর্টাল
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                অনুমোদিত ইউজারনেম/ইমেইল ও পাসওয়ার্ড দিয়ে পোর্টালে প্রবেশ করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Admin Identifier */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username, Email অথবা Mobile</span>
                </label>
                <span className="text-[10px] text-amber-400/90 font-mono">
                  {typeof window !== 'undefined' ? `${window.location.host}/account` : 'bostroshoily.com/account'}
                </span>
              </div>
              <input
                id="admin-page-identifier-input"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Username, Email অথবা মোবাইল নম্বর"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono transition-colors"
              />
            </div>

            {/* Admin Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password</span>
                </label>
                {/* Professional Forgot Password Link */}
                <button
                  type="button"
                  onClick={handleOpenRecovery}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="admin-page-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono transition-colors tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 animate-ping" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="admin-page-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-bold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'Login'}</span>
            </button>
          </form>

          {/* Recovery Options Footer Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleOpenRecovery}
              className="text-[11px] text-stone-400 hover:text-amber-400 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>পাসওয়ার্ড ভুলে গেছেন? ওটিপি (OTP) রিকভারি করুন</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="pt-3 border-t border-stone-800 text-center">
            <p className="text-[11px] text-stone-400 leading-relaxed">
              🔐 প্রতিটি এডমিন সেশন সার্ভার-সাইড ক্রিপ্টোগ্রাফিক সেশন টোকেন ও পারমিশন দ্বারা সুরক্ষিত।
            </p>
          </div>
        </div>
      </div>

      {/* Professional Forgot Password & OTP Recovery Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-amber-400">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-white">এডমিন একাউন্ট ওটিপি রিকভারি</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STAGE 1: REQUEST OTP */}
            {recoveryStage === 'REQUEST' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-stone-300 leading-relaxed">
                  আপনার বিদ্যমান সুপার-এডমিন একাউন্টে সংরক্ষিত ভেরিফাইড ইমেইল অথবা মোবাইল নম্বরে নিরাপদ ৬-সংখ্যার ওটিপি পাঠিয়ে পাসওয়ার্ড রিসেট করুন।
                </p>

                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    এডমিন ইউজারনেম, ইমেইল অথবা মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="bastrashoily@gmail.com অথবা 01864528488"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Channel Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    ওটিপি পাঠানোর মাধ্যম নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Email Option */}
                    <button
                      type="button"
                      onClick={() => setRecoveryChannel('email')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        recoveryChannel === 'email'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">ইমেইল ওটিপি</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
                          Email
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-amber-300/90 truncate">
                        {recoveryOptions?.maskedEmail || 'ba*****y@gmail.com'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {recoveryOptions?.emailAvailable
                          ? `সক্রিয় (${recoveryOptions.emailProvider})`
                          : 'সার্ভার কনফিগারেশন প্রয়োজন'}
                      </span>
                    </button>

                    {/* SMS Option */}
                    <button
                      type="button"
                      onClick={() => setRecoveryChannel('sms')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        recoveryChannel === 'sms'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">মোবাইল এসএমএস</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
                          SMS
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-amber-300/90">
                        {recoveryOptions?.maskedPhone || '01864****88'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {recoveryOptions?.smsAvailable
                          ? `সক্রিয় (${recoveryOptions.smsProvider})`
                          : 'সার্ভার কনফিগারেশন প্রয়োজন'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Provider Warning Notice if selected provider is not configured */}
                {recoveryChannel === 'email' && !recoveryOptions?.emailAvailable && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/90 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300 mb-0.5">ইমেইল সার্ভিস কনফিগারেশন</p>
                      <p className="text-[11px] leading-relaxed">
                        Render Environment-এ <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">SMTP_HOST</code>, <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">SMTP_USER</code>, <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">SMTP_PASS</code> অথবা <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">RESEND_API_KEY</code> সেট করুন।
                      </p>
                    </div>
                  </div>
                )}

                {recoveryChannel === 'sms' && !recoveryOptions?.smsAvailable && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/90 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300 mb-0.5">বাংলাদেশি এসএমএস গেটওয়ে কনফিগারেশন</p>
                      <p className="text-[11px] leading-relaxed">
                        Render Environment-এ <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">GREENWEB_SMS_TOKEN</code>, <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">ALPHA_SMS_API_KEY</code>, <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">BULKSMSBD_API_KEY</code> অথবা <code className="bg-stone-950 px-1 py-0.5 rounded text-amber-300">TWILIO</code> ক্রেডেনশিয়াল সেট করুন।
                      </p>
                    </div>
                  </div>
                )}

                {recoveryError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={recoveryLoading || cooldownSeconds > 0}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {recoveryLoading ? (
                    <span>ওটিপি পাঠানো হচ্ছে...</span>
                  ) : cooldownSeconds > 0 ? (
                    <span>অপেক্ষা করুন ({cooldownSeconds}s)</span>
                  ) : (
                    <span>নিরাপদ ওটিপি কোড পাঠান</span>
                  )}
                </button>
              </form>
            )}

            {/* STAGE 2: VERIFY OTP */}
            {recoveryStage === 'VERIFY' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-300">
                    <span>প্রেরণের মাধ্যম:</span>
                    <span className="font-semibold text-amber-400 uppercase tracking-wider">
                      {recoveryChannel === 'email' ? '📧 Email' : '📱 SMS'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300">
                    <span>প্রাপক:</span>
                    <span className="font-mono font-bold text-white">{maskedDestination || 'নিবন্ধিত ঠিকানা'}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-300 pt-1 border-t border-stone-800/80">
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>মেয়াদ বাকি:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatTimer(otpExpirySeconds)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 text-center">
                    ৬-সংখ্যার ওটিপি (OTP) কোডটি লিখুন
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full bg-stone-950 border border-amber-500/50 rounded-2xl py-3 text-center text-2xl font-mono tracking-widest text-amber-400 placeholder-stone-700 focus:outline-none focus:border-amber-400"
                    autoFocus
                    required
                  />
                  <p className="text-[10px] text-stone-400 text-center mt-1.5">
                    ওটিপি কোডটি সর্বোচ্চ ৩ বার ভুল প্রদান করা যাবে।
                  </p>
                </div>

                {recoveryError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStage('REQUEST')}
                    className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    পেছনে যান
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading || otpInput.length !== 6}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {recoveryLoading ? 'যাচাই হচ্ছে...' : 'ওটিপি যাচাই করুন'}
                  </button>
                </div>

                {/* Resend button */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    disabled={cooldownSeconds > 0 || recoveryLoading}
                    onClick={() => handleRequestOtp()}
                    className="text-[11px] text-stone-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      {cooldownSeconds > 0
                        ? `পুনরায় পাঠান (${cooldownSeconds}s পর)`
                        : 'কোড পাননি? পুনরায় ওটিপি পাঠান'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* STAGE 3: SET NEW PASSWORD */}
            {recoveryStage === 'RESET' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ওটিপি সফলভাবে যাচাই হয়েছে। নতুন পাসওয়ার্ড নির্ধারণ করুন।</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    নতুন এডমিন পাসওয়ার্ড (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {recoveryError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={recoveryLoading || !newPassword || newPassword.length < 6}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {recoveryLoading ? 'আপডেট করা হচ্ছে...' : 'পাসওয়ার্ড নিশ্চিত ও সেশন বাতিল করুন'}
                </button>
              </form>
            )}

            {/* STAGE 4: SUCCESS */}
            {recoveryStage === 'SUCCESS' && (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-white">পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</p>
                    <p>{recoverySuccess || 'নতুন পাসওয়ার্ড দিয়ে এখন প্রবেশ করতে পারেন।'}</p>
                    <p className="text-emerald-400 text-[11px] pt-1">
                      🔒 নিরাপত্তার স্বার্থে পূর্বের সকল এডমিন সেশন সফলভাবে বাতিল করা হয়েছে।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  লগইন ফর্মে ফিরে যান (স্বয়ংক্রিয় ক্রেডেনশিয়াল)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-center text-xs text-stone-400 py-3">
        &copy; {new Date().getFullYear()} বস্ত্র শৈলী (BOSTROSHOILY). সর্বস্বত্ব সংরক্ষিত।
      </div>
    </div>
  );
};
