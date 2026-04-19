"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Home, LogIn, LogOut, UserPlus, LayoutDashboard, Store, ShoppingCart,
  Ticket, Video, ScanSearch, Moon, Sun, Menu, X, Star,
  Trophy, BarChart3, Zap, Shield, Eye,
  Clock, MapPin, Calendar, CreditCard, Trash2, Plus,
  Camera, Upload, Loader2, ArrowLeft, Play, Heart, Share2,
  Globe, Smartphone, Cpu, Target, Layers, TrendingUp,
  Award, Crown, Sparkles, CheckCircle2, AlertCircle, Info, Users,
  ChevronRight, Flame, Search, User, Fingerprint, Megaphone, Database,
  Bell, ArrowUp, Activity, Medal, Timer, CircleDot, TimerReset, Settings
} from "lucide-react";

// ==================== NAVBAR ====================
function Navbar() {
  const { currentPage, setCurrentPage, user, logout, cartCount, isLoading, searchQuery, setSearchQuery } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const localSearchQuery = useState(searchQuery);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: { page: Page; label: string; icon: React.ReactNode; auth?: boolean }[] = [
    { page: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
    { page: "match-center", label: "Match Center", icon: <Trophy className="w-4 h-4" /> },
    { page: "store", label: "Jersey Store", icon: <Store className="w-4 h-4" /> },
    { page: "highlights", label: "Highlights", icon: <Video className="w-4 h-4" /> },
    { page: "tickets", label: "Tickets", icon: <Ticket className="w-4 h-4" />, auth: true },
    { page: "analyze", label: "AI Analysis", icon: <ScanSearch className="w-4 h-4" />, auth: true },
    { page: "cart", label: "Cart", icon: <ShoppingCart className="w-4 h-4" />, auth: true },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo(0, 0);
  };

  const handleSearchSubmit = () => {
    if (localSearchQuery[0].trim()) {
      setSearchQuery(localSearchQuery[0].trim());
      setCurrentPage("store");
      setSearchOpen(false);
      window.scrollTo(0, 0);
    }
  };

  const notifications = [
    { id: 1, title: "Ticket Confirmed", desc: "Your ticket for Liverpool vs Everton is confirmed", time: "5 min ago", icon: <CheckCircle2 className="w-4 h-4 text-primary" />, unread: true },
    { id: 2, title: "New Highlight", desc: "Bicycle Kick Goal of the Week is now available", time: "1 hour ago", icon: <Play className="w-4 h-4 text-orange-500" />, unread: true },
    { id: 3, title: "Flash Sale!", desc: "20% off all jerseys this weekend only", time: "3 hours ago", icon: <Flame className="w-4 h-4 text-red-500" />, unread: false },
    { id: 4, title: "Match Reminder", desc: "Chelsea vs Arsenal kicks off tomorrow at 20:45", time: "Yesterday", icon: <Calendar className="w-4 h-4 text-blue-500" />, unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("home")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Pitch<span className="text-primary">Vision</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            if (item.auth && !user) return null;
            const isActive = currentPage === item.page;
            return (
              <Button
                key={item.page}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`gap-1.5 rounded-lg ${isActive ? "shadow-md shadow-primary/25" : "hover:bg-muted"}`}
                onClick={() => handleNavClick(item.page)}
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
                {item.page === "cart" && cartCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          {searchOpen ? (
            <div className="relative flex items-center">
              <Input
                autoFocus
                placeholder="Search jerseys..."
                className="w-40 md:w-56 h-9 text-sm rounded-lg"
                value={localSearchQuery[0]}
                onChange={e => localSearchQuery[1](e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); if (e.key === "Enter") handleSearchSubmit(); }}
              />
              <Button variant="ghost" size="icon" className="h-9 w-9 ml-1" onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </Button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-popover border rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}>
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">{n.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{n.title}</p>
                          {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary">View All Notifications</Button>
                </div>
              </div>
            )}
          </div>

          {mounted && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          {isLoading ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : user ? (
            <div className="hidden md:flex items-center gap-1.5 relative" ref={profileRef}>
              <Button variant="ghost" size="sm" className="gap-1.5 rounded-lg h-9" onClick={() => setProfileOpen(!profileOpen)}>
                <Avatar className="h-6 w-6 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground text-xs font-bold">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden xl:inline max-w-20 truncate">{user.name}</span>
              </Button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-popover border rounded-xl shadow-xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 mb-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Separator className="my-1" />
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("dashboard"); setProfileOpen(false); }}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("tickets"); setProfileOpen(false); }}>
                    <Ticket className="w-4 h-4" /> My Tickets
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("cart"); setProfileOpen(false); }}>
                    <ShoppingCart className="w-4 h-4" /> My Cart
                  </Button>
                  <Separator className="my-1" />
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm text-destructive hover:text-destructive" onClick={() => { logout(); setProfileOpen(false); }}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="gap-1.5 rounded-lg h-9" onClick={() => handleNavClick("login")}>
                <LogIn className="w-4 h-4" /> Login
              </Button>
              <Button size="sm" className="gap-1.5 rounded-lg shadow-md shadow-primary/20" onClick={() => handleNavClick("register")}>
                <UserPlus className="w-4 h-4" /> Register
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur-xl p-4 animate-fade-in">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {navItems.slice(0, 8).map((item) => {
              if (item.auth && !user) return null;
              const isActive = currentPage === item.page;
              return (
                <Button
                  key={item.page}
                  variant={isActive ? "default" : "outline"}
                  className={`flex-col gap-1 h-auto py-3 rounded-xl text-xs ${isActive ? "shadow-md" : ""}`}
                  onClick={() => handleNavClick(item.page)}
                >
                  {item.icon}
                  <span className="truncate max-w-full">{item.label.split(" ")[0]}</span>
                </Button>
              );
            })}
          </div>
          <Separator className="my-2" />
          {!user ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => handleNavClick("login")}>
                <LogIn className="w-4 h-4" /> Login
              </Button>
              <Button className="flex-1 gap-2" onClick={() => handleNavClick("register")}>
                <UserPlus className="w-4 h-4" /> Register
              </Button>
            </div>
          ) : (
            <Button variant="destructive" className="w-full gap-2" onClick={() => { logout(); setMobileMenuOpen(false); }}>
              <LogOut className="w-4 h-4" /> Sign Out ({user.name})
            </Button>
          )}
        </div>
      )}
    </header>
  );
}

