"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, Store, ArrowLeft, CreditCard, Trash2
} from "lucide-react";

export default function CartPage() {
  const { token, setCurrentPage, setCartCount } = useAppStore();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
      setCartCount((data.cartItems || []).length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, setCartCount]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const removeFromCart = async (id: string) => {
    try {
      const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
      setCartCount((data.cartItems || []).length);
      toast.success("Item removed from cart");
    } catch { toast.error("Failed to remove item"); }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl mb-4" />)}</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCurrentPage("store")}><ArrowLeft className="w-4 h-4" /></Button>
        <div><h1 className="text-3xl font-bold">Shopping Cart</h1><p className="text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p></div>
      </div>
      {cartItems.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse our jersey store to find your perfect kit</p>
          <Button className="gap-2 rounded-xl" onClick={() => setCurrentPage("store")}><Store className="w-4 h-4" /> Browse Jerseys</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.product.team} &bull; Size: {item.size}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">£{(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive rounded-lg" onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="sticky top-20 shadow-lg">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">£{total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">£{total.toFixed(2)}</span></div>
                <Button className="w-full gap-2 rounded-xl shadow-md shadow-primary/20 h-11" onClick={() => toast.success("Checkout is for demo purposes only!")}><CreditCard className="w-4 h-4" /> Checkout</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
