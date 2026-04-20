"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Trophy, Clock, Star, CheckCircle2, XCircle,
  Zap, Target, BookOpen, Crown, RotateCcw, ChevronRight,
  Award, Flame, TrendingUp, Sparkles, Share2, Copy,
  Shield, Swords, Timer, AlertTriangle, BarChart3,
  ArrowRight, Home, Medal, Lock
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

const CATEGORIES = [
  { id: "history", label: "History & World Cup", icon: <BookOpen className="w-6 h-6" />, color: "from-amber-500 to-orange-600", desc: "Famous moments, milestones & legendary matches" },
  { id: "players", label: "Football Legends", icon: <Star className="w-6 h-6" />, color: "from-violet-500 to-purple-600", desc: "Records, stats & career achievements" },
  { id: "tactics", label: "Tactics & Formations", icon: <Target className="w-6 h-6" />, color: "from-emerald-500 to-teal-600", desc: "Strategic systems & innovations" },
  { id: "clubs", label: "Club Football", icon: <Crown className="w-6 h-6" />, color: "from-rose-500 to-pink-600", desc: "Trophies, rivalries & eras of dominance" },
  { id: "premier_league", label: "Premier League", icon: <Zap className="w-6 h-6" />, color: "from-sky-500 to-blue-600", desc: "Records & iconic PL moments" },
  { id: "champions_league", label: "Champions League", icon: <Trophy className="w-6 h-6" />, color: "from-indigo-500 to-blue-700", desc: "Finals & legendary European nights" },
];

