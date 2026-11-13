import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Save,
  Search,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { products, updateProductStock, auditLogs, showToast } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});

  const lowStockThresholdDefault = 5;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

    if (filterType === 'low') return matchesSearch && isLow;
    if (filterType === 'out') return matchesSearch && isOut;
    return matchesSearch;
  });

  const handleStockChange = (productId: string, val: number) => {
    setEditingStocks((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleSaveStock = (productId: string) => {
    const newStock = editingStocks[productId];
    if (newStock === undefined) return;
    updateProductStock(productId, newStock);
    setEditingStocks((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
    showToast(`স্টক সফলভাবে ${newStock} pcs এ আপডেট করা হয়েছে।`);
  };

  // Stock audit logs from system auditLogs
  const stockLogs = auditLogs.filter(
    (log) => log.action.toLowerCase().includes('stock') || log.action.toLowerCase().includes('order')
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">
            স্টক ও ইনভেন্টরি কন্ট্রোল (Inventory & Stock Alert)
          </h2>
          <p className="text-xs text-stone-500">
            এক ক্লিকে স্টক বাড়ানো/কমানো, লো-স্টক সতর্কতা ও স্টক হিস্ট্রি লগ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            সকল ({products.length})
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            লো স্টক ({products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length})
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
            }`}
          >
            স্টক শেষ ({products.filter((p) => p.stock <= 0).length})
          </button>
        </div>
      </div>

      {/* Search Field */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="প্রোডাক্ট নাম বা SKU দিয়ে খুঁজুন..."
          className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
      </div>

      {/* Stock Management Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-bold uppercase border-b border-stone-200">
                  <th className="p-3.5">পণ্য</th>
                  <th className="p-3.5">ক্যাটাগরি ও SKU</th>
                  <th className="p-3.5">বর্তমান স্টক</th>
                  <th className="p-3.5">লো স্টক অ্যালার্ট</th>
                  <th className="p-3.5 text-right">কুইক স্টক আপডেট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => {
                  const currentEditStock = editingStocks[p.id] !== undefined ? editingStocks[p.id] : p.stock;
                  const isModified = editingStocks[p.id] !== undefined;
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-stone-500 font-serif">{p.banglaName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-stone-800">{p.subCategory}</p>
                        <p className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</p>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`font-black text-sm ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock} pcs
                        </span>
                        <p className="text-[10px] text-stone-400">
                          {isOut ? 'স্টক শূন্য' : isLow ? 'রি-অর্ডার প্রয়োজন' : 'পর্যাপ্ত'}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-stone-600 font-bold">≤ {p.lowStockThreshold} pcs</span>
                      </td>

                      {/* Quick Adjuster & Save Button */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentEditStock - 1)}
                              className="px-2 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={currentEditStock ?? 0}
                              onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                              className="w-14 text-center text-xs font-bold text-stone-900 border-x border-stone-200 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleStockChange(p.id, currentEditStock + 1)}
                              className="px-2 py-1 text-stone-600 hover:bg-stone-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          {isModified && (
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                              title="Save new stock"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Log / Audit Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm">স্টক পরিবর্তন লগ (Stock Movement)</h3>
            <p className="text-[11px] text-stone-400">অর্ডার ও এডমিন অ্যাকশনের স্বয়ংক্রিয় হিসাব</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {stockLogs.map((log) => (
              <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{log.action}</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">{log.details}</p>
                <p className="text-[10px] text-amber-800 font-semibold">দ্বারা: {log.userName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
