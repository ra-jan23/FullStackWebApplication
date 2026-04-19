"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain, Trophy, MapPin, Calendar, Sparkles, Users, Target,
  ChevronRight, TrendingUp, Star, Zap, ArrowLeft, RefreshCw,
  Shield, Swords
} from "lucide-react";

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  venue: string;
  date: string;
}

interface Prediction {
  predictedScore: string;
  probabilities: { homeWin: number; draw: number; awayWin: number };
  homeKeyPlayer: string;
  awayKeyPlayer: string;
  tacticalFactors: string[];
  prediction: string;
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [hasPredicted, setHasPredicted] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      if (data.success) setMatches(data.matches);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const predictMatch = async (match: Match) => {
    setSelectedMatch(match);
    setPrediction(null);
    setPredicting(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPrediction(data.prediction);
        setHasPredicted(prev => new Set(prev).add(match.id));
        toast.success("Prediction generated!", { description: `${match.homeTeam} vs ${match.awayTeam}` });
      } else {
        toast.error("Failed to generate prediction");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Match Predictions</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            AI-powered match analysis and predictions
          </p>
        </div>
      </div>

      {/* Prediction Result Panel */}
      {(selectedMatch && prediction) && (
        <Card className="mb-6 overflow-hidden border-2 border-violet-500/20 animate-scale-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                <span className="text-lg">AI Prediction</span>
              </div>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400">
                {selectedMatch.league}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Score Prediction */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-4 md:gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Home</p>
                  <p className="text-lg md:text-xl font-bold">{selectedMatch.homeTeam}</p>
                </div>
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-2 border-violet-500/20 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                      {prediction.predictedScore}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-500 text-white text-[10px] px-2 rounded-full shadow-md">PREDICTED</Badge>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Away</p>
                  <p className="text-lg md:text-xl font-bold">{selectedMatch.awayTeam}</p>
                </div>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: `${selectedMatch.homeTeam} Win`, value: prediction.probabilities.homeWin, color: "from-emerald-500 to-green-500" },
                { label: "Draw", value: prediction.probabilities.draw, color: "from-amber-500 to-yellow-500" },
                { label: `${selectedMatch.awayTeam} Win`, value: prediction.probabilities.awayWin, color: "from-rose-500 to-red-500" },
              ].map((prob, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/50 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground truncate">{prob.label}</span>
                    <span className="text-lg font-bold">{prob.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${prob.color} animate-progress-fill transition-all duration-1000`}
                      style={{ width: `${prob.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{selectedMatch.homeTeam} Key Player</p>
                  <p className="font-semibold text-sm">{prediction.homeKeyPlayer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{selectedMatch.awayTeam} Key Player</p>
                  <p className="font-semibold text-sm">{prediction.awayKeyPlayer}</p>
                </div>
              </div>
            </div>

            {/* Tactical Factors */}
            {prediction.tacticalFactors && prediction.tacticalFactors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-violet-500" />
                  Tactical Factors
                </h3>
                <div className="space-y-2">
                  {prediction.tacticalFactors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30">
                      <div className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-3 h-3 text-violet-500" />
                      </div>
                      <p className="text-sm leading-relaxed">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Rationale */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                AI Analysis
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{prediction.prediction}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Prediction */}
      {predicting && (
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analyzing Match...</h3>
            <p className="text-sm text-muted-foreground mb-4">Our AI is analyzing team form, tactics, and historical data</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Matches Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Swords className="w-5 h-5 text-violet-500" />
          Upcoming Matches
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <Card
            key={match.id}
            className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-hover-lift cursor-pointer overflow-hidden ${
              selectedMatch?.id === match.id ? "border-violet-500/40 shadow-violet-500/10" : ""
            }`}
            onClick={() => !hasPredicted.has(match.id) && predictMatch(match)}
          >
            {hasPredicted.has(match.id) && (
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            )}
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-xs">{match.league}</Badge>
                {hasPredicted.has(match.id) && (
                  <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" /> Predicted
                  </Badge>
                )}
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-right">
                  <p className="font-bold text-sm md:text-base">{match.homeTeam}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mx-2 border border-violet-500/20">
                  <span className="text-xs font-bold text-violet-500">VS</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm md:text-base">{match.awayTeam}</p>
                </div>
              </div>

              {/* Match Info */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{match.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{match.date}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className={`w-full gap-2 rounded-xl ${
                  hasPredicted.has(match.id)
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                    : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md shadow-violet-500/25 text-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  predictMatch(match);
                }}
                disabled={predicting}
              >
                {hasPredicted.has(match.id) ? (
                  <>
                    <RefreshCw className="w-4 h-4" /> Repredict
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" /> Predict Match
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How AI Predictions Work */}
      <Card className="mt-8 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            How AI Predictions Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Match Selection", desc: "Choose an upcoming match from major European leagues", icon: <Users className="w-5 h-5" /> },
              { step: "02", title: "Data Analysis", desc: "AI analyzes team form, head-to-head, injuries, and tactics", icon: <Target className="w-5 h-5" /> },
              { step: "03", title: "Tactical Review", desc: "Evaluates playing styles, formations, and key matchups", icon: <Shield className="w-5 h-5" /> },
              { step: "04", title: "Score Prediction", desc: "Generates predicted score with probability breakdown", icon: <Trophy className="w-5 h-5" /> },
            ].map((item, i) => (
              <div key={i} className="text-center p-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3 text-violet-500">
                  {item.icon}
                </div>
                <Badge variant="secondary" className="mb-2 text-[10px] font-mono">{item.step}</Badge>
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
