import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBasket, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    cartComboDiscount,
    deliveryConfig,
    navigateToCheckout,
    setDirectBuyItem,
  } = useShop();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = deliveryConfig.freeDeliveryThreshold || 2000;
  const freeShippingNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  const handleCheckout = () => {
    setDirectBuyItem(null);
    setIsCartOpen(false);
    navigateToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBasket className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-stone-900 text-lg">আপনার শপিং ঝুড়ি</h2>
              <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50 p-3.5 border-b border-amber-200/60 text-xs text-amber-900">
            <div className="flex items-center gap-2 mb-1.5 font-medium">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              {freeShippingNeeded > 0 ? (
                <span>
                  আর মাত্র <strong className="text-amber-950 font-bold">৳{freeShippingNeeded}</strong> টাকার অর্ডার করলে{' '}
                  <span className="text-emerald-700 font-bold">ফ্রি ডেলিভারি!</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!</span>
              )}
            </div>
            <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-stone-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  <ShoppingBasket className="w-7 h-7" />
                </div>
                <p className="font-bold text-stone-800 text-base">আপনার ঝুড়ি বর্তমানে খালি</p>
                <p className="text-sm text-stone-500 max-w-xs mx-auto">
                  আমাদের ঐতিহ্যবাহী লুঙ্গি, পাঞ্জাবি বা শাড়ির সংগ্রহ ঘুরে দেখুন এবং পছন্দের পণ্য যোগ করুন।
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              cart.map((cartItem) => (
                <div key={cartItem.item.sku} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.productName}
                    className="w-16 h-20 object-cover rounded-xl border border-stone-200 shrink-0 bg-stone-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-800 text-xs sm:text-sm line-clamp-1">
                      {cartItem.item.productName}
                    </h4>
                    {cartItem.item.banglaName && (
                      <p className="text-xs text-stone-500 line-clamp-1">{cartItem.item.banglaName}</p>
                    )}
                    {cartItem.item.variantSummary && (
                      <span className="inline-block text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md mt-1 border border-stone-200">
                        {cartItem.item.variantSummary}
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateCartQty(cartItem.item.sku, cartItem.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateCartQty(cartItem.item.sku, cartItem.quantity + 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-stone-900 text-sm">
                          ৳{cartItem.item.price * cartItem.quantity}
                        </p>
                        <p className="text-[10px] text-stone-400">৳{cartItem.item.price} each</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(cartItem.item.sku)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-stone-600 font-medium">সাব-টোটাল (Subtotal):</span>
                  <span className="text-base font-bold text-stone-900">৳{cartSubtotal}</span>
                </div>
                {cartComboDiscount > 0 && (
                  <div className="flex justify-between items-center text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <span className="font-bold flex items-center gap-1">
                      <span>🎁</span>
                      <span>কম্বো অফার বিশেষ ছাড়:</span>
                    </span>
                    <span className="font-bold">-৳{cartComboDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1 border-t border-stone-200">
                  <span className="text-stone-900 font-bold">আনুমানিক মোট (Estimated):</span>
                  <span className="text-xl font-black text-amber-800">৳{Math.max(0, cartSubtotal - cartComboDiscount)}</span>
                </div>
              </div>
              <p className="text-xs text-stone-500">
                ডেলিভারি চার্জ চেকআউট ধাপে আপনার জেলা অনুযায়ী যুক্ত হবে।
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-stone-900/10 active:scale-95 transition-all cursor-pointer"
                >
                  <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => clearCart()}
                  className="w-full py-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors text-center"
                >
                  ব্যাগ খালি করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
