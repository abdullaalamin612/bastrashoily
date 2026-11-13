import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminApi';
import { useShop } from '../../context/ShopContext';
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  Play,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  Film,
  CheckCircle2,
  X,
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  bangla_title: string;
  video_url: string;
  thumbnail: string;
  category: string;
  duration: string;
  is_featured: number;
  active: number;
  views_count: number;
  created_at: string;
}

export const VideoGalleryModule: React.FC = () => {
  const { showToast } = useShop();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  const [form, setForm] = useState({
    title: '',
    banglaTitle: '',
    videoUrl: '',
    thumbnail: '',
    category: 'craft',
    duration: '২:০০',
    isFeatured: 0,
  });

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/videos');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch {
      showToast('ভিডিও গ্যালারি লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) {
      showToast('শিরোনাম ও ভিডিও লিঙ্ক আবশ্যক');
      return;
    }

    try {
      if (editingVideo) {
        const res = await adminFetch(`/api/admin/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          showToast('ভিডিও সফলভাবে আপডেট হয়েছে');
          setEditingVideo(null);
          setShowAddModal(false);
          fetchVideos();
        } else {
          showToast(data.error || 'আপডেট ব্যর্থ');
        }
      } else {
        const res = await adminFetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          showToast('নতুন ভিডিও যুক্ত হয়েছে');
          setShowAddModal(false);
          setForm({
            title: '',
            banglaTitle: '',
            videoUrl: '',
            thumbnail: '',
            category: 'craft',
            duration: '২:০০',
            isFeatured: 0,
          });
          fetchVideos();
        } else {
          showToast(data.error || 'সংযোজন ব্যর্থ');
        }
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?')) return;
    try {
      const res = await adminFetch(`/api/admin/videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('ভিডিও মুছে ফেলা হয়েছে');
        setVideos((prev) => prev.filter((v) => v.id !== id));
      } else {
        showToast(data.error || 'মুছতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleToggleActive = async (video: VideoItem) => {
    try {
      const newActive = video.active === 1 ? 0 : 1;
      await adminFetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, active: newActive } : v))
      );
      showToast(newActive === 1 ? 'ভিডিও সক্রিয় করা হয়েছে' : 'ভিডিও নিষ্ক্রিয় করা হয়েছে');
    } catch {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ');
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
    const matchSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.bangla_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <Film className="w-6 h-6 text-amber-600" />
            <span>ভিডিও গ্যালারি ও রিলস (Video Gallery &amp; Reels)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            তাঁতশিল্পীদের বুনন ভিডিও, প্রোডাক্ট রিভিউ, সাইজ নির্দেশিকা ও ক্রাফট স্টোরি ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVideos}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingVideo(null);
              setForm({
                title: '',
                banglaTitle: '',
                videoUrl: '',
                thumbnail: '',
                category: 'craft',
                duration: '২:০০',
                isFeatured: 0,
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভিডিও যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'সকল ভিডিও' },
            { id: 'craft', label: 'তাঁত বুনন শৈলী' },
            { id: 'saree', label: 'শাড়ি গাইড' },
            { id: 'lungi', label: 'লুঙ্গি স্পেশাল' },
            { id: 'guide', label: 'ব্যবহার নির্দেশিকা' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ভিডিও খুঁজুন..."
            className="w-full px-3.5 py-1.5 pl-9 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <Video className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">কোনো ভিডিও পাওয়া যায়নি</p>
          <p className="text-xs text-stone-400">উপরে 'নতুন ভিডিও যোগ করুন' বাটনে ক্লিক করে নতুন ভিডিও যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all"
            >
              {/* Thumbnail Container with Play Trigger */}
              <div className="relative aspect-video bg-stone-900 overflow-hidden">
                <img
                  src={
                    video.thumbnail ||
                    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title="ভিডিও প্লে করুন"
                >
                  <Play className="w-5 h-5 fill-stone-900 ml-0.5" />
                </button>

                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {video.duration || '২:১৫'}
                </div>

                {video.is_featured === 1 && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                    ⭐ ফিচার্ড
                  </span>
                )}
              </div>

              {/* Details & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="uppercase font-bold text-amber-700">{video.category}</span>
                    <span>{new Date(video.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{video.bangla_title || video.title}</h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{video.title}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    onClick={() => handleToggleActive(video)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      video.active === 1
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}
                  >
                    {video.active === 1 ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Off)'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingVideo(video);
                        setForm({
                          title: video.title,
                          banglaTitle: video.bangla_title || '',
                          videoUrl: video.video_url,
                          thumbnail: video.thumbnail || '',
                          category: video.category || 'craft',
                          duration: video.duration || '২:০০',
                          isFeatured: video.is_featured || 0,
                        });
                        setShowAddModal(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-600" />
                <span>{editingVideo ? 'ভিডিও এডিট করুন' : 'নতুন ভিডিও যুক্ত করুন'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ভিডিও শিরোনাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Traditional Handloom Lungi Weaving"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">বাংলা শিরোনাম</label>
                <input
                  type="text"
                  value={form.banglaTitle}
                  onChange={(e) => setForm({ ...form, banglaTitle: e.target.value })}
                  placeholder="যেমন: সিরাজগঞ্জের ঐতিহ্যবাহী তাঁতে লুঙ্গি বুনন"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ভিডিও ইউআরএল (YouTube / Vimeo / Reel)</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  >
                    <option value="craft">তাঁত বুনন শৈলী</option>
                    <option value="saree">শাড়ি গাইড</option>
                    <option value="lungi">লুঙ্গি স্পেশাল</option>
                    <option value="guide">ব্যবহার নির্দেশিকা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ভিডিও দৈর্ঘ্য (Duration)</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="২:১৫ মিনিট"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">থাম্বনেইল ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured === 1}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked ? 1 : 0 })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>ফিচার্ড ভিডিও হিসেবে হাইলাইট করুন</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl space-y-2 p-2">
            <div className="flex items-center justify-between text-white p-2">
              <span className="text-xs font-bold truncate">{previewVideo.bangla_title || previewVideo.title}</span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-stone-900 rounded-xl overflow-hidden">
              <iframe
                src={previewVideo.video_url.includes('youtube.com/watch?v=')
                  ? previewVideo.video_url.replace('watch?v=', 'embed/')
                  : previewVideo.video_url}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
