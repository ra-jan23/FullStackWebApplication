"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag, Store, MapPin, Phone, Calendar, Package,
  Truck, CheckCircle2, Clock, ChevronDown, ChevronUp
} from "lucide-react";

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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  confirmed: {
    label: "Confirmed",
    color: "text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
    bg: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  },
  shipped: {
    label: "Shipped",
    color: "text-blue-700",
    icon: <Truck className="w-3 h-3" />,
    bg: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    icon: <CheckCircle2 className="w-3 h-3" />,
    bg: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
};

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.confirmed;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${config.bg}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEstimatedDates(orderDate: string) {
  const placed = new Date(orderDate);
  const shipped = new Date(placed);
  shipped.setDate(shipped.getDate() + 3);
  const delivered = new Date(placed);
  delivered.setDate(delivered.getDate() + 6);
  return {
    placed: placed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    shipped: shipped.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    delivered: delivered.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function OrderTimeline({ status, orderDate }: { status: string; orderDate: string }) {
  const dates = getEstimatedDates(orderDate);

  const steps: { label: string; date: string; state: "completed" | "active" | "pending" }[] = [
    { label: "Order Placed", date: dates.placed, state: "completed" },
    { label: "Shipped", date: dates.shipped, state: "pending" },
    { label: "Delivered", date: dates.delivered, state: "pending" },
  ];

  if (status === "shipped") {
    steps[1].state = "active";
  } else if (status === "delivered") {
    steps[1].state = "completed";
    steps[2].state = "completed";
  }

  return (
    <div className="pt-4 pb-1">
      <div className="timeline-track">
        {steps.map((step, idx) => {
          let dotClass = "timeline-dot";
          let connectorClass = "timeline-step";
          if (step.state === "completed") {
            dotClass += " completed";
            connectorClass += " completed-connector";
          } else if (step.state === "active") {
            dotClass += " active";
            connectorClass += " active-connector";
          }

          const icon =
            step.state === "completed" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : step.state === "active" ? (
              idx === 1 ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />
            ) : (
              <Clock className="w-3 h-3" />
            );

          return (
            <div key={idx} className={connectorClass}>
              <div className={dotClass}>{icon}</div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${step.state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className={`text-[10px] mt-0.5 ${step.state === "pending" ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                  {step.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { token, setCurrentPage } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1">View and track your order history</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl hidden sm:flex"
          onClick={() => setCurrentPage("store")}
        >
          <Store className="w-4 h-4" /> Continue Shopping
        </Button>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <Card className="max-w-md mx-auto text-center p-12 border-dashed">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t placed any orders yet. Browse our jersey store to find your perfect kit!
          </p>
          <Button
            className="gap-2 rounded-xl shadow-md shadow-primary/20"
            onClick={() => setCurrentPage("store")}
          >
            <Store className="w-4 h-4" /> Start Shopping
          </Button>
        </Card>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </p>
          {orders.map((order) => {
            let parsedItems: OrderItem[] = [];
            try {
              parsedItems = JSON.parse(order.items);
            } catch {
              parsedItems = [];
            }

            return (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 card-border-hover"
              >
                {/* Order Header */}
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Order{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="text-lg font-bold text-primary">
                        £{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {parsedItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-xs text-muted-foreground font-medium">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          £{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Shipping Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-0.5">
                          Shipping Address
                        </p>
                        <p>
                          {order.address}, {order.city}
                        </p>
                        <p>
                          {order.country}
                          {order.postalCode && `, ${order.postalCode}`}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          <span>{order.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-xl"
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order.id ? null : order.id
                        )
                      }
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Order
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  {/* Order Tracking Timeline (Expandable) */}
                  <div
                    className={`timeline-expand ${expandedOrderId === order.id ? "expanded" : ""}`}
                  >
                    <OrderTimeline status={order.status} orderDate={order.createdAt} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
