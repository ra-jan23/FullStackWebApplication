import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { productId, rating, title, comment } = await request.json();

    if (!productId || !rating || !title) {
      return NextResponse.json({ error: 'productId, rating, and title are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existing = await db.review.findUnique({
      where: { userId_productId: { userId: payload.userId, productId } }
    });

    if (existing) {
      // Update existing review
      const updated = await db.review.update({
        where: { id: existing.id },
        data: { rating, title, comment },
      });
      return NextResponse.json({ success: true, review: updated, updated: true });
    }

    const review = await db.review.create({
      data: {
        userId: payload.userId,
        productId,
        rating,
        title,
        comment: comment || null,
      },
    });

    // Update product average rating
    const allReviews = await db.review.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await db.product.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return NextResponse.json({ success: true, review, updated: false });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
