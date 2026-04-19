"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Video, Play, Clock, Eye, Heart, Share2
} from "lucide-react";

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null);

  useEffect(() => {
    fetch("/api/highlights").then(res => res.json()).then(data => { setHighlights(data.highlights || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatViews = (views: number) => { if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`; if (views >= 1000) return `${(views / 1000).toFixed(0)}K`; return views.toString(); };

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Highlights</h1>
        <p className="text-muted-foreground">AI-curated highlights from the biggest football matches</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight, i) => (
          <Card key={i} className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500" onClick={() => setSelectedHighlight(highlight)}>
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={highlight.thumbnail} alt={highlight.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-100 scale-75 shadow-xl">
                  <Play className="w-6 h-6 text-black ml-1" />
                </div>
              </div>
              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white backdrop-blur-sm rounded-md"><Clock className="w-3 h-3 mr-1" /> {highlight.duration}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{highlight.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{highlight.match}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" /> {formatViews(highlight.views)} views</div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); toast.success("Saved to favorites!"); }}><Heart className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); toast.success("Link copied!"); }}><Share2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {highlights.length === 0 && <div className="text-center py-16 text-muted-foreground"><Video className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No highlights available yet.</p></div>}
      <Dialog open={!!selectedHighlight} onOpenChange={() => setSelectedHighlight(null)}>
        <DialogContent className="max-w-2xl">
          {selectedHighlight && (<>
            <div className="aspect-video overflow-hidden rounded-xl bg-muted mb-4 relative">
              <img src={selectedHighlight.thumbnail} alt={selectedHighlight.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"><Play className="w-8 h-8 text-black ml-1" /></div></div>
            </div>
            <DialogHeader><DialogTitle>{selectedHighlight.title}</DialogTitle><DialogDescription>{selectedHighlight.match}</DialogDescription></DialogHeader>
            <p className="text-sm text-muted-foreground">{selectedHighlight.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatViews(selectedHighlight.views)} views</div><div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedHighlight.duration}</div></div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
