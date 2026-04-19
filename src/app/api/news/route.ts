import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// In-memory cache for news results (30 min TTL)
let newsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function invokeWithRetry(zai: any, query: string, num: number, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await zai.functions.invoke('web_search', { query, num });
      return result;
    } catch (error: any) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      console.error(`Search failed after ${maxRetries + 1} attempts:`, query, error?.message);
      return [];
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    // Check cache
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...newsCache.data, cached: true });
    }

    const zai = await ZAI.create();

    // Sequential requests with retry to avoid rate limits
    const transferNews = await invokeWithRetry(zai, 'football transfer news rumors latest', 5);
    await new Promise(r => setTimeout(r, 500));
    const matchNews = await invokeWithRetry(zai, 'football soccer match results highlights', 4);
    await new Promise(r => setTimeout(r, 500));
    const generalNews = await invokeWithRetry(zai, 'football soccer news headlines 2025', 4);

    // Combine and categorize results
    const transferResults = (transferNews || []).map((item: any) => ({
      ...item,
      category: 'Transfer',
      categoryColor: 'text-orange-500',
      categoryBg: 'bg-orange-500/10',
    }));

    const matchResults = (matchNews || []).map((item: any) => ({
      ...item,
      category: 'Matches',
      categoryColor: 'text-emerald-500',
      categoryBg: 'bg-emerald-500/10',
    }));

    const generalResults = (generalNews || []).map((item: any) => ({
      ...item,
      category: 'Headlines',
      categoryColor: 'text-blue-500',
      categoryBg: 'bg-blue-500/10',
    }));

    const allNews = [...transferResults, ...matchResults, ...generalResults];

    if (allNews.length === 0) {
      return NextResponse.json({
        success: true,
        totalResults: 0,
        news: [],
        transferNews: [],
        matchNews: [],
        generalNews: [],
        rateLimited: true,
      });
    }

    const data = {
      success: true,
      topic: 'football news',
      totalResults: allNews.length,
      news: allNews,
      transferNews: transferResults,
      matchNews: matchResults,
      generalNews: generalResults,
    };

    // Cache the results
    if (!newsCache) {
      newsCache = { data: null as any, timestamp: 0 };
    }
    newsCache.data = data;
    newsCache.timestamp = Date.now();

    return NextResponse.json(data);
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch news. Please try again in a moment.' }, { status: 500 });
  }
}
