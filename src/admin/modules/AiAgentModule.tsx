import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Plus, Check, MessageSquare, BookOpen, Settings, Power, RefreshCw, Trash2, Edit3 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface AiAgentModuleProps {
  initialTab?: 'overview' | 'settings' | 'knowledge' | 'chat';
}

export const AiAgentModule: React.FC<AiAgentModuleProps> = ({ initialTab = 'overview' }) => {
  const { showToast } = useShop();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'settings' | 'knowledge'>(
    initialTab === 'settings' ? 'settings' : initialTab === 'knowledge' ? 'knowledge' : 'overview'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab === 'settings' ? 'settings' : initialTab === 'knowledge' ? 'knowledge' : 'overview');
    }
  }, [initialTab]);
  const [settings, setSettings] = useState<any>({
    enabled: 1,
    agent_name: 'বস্ত্র শৈলী (BOSTROSHOILY) এআই সহকারী',
    welcome_message: 'আসসালামু আলাইকুম! বস্ত্র শৈলী (BOSTROSHOILY)-তে আপনাকে স্বাগতম। আপনি কি লুঙ্গি, পাঞ্জাবি, জামদানি শাড়ি কিংবা সাইজ সম্পর্কে জানতে চাচ্ছেন?',
    language: 'bn',
    response_style: 'friendly_expert',
    business_hours: 'সকাল ৯টা থেকে রাত ১১টা (সপ্তাহে ৭ দিন)',
  });
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({
    category: 'faq',
    title: '',
    content: '',
  });
  const [editingKnowledge, setEditingKnowledge] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Simulator
  const [testMessage, setTestMessage] = useState('');
  const [testReplies, setTestReplies] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'আসসালামু আলাইকুম! আমি বস্ত্র শৈলী (BOSTROSHOILY)-এর ভার্চুয়াল ফ্যাশন অ্যাসিস্ট্যান্ট। আজ আপনাকে কিভাবে সহায়তা করতে পারি?' }
  ]);
  const [simulating, setSimulating] = useState(false);

  const fetchAIData = async () => {
    try {
      const [resSet, resKno] = await Promise.all([
        adminFetch('/api/admin/ai/settings'),
        adminFetch('/api/admin/ai/knowledge'),
      ]);
      const dataSet = await resSet.json();
      const dataKno = await resKno.json();
      if (dataSet.success && dataSet.settings) setSettings(dataSet.settings);
      if (dataKno.success && dataKno.knowledge) setKnowledgeList(dataKno.knowledge);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAIData();
  }, []);

  const handleToggleEnable = async () => {
    const updated = { ...settings, enabled: settings.enabled ? 0 : 1 };
    setSettings(updated);
    try {
      await adminFetch('/api/admin/ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: updated.enabled }),
      });
      showToast(updated.enabled ? 'এআই এজেন্ট সক্রিয় করা হয়েছে' : 'এআই এজেন্ট সাময়িক বন্ধ করা হয়েছে');
    } catch (err) {
      showToast('সেটিংস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('এআই সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      }
    } catch (err) {
      showToast('সেটিংস আপডেট ব্যর্থ');
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowledge.title || !newKnowledge.content) {
      showToast('শিরোনাম ও বিবরণ উভয়ই আবশ্যক');
      return;
    }
    try {
      const res = await adminFetch('/api/admin/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge),
      });
      const data = await res.json();
      if (data.success) {
        showToast('নলেজ বেজে নতুন তথ্য সফলভাবে যুক্ত হয়েছে!');
        setIsKnowledgeModalOpen(false);
        setNewKnowledge({ category: 'faq', title: '', content: '' });
        fetchAIData();
      }
    } catch (err) {
      showToast('নলেজ বেজ তৈরিতে ত্রুটি');
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই নলেজ আইটেমটি মুছে ফেলতে চান?')) return;
    try {
      const res = await adminFetch(`/api/admin/ai/knowledge/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('নলেজ আইটেম মুছে ফেলা হয়েছে');
        fetchAIData();
      }
    } catch {
      showToast('নলেজ আইটেম মুছে ফেলতে ব্যর্থ');
    }
  };

  const handleOpenEdit = (k: any) => {
    setEditingKnowledge({ ...k });
    setIsEditModalOpen(true);
  };

  const handleUpdateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKnowledge || !editingKnowledge.title || !editingKnowledge.content) {
      showToast('শিরোনাম ও বিবরণ উভয়ই আবশ্যক');
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/ai/knowledge/${editingKnowledge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editingKnowledge.category,
          title: editingKnowledge.title.trim(),
          content: editingKnowledge.content.trim(),
          active: editingKnowledge.active !== undefined ? editingKnowledge.active : 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('নলেজ আইটেম সফলভাবে আপডেট হয়েছে!');
        setIsEditModalOpen(false);
        setEditingKnowledge(null);
        fetchAIData();
      } else {
        showToast(data.error || 'আপডেট করতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার এরর: নলেজ আইটেম আপডেট করা যায়নি');
    }
  };

  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    const userText = testMessage.trim();
    const updatedHistory: Array<{ role: 'user' | 'bot'; text: string }> = [...testReplies, { role: 'user', text: userText }];
    setTestReplies(updatedHistory);
    setTestMessage('');
    setSimulating(true);

    try {
      const historyPayload = testReplies.map((r) => ({
        sender: (r.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
        text: r.text,
      }));

      const res = await adminFetch('/api/admin/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });
      const data = await res.json();
      setTestReplies(prev => [
        ...prev,
        {
          role: 'bot',
          text: data.reply || 'দুঃখিত, বর্তমানে তথ্য প্রসেস করতে বিলম্ব হচ্ছে।',
          debugInfo: data.debugInfo,
        }
      ]);
    } catch (err) {
      setTestReplies(prev => [
        ...prev,
        { role: 'bot', text: 'আসসালামু আলাইকুম! কোনো প্রশ্ন থাকলে আমাকে জানাতে পারেন।' }
      ]);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <Bot className="w-5 h-5 text-amber-700" />
            <h1>এআই অ্যাসিস্ট্যান্ট ও শপিং কনসালট্যান্ট (AI Customer Agent)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Gemini 2.5 Flash ও সার্ভার-সাইড নলেজ বেজ চালিত ২৪/৭ কাস্টমার ফ্যাশন ও সাইজিং সহকারী।
          </p>
        </div>

        <button
          onClick={handleToggleEnable}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            settings.enabled
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{settings.enabled ? 'এজেন্ট সক্রিয় (Online)' : 'এজেন্ট বন্ধ (Offline)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white px-5 rounded-t-xl gap-6">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'overview' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          লাইভ টেস্ট ও সিমুলেটর
        </button>
        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'knowledge' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          নলেজ বেজ ({knowledgeList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'settings' ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ব্যক্তিত্ব ও বাচনভঙ্গি সেটিংস
        </button>
      </div>

      {/* SubTab 1: Live Simulator */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-b-xl border border-stone-200 p-5 flex flex-col h-[480px]">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {testReplies.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-amber-800 text-white flex items-center justify-center shrink-0 text-xs">
                      ব
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-md ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-white rounded-br-none'
                        : 'bg-stone-100 text-stone-800 rounded-bl-none leading-relaxed'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {simulating && (
                <div className="text-stone-400 text-xs italic">এআই সহকারী ভাবছে...</div>
              )}
            </div>

            <form onSubmit={handleTestChat} className="pt-3 border-t border-stone-100 flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="যেমন: আমাকে কি রয়্যাল ব্লু পাঞ্জাবি মানাবে? ডেলিভারি চার্জ কত?"
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
              />
              <button
                type="submit"
                disabled={simulating}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                পাঠান
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 h-fit space-y-3">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">এআই হেলথ ও মডেল স্ট্যাটাস</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">মডেল ইঞ্জিন:</span>
                <span className="font-semibold text-stone-800 font-mono">Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">ভাষা:</span>
                <span className="font-semibold text-stone-800">মার্জিত ও বন্ধুসুলভ বাংলা</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">নলেজ রেফারেন্স:</span>
                <span className="font-semibold text-emerald-700">স্বয়ংক্রিয় সংযুক্ত ({knowledgeList.length}টি আর্টিকেলের সাথে)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Knowledge Base */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন নলেজ যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeList.map((k) => (
              <div key={k.id} className="bg-white p-5 rounded-xl border border-stone-200 space-y-2 relative group">
                <div className="flex items-start justify-between">
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {k.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono">{k.id}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(k)}
                      className="p-1 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title="সম্পাদনা করুন (Edit)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKnowledge(k.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-stone-900 text-xs">{k.title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed">{k.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 3: Settings */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-stone-200 max-w-2xl space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">এজেন্টের নাম</label>
            <input
              type="text"
              value={settings?.agent_name || ''}
              onChange={(e) => setSettings({ ...settings, agent_name: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">স্বাগতম বার্তা (Welcome Message)</label>
            <textarea
              rows={3}
              value={settings?.welcome_message || ''}
              onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">ব্যবসায়িক সময়সূচি</label>
            <input
              type="text"
              value={settings?.business_hours || ''}
              onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">কাস্টম নির্দেশাবলী ও স্টোর পলিসি (Custom Instructions &amp; Store Policies)</label>
            <textarea
              rows={4}
              value={settings?.business_description || ''}
              onChange={(e) => setSettings({ ...settings, business_description: e.target.value })}
              placeholder="যেমন: আমাদের এক্সচেঞ্জ পলিসি ৭ দিন। সিরাজগঞ্জ তাঁতের বিশেষ যত্ন নিয়ে ধোয়ার পরামর্শ দিন..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              এখানে লেখা নীতি ও নির্দেশাবলী এআই সহকারী গ্রাহককে উত্তর দেওয়ার সময় স্বয়ংক্রিয়ভাবে ব্যবহার করবে।
            </p>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-xs cursor-pointer"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      )}

      {/* Add Knowledge Modal */}
      {isKnowledgeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">এআই নলেজ বেজে তথ্য যুক্ত করুন</h2>
              <button onClick={() => setIsKnowledgeModalOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={newKnowledge?.category || 'faq'}
                  onChange={(e) => setNewKnowledge({ ...newKnowledge, category: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none bg-white font-medium"
                >
                  <option value="faq">সাধারণ প্রশ্নোত্তর (FAQ)</option>
                  <option value="delivery">ডেলিভারি সংক্রান্ত</option>
                  <option value="payment">পেমেন্ট সংক্রান্ত</option>
                  <option value="return">রিটার্ন ও এক্সচেঞ্জ</option>
                  <option value="product">কাপড়ের কোয়ালিটি ও সাইজিং</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">বিষয় / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newKnowledge?.title || ''}
                  onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                  placeholder="যেমন: লুঙ্গির কাপড় কীভাবে ধোবেন?"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">সঠিক উত্তর / বিবরণ *</label>
                <textarea
                  rows={4}
                  required
                  value={newKnowledge?.content || ''}
                  onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                  placeholder="এআই সহকারী কাস্টমারকে এই তথ্য অনুযায়ী উত্তর দেবে..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Knowledge Modal */}
      {isEditModalOpen && editingKnowledge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-stone-900 text-base">নলেজ বেজ সম্পাদনা করুন (Edit Knowledge)</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingKnowledge(null);
                }}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateKnowledge} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={editingKnowledge?.category || 'faq'}
                  onChange={(e) => setEditingKnowledge({ ...editingKnowledge, category: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none bg-white font-medium"
                >
                  <option value="faq">সাধারণ প্রশ্নোত্তর (FAQ)</option>
                  <option value="delivery">ডেলিভারি সংক্রান্ত</option>
                  <option value="payment">পেমেন্ট সংক্রান্ত</option>
                  <option value="return">রিটার্ন ও এক্সচেঞ্জ</option>
                  <option value="product">কাপড়ের কোয়ালিটি ও সাইজিং</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">বিষয় / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editingKnowledge?.title || ''}
                  onChange={(e) => setEditingKnowledge({ ...editingKnowledge, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">সঠিক উত্তর / বিবরণ *</label>
                <textarea
                  rows={5}
                  required
                  value={editingKnowledge?.content || ''}
                  onChange={(e) => setEditingKnowledge({ ...editingKnowledge, content: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="active_knowledge_chk"
                  checked={Boolean(editingKnowledge.active !== 0 && editingKnowledge.active !== false)}
                  onChange={(e) => setEditingKnowledge({ ...editingKnowledge, active: e.target.checked ? 1 : 0 })}
                  className="rounded text-amber-600 cursor-pointer"
                />
                <label htmlFor="active_knowledge_chk" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  এই নলেজ আইটেমটি সক্রিয় রাখুন (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingKnowledge(null);
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-sm"
                >
                  আপডেট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
