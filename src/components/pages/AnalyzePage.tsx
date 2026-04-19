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
