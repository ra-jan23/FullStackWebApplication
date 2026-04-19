"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart, Trash2, ShoppingBag, Store, Plus, Star, X,
} from "lucide-react";

interface FavoriteProduct {
  id: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    team: string;
    price: number;
    image: string;
    rating: number;
    stock: number;
    sizes: string;
  };
}

export default function FavoritesPage() {
  const { user, token, setCurrentPage, setCartCount } = useAppStore();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (token) loadFavorites();
    else setLoading(false);
  }, [token]);

  const loadFavorites = async () => {
    try {
      const res = await fetch("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: string, productName: string) => {
    setRemoving(productId);
    try {
      const res = await fetch(`/api/favorites?productId=${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.productId !== productId));
        useAppStore.getState().setFavoritesCount(favorites.length - 1);
        toast.success("Removed from favorites", { description: `${productName} removed from your wishlist.` });
      }
    } catch {
      toast.error("Failed to remove favorite");
    } finally {
      setRemoving(null);
    }
  };

  const addToCart = async (productId: string, productName: string) => {
    if (!token) {
      setCurrentPage("login");
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1, size: "M" }),
      });
      if (res.ok) {
        toast.success("Added to cart!", { description: `${productName} added to your cart.` });
        // Refresh cart count
        const cartRes = await fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartCount(cartData.cartItems?.length || 0);
        }
      }
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const addAllToCart = async () => {
    let successCount = 0;
    for (const fav of favorites) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: fav.productId, quantity: 1, size: "M" }),
        });
        if (res.ok) successCount++;
      } catch {
        // skip
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} item(s) added to cart!`);
      const cartRes = await fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartCount(cartData.cartItems?.length || 0);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500" /> My Favorites
          </h1>
          <p className="text-muted-foreground">
            {favorites.length > 0
              ? `You have ${favorites.length} saved item${favorites.length !== 1 ? "s" : ""}`
              : "Your wishlist is empty"}
          </p>
        </div>
        {favorites.length > 0 && (
          <Button onClick={addAllToCart} className="gap-2 rounded-xl shadow-md shadow-primary/20 self-start">
            <ShoppingBag className="w-4 h-4" /> Add All to Cart
          </Button>
        )}
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <Card key={fav.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={fav.product.image}
                  alt={fav.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(fav.productId, fav.product.name)}
                  disabled={removing === fav.productId}
                >
                  {removing === fav.productId ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 truncate">{fav.product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{fav.product.team}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{fav.product.rating}</span>
                  <span className="text-xs text-muted-foreground">({fav.product.stock} in stock)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-lg font-bold text-primary">£{fav.product.price.toFixed(2)}</span>
                  <Button size="sm" className="gap-1 rounded-lg shadow-sm" onClick={() => addToCart(fav.productId, fav.product.name)}>
                    <Plus className="w-3 h-3" /> Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start exploring the jersey store and tap the heart icon to save your favorite items here.
          </p>
          <Button onClick={() => setCurrentPage("store")} className="gap-2 rounded-xl shadow-md shadow-primary/20">
            <Store className="w-4 h-4" /> Browse Jersey Store
          </Button>
        </div>
      )}
    </div>
  );
}
