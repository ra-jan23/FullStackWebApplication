"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Trophy, Clock, Star, CheckCircle2, XCircle,
  Zap, Target, BookOpen, Crown, RotateCcw, ChevronRight,
  Award, Flame, TrendingUp, Sparkles
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
  { id: "history", label: "History & World Cup", icon: <BookOpen className="w-5 h-5" />, color: "from-amber-500 to-orange-600", desc: "Famous moments & milestones" },
  { id: "players", label: "Football Legends", icon: <Star className="w-5 h-5" />, color: "from-violet-500 to-purple-600", desc: "Records, stats & achievements" },
  { id: "tactics", label: "Tactics & Formations", icon: <Target className="w-5 h-5" />, color: "from-blue-500 to-cyan-600", desc: "Strategies & systems" },
  { id: "clubs", label: "Club Football", icon: <Crown className="w-5 h-5" />, color: "from-emerald-500 to-teal-600", desc: "Trophies, rivalries & eras" },
  { id: "premier_league", label: "Premier League", icon: <Zap className="w-5 h-5" />, color: "from-rose-500 to-pink-600", desc: "Records & iconic moments" },
  { id: "champions_league", label: "Champions League", icon: <Trophy className="w-5 h-5" />, color: "from-indigo-500 to-blue-600", desc: "Finals & legendary nights" },
];

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", points: 10 },
  medium: { label: "Medium", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", points: 20 },
  hard: { label: "Hard", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", points: 30 },
};

const LEADERBOARD = [
  { name: "QuizMaster99", score: 950, quizzes: 48 },
  { name: "FootballGuru", score: 880, quizzes: 35 },
  { name: "TacticalNerd", score: 820, quizzes: 42 },
  { name: "StatKing", score: 760, quizzes: 29 },
  { name: "PitchExpert", score: 710, quizzes: 31 },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const TIMER_DURATION = 20;

export default function QuizPage() {
  const { user } = useAppStore();
  const [screen, setScreen] = useState<"home" | "quiz" | "results">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
      const pts = DIFFICULTY_CONFIG[questions[currentQ].difficulty].points;
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

  const startQuiz = async (catId: string) => {
    setSelectedCategory(catId);
    setIsLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: catId, count: questionCount }),
      });
      const data = await res.json();
      if (data.success && data.questions?.length > 0) {
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
      }
    } catch (err) {
      console.error("Quiz error:", err);
    } finally {
      setIsLoading(false);
    }
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
  };

  const avgTime = answeredQuestions.length > 0
    ? (answeredQuestions.reduce((sum, a) => sum + a.time, 0) / answeredQuestions.length).toFixed(1)
    : "0";

  const accuracyPct = answeredQuestions.length > 0
    ? Math.round((correctCount / answeredQuestions.length) * 100)
    : 0;

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
                Test your football knowledge with AI-generated questions across 6 categories. Earn points, build streaks, and climb the leaderboard!
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
                  <Clock className="w-4 h-4 text-blue-500" /> <span><strong className="text-foreground">20s</strong> Timer</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                className={`group cursor-pointer border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden card-border-hover ${selectedCategory === cat.id ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""}`}
                onClick={() => startQuiz(cat.id)}
              >
                <CardContent className="p-5 relative">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{cat.label}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{cat.desc}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{questionCount} Qs</Badge>
                        <Badge variant="outline" className="text-xs">20s each</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                  {/* Loading overlay */}
                  {isLoading && selectedCategory === cat.id && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2 text-primary">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Generating...</span>
                      </div>
                    </div>
                  )}
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
                  <h3 className="font-semibold">Top Players This Week</h3>
                </div>
                <div className="divide-y">
                  {LEADERBOARD.map((entry, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md" :
                        i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md" :
                        i === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.quizzes} quizzes played</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{entry.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="px-6 py-3.5 border-t bg-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name} <span className="text-muted-foreground font-normal">(You)</span></p>
                        <p className="text-xs text-muted-foreground">Keep playing to rank up!</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{score}</p>
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

  // ==================== QUIZ SCREEN ====================
  if (screen === "quiz" && questions[currentQ]) {
    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;
    const timePct = (timeLeft / TIMER_DURATION) * 100;
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const diffConfig = DIFFICULTY_CONFIG[q.difficulty];

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
                {streak >= 2 && (
                  <div className="flex items-center gap-1 text-amber-500 animate-fade-in">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{streak}x</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">{score}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground font-medium shrink-0">{currentQ + 1}/{questions.length}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Timer Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${timeLeft <= 5 ? "text-red-500" : "text-muted-foreground"}`}>
                  {timeLeft}s remaining
                </span>
              </div>
              <Badge variant="outline" className={`text-xs border ${diffConfig.color}`}>
                {diffConfig.label} (+{diffConfig.points}pts)
              </Badge>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5 ? "bg-gradient-to-r from-red-500 to-red-400" :
                  timeLeft <= 10 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                  "bg-gradient-to-r from-emerald-500 to-teal-400"
                }`}
                style={{ width: `${timePct}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-2 shadow-lg mb-6 animate-fade-in">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-3 mb-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {currentQ + 1}
                </span>
                <h2 className="text-lg md:text-xl font-semibold leading-relaxed">{q.question}</h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((option, i) => {
                  const isCorrect = i === q.correctAnswer;
                  const isSelected = i === selectedAnswer;
                  const isWrong = selectedAnswer !== null && isSelected && !isCorrect;
                  const showCorrect = selectedAnswer !== null && isCorrect;

                  let borderClass = "border hover:border-primary/50 hover:bg-primary/5";
                  if (showCorrect) borderClass = "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20";
                  if (isWrong) borderClass = "border-red-500 bg-red-500/10";
                  if (selectedAnswer !== null && !isSelected && !isCorrect) borderClass = "border-muted opacity-60";

                  return (
                    <button
                      key={i}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${borderClass} ${
                        selectedAnswer === null ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
                      }`}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        showCorrect ? "bg-emerald-500 text-white" :
                        isWrong ? "bg-red-500 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {showCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                         isWrong ? <XCircle className="w-4 h-4" /> :
                         OPTION_LETTERS[i]}
                      </span>
                      <span className="text-sm md:text-base font-medium">{option}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          {showExplanation && (
            <div className="animate-fade-in mb-6">
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
                    <div>
                      <h4 className={`font-semibold mb-1 ${selectedAnswer === q.correctAnswer ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {selectedAnswer === q.correctAnswer ? `Correct! +${DIFFICULTY_CONFIG[q.difficulty].points + (Math.min(streak, 3)) * 5} points${streak >= 2 ? ` (${streak}x streak bonus!)` : ""}` : "Incorrect!"}
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
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-muted/50 border">
              <div className="text-lg font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50 border">
              <div className="text-lg font-bold text-emerald-500">{correctCount}/{answeredQuestions.length}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50 border">
              <div className="text-lg font-bold text-amber-500">{streak}x</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (screen === "results") {
    const totalPossible = answeredQuestions.reduce((sum, a) => sum + DIFFICULTY_CONFIG[a.q.difficulty].points, 0);
    const scorePct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    const grade = scorePct >= 90 ? { label: "Outstanding!", emoji: "🏆", color: "text-amber-500" } :
                  scorePct >= 70 ? { label: "Great Job!", emoji: "⭐", color: "text-emerald-500" } :
                  scorePct >= 50 ? { label: "Good Try!", emoji: "👍", color: "text-blue-500" } :
                  { label: "Keep Practicing!", emoji: "💪", color: "text-rose-500" };

    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Score Card */}
          <Card className="border-2 shadow-xl mb-6 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-primary/10 via-emerald-500/10 to-amber-500/10 p-8 text-center">
              <div className="text-6xl mb-3">{grade.emoji}</div>
              <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${grade.color}`}>{grade.label}</h2>
              <p className="text-muted-foreground mb-6">
                {selectedCategory && CATEGORIES.find(c => c.id === selectedCategory)?.label} • {questions.length} Questions
              </p>

              {/* Score Circle */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#scoreGradient)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${scorePct * 2.64} ${264}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{score}</span>
                  <span className="text-xs text-muted-foreground">points</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold">{accuracyPct}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <div className="text-lg font-bold">{correctCount}/{questions.length}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Flame className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <div className="text-lg font-bold">{maxStreak}x</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold">{avgTime}s</div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 gap-2 rounded-xl shadow-md shadow-primary/20" onClick={() => selectedCategory && startQuiz(selectedCategory)}>
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button variant="outline" className="flex-1 gap-2 rounded-xl" onClick={restartQuiz}>
                  <BookOpen className="w-4 h-4" /> New Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer Review */}
          <Card className="border overflow-hidden mb-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Answer Review</h3>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto custom-scrollbar">
                {answeredQuestions.map((a, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        a.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}>
                        {a.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{a.q.question}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {a.correct ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Your answer: {a.q.options[a.q.correctAnswer]}</span>
                          ) : (
                            <>
                              <span className="text-red-600 dark:text-red-400">Your answer: {a.selected >= 0 ? a.q.options[a.selected] : "Time's up"}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Correct: {a.q.options[a.q.correctAnswer]}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{a.q.explanation}</p>
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
