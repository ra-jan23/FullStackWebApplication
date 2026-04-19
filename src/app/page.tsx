"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icons
import {
  Home, LogIn, LogOut, UserPlus, LayoutDashboard, Store, ShoppingCart,
  Ticket, Video, ScanSearch, Moon, Sun, Menu, X, Search, Star,
  ChevronRight, Trophy, Users, BarChart3, Zap, Shield, Eye,
  Clock, MapPin, Calendar, CreditCard, Trash2, Plus, Minus,
  Camera, Upload, Loader2, ArrowLeft, Play, Heart, Share2,
  Globe, Smartphone, Cpu, Target, Layers, TrendingUp,
  Award, Crown, Sparkles, CheckCircle2, AlertCircle, Info
} from "lucide-react";

// ==================== NAVBAR ====================
function Navbar() {
  const { currentPage, setCurrentPage, user, logout, cartCount, isLoading } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const navItems: { page: Page; label: string; icon: React.ReactNode; auth?: boolean }[] = [
    { page: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
    { page: "store", label: "Jersey Store", icon: <Store className="w-4 h-4" /> },
    { page: "highlights", label: "Highlights", icon: <Video className="w-4 h-4" /> },
    { page: "tickets", label: "Tickets", icon: <Ticket className="w-4 h-4" />, auth: true },
    { page: "analyze", label: "AI Analysis", icon: <ScanSearch className="w-4 h-4" />, auth: true },
    { page: "cart", label: "Cart", icon: <ShoppingCart className="w-4 h-4" />, auth: true },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("home")}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Pitch<span className="text-primary">Vision</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.auth && !user) return null;
            return (
              <Button
                key={item.page}
                variant={currentPage === item.page ? "default" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => handleNavClick(item.page)}
              >
                {item.icon}
                {item.label}
                {item.page === "cart" && cartCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          {isLoading ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {user.name}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleNavClick("login")}>
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => handleNavClick("register")}>
                <UserPlus className="w-4 h-4" />
                Register
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              if (item.auth && !user) return null;
              return (
                <Button
                  key={item.page}
                  variant={currentPage === item.page ? "default" : "ghost"}
                  className="justify-start gap-2 w-full"
                  onClick={() => handleNavClick(item.page)}
                >
                  {item.icon}
                  {item.label}
                  {item.page === "cart" && cartCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
            <Separator />
            {!user ? (
              <>
                <Button variant="ghost" className="justify-start gap-2 w-full" onClick={() => handleNavClick("login")}>
                  <LogIn className="w-4 h-4" /> Login
                </Button>
                <Button className="justify-start gap-2 w-full" onClick={() => handleNavClick("register")}>
                  <UserPlus className="w-4 h-4" /> Register
                </Button>
              </>
            ) : (
              <Button variant="destructive" className="justify-start gap-2 w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ==================== HOME PAGE ====================
function HomePage() {
  const { setCurrentPage, user } = useAppStore();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero/stadium-hero.png" alt="Stadium" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary-foreground border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Football Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Experience Football
              <span className="text-primary"> Like Never </span>
              Before
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Analyze formations with AI, watch stunning highlights, shop official jerseys, and book match tickets — all in one platform. Powered by cutting-edge computer vision.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 text-base" onClick={() => setCurrentPage(user ? "analyze" : "register")}>
                <ScanSearch className="w-5 h-5" /> Try AI Analysis
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base border-white/30 text-white hover:bg-white/10" onClick={() => setCurrentPage("store")}>
                <Store className="w-5 h-5" /> Browse Jerseys
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">
            <Crown className="w-3 h-3 mr-1" /> Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything a Football Fan Needs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From AI-powered match analysis to ticket booking, PitchVision brings the complete football experience to your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ScanSearch className="w-8 h-8" />, title: "AI Formation Detection", desc: "Upload match photos and let AI detect player positions and formations instantly.", page: "analyze" as Page, color: "text-emerald-500" },
            { icon: <Video className="w-8 h-8" />, title: "Match Highlights", desc: "Watch AI-curated highlights from the biggest matches around the world.", page: "highlights" as Page, color: "text-orange-500" },
            { icon: <Store className="w-8 h-8" />, title: "Jersey Store", desc: "Shop authentic football jerseys from top clubs and national teams.", page: "store" as Page, color: "text-blue-500" },
            { icon: <Ticket className="w-8 h-8" />, title: "Match Tickets", desc: "Book tickets for upcoming matches and experience the atmosphere live.", page: "tickets" as Page, color: "text-purple-500" },
          ].map((feature, i) => (
            <Card
              key={i}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-dashed"
              onClick={() => setCurrentPage(user && feature.page !== "highlights" && feature.page !== "store" ? feature.page : (feature.page === "highlights" || feature.page === "store" ? feature.page : "register"))}
            >
              <CardHeader className="pb-3">
                <div className={`${feature.color} mb-2`}>{feature.icon}</div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 border-y">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50K+", label: "Matches Analyzed", icon: <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" /> },
              { value: "200+", label: "Teams Covered", icon: <Shield className="w-6 h-6 mx-auto mb-2 text-primary" /> },
              { value: "10K+", label: "Jerseys Available", icon: <Store className="w-6 h-6 mx-auto mb-2 text-primary" /> },
              { value: "95%", label: "AI Accuracy", icon: <Target className="w-6 h-6 mx-auto mb-2 text-primary" /> },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                {stat.icon}
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How AI Analysis Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to analyze any football match formation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: "01", title: "Upload Image", desc: "Take a screenshot or photo of any football match", icon: <Upload className="w-6 h-6" /> },
            { step: "02", title: "AI Detection", desc: "Our AI model detects players, ball, and positions", icon: <Cpu className="w-6 h-6" /> },
            { step: "03", title: "Get Results", desc: "View detected formation, player count, and tactical analysis", icon: <CheckCircle2 className="w-6 h-6" /> },
          ].map((item, i) => (
            <div key={i} className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4 text-primary">
                {item.icon}
              </div>
              <Badge variant="outline" className="mb-2">{item.step}</Badge>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Analyze Your First Match?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of football fans using PitchVision to understand the beautiful game at a deeper level.
          </p>
          <Button size="lg" variant="secondary" className="gap-2 text-base" onClick={() => setCurrentPage(user ? "analyze" : "register")}>
            <Zap className="w-5 h-5" /> Get Started Free
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.user, data.token);
        toast.success("Welcome back!", { description: `Logged in as ${data.user.name}` });
        setCurrentPage("dashboard");
      } else {
        toast.error("Login failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your PitchVision account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="demo@pitchvision.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign In
            </Button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-primary" />
              <span className="font-medium">Demo Account</span>
            </div>
            <div className="text-muted-foreground">
              Email: demo@pitchvision.com<br />Password: demo123
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button className="text-primary hover:underline font-medium" onClick={() => setCurrentPage("register")}>
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.user, data.token);
        toast.success("Account created!", { description: `Welcome to PitchVision, ${data.user.name}` });
        setCurrentPage("dashboard");
      } else {
        toast.error("Registration failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join PitchVision and start analyzing football</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input id="reg-password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button className="text-primary hover:underline font-medium" onClick={() => setCurrentPage("login")}>
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your football activity overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setCurrentPage("analyze")}>
            <ScanSearch className="w-4 h-4" /> New Analysis
          </Button>
          <Button className="gap-2" onClick={() => setCurrentPage("store")}>
            <Store className="w-4 h-4" /> Shop Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Match Tickets", value: stats?.stats?.totalTickets || 0, icon: <Ticket className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Highlights Saved", value: stats?.stats?.totalHighlights || 0, icon: <Video className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "AI Analyses", value: stats?.stats?.totalAnalyses || 0, icon: <ScanSearch className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Cart Items", value: stats?.stats?.cartCount || 0, icon: <ShoppingCart className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spending & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              £{(stats?.stats?.totalSpent || 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total amount spent on match tickets</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setCurrentPage("tickets")}>
                <Ticket className="w-3 h-3" /> View Tickets
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setCurrentPage("cart")}>
                <ShoppingCart className="w-3 h-3" /> View Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Analyze Match", icon: <Camera className="w-5 h-5" />, page: "analyze" as Page },
                { label: "Browse Jerseys", icon: <Store className="w-5 h-5" />, page: "store" as Page },
                { label: "Watch Highlights", icon: <Play className="w-5 h-5" />, page: "highlights" as Page },
                { label: "Book Tickets", icon: <Ticket className="w-5 h-5" />, page: "tickets" as Page },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => setCurrentPage(action.page)}
                >
                  {action.icon}
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Highlights */}
      {stats?.topHighlights && stats.topHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Trending Highlights
            </CardTitle>
            <CardDescription>Most viewed highlights this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topHighlights.slice(0, 3).map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer" onClick={() => setCurrentPage("highlights")}>
                  <img src={h.thumbnail} alt={h.title} className="w-20 h-14 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.match}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" /> {(h.views / 1000).toFixed(0)}K
                    </div>
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

// ==================== STORE PAGE ====================
function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const { token, setCurrentPage } = useAppStore();

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = async (productId: string) => {
    if (!token) { setCurrentPage("login"); toast.error("Please login to add items to cart"); return; }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1, size: "M" }),
      });
      if (res.ok) {
        toast.success("Added to cart!", { description: "Jersey added to your shopping cart" });
      }
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const featured = products.filter(p => p.featured);
  const filtered = filter === "featured" ? featured : filter === "all" ? products : products.filter(p => p.team.toLowerCase().includes(filter.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Official Jersey Store</h1>
        <p className="text-muted-foreground">Authentic football jerseys from the world&apos;s biggest clubs</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {["all", "featured"].map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Jerseys */}
      {filter === "all" && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Featured Jerseys
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      {/* All Jerseys */}
      <h2 className="text-xl font-semibold mb-4">All Jerseys</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No jerseys found matching your filter.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (id: string) => void }) {
  const [selectedSize, setSelectedSize] = useState("M");
  const sizes = product.sizes?.split(",") || ["M"];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            <Star className="w-3 h-3 mr-1" /> Featured
          </Badge>
        )}
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
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              size="sm"
              className="h-7 w-8 p-0 text-xs"
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">£{product.price.toFixed(2)}</span>
          <Button size="sm" className="gap-1" onClick={() => onAddToCart(product.id)}>
            <Plus className="w-3 h-3" /> Add
          </Button>
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, setCartCount]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const removeFromCart = async (id: string) => {
    try {
      const res = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
      setCartCount((data.cartItems || []).length);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl mb-4" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setCurrentPage("store")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse our jersey store to find your perfect kit</p>
          <Button className="gap-2" onClick={() => setCurrentPage("store")}>
            <Store className="w-4 h-4" /> Browse Jerseys
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.product.team} • Size: {item.size}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">£{(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">£{total.toFixed(2)}</span>
                </div>
                <Button className="w-full gap-2" onClick={() => toast.success("Checkout is for demo purposes only!")}>
                  <CreditCard className="w-4 h-4" /> Checkout
                </Button>
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
  const { token } = useAppStore();

  useEffect(() => {
    fetch("/api/highlights")
      .then(res => res.json())
      .then(data => { setHighlights(data.highlights || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Highlights</h1>
        <p className="text-muted-foreground">AI-curated highlights from the biggest football matches</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight, i) => (
          <Card
            key={i}
            className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedHighlight(highlight)}
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-black ml-1" />
                </div>
              </div>
              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                <Clock className="w-3 h-3 mr-1" /> {highlight.duration}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{highlight.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{highlight.match}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {formatViews(highlight.views)} views
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.success("Saved to favorites!"); }}>
                    <Heart className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.success("Link copied!"); }}>
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {highlights.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No highlights available yet.</p>
        </div>
      )}

      {/* Highlight Detail Dialog */}
      <Dialog open={!!selectedHighlight} onOpenChange={() => setSelectedHighlight(null)}>
        <DialogContent className="max-w-2xl">
          {selectedHighlight && (
            <>
              <div className="aspect-video overflow-hidden rounded-lg bg-muted mb-4 relative">
                <img src={selectedHighlight.thumbnail} alt={selectedHighlight.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </div>
              </div>
              <DialogHeader>
                <DialogTitle>{selectedHighlight.title}</DialogTitle>
                <DialogDescription>{selectedHighlight.match}</DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selectedHighlight.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatViews(selectedHighlight.views)} views</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedHighlight.duration}</div>
              </div>
            </>
          )}
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
    try {
      const res = await fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const bookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ticket) {
        toast.success("Ticket booked!", { description: `${form.homeTeam} vs ${form.awayTeam}` });
        setForm({ match: "", homeTeam: "", awayTeam: "", date: "", time: "", venue: "", section: "Standard", price: "" });
        setBookingOpen(false);
        fetchTickets();
      } else {
        toast.error("Booking failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelTicket = async (id: string) => {
    try {
      await fetch(`/api/tickets?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success("Ticket cancelled");
    } catch {
      toast.error("Failed to cancel ticket");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl mb-4" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Match Tickets</h1>
          <p className="text-muted-foreground">Book and manage your match day experience</p>
        </div>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Ticket className="w-4 h-4" /> Book New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book a Match Ticket</DialogTitle>
              <DialogDescription>Fill in the details to book your match ticket</DialogDescription>
            </DialogHeader>
            <form onSubmit={bookTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Match</Label>
                <Input placeholder="e.g. Premier League - Matchday 30" value={form.match} onChange={e => setForm({ ...form, match: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Home Team</Label>
                  <Input placeholder="e.g. Liverpool FC" value={form.homeTeam} onChange={e => setForm({ ...form, homeTeam: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Away Team</Label>
                  <Input placeholder="e.g. Arsenal FC" value={form.awayTeam} onChange={e => setForm({ ...form, awayTeam: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input placeholder="e.g. Anfield, Liverpool" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={form.section} onValueChange={v => setForm({ ...form, section: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard (£50-75)</SelectItem>
                      <SelectItem value="Premium">Premium (£100-150)</SelectItem>
                      <SelectItem value="VIP">VIP (£200-300)</SelectItem>
                      <SelectItem value="Club Level">Club Level (£150-250)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (£)</Label>
                  <Input type="number" placeholder="75.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={bookingLoading} className="gap-2">
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                  Confirm Booking
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Matches Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Matches</CardTitle>
          <CardDescription>Click on any match to quickly book a ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { home: "Liverpool FC", away: "Everton FC", date: "2025-04-05", time: "15:00", venue: "Anfield", competition: "Premier League", price: 65 },
              { home: "Real Madrid", away: "Barcelona", date: "2025-04-12", time: "21:00", venue: "Santiago Bernabeu", competition: "La Liga", price: 180 },
              { home: "AC Milan", away: "Inter Milan", date: "2025-04-19", time: "20:45", venue: "San Siro", competition: "Serie A", price: 120 },
            ].map((match, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
                setForm({
                  match: `${match.competition}`,
                  homeTeam: match.home,
                  awayTeam: match.away,
                  date: match.date,
                  time: match.time,
                  venue: match.venue,
                  section: "Standard",
                  price: match.price.toString(),
                });
                setBookingOpen(true);
              }}>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">{match.competition}</Badge>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{match.home}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="font-semibold text-sm">{match.away}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{match.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{match.time}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{match.venue}</span>
                    <span className="font-bold text-primary text-sm">£{match.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <h2 className="text-xl font-semibold mb-4">My Tickets ({tickets.length})</h2>
      {tickets.length === 0 ? (
        <Card className="text-center p-12">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No tickets yet</h2>
          <p className="text-muted-foreground mb-6">Book your first match ticket and experience the atmosphere</p>
          <Button className="gap-2" onClick={() => setBookingOpen(true)}>
            <Ticket className="w-4 h-4" /> Book Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 bg-primary/10 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                    <div className="text-xs text-primary font-medium mb-1">{ticket.match.split(" - ")[0]}</div>
                    <div className="text-2xl font-bold">{ticket.homeTeam.split(" ").pop()}</div>
                    <div className="text-xs text-muted-foreground my-1">vs</div>
                    <div className="text-2xl font-bold">{ticket.awayTeam.split(" ").pop()}</div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold">{ticket.match}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ticket.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ticket.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ticket.venue}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-1">
                          <Badge variant="outline">Section: {ticket.section}</Badge>
                          <Badge variant="outline">Seat: {ticket.seat}</Badge>
                          <Badge variant={ticket.status === "confirmed" ? "default" : "secondary"}>
                            {ticket.status === "confirmed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">£{ticket.price.toFixed(2)}</div>
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => cancelTicket(ticket.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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

// ==================== ANALYZE PAGE ====================
function AnalyzePage() {
  const { token, setCurrentPage } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/analyze", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setHistory(data.analyses || []))
      .catch(() => {});
  }, [token, result]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImage(base64);
      setPreviewUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !token) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: image }),
      });
      const data = await res.json();
      if (data.analysis) {
        setResult(data.analysis);
        toast.success("Analysis complete!", { description: `Detected formation: ${data.analysis.formation}` });
      } else {
        toast.error("Analysis failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Formation Analysis</h1>
        <p className="text-muted-foreground">Upload a football match image and let AI detect formations and player positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Upload Match Image
            </CardTitle>
            <CardDescription>Supports PNG, JPEG, and WebP formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                  <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); setImage(null); setPreviewUrl(null); setResult(null); }}>
                    <Upload className="w-4 h-4 mr-1" /> Upload Different Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a screenshot or photo of a football match</p>
                  </div>
                </div>
              )}
            </div>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button className="w-full gap-2" disabled={!image || analyzing} onClick={handleAnalyze}>
              {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ScanSearch className="w-4 h-4" /> Analyze Formation</>}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">AI is analyzing your image...</p>
                  <p className="text-sm text-muted-foreground mt-1">Detecting players, ball, and formations</p>
                </div>
                <Progress value={66} className="w-48 mx-auto" />
              </div>
            ) : result ? (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Formation</p>
                    <p className="text-2xl font-bold text-primary">{result.formation}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Players</p>
                    <p className="text-2xl font-bold">{result.playersCount}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                    <p className="text-2xl font-bold">{Math.round((result.confidence || 0) * 100)}%</p>
                  </div>
                </div>
                {(result.homeTeam || result.awayTeam) && (
                  <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-muted">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Home</p>
                      <p className="font-semibold">{result.homeTeam || "Unknown"}</p>
                    </div>
                    <div className="text-lg font-bold text-primary">VS</div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Away</p>
                      <p className="font-semibold">{result.awayTeam || "Unknown"}</p>
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Tactical Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ScanSearch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Upload an image and click &quot;Analyze Formation&quot; to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Analysis History
            </CardTitle>
            <CardDescription>Your previous formation analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {item.formation.split("-")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Formation: {item.formation}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.homeTeam && item.awayTeam ? `${item.homeTeam} vs ${item.awayTeam}` : "Teams not detected"} • {item.playersCount} players
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{Math.round((item.confidence || 0) * 100)}%</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
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

// ==================== FOOTER ====================
function Footer() {
  const { setCurrentPage } = useAppStore();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                Pitch<span className="text-primary">Vision</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered football analysis platform. Detect formations, watch highlights, and experience the beautiful game like never before.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2">
              {[
                { label: "AI Analysis", page: "analyze" as Page },
                { label: "Highlights", page: "highlights" as Page },
                { label: "Jersey Store", page: "store" as Page },
                { label: "Match Tickets", page: "tickets" as Page },
              ].map((item) => (
                <button key={item.page} className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setCurrentPage(item.page)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Technologies</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Next.js 16 & React</p>
              <p className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> AI Vision Model (VLM)</p>
              <p className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Responsive Design</p>
              <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Secure Auth (JWT)</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>PitchVision is a Work-Based Learning project demonstrating modern web development with AI integration.</p>
              <p className="flex items-center gap-2"><Award className="w-3.5 h-3.5" /> HiveMind Project 2025</p>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 PitchVision. All rights reserved.</p>
          <p>Built with ❤️ for football fans everywhere</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const { currentPage, hydrateAuth, isLoading, user } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrateAuth();
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, [hydrateAuth]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto animate-pulse">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-xl font-bold">
            Pitch<span className="text-primary">Vision</span>
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const requireAuth = (component: React.ReactNode) => {
    if (!user) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center p-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to access this feature</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => useAppStore.getState().setCurrentPage("login")}>
                Login
              </Button>
              <Button onClick={() => useAppStore.getState().setCurrentPage("register")}>
                Register
              </Button>
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
      case "store": return <StorePage />;
      case "cart": return requireAuth(<CartPage />);
      case "highlights": return <HighlightsPage />;
      case "tickets": return requireAuth(<TicketsPage />);
      case "analyze": return requireAuth(<AnalyzePage />);
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}
