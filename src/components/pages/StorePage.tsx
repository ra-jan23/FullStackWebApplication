"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Star, Plus, Store, Flame, Search, X, Heart, MessageSquare, ThumbsUp,
  GitCompare, Check, Trash2, Package, Tag, Ruler, ArrowLeft,
  ShoppingCart, Layers, Sparkles
} from "lucide-react";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { token, setCurrentPage, searchQuery, setSearchQuery, setFavoritesCount } = useAppStore();

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (token) {
      fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          const ids = new Set((data.favorites || []).map((f: any) => f.productId));
          setFavoriteIds(ids);
          setFavoritesCount(ids.size);
        })
        .catch(() => {});
    }
  }, [token, setFavoritesCount]);

  const addToCart = async (productId: string) => {
    if (!token) { setCurrentPage("login"); toast.error("Please login to add items to cart"); return; }
    try {
      const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId, quantity: 1, size: "M" }) });
      if (res.ok) toast.success("Added to cart!", { description: "Jersey added to your shopping cart" });
    } catch { toast.error("Failed to add to cart"); }
  };

  const toggleFavorite = async (productId: string, productName: string) => {
    if (!token) { setCurrentPage("login"); toast.error("Please login to save favorites"); return; }
    const isFav = favoriteIds.has(productId);
    try {
      if (isFav) {
        const res = await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          setFavoriteIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
          setFavoritesCount(favoriteIds.size - 1);
          toast.success("Removed from favorites", { description: `${productName} removed from wishlist` });
        }
      } else {
        const res = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId }) });
        if (res.ok) {
          setFavoriteIds(prev => new Set(prev).add(productId));
          setFavoritesCount(favoriteIds.size + 1);
          toast.success("Added to favorites!", { description: `${productName} saved to your wishlist` });
        }
      }
    } catch { toast.error("Failed to update favorites"); }
  };

  const toggleCompare = (productId: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < 3) {
        next.add(productId);
      } else {
        toast.error("Maximum 3 items for comparison");
      }
      return next;
    });
  };

  const removeFromComparison = (productId: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const clearComparison = () => {
    setCompareIds(new Set());
    setShowComparison(false);
  };

  const compareProducts = products.filter(p => compareIds.has(p.id));

  const featured = products.filter(p => p.featured);
  const searchFiltered = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.team.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;
  const filtered = searchFiltered !== null
    ? searchFiltered
    : filter === "featured" ? featured : filter === "all" ? products : products.filter(p => p.team.toLowerCase().includes(filter.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.price;
    return 0;
  });

  // Find min/max prices for bar-fill-left visual bars
  const comparePrices = compareProducts.map(p => p.price);
  const minPrice = comparePrices.length > 0 ? Math.min(...comparePrices) : 0;
  const maxPrice = comparePrices.length > 0 ? Math.max(...comparePrices) : 0;
  const priceRange = maxPrice - minPrice || 1;

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div></div>;

  // Comparison Table View
  if (showComparison && compareProducts.length >= 2) {
    return <ComparisonView
      compareProducts={compareProducts}
      minPrice={minPrice}
      maxPrice={maxPrice}
      priceRange={priceRange}
      addToCart={addToCart}
      onRemove={removeFromComparison}
      onBack={() => setShowComparison(false)}
    />;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Official Jersey Store</h1>
          <p className="text-muted-foreground">Authentic football jerseys from the world&apos;s biggest clubs</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => setSizeGuideOpen(true)}
            >
              <Ruler className="w-4 h-4" />
              Size Guide
            </Button>
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              className={`gap-2 rounded-lg ${compareMode ? 'shadow-md shadow-primary/25' : ''}`}
              onClick={() => { setCompareMode(!compareMode); if (compareMode) { setCompareIds(new Set()); setShowComparison(false); } }}
            >
              <GitCompare className="w-4 h-4" />
              {compareMode ? 'Exit Compare' : 'Compare'}
            </Button>
          </div>
        </div>
      </div>

      {compareMode && (
        <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-fade-in">
          <GitCompare className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">
            Compare mode: Select up to 3 jerseys to compare ({compareIds.size} selected)
          </span>
          {compareIds.size > 0 && (
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1" onClick={() => setCompareIds(new Set())}>
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>
      )}

      {searchQuery && (
        <div className="mb-6 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-3 py-1.5"><Search className="w-3 h-3" /> Results for &ldquo;{searchQuery}&rdquo; ({filtered.length})</Badge>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSearchQuery("")}><X className="w-3 h-3 mr-1" /> Clear</Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {["all", "featured"].map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="rounded-lg" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
        <div className="ml-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 rounded-lg"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filter === "all" && !showComparison && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Featured Jerseys</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((product) => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} isFavorite={favoriteIds.has(product.id)} compareMode={compareMode} isCompared={compareIds.has(product.id)} onToggleCompare={() => toggleCompare(product.id)} />))}
          </div>
        </div>
      )}

      {!showComparison && <h2 className="text-xl font-bold mb-4">All Jerseys</h2>}
      {!showComparison && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sorted.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} isFavorite={favoriteIds.has(product.id)} compareMode={compareMode} isCompared={compareIds.has(product.id)} onToggleCompare={() => toggleCompare(product.id)} />))}
        </div>
      )}
      {!showComparison && sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><Store className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No jerseys found matching {searchQuery ? `"${searchQuery}"` : "your filter"}.</p></div>
      )}

      {/* Floating Compare Bar */}
      {compareIds.size > 0 && !showComparison && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
          <div className="max-w-2xl mx-auto card-glass rounded-2xl border shadow-xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {compareProducts.map(p => (
                  <img
                    key={p.id}
                    src={p.image}
                    alt={p.name}
                    className="w-9 h-9 rounded-full border-2 border-background object-cover shadow-sm"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">
                {compareIds.size} item{compareIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={clearComparison}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button
                size="sm"
                className="gap-2 rounded-lg shadow-md shadow-primary/20"
                onClick={() => setShowComparison(true)}
                disabled={compareIds.size < 2}
              >
                <GitCompare className="w-4 h-4" />
                Compare ({compareIds.size})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Dialog */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              Jersey Size Guide
            </DialogTitle>
            <DialogDescription>Find your perfect fit</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border overflow-hidden">
            <table className="size-guide-table w-full text-sm">
              <thead>
                <tr className="bg-muted/80">
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Chest (in)</th>
                  <th className="px-4 py-3 text-left font-semibold">Waist (in)</th>
                  <th className="px-4 py-3 text-left font-semibold">Length (in)</th>
                  <th className="px-4 py-3 text-left font-semibold">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["XS", "34-36", "28-30", "26", "34-36"],
                  ["S", "36-38", "30-32", "27", "36-38"],
                  ["M", "38-40", "32-34", "28", "38-40"],
                  ["L", "40-42", "34-36", "29", "40-42"],
                  ["XL", "42-44", "36-38", "30", "42-44"],
                  ["XXL", "44-46", "38-40", "31", "44-46"],
                  ["3XL", "46-48", "40-42", "32", "46-48"],
                ].map(([size, chest, waist, length, hip], i) => (
                  <tr key={size} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="px-4 py-2.5 font-medium">{size}</td>
                    <td className="px-4 py-2.5">{chest}</td>
                    <td className="px-4 py-2.5">{waist}</td>
                    <td className="px-4 py-2.5">{length}</td>
                    <td className="px-4 py-2.5">{hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
            <Sparkles className="w-3 h-3 inline mr-1" />
            <strong>Tip:</strong> For a relaxed fit, size up. For a tight fit, size down.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ========== Comparison Table View ========== */

function ComparisonView({
  compareProducts,
  minPrice,
  maxPrice,
  priceRange,
  addToCart,
  onRemove,
  onBack,
}: {
  compareProducts: any[];
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  addToCart: (id: string) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-primary" />
            Product Comparison
          </h1>
          <p className="text-sm text-muted-foreground">Comparing {compareProducts.length} jersey{compareProducts.length !== 1 ? 's' : ''} side by side</p>
        </div>
      </div>

      {/* Comparison Table - horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 pb-4">
        <div className="min-w-[640px]">
          {/* Product Headers */}
          <div className="grid gap-0" style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
            <div /> {/* Empty label cell */}
            {compareProducts.map((p, idx) => (
              <div
                key={p.id}
                className={`comparison-slide comparison-divider text-center p-4 ${idx < compareProducts.length - 1 ? '' : ''}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative inline-block">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-28 h-28 object-cover rounded-2xl mx-auto shadow-lg mb-3"
                  />
                  <button
                    onClick={() => onRemove(p.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    title="Remove from comparison"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-semibold text-sm">{p.name}</h3>
                <Badge variant="outline" className="text-xs mt-1">{p.team}</Badge>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          <Card className="mt-2 overflow-hidden border">
            <CardContent className="p-0">
              <div className="grid gap-0" style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
                {/* Image Row */}
                <ComparisonLabelRow label="Image" icon={<Layers className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 text-center comparison-divider comparison-slide ${idx < compareProducts.length - 1 ? '' : ''}`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full max-w-[200px] aspect-square object-cover rounded-xl mx-auto shadow-md"
                    />
                  </div>
                ))}

                {/* Name Row */}
                <ComparisonLabelRow label="Name" icon={<Tag className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-center comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                  >
                    <span className="font-semibold text-sm text-center">{p.name}</span>
                  </div>
                ))}

                {/* Team Row */}
                <ComparisonLabelRow label="Team" icon={<Sparkles className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-center comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                  >
                    <Badge variant="secondary" className="text-xs">{p.team}</Badge>
                  </div>
                ))}

                {/* Category Row */}
                <ComparisonLabelRow label="Category" icon={<Layers className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-center comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                  >
                    <span className="text-sm capitalize">{p.category || 'Jersey'}</span>
                  </div>
                ))}

                {/* Price Row - highlight lowest in green */}
                <ComparisonLabelRow label="Price" icon={<Tag className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => {
                  const isLowest = p.price === minPrice;
                  const fillPct = priceRange > 0 ? ((p.price - minPrice) / priceRange) * 100 : 50;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 flex flex-col items-center justify-center gap-2 comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                    >
                      <span className={`text-xl font-bold ${isLowest ? 'text-green-500 dark:text-green-400' : ''}`}>
                        £{p.price.toFixed(2)}
                      </span>
                      {isLowest && (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px]">
                          <Check className="w-2.5 h-2.5 mr-0.5" /> Lowest
                        </Badge>
                      )}
                      {/* Visual price range bar */}
                      <div className="w-full max-w-[140px] h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bar-fill-left bg-gradient-to-r from-green-400 to-primary"
                          style={{ width: `${Math.max(fillPct, 15)}%` }}
                        />
                      </div>
                      {maxPrice > minPrice && (
                        <span className="text-[10px] text-muted-foreground">
                          {isLowest ? 'Best value' : `+£${(p.price - minPrice).toFixed(0)} from lowest`}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Rating Row */}
                <ComparisonLabelRow label="Rating" icon={<Star className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex flex-col items-center justify-center gap-1.5 comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                  >
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= Math.round(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{p.rating.toFixed(1)}</span>
                  </div>
                ))}

                {/* Sizes Available Row */}
                <ComparisonLabelRow label="Sizes Available" icon={<Ruler className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => {
                  const sizes = p.sizes?.split(",") || ["M"];
                  return (
                    <div
                      key={p.id}
                      className={`p-4 flex items-center justify-center comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                    >
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        {sizes.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-xs font-medium">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Stock Status Row */}
                <ComparisonLabelRow label="Stock Status" icon={<Package className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => {
                  const inStock = p.stock > 20;
                  const lowStock = p.stock > 0 && p.stock <= 20;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 flex flex-col items-center justify-center gap-2 comparison-divider ${idx < compareProducts.length - 1 ? 'border-b border-r border-border/50' : 'border-b border-border/50'}`}
                    >
                      {inStock && (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          <Check className="w-3 h-3 mr-1" /> In Stock
                        </Badge>
                      )}
                      {lowStock && (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          <Package className="w-3 h-3 mr-1" /> Low Stock
                        </Badge>
                      )}
                      {p.stock === 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <X className="w-3 h-3 mr-1" /> Out of Stock
                        </Badge>
                      )}
                      {p.stock > 0 && (
                        <span className="text-[10px] text-muted-foreground">{p.stock} units available</span>
                      )}
                    </div>
                  );
                })}

                {/* Description Row */}
                <ComparisonLabelRow label="Description" icon={<MessageSquare className="w-4 h-4" />} />
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center comparison-divider ${idx < compareProducts.length - 1 ? 'border-r border-border/50' : ''}`}
                  >
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      {p.description || 'No description available.'}
                    </p>
                  </div>
                ))}

                {/* Add to Cart Row */}
                <div /> {/* Empty label cell */}
                {compareProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-center comparison-divider comparison-slide ${idx < compareProducts.length - 1 ? '' : ''}`}
                    style={{ animationDelay: `${idx * 100 + 300}ms` }}
                  >
                    <Button
                      size="sm"
                      className="gap-2 rounded-lg shadow-sm w-full max-w-[200px]"
                      onClick={() => addToCart(p.id)}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Button>
        <p className="text-xs text-muted-foreground">
          {compareProducts.length}/3 items compared
        </p>
      </div>
    </div>
  );
}

