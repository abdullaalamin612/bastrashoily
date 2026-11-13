import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  assigned_admin: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
}

export const TasksModule: React.FC = () => {
  const { showToast, currentAdmin, adminUsers } = useShop();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedAdmin: currentAdmin?.name || 'Admin',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    dueDate: '',
  });

  const fetchTasks = async () => {
    try {
      const res = await adminFetch('/api/admin/tasks');
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) {
      showToast('টাস্কের শিরোনাম আবশ্যক');
      return;
    }

    try {
      const res = await adminFetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          createdBy: currentAdmin?.name || 'Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('নতুন টাস্ক সফলভাবে তৈরি হয়েছে!');
        setIsModalOpen(false);
        fetchTasks();
        setNewTask({
          title: '',
          description: '',
          assignedAdmin: currentAdmin?.name || 'Admin',
          priority: 'normal',
          dueDate: '',
        });
      }
    } catch (err) {
      showToast('টাস্ক তৈরিতে সমস্যা হয়েছে।');
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    try {
      const res = await adminFetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: nextStatus as any } : t));
        showToast(`টাস্ক #${taskId} '${nextStatus === 'completed' ? 'সম্পন্ন' : 'চলমান'}' করা হয়েছে।`);
      }
    } catch (err) {
      showToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
            <CheckSquare className="w-5 h-5 text-indigo-700" />
            <h1>অভ্যন্তরীণ টাস্ক ও ওয়ার্কফ্লো ম্যানেজমেন্ট (Staff Tasks)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            তাঁত পল্লী স্টক প্রকিউরমেন্ট, ফটোশুট, কুরিয়ার সমন্বয় ও ওয়েবসাইট মেইন্টেন্যান্স টাস্ক।
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন টাস্ক বরাদ্দ করুন</span>
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((tsk) => {
          const isCompleted = tsk.status === 'completed';
          return (
            <div
              key={tsk.id}
              className={`bg-white p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isCompleted ? 'border-stone-200 bg-stone-50/60 opacity-80' : 'border-stone-200 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-stone-400">{tsk.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    tsk.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                    tsk.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {tsk.priority}
                  </span>
                </div>

                <h3 className={`font-bold text-xs ${isCompleted ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                  {tsk.title}
                </h3>

                <p className="text-stone-600 text-xs line-clamp-2">{tsk.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>দায়িত্বপ্রাপ্ত: <strong className="text-stone-800">{tsk.assigned_admin}</strong></span>
                  {tsk.due_date && (
                    <span className="flex items-center gap-1 text-stone-600 font-mono">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {tsk.due_date}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    tsk.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {tsk.status}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(tsk.id, tsk.status)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      isCompleted ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isCompleted ? 'পুনরায় সক্রিয় করুন' : 'সম্পন্ন চিহ্নিত করুন'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">নতুন টাস্ক বরাদ্দ করুন</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">টাস্কের নাম / শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="যেমন: নতুন লুঙ্গির কোয়ালিটি ইনস্পেকশন সম্পন্ন করা"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={3}
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="টাস্কের সুনির্দিষ্ট করণীয় পদক্ষেপসমূহ..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">দায়িত্বপ্রাপ্ত ব্যক্তি</label>
                  <select
                    value={newTask.assignedAdmin || currentAdmin?.name || 'Admin'}
                    onChange={(e) => setNewTask({ ...newTask, assignedAdmin: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none bg-white font-medium"
                  >
                    {adminUsers && adminUsers.length > 0 ? (
                      adminUsers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={currentAdmin?.name || 'Admin'}>{currentAdmin?.name || 'Admin'}</option>
                        <option value="Rafiqul Islam">Rafiqul Islam (Product)</option>
                        <option value="Nasrin Sultana">Nasrin Sultana (Orders)</option>
                        <option value="Kamrul Hasan">Kamrul Hasan (Content)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">অগ্রাধিকার (Priority)</label>
                  <select
                    value={newTask.priority || 'normal'}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none bg-white font-medium"
                  >
                    <option value="low">কম (Low)</option>
                    <option value="normal">সাধারণ (Normal)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="urgent">জরুরি (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">ডেডলাইন / সময়সীমা</label>
                <input
                  type="date"
                  value={newTask.dueDate || ''}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs outline-none focus:border-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-lg font-semibold text-xs cursor-pointer"
                >
                  টাস্ক তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
