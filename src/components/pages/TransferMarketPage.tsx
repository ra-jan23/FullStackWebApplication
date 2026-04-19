"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeftRight, TrendingUp, TrendingDown, Minus,
  ArrowRight, CheckCircle2, Sparkles, Users, Building2,
  Calendar, Globe2, Euro, Info, Activity, BarChart3,
  MessageSquare, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface TransferRumor {
  id: number;
  player: string;
  position: string;
  currentClub: string;
  currentLeague: string;
  targetClub: string;
  targetLeague: string;
  fee: number;
  feeDisplay: string;
  status: "Negotiating" | "Medical" | "Agreed" | "Rumor";
  confidence: number;
  source: string;
  date: string;
  nationality: string;
  age: number;
}

interface TopValuedPlayer {
  rank: number;
  name: string;
  position: string;
  club: string;
  marketValue: number;
  age: number;
  nationality: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  initials: string;
  gradient: string;
}

interface CompletedTransfer {
  id: number;
  player: string;
  position: string;
  fromClub: string;
  toClub: string;
  fee: number;
  feeDisplay: string;
  date: string;
  nationality: string;
  age: number;
  initials: string;
  gradient: string;
}

interface ClubActivity {
  club: string;
  league: string;
  ins: number;
  outs: number;
  spending: number;
  income: number;
  net: number;
  color: string;
}

const statusColors: Record<string, string> = {
  Negotiating: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Medical: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Agreed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Rumor: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  Negotiating: <MessageSquare className="w-3 h-3" />,
  Medical: <Activity className="w-3 h-3" />,
  Agreed: <CheckCircle2 className="w-3 h-3" />,
  Rumor: <Info className="w-3 h-3" />,
};