const DIFFICULTIES = [
  { id: "easy" as const, label: "Easy", desc: "Beginner friendly", icon: <Shield className="w-5 h-5" />, color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", points: 10, timer: 15 },
  { id: "medium" as const, label: "Medium", desc: "For the knowledgeable", icon: <Swords className="w-5 h-5" />, color: "from-amber-500 to-yellow-600", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", points: 20, timer: 15 },
  { id: "hard" as const, label: "Hard", desc: "Expert level only", icon: <AlertTriangle className="w-5 h-5" />, color: "from-rose-500 to-red-600", bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30", points: 30, timer: 15 },
  { id: "mixed" as const, label: "Mixed", desc: "A bit of everything", icon: <Sparkles className="w-5 h-5" />, color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/30", points: 20, timer: 15 },
];

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", points: 10 },
  medium: { label: "Medium", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", points: 20 },
  hard: { label: "Hard", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", points: 30 },
};

const LEADERBOARD = [
  { name: "QuizMaster99", score: 2450, quizzes: 48, avatar: "QM" },
  { name: "FootballGuru", score: 2180, quizzes: 35, avatar: "FG" },
  { name: "TacticalNerd", score: 1920, quizzes: 42, avatar: "TN" },
  { name: "StatKing", score: 1760, quizzes: 29, avatar: "SK" },
  { name: "PitchExpert", score: 1510, quizzes: 31, avatar: "PE" },
  { name: "GoalMachine", score: 1380, quizzes: 24, avatar: "GM" },
  { name: "OffsideRule", score: 1250, quizzes: 27, avatar: "OR" },
  { name: "CleanSheet", score: 1120, quizzes: 20, avatar: "CS" },
  { name: "HatTrickHero", score: 980, quizzes: 18, avatar: "HH" },
  { name: "SetPieceKing", score: 860, quizzes: 15, avatar: "SP" },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const TIMER_DURATION = 15;

type Screen = "home" | "difficulty" | "loading" | "quiz" | "results";
type Difficulty = "easy" | "medium" | "hard" | "mixed";

export default function QuizPage() {
  const { user } = useAppStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("mixed");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isLoading, setIsLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ q: QuizQuestion; selected: number; correct: boolean; time: number }[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scoreAnimRef = useRef<NodeJS.Timeout | null>(null);

  // Animated score counter for results
  useEffect(() => {
    if (screen === "results") {
      setAnimatedScore(0);
      const duration = 1500;
      const steps = 30;
      const increment = score / steps;
      let current = 0;
      scoreAnimRef.current = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          if (scoreAnimRef.current) clearInterval(scoreAnimRef.current);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      return () => { if (scoreAnimRef.current) clearInterval(scoreAnimRef.current); };
    }
  }, [screen, score]);

  // Timer
  useEffect(() => {
    if (screen !== "quiz" || selectedAnswer !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, screen, selectedAnswer]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || !questions[currentQ]) return;
    const isCorrect = answerIndex === questions[currentQ].correctAnswer;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);

    if (isCorrect) {
      const pts = DIFFICULTY_CONFIG[questions[currentQ].difficulty]?.points || 20;
      const streakBonus = Math.min(newStreak - 1, 3) * 5;
      setScore(s => s + pts + streakBonus);
      setCorrectCount(c => c + 1);
    }

    setAnsweredQuestions(prev => [...prev, {
      q: questions[currentQ],
      selected: answerIndex,
      correct: isCorrect,
      time: TIMER_DURATION - timeLeft,
    }]);
  }, [selectedAnswer, questions, currentQ, streak, maxStreak, timeLeft]);

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setScreen("results");
    } else {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(TIMER_DURATION);
    }
  };

  const startQuiz = async (catId: string, difficulty: Difficulty) => {
    setSelectedCategory(catId);
    setSelectedDifficulty(difficulty);
    setError(null);
    setIsLoading(true);
    setScreen("loading");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: catId, count: questionCount, difficulty }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setCorrectCount(0);
        setTimeLeft(TIMER_DURATION);
        setAnsweredQuestions([]);
        setScreen("quiz");
      } else {
        setError("Failed to generate questions. Please try again.");
        setScreen("difficulty");
      }
    } catch (err) {
      console.error("Quiz error:", err);
      setError("Network error. Please try again.");
      setScreen("difficulty");
    } finally {
      setIsLoading(false);
    }
  };

  const goToDifficulty = (catId: string) => {
    setSelectedCategory(catId);
    setScreen("difficulty");
    setError(null);
  };

  const restartQuiz = () => {
    setScreen("home");
    setQuestions([]);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTimeLeft(TIMER_DURATION);
    setAnsweredQuestions([]);
    setError(null);
  };

  const shareScore = () => {
    const grade = getGrade();
    const text = `\u26BD PitchVision Football Quiz\n${grade.emoji} ${grade.label} - ${grade.letter}\n${accuracyPct}% accuracy\nBest Streak: ${maxStreak}x\n${selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.label : "Mixed"} | ${questions.length} Qs\n\nPlay now at PitchVision!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const avgTime = answeredQuestions.length > 0
    ? (answeredQuestions.reduce((sum, a) => sum + a.time, 0) / answeredQuestions.length).toFixed(1)
    : "0";

  const accuracyPct = answeredQuestions.length > 0
    ? Math.round((correctCount / answeredQuestions.length) * 100)
    : 0;

  const getGrade = () => {
    const totalPossible = answeredQuestions.reduce((sum, a) => sum + (DIFFICULTY_CONFIG[a.q.difficulty]?.points || 20), 0);
    const scorePct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    if (scorePct >= 90) return { letter: "A", label: "Football Genius!", emoji: "\uD83C\uDFC6", color: "from-amber-400 to-yellow-500", textColor: "text-amber-500", bg: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20" };
    if (scorePct >= 70) return { letter: "B", label: "Great Knowledge!", emoji: "\u2B50", color: "from-emerald-400 to-green-500", textColor: "text-emerald-500", bg: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20" };
    if (scorePct >= 50) return { letter: "C", label: "Not Bad!", emoji: "\uD83D\uDC4D", color: "from-blue-400 to-cyan-500", textColor: "text-blue-500", bg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20" };
    if (scorePct >= 30) return { letter: "D", label: "Keep Practicing!", emoji: "\uD83D\uDCAA", color: "from-orange-400 to-amber-500", textColor: "text-orange-500", bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20" };
    return { letter: "F", label: "Never Give Up!", emoji: "\uD83D\uDCDA", color: "from-rose-400 to-red-500", textColor: "text-rose-500", bg: "bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20" };
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return "red";
    if (timeLeft <= 10) return "yellow";
    return "green";
  };

  // Get user's leaderboard rank
  const getUserRank = () => {
    let rank = 1;
    for (const entry of LEADERBOARD) {
      if (score > entry.score) break;
      rank++;
    }
    return rank;
  };

  // ==================== HOME SCREEN ====================
  if (screen === "home") {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="relative overflow-hidden page-header-gradient pb-2">
          <div className="absolute inset-0 pitch-pattern opacity-[0.03]" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-56 h-56 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 py-12 md:py-16 relative">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4 animate-fade-in">
                <Sparkles className="w-4 h-4" /> AI-Powered Trivia
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 heading-gradient">
                Football Quiz Challenge
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-6">
                Test your football knowledge with AI-generated questions across 6 categories. Choose your difficulty, earn points, build streaks, and climb the leaderboard!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="w-4 h-4 text-amber-500" /> <span><strong className="text-foreground">6</strong> Categories</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Brain className="w-4 h-4 text-violet-500" /> <span><strong className="text-foreground">AI</strong> Generated</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flame className="w-4 h-4 text-rose-500" /> <span><strong className="text-foreground">Streak</strong> Bonuses</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Timer className="w-4 h-4 text-blue-500" /> <span><strong className="text-foreground">15s</strong> Per Question</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Question Count Selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm text-muted-foreground font-medium">Questions:</span>
            {[3, 5, 7, 10].map(n => (
              <Button
                key={n}
                variant={questionCount === n ? "default" : "outline"}
                size="sm"
                className={`rounded-full w-10 h-10 p-0 font-bold transition-all ${questionCount === n ? "shadow-md shadow-primary/25 scale-105" : "hover:scale-105"}`}
                onClick={() => setQuestionCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12 stagger-fade">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                className="group cursor-pointer border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden card-border-hover card-hover-lift"
                onClick={() => goToDifficulty(cat.id)}
              >
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{cat.desc}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{questionCount} Qs</Badge>
                        <Badge variant="outline" className="text-xs">15s each</Badge>
                        <Badge variant="outline" className="text-xs">Streak bonus</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="max-w-2xl mx-auto">
            <Card className="border overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold">Leaderboard — Top 10 Players</h3>
                  <Badge variant="outline" className="ml-auto text-xs">This Week</Badge>
                </div>
                <div className="divide-y max-h-[420px] overflow-y-auto custom-scrollbar">
                  {LEADERBOARD.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${i < 3 ? "bg-gradient-to-r from-amber-500/[0.03] to-transparent" : "hover:bg-muted/50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20" :
                        i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md" :
                        i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? "bg-amber-500/10 text-amber-500" :
                        i === 1 ? "bg-slate-400/10 text-slate-400" :
                        i === 2 ? "bg-amber-600/10 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {entry.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.quizzes} quizzes played</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm stat-number">{entry.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="px-6 py-4 border-t bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name} <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0">You</Badge></p>
                        <p className="text-xs text-muted-foreground">Keep playing to rank up!</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary stat-number">{score}</p>
                        <p className="text-xs text-muted-foreground">total points</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DIFFICULTY SELECTION SCREEN ====================
  if (screen === "difficulty" && selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden page-header-gradient pb-2">
          <div className="absolute inset-0 pitch-pattern opacity-[0.03]" />
          <div className="container mx-auto px-4 py-10 relative">
            <div className="text-center max-w-2xl mx-auto animate-fade-in">
              <Button variant="ghost" className="mb-4 gap-1 text-muted-foreground" onClick={() => setScreen("home")}>
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Categories
              </Button>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${catInfo?.color || "from-primary to-emerald-600"} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                {catInfo?.icon}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{catInfo?.label}</h2>
              <p className="text-muted-foreground">Choose your difficulty level to begin</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-2 border-red-500/50 bg-red-500/5 animate-fade-in">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-red-600 dark:text-red-400">Something went wrong</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl shrink-0" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-fade">
            {DIFFICULTIES.map((diff) => (
              <Card
                key={diff.id}
                className="group cursor-pointer border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden card-border-hover"
                onClick={() => !isLoading && startQuiz(selectedCategory, diff.id)}
              >
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${diff.color} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {diff.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{diff.label}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{diff.desc}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${diff.bg} ${diff.text} border ${diff.border} text-xs`}>
                          +{diff.points} pts/Q
                        </Badge>
                        <Badge variant="outline" className="text-xs">{diff.timer}s timer</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scoring Info */}
          <Card className="mt-8 border bg-muted/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">How Scoring Works</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong className="text-emerald-600 dark:text-emerald-400">Easy:</strong> 10 pts per correct answer</p>
                    <p><strong className="text-amber-600 dark:text-amber-400">Medium:</strong> 20 pts per correct answer</p>
                    <p><strong className="text-rose-600 dark:text-rose-400">Hard:</strong> 30 pts per correct answer</p>
                    <p><strong className="text-violet-600 dark:text-violet-400">Streak Bonus:</strong> +5 pts for each consecutive correct (max +15)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== LOADING SCREEN ====================
  if (screen === "loading") {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Skeleton Category Header */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="skeleton-shimmer w-10 h-10 rounded-xl" />
            <div className="skeleton-shimmer h-5 w-40 rounded-lg" />
          </div>

          {/* Skeleton Progress Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="skeleton-shimmer flex-1 h-2 rounded-full" />
            <div className="skeleton-shimmer h-4 w-12 rounded" />
          </div>

          {/* Skeleton Timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer w-4 h-4 rounded-full" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
            </div>
            <div className="skeleton-shimmer h-6 w-24 rounded-full" />
          </div>

          {/* Skeleton Timer Bar */}
          <div className="skeleton-shimmer w-full h-2.5 rounded-full mb-8" />

          {/* Skeleton Question Card */}
          <Card className="border-2 shadow-lg mb-6">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="skeleton-shimmer w-10 h-10 rounded-xl shrink-0" />
                <div className="skeleton-shimmer h-6 w-3/4 rounded-lg" />
              </div>

              {/* Skeleton Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl border">
                    <div className="skeleton-shimmer w-9 h-9 rounded-lg shrink-0" />
                    <div className="skeleton-shimmer h-4 flex-1 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="text-center p-3 rounded-xl border">
                <div className="skeleton-shimmer h-5 w-12 mx-auto mb-1 rounded" />
                <div className="skeleton-shimmer h-3 w-14 mx-auto rounded" />
              </div>
            ))}
          </div>

          {/* Generating text */}
          <div className="text-center mt-10 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${catInfo?.color || "from-primary to-emerald-600"} flex items-center justify-center text-white shadow-lg`}>
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              AI is generating {questionCount} {selectedDifficulty} {catInfo?.label?.toLowerCase() || "football"} questions...
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== QUIZ SCREEN ====================
  if (screen === "quiz" && questions[currentQ]) {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    const timePct = (timeLeft / TIMER_DURATION) * 100;
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const diffConfig = DIFFICULTY_CONFIG[q.difficulty];
    const timerColor = getTimerColor();

    return (
      <div className="min-h-screen">
        {/* Quiz Header */}
        <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${catInfo?.color || "from-primary to-emerald-600"} flex items-center justify-center text-white shrink-0`}>
                  {catInfo?.icon}
                </div>
                <span className="font-medium text-sm truncate">{catInfo?.label}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {streak >= 3 && (
                  <div className="flex items-center gap-1 text-amber-500 animate-fade-in">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{streak}x</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm stat-number">{score}</span>
                </div>
              </div>
            </div>
            {/* Question Progress Bar */}
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                Q{currentQ + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Timer Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 transition-colors duration-300 ${
                  timerColor === "red" ? "text-red-500 animate-pulse" :
                  timerColor === "yellow" ? "text-amber-500" :
                  "text-emerald-500"
                }`} />
                <span className={`text-sm font-bold transition-colors duration-300 ${
                  timerColor === "red" ? "text-red-500" :
                  timerColor === "yellow" ? "text-amber-500" :
                  "text-emerald-500"
                }`}>
                  {timeLeft}s remaining
                </span>
              </div>
              <div className="flex items-center gap-2">
                {diffConfig && (
                  <Badge variant="outline" className={`text-xs border ${diffConfig.color}`}>
                    {diffConfig.label} (+{diffConfig.points}pts)
                  </Badge>
                )}
              </div>
            </div>
            {/* Visual Timer Bar with color transition */}
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timerColor === "red"
                    ? "bg-gradient-to-r from-red-600 to-red-400 animate-pulse"
                    : timerColor === "yellow"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400"
                }`}
                style={{ width: `${timePct}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-2 shadow-lg mb-6 animate-fade-in">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-6">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base">
                  {currentQ + 1}
                </span>
                <h2 className="text-lg md:text-xl font-semibold leading-relaxed pt-1">{q.question}</h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((option, i) => {
                  const isCorrect = i === q.correctAnswer;
                  const isSelected = i === selectedAnswer;
                  const isWrong = selectedAnswer !== null && isSelected && !isCorrect;
                  const showCorrect = selectedAnswer !== null && isCorrect;
                  const isDimmed = selectedAnswer !== null && !isSelected && !isCorrect;

                  return (
                    <button
                      key={i}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        showCorrect
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                          : isWrong
                            ? "border-red-500 bg-red-500/10 scale-[0.98] animate-shake"
                            : isDimmed
                              ? "border-muted/50 opacity-40"
                              : selectedAnswer === null
                                ? "border hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-[0.98]"
                                : "border-muted/50 opacity-40"
                      }`}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 ${
                        showCorrect
                          ? "bg-emerald-500 text-white scale-110"
                          : isWrong
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {showCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                         isWrong ? <XCircle className="w-5 h-5" /> :
                         OPTION_LETTERS[i]}
                      </span>
                      <span className={`text-sm md:text-base font-medium ${
                        showCorrect ? "text-emerald-700 dark:text-emerald-300" :
                        isWrong ? "text-red-700 dark:text-red-300" :
                        ""
                      }`}>{option}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Explanation Popup */}
          {showExplanation && (
            <div className="animate-fade-slide-up mb-6">
              <Card className={`border-2 ${selectedAnswer === q.correctAnswer ? "border-emerald-500/50 bg-emerald-500/5" : "border-red-500/50 bg-red-500/5"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedAnswer === q.correctAnswer
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                        : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                    }`}>
                      {selectedAnswer === q.correctAnswer ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${selectedAnswer === q.correctAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {selectedAnswer === q.correctAnswer
                          ? `Correct! +${(DIFFICULTY_CONFIG[q.difficulty]?.points || 20) + (Math.min(streak, 3)) * 5} points${streak >= 3 ? ` (${streak}x streak bonus!)` : ""}`
                          : selectedAnswer === -1
                            ? "Time's up!"
                            : "Incorrect!"}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={nextQuestion}
                  className="gap-2 rounded-xl shadow-md shadow-primary/20 px-8 btn-press"
                >
                  {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-muted/50 border stat-card-interactive">
              <div className="text-lg font-bold text-primary stat-number">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50 border stat-card-interactive">
              <div className="text-lg font-bold text-emerald-500 stat-number">{correctCount}/{answeredQuestions.length}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50 border stat-card-interactive">
              <div className="text-lg font-bold text-amber-500 stat-number flex items-center justify-center gap-1">
                {streak >= 3 && <Flame className="w-4 h-4" />}
                {streak}x
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (screen === "results") {
    const grade = getGrade();
    const totalPossible = answeredQuestions.reduce((sum, a) => sum + (DIFFICULTY_CONFIG[a.q.difficulty]?.points || 20), 0);
    const scorePct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    const userRank = getUserRank();

    // Category breakdown
    const categoryBreakdown: Record<string, { total: number; correct: number; pts: number }> = {};
    answeredQuestions.forEach(a => {
      const cat = a.q.category || "General";
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, correct: 0, pts: 0 };
      categoryBreakdown[cat].total++;
      if (a.correct) categoryBreakdown[cat].correct++;
      categoryBreakdown[cat].pts += a.correct ? (DIFFICULTY_CONFIG[a.q.difficulty]?.points || 20) : 0;
    });

    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back to Home */}
          <div className="mb-6 animate-fade-in">
            <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={restartQuiz}>
              <Home className="w-4 h-4" /> Back to Quiz Home
            </Button>
          </div>

          {/* Grade Card */}
          <Card className="border-2 shadow-xl mb-6 overflow-hidden animate-fade-in">
            <div className={`${grade.bg} p-8 text-center`}>
              <div className="text-6xl mb-3">{grade.emoji}</div>
              <h2 className={`text-2xl md:text-3xl font-bold mb-1 ${grade.textColor}`}>{grade.label}</h2>

              {/* Grade Badge */}
              <div className="inline-flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grade.color} flex items-center justify-center text-white text-4xl font-extrabold shadow-lg animate-bounce-in`}>
                  {grade.letter}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {selectedCategory && CATEGORIES.find(c => c.id === selectedCategory)?.label} &bull; {questions.length} Questions &bull; {DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label || "Mixed"} difficulty
              </p>

              {/* Score Display */}
              <div className="relative w-44 h-44 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#resultGradient)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${scorePct * 2.64} ${264}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="resultGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold stat-number">{animatedScore}</span>
                  <span className="text-xs text-muted-foreground">points</span>
                </div>
              </div>

              {/* Big Score: Correct/Total */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background/60 border shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-lg stat-number">{correctCount}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-bold text-lg">{questions.length}</span>
                <span className="text-muted-foreground text-sm">correct</span>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold stat-number">{accuracyPct}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Flame className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <div className="text-lg font-bold stat-number">{maxStreak}x</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold stat-number">{avgTime}s</div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Medal className="w-4 h-4 mx-auto mb-1 text-violet-500" />
                  <div className="text-lg font-bold stat-number">#{userRank}</div>
                  <div className="text-xs text-muted-foreground">Rank</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2 rounded-xl shadow-md shadow-primary/20" onClick={() => selectedCategory && startQuiz(selectedCategory, selectedDifficulty)}>
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button variant="outline" className="flex-1 gap-2 rounded-xl" onClick={restartQuiz}>
                  <BookOpen className="w-4 h-4" /> Try Different Category
                </Button>
                <Button variant="outline" className="flex-1 gap-2 rounded-xl" onClick={shareScore}>
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share Score"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mock Leaderboard with User Rank */}
          <Card className="border overflow-hidden mb-6 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {/* Show top 5 from leaderboard, inserting user if ranked in top 5 */}
                {(() => {
                  const topEntries = LEADERBOARD.slice(0, 5);
                  const entries: Array<{ name: string; score: number; quizzes: number; avatar: string; isUser?: boolean }> = [];

                  topEntries.forEach((entry, i) => {
                    // Insert user before this entry if user ranks here
                    if (userRank === i + 1) {
                      entries.push({
                        name: user?.name || "You",
                        score,
                        quizzes: 1,
                        avatar: (user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)) || "U",
                        isUser: true,
                      });
                    }
                    entries.push({ ...entry, isUser: false });
                  });

                  // If user is ranked 6th or below, add at the end
                  if (userRank > 5) {
                    entries.push({
                      name: user?.name || "You",
                      score,
                      quizzes: 1,
                      avatar: (user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2)) || "U",
                      isUser: true,
                    });
                  }

                  return entries.map((entry, i) => {
                    const originalRank = entry.isUser ? userRank : i + 1 + (entry.isUser ? 0 : 0);
                    const displayRank = entry.isUser ? userRank : (() => {
                      // Calculate real rank for non-user entries
                      let rank = 1;
                      for (const e of entries.slice(0, i)) {
                        if (e.isUser) {
                          // User inserted here, shift rank
                        }
                        rank++;
                      }
                      return i + 1;
                    })();

                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                          entry.isUser
                            ? "bg-primary/5 border-l-4 border-l-primary"
                            : i < 3
                              ? "bg-gradient-to-r from-amber-500/[0.03] to-transparent"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          entry.isUser
                            ? "bg-gradient-to-br from-primary to-emerald-500 text-white shadow-md shadow-primary/20"
                            : i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20" :
                              i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md" :
                              i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md" :
                              "bg-muted text-muted-foreground"
                        }`}>
                          {entry.isUser ? (
                            <Star className="w-4 h-4" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          entry.isUser
                            ? "bg-primary/10 text-primary"
                            : i === 0 ? "bg-amber-500/10 text-amber-500" :
                              i === 1 ? "bg-slate-400/10 text-slate-400" :
                              i === 2 ? "bg-amber-600/10 text-amber-600" :
                              "bg-muted text-muted-foreground"
                        }`}>
                          {entry.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.name}
                            {entry.isUser && <Badge variant="outline" className="text-[10px] ml-1.5 px-1.5 py-0 border-primary/30 text-primary">You</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.quizzes} quiz{entry.quizzes !== 1 ? "zes" : ""} played</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm stat-number ${entry.isUser ? "text-primary" : ""}`}>
                            {entry.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <Card className="border overflow-hidden mb-6 animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" /> Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown).map(([cat, data]) => {
                    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    const catInfo = CATEGORIES.find(c => c.label.toLowerCase().includes(cat.toLowerCase()));
                    return (
                      <div key={cat} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catInfo?.color || "from-primary to-emerald-600"} flex items-center justify-center text-white shrink-0`}>
                          {catInfo?.icon || <Target className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{cat}</p>
                            <span className="text-sm font-bold stat-number">{data.correct}/{data.total}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                pct >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" :
                                pct >= 40 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                                "bg-gradient-to-r from-red-500 to-rose-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">{data.pts} pts</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Review */}
          <Card className="border overflow-hidden mb-6 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-primary" /> Answer Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-96 overflow-y-auto custom-scrollbar">
                {answeredQuestions.map((a, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                        a.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}>
                        {a.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1.5">{a.q.question}</p>
                        <div className="flex flex-wrap gap-2 text-xs mb-1">
                          {a.correct ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Your answer: {a.q.options[a.q.correctAnswer]}</span>
                          ) : (
                            <>
                              <span className="text-red-600 dark:text-red-400">Your answer: {a.selected >= 0 ? a.q.options[a.selected] : "Time's up"}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Correct: {a.q.options[a.q.correctAnswer]}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.q.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
