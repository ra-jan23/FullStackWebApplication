"use client";

import React from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Target, Globe, Cpu, Smartphone, Shield, Database,
  Award, Share2, Camera, Play
} from "lucide-react";

export default function Footer() {
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
