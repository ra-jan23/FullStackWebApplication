"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Globe, Trophy, Play, Eye, Calendar, Ticket, Flame,
  CheckCircle2, Star, Medal, Radio, Wifi, WifiOff, RotateCcw,
  CircleDot, Crosshair, AlertTriangle, Flag, Square, Swords,
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, History,
  BarChart3
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

// ==================== H2H DATA ====================
interface TeamStats {
  abbr: string;
  pos: number;
  pts: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  cs: number;
  form: string[];
  topScorer: string;
  topGoals: number;
  color: string;
  textColor?: string;
}

const teamData: Record<string, TeamStats> = {
  "Liverpool FC": { abbr: "LIV", pos: 1, pts: 68, w: 21, d: 5, l: 3, gf: 62, ga: 20, cs: 12, form: ["W","W","D","W","W"], topScorer: "Salah", topGoals: 21, color: "from-red-600 to-red-700", textColor: "text-red-600" },
  "Arsenal FC": { abbr: "ARS", pos: 2, pts: 64, w: 19, d: 7, l: 3, gf: 56, ga: 18, cs: 14, form: ["W","D","W","W","L"], topScorer: "Saka", topGoals: 14, color: "from-red-600 to-red-800", textColor: "text-red-700" },
  "Manchester City": { abbr: "MCI", pos: 3, pts: 59, w: 18, d: 5, l: 6, gf: 55, ga: 20, cs: 10, form: ["L","W","W","D","W"], topScorer: "Haaland", topGoals: 24, color: "from-sky-400 to-sky-600", textColor: "text-sky-600" },
  "Chelsea FC": { abbr: "CHE", pos: 4, pts: 54, w: 16, d: 6, l: 7, gf: 50, ga: 28, cs: 8, form: ["W","W","L","W","D"], topScorer: "Palmer", topGoals: 16, color: "from-blue-500 to-blue-700", textColor: "text-blue-600" },
  "Newcastle United": { abbr: "NEW", pos: 5, pts: 52, w: 15, d: 7, l: 7, gf: 46, ga: 26, cs: 9, form: ["D","W","W","L","W"], topScorer: "Isak", topGoals: 18, color: "from-black to-gray-800", textColor: "text-gray-800" },
  "Aston Villa": { abbr: "AVL", pos: 6, pts: 47, w: 14, d: 5, l: 10, gf: 40, ga: 30, cs: 7, form: ["L","L","W","D","W"], topScorer: "Watkins", topGoals: 10, color: "from-purple-700 to-purple-900", textColor: "text-purple-700" },
  "Manchester United": { abbr: "MUN", pos: 8, pts: 42, w: 12, d: 6, l: 11, gf: 36, ga: 34, cs: 5, form: ["L","D","W","L","W"], topScorer: "Fernandes", topGoals: 12, color: "from-red-600 to-red-800", textColor: "text-red-700" },
  "Tottenham Hotspur": { abbr: "TOT", pos: 7, pts: 45, w: 13, d: 6, l: 10, gf: 48, ga: 35, cs: 6, form: ["W","L","D","W","L"], topScorer: "Son", topGoals: 11, color: "from-blue-800 to-indigo-900", textColor: "text-indigo-700" },
  "Brighton FC": { abbr: "BRI", pos: 9, pts: 39, w: 11, d: 6, l: 12, gf: 42, ga: 38, cs: 5, form: ["D","L","W","W","L"], topScorer: "Mitoma", topGoals: 8, color: "from-blue-500 to-teal-600", textColor: "text-teal-600" },
  "West Ham United": { abbr: "WHU", pos: 10, pts: 37, w: 10, d: 7, l: 12, gf: 36, ga: 42, cs: 4, form: ["L","D","L","W","D"], topScorer: "Bowen", topGoals: 9, color: "from-purple-800 to-purple-950", textColor: "text-purple-800" },
  "Bournemouth FC": { abbr: "BOU", pos: 11, pts: 35, w: 9, d: 8, l: 12, gf: 34, ga: 40, cs: 4, form: ["W","L","D","D","L"], topScorer: "Kluivert", topGoals: 9, color: "from-red-600 to-red-800", textColor: "text-red-600" },
  "Fulham FC": { abbr: "FUL", pos: 12, pts: 34, w: 9, d: 7, l: 13, gf: 38, ga: 44, cs: 4, form: ["D","W","L","L","W"], topScorer: "Jimenez", topGoals: 7, color: "from-black to-white", textColor: "text-gray-700" },
  "Wolverhampton": { abbr: "WOL", pos: 14, pts: 28, w: 7, d: 7, l: 15, gf: 32, ga: 48, cs: 3, form: ["L","L","D","W","L"], topScorer: "Cunha", topGoals: 8, color: "from-amber-500 to-amber-700", textColor: "text-amber-700" },
  "Crystal Palace": { abbr: "CRY", pos: 13, pts: 31, w: 8, d: 7, l: 14, gf: 30, ga: 40, cs: 4, form: ["L","D","L","W","D"], topScorer: "Eze", topGoals: 6, color: "from-red-600 to-blue-800", textColor: "text-blue-800" },
};

