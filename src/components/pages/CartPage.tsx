"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart, Store, ArrowLeft, CreditCard, Trash2, Minus, Plus, Tag
} from "lucide-react";

export default function CartPage() {
  const { token, setCurrentPage, setCartCount, setCheckoutData } = useAppStore();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

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

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const item = cartItems.find(i => i.id === id);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: item.product.id, quantity: newQty, size: item.size }),
      });
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
      setCartCount((data.cartItems || []).length);
    } catch { toast.error("Failed to update quantity"); }
  };

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

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "pitch20") {
      const discountAmount = total * 0.2;
      setDiscount(discountAmount);
      setPromoApplied(true);
      toast.success("Promo code applied! 20% off", { description: `You saved £${discountAmount.toFixed(2)}` });
    } else if (promoCode.toLowerCase() === "football10") {
      const discountAmount = total * 0.1;
      setDiscount(discountAmount);
      setPromoApplied(true);
      toast.success("Promo code applied! 10% off", { description: `You saved £${discountAmount.toFixed(2)}` });
    } else {
      toast.error("Invalid promo code", { description: "Try PITCH20 or FOOTBALL10" });
    }
  };

  const handleCheckout = () => {
    setCheckoutData(cartItems, total - discount);
    setCurrentPage("checkout");
    window.scrollTo(0, 0);
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
              <Card key={item.id} className="hover:shadow-md transition-all duration-300 card-shine">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl" />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.product.team} &bull; Size: {item.size}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-primary text-lg">£{(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive rounded-lg hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="sticky top-20 shadow-lg border-2">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">£{total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
                {promoApplied && (
                  <div className="flex justify-between text-sm"><span className="text-primary">Discount</span><span className="text-primary font-medium">-£{discount.toFixed(2)}</span></div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">£{(total - discount).toFixed(2)}</span></div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="rounded-xl h-10 pl-9 text-sm" disabled={promoApplied} />
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-10" onClick={applyPromo} disabled={promoApplied || !promoCode}>
                      {promoApplied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                  {promoApplied && <p className="text-xs text-primary">🎉 Promo code applied successfully!</p>}
                </div>

                <Button className="w-full gap-2 rounded-xl shadow-md shadow-primary/20 h-12 text-base" onClick={handleCheckout}>
                  <CreditCard className="w-5 h-5" /> Proceed to Checkout
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <span>🔒</span> Secure checkout powered by Stripe (demo)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
