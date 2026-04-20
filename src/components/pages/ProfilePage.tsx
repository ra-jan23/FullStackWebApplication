"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Mail, Calendar, ShoppingBag, Ticket, ScanSearch, Heart,
  Save, Loader2, Trash2, Shield, Trophy, CheckCircle2, Link2, LucideIcon,
} from "lucide-react";
import AvatarSelector from "@/components/ui/AvatarSelector";
import { getAvatarOption } from "@/lib/avatars";

const TOP_TEAMS = [
  "Liverpool FC", "Real Madrid", "Arsenal FC", "Bayern Munich", "FC Barcelona",
  "Manchester City", "Chelsea FC", "AC Milan", "Juventus", "PSG",
  "Inter Milan", "Borussia Dortmund", "Tottenham Hotspur", "Newcastle United",
  "Aston Villa", "Atletico Madrid", "Napoli", "AS Roma", "Benfica", "Ajax",
];

export default function ProfilePage() {
  const { user, token, login, logout, setCurrentPage, userAvatar, setUserAvatar } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<string>(userAvatar || "trophy");
  const [favoriteTeam, setFavoriteTeam] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tickets: 0, analyses: 0, cart: 0, favorites: 0 });
  const [profileData, setProfileData] = useState<{ avatar?: string | null; favoriteTeam?: string | null }>({});

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [token]);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfileData({ avatar: data.user.avatar, favoriteTeam: data.user.favoriteTeam });
          if (data.user.avatar) setAvatar(data.user.avatar);
          if (data.user.favoriteTeam) setFavoriteTeam(data.user.favoriteTeam);
          setName(data.user.name || user?.name || "");
        }
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [ticketsRes, analysesRes, cartRes, favRes] = await Promise.all([
        fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [ticketsData, analysesData, cartData, favData] = await Promise.all([
        ticketsRes.json(), analysesRes.json(), cartRes.json(), favRes.json(),
      ]);
      setStats({
        tickets: ticketsData.tickets?.length || 0,
        analyses: analysesData.analyses?.length || 0,
        cart: cartData.cartItems?.length || 0,
        favorites: favData.favorites?.length || 0,
      });
    } catch {
      // silent fail
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, avatar, favoriteTeam }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && user) {
          login(
            { ...user, name: data.user.name },
            token || ""
          );
        }
        toast.success("Profile updated!", { description: "Your changes have been saved successfully." });
      } else {
        const data = await res.json();
        toast.error("Update failed", { description: data.error });
      }
    } catch {
      toast.error("Network error", { description: "Failed to save profile changes." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Simulate account deletion (in production this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Account deleted", { description: "Your account has been permanently deleted." });
      logout();
      setCurrentPage("home");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const selectedAvatar = getAvatarOption(avatar);
  const SelectedIcon: LucideIcon | null = selectedAvatar ? selectedAvatar.icon : null;
  const userInitials = (name || user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const joinDate = user ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" /> Account Information
          </CardTitle>
          <CardDescription>Your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg">
                <AvatarFallback className={`bg-gradient-to-br ${selectedAvatar ? `${selectedAvatar.from} ${selectedAvatar.to}` : "from-primary to-emerald-500"} text-white text-2xl`}>
                  {SelectedIcon ? <SelectedIcon className="w-9 h-9" strokeWidth={2} /> : userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">Avatar Preview</span>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {/* Avatar Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Choose Your Avatar
                </Label>
                <AvatarSelector
                  selectedId={avatar}
                  onSelect={(id) => {
                    setAvatar(id);
                    setUserAvatar(id);
                  }}
                  size="sm"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Display Name
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-11 max-w-sm"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <div className="flex items-center gap-2 h-11 px-3 rounded-lg border bg-muted/50 max-w-sm">
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">Read-only</Badge>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Member since {joinDate}
              </div>
            </div>
          </div>

          <Separator />

          {/* Favorite Team */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Favorite Team
            </Label>
            <Select value={favoriteTeam} onValueChange={setFavoriteTeam}>
              <SelectTrigger className="max-w-sm h-11">
                <SelectValue placeholder="Select your favorite team..." />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                {TOP_TEAMS.map((team) => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 rounded-xl shadow-md shadow-primary/20 min-w-32"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" /> Account Stats
          </CardTitle>
          <CardDescription>Your activity summary on PitchVision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Ticket className="w-5 h-5" />, label: "Tickets", value: stats.tickets, color: "text-primary", bg: "bg-primary/10" },
              { icon: <ScanSearch className="w-5 h-5" />, label: "Analyses", value: stats.analyses, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: <ShoppingBag className="w-5 h-5" />, label: "Cart Items", value: stats.cart, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
              { icon: <Heart className="w-5 h-5" />, label: "Favorites", value: stats.favorites, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5" /> Connected Accounts
          </CardTitle>
          <CardDescription>Link your social accounts for a better experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Google", provider: "google", icon: "G", color: "bg-red-500", connected: false },
            { name: "GitHub", provider: "github", icon: "GH", color: "bg-gray-800 dark:bg-gray-200 dark:text-gray-800", connected: false },
          ].map((account) => (
            <div key={account.provider} className="flex items-center justify-between p-3 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${account.color} text-white flex items-center justify-center text-sm font-bold`}>
                  {account.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              {account.connected ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Connected
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.info("Coming soon!", { description: `${account.name} integration will be available soon.` })}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that permanently affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-lg gap-2 whitespace-nowrap">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all of your data from our servers, including tickets, cart items,
                    analyses, and favorites.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="rounded-lg gap-2"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleting ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
