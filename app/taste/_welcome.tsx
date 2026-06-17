'use client';

import { useRouter } from 'next/navigation';

export default function WelcomeScreen({ tableId }: { tableId: string | null }) {
  const router = useRouter();
  const cafeName = process.env.NEXT_PUBLIC_CAFE_NAME ?? 'Welcome!';

  function handleStart() {
    if (tableId) sessionStorage.setItem('taste_table', tableId);
    else sessionStorage.removeItem('taste_table');
    router.push('/taste/quiz');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="text-8xl">☕</div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-stone-800">{cafeName}</h1>
          <p className="text-stone-500 text-lg leading-snug">
            Answer 4 quick questions and we'll find your perfect drink.
          </p>
        </div>

        {tableId && (
          <span className="inline-block text-xs rounded-full bg-amber-100 text-amber-700 px-3 py-1.5 font-medium">
            Table {tableId}
          </span>
        )}

        <button
          onClick={handleStart}
          className="w-full rounded-2xl bg-amber-500 py-4 text-lg font-semibold text-white shadow-lg active:bg-amber-600 transition-colors"
        >
          Let's go →
        </button>

        <p className="text-xs text-stone-400">Takes about 30 seconds</p>
      </div>
    </main>
  );
}