/* ========== Comparison Label Row ========== */

function ComparisonLabelRow({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 flex items-center gap-2 bg-muted/30 border-b border-border/50 font-medium text-sm text-muted-foreground">
      {icon}
      {label}
    </div>
  );
}

/* ========== Product Card ========== */

function ProductCard({ product, onAddToCart, onToggleFavorite, isFavorite, compareMode, isCompared, onToggleCompare }: { product: any; onAddToCart: (id: string) => void; onToggleFavorite: (id: string, name: string) => void; isFavorite: boolean; compareMode: boolean; isCompared: boolean; onToggleCompare: () => void }) {
  const [selectedSize, setSelectedSize] = useState("M");
  const sizes = product.sizes?.split(",") || ["M"];
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(product.rating);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || product.rating);
        setTotalReviews(data.totalReviews || 0);
      })
      .catch(() => {});
  }, [product.id, product.rating]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const rating = parseInt(formData.get('rating') as string);
    const title = formData.get('title') as string;
    const comment = formData.get('comment') as string;

    try {
      const token = localStorage.getItem('pv_token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, rating, title, comment }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.updated ? 'Review updated!' : 'Review submitted!', { description: 'Thank you for your feedback' });
        setReviewDialogOpen(false);
        const revRes = await fetch(`/api/reviews?productId=${product.id}`);
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
        setAvgRating(revData.averageRating || product.rating);
        setTotalReviews(revData.totalReviews || 0);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch { toast.error('Failed to submit review'); }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${interactive ? 'cursor-pointer' : ''} ${
              i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            onClick={interactive && onChange ? () => onChange(i) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 card-shine ${isCompared ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : ''}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {product.featured && <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm rounded-lg"><Star className="w-3 h-3 mr-1" /> Featured</Badge>}

          {/* Compare checkbox - top right corner */}
          {compareMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md z-10 ${
                isCompared
                  ? "bg-primary text-primary-foreground scale-100"
                  : "bg-black/40 text-white/80 hover:bg-primary/80 hover:text-white"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {/* Favorite Heart - positioned below compare checkbox when in compare mode */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id, product.name); }}
            className={`absolute ${compareMode ? 'top-14' : 'top-3'} right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isFavorite
                ? "bg-rose-500 text-white scale-100"
                : "bg-black/40 text-white/80 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{product.team}</p>
          <div className="flex items-center gap-2 mb-1">
            {renderStars(Math.round(avgRating))}
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
          </div>
          <button
            onClick={() => setReviewsOpen(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-3"
          >
            <MessageSquare className="w-3 h-3" />
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </button>
          <div className="flex items-center gap-1 mb-3">
            {sizes.map((size: string) => (
              <Button key={size} variant={selectedSize === size ? "default" : "outline"} size="sm" className="h-7 w-8 p-0 text-xs rounded-md" onClick={() => setSelectedSize(size)}>{size}</Button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-lg font-bold text-primary">£{product.price.toFixed(2)}</span>
            <Button size="sm" className="gap-1 rounded-lg shadow-sm" onClick={() => onAddToCart(product.id)}><Plus className="w-3 h-3" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Dialog */}
      <Dialog open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name} - Reviews</DialogTitle>
            <DialogDescription>{totalReviews} review{totalReviews !== 1 ? 's' : ''} &bull; {avgRating.toFixed(1)} average</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{avgRating.toFixed(1)}</div>
              {renderStars(Math.round(avgRating))}
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(i => {
                const count = reviews.filter(r => r.rating === i).length;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{i}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-4 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {review.userName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-medium">{review.userName}</span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm font-medium">{review.title}</p>
                  {review.comment && <p className="text-xs text-muted-foreground mt-1">{review.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>

          <Button className="w-full gap-2 rounded-xl" onClick={() => { setReviewsOpen(false); setTimeout(() => setReviewDialogOpen(true), 100); }}>
            <ThumbsUp className="w-4 h-4" /> Write a Review
          </Button>
        </DialogContent>
      </Dialog>

      {/* Write Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>Share your experience with {product.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReview} className="space-y-4">
            <ReviewStarSelector name="rating" />
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Title *</label>
              <Input name="title" placeholder="Great jersey!" className="rounded-xl h-11" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review</label>
              <Textarea name="comment" placeholder="Tell others about your experience..." className="rounded-xl min-h-[80px]" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl shadow-md shadow-primary/20">Submit Review</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ========== Review Star Selector ========== */

function ReviewStarSelector({ name }: { name: string }) {
  const [rating, setRating] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Rating *</label>
      <input type="hidden" name={name} value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-7 h-7 cursor-pointer transition-all ${
              i <= rating ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
            }`}
            onClick={() => setRating(i)}
          />
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{labels[rating]}</span>}
      </div>
    </div>
  );
}
