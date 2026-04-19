"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Target, ArrowUp } from "lucide-react";

import Navbar from "@/components/pages/Navbar";
import HomePage from "@/components/pages/HomePage";
import LoginPage from "@/components/pages/LoginPage";
import RegisterPage from "@/components/pages/RegisterPage";
import MatchCenterPage from "@/components/pages/MatchCenterPage";
import DashboardPage from "@/components/pages/DashboardPage";
import StorePage from "@/components/pages/StorePage";
import CartPage from "@/components/pages/CartPage";
import HighlightsPage from "@/components/pages/HighlightsPage";
import TicketsPage from "@/components/pages/TicketsPage";
import AnalyzePage from "@/components/pages/AnalyzePage";
import ProfilePage from "@/components/pages/ProfilePage";
import FavoritesPage from "@/components/pages/FavoritesPage";
import ChatPage from "@/components/pages/ChatPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import Footer from "@/components/pages/Footer";

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
      case "profile": return requireAuth(<ProfilePage />);
      case "favorites": return requireAuth(<FavoritesPage />);
      case "chat": return <ChatPage />;
      case "checkout": return requireAuth(<CheckoutPage />);
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
