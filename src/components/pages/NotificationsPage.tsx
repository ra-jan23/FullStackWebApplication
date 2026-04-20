"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell, CheckCircle2, Calendar, ArrowLeftRight, User, Settings,
  Truck, PackageCheck, Play, Goal, Users, Sparkles, ShieldCheck,
  ChevronRight, Filter,
} from "lucide-react";

type NotificationCategory = "all" | "tickets" | "orders" | "football" | "system";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  category: "tickets" | "orders" | "football" | "system";
  unread: boolean;
  icon: React.ReactNode;
  iconBg: string;
  action?: { label: string; page: "tickets" | "orders" | "match-center" | "highlights" };
}

const initialNotifications: Notification[] = [
  // Ticket notifications (3)
  {
    id: 1,
    title: "Booking Confirmed",
    description: "Your ticket for Liverpool vs Everton on Dec 15 has been confirmed. Section 104, Row 12, Seat 8.",
    time: "2 min ago",
    category: "tickets",
    unread: true,
    icon: <CheckCircle2 className="w-5 h-5" />,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    action: { label: "View Ticket", page: "tickets" },
  },
  {
    id: 2,
    title: "Match Reminder",
    description: "Chelsea vs Arsenal kicks off tomorrow at 20:45. Don't forget to arrive early!",
    time: "1 hour ago",
    category: "tickets",
    unread: true,
    icon: <Calendar className="w-5 h-5" />,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    action: { label: "View Details", page: "tickets" },
  },
  {
    id: 3,
    title: "Ticket Transferred",
    description: "You received a ticket transfer from Alex M. for Man City vs Tottenham on Dec 22.",
    time: "3 hours ago",
    category: "tickets",
    unread: false,
    icon: <ArrowLeftRight className="w-5 h-5" />,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    action: { label: "View Ticket", page: "tickets" },
  },
  // Order notifications (2)
  {
    id: 4,
    title: "Order Shipped",
    description: "Your order #PV-4821 (Liverpool Home Kit 24/25) has been shipped via Royal Mail.",
    time: "5 hours ago",
    category: "orders",
    unread: true,
    icon: <Truck className="w-5 h-5" />,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    action: { label: "Track Order", page: "orders" },
  },
  {
    id: 5,
    title: "Order Delivered",
    description: "Your order #PV-4790 (Arsenal Away Scarf) has been delivered successfully.",
    time: "Yesterday",
    category: "orders",
    unread: false,
    icon: <PackageCheck className="w-5 h-5" />,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    action: { label: "View Order", page: "orders" },
  },
  // Football notifications (4)
  {
    id: 6,
    title: "Match Started",
    description: "Real Madrid vs Barcelona has kicked off at Santiago Bernabeu. Live coverage now available.",
    time: "10 min ago",
    category: "football",
    unread: true,
    icon: <Play className="w-5 h-5" />,
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    action: { label: "Watch Match", page: "match-center" },
  },
  {
    id: 7,
    title: "Goal Scored! (LIVE)",
    description: "Mohamed Salah scores for Liverpool! Liverpool 2 - 1 Everton, 72nd minute.",
    time: "15 min ago",
    category: "football",
    unread: true,
    icon: <Goal className="w-5 h-5" />,
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    action: { label: "Watch Highlights", page: "highlights" },
  },
  {
    id: 8,
    title: "Transfer Confirmed",
    description: "Victor Osimhen has completed his move to Chelsea FC on a 5-year deal.",
    time: "2 days ago",
    category: "football",
    unread: false,
    icon: <Users className="w-5 h-5" />,
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    action: { label: "View Details", page: "match-center" },
  },
  {
    id: 9,
    title: "Team Lineup Announced",
    description: "Arsenal have announced their starting XI for tonight's clash against Tottenham.",
    time: "3 days ago",
    category: "football",
    unread: false,
    icon: <Users className="w-5 h-5" />,
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    action: { label: "View Match", page: "match-center" },
  },
  // System notifications (3)
  {
    id: 10,
    title: "Password Changed",
    description: "Your account password was successfully updated. If this wasn't you, contact support immediately.",
    time: "1 day ago",
    category: "system",
    unread: false,
    icon: <ShieldCheck className="w-5 h-5" />,
    iconBg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: 11,
    title: "Profile Updated",
    description: "Your profile information has been updated successfully. Changes are now visible on your public profile.",
    time: "2 days ago",
    category: "system",
    unread: false,
    icon: <User className="w-5 h-5" />,
    iconBg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: 12,
    title: "New Feature Released",
    description: "AI Match Predictions is now live! Predict match outcomes and compete with other fans.",
    time: "4 days ago",
    category: "system",
    unread: false,
    icon: <Sparkles className="w-5 h-5" />,
    iconBg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
    action: { label: "Try Now", page: "match-center" },
  },
];

const filterTabs: { key: NotificationCategory; label: string; color?: string }[] = [
  { key: "all", label: "All" },
  { key: "tickets", label: "Tickets" },
  { key: "orders", label: "Orders" },
  { key: "football", label: "Football" },
  { key: "system", label: "System" },
];

const categoryColors: Record<string, string> = {
  tickets: "bg-blue-500",
  orders: "bg-emerald-500",
  football: "bg-orange-500",
  system: "bg-zinc-400",
};

export default function NotificationsPage() {
  const { setCurrentPage } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeFilter);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Bell className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notification Center</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl self-start sm:self-auto"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl w-fit overflow-x-auto">
        {filterTabs.map((tab) => {
          const count =
            tab.key === "all"
              ? notifications.filter((n) => n.unread).length
              : notifications.filter((n) => n.category === tab.key && n.unread).length;
          return (
            <Button
              key={tab.key}
              variant={activeFilter === tab.key ? "default" : "ghost"}
              size="sm"
              className="gap-1.5 rounded-lg text-xs"
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.key === "all" && <Filter className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1.5 text-[10px] rounded-full"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        /* Empty State */
        <Card className="card-glass">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">You&apos;re all caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No notifications in this category. Check back later for updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Notification Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredNotifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`card-glass hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${
                notification.unread ? "border-primary/20 bg-primary/[0.02]" : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleMarkRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Unread Indicator */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-1">
                    {notification.unread && (
                      <span className={`w-2.5 h-2.5 rounded-full ${categoryColors[notification.category]} animate-pulse`} />
                    )}
                    {!notification.unread && <span className="w-2.5 h-2.5" />}
                  </div>

                  {/* Category Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl ${notification.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    {notification.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h4>
                          {notification.category === "football" &&
                            notification.id === 7 && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-red-500 text-white hover:bg-red-500 border-0 animate-pulse">
                                LIVE
                              </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {notification.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {notification.action && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage(notification.action!.page);
                          }}
                        >
                          {notification.action.label}
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
