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
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Star, Plus, Store, Flame, Search, X, Heart, MessageSquare, ThumbsUp,
  GitCompare, Check, Trash2, Package, Tag, Ruler
} from "lucide-react";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
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

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Official Jersey Store</h1>
          <p className="text-muted-foreground">Authentic football jerseys from the world&apos;s biggest clubs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            className={`gap-2 rounded-lg ${compareMode ? 'shadow-md shadow-primary/25' : ''}`}
            onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareIds(new Set()); }}
          >
            <GitCompare className="w-4 h-4" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </Button>
          {compareMode && compareIds.size > 0 && (
            <Button
              size="sm"
              className="gap-2 rounded-lg"
              onClick={() => setCompareOpen(true)}
              disabled={compareIds.size < 2}
            >
              Compare ({compareIds.size}/3)
            </Button>
          )}
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

      {filter === "all" && (
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

      <h2 className="text-xl font-bold mb-4">All Jerseys</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} isFavorite={favoriteIds.has(product.id)} compareMode={compareMode} isCompared={compareIds.has(product.id)} onToggleCompare={() => toggleCompare(product.id)} />))}
      </div>
      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><Store className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No jerseys found matching {searchQuery ? `"${searchQuery}"` : "your filter"}.</p></div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-primary" />
              Jersey Comparison
            </DialogTitle>
            <DialogDescription>Side-by-side comparison of {compareProducts.length} jerseys</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {/* Header row */}
            <div className="space-y-3" />
            {compareProducts.map((p) => (
              <div key={p.id} className="text-center space-y-3">
                <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-xl mx-auto shadow-md" />
                <h3 className="font-semibold text-sm">{p.name}</h3>
                <Badge variant="outline" className="text-xs">{p.team}</Badge>
              </div>
            ))}

            {/* Comparison rows */}
            {[
              { label: 'Price', icon: <Tag className="w-4 h-4" />, render: (p: any) => <span className="text-lg font-bold text-primary">£{p.price.toFixed(2)}</span>, best: (items: any[]) => Math.min(...items.map((i: any) => i.price)) },
              { label: 'Rating', icon: <Star className="w-4 h-4" />, render: (p: any) => <div><div className="flex gap-0.5 justify-center">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(p.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div><span className="text-sm font-medium">{p.rating.toFixed(1)}</span></div>, best: (items: any[]) => Math.max(...items.map((i: any) => i.rating)) },
              { label: 'Sizes Available', icon: <Ruler className="w-4 h-4" />, render: (p: any) => <div className="flex gap-1 justify-center flex-wrap">{(p.sizes?.split(',') || []).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>, best: () => 0 },
              { label: 'Stock', icon: <Package className="w-4 h-4" />, render: (p: any) => <Badge variant={p.stock > 20 ? 'default' : p.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</Badge>, best: (items: any[]) => Math.max(...items.map((i: any) => i.stock)) },
              { label: 'Featured', icon: <Check className="w-4 h-4" />, render: (p: any) => p.featured ? <Badge className="bg-amber-500 text-white text-xs"><Star className="w-3 h-3 mr-1" />Featured</Badge> : <span className="text-muted-foreground text-xs">No</span>, best: () => 0 },
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm font-medium">
                  {row.icon} {row.label}
                </div>
                {compareProducts.map((p) => {
                  const bestVal = row.best ? row.best(compareProducts) : 0;
                  const isBest = row.label === 'Price' ? p.price === bestVal : row.label === 'Rating' ? p.rating === bestVal : row.label === 'Stock' ? p.stock === bestVal : false;
                  return (
                    <div key={p.id} className={`p-3 rounded-lg text-center ${isBest ? 'bg-primary/5 border border-primary/20' : ''}`}>
                      {row.render(p)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            {compareProducts.map((p) => (
              <Button key={p.id} size="sm" className="flex-1 rounded-lg gap-1" onClick={() => { addToCart(p.id); setCompareOpen(false); }}>
                <Plus className="w-3 h-3" /> Add {p.team.split(' ')[0]}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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

          {/* Compare checkbox */}
          {compareMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
              className={`absolute top-3 left-3 ${product.featured ? 'left-24' : ''} w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md z-10 ${
                isCompared
                  ? "bg-primary text-primary-foreground scale-100"
                  : "bg-black/40 text-white/80 hover:bg-primary/80 hover:text-white"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {/* Favorite Heart */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id, product.name); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
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
