import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, rating, comment } = await req.json();
    await db.collection('sessions').doc(sessionId).update({
      rating: rating ?? null,
      comment: comment || null,
      reviewedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/review]', err);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
