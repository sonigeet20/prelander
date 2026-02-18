"use client";

import { useState, useMemo } from "react";

/**
 * PriceCompare — Product deal comparison tool for ecommerce/d2c verticals.
 * Users add items to a wishlist, see total + savings analysis,
 * then click to check real prices on the brand's site.
 */

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

interface WishlistItem {
  id: string;
  name: string;
  category: string;
  retailPrice: number;
  quantity: number;
}

const SAMPLE_PRODUCTS = [
  { name: "Wireless Headphones", category: "Electronics", retailPrice: 149.99 },
  { name: "Running Shoes", category: "Footwear", retailPrice: 129.95 },
  { name: "Smart Watch", category: "Electronics", retailPrice: 299.99 },
  { name: "Yoga Mat", category: "Fitness", retailPrice: 49.99 },
  { name: "Laptop Stand", category: "Office", retailPrice: 79.99 },
  { name: "Skincare Set", category: "Beauty", retailPrice: 89.99 },
  { name: "Backpack", category: "Accessories", retailPrice: 69.99 },
  { name: "Water Bottle", category: "Fitness", retailPrice: 34.99 },
  { name: "Sunglasses", category: "Accessories", retailPrice: 159.99 },
  { name: "Protein Powder", category: "Health", retailPrice: 44.99 },
  { name: "Desk Organizer", category: "Office", retailPrice: 39.99 },
  { name: "Phone Case", category: "Electronics", retailPrice: 29.99 },
];

const CATEGORIES = [...new Set(SAMPLE_PRODUCTS.map((p) => p.category))];

export function PriceCompare({
  brandName,
  trackingHref,
  brandDomain,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
}) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const filteredProducts = filterCategory === "All"
    ? SAMPLE_PRODUCTS
    : SAMPLE_PRODUCTS.filter((p) => p.category === filterCategory);

  const addToWishlist = (product: typeof SAMPLE_PRODUCTS[0]) => {
    const existing = wishlist.find((w) => w.name === product.name);
    if (existing) {
      setWishlist((prev) =>
        prev.map((w) => w.name === product.name ? { ...w, quantity: w.quantity + 1 } : w)
      );
    } else {
      setWishlist((prev) => [...prev, { ...product, id: Date.now().toString(), quantity: 1 }]);
    }
    setShowAnalysis(false);
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
    setShowAnalysis(false);
  };

  const analysis = useMemo(() => {
    const subtotal = wishlist.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);
    const totalItems = wishlist.reduce((sum, item) => sum + item.quantity, 0);
    // Simulated discount ranges based on total
    const bulkDiscount = subtotal > 500 ? 15 : subtotal > 200 ? 10 : subtotal > 100 ? 5 : 0;
    const estimatedSavings = subtotal * (bulkDiscount / 100);
    const estimatedTotal = subtotal - estimatedSavings;
    const freeShipping = subtotal > 75;
    const shippingSavings = freeShipping ? 12.99 : 0;

    return { subtotal, totalItems, bulkDiscount, estimatedSavings, estimatedTotal, freeShipping, shippingSavings };
  }, [wishlist]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🛒</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Smart Deal Finder</h3>
            <p className="text-orange-200 text-xs">Build your wishlist and find the best deals</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setFilterCategory("All")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterCategory === "All" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterCategory === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const inWishlist = wishlist.find((w) => w.name === product.name);
            return (
              <button
                key={product.name}
                onClick={() => addToWishlist(product)}
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                  inWishlist
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                }`}
              >
                <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{product.category}</span>
                  <span className="text-xs font-bold text-orange-600">{formatCurrency(product.retailPrice)}</span>
                </div>
                {inWishlist && (
                  <span className="text-[10px] text-orange-600 font-bold">×{inWishlist.quantity} in list</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Wishlist */}
        {wishlist.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold text-gray-700">
                📋 Your Wishlist ({analysis.totalItems} items)
              </p>
              <button
                onClick={() => { setWishlist([]); setShowAnalysis(false); }}
                className="text-[10px] text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate flex-1">
                    {item.name} {item.quantity > 1 && `×${item.quantity}`}
                  </span>
                  <span className="font-bold text-gray-700 mx-2">
                    {formatCurrency(item.retailPrice * item.quantity)}
                  </span>
                  <button onClick={() => removeFromWishlist(item.id)} className="text-gray-400 hover:text-red-500">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAnalysis(true)}
          disabled={wishlist.length === 0}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {wishlist.length === 0 ? "Add items to get started" : "Analyze Deals & Savings"}
        </button>

        {showAnalysis && wishlist.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Retail Total</p>
                <p className="text-lg font-extrabold text-gray-700 line-through decoration-red-400">{formatCurrency(analysis.subtotal)}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Savings</p>
                <p className="text-lg font-extrabold text-emerald-600">-{formatCurrency(analysis.estimatedSavings + analysis.shippingSavings)}</p>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">You Pay</p>
                <p className="text-xl font-extrabold text-pink-700">{formatCurrency(analysis.estimatedTotal)}</p>
              </div>
            </div>

            {/* Savings breakdown */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-2">💰 Savings Breakdown</p>
              <div className="space-y-1.5">
                {analysis.bulkDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Bundle discount ({analysis.bulkDiscount}%)</span>
                    <span className="font-bold">-{formatCurrency(analysis.estimatedSavings)}</span>
                  </div>
                )}
                {analysis.freeShipping && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Free shipping (orders $75+)</span>
                    <span className="font-bold">-{formatCurrency(analysis.shippingSavings)}</span>
                  </div>
                )}
                {analysis.bulkDiscount === 0 && (
                  <p className="text-xs text-amber-600">💡 Add more items to unlock bundle discounts!</p>
                )}
              </div>
            </div>

            <a
              href={trackingHref}
              className="block w-full text-center py-3.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
              rel="nofollow sponsored"
            >
              <span className="flex items-center justify-center gap-2">
                Shop These Deals on {brandName}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              Check live prices and current promotions on {brandDomain}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
