"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Trophy, Play, Eye, Calendar, Ticket, Flame,
  CheckCircle2, Star, Medal, Radio, Wifi, WifiOff, RotateCcw,
  CircleDot, Crosshair, AlertTriangle, Flag, Square
} from "lucide-react";

// ==================== LIVE MATCH HOOK ====================
interface MatchState {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  isLive: boolean;
}

interface MatchEvent {
  id: string;
  matchId: string;
  type: string;
  minute: number;
  team: string;
  player: string;
  description: string;
  createdAt: string;
}

function useLiveMatch() {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const socket = io("/?XTransformPort=3004", {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          if (mounted) setConnected(true);
        });

        socket.on("disconnect", () => {
          if (mounted) setConnected(false);
        });

        socket.on("match-state", (state: any) => {
          if (mounted) {
            setMatchState({
              homeTeam: state.homeTeam,
              awayTeam: state.awayTeam,
              homeScore: state.homeScore,
              awayScore: state.awayScore,
              minute: state.minute,
              isLive: state.isLive,
            });
          }
        });

        socket.on("match-event", (event: MatchEvent) => {
          if (mounted) {
            setEvents((prev) => {
              if (prev.find(e => e.id === event.id)) return prev;
              return [event, ...prev].slice(0, 50);
            });
          }
        });

        socket.on("match-events-history", (history: MatchEvent[]) => {
          if (mounted && history.length > 0) {
            setEvents(history.slice().reverse().slice(0, 50));
          }
        });

        socket.on("connect_error", () => {
          if (mounted) setConnected(false);
        });
      } catch {
        console.error("Failed to load socket.io-client");
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startMatch = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("start-match");
      setEvents([]);
    }
  }, []);

  const restartMatch = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("restart");
      setEvents([]);
    }
  }, []);

  return { matchState, events, connected, startMatch, restartMatch };
}

function getEventIcon(type: string) {
  switch (type) {
    case "goal": return <CircleDot className="w-4 h-4 text-primary" />;
    case "shot": return <Crosshair className="w-4 h-4 text-sky-500" />;
    case "foul": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case "corner": return <Flag className="w-4 h-4 text-muted-foreground" />;
    case "yellow_card": return <div className="w-3.5 h-5 bg-yellow-400 rounded-sm" />;
    case "red_card": return <div className="w-3.5 h-5 bg-red-500 rounded-sm" />;
    case "possession": return <Radio className="w-4 h-4 text-muted-foreground" />;
    default: return <CircleDot className="w-4 h-4" />;
  }
}

function getEventBg(type: string) {
  switch (type) {
    case "goal": return "bg-primary/5 border-primary/20";
    case "yellow_card": return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900";
    case "red_card": return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
    default: return "bg-muted/30 border-transparent";
  }
}

