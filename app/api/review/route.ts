import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, rating, comment } = await req.json();
    const db = getDb();
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
