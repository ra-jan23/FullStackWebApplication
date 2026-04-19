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
  UserPlus, Loader2, Globe, Layers
} from "lucide-react";

export default function RegisterPage() {
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