const teamNames = Object.keys(teamData);

interface H2HMatch {
  date: string;
  comp: string;
  home: string;
  score: string;
  away: string;
}

const h2hHistory: Record<string, H2HMatch[]> = {
  "Liverpool FC vs Arsenal FC": [
    { date: "Dec 2024", comp: "Premier League", home: "Liverpool FC", score: "2-1", away: "Arsenal FC" },
    { date: "Oct 2024", comp: "Premier League", home: "Arsenal FC", score: "2-2", away: "Liverpool FC" },
    { date: "Apr 2024", comp: "Premier League", home: "Liverpool FC", score: "1-2", away: "Arsenal FC" },
    { date: "Feb 2024", comp: "FA Cup", home: "Liverpool FC", score: "0-2", away: "Arsenal FC" },
    { date: "Dec 2023", comp: "Premier League", home: "Arsenal FC", score: "1-1", away: "Liverpool FC" },
  ],
  "Arsenal FC vs Liverpool FC": [
    { date: "Dec 2024", comp: "Premier League", home: "Liverpool FC", score: "2-1", away: "Arsenal FC" },
    { date: "Oct 2024", comp: "Premier League", home: "Arsenal FC", score: "2-2", away: "Liverpool FC" },
    { date: "Apr 2024", comp: "Premier League", home: "Liverpool FC", score: "1-2", away: "Arsenal FC" },
    { date: "Feb 2024", comp: "FA Cup", home: "Liverpool FC", score: "0-2", away: "Arsenal FC" },
    { date: "Dec 2023", comp: "Premier League", home: "Arsenal FC", score: "1-1", away: "Liverpool FC" },
  ],
  "Liverpool FC vs Manchester City": [
    { date: "Dec 2024", comp: "Premier League", home: "Liverpool FC", score: "2-0", away: "Manchester City" },
    { date: "Nov 2024", comp: "League Cup", home: "Liverpool FC", score: "3-2", away: "Manchester City" },
    { date: "Mar 2024", comp: "Premier League", home: "Manchester City", score: "1-1", away: "Liverpool FC" },
    { date: "Jan 2024", comp: "FA Cup", home: "Manchester City", score: "0-2", away: "Liverpool FC" },
    { date: "Nov 2023", comp: "Premier League", home: "Liverpool FC", score: "1-1", away: "Manchester City" },
  ],
  "Manchester City vs Liverpool FC": [
    { date: "Dec 2024", comp: "Premier League", home: "Liverpool FC", score: "2-0", away: "Manchester City" },
    { date: "Nov 2024", comp: "League Cup", home: "Liverpool FC", score: "3-2", away: "Manchester City" },
    { date: "Mar 2024", comp: "Premier League", home: "Manchester City", score: "1-1", away: "Liverpool FC" },
    { date: "Jan 2024", comp: "FA Cup", home: "Manchester City", score: "0-2", away: "Liverpool FC" },
    { date: "Nov 2023", comp: "Premier League", home: "Liverpool FC", score: "1-1", away: "Manchester City" },
  ],
  "Arsenal FC vs Chelsea FC": [
    { date: "Nov 2024", comp: "Premier League", home: "Chelsea FC", score: "1-1", away: "Arsenal FC" },
    { date: "Apr 2024", comp: "Premier League", home: "Arsenal FC", score: "3-0", away: "Chelsea FC" },
    { date: "Oct 2023", comp: "Premier League", home: "Chelsea FC", score: "2-2", away: "Arsenal FC" },
    { date: "May 2023", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Chelsea FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Chelsea FC", score: "0-1", away: "Arsenal FC" },
  ],
  "Chelsea FC vs Arsenal FC": [
    { date: "Nov 2024", comp: "Premier League", home: "Chelsea FC", score: "1-1", away: "Arsenal FC" },
    { date: "Apr 2024", comp: "Premier League", home: "Arsenal FC", score: "3-0", away: "Chelsea FC" },
    { date: "Oct 2023", comp: "Premier League", home: "Chelsea FC", score: "2-2", away: "Arsenal FC" },
    { date: "May 2023", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Chelsea FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Chelsea FC", score: "0-1", away: "Arsenal FC" },
  ],
  "Manchester City vs Arsenal FC": [
    { date: "Sep 2024", comp: "Premier League", home: "Arsenal FC", score: "2-2", away: "Manchester City" },
    { date: "Mar 2024", comp: "Premier League", home: "Manchester City", score: "0-0", away: "Arsenal FC" },
    { date: "Oct 2023", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Manchester City" },
    { date: "Apr 2023", comp: "Premier League", home: "Manchester City", score: "4-1", away: "Arsenal FC" },
    { date: "Feb 2023", comp: "Premier League", home: "Arsenal FC", score: "1-1", away: "Manchester City" },
  ],
  "Arsenal FC vs Manchester City": [
    { date: "Sep 2024", comp: "Premier League", home: "Arsenal FC", score: "2-2", away: "Manchester City" },
    { date: "Mar 2024", comp: "Premier League", home: "Manchester City", score: "0-0", away: "Arsenal FC" },
    { date: "Oct 2023", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Manchester City" },
    { date: "Apr 2023", comp: "Premier League", home: "Manchester City", score: "4-1", away: "Arsenal FC" },
    { date: "Feb 2023", comp: "Premier League", home: "Arsenal FC", score: "1-1", away: "Manchester City" },
  ],
  "Manchester City vs Chelsea FC": [
    { date: "Jan 2025", comp: "Premier League", home: "Manchester City", score: "3-1", away: "Chelsea FC" },
    { date: "Aug 2024", comp: "Premier League", home: "Chelsea FC", score: "0-2", away: "Manchester City" },
    { date: "Feb 2024", comp: "Premier League", home: "Manchester City", score: "1-1", away: "Chelsea FC" },
    { date: "Jan 2024", comp: "FA Cup", home: "Manchester City", score: "1-0", away: "Chelsea FC" },
    { date: "May 2023", comp: "Premier League", home: "Manchester City", score: "1-0", away: "Chelsea FC" },
  ],
  "Chelsea FC vs Manchester City": [
    { date: "Jan 2025", comp: "Premier League", home: "Manchester City", score: "3-1", away: "Chelsea FC" },
    { date: "Aug 2024", comp: "Premier League", home: "Chelsea FC", score: "0-2", away: "Manchester City" },
    { date: "Feb 2024", comp: "Premier League", home: "Manchester City", score: "1-1", away: "Chelsea FC" },
    { date: "Jan 2024", comp: "FA Cup", home: "Manchester City", score: "1-0", away: "Chelsea FC" },
    { date: "May 2023", comp: "Premier League", home: "Manchester City", score: "1-0", away: "Chelsea FC" },
  ],
  "Liverpool FC vs Chelsea FC": [
    { date: "Oct 2024", comp: "Premier League", home: "Liverpool FC", score: "2-1", away: "Chelsea FC" },
    { date: "Feb 2024", comp: "League Cup Final", home: "Liverpool FC", score: "1-0", away: "Chelsea FC" },
    { date: "Jan 2024", comp: "Premier League", home: "Chelsea FC", score: "1-4", away: "Liverpool FC" },
    { date: "Apr 2023", comp: "Premier League", home: "Chelsea FC", score: "0-2", away: "Liverpool FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Liverpool FC", score: "0-0", away: "Chelsea FC" },
  ],
  "Chelsea FC vs Liverpool FC": [
    { date: "Oct 2024", comp: "Premier League", home: "Liverpool FC", score: "2-1", away: "Chelsea FC" },
    { date: "Feb 2024", comp: "League Cup Final", home: "Liverpool FC", score: "1-0", away: "Chelsea FC" },
    { date: "Jan 2024", comp: "Premier League", home: "Chelsea FC", score: "1-4", away: "Liverpool FC" },
    { date: "Apr 2023", comp: "Premier League", home: "Chelsea FC", score: "0-2", away: "Liverpool FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Liverpool FC", score: "0-0", away: "Chelsea FC" },
  ],
  "Manchester United vs Arsenal FC": [
    { date: "Nov 2024", comp: "Premier League", home: "Manchester United", score: "1-1", away: "Arsenal FC" },
    { date: "May 2024", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Manchester United" },
    { date: "Sep 2023", comp: "Premier League", home: "Manchester United", score: "3-1", away: "Arsenal FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Arsenal FC", score: "3-2", away: "Manchester United" },
    { date: "Sep 2022", comp: "Premier League", home: "Manchester United", score: "3-1", away: "Arsenal FC" },
  ],
  "Arsenal FC vs Manchester United": [
    { date: "Nov 2024", comp: "Premier League", home: "Manchester United", score: "1-1", away: "Arsenal FC" },
    { date: "May 2024", comp: "Premier League", home: "Arsenal FC", score: "1-0", away: "Manchester United" },
    { date: "Sep 2023", comp: "Premier League", home: "Manchester United", score: "3-1", away: "Arsenal FC" },
    { date: "Jan 2023", comp: "Premier League", home: "Arsenal FC", score: "3-2", away: "Manchester United" },
    { date: "Sep 2022", comp: "Premier League", home: "Manchester United", score: "3-1", away: "Arsenal FC" },
  ],
};

function getH2HKey(teamA: string, teamB: string): string {
  return `${teamA} vs ${teamB}`;
}

function getH2HMatches(teamA: string, teamB: string): H2HMatch[] {
  return h2hHistory[getH2HKey(teamA, teamB)] || h2hHistory[getH2HKey(teamB, teamA)] || [];
}

function getH2HResult(match: H2HMatch, teamA: string, teamB: string): { result: string; label: string } {
  const [homeGoals, awayGoals] = match.score.split("-").map(Number);
  const isHomeA = match.home === teamA;
  const teamAGoals = isHomeA ? homeGoals : awayGoals;
  const teamBGoals = isHomeA ? awayGoals : homeGoals;
  if (teamAGoals > teamBGoals) return { result: "win", label: "W" };
  if (teamAGoals < teamBGoals) return { result: "loss", label: "L" };
  return { result: "draw", label: "D" };
}

function ComparisonBar({ valueA, valueB, label, maxVal }: { valueA: number; valueB: number; label: string; maxVal?: number }) {
  const max = maxVal || Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;
  const teamAWins = valueA > valueB;
  const teamBWins = valueB > valueA;
  const isDraw = valueA === valueB;

  return (
    <div className="flex items-center gap-2 md:gap-3 py-2">
      <span className={`text-sm font-bold w-10 text-right transition-all duration-500 ${teamAWins ? "text-primary scale-105" : isDraw ? "text-foreground" : "text-muted-foreground"}`}>
        {valueA}
      </span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-2 rounded-full transition-all duration-700 ease-out ${teamAWins ? "bg-primary" : isDraw ? "bg-primary/60" : "bg-muted-foreground/30"}`}
            style={{ width: `${Math.max(pctA, 8)}%` }}
          />
        </div>
        <div className="w-px h-3 bg-border flex-shrink-0" />
        <div className="flex-1">
          <div
            className={`h-2 rounded-full transition-all duration-700 ease-out ${teamBWins ? "bg-primary" : isDraw ? "bg-primary/60" : "bg-muted-foreground/30"}`}
            style={{ width: `${Math.max(pctB, 8)}%` }}
          />
        </div>
      </div>
      <span className={`text-sm font-bold w-10 transition-all duration-500 ${teamBWins ? "text-primary scale-105" : isDraw ? "text-foreground" : "text-muted-foreground"}`}>
        {valueB}
      </span>
    </div>
  );
}

function StatRow({ label, valueA, valueB, renderA, renderB }: { label: string; valueA: number; valueB: number; renderA?: React.ReactNode; renderB?: React.ReactNode }) {
  const teamAWins = valueA > valueB;
  const teamBWins = valueB > valueA;
  const isDraw = valueA === valueB;
  return (
    <div className="flex items-center py-3 border-b border-border/50 last:border-b-0">
      <div className="flex-1 text-right">
        {renderA || (
          <span className={`text-sm font-semibold transition-colors duration-300 ${teamAWins ? "text-primary" : isDraw ? "text-foreground" : "text-muted-foreground"}`}>
            {valueA}
          </span>
        )}
      </div>
      <div className="w-28 md:w-36 text-center flex-shrink-0">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 text-left">
        {renderB || (
          <span className={`text-sm font-semibold transition-colors duration-300 ${teamBWins ? "text-primary" : isDraw ? "text-foreground" : "text-muted-foreground"}`}>
            {valueB}
          </span>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function MatchCenterPage() {
  const { setCurrentPage, user } = useAppStore();
  const [activeLeague, setActiveLeague] = useState("all");
  const [h2hTeamA, setH2hTeamA] = useState("");
  const [h2hTeamB, setH2hTeamB] = useState("");
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
      {/* Page Header with Decoration */}
      <div className="mb-8 relative">
        {/* Animated pitch pattern decoration */}
        <div className="absolute -right-6 -top-6 w-32 h-32 opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <rect x="10" y="10" width="80" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="5" fill="currentColor" />
          </svg>
        </div>
        {/* Floating football icon */}
        <div className="absolute -left-4 top-0 opacity-[0.06] pointer-events-none animate-float">
          <CircleDot className="w-16 h-16" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2 heading-gradient">Match Center</h1>
          <p className="text-muted-foreground">Live scores, results, and upcoming fixtures</p>
        </div>
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

      {/* ===== HEAD-TO-HEAD COMPARISON ===== */}
      <div id="h2h-comparison" className="mt-10 scroll-mt-20" style={{ scrollBehavior: "smooth" }}>
        <div className="flex items-center gap-2 mb-4">
          <Swords className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Head-to-Head Comparison</h2>
          <Badge variant="outline" className="text-xs">Interactive</Badge>
        </div>
        <Card className="gradient-border overflow-hidden">
          <CardContent className="p-4 md:p-6">
            {/* Team Selectors */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">Team A</label>
                <Select value={h2hTeamA} onValueChange={setH2hTeamA}>
                  <SelectTrigger className="w-full rounded-xl border-2 hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamNames.map((name) => {
                      const t = teamData[name];
                      return (
                        <SelectItem key={name} value={name} disabled={name === h2hTeamB}>
                          <span className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[9px] font-bold`}>{t.abbr}</span>
                            {name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/* VS Badge */}
              <div className="flex-shrink-0 mt-4 sm:mt-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center animate-pulse">
                  <span className="text-xs font-extrabold text-primary">VS</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">Team B</label>
                <Select value={h2hTeamB} onValueChange={setH2hTeamB}>
                  <SelectTrigger className="w-full rounded-xl border-2 hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamNames.map((name) => {
                      const t = teamData[name];
                      return (
                        <SelectItem key={name} value={name} disabled={name === h2hTeamA}>
                          <span className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[9px] font-bold`}>{t.abbr}</span>
                            {name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comparison Content */}
            {h2hTeamA && h2hTeamB && teamData[h2hTeamA] && teamData[h2hTeamB] ? (
              <div className="animate-fade-in">
                {/* Header Row: Team A | VS | Team B */}
                <div className="flex items-center justify-between mb-6 py-4 px-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right hidden sm:block">
                      <h3 className="font-bold text-sm">{h2hTeamA}</h3>
                      <p className="text-xs text-muted-foreground">{teamData[h2hTeamA].abbr}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${teamData[h2hTeamA].color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {teamData[h2hTeamA].abbr}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mx-2 sm:mx-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Swords className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${teamData[h2hTeamB].color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {teamData[h2hTeamB].abbr}
                    </div>
                    <div className="text-left hidden sm:block">
                      <h3 className="font-bold text-sm">{h2hTeamB}</h3>
                      <p className="text-xs text-muted-foreground">{teamData[h2hTeamB].abbr}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Comparison Table */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Season Statistics</h4>
                  <div className="bg-muted/20 rounded-xl p-2 md:p-4">
                    {/* League Position */}
                    <StatRow
                      label="League Pos"
                      valueA={-teamData[h2hTeamA].pos}
                      valueB={-teamData[h2hTeamB].pos}
                      renderA={(
                        <span className="flex items-center justify-end gap-1.5">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${teamData[h2hTeamA].pos <= 4 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {teamData[h2hTeamA].pos}
                          </span>
                        </span>
                      )}
                      renderB={(
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${teamData[h2hTeamB].pos <= 4 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {teamData[h2hTeamB].pos}
                          </span>
                        </span>
                      )}
                    />
                    {/* Points */}
                    <StatRow label="Points" valueA={teamData[h2hTeamA].pts} valueB={teamData[h2hTeamB].pts} />
                    {/* W / D / L */}
                    <div className="flex items-center py-3 border-b border-border/50">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-semibold ${teamData[h2hTeamA].w > teamData[h2hTeamB].w ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamA].w}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className={`text-sm font-semibold ${teamData[h2hTeamA].d > teamData[h2hTeamB].d ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamA].d}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className={`text-sm font-semibold ${teamData[h2hTeamA].l < teamData[h2hTeamB].l ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamA].l}</span>
                        </div>
                      </div>
                      <div className="w-28 md:w-36 text-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">W / D / L</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-semibold ${teamData[h2hTeamB].w > teamData[h2hTeamA].w ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamB].w}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className={`text-sm font-semibold ${teamData[h2hTeamB].d > teamData[h2hTeamA].d ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamB].d}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className={`text-sm font-semibold ${teamData[h2hTeamB].l < teamData[h2hTeamA].l ? "text-primary" : "text-muted-foreground"}`}>{teamData[h2hTeamB].l}</span>
                        </div>
                      </div>
                    </div>
                    {/* Goals For */}
                    <StatRow label="Goals For" valueA={teamData[h2hTeamA].gf} valueB={teamData[h2hTeamB].gf} />
                    {/* Goals Against */}
                    <StatRow
                      label="Goals Agn"
                      valueA={-teamData[h2hTeamA].ga}
                      valueB={-teamData[h2hTeamB].ga}
                      renderA={(
                        <span className={`text-sm font-semibold ${teamData[h2hTeamA].ga < teamData[h2hTeamB].ga ? "text-primary" : teamData[h2hTeamA].ga > teamData[h2hTeamB].ga ? "text-muted-foreground" : "text-foreground"}`}>
                          {teamData[h2hTeamA].ga}
                        </span>
                      )}
                      renderB={(
                        <span className={`text-sm font-semibold ${teamData[h2hTeamB].ga < teamData[h2hTeamA].ga ? "text-primary" : teamData[h2hTeamB].ga > teamData[h2hTeamA].ga ? "text-muted-foreground" : "text-foreground"}`}>
                          {teamData[h2hTeamB].ga}
                        </span>
                      )}
                    />
                    {/* Goal Difference */}
                    <StatRow label="Goal Diff" valueA={teamData[h2hTeamA].gf - teamData[h2hTeamA].ga} valueB={teamData[h2hTeamB].gf - teamData[h2hTeamB].ga} />
                    {/* Clean Sheets */}
                    <StatRow label="Clean Sheets" valueA={teamData[h2hTeamA].cs} valueB={teamData[h2hTeamB].cs} />
                    {/* Form */}
                    <div className="flex items-center py-3">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {teamData[h2hTeamA].form.map((f, fi) => (
                            <div key={fi} className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center text-white ${f === "W" ? "bg-primary" : f === "D" ? "bg-amber-500" : "bg-destructive"}`}>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-28 md:w-36 text-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last 5 Form</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1">
                          {teamData[h2hTeamB].form.map((f, fi) => (
                            <div key={fi} className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center text-white ${f === "W" ? "bg-primary" : f === "D" ? "bg-amber-500" : "bg-destructive"}`}>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Top Scorer */}
                    <div className="flex items-center py-3">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-medium ${teamData[h2hTeamA].topGoals > teamData[h2hTeamB].topGoals ? "text-foreground" : "text-muted-foreground"}`}>{teamData[h2hTeamA].topScorer}</span>
                          <Badge variant="outline" className={`text-xs ${teamData[h2hTeamA].topGoals > teamData[h2hTeamB].topGoals ? "border-primary text-primary" : ""}`}>
                            {teamData[h2hTeamA].topGoals} goals
                          </Badge>
                        </div>
                      </div>
                      <div className="w-28 md:w-36 text-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top Scorer</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-xs ${teamData[h2hTeamB].topGoals > teamData[h2hTeamA].topGoals ? "border-primary text-primary" : ""}`}>
                            {teamData[h2hTeamB].topGoals} goals
                          </Badge>
                          <span className={`text-sm font-medium ${teamData[h2hTeamB].topGoals > teamData[h2hTeamA].topGoals ? "text-foreground" : "text-muted-foreground"}`}>{teamData[h2hTeamB].topScorer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Comparison Bars */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Visual Comparison
                  </h4>
                  <div className="bg-muted/20 rounded-xl p-3 md:p-4 space-y-1">
                    <ComparisonBar label="Points" valueA={teamData[h2hTeamA].pts} valueB={teamData[h2hTeamB].pts} />
                    <ComparisonBar label="Wins" valueA={teamData[h2hTeamA].w} valueB={teamData[h2hTeamB].w} />
                    <ComparisonBar label="Goals For" valueA={teamData[h2hTeamA].gf} valueB={teamData[h2hTeamB].gf} />
                    <ComparisonBar label="Goal Diff" valueA={teamData[h2hTeamA].gf - teamData[h2hTeamA].ga} valueB={teamData[h2hTeamB].gf - teamData[h2hTeamB].ga} />
                    <ComparisonBar label="Clean Sheets" valueA={teamData[h2hTeamA].cs} valueB={teamData[h2hTeamB].cs} />
                    <ComparisonBar label="Top Goals" valueA={teamData[h2hTeamA].topGoals} valueB={teamData[h2hTeamB].topGoals} />
                  </div>
                </div>

                {/* Head-to-Head History */}
                {(() => {
                  const matches = getH2HMatches(h2hTeamA, h2hTeamB);
                  if (matches.length === 0) return null;
                  const wins = matches.filter(m => getH2HResult(m, h2hTeamA, h2hTeamB).result === "win").length;
                  const draws = matches.filter(m => getH2HResult(m, h2hTeamA, h2hTeamB).result === "draw").length;
                  const losses = matches.filter(m => getH2HResult(m, h2hTeamA, h2hTeamB).result === "loss").length;
                  return (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Head-to-Head History
                      </h4>
                      {/* H2H Summary Bar */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-primary" style={{ width: `${(wins / matches.length) * 100}%` }} />
                            <span className="text-xs font-bold text-primary w-5">{wins}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{teamData[h2hTeamA].abbr} Wins</p>
                        </div>
                        <div className="text-center">
                          <div className="h-2 w-12 rounded-full bg-amber-500 mx-auto" style={{ width: `${Math.max((draws / matches.length) * 100, 8)}%` }} />
                          <p className="text-[10px] text-muted-foreground mt-1">Draws</p>
                          <span className="text-xs font-bold text-amber-500">{draws}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary w-5">{losses}</span>
                            <div className="h-2 flex-1 rounded-full bg-primary" style={{ width: `${(losses / matches.length) * 100}%` }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">{teamData[h2hTeamB].abbr} Wins</p>
                        </div>
                      </div>
                      {/* Match List */}
                      <div className="space-y-2 stagger-fade">
                        {matches.map((match, i) => {
                          const { result } = getH2HResult(match, h2hTeamA, h2hTeamB);
                          return (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                              result === "win" ? "bg-primary/[0.03] border-primary/10" : result === "loss" ? "bg-destructive/[0.02] border-destructive/10" : "bg-muted/30 border-border/50"
                            }`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                                result === "win" ? "bg-primary" : result === "loss" ? "bg-destructive" : "bg-amber-500"
                              }`}>
                                {result === "win" ? "W" : result === "loss" ? "L" : "D"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate">{match.home}</span>
                                  <Badge variant="outline" className="text-xs font-bold px-2 stat-number">{match.score}</Badge>
                                  <span className="text-sm font-medium truncate">{match.away}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-muted-foreground">{match.date}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{match.comp}</Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Swords className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Select two teams above to compare their stats</p>
                <p className="text-xs text-muted-foreground mt-1">Choose from 14 Premier League teams</p>
              </div>
            )}
          </CardContent>
        </Card>
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
