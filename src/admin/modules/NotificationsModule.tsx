import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, AlertTriangle, ShoppingCart, MessageSquareWarning, Sparkles, Filter } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: number;
  created_at: string;
}

export const NotificationsModule: React.FC<{ onNavigateToTab?: (tab: any) => void }> = ({ onNavigateToTab }) => {
  const { showToast } = useShop();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchNotifs = async () => {
    try {
      const res = await adminFetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminFetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      showToast('বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত করা হয়েছে।');
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'complaint':
        return <MessageSquareWarning className="w-4 h-4 text-rose-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const filtered = notifications.filter(n => filterType === 'all' || n.type === filterType);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Bell className="w-5 h-5 text-amber-700" />
            <h1>মেসেজ ও নোটিফিকেশন সেন্টার (System Notifications)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            নতুন অর্ডার, লো-স্টক সতর্কতা, কাস্টমার অভিযোগ ও রিফান্ড অ্যালার্ট।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
            {unreadCount}টি অপঠিত নোটিফিকেশন
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-medium"
          >
            <option value="all">সকল ধরন</option>
            <option value="order">নতুন অর্ডার</option>
            <option value="low_stock">লো স্টক অ্যালার্ট</option>
            <option value="complaint">কাস্টমার অভিযোগ</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            কোনো নোটিফিকেশন নেই।
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.is_read ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/40 hover:bg-amber-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  n.is_read ? 'bg-stone-100' : 'bg-white border border-amber-200 shadow-sm'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs ${n.is_read ? 'font-semibold text-stone-800' : 'font-bold text-stone-900'}`}>
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-600 inline-block shrink-0" />
                    )}
                  </div>
                  <p className="text-stone-600 text-xs mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-stone-400 block mt-1 font-mono">
                    {new Date(n.created_at).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100 cursor-pointer"
                    title="পঠিত হিসেবে চিহ্নিত করুন"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
