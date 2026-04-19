"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Package, Truck, CheckCircle2, Clock, ArrowLeft, Store,
  ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, ExternalLink, ShoppingBag
} from "lucide-react";

type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
}

interface Order {
  id: string;
  items: string;
  total: number;
  status: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <CheckCircle2 className="w-4 h-4" />, step: 1 },
  processing: { label: 'Processing', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Clock className="w-4 h-4" />, step: 2 },
  shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: <Truck className="w-4 h-4" />, step: 3 },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: <Package className="w-4 h-4" />, step: 4 },
};

export default function OrdersPage() {
  const { token, setCurrentPage } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40 rounded-2xl mb-4" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCurrentPage("dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track your purchases and order history</p>
          </div>
        </div>
        <Card className="max-w-lg mx-auto text-center p-12">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">You haven't placed any orders. Browse our store to find the perfect jersey!</p>
          <Button className="gap-2 rounded-xl shadow-md shadow-primary/20" onClick={() => setCurrentPage("store")}>
            <Store className="w-4 h-4" /> Browse Jerseys
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCurrentPage("dashboard")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''} &bull; Track and manage purchases</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, icon: <Package className="w-4 h-4 text-primary" /> },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
          { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: <Truck className="w-4 h-4 text-purple-500" /> },
          { label: 'Total Spent', value: `£${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, icon: <CreditCard className="w-4 h-4 text-amber-500" /> },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-lg font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order, index) => {
          const items: OrderItem[] = JSON.parse(order.items || '[]');
          const isExpanded = expandedId === order.id;
          const config = statusConfig[order.status] || statusConfig.confirmed;

          return (
            <Card
              key={order.id}
              className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg border-primary/20' : 'hover:shadow-md'}`}
            >
              <div
                className="cursor-pointer p-5"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Order info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <Badge variant="outline" className={`${config.color} text-xs rounded-lg border`}>
                        {config.icon} {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                      <p className="text-lg font-bold text-primary">£{order.total.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 animate-fade-in">
                  <Separator className="mb-4" />

                  {/* Progress Tracker */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Order Progress</p>
                    <div className="flex items-center gap-1">
                      {Object.entries(statusConfig).map(([key, cfg], i) => {
                        const isActive = cfg.step <= (statusConfig[order.status]?.step || 1);
                        const isCurrent = key === order.status;
                        return (
                          <React.Fragment key={key}>
                            <div className={`flex items-center gap-2 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCurrent ? 'border-primary bg-primary text-primary-foreground animate-glow-pulse' :
                                cfg.step < (statusConfig[order.status]?.step || 1) ? 'border-primary bg-primary text-primary-foreground' :
                                'border-muted'
                              }`}>
                                {cfg.step < (statusConfig[order.status]?.step || 1) ? <CheckCircle2 className="w-4 h-4" /> : cfg.icon}
                              </div>
                              <span className={`text-xs font-medium hidden sm:inline ${isCurrent ? 'text-primary' : ''}`}>{cfg.label}</span>
                            </div>
                            {i < 3 && (
                              <div className={`flex-1 h-0.5 mx-1 ${cfg.step < (statusConfig[order.status]?.step || 1) ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Items Ordered</p>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} &bull; Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Shipping Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>{order.address}, {order.city}, {order.country} {order.postalCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span>Tracking: <span className="font-mono text-xs">PV{order.id.slice(0, 10).toUpperCase()}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Order Total</span>
                    <span className="text-xl font-bold text-primary">£{order.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
