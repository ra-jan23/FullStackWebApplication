"use client";

import React, { useState, useEffect } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket, Video, ScanSearch, ShoppingCart, Store, Play, Eye,
  CreditCard, TrendingUp, Camera, Timer, Trophy, Activity, Heart
} from "lucide-react";

export default function DashboardPage() {
  const { user, token, setCurrentPage } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.stats) setStats(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-primary/5 border-primary/10 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        <CardContent className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-muted-foreground">Here&apos;s your football activity overview</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setCurrentPage("analyze")}><ScanSearch className="w-4 h-4" /> New Analysis</Button>
              <Button className="gap-2 rounded-xl shadow-md shadow-primary/20" onClick={() => setCurrentPage("store")}><Store className="w-4 h-4" /> Shop Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Match Tickets", value: stats?.stats?.totalTickets || 0, icon: <Ticket className="w-5 h-5" />, gradient: "from-orange-500 to-amber-500", bg: "bg-orange-500/10" },
          { label: "Highlights Saved", value: stats?.stats?.totalHighlights || 0, icon: <Video className="w-5 h-5" />, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
          { label: "AI Analyses", value: stats?.stats?.totalAnalyses || 0, icon: <ScanSearch className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10" },
          { label: "Cart Items", value: stats?.stats?.cartCount || 0, icon: <ShoppingCart className="w-5 h-5" />, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spending & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Match Day Countdown */}
        <Card className="gradient-border hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg"><Timer className="w-5 h-5 text-red-500" /> Next Match Countdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-3">
              <p className="text-sm font-semibold">Chelsea FC vs Arsenal FC</p>
              <p className="text-xs text-muted-foreground">Premier League • Tomorrow 20:45</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { val: "0", label: "Days" },
                { val: "18", label: "Hours" },
                { val: "42", label: "Mins" },
                { val: "15", label: "Secs" },
              ].map((t, i) => (
                <div key={i} className="p-2 rounded-xl bg-muted/50">
                  <div className="text-xl font-extrabold text-primary animate-countdown-pulse">{t.val}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.label}</div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3 gap-1 rounded-lg" onClick={() => setCurrentPage("tickets")}><Ticket className="w-3 h-3" /> Book Tickets</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-primary" /> Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-1">£{(stats?.stats?.totalSpent || 0).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mb-4">Total amount spent on match tickets</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setCurrentPage("tickets")}><Ticket className="w-3 h-3" /> View Tickets</Button>
              <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setCurrentPage("cart")}><ShoppingCart className="w-3 h-3" /> View Cart</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5 text-primary" /> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Analyze Match", icon: <Camera className="w-5 h-5" />, page: "analyze" as Page, color: "text-emerald-500" },
                { label: "Browse Jerseys", icon: <Store className="w-5 h-5" />, page: "store" as Page, color: "text-blue-500" },
                { label: "Watch Highlights", icon: <Play className="w-5 h-5" />, page: "highlights" as Page, color: "text-orange-500" },
                { label: "Book Tickets", icon: <Ticket className="w-5 h-5" />, page: "tickets" as Page, color: "text-purple-500" },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="h-auto py-4 flex flex-col gap-2 rounded-xl hover:shadow-sm hover:border-primary/30" onClick={() => setCurrentPage(action.page)}>
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Highlights */}
      {stats?.topHighlights && stats.topHighlights.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="w-5 h-5 text-yellow-500" /> Trending Highlights</CardTitle>
            <CardDescription>Most viewed highlights this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topHighlights.slice(0, 3).map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer" onClick={() => setCurrentPage("highlights")}>
                  <img src={h.thumbnail} alt={h.title} className="w-20 h-14 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.match}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {(h.views / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="hover:shadow-md transition-shadow mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Activity className="w-5 h-5 text-primary" /> Recent Activity</CardTitle>
          <CardDescription>Your latest actions on PitchVision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { icon: <ShoppingCart className="w-4 h-4 text-purple-500" />, text: "You added Liverpool Home Kit to cart", time: "2 minutes ago", color: "bg-purple-500/10" },
              { icon: <Eye className="w-4 h-4 text-orange-500" />, text: "You viewed Match Highlights", time: "15 minutes ago", color: "bg-orange-500/10" },
              { icon: <ScanSearch className="w-4 h-4 text-primary" />, text: "You ran an AI Formation Analysis", time: "1 hour ago", color: "bg-primary/10" },
              { icon: <Ticket className="w-4 h-4 text-blue-500" />, text: "You booked a ticket: Liverpool vs Everton", time: "3 hours ago", color: "bg-blue-500/10" },
              { icon: <Heart className="w-4 h-4 text-red-500" />, text: "You saved \"Erling Haaland Hat-Trick\" highlight", time: "Yesterday", color: "bg-red-500/10" },
              { icon: <Store className="w-4 h-4 text-emerald-500" />, text: "You browsed the Jersey Store", time: "Yesterday", color: "bg-emerald-500/10" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
