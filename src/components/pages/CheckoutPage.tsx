"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, CreditCard, Truck, CheckCircle2, Package,
  MapPin, Phone, Mail, ChevronRight, ShieldCheck, Lock, User, Store
} from "lucide-react";

type Step = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { token, setCurrentPage, checkoutItems, checkoutTotal, setCartCount, clearCheckoutData } = useAppStore();
  const [step, setStep] = useState<Step>('shipping');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping form
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  // Payment form
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const updateShipping = (field: string, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field: string, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    // Format expiry
    if (field === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 3);
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.country || !shipping.phone) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (payment.cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!payment.cardName || !payment.expiry || !payment.cvv) {
      toast.error('Please fill in all payment fields');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: checkoutItems.map((item: any) => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            size: item.size,
            price: item.product.price,
          })),
          total: checkoutTotal,
          address: shipping.address,
          city: shipping.city,
          country: shipping.country,
          postalCode: shipping.postalCode,
          phone: shipping.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.order.id);
        setCartCount(0);
        clearCheckoutData();
        setStep('confirmation');
        toast.success('Order placed successfully!');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { key: 'shipping' as Step, label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
    { key: 'payment' as Step, label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'confirmation' as Step, label: 'Confirmation', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  if (checkoutItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Card className="max-w-md mx-auto text-center p-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-semibold mb-2">No items to checkout</h2>
          <p className="text-muted-foreground mb-6">Your cart is empty. Browse our store to add items.</p>
          <Button className="gap-2 rounded-xl" onClick={() => setCurrentPage("store")}><Store className="w-4 h-4" /> Browse Jerseys</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCurrentPage("cart")}><ArrowLeft className="w-4 h-4" /></Button>
        <div><h1 className="text-3xl font-bold">Checkout</h1><p className="text-muted-foreground">{checkoutItems.length} item{checkoutItems.length !== 1 ? "s" : ""}</p></div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                i < stepIndex ? 'bg-primary border-primary text-primary-foreground' :
                i === stepIndex ? 'border-primary text-primary bg-primary/10' :
                'border-muted text-muted-foreground'
              }`}>
                {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i === stepIndex ? 'text-primary' : ''}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 ${i < stepIndex ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {step === 'shipping' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input placeholder="John Doe" value={shipping.fullName} onChange={e => updateShipping('fullName', e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone *</label>
                    <Input placeholder="+44 7700 900000" value={shipping.phone} onChange={e => updateShipping('phone', e.target.value)} className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address *</label>
                  <Input placeholder="123 Football Lane" value={shipping.address} onChange={e => updateShipping('address', e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input placeholder="London" value={shipping.city} onChange={e => updateShipping('city', e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <Input placeholder="United Kingdom" value={shipping.country} onChange={e => updateShipping('country', e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Postal Code</label>
                    <Input placeholder="SW1A 1AA" value={shipping.postalCode} onChange={e => updateShipping('postalCode', e.target.value)} className="rounded-xl h-11" />
                  </div>
                </div>
                <Button className="w-full gap-2 rounded-xl h-11 mt-4 shadow-md shadow-primary/20" onClick={() => { if (validateShipping()) setStep('payment'); }}>
                  Continue to Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Card Number *</label>
                  <div className="relative">
                    <Input placeholder="4242 4242 4242 4242" value={payment.cardNumber} onChange={e => updatePayment('cardNumber', e.target.value)} className="rounded-xl h-11 pl-4 pr-12" />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cardholder Name *</label>
                  <Input placeholder="John Doe" value={payment.cardName} onChange={e => updatePayment('cardName', e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date *</label>
                    <Input placeholder="MM/YY" value={payment.expiry} onChange={e => updatePayment('expiry', e.target.value)} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CVV *</label>
                    <div className="relative">
                      <Input type="password" placeholder="123" value={payment.cvv} onChange={e => updatePayment('cvv', e.target.value)} className="rounded-xl h-11 pr-12" />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Your payment information is encrypted and secure. This is a demo checkout.</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="gap-2 rounded-xl h-11" onClick={() => setStep('shipping')}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button className="flex-1 gap-2 rounded-xl h-11 shadow-md shadow-primary/20" onClick={() => { if (validatePayment()) handlePlaceOrder(); }} disabled={processing}>
                    {processing ? (
                      <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Place Order &bull; £{checkoutTotal.toFixed(2)}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Confirmed! 🎉</h2>
                <p className="text-muted-foreground mb-6">Your order has been placed successfully</p>
                <div className="bg-background rounded-xl p-4 max-w-sm mx-auto mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-xs">{orderId.slice(0, 8).toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{checkoutItems.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">£{checkoutTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping.city}, {shipping.country}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="bg-primary/10 text-primary border-0">Confirmed</Badge></div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setCurrentPage("store")}><Store className="w-4 h-4" /> Continue Shopping</Button>
                  <Button className="gap-2 rounded-xl" onClick={() => setCurrentPage("dashboard")}><User className="w-4 h-4" /> Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {step !== 'confirmation' && (
          <div>
            <Card className="sticky top-20 shadow-lg">
              <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {checkoutItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size} &bull; Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">£{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>£{checkoutTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">£{checkoutTotal.toFixed(2)}</span></div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
