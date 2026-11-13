import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { adminFetch } from '../adminApi';
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  User,
  Shield,
  Clock,
  Activity,
  UserX,
  Check,
  Briefcase,
  History,
} from 'lucide-react';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  designation?: string;
  role: string;
  roles?: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  last_login?: string;
  loginCount?: number;
  created_at?: string;
}

export const PRESET_ROLES = [
  { id: 'manager', name: 'Manager', banglaName: 'ম্যানেজার', description: 'দৈনন্দিন স্টোর ও স্টাফ কার্যক্রম পরিচালনা' },
  { id: 'product_manager', name: 'Product Manager', banglaName: 'প্রোডাক্ট ম্যানেজার', description: 'পণ্য, সাইজ চার্ট, ক্যাটাগরি ও ক্যাটালগ নিয়ন্ত্রণ' },
  { id: 'order_manager', name: 'Order Manager', banglaName: 'অর্ডার ম্যানেজার', description: 'অর্ডার যাচাই, অনুমোদন ও কুরিয়ার পার্সেল প্রসেসিং' },
  { id: 'accountant', name: 'Accountant', banglaName: 'হিসাবরক্ষক (Accountant)', description: 'আয়-ব্যয়, পেমেন্ট ও লাভ-ক্ষতির আর্থিক হিসাব' },
  { id: 'inventory_manager', name: 'Inventory Manager', banglaName: 'ইনভেন্টরি ম্যানেজার', description: 'স্টক হিসাব, সরবরাহকারী ও মালামাল রিসিভ' },
  { id: 'customer_support', name: 'Customer Support', banglaName: 'কাস্টমার সাপোর্ট', description: 'গ্রাহক বার্তা, অভিযোগ ও অর্ডার সহায়তা' },
  { id: 'marketing_manager', name: 'Marketing Manager', banglaName: 'মার্কেটিং ম্যানেজার', description: 'ব্যানার, কুপন, কম্বো অফার ও ক্যাম্পেইন' },
  { id: 'super_admin', name: 'Super Admin', banglaName: 'সুপার এডমিন (পূর্ণ ক্ষমতা)', description: 'সিস্টেমের সমস্ত নিয়ন্ত্রণ ও নিরাপত্তা সেটিংস' },
];

export const AVAILABLE_PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: 'products.view', label: 'প্রোডাক্ট দেখা (View Products)', group: 'ক্যাটালগ' },
  { key: 'products.create', label: 'নতুন প্রোডাক্ট তৈরি (Add Product)', group: 'ক্যাটালগ' },
  { key: 'products.edit', label: 'প্রোডাক্ট ও দাম আপডেট (Edit Product)', group: 'ক্যাটালগ' },
  { key: 'products.archive', label: 'প্রোডাক্ট মোছা/আর্কাইভ (Archive)', group: 'ক্যাটালগ' },
  { key: 'inventory.view', label: 'স্টক ইনভেন্টরি পর্যবেক্ষণ (View Stock)', group: 'ইনভেন্টরি' },
  { key: 'inventory.adjust', label: 'স্টক বাড়ানো/কমানো (Stock Adjust)', group: 'ইনভেন্টরি' },
  { key: 'orders.view', label: 'গ্রাহকের অর্ডার দেখা (View Orders)', group: 'অর্ডার' },
  { key: 'orders.edit', label: 'অর্ডার কনফার্ম ও স্ট্যাটাস বদল (Update Orders)', group: 'অর্ডার' },
  { key: 'orders.cancel', label: 'অর্ডার বাতিলকরণ (Cancel Orders)', group: 'অর্ডার' },
  { key: 'customers.view', label: 'গ্রাহক তথ্য ও ফোন দেখা (Customers)', group: 'গ্রাহক' },
  { key: 'payments.manage', label: 'পেমেন্ট ও ট্রানজেকশন কন্ট্রোল', group: 'অর্থ ও পেমেন্ট' },
  { key: 'reports.view', label: 'বিক্রয় ও লাভ-ক্ষতির রিপোর্ট দেখা', group: 'রিপোর্ট' },
  { key: 'settings.manage', label: 'দোকান ও ডেলিভারি সেটিংস বদল', group: 'সেটিংস' },
  { key: 'admins.manage', label: 'স্টাফ ও পারমিশন কন্ট্রোল (RBAC)', group: 'নিরাপত্তা' },
];

