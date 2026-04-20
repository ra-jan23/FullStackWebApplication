"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Home, LogIn, LogOut, UserPlus, LayoutDashboard, Store, ShoppingCart,
  Ticket, Video, ScanSearch, Moon, Sun, Menu, X, Search, User,
  CheckCircle2, Play, Flame, Calendar, Target, Trophy, Bell, Heart, MessageCircle, Brain, Newspaper, ShoppingBag, ArrowLeftRight, Zap
} from "lucide-react";

export default function Navbar() {
  const { currentPage, setCurrentPage, user, logout, cartCount, favoritesCount, isLoading, searchQuery, setSearchQuery } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const localSearchQuery = useState(searchQuery);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Navbar scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: { page: Page; label: string; icon: React.ReactNode; auth?: boolean }[] = [
    { page: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { page: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, auth: true },
    { page: "orders", label: "My Orders", icon: <ShoppingBag className="w-4 h-4" />, auth: true },
    { page: "match-center", label: "Match Center", icon: <Trophy className="w-4 h-4" /> },
    { page: "store", label: "Jersey Store", icon: <Store className="w-4 h-4" /> },
    { page: "favorites", label: "Favorites", icon: <Heart className="w-4 h-4" />, auth: true },
    { page: "highlights", label: "Highlights", icon: <Video className="w-4 h-4" /> },
    { page: "tickets", label: "Tickets", icon: <Ticket className="w-4 h-4" />, auth: true },
    { page: "analyze", label: "AI Analysis", icon: <ScanSearch className="w-4 h-4" />, auth: true },
    { page: "chat", label: "AI Chat", icon: <MessageCircle className="w-4 h-4" /> },
    { page: "predictions", label: "Predictions", icon: <Brain className="w-4 h-4" /> },
    { page: "news", label: "News", icon: <Newspaper className="w-4 h-4" /> },
    { page: "transfers", label: "Transfers", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { page: "quiz", label: "Quiz", icon: <Zap className="w-4 h-4" /> },
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
    <header className={`sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl navbar-scroll-shadow ${scrolled ? "scrolled navbar-scrolled" : ""}`}>
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
                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs rounded-full badge-pop">
                    {cartCount}
                  </Badge>
                )}
                {item.page === "favorites" && favoritesCount > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs rounded-full bg-rose-500 text-white hover:bg-rose-500 badge-pop">
                    {favoritesCount}
                  </Badge>
                )}
                {item.page === "notifications" && unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs rounded-full badge-pop">
                    {unreadCount}
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
                className="w-40 md:w-56 h-9 text-sm rounded-lg focus-ring"
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
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative" onClick={() => handleNavClick("notifications")}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pop">{unreadCount}</span>
            )}
          </Button>

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
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("favorites"); setProfileOpen(false); }}>
                    <Heart className="w-4 h-4" /> My Favorites
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("orders"); setProfileOpen(false); }}>
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-lg text-sm" onClick={() => { handleNavClick("profile"); setProfileOpen(false); }}>
                    <User className="w-4 h-4" /> Profile
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
            {navItems.slice(0, 16).map((item) => {
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
