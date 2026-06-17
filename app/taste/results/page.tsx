'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Suggestion = { name: string; emoji: string; reason: string };
type SessionData = { sessionId: string; suggestions: Suggestion[] };

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('taste_session');
    if (!raw) { router.replace('/taste'); return; }
    setSession(JSON.parse(raw));
  }, [router]);

  async function handleSubmit() {
    if (!session) return;
    setSubmitting(true);
    await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, rating, comment }),
    });
    sessionStorage.removeItem('taste_session');
    setDone(true);
    setSubmitting(false);
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-stone-400 animate-pulse">Loading…</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="text-7xl">🎉</div>
        <h2 className="text-2xl font-bold text-stone-800">Enjoy your drink!</h2>
        <p className="text-stone-500">Thanks for sharing your thoughts. We hope it hits the spot.</p>
        <button
          onClick={() => router.push('/taste')}
          className="text-amber-600 underline text-sm"
        >
          Start over for another person
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8 space-y-6">
      <div>
        <p className="text-amber-600 font-semibold text-sm mb-1">Just for you ✨</p>
        <h1 className="text-2xl font-bold text-stone-800">We think you'll love these</h1>
      </div>

      {/* Suggestion cards */}
      <div className="space-y-4">
        {session.suggestions.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="text-lg font-semibold text-stone-800">{item.name}</h3>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">{item.reason}</p>
          </div>
        ))}
      </div>

      {/* Rating section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 space-y-4">
        <h3 className="font-semibold text-stone-700">How was your experience? <span className="text-stone-400 font-normal text-sm">(optional)</span></h3>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform active:scale-110 select-none"
            >
              {star <= (hovered || rating) ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any comments? (optional)"
          rows={3}
          className="w-full rounded-xl border border-stone-200 p-3 text-sm text-stone-700 placeholder:text-stone-300 resize-none focus:outline-none focus:border-amber-400 bg-stone-50"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-2xl bg-amber-500 py-4 text-center font-semibold text-white shadow active:bg-amber-600 disabled:opacity-50 transition-colors text-base"
        >
          {submitting ? 'Saving…' : rating ? 'Submit & enjoy! 🎉' : 'Skip & enjoy! →'}
        </button>
      </div>
    </main>
  );
}
