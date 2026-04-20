"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ScanSearch, Camera, Upload, Loader2, BarChart3, Cpu, Target, Layers
} from "lucide-react";

/* ─── 4-3-3 player positions (viewBox 0 0 800 500) ─── */
const FORMATION_PLAYERS = [
  { x: 55, y: 250 },   // GK
  { x: 165, y: 90 },   // LB
  { x: 165, y: 195 },  // CB
  { x: 165, y: 305 },  // CB
  { x: 165, y: 410 },  // RB
  { x: 340, y: 120 },  // CM
  { x: 340, y: 250 },  // CM
  { x: 340, y: 380 },  // CM
  { x: 530, y: 100 },  // LW
  { x: 530, y: 250 },  // ST
  { x: 530, y: 400 },  // RW
];

/* ─── Grass texture stripe y-positions ─── */
const GRASS_LINES = [60, 130, 200, 270, 340, 410];

function PitchDiagram({ formation }: { formation?: string }) {
  const label = formation || "4-3-3";

  return (
    <div className="mt-5 space-y-3 animate-fade-in">
      {/* Formation label */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-lg">
          {label} Formation Detected
        </Badge>
      </div>

      {/* Pitch SVG container */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Player dot radial gradient */}
            <radialGradient id="playerGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#4f46e5" />
            </radialGradient>
            {/* Player glow gradient */}
            <radialGradient id="playerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── Pitch background ── */}
          <rect
            x="0" y="0" width="800" height="500"
            className="fill-[#2d8a4e] dark:fill-[#1a3a24] transition-all duration-500"
          />

          {/* ── Grass texture stripes (alternating shade) ── */}
          {GRASS_LINES.map((y) => (
            <line
              key={`grass-${y}`}
              x1="20" y1={y} x2="780" y2={y}
              className="stroke-[#278f45] dark:stroke-[#173320] transition-all duration-500"
              strokeWidth="40"
              strokeOpacity="0.35"
              strokeDasharray="800 60"
              strokeDashoffset="-30"
            />
          ))}

          {/* ── Pitch boundary ── */}
          <rect
            x="20" y="20" width="760" height="460" rx="2"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Center line ── */}
          <line
            x1="400" y1="20" x2="400" y2="480"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
          />

          {/* ── Center circle ── */}
          <circle
            cx="400" cy="250" r="60"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Center spot ── */}
          <circle
            cx="400" cy="250" r="4"
            className="fill-white/[0.9] dark:fill-white/[0.15] transition-all duration-500"
          />

          {/* ── Left penalty area ── */}
          <rect
            x="20" y="85" width="130" height="330"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Right penalty area ── */}
          <rect
            x="650" y="85" width="130" height="330"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Left goal area ── */}
          <rect
            x="20" y="170" width="50" height="160"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Right goal area ── */}
          <rect
            x="730" y="170" width="50" height="160"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5"
            fill="none"
          />

          {/* ── Penalty spots ── */}
          <circle cx="145" cy="250" r="4" className="fill-white/[0.9] dark:fill-white/[0.15] transition-all duration-500" />
          <circle cx="655" cy="250" r="4" className="fill-white/[0.9] dark:fill-white/[0.15] transition-all duration-500" />

          {/* ── Penalty arcs ── */}
          <path
            d="M 200 185 A 60 60 0 0 1 200 315"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5" fill="none"
          />
          <path
            d="M 600 185 A 60 60 0 0 0 600 315"
            className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500"
            strokeWidth="2.5" fill="none"
          />

          {/* ── Corner arcs ── */}
          <path d="M 20 30 A 10 10 0 0 1 30 20" className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500" strokeWidth="2.5" fill="none" />
          <path d="M 770 20 A 10 10 0 0 1 780 30" className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500" strokeWidth="2.5" fill="none" />
          <path d="M 20 470 A 10 10 0 0 0 30 480" className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500" strokeWidth="2.5" fill="none" />
          <path d="M 770 480 A 10 10 0 0 0 780 470" className="stroke-white/[0.9] dark:stroke-white/[0.15] transition-all duration-500" strokeWidth="2.5" fill="none" />

          {/* ── Goals (behind goal line) ── */}
          <rect x="5" y="215" width="15" height="70" rx="2" className="stroke-white/70 dark:stroke-white/10 transition-all duration-500" strokeWidth="2" fill="none" />
          <rect x="780" y="215" width="15" height="70" rx="2" className="stroke-white/70 dark:stroke-white/10 transition-all duration-500" strokeWidth="2" fill="none" />

          {/* ══════════════════════════════════════════
              Player dots – 4-3-3 formation
              ══════════════════════════════════════════ */}
          {FORMATION_PLAYERS.map((p, i) => (
            <g key={`player-${i}`} className="transition-all duration-500">
              {/* Soft glow behind dot */}
              <circle
                cx={p.x} cy={p.y} r="20"
                fill="url(#playerGlow)"
                className="opacity-100 dark:opacity-40 transition-opacity duration-500"
              />
              {/* Main dot */}
              <circle
                cx={p.x} cy={p.y} r="12"
                fill="url(#playerGrad)"
                className="stroke-white/30 dark:stroke-white/10 transition-all duration-500"
                strokeWidth="1.5"
              />
              {/* Jersey number */}
              <text
                x={p.x} y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white dark:fill-white/80 text-[10px] font-bold pointer-events-none select-none transition-all duration-500"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const { token } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/analyze", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()).then(data => setHistory(data.analyses || [])).catch(() => {});
  }, [token, result]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const base64 = ev.target?.result as string; setImage(base64); setPreviewUrl(base64); };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !token) return;
    setAnalyzing(true); setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ imageBase64: image }) });
      const data = await res.json();
      if (data.analysis) { setResult(data.analysis); toast.success("Analysis complete!", { description: `Detected formation: ${data.analysis.formation}` }); }
      else { toast.error("Analysis failed", { description: data.error }); }
    } catch { toast.error("Network error"); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Formation Analysis</h1>
        <p className="text-muted-foreground">Upload a football match image and let AI detect formations and player positions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Upload Match Image</CardTitle><CardDescription>Supports PNG, JPEG, and WebP formats</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all" onClick={() => document.getElementById("image-upload")?.click()}>
              {previewUrl ? (
                <div className="relative"><img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover" /><Button variant="ghost" size="sm" className="mt-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setImage(null); setPreviewUrl(null); setResult(null); }}><Upload className="w-4 h-4 mr-1" /> Upload Different</Button></div>
              ) : (
                <div className="space-y-4"><div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse"><Upload className="w-8 h-8 text-primary" /></div><div><p className="font-medium">Click to upload</p><p className="text-sm text-muted-foreground mt-1">Upload a screenshot or photo of a football match</p></div><div className="flex items-center gap-2 justify-center text-xs text-muted-foreground"><Camera className="w-3 h-3" /> PNG, JPEG, WebP supported</div></div>
              )}
            </div>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button className="w-full gap-2 h-11 rounded-xl shadow-md shadow-primary/20" disabled={!image || analyzing} onClick={handleAnalyze}>
              {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ScanSearch className="w-4 h-4" /> Analyze Formation</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Analysis Results</CardTitle></CardHeader>
          <CardContent>
            {analyzing ? (
              <div className="text-center py-12 space-y-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mx-auto animate-pulse"><Cpu className="w-8 h-8 text-primary" /></div><div><p className="font-medium">AI is analyzing your image...</p><p className="text-sm text-muted-foreground mt-1">Detecting players, ball, and formations</p></div><Progress value={66} className="w-48 mx-auto" /></div>
            ) : result ? (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Formation", val: result.formation },
                    { label: "Players", val: String(result.playersCount) },
                    { label: "Confidence", val: `${Math.round((result.confidence || 0) * 100)}%` },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className="text-xl font-bold text-primary">{s.val}</p></div>
                  ))}
                </div>
                {(result.homeTeam || result.awayTeam) && (
                  <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Home</p><p className="font-semibold">{result.homeTeam || "Unknown"}</p></div>
                    <Badge variant="secondary" className="text-lg px-3">VS</Badge>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Away</p><p className="font-semibold">{result.awayTeam || "Unknown"}</p></div>
                  </div>
                )}
                <div><h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Tactical Analysis</h4><p className="text-sm text-muted-foreground leading-relaxed">{result.analysis}</p></div>
                {/* Pitch diagram with detected formation */}
                <PitchDiagram formation={result.formation} />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground"><ScanSearch className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Upload an image and click &quot;Analyze Formation&quot; to see results</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {history.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Analysis History</CardTitle><CardDescription>Your previous formation analyses</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">{history.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary font-bold text-lg">{item.formation.split("-")[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm">Formation: {item.formation}</p><p className="text-xs text-muted-foreground">{item.homeTeam && item.awayTeam ? `${item.homeTeam} vs ${item.awayTeam}` : "Teams not detected"} &bull; {item.playersCount} players</p></div>
                <div className="text-right"><Badge variant="outline" className="rounded-lg">{Math.round((item.confidence || 0) * 100)}%</Badge><p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p></div>
              </div>
            ))}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
