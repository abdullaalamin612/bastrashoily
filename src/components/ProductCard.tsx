import React from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { ShoppingBasket, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateToProduct, addToCart, toggleWishlist, isInWishlist, getComboDiscountForProduct, comboOffers } = useShop();

  const isLiked = isInWishlist(product.id);
  const comboDiscount = getComboDiscountForProduct(product);
  
  let effectivePrice = product.price;
  let originalPrice = product.price;
  let isDiscounted = false;
  let discountBadgeText = '';

  const hasActiveCombo = comboOffers && comboOffers.some((c) => c.isActive !== false && (c as any).active !== 0);

  if (comboDiscount && comboDiscount.hasDiscount) {
    effectivePrice = comboDiscount.discountedPrice;
    originalPrice = product.price;
    isDiscounted = true;
    discountBadgeText = comboDiscount.discountBadge;
  } else if (!hasActiveCombo && product.discountPrice && product.discountPrice < product.price) {
    effectivePrice = product.discountPrice;
    originalPrice = product.price;
    isDiscounted = true;
    const pct = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    discountBadgeText = `${pct}% ছাড়`;
  }

  const productIdentifier = product.slug?.trim() || product.id;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToProduct(productIdentifier);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.variants?.[0], 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => navigateToProduct(productIdentifier)}
      className="group bg-white rounded-2xl border border-stone-200/80 hover:border-amber-500 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Photo with Badge & Wishlist Love Icon at Top */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-stone-100">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top-Left Discount Badge directly on top of cover image */}
        {isDiscounted && discountBadgeText && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#2B1208] text-[#F7EEDB] border border-[#DFB788]/60 text-[10px] sm:text-[11px] font-black shadow-md tracking-wider flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6A868] inline-block animate-pulse" />
            <span>{discountBadgeText}</span>
          </div>
        )}

        {/* Top-Right Wishlist Love Icon */}
        <button
          onClick={handleWishlistToggle}
          title={isLiked ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-stone-200/80 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-500 hover:text-rose-500'
            }`}
          />
        </button>
      </div>

      {/* Minimal Product Info & Actions */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Product Name */}
          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm sm:text-base font-black text-stone-900">
              ৳{effectivePrice}
            </span>
            {isDiscounted && (
              <span className="text-[11px] text-stone-400 line-through">
                ৳{originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions: Small Jhuri Cart Icon + Small Buy Now Button */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-stone-100">
          <button
            onClick={handleAddToCart}
            title="ঝুড়িতে যোগ করুন"
            className="p-1.5 sm:p-2 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 transition-colors cursor-pointer shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingBasket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={handleBuyNow}
            title="পণ্যটির বিস্তারিত দেখতে ও সরাসরি কিনতে ক্লিক করুন"
            className="flex-1 py-1.5 px-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer shadow-xs active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
