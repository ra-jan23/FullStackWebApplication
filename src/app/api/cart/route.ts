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

    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.id as string },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
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

    const { productId, quantity = 1, size = 'M' } = await request.json();

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const cartItem = await db.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId: payload.id as string,
          productId,
          size,
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        userId: payload.id as string,
        productId,
        quantity,
        size,
      },
      include: { product: true },
    });

    return NextResponse.json({ cartItem });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
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
    const cartItemId = searchParams.get('id');

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID required' }, { status: 400 });
    }

    await db.cartItem.delete({
      where: { id: cartItemId, userId: payload.id as string },
    });

    const cartItems = await db.cartItem.findMany({
      where: { userId: payload.id as string },
      include: { product: true },
    });

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return NextResponse.json({ cartItems, total });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