export default function TransferMarketPage() {
  const [data, setData] = useState<{
    rumors: TransferRumor[];
    topValued: TopValuedPlayer[];
    completed: CompletedTransfer[];
    clubActivity: ClubActivity[];
    summary: {
      totalRumors: number;
      totalCompleted: number;
      totalSpending: number;
      mostActiveClub: string;
      highestFee: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transfers")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-12 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25 animate-pulse">
            <ArrowLeftRight className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-10 bg-muted rounded-xl w-fit animate-pulse" />
      </div>
    );
  }

  const maxSpending = Math.max(...data.clubActivity.map((c) => c.spending));

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <ArrowLeftRight className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Transfer <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Market</span>
            </h1>
            <p className="text-muted-foreground mt-1">Track the latest transfer rumors, player values, and completed deals</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-fade">
        <Card className="border hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.summary.totalRumors}</p>
              <p className="text-xs text-muted-foreground">Active Rumors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.summary.totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed Deals</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Euro className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">€{data.summary.totalSpending}M</p>
              <p className="text-xs text-muted-foreground">Top 5 Club Spending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{data.summary.highestFee}</p>
              <p className="text-xs text-muted-foreground">Highest Fee</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rumors" className="w-full">
        <TabsList className="mb-6 bg-muted/80 p-1 rounded-xl">
          <TabsTrigger value="rumors" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            <MessageSquare className="w-4 h-4" /> Rumors
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </TabsTrigger>
          <TabsTrigger value="top-valued" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            <TrendingUp className="w-4 h-4" /> Top Valued
          </TabsTrigger>
          <TabsTrigger value="by-club" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
            <Building2 className="w-4 h-4" /> By Club
          </TabsTrigger>
        </TabsList>

        {/* RUMORS TAB */}
        <TabsContent value="rumors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade">
            {data.rumors.map((rumor) => (
              <Card
                key={rumor.id}
                className="group border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-hover-lift"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">{rumor.player}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{rumor.position}</p>
                    </div>
                    <Badge className={`shrink-0 gap-1 text-xs font-medium ${statusColors[rumor.status]}`}>
                      {statusIcons[rumor.status]}
                      {rumor.status}
                    </Badge>
                  </div>

                  {/* Transfer path */}
                  <div className="flex items-center gap-2 mb-4 bg-muted/50 rounded-xl px-4 py-3">
                    <div className="text-right flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rumor.currentClub}</p>
                      <p className="text-xs text-muted-foreground">{rumor.currentLeague}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rumor.targetClub}</p>
                      <p className="text-xs text-muted-foreground">{rumor.targetLeague}</p>
                    </div>
                  </div>

                  {/* Fee and details */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                      <Euro className="w-4 h-4" />
                      {rumor.feeDisplay}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" />{rumor.nationality}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{rumor.date}</span>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Confidence
                      </span>
                      <span className={`font-semibold ${rumor.confidence >= 75 ? "text-emerald-600 dark:text-emerald-400" : rumor.confidence >= 50 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                        {rumor.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={rumor.confidence}
                      className={`h-2 ${rumor.confidence >= 75 ? "[&>div]:bg-emerald-500" : rumor.confidence >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-muted-foreground/40"}`}
                    />
                  </div>

                  {/* Source */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Source: <span className="font-medium text-foreground/80">{rumor.source}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">Age {rumor.age}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TOP VALUED TAB */}
        <TabsContent value="top-valued">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade">
            {data.topValued.map((player) => (
              <Card
                key={player.rank}
                className="group border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-hover-lift relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Rank badge */}
                    <div className="relative shrink-0">
                      {player.rank <= 3 ? (
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${player.gradient} flex items-center justify-center shadow-lg text-white text-lg font-bold`}>
                          {player.initials}
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${player.gradient} flex items-center justify-center shadow-lg text-white text-lg font-bold`}>
                          {player.initials}
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{player.rank}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base leading-tight truncate">{player.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{player.position}</p>
                      <p className="text-sm font-medium text-foreground/70 mt-0.5">{player.club}</p>
                    </div>
                  </div>

                  {/* Market Value */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Market Value</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            €{player.marketValue}M
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                        player.trend === "up"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : player.trend === "down"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400"
                      }`}>
                        {player.trend === "up" ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : player.trend === "down" ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        {player.trendValue}
                      </div>
                    </div>
                  </div>

                  {/* Player details */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Age {player.age}</span>
                    <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> {player.nationality}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* COMPLETED TAB */}
        <TabsContent value="completed">
          <div className="space-y-3 stagger-fade">
            {data.completed.map((transfer) => (
              <Card
                key={transfer.id}
                className="group border hover:shadow-xl transition-all duration-300 card-hover-lift"
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center gap-4">
                    {/* Player avatar */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${transfer.gradient} flex items-center justify-center shadow-lg text-white text-lg font-bold shrink-0`}>
                      {transfer.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-base">{transfer.player}</h3>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{transfer.position} &bull; Age {transfer.age} &bull; {transfer.nationality}</p>

                      {/* Transfer path */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{transfer.fromClub}</span>
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-medium">{transfer.toClub}</span>
                        <span className="mx-1 text-muted-foreground">|</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{transfer.feeDisplay}</span>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {transfer.date}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BY CLUB TAB */}
        <TabsContent value="by-club">
          <div className="space-y-5 stagger-fade">
            {data.clubActivity.map((club, index) => (
              <Card
                key={club.club}
                className="border hover:shadow-xl transition-all duration-300 card-hover-lift"
              >
                <CardContent className="p-5">
                  {/* Club header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-sm">
                        <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-200" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{club.club}</h3>
                        <p className="text-xs text-muted-foreground">{club.league}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Net Spend</p>
                      <p className={`text-lg font-bold ${club.net >= 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {club.net >= 0 ? "+" : ""}€{club.net}M
                      </p>
                    </div>
                  </div>

                  {/* Spending bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Spending</span>
                      <span className="font-semibold">€{club.spending}M</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          index === 0 ? "from-amber-500 to-orange-500" :
                          index === 1 ? "from-rose-500 to-pink-500" :
                          index === 2 ? "from-sky-500 to-cyan-500" :
                          index === 3 ? "from-blue-500 to-indigo-500" :
                          "from-red-500 to-rose-500"
                        } transition-all duration-1000`}
                        style={{ width: `${(club.spending / maxSpending) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-muted-foreground">Ins</span>
                      </div>
                      <p className="text-xl font-bold">{club.ins}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-muted-foreground">Outs</span>
                      </div>
                      <p className="text-xl font-bold">{club.outs}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Euro className="w-4 h-4 text-teal-500" />
                        <span className="text-xs text-muted-foreground">Income</span>
                      </div>
                      <p className="text-xl font-bold">€{club.income}M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Club comparison summary */}
          <Card className="border mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5 text-primary" />
                Transfer Window Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    €{Math.max(...data.clubActivity.map(c => c.spending))}M
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Highest Spender</p>
                  <p className="text-sm font-medium mt-0.5">{data.clubActivity.reduce((a, b) => a.spending > b.spending ? a : b).club}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    €{Math.abs(Math.min(...data.clubActivity.map(c => c.net)))}M
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Biggest Net Profit</p>
                  <p className="text-sm font-medium mt-0.5">{data.clubActivity.reduce((a, b) => a.net < b.net ? a : b).club}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {data.clubActivity.reduce((acc, c) => acc + c.ins, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Incomings</p>
                  <p className="text-sm font-medium mt-0.5">Across Top 5</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {data.clubActivity.reduce((acc, c) => acc + c.outs, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Outgoings</p>
                  <p className="text-sm font-medium mt-0.5">Across Top 5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
