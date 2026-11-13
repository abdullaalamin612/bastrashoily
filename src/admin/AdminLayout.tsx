import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Compass,
  FileText,
  Sliders,
  Settings,
  Store,
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Tag,
  Truck,
  ShieldCheck,
  Building2,
  MessageSquareWarning,
  CheckSquare,
  BarChart3,
  Bot,
  Menu,
  X,
  CreditCard,
  UserCheck,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Code,
  Image,
  BookOpen,
  MessageSquare,
  Sparkles,
  Clock,
  RotateCcw,
  Star,
  Award,
  TrendingUp,
  ShieldAlert,
  Palette,
  Film,
  Gift,
  XCircle,
  Ruler,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  // 1. STORE & ORDERS
  | 'products'
  | 'categories'
  | 'size_charts'
  | 'inventory'
  | 'orders'
  | 'invoice_generator'
  | 'orders_pending'
  | 'orders_confirmed'
  | 'orders_processing'
  | 'orders_shipped'
  | 'orders_delivered'
  | 'orders_cancelled'
  | 'returns_refunds'
  | 'customers'
  | 'reviews'
  // 2. OPERATIONS & B2B
  | 'suppliers_purchases'
  | 'wholesale'
  | 'complaints'
  | 'tasks'
  | 'customer_alerts'
  | 'fraud_security'
  // 3. SALES & FINANCE
  | 'payments'
  | 'reports'
  | 'profit_loss'
  | 'coupons'
  | 'combo_offers'
  // 4. MARKETING
  | 'campaigns'
  | 'timer_offers'
  | 'landing_pages'
  | 'gtm_pixel'
  | 'product_feed'
  // 5. CUSTOMER SERVICE
  | 'customer_messages'
  | 'notifications'
  | 'ai_assistant'
  // 6. CONTENT
  | 'banners'
  | 'cat_banners'
  | 'menus'
  | 'offers'
  | 'store_design'
  | 'cms_pages'
  | 'order_guides'
  | 'videos'
  | 'brand_stories'
  | 'homepage_sections'
  | 'footer_settings'
  // 7. ANALYTICS
  | 'analytics_sales'
  | 'analytics_products'
  | 'analytics_customers'
  | 'analytics_marketing'
  | 'analytics_inventory'
  // 8. SETTINGS & SECURITY
  | 'store_settings'
  | 'payment_settings'
  | 'courier_settings'
  | 'admin_users'
  | 'roles_permissions'
  | 'ai_settings'
  | 'integrations'
  | 'audit_logs'
  | 'backup_database'
  | 'system_settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const {
    navigateToHome,
    orders,
    products,
    currentUser,
    currentAdmin,
    toastMessage,
    adminLogout,
    requireAdminPasswordChange,
    changeAdminPassword,
    updateAdminCredentials,
  } = useShop();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    if (['orders', 'invoice_generator', 'orders_pending', 'orders_confirmed', 'orders_processing', 'orders_shipped', 'orders_delivered', 'orders_cancelled', 'returns_refunds'].includes(activeTab)) return 'orders_sales';
    if (['products', 'categories', 'size_charts', 'reviews'].includes(activeTab)) return 'products_group';
    if (['inventory'].includes(activeTab)) return 'inventory_group';
    if (['suppliers_purchases', 'wholesale'].includes(activeTab)) return 'purchases_suppliers';
    if (['customers', 'customer_messages', 'customer_alerts', 'ai_assistant'].includes(activeTab)) return 'customers_group';
    if (['payments'].includes(activeTab)) return 'finance_accounts';
    if (['profit_loss'].includes(activeTab)) return 'profit_loss_group';
    if (['coupons', 'combo_offers', 'campaigns', 'timer_offers', 'landing_pages', 'gtm_pixel', 'product_feed'].includes(activeTab)) return 'marketing_group';
    if (['reports', 'analytics_sales', 'analytics_products', 'analytics_customers', 'analytics_marketing', 'analytics_inventory'].includes(activeTab)) return 'reports_analytics';
    if (['store_design', 'banners', 'cat_banners', 'menus', 'offers', 'cms_pages', 'order_guides', 'videos', 'brand_stories', 'homepage_sections', 'footer_settings'].includes(activeTab)) return 'storefront_content';
    if (['store_settings', 'payment_settings', 'courier_settings', 'admin_users', 'roles_permissions', 'ai_settings', 'fraud_security', 'complaints', 'tasks', 'notifications', 'integrations', 'audit_logs', 'backup_database', 'system_settings'].includes(activeTab)) return 'settings_security';
    return null;
  });

  // Admin Profile & Credentials Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPhoneInput, setAdminPhoneInput] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    if (isChangePasswordModalOpen) {
      const activeAdmin = currentAdmin || currentUser;
      setAdminUsername(activeAdmin?.username || 'admin');
      setAdminDisplayName(activeAdmin?.name || 'Md. Abdullah (MD. ABDULLAH)');
      setAdminEmailInput(activeAdmin?.email || 'bastrashoily@gmail.com');
      setAdminPhoneInput(activeAdmin?.phone || '01864528488');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  }, [isChangePasswordModalOpen, currentAdmin, currentUser]);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!adminUsername.trim() || !adminEmailInput.trim()) {
      setPasswordError('ইউজারনেম এবং ইমেইল পূরণ করা আবশ্যক');
      return;
    }

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        setPasswordError('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না');
        return;
      }
    }

    setIsSubmittingPassword(true);
    try {
      const res = await updateAdminCredentials({
        username: adminUsername.trim(),
        name: adminDisplayName.trim(),
        email: adminEmailInput.trim(),
        phone: adminPhoneInput.trim(),
        currentPassword: oldPassword ? oldPassword.trim() : undefined,
        newPassword: newPassword && newPassword.trim().length > 0 ? newPassword.trim() : undefined,
      });

      if (res && res.success) {
        setPasswordSuccess(res.message || 'এডমিন ইউজারনেম ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1200);
      } else {
        setPasswordError(res?.message || 'ক্রেডেনশিয়াল পরিবর্তনে ত্রুটি হয়েছে');
      }
    } catch {
      setPasswordError('সার্ভার এরর: তথ্য আপডেট করা যায়নি');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;

  // Auto-expand section when activeTab changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      return;
    }
    if (['orders', 'invoice_generator', 'orders_pending', 'orders_confirmed', 'orders_processing', 'orders_shipped', 'orders_delivered', 'orders_cancelled', 'returns_refunds'].includes(activeTab)) {
      setExpandedSection('orders_sales');
    } else if (['products', 'categories', 'size_charts', 'reviews'].includes(activeTab)) {
      setExpandedSection('products_group');
    } else if (['inventory'].includes(activeTab)) {
      setExpandedSection('inventory_group');
    } else if (['suppliers_purchases', 'wholesale'].includes(activeTab)) {
      setExpandedSection('purchases_suppliers');
    } else if (['customers', 'customer_messages', 'customer_alerts', 'ai_assistant'].includes(activeTab)) {
      setExpandedSection('customers_group');
    } else if (['payments'].includes(activeTab)) {
      setExpandedSection('finance_accounts');
    } else if (['profit_loss'].includes(activeTab)) {
      setExpandedSection('profit_loss_group');
    } else if (['coupons', 'combo_offers', 'campaigns', 'timer_offers', 'landing_pages', 'gtm_pixel', 'product_feed'].includes(activeTab)) {
      setExpandedSection('marketing_group');
    } else if (['reports', 'analytics_sales', 'analytics_products', 'analytics_customers', 'analytics_marketing', 'analytics_inventory'].includes(activeTab)) {
      setExpandedSection('reports_analytics');
    } else if (['store_design', 'banners', 'cat_banners', 'menus', 'offers', 'cms_pages', 'order_guides', 'videos', 'brand_stories', 'homepage_sections', 'footer_settings'].includes(activeTab)) {
      setExpandedSection('storefront_content');
    } else if (['store_settings', 'payment_settings', 'courier_settings', 'admin_users', 'roles_permissions', 'ai_settings', 'fraud_security', 'complaints', 'tasks', 'notifications', 'integrations', 'audit_logs', 'backup_database', 'system_settings'].includes(activeTab)) {
      setExpandedSection('settings_security');
    }
  }, [activeTab]);

  // Tab Permission Requirements Map for Role-Based Sidebar Navigation
  const TAB_PERMISSION_MAP: Partial<Record<AdminTab, string[]>> = {
    dashboard: [],
    products: ['products.view', 'products.edit'],
    categories: ['products.view'],
    inventory: ['products.view'],
    orders: ['orders.view'],
    invoice_generator: ['orders.view'],
    orders_pending: ['orders.view'],
    orders_confirmed: ['orders.view'],
    orders_processing: ['orders.view'],
    orders_shipped: ['orders.view'],
    orders_delivered: ['orders.view'],
    orders_cancelled: ['orders.view'],
    returns_refunds: ['orders.view'],
    customers: ['customers.view', 'orders.view'],
    reviews: ['products.view'],
    wholesale: ['wholesale.view', 'orders.view'],
    complaints: ['orders.view'],
    tasks: ['settings.manage'],
    customer_alerts: ['orders.view'],
    fraud_security: ['settings.manage'],
    payments: ['payments.view', 'payments.manage'],
    reports: ['reports.view'],
    profit_loss: ['reports.view'],
    coupons: ['marketing.manage'],
    combo_offers: ['marketing.manage'],
    campaigns: ['marketing.manage'],
    timer_offers: ['marketing.manage'],
    landing_pages: ['marketing.manage'],
    gtm_pixel: ['marketing.manage'],
    product_feed: ['marketing.manage'],
    customer_messages: ['orders.view'],
    notifications: ['orders.view'],
    ai_assistant: ['settings.manage'],
    banners: ['marketing.manage'],
    cat_banners: ['marketing.manage'],
    menus: ['marketing.manage'],
    offers: ['marketing.manage'],
    store_design: ['settings.manage'],
    cms_pages: ['marketing.manage'],
    order_guides: ['marketing.manage'],
    videos: ['marketing.manage'],
    brand_stories: ['marketing.manage'],
    homepage_sections: ['marketing.manage'],
    footer_settings: ['marketing.manage', 'settings.manage'],
    analytics_sales: ['reports.view'],
    analytics_products: ['reports.view'],
    analytics_customers: ['reports.view', 'orders.view'],
    analytics_marketing: ['reports.view', 'marketing.manage'],
    analytics_inventory: ['reports.view'],
    store_settings: ['settings.manage'],
    payment_settings: ['settings.manage', 'payments.manage'],
    courier_settings: ['settings.manage'],
    admin_users: ['admins.manage'],
    roles_permissions: ['admins.manage'],
    ai_settings: ['settings.manage'],
    integrations: ['settings.manage'],
    audit_logs: ['admins.manage'],
    backup_database: ['admins.manage'],
    system_settings: ['settings.manage'],
  };

  const isTabPermitted = (tabId: AdminTab): boolean => {
    if (!currentUser) return true;
    if (currentUser.role === 'super_admin') return true;
    const required = TAB_PERMISSION_MAP[tabId];
    if (!required || required.length === 0) return true;

    const userPerms: string[] = (currentUser as any).permissions
      ? (typeof (currentUser as any).permissions === 'string'
          ? JSON.parse((currentUser as any).permissions)
          : (currentUser as any).permissions)
      : [];

    if (userPerms.includes('all') || userPerms.includes('*')) return true;

    return required.some((reqPerm) => userPerms.includes(reqPerm) || userPerms.includes(reqPerm.split('.')[0] + '.*'));
  };

  const adminName = currentUser?.name || 'Md. Abdullah (MD. ABDULLAH)';
  const adminEmail = currentUser?.email || 'bastrashoily@gmail.com';
  const adminRoleDisplay = currentUser?.role === 'super_admin'
    ? 'Super Admin'
    : (currentUser?.role === 'product_manager'
        ? 'Product Manager'
        : (currentUser?.role === 'order_manager'
            ? 'Order Manager'
            : (currentUser?.role || 'Super Admin')));
  const adminInitial = (adminName ? adminName.charAt(0) : 'A').toUpperCase();

  // The 12 Main Navigation Architecture Groups
  const rawNavSections = [
    {
      id: 'orders_sales',
      number: '2',
      title: 'ORDERS & SALES',
      banglaTitle: 'Orders & Sales',
      icon: ShoppingCart,
      badge: pendingOrdersCount,
      items: [
        { id: 'orders' as AdminTab, label: 'All Orders', banglaLabel: 'সকল অর্ডার (All Orders)', icon: ShoppingCart, badge: pendingOrdersCount },
        { id: 'invoice_generator' as AdminTab, label: 'Invoice & POS Memo', banglaLabel: 'ইনভয়েস ও ক্যাশ মেমো জেনারেটর', icon: FileText },
        { id: 'orders_pending' as AdminTab, label: 'Pending Orders', banglaLabel: 'পেন্ডিং অর্ডার (Pending)', icon: Clock, badge: pendingOrdersCount, isSubChild: true },
        { id: 'orders_confirmed' as AdminTab, label: 'Confirmed Orders', banglaLabel: 'কনফার্মড অর্ডার (Confirmed)', icon: CheckCircle2, isSubChild: true },
        { id: 'orders_processing' as AdminTab, label: 'Processing Orders', banglaLabel: 'প্রসেসিং অর্ডার (Processing)', icon: Layers, isSubChild: true },
        { id: 'orders_shipped' as AdminTab, label: 'Shipped Orders', banglaLabel: 'শিপড অর্ডার (Shipped)', icon: Truck, isSubChild: true },
        { id: 'orders_delivered' as AdminTab, label: 'Delivered Orders', banglaLabel: 'ডেলিভার্ড অর্ডার (Delivered)', icon: CheckSquare, isSubChild: true },
        { id: 'orders_cancelled' as AdminTab, label: 'Cancelled Orders', banglaLabel: 'বাতিলকৃত অর্ডার (Cancelled)', icon: XCircle, isSubChild: true },
        { id: 'returns_refunds' as AdminTab, label: 'Returns & Refunds', banglaLabel: 'রিটার্ন ও রিফান্ড (Returns & Refunds)', icon: RotateCcw, isSubChild: true },
      ],
    },
    {
      id: 'products_group',
      number: '3',
      title: 'PRODUCTS',
      banglaTitle: 'Products',
      icon: Package,
      items: [
        { id: 'products' as AdminTab, label: 'All Products & Variants', banglaLabel: 'পণ্য তালিকা ও আপলোড', icon: Package },
        { id: 'categories' as AdminTab, label: 'Categories & Subcategories', banglaLabel: 'ক্যাটাগরি ম্যানেজমেন্ট', icon: Layers },
        { id: 'size_charts' as AdminTab, label: 'Size Chart Management', banglaLabel: 'সাইজ চার্ট ম্যানেজমেন্ট', icon: Ruler },
        { id: 'reviews' as AdminTab, label: 'Customer Reviews', banglaLabel: 'রিভিউ ও রেটিং', icon: Star },
      ],
    },
    {
      id: 'inventory_group',
      number: '4',
      title: 'INVENTORY',
      banglaTitle: 'Inventory',
      icon: Boxes,
      badge: lowStockCount,
      items: [
        { id: 'inventory' as AdminTab, label: 'Stock Overview & Adjustments', banglaLabel: 'স্টক ওভারভিউ ও ইনভেন্টরি লগ', icon: Boxes, badge: lowStockCount },
      ],
    },
    {
      id: 'purchases_suppliers',
      number: '5',
      title: 'PURCHASES & SUPPLIERS',
      banglaTitle: 'Purchases & Suppliers',
      icon: Truck,
      items: [
        { id: 'suppliers_purchases' as AdminTab, label: 'Suppliers & Purchases', banglaLabel: 'সাপ্লায়ার ও পারচেজ অর্ডার', icon: Truck },
        { id: 'wholesale' as AdminTab, label: 'Wholesale & Bulk Orders', banglaLabel: 'পাইকারি ও বাল্ক অর্ডার', icon: Building2 },
      ],
    },
    {
      id: 'customers_group',
      number: '6',
      title: 'CUSTOMERS & STAFF',
      banglaTitle: 'Customers & Staff',
      icon: Users,
      items: [
        { id: 'customers' as AdminTab, label: 'Customer Directory & LTV', banglaLabel: 'গ্রাহক ডিরেক্টরি ও প্রোফাইল', icon: Users },
        { id: 'admin_users' as AdminTab, label: 'Staff Accounts & Roles', banglaLabel: 'স্টাফ একাউন্টস ও রোল পারমিশন (RBAC)', icon: ShieldCheck },
        { id: 'customer_messages' as AdminTab, label: 'Customer Messages & Support', banglaLabel: 'গ্রাহক মেসেজ ও সাপোর্ট', icon: MessageSquare },
        { id: 'ai_assistant' as AdminTab, label: 'AI Shopping Assistant', banglaLabel: 'এআই শপিং অ্যাসিস্ট্যান্ট', icon: Bot },
      ],
    },
    {
      id: 'finance_accounts',
      number: '7',
      title: 'FINANCE & ACCOUNTS',
      banglaTitle: 'Finance & Accounts',
      icon: CreditCard,
      items: [
        { id: 'payments' as AdminTab, label: 'Payments & Transactions', banglaLabel: 'পেমেন্টস ও লেনদেন লগ', icon: CreditCard },
      ],
    },
    {
      id: 'profit_loss_group',
      number: '8',
      title: 'PROFIT & LOSS',
      banglaTitle: 'Profit & Loss',
      icon: TrendingUp,
      items: [
        { id: 'profit_loss' as AdminTab, label: 'P&L Statement & Margins', banglaLabel: 'লাভ-ক্ষতি (P&L) ও মার্জিন বিশ্লেষণ', icon: TrendingUp },
      ],
    },
    {
      id: 'marketing_group',
      number: '9',
      title: 'MARKETING',
      banglaTitle: 'Marketing',
      icon: Flame,
      items: [
        { id: 'coupons' as AdminTab, label: 'Coupons & Discounts', banglaLabel: 'কুপন ও ডিসকাউন্ট রুলস', icon: Tag },
        { id: 'combo_offers' as AdminTab, label: 'Combo Offers (Bundle Deals)', banglaLabel: 'কম্বো অফার ও বান্ডেল ডিল (স্পেশাল)', icon: Gift },
        { id: 'timer_offers' as AdminTab, label: 'Timer Offers & Flash Sales', banglaLabel: 'টাইমার অফার ও ফ্ল্যাশ সেল', icon: Clock },
        { id: 'campaigns' as AdminTab, label: 'Campaigns', banglaLabel: 'মার্কেটিং ক্যাম্পেইন', icon: Flame },
        { id: 'landing_pages' as AdminTab, label: 'Landing Pages', banglaLabel: 'হাই-কনভার্টিং ল্যান্ডিং পেজ', icon: Layers },
        { id: 'gtm_pixel' as AdminTab, label: 'GTM & Facebook Pixel', banglaLabel: 'জিটিএম ও ফেসবুক পিক্সেল', icon: Code },
        { id: 'product_feed' as AdminTab, label: 'Product Feed', banglaLabel: 'প্রোডাক্ট ফিড (Product Feed)', icon: FileText },
      ],
    },
    {
      id: 'reports_analytics',
      number: '10',
      title: 'REPORTS & ANALYTICS',
      banglaTitle: 'Reports & Analytics',
      icon: BarChart3,
      items: [
        { id: 'reports' as AdminTab, label: '12 Comprehensive Reports', banglaLabel: '১২টি পূর্ণাঙ্গ বিজনেস রিপোর্ট', icon: BarChart3 },
        { id: 'analytics_sales' as AdminTab, label: 'Sales Reports', banglaLabel: 'বিক্রয় বিশ্লেষণ রিপোর্ট', icon: BarChart3 },
        { id: 'analytics_products' as AdminTab, label: 'Product Performance', banglaLabel: 'প্রোডাক্ট পারফরম্যান্স রিপোর্ট', icon: Package },
        { id: 'analytics_customers' as AdminTab, label: 'Customer Reports', banglaLabel: 'কাস্টমার বিশ্লেষণ রিপোর্ট', icon: Users },
        { id: 'analytics_marketing' as AdminTab, label: 'Marketing Reports', banglaLabel: 'মার্কেটিং ও ক্যাম্পেইন রিপোর্ট', icon: Flame },
        { id: 'analytics_inventory' as AdminTab, label: 'Inventory Reports', banglaLabel: 'ইনভেন্টরি ও স্টক রিপোর্ট', icon: Boxes },
      ],
    },
    {
      id: 'storefront_content',
      number: '11',
      title: 'STOREFRONT & CONTENT',
      banglaTitle: 'Storefront & Content',
      icon: Compass,
      items: [
        { id: 'store_design' as AdminTab, label: 'Store Design & Theme', banglaLabel: 'স্টোর ডিজাইন ও থিম', icon: Palette },
        { id: 'banners' as AdminTab, label: 'Homepage Banners (Hero Slider)', banglaLabel: 'হিরো স্লাইডার ব্যানার', icon: Image },
        { id: 'cat_banners' as AdminTab, label: 'Category Banners', banglaLabel: 'ক্যাটেগরি ব্যানার', icon: Image },
        { id: 'menus' as AdminTab, label: 'Header & Footer Menus', banglaLabel: 'মেনু ও নেভিগেশন', icon: Compass },
        { id: 'offers' as AdminTab, label: 'Promotional Offers', banglaLabel: 'প্রমোশনাল অফার সেকশন', icon: Tag },
        { id: 'cms_pages' as AdminTab, label: 'CMS Pages & Policies', banglaLabel: 'সিএমএস পেজ ও পলিসি', icon: FileText },
        { id: 'order_guides' as AdminTab, label: 'Order Guides & FAQs', banglaLabel: 'অর্ডার গাইড ও প্রশ্নাবলী', icon: BookOpen },
        { id: 'videos' as AdminTab, label: 'Video Gallery & Reels', banglaLabel: 'ভিডিও গ্যালারি ও রিলস', icon: Film },
        { id: 'brand_stories' as AdminTab, label: 'Brand Stories & Artisans', banglaLabel: 'ব্র্যান্ড স্টোরি ও তাঁতিদের গল্প', icon: Award },
        { id: 'homepage_sections' as AdminTab, label: 'Homepage Sections', banglaLabel: 'হোমপেজ সেকশন ম্যানেজমেন্ট', icon: Layers },
        { id: 'footer_settings' as AdminTab, label: 'Footer Management', banglaLabel: 'ফুটার সম্পূর্ণ কন্ট্রোল ও তথ্য', icon: Sliders },
      ],
    },
    {
      id: 'settings_security',
      number: '12',
      title: 'SETTINGS & SECURITY',
      banglaTitle: 'Settings & Security',
      icon: Settings,
      items: [
        { id: 'store_settings' as AdminTab, label: 'Store & Delivery Settings', banglaLabel: 'স্টোর ও ডেলিভারি কনফিগারেশন', icon: Sliders },
        { id: 'payment_settings' as AdminTab, label: 'Payment Gateway Settings', banglaLabel: 'পেমেন্ট গেটওয়ে সেটিংস (bKash/Nagad/COD)', icon: CreditCard },
        { id: 'courier_settings' as AdminTab, label: 'Courier Integration Settings', banglaLabel: 'কুরিয়ার ইন্টিগ্রেশন (Steadfast, Pathao, RedX)', icon: Truck },
        { id: 'admin_users' as AdminTab, label: 'User Access & Staff', banglaLabel: 'ইউজার অ্যাক্সেস ও স্টাফ ম্যানেজমেন্ট', icon: ShieldCheck },
        { id: 'roles_permissions' as AdminTab, label: 'Roles & Permissions', banglaLabel: 'রোল ও পারমিশন কন্ট্রোল', icon: ShieldCheck },
        { id: 'ai_settings' as AdminTab, label: 'AI Assistant Settings', banglaLabel: 'এআই সহকারী সেটিংস (নলেজবেস ও টোন)', icon: Bot },
        { id: 'fraud_security' as AdminTab, label: 'Fraud Detection & Security', banglaLabel: 'প্রতারণা প্রতিরোধ ও নিরাপত্তা', icon: ShieldAlert },
        { id: 'complaints' as AdminTab, label: 'Complaints & Support Tickets', banglaLabel: 'অভিযোগ ও সাপোর্ট টিকিট', icon: MessageSquareWarning },
        { id: 'tasks' as AdminTab, label: 'Internal Operational Tasks', banglaLabel: 'অভ্যন্তরীণ অপারেশনাল টাস্ক', icon: CheckSquare },
        { id: 'notifications' as AdminTab, label: 'System Notifications', banglaLabel: 'সিস্টেম নোটিফিকেশন', icon: Bell, badge: unreadNotifications },
        { id: 'integrations' as AdminTab, label: 'Third-Party Integrations', banglaLabel: 'থার্ড-পার্টি ইন্টিগ্রেশন', icon: Code },
        { id: 'audit_logs' as AdminTab, label: 'System Audit Logs', banglaLabel: 'অডিট লগ ও সিস্টেম অ্যাক্টিভিটি', icon: FileText },
        { id: 'backup_database' as AdminTab, label: 'Backup & Database Management', banglaLabel: 'ডাটাবেস ব্যাকআপ ও রিকভারি', icon: Boxes },
        { id: 'system_settings' as AdminTab, label: 'System Health & Maintenance', banglaLabel: 'সিস্টেম হেলথ ও সেটিংস', icon: Settings },
      ],
    },
  ];

  // Filter sections and items based on logged in admin permissions (BUG 12)
  const navSections = rawNavSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => isTabPermitted(item.id)),
    }))
    .filter((sec) => sec.items.length > 0);

  const getPageTitle = () => {
    if (activeTab === 'dashboard') return 'ড্যাশবোর্ড ও ওভারভিউ';
    for (const sec of navSections) {
      const match = sec.items.find((i) => i.id === activeTab);
      if (match) return `${match.banglaLabel} (${sec.title})`;
    }
    return 'এডমিন কন্ট্রোল প্যানেল';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-stone-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-stone-700 flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Left Sidebar (Section 75.1) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-72 bg-white text-stone-900 flex flex-col shrink-0 border-r border-stone-200 transition-transform duration-200 h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#c2410c] to-[#f97316] text-white flex items-center justify-center font-bold text-base shadow-sm">
              👕
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-1">
                <span className="text-[#c2410c]">Amar</span>
                <span>BOSTROSHOILY</span>
              </h2>
              <p className="text-[9px] uppercase tracking-[0.22em] text-stone-400 font-bold">
                MY TEXTILE STYLE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-stone-500 hover:text-stone-800 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Storefront Return Quick Button */}
        <div className="p-3">
          <button
            onClick={navigateToHome}
            className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-[#f97316]" />
            <span>লাইভ ওয়েবসাইট দেখুন</span>
          </button>
        </div>

        {/* Navigation items - 12 Main Architecture Sections */}
        <nav className="flex-1 px-3 py-1 space-y-1.5 overflow-y-auto">
          {/* 1. DASHBOARD (Direct Link at Top with orange active pill) */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setExpandedSection(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/25'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-white' : 'text-stone-500'}`} />
              <span>1. Dashboard (ড্যাশবোর্ড)</span>
            </div>
          </button>

          {/* Expandable Sections 2 through 12 */}
          {navSections.map((sec) => {
            const isExpanded = expandedSection === sec.id;
            const hasActiveChild = sec.items.some((it) => it.id === activeTab);
            const SecIcon = sec.icon;

            return (
              <div key={sec.id} className="rounded-xl overflow-hidden border border-stone-100 bg-white/50">
                {/* Main Section Header */}
                <button
                  type="button"
                  onClick={() => {
                    setExpandedSection((prev) => (prev === sec.id ? null : sec.id));
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer select-none ${
                    hasActiveChild && !isExpanded
                      ? 'bg-orange-50 text-orange-950 border-l-4 border-[#f97316]'
                      : 'text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SecIcon className={`w-4 h-4 shrink-0 ${hasActiveChild ? 'text-[#f97316]' : 'text-stone-500'}`} />
                    <span className="truncate">
                      <span className="font-mono text-[#f97316] mr-1 text-[11px]">{sec.number}.</span>
                      {sec.banglaTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {sec.badge !== undefined && sec.badge > 0 && !isExpanded && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#f97316] text-white font-mono">
                        {sec.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#f97316]' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Sub-items (Visible when expanded) */}
                {isExpanded && (
                  <div className="pl-3 pr-1.5 py-1 space-y-0.5 bg-stone-50/60 border-t border-stone-100">
                    {sec.items.map((item: any) => {
                      const ItemIcon = item.icon;
                      const isActive = activeTab === item.id;
                      const isSub = Boolean(item.isSubChild);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSub ? 'ml-3 w-[calc(100%-0.75rem)] border-l-2 border-orange-300 pl-2 text-[11px]' : ''
                          } ${
                            isActive
                              ? 'bg-[#f97316] text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-white hover:text-stone-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isSub ? (
                              <span className={`font-mono text-[10px] ${isActive ? 'text-white' : 'text-orange-600'}`}>↳</span>
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-stone-300'}`} />
                            )}
                            <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                            <span className="truncate">{item.banglaLabel}</span>
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                                isActive ? 'bg-white text-[#f97316]' : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer info (Dynamic Admin Identity) */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={adminName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center font-bold text-xs text-stone-700">
                {adminInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-800 truncate">{adminName}</p>
              <p className="text-[10px] text-emerald-700 font-medium">● {adminRoleDisplay}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Matching Design in Screenshots) */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                <span>এডমিন</span>
                <span>/</span>
                <span className="text-[#f97316] font-semibold">{getPageTitle()}</span>
              </div>
              <h1 className="text-sm font-bold text-stone-900 tracking-tight">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Center Search Bar from Uploaded Image */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order no, name, or phone..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('orders');
                  }
                }}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 hover:bg-stone-100/70 focus:bg-white rounded-full text-xs text-stone-800 placeholder-stone-400 border border-stone-200 focus:border-[#f97316] focus:ring-2 focus:ring-orange-100 transition-all outline-hidden"
              />
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={navigateToHome}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#f97316]" />
              <span>ওয়েবসাইট</span>
            </button>

            {/* Notification Bell with Badge 3 matching screenshot */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
              title="নোটিফিকেশন"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            </button>

            {/* Profile Menu Dropdown (Matching Screenshot: Md. Abdullah (MD. ABDULLAH) v) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 hover:bg-stone-50 cursor-pointer transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#9a3412] to-[#ea580c] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Admin" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    adminInitial
                  )}
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <p className="text-xs font-bold text-stone-800">Md. Abdullah</p>
                  <p className="text-[10px] text-stone-400 font-mono tracking-tight">(MD. ABDULLAH)</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-xl py-1 text-xs z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-bold text-stone-900 truncate">{adminName}</p>
                    <p className="text-[11px] text-stone-400 truncate">{adminEmail}</p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {adminRoleDisplay}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('system_settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 cursor-pointer"
                  >
                    আমার প্রোফাইল ও ভূমিকা
                  </button>
                  <button
                    onClick={() => {
                      setIsChangePasswordModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-900 font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('system_settings');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 cursor-pointer"
                  >
                    অডিট লগ ও লগইন হিস্ট্রি
                  </button>
                  <div className="border-t border-stone-100 my-1" />
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      adminLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগ আউট</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Security Warning Banner for Default/Temporary Password */}
        {requireAdminPasswordChange && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-950 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>নিরাপত্তা সতর্কবার্তা:</strong> আপনি ডিফল্ট/অস্থায়ী পাসওয়ার্ড দিয়ে লগইন করেছেন। প্রোডাকশন সুরক্ষার জন্য অবিলম্বে নতুন পাসওয়ার্ড সেট করুন।
              </span>
            </div>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              পাসওয়ার্ড পরিবর্তন করুন
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Admin Profile & Credentials Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-stone-900 text-white p-5 sm:p-6 relative shrink-0">
              <button
                onClick={() => {
                  if (!requireAdminPasswordChange) {
                    setIsChangePasswordModalOpen(false);
                    setShowOldPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }
                }}
                className={`absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer ${
                  requireAdminPasswordChange ? 'hidden' : ''
                }`}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">এডমিন ইউজারনেম ও পাসওয়ার্ড সেটিংস</h3>
                  <p className="text-xs text-stone-400">আপনার এডমিন লগইন ইউজারনেম, ইমেইল ও পাসওয়ার্ড পরিবর্তন করুন</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {requireAdminPasswordChange && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>সিস্টেম সুরক্ষার জন্য ডিফল্ট পাসওয়ার্ড পরিবর্তন করা বাধ্যতামূলক।</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Username & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ইউজারনেম (Username) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="যেমন: admin"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-stone-50"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">লগইনে ব্যবহার করা যাবে</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    এডমিনের নাম (Display Name)
                  </label>
                  <input
                    type="text"
                    value={adminDisplayName}
                    onChange={(e) => setAdminDisplayName(e.target.value)}
                    placeholder="যেমন: Abdullah (Owner)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    লগইন ইমেইল (Login Email) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="admin@bastrashoily.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    মোবাইল নম্বর (Phone)
                  </label>
                  <input
                    type="text"
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    placeholder="01890123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3">
                <h4 className="text-xs font-extrabold text-stone-900 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক - পরিবর্তন না চাইলে খালি রাখুন)</span>
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  বর্তমান পাসওয়ার্ড (Current Password - প্রয়োজন হলে লিখুন)
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-stone-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    title={showOldPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    নতুন পাসওয়ার্ড (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      minLength={6}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      title={showNewPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    কনফার্ম পাসওয়ার্ড (Confirm)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                      minLength={6}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                {!requireAdminPasswordChange && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangePasswordModalOpen(false);
                      setShowOldPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isSubmittingPassword ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ ও আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
