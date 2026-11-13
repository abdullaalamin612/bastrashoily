import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div id="countdown-timer" className="flex items-center gap-2 sm:gap-3">
      <div className="bg-stone-900/90 backdrop-blur text-white px-3 py-2 rounded-xl text-center min-w-[56px] border border-stone-800 shadow-sm">
        <span className="block text-xl sm:text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-stone-300 uppercase tracking-wider">দিন (Days)</span>
      </div>
      <span className="text-xl font-bold text-amber-500">:</span>
      <div className="bg-stone-900/90 backdrop-blur text-white px-3 py-2 rounded-xl text-center min-w-[56px] border border-stone-800 shadow-sm">
        <span className="block text-xl sm:text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-stone-300 uppercase tracking-wider">ঘণ্টা (Hrs)</span>
      </div>
      <span className="text-xl font-bold text-amber-500">:</span>
      <div className="bg-stone-900/90 backdrop-blur text-white px-3 py-2 rounded-xl text-center min-w-[56px] border border-stone-800 shadow-sm">
        <span className="block text-xl sm:text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-stone-300 uppercase tracking-wider">মিনিট (Min)</span>
      </div>
      <span className="text-xl font-bold text-amber-500">:</span>
      <div className="bg-stone-900/90 backdrop-blur text-white px-3 py-2 rounded-xl text-center min-w-[56px] border border-stone-800 shadow-sm">
        <span className="block text-xl sm:text-2xl font-bold font-mono text-amber-400">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-stone-300 uppercase tracking-wider">সেকেন্ড (Sec)</span>
      </div>
    </div>
  );
};
