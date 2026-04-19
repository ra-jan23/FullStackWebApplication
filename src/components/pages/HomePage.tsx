"use client";

import React, { useState } from "react";
import { useAppStore, type Page } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ScanSearch, Store, Ticket, Video, Sparkles, Crown, Cpu, Upload,
  CheckCircle2, Star, ArrowLeft, Play, Zap, Flame, CircleDot,
  ChevronRight, Megaphone, Users, BarChart3, Shield, Target, MessageCircle, Brain
} from "lucide-react";

export default function HomePage() {
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
              <Button size="lg" variant="outline" className="gap-2 text-base rounded-xl border-white/25 text-white hover:bg-white/15 hover:text-white h-12 px-6 backdrop-blur-sm" onClick={() => setCurrentPage("chat")}>
                <MessageCircle className="w-5 h-5" /> AI Chat
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
            { icon: <MessageCircle className="w-8 h-8" />, title: "AI Football Expert", desc: "Chat with our AI football expert about tactics, players, history, and predictions.", page: "chat" as Page, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
            { icon: <Video className="w-8 h-8" />, title: "Match Highlights", desc: "Watch AI-curated highlights from the biggest matches around the world.", page: "highlights" as Page, gradient: "from-orange-500 to-red-500", bg: "bg-orange-500/10" },
            { icon: <Store className="w-8 h-8" />, title: "Jersey Store", desc: "Shop authentic football jerseys from top clubs and national teams.", page: "store" as Page, gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10" },
            { icon: <Ticket className="w-8 h-8" />, title: "Match Tickets", desc: "Book tickets for upcoming matches and experience the atmosphere live.", page: "tickets" as Page, gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/10" },
            { icon: <Crown className="w-8 h-8" />, title: "Live Match Scores", desc: "Follow live matches with real-time scores, events, and play-by-play commentary.", page: "match-center" as Page, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
            { icon: <Brain className="w-8 h-8" />, title: "AI Match Predictions", desc: "Get AI-powered match predictions with score forecasts, tactical analysis, and key player insights.", page: "predictions" as Page, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
          ].map((feature, i) => (
            <Card
              key={i}
              className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border hover:border-primary/20 relative overflow-hidden card-hover-lift"
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
          <Button size="lg" variant="outline" className="gap-2 text-base rounded-xl h-12 px-6" onClick={() => setCurrentPage("chat")}>
            <MessageCircle className="w-5 h-5" /> Chat with AI
          </Button>
        </div>
      </section>
    </div>
  );
}
