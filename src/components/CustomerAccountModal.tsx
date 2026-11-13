import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  User,
  ShoppingBasket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  FileText,
  LogOut,
  Edit2,
  Save,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const CustomerAccountModal: React.FC = () => {
  const {
    currentCustomer,
    isCustomerAccountModalOpen,
    closeCustomerAccountModal,
    customerLogout,
    updateCurrentCustomerProfile,
    orders,
    openInvoiceModal,
    navigateToTrackOrder,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Edit profile state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDistrict, setEditDistrict] = useState('ঢাকা');

  React.useEffect(() => {
    if (currentCustomer) {
      setEditName(currentCustomer.name);
      setEditPhone(currentCustomer.phone);
      setEditEmail(currentCustomer.email || '');
      setEditAddress(currentCustomer.address || '');
      setEditDistrict(currentCustomer.district || 'ঢাকা');
    }
  }, [currentCustomer]);

  if (!isCustomerAccountModalOpen || !currentCustomer) return null;

  // Filter orders matching this customer's phone or email
  const myOrders = orders.filter(
    (o) =>
      o.customerPhone.replace(/[^0-9]/g, '') ===
        currentCustomer.phone.replace(/[^0-9]/g, '') ||
      (currentCustomer.email &&
        o.customerEmail?.toLowerCase() === currentCustomer.email.toLowerCase())
  );

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentCustomerProfile({
      name: editName,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      district: editDistrict,
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            পেন্ডিং (Pending)
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            কনফার্মড (Confirmed)
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
            প্রস্তুত হচ্ছে (Processing)
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
            ডেলিভারির পথে (Shipped)
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            ডেলিভার্ড (Delivered)
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            বাতিলকৃত (Cancelled)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Profile Bar */}
        <div className="bg-stone-900 text-white p-6 relative shrink-0">
          <button
            onClick={closeCustomerAccountModal}
            className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-lg">
                {currentCustomer.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">{currentCustomer.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase">
                    সক্রিয় গ্রাহক
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-stone-300 text-xs mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {currentCustomer.phone}
                  </span>
                  {currentCustomer.district && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {currentCustomer.district}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 bg-stone-800/80 px-4 py-2.5 rounded-xl border border-stone-700 text-xs">
              <div className="text-center pr-3 border-r border-stone-700">
                <span className="text-[10px] text-stone-400 block font-bold">মোট অর্ডার</span>
                <span className="text-base font-black text-amber-400">{myOrders.length}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-stone-400 block font-bold">মোট কেনাকাটা</span>
                <span className="text-base font-black text-emerald-400">
                  ৳{myOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mt-6 pt-3 border-t border-stone-800">
            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                    : 'text-stone-300 hover:text-white bg-stone-800'
                }`}
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>আমার অর্ডারসমূহ ({myOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                    : 'text-stone-300 hover:text-white bg-stone-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>প্রোফাইল ও ঠিকানা</span>
              </button>
            </div>

            <button
              onClick={customerLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto grow">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-stone-800">এখনও কোনো অর্ডার করেননি</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    বস্ত্র শৈলী (BOSTROSHOILY)-এর প্রিমিয়াম লুঙ্গি, পাঞ্জাবি ও পোশাক থেকে আপনার পছন্দের পণ্যটি এখনই অর্ডার করুন।
                  </p>
                  <button
                    onClick={closeCustomerAccountModal}
                    className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>কালেকশন দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-stone-900 font-mono">
                            #{order.id}
                          </span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-1 font-mono">
                          <Clock className="w-3 h-3" />
                          অর্ডার সময়: {order.orderDate || (order as any).order_date || ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            closeCustomerAccountModal();
                            navigateToTrackOrder(order.id);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>ট্র্যাক করুন</span>
                        </button>

                        <button
                          onClick={() => {
                            closeCustomerAccountModal();
                            openInvoiceModal(order);
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>মেমো / ইনভয়েস</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2.5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                              />
                            )}
                            <div>
                              <p className="font-bold text-stone-800">{item.productName}</p>
                              {(item.variantSummary || item.color || item.size) && (
                                <p className="text-[11px] text-stone-400">
                                  {item.variantSummary || [item.color && `রং: ${item.color}`, item.size && `সাইজ: ${item.size}`].filter(Boolean).join(' | ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-stone-800 font-mono">
                              {item.quantity} x ৳{item.price} = ৳{item.quantity * item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer & Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <div className="text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.deliveryAddress}, {order.district}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 mr-2">সর্বমোট:</span>
                        <span className="font-black text-sm text-stone-900 font-mono">
                          ৳{order.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs max-w-lg mx-auto">
              <div>
                <label className="block font-bold text-stone-700 mb-1">পূর্ণ নাম</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white font-bold"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">মোবাইল নম্বর</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white font-mono font-bold"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ইমেইল</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white font-mono"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">জেলা</label>
                  <select
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  >
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="বরিশাল">বরিশাল</option>
                    <option value="রংপুর">রংপুর</option>
                    <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                    <option value="কুমিল্লা">কুমিল্লা</option>
                    <option value="গাজীপুর">গাজীপুর</option>
                    <option value="অন্যান্য">অন্যান্য জেলা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">নিবন্ধন তারিখ</label>
                  <input
                    type="text"
                    disabled
                    value={currentCustomer.registrationDate}
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="রোড, বাড়ি নম্বর, এলাকার বিস্তারিত..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>পরিবর্তন সংরক্ষণ করুন (Save Profile)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
