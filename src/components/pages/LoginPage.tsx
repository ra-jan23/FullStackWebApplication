"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  LogIn, Loader2, Globe, Layers, Fingerprint
} from "lucide-react";

export default function LoginPage() {
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