export const UserAccessModule: React.FC = () => {
  const { showToast } = useShop();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formPrimaryRole, setFormPrimaryRole] = useState('manager');
  const [formSelectedRoles, setFormSelectedRoles] = useState<string[]>(['manager']);
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'orders.view',
    'orders.edit',
    'products.view',
  ]);

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetTargetUser, setResetTargetUser] = useState<StaffUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Activity Log Modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [activityTargetUser, setActivityTargetUser] = useState<StaffUser | null>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/staff');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.staff)) {
        setUsers(data.staff);
      }
    } catch (err) {
      console.warn('Failed to load admin staff users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        u.designation?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormDesignation('');
    setFormPrimaryRole('manager');
    setFormSelectedRoles(['manager']);
    setFormPassword('');
    setFormStatus('active');
    setSelectedPermissions(['orders.view', 'orders.edit', 'products.view']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username || '');
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormDesignation(user.designation || '');
    setFormPrimaryRole(user.role);
    setFormSelectedRoles(user.roles && user.roles.length > 0 ? user.roles : [user.role]);
    setFormPassword('');
    setFormStatus(user.status || 'active');
    setSelectedPermissions(
      user.permissions?.includes('all')
        ? AVAILABLE_PERMISSIONS.map((p) => p.key)
        : user.permissions || []
    );
    setIsModalOpen(true);
  };

  const toggleRoleSelection = (roleId: string) => {
    if (formSelectedRoles.includes(roleId)) {
      if (formSelectedRoles.length <= 1) {
        showToast('অন্তত একটি রোল নির্বাচন থাকতে হবে');
        return;
      }
      const updated = formSelectedRoles.filter((r) => r !== roleId);
      setFormSelectedRoles(updated);
      if (formPrimaryRole === roleId) setFormPrimaryRole(updated[0]);
    } else {
      const updated = [...formSelectedRoles, roleId];
      setFormSelectedRoles(updated);
      if (roleId === 'super_admin') {
        setSelectedPermissions(['all']);
      }
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAllPerms = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.key));
  };

  const handleDeselectAllPerms = () => {
    setSelectedPermissions([]);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('স্টাফের নাম প্রদান করুন');
      return;
    }
    if (!formUsername.trim()) {
      showToast('ইউজারনেম (Username) প্রদান করুন');
      return;
    }

    const isSuper = formSelectedRoles.includes('super_admin') || formPrimaryRole === 'super_admin';
    const perms = isSuper ? ['all'] : selectedPermissions;
    const cleanUsername = formUsername.trim().toLowerCase();
    const cleanEmail = (formEmail.trim() || `${cleanUsername}@bostroshoily.com`).toLowerCase();

    try {
      if (editingUser) {
        const bodyPayload: any = {
          name: formName.trim(),
          username: cleanUsername,
          email: cleanEmail,
          phone: formPhone.trim() || null,
          designation: formDesignation.trim() || formPrimaryRole,
          role: formPrimaryRole,
          roles: formSelectedRoles,
          permissions: perms,
          status: formStatus,
        };
        if (formPassword.trim()) {
          bodyPayload.password = formPassword.trim();
        }

        const res = await adminFetch(`/api/admin/staff/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('স্টাফ তথ্য ও রোল পারমিশন সফলভাবে আপডেট হয়েছে');
          setIsModalOpen(false);
          loadUsers();
        } else {
          showToast(data.error || 'আপডেট করতে সমস্যা হয়েছে');
        }
      } else {
        const res = await adminFetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            username: cleanUsername,
            email: cleanEmail,
            phone: formPhone.trim() || null,
            designation: formDesignation.trim() || formPrimaryRole,
            role: formPrimaryRole,
            roles: formSelectedRoles,
            permissions: perms,
            password: formPassword.trim() || undefined,
            status: formStatus,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || 'নতুন স্টাফ একাউন্ট সফলভাবে তৈরি হয়েছে');
          setIsModalOpen(false);
          loadUsers();
        } else {
          showToast(data.error || 'স্টাফ তৈরি করতে ব্যর্থ হয়েছে');
        }
      }
    } catch {
      showToast('সার্ভার যোগাযোগে সমস্যা হয়েছে');
    }
  };

  const handleOpenResetModal = (user: StaffUser) => {
    setResetTargetUser(user);
    setNewPasswordVal('');
    setShowResetPassword(false);
    setIsResetModalOpen(true);
  };

  const handlePerformResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!newPasswordVal.trim() || newPasswordVal.trim().length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setIsResetting(true);
    try {
      const res = await adminFetch(`/api/admin/staff/${resetTargetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordVal.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
        setIsResetModalOpen(false);
      } else {
        showToast(data.error || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার ত্রুটি');
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenActivityModal = async (user: StaffUser) => {
    setActivityTargetUser(user);
    setIsActivityModalOpen(true);
    setIsLoadingActivity(true);
    try {
      const res = await adminFetch(`/api/admin/staff/${user.id}/activity`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginHistory(data.logins || []);
        setAuditHistory(data.audits || []);
      }
    } catch {
      showToast('অ্যাক্টিভিটি হিস্ট্রি লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === 'admin-1') {
      showToast('মূল সুপার এডমিন (Owner) অ্যাকাউন্ট মুছে ফেলা সম্পূর্ণ নিষেধ!');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" অ্যাকাউন্টটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await adminFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('স্টাফ অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে');
        loadUsers();
      } else {
        showToast(data.error || 'মুছে ফেলতে ব্যর্থ');
      }
    } catch {
      showToast('সার্ভার ত্রুটি');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-stone-900">
              স্টাফ অ্যাকাউন্টস ও রোল পারমিশন সিস্টেম (RBAC)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {typeof window !== 'undefined' ? `${window.location.host}/account` : 'bostroshoily.com/account'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            ম্যানেজার, প্রোডাক্ট ম্যানেজার, অর্ডার ম্যানেজার, হিসাবরক্ষক, ইনভেন্টরি, কাস্টমার সাপোর্ট ও মার্কেটিং স্টাফ অ্যাকাউন্ট পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন স্টাফ অ্যাকাউন্ট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">মোট টিম সদস্য</div>
            <div className="text-lg font-black text-stone-900">{users.length} জন</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">সক্রিয় ইউজার (Active)</div>
            <div className="text-lg font-black text-stone-900">
              {users.filter((u) => u.status === 'active').length} জন
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">সুপার এডমিন</div>
            <div className="text-lg font-black text-stone-900">
              {users.filter((u) => u.role === 'super_admin' || u.roles?.includes('super_admin')).length} জন
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400">স্থগিত / ব্লকড</div>
            <div className="text-lg font-black text-stone-900">
              {users.filter((u) => u.status === 'suspended' || u.status === 'inactive').length} জন
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইউজারনেম, নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3.5">স্টাফ বিবরণ ও ইউজারনেম</th>
                <th className="p-3.5">পদবি ও রোল (Roles)</th>
                <th className="p-3.5">যোগাযোগ</th>
                <th className="p-3.5">অনুমোদিত পারমিশন</th>
                <th className="p-3.5 text-center">স্ট্যাটাস</th>
                <th className="p-3.5">লগইন হিস্ট্রি</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    কোনো স্টাফ অ্যাকাউন্ট পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = u.id === 'admin-1';
                  const rolesDisplay = u.roles && u.roles.length > 0 ? u.roles : [u.role];
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {u.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900">{u.name}</div>
                            <div className="text-[11px] font-mono text-amber-700 font-semibold">@{u.username || u.id}</div>
                            {isOwner && (
                              <span className="text-[9px] uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-black border border-purple-200 inline-block mt-0.5">
                                Super Admin (Owner)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-stone-800 font-semibold mb-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-stone-400" />
                          <span>{u.designation || 'Staff'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rolesDisplay.map((r) => {
                            const found = PRESET_ROLES.find((pr) => pr.id === r);
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r === 'super_admin'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : r.includes('manager')
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}
                              >
                                {found ? found.banglaName : r}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3.5 text-stone-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 max-w-xs">
                        {u.permissions?.includes('all') ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                            সম্পূর্ণ সিস্টেম এক্সেস (Full Control)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.permissions?.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono"
                              >
                                {p}
                              </span>
                            ))}
                            {(u.permissions?.length || 0) > 3 && (
                              <span className="text-[10px] text-stone-400 font-bold">
                                +{(u.permissions?.length || 0) - 3} আরও
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {u.status === 'active' ? 'সক্রিয়' : u.status === 'suspended' ? 'স্থগিত (Suspended)' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      <td className="p-3.5 text-stone-500 text-[11px]">
                        <div>{u.last_login || 'সদ্য তৈরি'}</div>
                        <div className="text-[10px] text-stone-400">লগইন সংখ্যা: {u.loginCount || 0} বার</div>
                      </td>

                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenActivityModal(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="লগইন হিস্ট্রি ও অডিট লগ দেখুন"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="পাসওয়ার্ড রিসেট করুন"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="তথ্য ও পারমিশন সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isOwner && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in max-h-[92vh] flex flex-col">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">
                  {editingUser ? `স্টাফ অ্যাকাউন্ট সম্পাদনা: ${editingUser.name}` : 'নতুন স্টাফ অ্যাকাউন্ট তৈরি (Add Staff)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">স্টাফের পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইউজারনেম (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="যেমন: tanvir_order"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 font-mono text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staff@bostroshoily.com"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">পদবি (Designation)</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="যেমন: সিনিয়র অর্ডার ম্যানেজার"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                    <option value="suspended">Suspended (স্থগিত/ব্লকড)</option>
                  </select>
                </div>
              </div>

              {/* Roles Multi-Assignment */}
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-2">
                <label className="block font-bold text-stone-800">রোল নির্বাচন (এক বা একাধিক রোল নির্ধারণ করুন):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_ROLES.map((r) => {
                    const isChecked = formSelectedRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`p-2 rounded-xl text-left border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-500/20 shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <div className="truncate">
                          <div>{r.banglaName}</div>
                          <div className="text-[9px] font-mono font-normal text-stone-500 truncate">{r.name}</div>
                        </div>
                        {isChecked && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {editingUser ? 'পাসওয়ার্ড পরিবর্তন (ফাঁকা রাখলে অপরিবর্তিত থাকবে)' : 'লগইন পাসওয়ার্ড *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? 'অপরিবর্তিত রাখতে ফাঁকা রাখুন' : 'পাসওয়ার্ড লিখুন...'}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-3.5 pr-10 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permissions Checklist */}
              {!formSelectedRoles.includes('super_admin') && (
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">মডিউল পারমিশন কাস্টমাইজেশন:</span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPerms}
                        className="text-[11px] text-amber-600 hover:underline font-bold cursor-pointer"
                      >
                        সব নির্বাচন
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllPerms}
                        className="text-[11px] text-stone-500 hover:underline cursor-pointer"
                      >
                        সব মুছুন
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 cursor-pointer text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-stone-800 font-medium">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">পাসওয়ার্ড রিসেট: {resetTargetUser.name}</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePerformResetPassword} className="p-6 space-y-4 text-xs">
              <p className="text-stone-600">
                ব্যবহারকারী: <strong>{resetTargetUser.name}</strong> (@{resetTargetUser.username || resetTargetUser.id})। নতুন পাসওয়ার্ড সেট করলে পূর্বের সকল সক্রিয় সেশন স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।
              </p>

              <div>
                <label className="block font-bold text-stone-700 mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-3.5 pr-10 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isResetting ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড রিসেট নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity & Login History Modal */}
      {isActivityModalOpen && activityTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in max-h-[90vh] flex flex-col">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm">
                  লগইন ইতিহাস ও অ্যাক্টিভিটি লগ: {activityTargetUser.name}
                </h3>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Login history */}
              <div>
                <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>সাম্প্রতিক লগইন হিস্ট্রি (Login History):</span>
                </h4>
                {isLoadingActivity ? (
                  <p className="text-stone-400 py-3">লোড হচ্ছে...</p>
                ) : loginHistory.length === 0 ? (
                  <p className="text-stone-400 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    কোনো সাম্প্রতিক লগইন রেকর্ড পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">সময় ও তারিখ</th>
                          <th className="p-2.5">আইপি এড্রেস</th>
                          <th className="p-2.5">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono">
                        {loginHistory.map((lh, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="p-2.5 text-stone-700">{lh.timestamp}</td>
                            <td className="p-2.5 text-stone-500">{lh.ip_address || '127.0.0.1'}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  lh.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {lh.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Audit logs */}
              <div>
                <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>সম্পাদিত কর্মকাণ্ড ও অডিট লগ (Audit Activity):</span>
                </h4>
                {isLoadingActivity ? (
                  <p className="text-stone-400 py-3">লোড হচ্ছে...</p>
                ) : auditHistory.length === 0 ? (
                  <p className="text-stone-400 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    কোনো অডিট রেকর্ড পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">অ্যাকশন</th>
                          <th className="p-2.5">টার্গেট</th>
                          <th className="p-2.5">সময়</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {auditHistory.map((ah, idx) => (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="p-2.5 font-bold text-stone-800">{ah.action}</td>
                            <td className="p-2.5 text-stone-600 font-mono text-[10px]">
                              {ah.target_type}: {ah.target_id || '-'}
                            </td>
                            <td className="p-2.5 text-stone-500 font-mono text-[10px]">{ah.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