// ==================== HOME PAGE ====================
function HomePage() {
  const { setCurrentPage, user } = useAppStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      toast.success("Subscribed!", { description: "You'll receive the latest football updates." });
      setEmail("");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero/stadium-hero.png" alt="Stadium" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-40 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" /> AI-Powered Football Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Experience Football
              <br />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
              Analyze formations with AI, watch stunning highlights, shop official jerseys, and book match tickets — all in one platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 text-base rounded-xl shadow-lg shadow-primary/30 h-12 px-6" onClick={() => setCurrentPage(user ? "analyze" : "register")}>
                <ScanSearch className="w-5 h-5" /> Try AI Analysis
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base rounded-xl border-white/25 text-white hover:bg-white/15 hover:text-white h-12 px-6 backdrop-blur-sm" onClick={() => setCurrentPage("store")}>
                <Store className="w-5 h-5" /> Browse Jerseys
              </Button>
            </div>
            {/* Quick stats in hero */}
            <div className="flex gap-8 mt-12">
              {[{ val: "50K+", label: "Analyses" }, { val: "200+", label: "Teams" }, { val: "95%", label: "Accuracy" }].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Teams Marquee */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">Trending Now</p>
          </div>
          <div className="marquee-container">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {["Liverpool FC", "Real Madrid", "Arsenal FC", "Bayern Munich", "FC Barcelona", "Chelsea FC", "AC Milan", "Manchester City", "Juventus", "PSG", "Borussia Dortmund", "Inter Milan", "Tottenham", "Newcastle United", "Aston Villa", "Liverpool FC", "Real Madrid", "Arsenal FC", "Bayern Munich", "FC Barcelona", "Chelsea FC", "AC Milan", "Manchester City", "Juventus", "PSG", "Borussia Dortmund", "Inter Milan"].map((team, i) => (
                <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDot className="w-2 h-2 text-primary/50" />
                  {team}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Logos */}
      <section className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-8 overflow-x-auto">
            <p className="text-xs text-muted-foreground whitespace-nowrap font-medium uppercase tracking-wider">Powered by</p>
            {["Next.js 16", "React 19", "Prisma", "Tailwind CSS", "VLM AI", "Zustand"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
            <Crown className="w-3 h-3 mr-1.5" /> Core Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Everything a Football Fan Needs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From AI-powered match analysis to ticket booking, PitchVision brings the complete football experience to your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ScanSearch className="w-8 h-8" />, title: "AI Formation Detection", desc: "Upload match photos and let AI detect player positions and formations instantly.", page: "analyze" as Page, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
            { icon: <Video className="w-8 h-8" />, title: "Match Highlights", desc: "Watch AI-curated highlights from the biggest matches around the world.", page: "highlights" as Page, gradient: "from-orange-500 to-red-500", bg: "bg-orange-500/10" },
            { icon: <Store className="w-8 h-8" />, title: "Jersey Store", desc: "Shop authentic football jerseys from top clubs and national teams.", page: "store" as Page, gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10" },
            { icon: <Ticket className="w-8 h-8" />, title: "Match Tickets", desc: "Book tickets for upcoming matches and experience the atmosphere live.", page: "tickets" as Page, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/10" },
          ].map((feature, i) => (
            <Card
              key={i}
              className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border hover:border-primary/20 relative overflow-hidden"
              onClick={() => setCurrentPage(feature.page === "analyze" && !user ? "login" : feature.page)}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <CardHeader className="pb-3">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>{feature.icon}</div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-emerald-500/5 border-y">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: "50K+", label: "Matches Analyzed", icon: <BarChart3 className="w-7 h-7 mx-auto mb-3 text-primary" />, desc: "And counting every day" },
              { value: "200+", label: "Teams Covered", icon: <Shield className="w-7 h-7 mx-auto mb-3 text-primary" />, desc: "From leagues worldwide" },
              { value: "10K+", label: "Jerseys Available", icon: <Store className="w-7 h-7 mx-auto mb-3 text-primary" />, desc: "Official club merchandise" },
              { value: "95%", label: "AI Accuracy", icon: <Target className="w-7 h-7 mx-auto mb-3 text-primary" />, desc: "Formation detection rate" },
            ].map((stat, i) => (
              <div key={i} className="group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur-sm shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-shadow">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
                <div className="text-sm font-semibold mb-0.5">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
            <Cpu className="w-3 h-3 mr-1.5" /> How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">AI Analysis in 3 Steps</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to analyze any football match formation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          {[
            { step: "01", title: "Upload Image", desc: "Take a screenshot or photo of any football match", icon: <Upload className="w-7 h-7" />, color: "from-primary to-emerald-500" },
            { step: "02", title: "AI Detection", desc: "Our AI model detects players, ball, and positions", icon: <Cpu className="w-7 h-7" />, color: "from-emerald-500 to-teal-500" },
            { step: "03", title: "Get Results", desc: "View detected formation, player count, and tactical analysis", icon: <CheckCircle2 className="w-7 h-7" />, color: "from-teal-500 to-cyan-500" },
          ].map((item, i) => (
            <div key={i} className="text-center relative group">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 text-white shadow-lg group-hover:scale-105 transition-transform duration-300 animate-float`} style={{ animationDelay: `${i * 0.5}s` }}>
                {item.icon}
              </div>
              <Badge variant="secondary" className="mb-3 text-xs font-mono">{item.step}</Badge>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
        {/* Mini Pitch Diagram */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-b from-emerald-900/90 to-emerald-800/90 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)" }} />
            </div>
            <div className="relative">
              <div className="text-center mb-3"><Badge className="bg-white/10 text-white border-white/20 text-xs">4-3-3 Formation Detected</Badge></div>
              {/* Pitch markings */}
              <div className="relative border-2 border-white/30 rounded-lg h-48">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-10 border-b-2 border-l-0 border-r-0 border-white/30 border-t-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/20" />
                <div className="absolute top-1/2 left-0 w-16 h-16 border-r-2 border-white/30" />
                <div className="absolute top-1/2 right-0 w-16 h-16 border-l-2 border-white/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-white/30" />
                {/* Player dots - GK */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-yellow-400 border-2 border-white shadow-md" title="GK" />
                {/* Defenders - 4 back */}
                <div className="absolute bottom-12 left-[15%] w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md" />
                <div className="absolute bottom-12 left-[35%] w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md" />
                <div className="absolute bottom-12 right-[35%] w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md" />
                <div className="absolute bottom-12 right-[15%] w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md" />
                {/* Midfielders - 3 */}
                <div className="absolute top-[55%] left-[22%] w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md" />
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md" />
                <div className="absolute top-[55%] right-[22%] w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md" />
                {/* Forwards - 3 */}
                <div className="absolute top-6 left-[18%] w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md" />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md animate-pulse" />
                <div className="absolute top-6 right-[18%] w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md" />
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-white/70">
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> GK</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary" /> DEF</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> MID</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> FWD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              <Users className="w-3 h-3 mr-1.5" /> Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Football Fans</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Alex M.", role: "Football Coach", text: "The AI formation detection is incredibly accurate. I use it to analyze opponent formations before every match. Game changer!", avatar: "AM", rating: 5 },
              { name: "Sarah K.", role: "Arsenal Fan", text: "Finally a platform that combines everything — jerseys, tickets, and highlights. The UI is beautiful and super easy to use.", avatar: "SK", rating: 5 },
              { name: "James P.", role: "Sports Journalist", text: "The match analysis feature saves me hours of work. I can quickly identify formations and tactical setups from match photos.", avatar: "JP", rating: 4 },
            ].map((t, i) => (
              <Card key={i} className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Game</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Get weekly football insights, new feature updates, and exclusive offers delivered to your inbox.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 rounded-xl"
                />
                <Button type="submit" variant="secondary" size="lg" className="rounded-xl shadow-lg h-12 px-6 gap-2 whitespace-nowrap">
                  Subscribe <ArrowLeft className="w-4 h-4 rotate-[-90deg]" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You&apos;re subscribed! Check your inbox.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Analyze Your First Match?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
          Join thousands of football fans using PitchVision to understand the beautiful game at a deeper level.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="gap-2 text-base rounded-xl shadow-lg shadow-primary/20 h-12 px-6" onClick={() => setCurrentPage(user ? "analyze" : "register")}>
            <Zap className="w-5 h-5" /> Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="gap-2 text-base rounded-xl h-12 px-6" onClick={() => setCurrentPage("highlights")}>
            <Play className="w-5 h-5" /> Watch Highlights
          </Button>
        </div>
      </section>
    </div>
  );
}

// ==================== LOGIN PAGE ====================
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setCurrentPage } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.token) { login(data.user, data.token); toast.success("Welcome back!", { description: `Logged in as ${data.user.name}` }); setCurrentPage("dashboard"); }
      else { toast.error("Login failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your PitchVision account</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="demo@pitchvision.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
                <Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
              </div>
              <Button type="submit" className="w-full gap-2 h-11 rounded-xl shadow-md shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign In
              </Button>
            </form>
            <div className="relative my-5"><div className="absolute inset-0 flex items-center"><Separator /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div></div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 h-10 rounded-xl text-sm" onClick={() => toast.info("Social login coming soon!")}><Globe className="w-4 h-4" /> Google</Button>
              <Button variant="outline" className="gap-2 h-10 rounded-xl text-sm" onClick={() => toast.info("Social login coming soon!")}><Layers className="w-4 h-4" /> GitHub</Button>
            </div>
            <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Fingerprint className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Demo Account</span>
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                Email: demo@pitchvision.com<br />Password: demo123
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button className="text-primary hover:underline font-semibold" onClick={() => setCurrentPage("register")}>Sign up free</button>
        </div>
      </div>
    </div>
  );
}

// ==================== REGISTER PAGE ====================
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, setCurrentPage } = useAppStore();

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-primary"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (data.token) { login(data.user, data.token); toast.success("Account created!", { description: `Welcome to PitchVision, ${data.user.name}` }); setCurrentPage("dashboard"); }
      else { toast.error("Registration failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join PitchVision and start analyzing football</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" type="password" placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
                  {password.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-muted"}`} />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength >= 3 ? "text-primary" : passwordStrength >= 2 ? "text-amber-500" : "text-red-500"}`}>{strengthLabels[passwordStrength]}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm</Label>
                  <Input id="confirm-password" type="password" placeholder="Repeat" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11" />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2 h-11 rounded-xl shadow-md shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create Account
              </Button>
            </form>
            <div className="relative my-5"><div className="absolute inset-0 flex items-center"><Separator /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div></div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 h-10 rounded-xl text-sm" onClick={() => toast.info("Social login coming soon!")}><Globe className="w-4 h-4" /> Google</Button>
              <Button variant="outline" className="gap-2 h-10 rounded-xl text-sm" onClick={() => toast.info("Social login coming soon!")}><Layers className="w-4 h-4" /> GitHub</Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button className="text-primary hover:underline font-semibold" onClick={() => setCurrentPage("login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

// ==================== MATCH CENTER PAGE ====================
function MatchCenterPage() {
  const { setCurrentPage, user } = useAppStore();
  const [activeLeague, setActiveLeague] = useState("all");

  const matches = [
    { id: 1, home: "Liverpool FC", away: "Manchester City", homeScore: 3, awayScore: 2, status: "FT", date: "Mar 15", competition: "Premier League", venue: "Anfield" },
    { id: 2, home: "Real Madrid", away: "Barcelona", homeScore: 2, awayScore: 2, status: "FT", date: "Mar 10", competition: "La Liga", venue: "Bernabeu" },
    { id: 3, home: "AC Milan", away: "Juventus", homeScore: 1, awayScore: 0, status: "78'", date: "Today", competition: "Serie A", venue: "San Siro", live: true },
    { id: 4, home: "Chelsea FC", away: "Arsenal FC", homeScore: null, awayScore: null, status: "20:45", date: "Tomorrow", competition: "Premier League", venue: "Stamford Bridge" },
    { id: 5, home: "Bayern Munich", away: "Dortmund", homeScore: null, awayScore: null, status: "17:30", date: "Sat, Apr 5", competition: "Bundesliga", venue: "Allianz Arena" },
    { id: 6, home: "PSG", away: "Marseille", homeScore: null, awayScore: null, status: "21:00", date: "Sun, Apr 6", competition: "Ligue 1", venue: "Parc des Princes" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Center</h1>
        <p className="text-muted-foreground">Live scores, results, and upcoming fixtures</p>
      </div>

      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "all", label: "All Leagues", icon: <Globe className="w-3.5 h-3.5" /> },
          { key: "Premier League", label: "Premier League", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "La Liga", label: "La Liga", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "Serie A", label: "Serie A", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "Bundesliga", label: "Bundesliga", icon: <Trophy className="w-3.5 h-3.5" /> },
        ].map(league => (
          <Button key={league.key} variant={activeLeague === league.key ? "default" : "outline"} size="sm" className="gap-1.5 rounded-lg text-xs" onClick={() => setActiveLeague(league.key)}>
            {league.icon} {league.label}
          </Button>
        ))}
      </div>

      {/* Live Now */}
      {matches.filter(m => m.live).length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold text-red-500">LIVE NOW</h2>
          </div>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
            <CardContent className="p-0">
              {matches.filter(m => m.live).map(match => (
                <div key={match.id} className="flex items-center justify-between p-5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-center">
                      <Badge variant="outline" className="border-red-300 text-red-500 text-xs">{match.status}</Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{match.home}</span>
                        <span className="text-xl font-bold mx-3">{match.homeScore} - {match.awayScore}</span>
                        <span className="font-semibold">{match.away}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{match.competition}</span>
                        <span>{match.venue}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4 text-red-500" onClick={() => setCurrentPage("highlights")}>
                    <Play className="w-4 h-4 mr-1" /> Watch
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Recent Results</h2>
      <div className="space-y-3 mb-8">
        {matches.filter(m => m.status === "FT").map(match => (
          <Card key={match.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                <span className="text-xs text-muted-foreground">{match.date}</span>
                <span className="text-xs text-muted-foreground">{match.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-sm">{match.home}</span>
                  <div className="text-center min-w-16">
                    <span className="text-xl font-bold">{match.homeScore} - {match.awayScore}</span>
                    <div className="text-xs text-muted-foreground">FT</div>
                  </div>
                  <span className="font-semibold text-sm">{match.away}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage("highlights")}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Fixtures</h2>
      <div className="space-y-3">
        {matches.filter(m => m.status !== "FT" && !m.live).map(match => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                <span className="text-xs text-muted-foreground">{match.date}</span>
                <span className="text-xs text-muted-foreground">{match.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-sm">{match.home}</span>
                  <div className="text-center min-w-16">
                    <span className="text-sm font-bold text-primary">{match.status}</span>
                    <div className="text-xs text-muted-foreground">KO</div>
                  </div>
                  <span className="font-semibold text-sm">{match.away}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => user ? setCurrentPage("tickets") : setCurrentPage("login")}>
                  <Ticket className="w-3.5 h-3.5" /> Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Scorers */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Top Scorers</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">Rank</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Player</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Team</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-16">Goals</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-16">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: "Erling Haaland", team: "Manchester City", goals: 24, assists: 5 },
                    { rank: 2, name: "Mohamed Salah", team: "Liverpool FC", goals: 21, assists: 13 },
                    { rank: 3, name: "Alexander Isak", team: "Newcastle United", goals: 18, assists: 4 },
                    { rank: 4, name: "Cole Palmer", team: "Chelsea FC", goals: 16, assists: 8 },
                    { rank: 5, name: "Bukayo Saka", team: "Arsenal FC", goals: 14, assists: 10 },
                    { rank: 6, name: "Bruno Fernandes", team: "Manchester United", goals: 12, assists: 11 },
                    { rank: 7, name: "Son Heung-min", team: "Tottenham Hotspur", goals: 11, assists: 5 },
                    { rank: 8, name: "Ollie Watkins", team: "Aston Villa", goals: 10, assists: 7 },
                  ].map((player) => (
                    <tr key={player.rank} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${player.rank <= 3 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>{player.rank}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{player.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{player.team}</td>
                      <td className="px-4 py-3 text-center font-bold text-primary">{player.goals}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{player.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* League Standings */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Premier League Standings</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">#</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Team</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">P</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">W</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">D</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">L</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">GD</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-14 font-bold">Pts</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-28">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pos: 1, team: "Liverpool FC", p: 29, w: 21, d: 5, l: 3, gd: 42, pts: 68, form: ["W", "W", "D", "W", "W"] },
                    { pos: 2, team: "Arsenal FC", p: 29, w: 19, d: 7, l: 3, gd: 38, pts: 64, form: ["W", "D", "W", "W", "L"] },
                    { pos: 3, team: "Manchester City", p: 29, w: 18, d: 5, l: 6, gd: 35, pts: 59, form: ["L", "W", "W", "D", "W"] },
                    { pos: 4, team: "Chelsea FC", p: 29, w: 16, d: 6, l: 7, gd: 22, pts: 54, form: ["W", "W", "L", "W", "D"] },
                    { pos: 5, team: "Newcastle United", p: 29, w: 15, d: 7, l: 7, gd: 20, pts: 52, form: ["D", "W", "W", "L", "W"] },
                    { pos: 6, team: "Aston Villa", p: 29, w: 14, d: 5, l: 10, gd: 10, pts: 47, form: ["L", "L", "W", "D", "W"] },
                  ].map((team) => (
                    <tr key={team.pos} className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors ${team.pos <= 4 ? "bg-primary/[0.02]" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${team.pos <= 4 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{team.pos}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{team.team}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.p}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.w}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.d}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.l}</td>
                      <td className={`px-4 py-3 text-center font-medium ${team.gd > 0 ? "text-primary" : team.gd < 0 ? "text-destructive" : "text-muted-foreground"}`}>{team.gd > 0 ? "+" : ""}{team.gd}</td>
                      <td className="px-4 py-3 text-center font-bold">{team.pts}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {team.form.map((f, fi) => (
                            <div key={fi} className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white ${f === "W" ? "bg-primary" : f === "D" ? "bg-amber-500" : "bg-destructive"}`}>{f}</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Rankings */}
      <div className="mt-10 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-500" /> Player Rankings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Mohamed Salah", team: "Liverpool FC", position: "RW", goals: 21, assists: 13, rating: 8.7, initials: "MS", color: "from-red-500 to-red-600" },
            { name: "Erling Haaland", team: "Manchester City", position: "ST", goals: 24, assists: 5, rating: 8.5, initials: "EH", color: "from-sky-500 to-sky-600" },
            { name: "Martin Odegaard", team: "Arsenal FC", position: "CM", goals: 8, assists: 11, rating: 8.3, initials: "MO", color: "from-red-600 to-red-700" },
            { name: "Cole Palmer", team: "Chelsea FC", position: "AM", goals: 16, assists: 8, rating: 8.2, initials: "CP", color: "from-blue-500 to-blue-700" },
            { name: "Bruno Fernandes", team: "Manchester United", position: "CAM", goals: 12, assists: 11, rating: 7.9, initials: "BF", color: "from-red-600 to-red-800" },
            { name: "Bukayo Saka", team: "Arsenal FC", position: "RW", goals: 14, assists: 10, rating: 8.1, initials: "BS", color: "from-red-600 to-red-700" },
          ].map((player, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
                    {player.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{player.name}</h3>
                    <p className="text-xs text-muted-foreground">{player.team}</p>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-lg">{player.position}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary">{player.goals}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Goals</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary">{player.assists}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Assists</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-amber-500">{player.rating}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-0.5"><Star className="w-2.5 h-2.5" /> Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD PAGE ====================
function DashboardPage() {
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

// ==================== STORE PAGE ====================
function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const { token, setCurrentPage, searchQuery, setSearchQuery } = useAppStore();

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(data => { setProducts(data.products || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const addToCart = async (productId: string) => {
    if (!token) { setCurrentPage("login"); toast.error("Please login to add items to cart"); return; }
    try {
      const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId, quantity: 1, size: "M" }) });
      if (res.ok) toast.success("Added to cart!", { description: "Jersey added to your shopping cart" });
    } catch { toast.error("Failed to add to cart"); }
  };

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
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Official Jersey Store</h1>
        <p className="text-muted-foreground">Authentic football jerseys from the world&apos;s biggest clubs</p>
      </div>

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
            {featured.slice(0, 4).map((product) => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} />))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">All Jerseys</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={addToCart} />))}
      </div>
      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><Store className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No jerseys found matching {searchQuery ? `"${searchQuery}"` : "your filter"}.</p></div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (id: string) => void }) {
  const [selectedSize, setSelectedSize] = useState("M");
  const sizes = product.sizes?.split(",") || ["M"];

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.featured && <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm rounded-lg"><Star className="w-3 h-3 mr-1" /> Featured</Badge>}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.team}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.stock} in stock)</span>
        </div>
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
  );
}

// ==================== CART PAGE ====================
function CartPage() {
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

// ==================== HIGHLIGHTS PAGE ====================
function HighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);

  useEffect(() => {
    fetch("/api/highlights").then(res => res.json()).then(data => { setHighlights(data.highlights || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatViews = (views: number) => { if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`; if (views >= 1000) return `${(views / 1000).toFixed(0)}K`; return views.toString(); };

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Highlights</h1>
        <p className="text-muted-foreground">AI-curated highlights from the biggest football matches</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight, i) => (
          <Card key={i} className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500" onClick={() => setSelectedHighlight(highlight)}>
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-100 scale-75 shadow-xl">
                  <Play className="w-6 h-6 text-black ml-1" />
                </div>
              </div>
              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white backdrop-blur-sm rounded-md"><Clock className="w-3 h-3 mr-1" /> {highlight.duration}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{highlight.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{highlight.match}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {formatViews(highlight.views)} views</div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); toast.success("Saved to favorites!"); }}><Heart className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); toast.success("Link copied!"); }}><Share2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {highlights.length === 0 && <div className="text-center py-16 text-muted-foreground"><Video className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No highlights available yet.</p></div>}
      <Dialog open={!!selectedHighlight} onOpenChange={() => setSelectedHighlight(null)}>
        <DialogContent className="max-w-2xl">
          {selectedHighlight && (<>
            <div className="aspect-video overflow-hidden rounded-xl bg-muted mb-4 relative">
              <img src={selectedHighlight.thumbnail} alt={selectedHighlight.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"><Play className="w-8 h-8 text-black ml-1" /></div></div>
            </div>
            <DialogHeader><DialogTitle>{selectedHighlight.title}</DialogTitle><DialogDescription>{selectedHighlight.match}</DialogDescription></DialogHeader>
            <p className="text-sm text-muted-foreground">{selectedHighlight.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatViews(selectedHighlight.views)} views</div><div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedHighlight.duration}</div></div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== TICKETS PAGE ====================
function TicketsPage() {
  const { token, setCurrentPage } = useAppStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [form, setForm] = useState({ match: "", homeTeam: "", awayTeam: "", date: "", time: "", venue: "", section: "Standard", price: "" });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try { const res = await fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); setTickets(data.tickets || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const bookTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setBookingLoading(true);
    try {
      const res = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ticket) { toast.success("Ticket booked!", { description: `${form.homeTeam} vs ${form.awayTeam}` }); setForm({ match: "", homeTeam: "", awayTeam: "", date: "", time: "", venue: "", section: "Standard", price: "" }); setBookingOpen(false); fetchTickets(); }
      else { toast.error("Booking failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setBookingLoading(false); }
  };

  const cancelTicket = async (id: string) => {
    try { await fetch(`/api/tickets?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setTickets(prev => prev.filter(t => t.id !== id)); toast.success("Ticket cancelled"); }
    catch { toast.error("Failed to cancel ticket"); }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl mb-4" />)}</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-bold">Match Tickets</h1><p className="text-muted-foreground">Book and manage your match day experience</p></div>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild><Button className="gap-2 rounded-xl shadow-md shadow-primary/20"><Ticket className="w-4 h-4" /> Book New Ticket</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Book a Match Ticket</DialogTitle><DialogDescription>Fill in the details to book your match ticket</DialogDescription></DialogHeader>
            <form onSubmit={bookTicket} className="space-y-4">
              <div className="space-y-2"><Label>Match</Label><Input placeholder="e.g. Premier League - Matchday 30" value={form.match} onChange={e => setForm({ ...form, match: e.target.value })} required className="h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Home Team</Label><Input placeholder="e.g. Liverpool FC" value={form.homeTeam} onChange={e => setForm({ ...form, homeTeam: e.target.value })} required className="h-11" /></div>
                <div className="space-y-2"><Label>Away Team</Label><Input placeholder="e.g. Arsenal FC" value={form.awayTeam} onChange={e => setForm({ ...form, awayTeam: e.target.value })} required className="h-11" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="h-11" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required className="h-11" /></div>
              </div>
              <div className="space-y-2"><Label>Venue</Label><Input placeholder="e.g. Anfield, Liverpool" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required className="h-11" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Section</Label><Select value={form.section} onValueChange={v => setForm({ ...form, section: v })}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Premium">Premium</SelectItem><SelectItem value="VIP">VIP</SelectItem><SelectItem value="Club Level">Club Level</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Price (£)</Label><Input type="number" placeholder="75.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="h-11" /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={bookingLoading} className="gap-2 rounded-xl">{bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />} Confirm Booking</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-8 border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Matches</CardTitle><CardDescription>Click on any match to quickly book a ticket</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { home: "Liverpool FC", away: "Everton FC", date: "2025-04-05", time: "15:00", venue: "Anfield", competition: "Premier League", price: 65 },
              { home: "Real Madrid", away: "Barcelona", date: "2025-04-12", time: "21:00", venue: "Santiago Bernabeu", competition: "La Liga", price: 180 },
              { home: "AC Milan", away: "Inter Milan", date: "2025-04-19", time: "20:45", venue: "San Siro", competition: "Serie A", price: 120 },
            ].map((match, i) => (
              <Card key={i} className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" onClick={() => { setForm({ match: match.competition, homeTeam: match.home, awayTeam: match.away, date: match.date, time: match.time, venue: match.venue, section: "Standard", price: match.price.toString() }); setBookingOpen(true); }}>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs rounded-lg">{match.competition}</Badge>
                  <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm">{match.home}</span><span className="text-xs text-muted-foreground font-bold">VS</span><span className="font-semibold text-sm">{match.away}</span></div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{match.date}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span></div>
                  <div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span><span className="font-bold text-primary text-sm">£{match.price}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">My Tickets ({tickets.length})</h2>
      {tickets.length === 0 ? (
        <Card className="text-center p-12"><Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" /><h2 className="text-xl font-semibold mb-2">No tickets yet</h2><p className="text-muted-foreground mb-6">Book your first match ticket</p><Button className="gap-2 rounded-xl" onClick={() => setBookingOpen(true)}><Ticket className="w-4 h-4" /> Book Ticket</Button></Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0"><div className="flex flex-col md:flex-row">
                <div className="md:w-48 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                  <div className="text-xs text-primary font-medium mb-1">{ticket.match.split(" - ")[0]}</div>
                  <div className="text-2xl font-bold">{ticket.homeTeam.split(" ").pop()}</div><div className="text-xs text-muted-foreground my-1">vs</div><div className="text-2xl font-bold">{ticket.awayTeam.split(" ").pop()}</div>
                </div>
                <div className="flex-1 p-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{ticket.match}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ticket.date}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.time}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ticket.venue}</span></div>
                    <div className="flex items-center gap-3 text-sm mt-1"><Badge variant="outline" className="rounded-lg">Section: {ticket.section}</Badge><Badge variant="outline" className="rounded-lg">Seat: {ticket.seat}</Badge><Badge variant={ticket.status === "confirmed" ? "default" : "secondary"} className="rounded-lg">{ticket.status === "confirmed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}{ticket.status}</Badge></div>
                  </div>
                  <div className="flex items-center gap-3"><div className="text-right"><div className="text-2xl font-bold text-primary">£{ticket.price.toFixed(2)}</div></div><Button variant="destructive" size="icon" className="rounded-lg" onClick={() => cancelTicket(ticket.id)}><Trash2 className="w-4 h-4" /></Button></div>
                </div></div>
              </div></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ANALYZE PAGE ====================
function AnalyzePage() {
  const { token } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/analyze", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()).then(data => setHistory(data.analyses || [])).catch(() => {});
  }, [token, result]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const base64 = ev.target?.result as string; setImage(base64); setPreviewUrl(base64); };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !token) return;
    setAnalyzing(true); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ imageBase64: image }) });
      const data = await res.json();
      if (data.analysis) { setResult(data.analysis); toast.success("Analysis complete!", { description: `Detected formation: ${data.analysis.formation}` }); }
      else { toast.error("Analysis failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Formation Analysis</h1>
        <p className="text-muted-foreground">Upload a football match image and let AI detect formations and player positions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Upload Match Image</CardTitle><CardDescription>Supports PNG, JPEG, and WebP formats</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all" onClick={() => document.getElementById("image-upload")?.click()}>
              {previewUrl ? (
                <div className="relative"><img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover" /><Button variant="ghost" size="sm" className="mt-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setImage(null); setPreviewUrl(null); setResult(null); }}><Upload className="w-4 h-4 mr-1" /> Upload Different</Button></div>
              ) : (
                <div className="space-y-4"><div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse"><Upload className="w-8 h-8 text-primary" /></div><div><p className="font-medium">Click to upload</p><p className="text-sm text-muted-foreground mt-1">Upload a screenshot or photo of a football match</p></div><div className="flex items-center gap-2 justify-center text-xs text-muted-foreground"><Camera className="w-3 h-3" /> PNG, JPEG, WebP supported</div></div>
              )}
            </div>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button className="w-full gap-2 h-11 rounded-xl shadow-md shadow-primary/20" disabled={!image || analyzing} onClick={handleAnalyze}>
              {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ScanSearch className="w-4 h-4" /> Analyze Formation</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Analysis Results</CardTitle></CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="text-center py-12 space-y-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mx-auto animate-pulse"><Cpu className="w-8 h-8 text-primary" /></div><div><p className="font-medium">AI is analyzing your image...</p><p className="text-sm text-muted-foreground mt-1">Detecting players, ball, and formations</p></div><Progress value={66} className="w-48 mx-auto" /></div>
            ) : result ? (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Formation", val: result.formation },
                    { label: "Players", val: String(result.playersCount) },
                    { label: "Confidence", val: `${Math.round((result.confidence || 0) * 100)}%` },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className="text-xl font-bold text-primary">{s.val}</p></div>
                  ))}
                </div>
                {(result.homeTeam || result.awayTeam) && (
                  <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Home</p><p className="font-semibold">{result.homeTeam || "Unknown"}</p></div>
                    <Badge variant="secondary" className="text-lg px-3">VS</Badge>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Away</p><p className="font-semibold">{result.awayTeam || "Unknown"}</p></div>
                  </div>
                )}
                <div><h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Tactical Analysis</h4><p className="text-sm text-muted-foreground leading-relaxed">{result.analysis}</p></div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground"><ScanSearch className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Upload an image and click &quot;Analyze Formation&quot; to see results</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {history.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Analysis History</CardTitle><CardDescription>Your previous formation analyses</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">{history.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary font-bold text-lg">{item.formation.split("-")[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm">Formation: {item.formation}</p><p className="text-xs text-muted-foreground">{item.homeTeam && item.awayTeam ? `${item.homeTeam} vs ${item.awayTeam}` : "Teams not detected"} &bull; {item.playersCount} players</p></div>
                <div className="text-right"><Badge variant="outline" className="rounded-lg">{Math.round((item.confidence || 0) * 100)}%</Badge><p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p></div>
              </div>
            ))}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== FOOTER ====================
function Footer() {
  const { setCurrentPage } = useAppStore();
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-sm"><Target className="w-4 h-4 text-primary-foreground" /></div>
              <span className="text-lg font-bold">Pitch<span className="text-primary">Vision</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">AI-powered football analysis platform. Detect formations, watch highlights, and experience the beautiful game like never before.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2">
              {[{ label: "AI Analysis", page: "analyze" as Page }, { label: "Match Center", page: "match-center" as Page }, { label: "Highlights", page: "highlights" as Page }, { label: "Jersey Store", page: "store" as Page }, { label: "Match Tickets", page: "tickets" as Page }].map((item) => (
                <button key={item.page} className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setCurrentPage(item.page)}>{item.label}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Technologies</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Next.js 16 & React 19</p>
              <p className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> AI Vision Model (VLM)</p>
              <p className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Responsive Design</p>
              <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> JWT Authentication</p>
              <p className="flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Prisma ORM</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>PitchVision is a Work-Based Learning project demonstrating modern web development with AI integration.</p>
              <p className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary" /> HiveMind Project 2025</p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => toast.info("Follow us on X/Twitter!")}><Share2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => toast.info("Follow us on Instagram!")}><Camera className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => toast.info("Subscribe on YouTube!")}><Play className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 PitchVision. All rights reserved.</p>
          <p>Built with passion for football fans everywhere</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const { currentPage, hydrateAuth, isLoading, user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    hydrateAuth();
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, [hydrateAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-primary/30 animate-pulse">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-xl font-bold">Pitch<span className="text-primary">Vision</span></div>
          <div className="text-sm text-muted-foreground">Loading your experience...</div>
        </div>
      </div>
    );
  }

  const requireAuth = (component: React.ReactNode) => {
    if (!user) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center p-8 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25"><LogIn className="w-8 h-8 text-primary-foreground" /></div>
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to access this feature</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="rounded-xl" onClick={() => useAppStore.getState().setCurrentPage("login")}>Login</Button>
              <Button className="rounded-xl shadow-md shadow-primary/20" onClick={() => useAppStore.getState().setCurrentPage("register")}>Register</Button>
            </div>
          </Card>
        </div>
      );
    }
    return component;
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login": return <LoginPage />;
      case "register": return <RegisterPage />;
      case "dashboard": return requireAuth(<DashboardPage />);
      case "match-center": return <MatchCenterPage />;
      case "store": return <StorePage />;
      case "cart": return requireAuth(<CartPage />);
      case "highlights": return <HighlightsPage />;
      case "tickets": return requireAuth(<TicketsPage />);
      case "analyze": return requireAuth(<AnalyzePage />);
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground animate-fade-in transition-opacity"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
