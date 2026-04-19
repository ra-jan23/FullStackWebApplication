import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      // Allow unauthenticated users to see highlights
      const highlights = await db.highlight.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ highlights });
    }

    const payload = verifyToken(token);
    if (!payload) {
      const highlights = await db.highlight.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ highlights });
    }

    const highlights = await db.highlight.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Highlights GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
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

    const { title, match, description, thumbnail, duration } = await request.json();

    if (!title || !match) {
      return NextResponse.json({ error: 'Title and match are required' }, { status: 400 });
    }

    const highlight = await db.highlight.create({
      data: {
        userId: payload.id as string,
        title,
        match,
        description: description || '',
        thumbnail: thumbnail || '/images/highlights/goal-moment.png',
        duration: duration || '0:00',
        views: 0,
      },
    });

    return NextResponse.json({ highlight });
  } catch (error) {
    console.error('Highlights POST error:', error);
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}
