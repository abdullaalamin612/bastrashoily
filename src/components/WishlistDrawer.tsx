import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, ShoppingBasket, Trash2, Heart, ArrowRight } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    products,
    isWishlistOpen,
    closeWishlist,
    toggleWishlist,
    addToCart,
    navigateToProduct,
    navigateToCategory,
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">পছন্দের তালিকা (Wishlist)</h2>
                <p className="text-xs text-stone-500">
                  {wishlistProducts.length} টি পণ্য সংরক্ষিত আছে
                </p>
              </div>
            </div>
            <button
              onClick={closeWishlist}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">আপনার পছন্দের তালিকা ফাঁকা</h3>
                  <p className="text-xs text-stone-500 max-w-xs">
                    পণ্য ব্রাউজ করার সময় হার্ট আইকনে ক্লিক করে পছন্দের তালিকা তৈরি করুন।
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeWishlist();
                    navigateToCategory('all');
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>পোশাক কালেকশন দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex gap-3 group hover:border-amber-400 transition-colors"
                >
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    onClick={() => {
                      closeWishlist();
                      navigateToProduct(product.slug);
                    }}
                    className="w-20 h-24 object-cover rounded-xl bg-white shrink-0 cursor-pointer group-hover:scale-102 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            closeWishlist();
                            navigateToProduct(product.slug);
                          }}
                          className="font-bold text-xs text-stone-900 line-clamp-1 cursor-pointer hover:text-amber-800 transition-colors"
                        >
                          {product.banglaName || product.name}
                        </h4>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="তালিকা থেকে সরান"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{product.subCategory} • {product.brand}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60 mt-2">
                      <span className="font-extrabold text-stone-900 text-xs">
                        ৳{product.discountPrice || product.price}
                      </span>
                      <button
                        onClick={() => {
                          addToCart(product, product.variants?.[0], 1);
                          closeWishlist();
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        <ShoppingBasket className="w-3 h-3" />
                        <span>ঝুড়িতে যোগ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <button
                onClick={() => {
                  wishlistProducts.forEach((p) => {
                    addToCart(p, p.variants?.[0], 1);
                  });
                  closeWishlist();
                }}
                className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShoppingBasket className="w-4 h-4" />
                <span>সবগুলো ঝুড়িতে যোগ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
