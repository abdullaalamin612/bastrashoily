import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: number;
  admin_reply?: string;
  created_at: string;
  product_name?: string;
  product_bangla?: string;
}

export const ReviewsModule: React.FC = () => {
  const { showToast } = useShop();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch {
      showToast('রিভিউ লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(newStatus === 'approved' ? 'রিভিউটি এপ্রুভ করা হয়েছে' : 'রিভিউটি বাতিল করা হয়েছে');
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      } else {
        showToast(data.error || 'আপডেট করতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('এডমিন রিপ্লাই সংরক্ষণ করা হয়েছে');
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, admin_reply: replyText.trim() } : r)));
        setReplyingId(null);
        setReplyText('');
      } else {
        showToast(data.error || 'রিপ্লাই করতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই রিভিউটি ডিলিট করতে চান?')) return;
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('রিভিউ সফলভাবে মুছে ফেলা হয়েছে');
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        showToast(data.error || 'ডিলিট করতে ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_bangla?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-stone-900">
              গ্রাহক রিভিউ মডারেশন (Customer Reviews & Ratings)
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold">
                {pendingCount} টি পেন্ডিং
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            গ্রাহকদের রেটিং, মন্তব্য যাচাই, এপ্রুভাল এবং এডমিন অফিশিয়াল রিপ্লাই নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          রিফ্রেশ
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="গ্রাহকের নাম, মন্তব্য বা পণ্য দিয়ে খুঁজুন..."
            className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {st === 'all' && `সকল (${reviews.length})`}
              {st === 'pending' && `পেন্ডিং (${pendingCount})`}
              {st === 'approved' && `এপ্রুভড (${reviews.filter((r) => r.status === 'approved').length})`}
              {st === 'rejected' && `বাতিল (${reviews.filter((r) => r.status === 'rejected').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            রিভিউ লোড হচ্ছে...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            কোনো রিভিউ পাওয়া যায়নি
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                    {r.customer_name?.[0] || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{r.customer_name}</span>
                      {Boolean(r.is_verified_purchase) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          যাচাইকৃত ক্রেতা
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">
                      পণ্য: <span className="font-medium text-stone-700">{r.product_bangla || r.product_name || 'পণ্য'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs text-stone-800 leading-relaxed bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                "{r.comment}"
              </p>

              {/* Admin Reply Section */}
              {r.admin_reply && (
                <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>বস্ত্র শৈলী (BOSTROSHOILY) অফিশিয়াল রিপ্লাই:</span>
                  </div>
                  <p className="text-stone-700 pl-5">{r.admin_reply}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-stone-400">
                  {new Date(r.created_at).toLocaleDateString('bn-BD')}
                </span>

                <div className="flex items-center gap-2">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'approved')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'rejected')}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setReplyingId(replyingId === r.id ? null : r.id);
                      setReplyText(r.admin_reply || '');
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{r.admin_reply ? 'রিপ্লাই এডিট' : 'রিপ্লাই দিন'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reply Input Form */}
              {replyingId === r.id && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="অফিশিয়াল রিপ্লাই লিখুন (যেমন: ধন্যবাদ আপনার মতামতের জন্য)..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
                  />
                  <button
                    onClick={() => handleSendReply(r.id)}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>পাঠান</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