// ==================== MAIN COMPONENT ====================
export default function MatchCenterPage() {
  const { setCurrentPage, user } = useAppStore();
  const [activeLeague, setActiveLeague] = useState("all");
  const { matchState, events, connected, startMatch, restartMatch } = useLiveMatch();

  const matches = [
    { id: 1, home: "Liverpool FC", away: "Manchester City", homeScore: 3, awayScore: 2, status: "FT", date: "Mar 15", competition: "Premier League", venue: "Anfield" },
    { id: 2, home: "Real Madrid", away: "Barcelona", homeScore: 2, awayScore: 2, status: "FT", date: "Mar 10", competition: "La Liga", venue: "Bernabeu" },
    { id: 3, home: "AC Milan", away: "Juventus", homeScore: matchState?.homeScore ?? 1, awayScore: matchState?.awayScore ?? 0, status: matchState?.isLive ? `${matchState.minute}'` : "78'", date: "Today", competition: "Serie A", venue: "San Siro", live: matchState?.isLive ?? false },
    { id: 4, home: "Chelsea FC", away: "Arsenal FC", homeScore: null, awayScore: null, status: "20:45", date: "Tomorrow", competition: "Premier League", venue: "Stamford Bridge" },
    { id: 5, home: "Bayern Munich", away: "Dortmund", homeScore: null, awayScore: null, status: "17:30", date: "Sat, Apr 5", competition: "Bundesliga", venue: "Allianz Arena" },
    { id: 6, home: "PSG", away: "Marseille", homeScore: null, awayScore: null, status: "21:00", date: "Sun, Apr 6", competition: "Ligue 1", venue: "Parc des Princes" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Center</h1>
        <p className="text-muted-foreground">Live scores, results, and upcoming fixtures</p>
      </div>

      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "all", label: "All Leagues", icon: <Globe className="w-3.5 h-3.5" /> },
          { key: "Premier League", label: "Premier League", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "La Liga", label: "La Liga", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "Serie A", label: "Serie A", icon: <Trophy className="w-3.5 h-3.5" /> },
          { key: "Bundesliga", label: "Bundesliga", icon: <Trophy className="w-3.5 h-3.5" /> },
        ].map(league => (
          <Button key={league.key} variant={activeLeague === league.key ? "default" : "outline"} size="sm" className="gap-1.5 rounded-lg text-xs" onClick={() => setActiveLeague(league.key)}>
            {league.icon} {league.label}
          </Button>
        ))}
      </div>

      {/* ===== LIVE MATCH SIMULATION ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" /> Live Match Simulation
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={connected ? "default" : "secondary"} className="gap-1 text-xs">
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-primary/[0.02] to-background">
          <CardContent className="p-0">
            {/* Score Header */}
            <div className="relative bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-emerald-900/90 p-6 text-white">
              <div className="absolute inset-0 opacity-5" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)" }} />
              <div className="relative">
                <div className="text-center mb-3">
                  <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs">
                    Serie A • San Siro, Milan
                  </Badge>
                </div>
                <div className="flex items-center justify-center gap-6 md:gap-10">
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-red-900/50 border border-red-700/30 flex items-center justify-center mx-auto mb-2 text-lg font-bold shadow-lg">
                      ACM
                    </div>
                    <p className="font-bold text-sm md:text-base">{matchState?.homeTeam || "AC Milan"}</p>
                  </div>
                  <div className="text-center">
                    {matchState?.isLive ? (
                      <div className="flex items-center gap-2 mb-1 justify-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-medium text-red-300">{matchState.minute}&apos;</span>
                      </div>
                    ) : matchState ? (
                      <div className="mb-1">
                        <span className="text-xs font-medium text-white/60">FT</span>
                      </div>
                    ) : (
                      <div className="mb-1">
                        <span className="text-xs font-medium text-white/60">78&apos;</span>
                      </div>
                    )}
                    <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                      {matchState?.homeScore ?? 1} <span className="text-white/40 mx-1">-</span> {matchState?.awayScore ?? 0}
                    </div>
                    {matchState?.isLive && (
                      <Progress value={(matchState.minute / 90) * 100} className="w-24 mx-auto mt-2 h-1" />
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-lg font-bold shadow-lg">
                      JUV
                    </div>
                    <p className="font-bold text-sm md:text-base">{matchState?.awayTeam || "Juventus"}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  {!matchState?.isLive && (
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm shadow-sm"
                      onClick={startMatch}
                      disabled={!connected}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {matchState ? "Restart Match" : "Start Live Match"}
                    </Button>
                  )}
                  {(matchState?.isLive || events.length > 0) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                      onClick={restartMatch}
                      disabled={!connected}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restart
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Feed */}
            {events.length > 0 && (
              <div className="p-4 max-h-80 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Square className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-semibold">Live Events</span>
                  <span className="text-xs text-muted-foreground">({events.length})</span>
                </div>
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all animate-fade-in ${getEventBg(event.type)}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono">{event.minute}&apos;</Badge>
                          <span className="text-xs font-medium text-muted-foreground">{event.team}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{event.description}</p>
                        {event.player && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.player}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Now (other matches) */}
      {matches.filter(m => m.live && m.id !== 3).length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold text-red-500">LIVE NOW</h2>
          </div>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
            <CardContent className="p-0">
              {matches.filter(m => m.live && m.id !== 3).map(match => (
                <div key={match.id} className="flex items-center justify-between p-5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-center">
                      <Badge variant="outline" className="border-red-300 text-red-500 text-xs">{match.status}</Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{match.home}</span>
                        <span className="text-xl font-bold mx-3">{match.homeScore} - {match.awayScore}</span>
                        <span className="font-semibold">{match.away}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{match.competition}</span>
                        <span>{match.venue}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4 text-red-500" onClick={() => setCurrentPage("highlights")}>
                    <Play className="w-4 h-4 mr-1" /> Watch
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Recent Results</h2>
      <div className="space-y-3 mb-8">
        {matches.filter(m => m.status === "FT").map(match => (
          <Card key={match.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                <span className="text-xs text-muted-foreground">{match.date}</span>
                <span className="text-xs text-muted-foreground">{match.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-sm">{match.home}</span>
                  <div className="text-center min-w-16">
                    <span className="text-xl font-bold">{match.homeScore} - {match.awayScore}</span>
                    <div className="text-xs text-muted-foreground">FT</div>
                  </div>
                  <span className="font-semibold text-sm">{match.away}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage("highlights")}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Fixtures</h2>
      <div className="space-y-3">
        {matches.filter(m => m.status !== "FT" && !m.live).map(match => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                <span className="text-xs text-muted-foreground">{match.date}</span>
                <span className="text-xs text-muted-foreground">{match.venue}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-semibold text-sm">{match.home}</span>
                  <div className="text-center min-w-16">
                    <span className="text-sm font-bold text-primary">{match.status}</span>
                    <div className="text-xs text-muted-foreground">KO</div>
                  </div>
                  <span className="font-semibold text-sm">{match.away}</span>
                </div>
                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => user ? setCurrentPage("tickets") : setCurrentPage("login")}>
                  <Ticket className="w-3.5 h-3.5" /> Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Scorers */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Top Scorers</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">Rank</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Player</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Team</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-16">Goals</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-16">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: "Erling Haaland", team: "Manchester City", goals: 24, assists: 5 },
                    { rank: 2, name: "Mohamed Salah", team: "Liverpool FC", goals: 21, assists: 13 },
                    { rank: 3, name: "Alexander Isak", team: "Newcastle United", goals: 18, assists: 4 },
                    { rank: 4, name: "Cole Palmer", team: "Chelsea FC", goals: 16, assists: 8 },
                    { rank: 5, name: "Bukayo Saka", team: "Arsenal FC", goals: 14, assists: 10 },
                    { rank: 6, name: "Bruno Fernandes", team: "Manchester United", goals: 12, assists: 11 },
                    { rank: 7, name: "Son Heung-min", team: "Tottenham Hotspur", goals: 11, assists: 5 },
                    { rank: 8, name: "Ollie Watkins", team: "Aston Villa", goals: 10, assists: 7 },
                  ].map((player) => (
                    <tr key={player.rank} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${player.rank <= 3 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" : "bg-muted text-muted-foreground"}`}>{player.rank}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{player.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{player.team}</td>
                      <td className="px-4 py-3 text-center font-bold text-primary">{player.goals}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{player.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* League Standings */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Premier League Standings</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">#</th>
                    <th className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">Team</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">P</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">W</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">D</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">L</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-12">GD</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-14 font-bold">Pts</th>
                    <th className="text-center font-semibold px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground w-28">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pos: 1, team: "Liverpool FC", p: 29, w: 21, d: 5, l: 3, gd: 42, pts: 68, form: ["W", "W", "D", "W", "W"] },
                    { pos: 2, team: "Arsenal FC", p: 29, w: 19, d: 7, l: 3, gd: 38, pts: 64, form: ["W", "D", "W", "W", "L"] },
                    { pos: 3, team: "Manchester City", p: 29, w: 18, d: 5, l: 6, gd: 35, pts: 59, form: ["L", "W", "W", "D", "W"] },
                    { pos: 4, team: "Chelsea FC", p: 29, w: 16, d: 6, l: 7, gd: 22, pts: 54, form: ["W", "W", "L", "W", "D"] },
                    { pos: 5, team: "Newcastle United", p: 29, w: 15, d: 7, l: 7, gd: 20, pts: 52, form: ["D", "W", "W", "L", "W"] },
                    { pos: 6, team: "Aston Villa", p: 29, w: 14, d: 5, l: 10, gd: 10, pts: 47, form: ["L", "L", "W", "D", "W"] },
                  ].map((team) => (
                    <tr key={team.pos} className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors ${team.pos <= 4 ? "bg-primary/[0.02]" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${team.pos <= 4 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{team.pos}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{team.team}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.p}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.w}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.d}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{team.l}</td>
                      <td className={`px-4 py-3 text-center font-medium ${team.gd > 0 ? "text-primary" : team.gd < 0 ? "text-destructive" : "text-muted-foreground"}`}>{team.gd > 0 ? "+" : ""}{team.gd}</td>
                      <td className="px-4 py-3 text-center font-bold">{team.pts}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {team.form.map((f, fi) => (
                            <div key={fi} className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white ${f === "W" ? "bg-primary" : f === "D" ? "bg-amber-500" : "bg-destructive"}`}>{f}</div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Rankings */}
      <div className="mt-10 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-amber-500" /> Player Rankings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Mohamed Salah", team: "Liverpool FC", position: "RW", goals: 21, assists: 13, rating: 8.7, initials: "MS", color: "from-red-500 to-red-600" },
            { name: "Erling Haaland", team: "Manchester City", position: "ST", goals: 24, assists: 5, rating: 8.5, initials: "EH", color: "from-sky-500 to-sky-600" },
            { name: "Martin Odegaard", team: "Arsenal FC", position: "CM", goals: 8, assists: 11, rating: 8.3, initials: "MO", color: "from-red-600 to-red-700" },
            { name: "Cole Palmer", team: "Chelsea FC", position: "AM", goals: 16, assists: 8, rating: 8.2, initials: "CP", color: "from-blue-500 to-blue-700" },
            { name: "Bruno Fernandes", team: "Manchester United", position: "CAM", goals: 12, assists: 11, rating: 7.9, initials: "BF", color: "from-red-600 to-red-800" },
            { name: "Bukayo Saka", team: "Arsenal FC", position: "RW", goals: 14, assists: 10, rating: 8.1, initials: "BS", color: "from-red-600 to-red-700" },
          ].map((player, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform`}>
                    {player.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{player.name}</h3>
                    <p className="text-xs text-muted-foreground">{player.team}</p>
                  </div>
                  <Badge variant="outline" className="text-xs rounded-lg">{player.position}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary">{player.goals}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Goals</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-primary">{player.assists}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Assists</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-amber-500">{player.rating}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-0.5"><Star className="w-2.5 h-2.5" /> Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
