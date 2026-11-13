import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle, UserCheck, Send } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface ComplaintItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_id: string | null;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'new' | 'in_review' | 'waiting_for_customer' | 'resolved' | 'closed';
  assigned_admin: string | null;
  admin_reply: string | null;
  internal_note: string | null;
  created_at: string;
}

export const ComplaintsModule: React.FC = () => {
  const { showToast } = useShop();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  // Reply form states
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [assignee, setAssignee] = useState('Nasrin Sultana');
  const [newStatus, setNewStatus] = useState<string>('in_review');

  // Fetch complaints from server
  const fetchComplaints = async () => {
    try {
      const res = await adminFetch('/api/admin/complaints');
      const data = await res.json();
      if (data.success && data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSelectComplaint = (cmp: ComplaintItem) => {
    setSelectedComplaint(cmp);
    setReplyText(cmp.admin_reply || '');
    setInternalNoteText(cmp.internal_note || '');
    setAssignee(cmp.assigned_admin || 'Nasrin Sultana');
    setNewStatus(cmp.status);
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await adminFetch(`/api/admin/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          assignedAdmin: assignee,
          adminReply: replyText,
          internalNote: internalNoteText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`অভিযোগ #${selectedComplaint.id} সমাধান ও রিপ্লাই সংরক্ষিত হয়েছে!`);
        fetchComplaints();
        setSelectedComplaint(null);
      }
    } catch (err) {
      showToast('অভিযোগ আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_phone.includes(searchQuery) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <MessageSquareWarning className="w-5 h-5 text-rose-700" />
            <h1>কাস্টমার অভিযোগ ও সমস্যা সমাধান (Customer Complaints)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            সাইজ এক্সচেঞ্জ, ত্রুটিপূর্ণ পণ্য, ডেলিভারি বিলম্ব সংক্রান্ত সাপোর্ট টিকিট ও তদন্ত।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আইডি, নাম বা মোবাইল দিয়ে খুঁজুন..."
              className="pl-9 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800 w-56"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-medium"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="new">নতুন (New)</option>
            <option value="in_review">তদন্তাধীন (In Review)</option>
            <option value="resolved">সমাধান সম্পন্ন (Resolved)</option>
            <option value="closed">বন্ধ (Closed)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-stone-200 text-stone-400 text-xs">
              কোনো অভিযোগ পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map((cmp) => (
              <div
                key={cmp.id}
                onClick={() => handleSelectComplaint(cmp)}
                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedComplaint?.id === cmp.id
                    ? 'border-rose-600 ring-1 ring-rose-600 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">{cmp.id}</span>
                      {cmp.order_id && (
                        <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded font-mono">
                          অর্ডার: {cmp.order_id}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        cmp.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                        cmp.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {cmp.priority}
                      </span>
                    </div>
                    <h2 className="font-bold text-stone-800 text-xs mt-1.5">{cmp.subject}</h2>
                    <p className="text-stone-600 text-xs line-clamp-2 mt-1">{cmp.message}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      cmp.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      cmp.status === 'in_review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      cmp.status === 'new' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {cmp.status}
                    </span>
                    <div className="text-[10px] text-stone-400 mt-1">
                      {new Date(cmp.created_at).toLocaleDateString('bn-BD')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 mt-3 border-t border-stone-100">
                  <span>কাস্টমার: {cmp.customer_name} ({cmp.customer_phone})</span>
                  <span>দায়িত্বপ্রাপ্ত: {cmp.assigned_admin || 'অনির্ধারিত'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail & Action Pane */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 h-fit space-y-4">
          {selectedComplaint ? (
            <form onSubmit={handleSaveResolution} className="space-y-3.5 text-xs">
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-900">{selectedComplaint.id}</span>
                  <span className="text-[11px] text-stone-400">{selectedComplaint.created_at}</span>
                </div>
                <h2 className="font-bold text-stone-900 text-sm mt-1">{selectedComplaint.subject}</h2>
                <div className="text-stone-500 text-[11px] mt-0.5">
                  {selectedComplaint.customer_name} • {selectedComplaint.customer_phone}
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <span className="font-semibold text-stone-700 block mb-1">কাস্টমারের মূল অভিযোগ:</span>
                <p className="text-stone-700 text-xs leading-relaxed">{selectedComplaint.message}</p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">স্ট্যাটাস পরিবর্তন</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none bg-white font-medium"
                >
                  <option value="new">নতুন (New)</option>
                  <option value="in_review">তদন্তাধীন (In Review)</option>
                  <option value="waiting_for_customer">কাস্টমারের উত্তরের অপেক্ষায়</option>
                  <option value="resolved">সমাধান সম্পন্ন (Resolved)</option>
                  <option value="closed">বন্ধ (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">দায়িত্বপ্রাপ্ত এডমিন</label>
                <input
                  type="text"
                  value={assignee || ''}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">কাস্টমারকে রিপ্লাই / সমাধান বার্তা</label>
                <textarea
                  rows={3}
                  value={replyText || ''}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="কাস্টমারের জন্য সমাধান বা এক্সচেঞ্জ নির্দেশনা লিখুন..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">অভ্যন্তরীণ নোট (শুধুমাত্র এডমিনদের জন্য)</label>
                <textarea
                  rows={2}
                  value={internalNoteText || ''}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  placeholder="রাইডারের নাম, স্টক সমন্বয় বা অভ্যন্তরীণ তদন্ত তথ্য..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800 bg-stone-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ ও আপডেট</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-stone-400 text-xs">
              বাম পাশের তালিকা থেকে যেকোনো একটি অভিযোগে ক্লিক করে বিস্তারিত সমাধান ও রিপ্লাই দিন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
