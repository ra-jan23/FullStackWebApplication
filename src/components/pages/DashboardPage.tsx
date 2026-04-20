"use client";

import React, { useState, useEffect } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Ticket, Video, ScanSearch, ShoppingCart, Store, Play, Eye,
  CreditCard, TrendingUp, Camera, Timer, Trophy, Activity, Heart,
  Brain, MessageCircle, Zap, BarChart3, Calendar, ArrowUpRight, Bell
} from "lucide-react";

export default function DashboardPage() {
  const { user, token, setCurrentPage } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "insights">("overview");

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

  const weeklyActivity = [
    { day: "Mon", value: 4 },
    { day: "Tue", value: 7 },
    { day: "Wed", value: 3 },
    { day: "Thu", value: 8 },
    { day: "Fri", value: 5 },
    { day: "Sat", value: 12 },
    { day: "Sun", value: 9 },
  ];
  const maxActivity = Math.max(...weeklyActivity.map(d => d.value));

  const userInsights = [
    { label: "Favorite League", value: "Premier League", icon: <Trophy className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-500/10" },
    { label: "Prediction Accuracy", value: "73%", icon: <Brain className="w-4 h-4 text-violet-500" />, color: "bg-violet-500/10" },
    { label: "Most Analyzed Team", value: "Liverpool FC", icon: <ScanSearch className="w-4 h-4 text-primary" />, color: "bg-primary/10" },
    { label: "Chat Sessions", value: "12", icon: <MessageCircle className="w-4 h-4 text-blue-500" />, color: "bg-blue-500/10" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-primary/5 border-primary/10 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl" />
        <CardContent className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/25">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-muted-foreground">Here&apos;s your football activity overview</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setCurrentPage("analyze")}>
                <ScanSearch className="w-4 h-4" /> New Analysis
              </Button>
              <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setCurrentPage("predictions")}>
                <Brain className="w-4 h-4" /> Predictions
              </Button>
              <Button className="gap-2 rounded-xl shadow-md shadow-primary/20" onClick={() => setCurrentPage("store")}>
                <Store className="w-4 h-4" /> Shop Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards with Progress Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Match Tickets", value: stats?.stats?.totalTickets || 0, icon: <Ticket className="w-5 h-5" />, gradient: "from-orange-500 to-amber-500", progress: 65 },
          { label: "Highlights Saved", value: stats?.stats?.totalHighlights || 0, icon: <Video className="w-5 h-5" />, gradient: "from-blue-500 to-cyan-500", progress: 42 },
          { label: "AI Analyses", value: stats?.stats?.totalAnalyses || 0, icon: <ScanSearch className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-500", progress: 78 },
          { label: "Cart Items", value: stats?.stats?.cartCount || 0, icon: <ShoppingCart className="w-5 h-5" />, gradient: "from-purple-500 to-pink-500", progress: 30 },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-hover-lift overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 counter-animate">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1.5">{stat.progress}% of monthly goal</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl w-fit">
        {[
          { key: "overview" as const, label: "Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: "activity" as const, label: "Activity", icon: <Activity className="w-3.5 h-3.5" /> },
          { key: "insights" as const, label: "Insights", icon: <Zap className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            size="sm"
            className="gap-1.5 rounded-lg text-xs"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
          {/* Match Day Countdown */}
          <Card className="gradient-border hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer className="w-5 h-5 text-red-500" /> Next Match Countdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3 p-2.5 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Chelsea FC</span>
                  <Badge variant="outline" className="text-[10px]">vs</Badge>
                  <span className="text-sm font-semibold">Arsenal FC</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 text-center">Premier League &bull; Tomorrow 20:45 &bull; Stamford Bridge</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { val: "0", label: "Days" },
                  { val: "18", label: "Hours" },
                  { val: "42", label: "Mins" },
                  { val: "15", label: "Secs" },
                ].map((t, i) => (
                  <div key={i} className="p-2 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border">
                    <div className="text-xl font-extrabold text-primary animate-countdown-pulse">{t.val}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.label}</div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3 gap-1 rounded-lg" onClick={() => setCurrentPage("tickets")}>
                <Ticket className="w-3 h-3" /> Book Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-primary" /> Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-1">
                £{(stats?.stats?.totalSpent || 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Total amount spent on match tickets</p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Tickets", amount: "£195.00", pct: 65 },
                  { label: "Jerseys", amount: "£89.99", pct: 30 },
                  { label: "Other", amount: "£15.00", pct: 5 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-14 text-muted-foreground text-xs">{item.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full animate-progress-fill ${
                        i === 0 ? "bg-gradient-to-r from-primary to-emerald-500" :
                        i === 1 ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                        "bg-gradient-to-r from-amber-500 to-orange-500"
                      }`} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setCurrentPage("tickets")}>
                  <Ticket className="w-3 h-3" /> View Tickets
                </Button>
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => setCurrentPage("cart")}>
                  <ShoppingCart className="w-3 h-3" /> View Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-amber-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Analyze Match", icon: <Camera className="w-5 h-5" />, page: "analyze" as Page, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Predict Match", icon: <Brain className="w-5 h-5" />, page: "predictions" as Page, color: "text-violet-500", bg: "bg-violet-500/10" },
                  { label: "Browse Jerseys", icon: <Store className="w-5 h-5" />, page: "store" as Page, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Watch Highlights", icon: <Play className="w-5 h-5" />, page: "highlights" as Page, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { label: "Book Tickets", icon: <Ticket className="w-5 h-5" />, page: "tickets" as Page, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "AI Chat", icon: <MessageCircle className="w-5 h-5" />, page: "chat" as Page, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                  { label: "My Orders", icon: <ShoppingCart className="w-5 h-5" />, page: "orders" as Page, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Notifications", icon: <Bell className="w-5 h-5" />, page: "notifications" as Page, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 flex flex-col gap-2 rounded-xl hover:shadow-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => setCurrentPage(action.page)}
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                      <span className={action.color}>{action.icon}</span>
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
          {/* Weekly Activity Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" /> Weekly Activity
              </CardTitle>
              <CardDescription>Your platform usage this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-40 mb-3">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group/bar">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-emerald-400 rounded-t-lg animate-progress-fill transition-all duration-700 cursor-pointer hover:from-primary/90 hover:to-emerald-300"
                        style={{ height: `${(day.value / maxActivity) * 120}px`, animationDelay: `${i * 100}ms` }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-xs font-medium px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-sm border">
                        {day.value}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-muted-foreground">Total: 48 actions this week</span>
                <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                  <ArrowUpRight className="w-3 h-3" /> +23% vs last week
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-blue-500" /> Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions on PitchVision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[
                  { icon: <ShoppingCart className="w-4 h-4 text-purple-500" />, text: "You added Liverpool Home Kit to cart", time: "2 min ago", color: "bg-purple-500/10" },
                  { icon: <Brain className="w-4 h-4 text-violet-500" />, text: "You predicted Liverpool vs Arsenal match", time: "10 min ago", color: "bg-violet-500/10" },
                  { icon: <Eye className="w-4 h-4 text-orange-500" />, text: "You viewed Match Highlights", time: "15 min ago", color: "bg-orange-500/10" },
                  { icon: <ScanSearch className="w-4 h-4 text-primary" />, text: "You ran an AI Formation Analysis", time: "1 hour ago", color: "bg-primary/10" },
                  { icon: <MessageCircle className="w-4 h-4 text-cyan-500" />, text: "You had a chat about 4-3-3 tactics", time: "2 hours ago", color: "bg-cyan-500/10" },
                  { icon: <Ticket className="w-4 h-4 text-blue-500" />, text: "You booked a ticket: Liverpool vs Everton", time: "3 hours ago", color: "bg-blue-500/10" },
                  { icon: <Heart className="w-4 h-4 text-red-500" />, text: "You saved \"Erling Haaland Hat-Trick\" highlight", time: "Yesterday", color: "bg-red-500/10" },
                  { icon: <Store className="w-4 h-4 text-emerald-500" />, text: "You browsed the Jersey Store", time: "Yesterday", color: "bg-emerald-500/10" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                      {activity.icon}
                    </div>
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
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
          {/* User Insights */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-amber-500" /> Your Insights
              </CardTitle>
              <CardDescription>Personalized football preferences based on your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {userInsights.map((insight, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl ${insight.color} flex items-center justify-center mb-3`}>
                      {insight.icon}
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">{insight.label}</p>
                    <p className="font-bold text-sm">{insight.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badges */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
              </CardTitle>
              <CardDescription>Your earned badges and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "First Analysis", desc: "Completed your first AI analysis", icon: <ScanSearch className="w-5 h-5" />, earned: true, gradient: "from-emerald-500 to-teal-500" },
                  { name: "Ticket Buyer", desc: "Booked your first match ticket", icon: <Ticket className="w-5 h-5" />, earned: true, gradient: "from-blue-500 to-cyan-500" },
                  { name: "Chat Pro", desc: "Had 10+ AI conversations", icon: <MessageCircle className="w-5 h-5" />, earned: true, gradient: "from-violet-500 to-purple-500" },
                  { name: "Collector", desc: "Saved 5 highlights to favorites", icon: <Heart className="w-5 h-5" />, earned: false, gradient: "from-rose-500 to-pink-500" },
                  { name: "Predictor", desc: "Made 10 match predictions", icon: <Brain className="w-5 h-5" />, earned: false, gradient: "from-amber-500 to-orange-500" },
                  { name: "Super Fan", desc: "Visited platform 30 days in a row", icon: <Trophy className="w-5 h-5" />, earned: false, gradient: "from-yellow-500 to-amber-500" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className={`text-center p-3 rounded-xl border transition-all ${
                      badge.earned
                        ? "bg-gradient-to-br from-muted/50 to-muted/20 hover:shadow-sm cursor-pointer hover:-translate-y-0.5"
                        : "bg-muted/20 opacity-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                      badge.earned
                        ? `bg-gradient-to-br ${badge.gradient} text-white shadow-md`
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {badge.icon}
                    </div>
                    <p className="text-xs font-semibold leading-tight">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{badge.desc}</p>
                    {badge.earned && (
                      <Badge className="mt-1.5 text-[8px] px-1.5 py-0 bg-primary/10 text-primary">Earned</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trending Highlights */}
      {stats?.topHighlights && stats.topHighlights.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-yellow-500" /> Trending Highlights
            </CardTitle>
            <CardDescription>Most viewed highlights this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topHighlights.slice(0, 3).map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group" onClick={() => setCurrentPage("highlights")}>
                  <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                    <img src={h.thumbnail} alt={h.title} className="w-20 h-14 object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.match}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" /> {(h.views / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
