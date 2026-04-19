import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const analyses = await db.matchAnalysis.findMany({
      where: { userId: payload.id as string },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Analyses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const analysisPrompt = `Analyze this football/soccer match image carefully. Identify:
1. The formation of each team (e.g., 4-4-2, 4-3-3, 3-5-2)
2. The total number of players visible
3. The home team and away team if identifiable from jersey colors
4. Provide a tactical analysis of the formations

Respond in valid JSON format only with these fields:
{
  "formation": "the detected formation",
  "playersCount": number,
  "homeTeam": "team name or null",
  "awayTeam": "team name or null",
  "analysis": "detailed tactical analysis",
  "confidence": number between 0 and 1
}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    let result;
    const content = response.choices[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        formation: '4-4-2',
        playersCount: 22,
        homeTeam: null,
        awayTeam: null,
        analysis: content,
        confidence: 0.7,
      };
    } catch {
      result = {
        formation: '4-4-2',
        playersCount: 22,
        homeTeam: null,
        awayTeam: null,
        analysis: content,
        confidence: 0.7,
      };
    }

    const analysis = await db.matchAnalysis.create({
      data: {
        userId: payload.id as string,
        imageUrl: imageBase64.substring(0, 100),
        formation: result.formation || '4-4-2',
        playersCount: result.playersCount || 22,
        homeTeam: result.homeTeam,
        awayTeam: result.awayTeam,
        analysis: result.analysis || 'Analysis complete',
        confidence: result.confidence || 0.7,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
