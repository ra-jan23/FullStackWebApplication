import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Return stored match events from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')

    const events = await db.matchEvent.findMany({
      where: matchId ? { matchId } : undefined,
      orderBy: { minute: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching match events:', error)
    return NextResponse.json({ error: 'Failed to fetch match events' }, { status: 500 })
  }
}

// POST: Store a new match event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, type, minute, team, player, description } = body

    if (!matchId || !type || !minute || !team) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, type, minute, team' },
        { status: 400 }
      )
    }

    const event = await db.matchEvent.create({
      data: {
        matchId,
        type,
        minute,
        team,
        player: player || '',
        description: description || '',
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating match event:', error)
    return NextResponse.json({ error: 'Failed to create match event' }, { status: 500 })
  }
}
