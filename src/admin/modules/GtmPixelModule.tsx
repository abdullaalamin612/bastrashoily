import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { PixelSettings } from '../../types';
import { adminFetch } from '../adminApi';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';

export const GtmPixelModule: React.FC = () => {
  const { showToast } = useShop();

  const [settings, setSettings] = useState<PixelSettings>({
    pixelId: '',
    capiToken: '',
    testCode: '',
    gtmId: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const productFeedUrl = `${window.location.origin}/api/feed/products.xml`;
  const fbCatalogFeedUrl = `${window.location.origin}/api/feed/facebook-catalog.xml`;

  useEffect(() => {
    adminFetch('/api/admin/pixel-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    adminFetch('/api/admin/tracking/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.events) {
          setRecentEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminFetch('/api/admin/pixel-settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('পিক্সেল ও ট্র্যাকিং কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        showToast(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-600" />
          <span>GTM & FB Pixel / API ইন্টিগ্রেশন (Tracking & Product Feed)</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          ফেসবুক পিক্সেল, কনভার্সন এপিআই (CAPI), গুগল ট্যাগ ম্যানেজার ও ফেসবুক ক্যাটালগ এক্সএমএল ফিড পরিচালনা করুন
        </p>
      </div>

      {/* 1. Facebook Pixel Table & Manage (Exact Video Feature 03:44) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-base font-bold text-stone-900">Facebook Pixel Manage</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Realtime Tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 uppercase tracking-wider text-[11px] border-b border-stone-200">
                <th className="py-2.5 px-3 font-bold">SL</th>
                <th className="py-2.5 px-3 font-bold">Pixels ID</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-3 px-3 font-semibold text-stone-500">1</td>
                <td className="py-3 px-3 font-mono font-bold text-stone-800">
                  {settings.pixelId || '1151443685416429 (Not Set)'}
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    settings.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {settings.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('pixel-id-input');
                      if (el) el.focus();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Facebook CAPI / Cron Setup Instructions (Exact Video Feature 03:46) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600" />
          <span>Facebook CAPI / Cron Setup</span>
        </h3>
        <p className="text-xs text-stone-500">
          To ensure Facebook Conversions API (CAPI) functions properly, server event queue runs automatically with high-availability deduplication:
        </p>
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 font-mono text-xs text-purple-900 overflow-x-auto">
          <span className="truncate mr-4">
            * * * * * curl -s {window.location.origin}/api/tracking/facebook-capi/queue-worker &gt; /dev/null 2&gt;&amp;1
          </span>
          <button
            onClick={() => handleCopy(`* * * * * curl -s ${window.location.origin}/api/tracking/facebook-capi/queue-worker > /dev/null 2>&1`, 'cron')}
            className="shrink-0 p-1.5 rounded-lg bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
            title="কমান্ড কপি করুন"
          >
            {copiedKey === 'cron' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Product Feed (Facebook Catalog & Google Merchant Center - Exact Video Feature 03:48) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Product Feed (Facebook Catalog & Google Merchant Center XML)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Your live XML product feed is available at the following URL for dynamic retargeting ads and Meta Commerce Manager:
          </p>
        </div>

        {/* XML Feed Box 1 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Google & Facebook General XML Feed:
          </span>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs">
            <input
              type="text"
              readOnly
              value={productFeedUrl}
              className="flex-1 bg-transparent text-stone-700 focus:outline-hidden"
            />
            <button
              onClick={() => handleCopy(productFeedUrl, 'feed1')}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedKey === 'feed1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <a
              href="/api/feed/products.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open</span>
            </a>
          </div>
        </div>

        {/* XML Feed Box 2 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            Direct Facebook Catalog Alias:
          </span>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs">
            <input
              type="text"
              readOnly
              value={fbCatalogFeedUrl}
              className="flex-1 bg-transparent text-stone-700 focus:outline-hidden"
            />
            <button
              onClick={() => handleCopy(fbCatalogFeedUrl, 'feed2')}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedKey === 'feed2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <a
              href="/api/feed/facebook-catalog.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Settings Form (Pixel ID, Access Token, GTM ID) */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
          পিক্সেল ও ট্যাগ ম্যানেজার কনফিগারেশন
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Facebook Pixel ID
            </label>
            <input
              id="pixel-id-input"
              type="text"
              value={settings.pixelId}
              onChange={(e) => setSettings({ ...settings, pixelId: e.target.value })}
              placeholder="e.g. 1151443685416429"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Google Tag Manager (GTM) Container ID
            </label>
            <input
              type="text"
              value={settings.gtmId}
              onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
              placeholder="e.g. GTM-XXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Facebook Conversions API (CAPI) Access Token
            </label>
            <input
              type="text"
              value={settings.capiToken}
              onChange={(e) => setSettings({ ...settings, capiToken: e.target.value })}
              placeholder="EAAG..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Facebook Test Event Code (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={settings.testCode}
              onChange={(e) => setSettings({ ...settings, testCode: e.target.value })}
              placeholder="e.g. TEST12345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ট্র্যাকিং স্ট্যাটাস
            </label>
            <select
              value={settings.status}
              onChange={(e) => setSettings({ ...settings, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="active">Active (চালু)</option>
              <option value="inactive">Inactive (বন্ধ)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={async () => {
              try {
                showToast('টেস্ট ইভেন্ট Meta CAPI-তে পাঠানো হচ্ছে...');
                const res = await fetch('/api/tracking/meta-capi', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventName: 'PageView',
                    eventId: `test_${Date.now()}`,
                    eventSourceUrl: window.location.href,
                    userData: { phone: '01890123456', email: 'test@bostroshoily.com' },
                    customData: { currency: 'BDT', value: 100 },
                  }),
                });
                const d = await res.json();
                if (d.success) {
                  showToast(`সফল! CAPI রেসপন্স স্ট্যাটাস: ${d.status}`);
                  // reload event log
                  adminFetch('/api/admin/tracking/events')
                    .then((r) => r.json())
                    .then((ev) => {
                      if (ev.events) setRecentEvents(ev.events);
                    });
                } else {
                  showToast(`ব্যর্থ: ${d.error}`);
                }
              } catch {
                showToast('টেস্ট ইভেন্ট পাঠাতে সমস্যা হয়েছে');
              }
            }}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>লাইভ টেস্ট ইভেন্ট পাঠান (Test CAPI)</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>

      {/* Live CAPI & Pixel Event Log */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-stone-900">
              লাইভ ট্র্যাকিং ইভেন্ট লগ (Meta Pixel + CAPI Activity Log)
            </h3>
          </div>
          <button
            onClick={() => {
              adminFetch('/api/admin/tracking/events')
                .then((r) => r.json())
                .then((ev) => {
                  if (ev.events) {
                    setRecentEvents(ev.events);
                    showToast('ইভেন্ট লগ রিফ্রেশ হয়েছে');
                  }
                });
            }}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <p className="text-xs text-stone-500 py-3 text-center">এখনও কোনো ট্র্যাকিং ইভেন্ট লগ নেই। উপরে 'টেস্ট ইভেন্ট পাঠান' বাটনে ক্লিক করুন।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">ইভেন্টের নাম</th>
                  <th className="py-2.5 px-3">ইভেন্ট আইডি (Deduplication)</th>
                  <th className="py-2.5 px-3">উৎস</th>
                  <th className="py-2.5 px-3">মূল্য</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentEvents.slice(0, 8).map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-bold text-stone-900">{evt.event_name}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{evt.event_id}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {evt.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-800">৳{evt.value || 0}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === 'sent_to_meta' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 text-[11px]">{new Date(evt.created_at).toLocaleTimeString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
