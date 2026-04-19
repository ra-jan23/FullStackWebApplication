import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const orders = await db.order.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { items, total, address, city, country, postalCode, phone } = await request.json();

    if (!items || !total || !address || !city || !country || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        userId: payload.userId,
        items: JSON.stringify(items),
        total,
        address,
        city,
        country,
        postalCode: postalCode || '',
        phone,
        status: 'confirmed',
      },
    });

    // Clear cart items
    await db.cartItem.deleteMany({ where: { userId: payload.userId } });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
