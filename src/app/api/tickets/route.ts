import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

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

    const tickets = await db.ticket.findMany({
      where: { userId: payload.id as string },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
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

    const { match, homeTeam, awayTeam, date, time, venue, section, price } = await request.json();

    if (!match || !homeTeam || !awayTeam || !date || !time || !venue || !section || !price) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const seat = `${section.charAt(0)}-${Math.floor(Math.random() * 200) + 1}`;

    const ticket = await db.ticket.create({
      data: {
        userId: payload.id as string,
        match,
        homeTeam,
        awayTeam,
        date,
        time,
        venue,
        section,
        seat,
        price: parseFloat(price),
        status: 'confirmed',
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Tickets POST error:', error);
    return NextResponse.json({ error: 'Failed to book ticket' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    await db.ticket.delete({
      where: { id: ticketId, userId: payload.id as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tickets DELETE error:', error);
    return NextResponse.json({ error: 'Failed to cancel ticket' }, { status: 500 });
  }
}
