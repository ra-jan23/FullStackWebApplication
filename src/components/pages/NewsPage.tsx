"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Newspaper, ExternalLink, RefreshCw, Search, ArrowLeft,
  TrendingUp, Calendar, Globe, Flame, Zap, ArrowUpRight, Rss
} from "lucide-react";

interface NewsItem {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
  favicon: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
}

const categoryFilters = [
  { key: 'all', label: 'All News', icon: <Newspaper className="w-3.5 h-3.5" /> },
  { key: 'Transfer', label: 'Transfers', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
  { key: 'Matches', label: 'Matches', icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'Headlines', label: 'Headlines', icon: <Flame className="w-3.5 h-3.5" /> },
];

export default function NewsPage() {
  const { setCurrentPage } = useAppStore();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cached, setCached] = useState(false);

  const fetchNews = useCallback(async (showToast = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        setNews(data.news || []);
        setLastUpdated(new Date());
        setCached(data.cached || false);
        if (showToast) toast.success('News refreshed!');
      } else {
        setError(data.error || 'Failed to load news');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = news
    .filter(n => activeFilter === 'all' || n.category === activeFilter)
    .filter(n => !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.snippet.toLowerCase().includes(searchQuery.toLowerCase()));

  const getCategoryStats = () => {
    const transferCount = news.filter(n => n.category === 'Transfer').length;
    const matchCount = news.filter(n => n.category === 'Matches').length;
    const headlineCount = news.filter(n => n.category === 'Headlines').length;
    return { transfer: transferCount, matches: matchCount, headlines: headlineCount, total: news.length };
  };

  const stats = getCategoryStats();

  if (loading && news.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Football News</h1>
            <p className="text-muted-foreground text-sm">
              Latest transfer rumors, match updates & football headlines
              {lastUpdated && (
                <span className="ml-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lastUpdated.toLocaleTimeString()}
                  {cached && <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0">cached</Badge>}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={() => fetchNews(true)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Articles', value: stats.total, icon: <Newspaper className="w-4 h-4 text-primary" />, color: 'text-primary' },
          { label: 'Transfer News', value: stats.transfer, icon: <TrendingUp className="w-4 h-4 text-orange-500" />, color: 'text-orange-500' },
          { label: 'Match Updates', value: stats.matches, icon: <Zap className="w-4 h-4 text-emerald-500" />, color: 'text-emerald-500' },
          { label: 'Headlines', value: stats.headlines, icon: <Flame className="w-4 h-4 text-red-500" />, color: 'text-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map(cat => (
            <Button
              key={cat.key}
              variant={activeFilter === cat.key ? "default" : "outline"}
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => setActiveFilter(cat.key)}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>
        <div className="sm:ml-auto relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            className="pl-9 rounded-lg h-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="max-w-md mx-auto text-center p-8 mb-6 border-destructive/20 bg-destructive/5">
          <p className="text-destructive font-medium mb-2">Failed to load news</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => fetchNews()}>
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </Card>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item, index) => (
          <a
            key={`${item.url}-${index}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-shine overflow-hidden">
              <CardContent className="p-5 flex flex-col h-full">
                {/* Category + Source */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={`${item.categoryBg} ${item.categoryColor} border text-[11px] rounded-lg px-2 py-0.5`}>
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{item.host_name}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3">
                  {item.name}
                </h3>

                {/* Snippet */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
                  {item.snippet}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t mt-auto">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {item.date !== 'N/A' ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                  </div>
                  <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {filteredNews.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <Rss className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No news articles found matching your criteria.</p>
        </div>
      )}

      {/* Powered by notice */}
      <div className="text-center mt-8 text-xs text-muted-foreground">
        <p>Powered by AI Web Search &bull; Articles from various football news sources</p>
      </div>
    </div>
  );
}
