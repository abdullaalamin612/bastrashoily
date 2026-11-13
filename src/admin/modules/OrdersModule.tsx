import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { adminFetch } from '../adminApi';
import {
  Search,
  Filter,
  Printer,
  Download,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  MessageSquare,
  DollarSign,
  User,
} from 'lucide-react';

interface OrdersModuleProps {
  initialFilter?: string;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({ initialFilter = 'all' }) => {
  const { orders, updateOrderStatus, updateOrderPayment, addAdminNoteToOrder, openInvoiceModal, showToast } =
    useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);

  React.useEffect(() => {
    if (initialFilter) {
      setFilterStatus(initialFilter);
    }
  }, [initialFilter]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newAdminNote, setNewAdminNote] = useState('');

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const handlePaymentStatusChange = (orderId: string, newStatus: PaymentStatus) => {
    updateOrderPayment(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
    }
  };

  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatchingId, setIsDispatchingId] = useState<string | null>(null);

  const handleDirectRowCourierDispatch = async (targetOrder: Order) => {
    setIsDispatchingId(targetOrder.id);
    try {
      const res = await adminFetch('/api/admin/courier/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrder.id,
          customerName: targetOrder.customerName,
          phone: targetOrder.customerPhone,
          address: `${targetOrder.deliveryAddress}, ${targetOrder.district}`,
          codAmount: targetOrder.paymentStatus === 'paid' ? 0 : targetOrder.total,
          provider: 'steadfast',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`অর্ডার #${targetOrder.id} সফলভাবে কুরিয়ারে বুকিং হয়েছে! ট্র্যাকিং কোড: ${data.trackingCode}`);
        handleStatusChange(targetOrder.id, 'shipped');
        (targetOrder as any).courierTrackingCode = data.trackingCode;
        (targetOrder as any).courierProvider = data.provider || 'Steadfast';
        if (selectedOrder && selectedOrder.id === targetOrder.id) {
          setSelectedOrder({
            ...selectedOrder,
            orderStatus: 'shipped',
            courierProvider: data.provider || 'Steadfast',
            courierTrackingCode: data.trackingCode,
          } as any);
        }
      } else {
        showToast(data.error || 'কুরিয়ার বুকিং ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('কুরিয়ার সার্ভারে সংযোগ করা সম্ভব হয়নি');
    } finally {
      setIsDispatchingId(null);
    }
  };

  const handleDispatchCourier = async () => {
    if (!selectedOrder) return;
    setIsDispatching(true);
    try {
      const res = await adminFetch('/api/admin/courier/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          customerName: selectedOrder.customerName,
          phone: selectedOrder.customerPhone,
          address: `${selectedOrder.deliveryAddress}, ${selectedOrder.district}`,
          codAmount: selectedOrder.paymentStatus === 'paid' ? 0 : selectedOrder.total,
          provider: 'steadfast',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`কুরিয়ারে সফলভাবে বুকিং হয়েছে! ট্র্যাকিং কোড: ${data.trackingCode}`);
        handleStatusChange(selectedOrder.id, 'shipped');
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: 'shipped',
          courierProvider: data.provider,
          courierTrackingCode: data.trackingCode,
        } as any);
      } else {
        showToast(data.error || 'কুরিয়ার বুকিং ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast('কুরিয়ার সার্ভারে সংযোগ করা সম্ভব হয়নি');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newAdminNote.trim()) return;
    addAdminNoteToOrder(selectedOrder.id, newAdminNote);
    setSelectedOrder({
      ...selectedOrder,
      adminNotes: selectedOrder.adminNotes
        ? `${selectedOrder.adminNotes}\n• ${newAdminNote.trim()}`
        : `• ${newAdminNote.trim()}`,
    });
    setNewAdminNote('');
  };

  const handleExportCSV = () => {
    const headers = 'Order ID,Customer,Phone,District,Address,Items,Total,Payment,Status,Date\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.id}","${o.customerName || ''}","${o.customerPhone || ''}","${o.district || ''}","${o.deliveryAddress || ''}","${(o.items || []).length}",${o.total || 0},"${o.paymentMethod || 'cod'}","${o.orderStatus || 'pending'}","${o.orderDate || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bastra_shoily_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('অর্ডার ডাটা CSV ফাইল হিসেবে ডাউনলোড সম্পন্ন হয়েছে।');
  };

  // Aggregated Order Analytics for Sector Chart
  const orderStats = React.useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelled = 0;
    let totalRev = 0;
    let codCount = 0;
    let onlineCount = 0;

    orders.forEach((o) => {
      const s = (o.orderStatus || 'pending').toLowerCase();
      if (s === 'pending') pending++;
      else if (s === 'confirmed' || s === 'processing') confirmed++;
      else if (s === 'shipped') shipped++;
      else if (s === 'delivered') delivered++;
      else if (s === 'cancelled') cancelled++;

      totalRev += o.total || 0;
      if (o.paymentMethod === 'cod') codCount++;
      else onlineCount++;
    });

    return {
      total: orders.length || 1,
      realTotal: orders.length,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRev,
      codCount,
      onlineCount,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            অর্ডার ও ডেলিভারি নিয়ন্ত্রণ (Order Management & Invoices)
          </h2>
          <p className="text-xs text-stone-500">
            পেন্ডিং অর্ডার কনফার্ম করুন, ইনভয়েস প্রিন্ট করুন এবং কুরিয়ার স্ট্যাটাস আপডেট করুন
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>অর্ডার এক্সপোর্ট (CSV Export)</span>
        </button>
      </div>

      {/* Sector Charts & Analytics Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
              <span>📊</span>
              <span>অর্ডার সেক্টর অ্যানালিটিক্স ও স্ট্যাটাস চার্ট (Sector Analytics)</span>
            </h3>
            <p className="text-[11px] text-stone-500">অর্ডার ফানেল, লাইভ ডেলিভারি রেশিও ও পেমেন্ট মেথড বিভাজন</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            সর্বমোট বিক্রয়: ৳{orderStats.totalRev.toLocaleString('en-US')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Status Breakdown Bar Graphs */}
          <div className="space-y-2 md:col-span-2">
            {[
              { label: 'ডেলিভার্ড (Delivered)', count: orderStats.delivered, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'শিপড (Shipped / Courier)', count: orderStats.shipped, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'প্রস্তুত / কনফার্মড (Processing)', count: orderStats.confirmed, color: 'bg-indigo-500', text: 'text-indigo-700' },
              { label: 'পেন্ডিং (Pending Orders)', count: orderStats.pending, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'বাতিলকৃত (Cancelled)', count: orderStats.cancelled, color: 'bg-rose-500', text: 'text-rose-700' },
            ].map((st, i) => {
              const pct = Math.round((st.count / orderStats.total) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-700">{st.label}</span>
                    <span className={st.text}>{st.count} টি ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className={`${st.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method Split Pie/Donut Chart */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase">পেমেন্ট মেথড বিভাজন:</span>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.8" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.8"
                    strokeDasharray={`${Math.round((orderStats.codCount / orderStats.total) * 100)} 100`}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute font-black text-xs text-stone-900 font-mono">
                  {Math.round((orderStats.codCount / orderStats.total) * 100)}%
                </span>
              </div>
              <div className="text-xs space-y-1.5 font-bold">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>ক্যাশ অন ডেলিভারি: {orderStats.codCount} টি</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span>অনলাইন / বিকাশ: {orderStats.onlineCount} টি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি (BS-1081), ফোন নম্বর বা গ্রাহকের নাম দিয়ে খুঁজুন..."
            className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
        >
          <option value="all">সকল অর্ডার (All Orders)</option>
          <option value="pending">পেন্ডিং (Pending)</option>
          <option value="confirmed">কনফার্মড (Confirmed)</option>
          <option value="processing">প্রস্তুত হচ্ছে (Processing)</option>
          <option value="shipped">শিপড (Shipped)</option>
          <option value="delivered">ডেলিভার্ড (Delivered)</option>
          <option value="cancelled">বাতিলকৃত (Cancelled)</option>
        </select>
      </div>

      {/* Orders List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table list (lg:col-span-7 or 8) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold uppercase border-b border-stone-200">
                  <th className="p-3">অর্ডার আইডি</th>
                  <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                  <th className="p-3">আইটেম ও মূল্য</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">১-ক্লিক কুরিয়ার / ইনভয়েস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/80 font-medium' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-stone-900">
                        #{order.id}
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {(order.orderDate || (order as any).order_date || '').split(' ')[0] || '—'}
                        </span>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-stone-900">{order.customerName || (order as any).customer_name || '—'}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{order.customerPhone || (order as any).customer_phone || ''}</p>
                      </td>

                      <td className="p-3">
                        <span className="font-extrabold text-stone-900 text-xs">৳{order.total}</span>
                        <span className="block text-[10px] text-stone-400">
                          {(order.items || []).length} টি আইটেম • {(order.paymentMethod || 'COD').toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : order.orderStatus === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectRowCourierDispatch(order);
                          }}
                          disabled={isDispatchingId === order.id || order.orderStatus === 'delivered'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                            (order as any).courierTrackingCode
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                          }`}
                          title="১-ক্লিকে কুরিয়ারে বুকিং করুন"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>
                            {isDispatchingId === order.id
                              ? 'পাঠানো হচ্ছে...'
                              : (order as any).courierTrackingCode
                              ? `${(order as any).courierTrackingCode}`
                              : '১-ক্লিক কুরিয়ার'}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInvoiceModal(order);
                          }}
                          className="p-1.5 bg-stone-100 hover:bg-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detailed Inspector (lg:col-span-5) */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-5 sticky top-24">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-xs font-mono font-black text-amber-800">
                    ORDER #{selectedOrder.id}
                  </span>
                  <p className="text-[11px] text-stone-400">{selectedOrder.orderDate || (selectedOrder as any).order_date || ''}</p>
                </div>

                <button
                  onClick={() => openInvoiceModal(selectedOrder)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Invoice</span>
                </button>
              </div>

              {/* Status Update Selectors */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                    অর্ডার স্ট্যাটাস
                  </label>
                  <select
                    value={selectedOrder.orderStatus || 'pending'}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900"
                  >
                    <option value="pending">Pending (অপেক্ষমান)</option>
                    <option value="confirmed">Confirmed (নিশ্চিত)</option>
                    <option value="processing">Processing (প্রস্তুত হচ্ছে)</option>
                    <option value="shipped">Shipped (কুরিয়ারে)</option>
                    <option value="delivered">Delivered (ডেলিভার্ড)</option>
                    <option value="cancelled">Cancelled (বাতিল)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">
                    পেমেন্ট স্ট্যাটাস
                  </label>
                  <select
                    value={selectedOrder.paymentStatus || 'pending'}
                    onChange={(e) =>
                      handlePaymentStatusChange(selectedOrder.id, e.target.value as PaymentStatus)
                    }
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900"
                  >
                    <option value="pending">Pending (বাকি)</option>
                    <option value="paid">Paid (পরিশোধিত)</option>
                    <option value="refunded">Refunded (ফেরত)</option>
                  </select>
                </div>
              </div>

              {/* Steadfast Courier Dispatch Integration Card */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Truck className="w-4 h-4 text-amber-800" />
                    <span>Steadfast কুরিয়ার ইন্টিগ্রেশন</span>
                  </div>
                  <p className="text-[11px] text-amber-900/80">
                    {(selectedOrder as any).courierTrackingCode ? (
                      <>বুকড ট্র্যাকিং কোড: <strong className="font-mono text-amber-950 font-bold">{(selectedOrder as any).courierTrackingCode}</strong> ({(selectedOrder as any).courierProvider || 'Steadfast'})</>
                    ) : (
                      '১-ক্লিকে Steadfast সিস্টেমে বুকিং করে ট্র্যাকিং কোড ও চালান তৈরি করুন'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDispatchCourier}
                  disabled={isDispatching || selectedOrder.orderStatus === 'delivered'}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'বুকিং হচ্ছে...' : (selectedOrder as any).courierTrackingCode ? 'পুনরায় বুকিং' : 'Steadfast-এ বুকিং'}</span>
                </button>
              </div>

              {/* Customer and Delivery info */}
              <div className="space-y-2 text-xs text-stone-700">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="font-bold text-stone-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-mono font-semibold">{selectedOrder.customerPhone}</span>
                  </p>
                  <p className="flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      {selectedOrder.deliveryAddress}, {selectedOrder.district}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase">আইটেম তালিকা</span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-2.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{it.productName}</p>
                        {it.variantSummary && (
                          <p className="text-[10px] text-amber-800">{it.variantSummary}</p>
                        )}
                        <p className="text-[10px] text-stone-400">
                          ৳{it.price} × {it.quantity} (SKU: {it.sku})
                        </p>
                      </div>
                      <span className="font-bold text-stone-900">৳{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>সাব-টোটাল:</span>
                  <span>৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>৳{selectedOrder.deliveryCharge}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>কুপন ছাড় ({selectedOrder.couponCode}):</span>
                    <span>-৳{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-stone-900 border-t border-stone-200 pt-1.5">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-amber-900">৳{selectedOrder.total}</span>
                </div>
              </div>

              {/* Admin Internal Notes (Audit / Operations) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>এডমিন ইন্টারনাল নোট (Admin Notes)</span>
                </span>
                {selectedOrder.adminNotes && (
                  <div className="p-2.5 bg-amber-50/60 rounded-xl text-xs text-stone-700 border border-amber-200 whitespace-pre-line">
                    {selectedOrder.adminNotes}
                  </div>
                )}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newAdminNote || ''}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    placeholder="নোট লিখুন (যেমন: কাস্টমারকে ফোন করে কনফার্ম করা হয়েছে)..."
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
                  >
                    যোগ
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-400 space-y-2">
              <Eye className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-600">বিস্তারিত দেখতে তালিকা থেকে যেকোনো অর্ডার নির্বাচন করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
