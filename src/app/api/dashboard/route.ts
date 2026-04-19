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

    const userId = payload.id as string;

    const [
      totalTickets,
      confirmedTickets,
      totalHighlights,
      totalAnalyses,
      cartCount,
      cartTotal,
    ] = await Promise.all([
      db.ticket.count({ where: { userId } }),
      db.ticket.count({ where: { userId, status: 'confirmed' } }),
      db.highlight.count({ where: { userId } }),
      db.matchAnalysis.count({ where: { userId } }),
      db.cartItem.count({ where: { userId } }),
      db.cartItem.findMany({
        where: { userId },
        include: { product: true },
      }),
    ]);

    const cartTotalPrice = cartTotal.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const totalSpent = await db.ticket.aggregate({
      where: { userId, status: 'confirmed' },
      _sum: { price: true },
    });

    const topHighlights = await db.highlight.findMany({
      orderBy: { views: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalTickets,
        confirmedTickets,
        totalHighlights,
        totalAnalyses,
        cartCount,
        cartTotal: cartTotalPrice,
        totalSpent: totalSpent._sum.price || 0,
      },
      topHighlights,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
