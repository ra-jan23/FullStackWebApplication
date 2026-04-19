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

    const favorites = await db.favoriteItem.findMany({
      where: { userId: payload.id as string },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const favorite = await db.favoriteItem.create({
      data: {
        userId: payload.id as string,
        productId,
      },
      include: { product: true },
    });

    return NextResponse.json({ favorite });
  } catch (error: unknown) {
    console.error('Favorites POST error:', error);
    const msg = error instanceof Error && error.message?.includes('Unique') 
      ? 'Already in favorites' 
      : 'Failed to add favorite';
    return NextResponse.json({ error: msg }, { status: 400 });
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
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.favoriteItem.deleteMany({
      where: { userId: payload.id as string, productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
