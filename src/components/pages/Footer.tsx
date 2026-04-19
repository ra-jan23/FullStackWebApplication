"use client";

import React from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Target, Globe, Cpu, Smartphone, Shield, Database,
  Award, Share2, Camera, Play, Brain, MessageCircle,
  Heart, ArrowUp
} from "lucide-react";

export default function Footer() {
  const { setCurrentPage } = useAppStore();
  return (
    <footer className="border-t bg-muted/30 mt-auto relative overflow-hidden">
      {/* Top gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 py-12 relative">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-emerald-500/3 rounded-full blur-3xl translate-y-1/2" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md shadow-primary/20">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Pitch<span className="text-primary">Vision</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AI-powered football analysis platform. Detect formations, watch highlights, and experience the beautiful game like never before.
            </p>
            {/* Social Buttons */}
            <div className="flex items-center gap-2">
              {[
                { icon: <Share2 className="w-4 h-4" />, label: "X/Twitter" },
                { icon: <Camera className="w-4 h-4" />, label: "Instagram" },
                { icon: <Play className="w-4 h-4" />, label: "YouTube" },
              ].map((social, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => toast.info(`Follow us on ${social.label}!`)}
                >
                  {social.icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Platform</h4>
            <div className="space-y-2.5">
              {[
                { label: "AI Analysis", page: "analyze" as Page },
                { label: "Match Center", page: "match-center" as Page },
                { label: "Predictions", page: "predictions" as Page },
                { label: "Highlights", page: "highlights" as Page },
                { label: "Jersey Store", page: "store" as Page },
                { label: "Match Tickets", page: "tickets" as Page },
                { label: "Football News", page: "news" as Page },
                { label: "Transfer Market", page: "transfers" as Page },
              ].map((item) => (
                <button key={item.page} className="block text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-0.5 transform">
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">AI Features</h4>
            <div className="space-y-2.5">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setCurrentPage("analyze")}>
                <Cpu className="w-3.5 h-3.5" /> Formation Detection
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setCurrentPage("chat")}>
                <MessageCircle className="w-3.5 h-3.5" /> AI Chat Expert
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setCurrentPage("predictions")}>
                <Brain className="w-3.5 h-3.5" /> Match Predictions
              </button>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Technologies</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Next.js 16 & React 19</p>
              <p className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> AI Vision Model (VLM)</p>
              <p className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Responsive Design</p>
              <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> JWT Authentication</p>
              <p className="flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Prisma ORM</p>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">About</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              <p>PitchVision is a comprehensive football platform demonstrating modern web development with AI integration.</p>
              <p className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary" /> HiveMind Project 2025</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; 2025 PitchVision. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for football fans everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
