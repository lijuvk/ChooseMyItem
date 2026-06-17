'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  {
    id: 'flavor',
    question: 'What flavor calls to you?',
    options: [
      { value: 'fruity and refreshing', label: 'Fruity & fresh', emoji: '🍓' },
      { value: 'rich and creamy', label: 'Rich & creamy', emoji: '🍫' },
      { value: 'herbal and earthy', label: 'Herbal & earthy', emoji: '🌿' },
      { value: 'classic and familiar', label: 'Classic', emoji: '☕' },
    ],
  },
  {
    id: 'temperature',
    question: 'How do you want it served?',
    options: [
      { value: 'ice cold', label: 'Ice cold', emoji: '🧊' },
      { value: 'hot and steaming', label: 'Hot', emoji: '♨️' },
      { value: 'warm', label: 'Warm', emoji: '🌡️' },
    ],
  },
  {
    id: 'sweetness',
    question: 'How sweet?',
    options: [
      { value: 'quite sweet', label: 'Sweet please!', emoji: '🍯' },
      { value: 'lightly sweet', label: 'Just a touch', emoji: '🤏' },
      { value: 'not sweet', label: 'Not sweet', emoji: '🫙' },
    ],
  },
  {
    id: 'intensity',
    question: 'Bold or gentle?',
    options: [
      { value: 'bold and intense', label: 'Bold', emoji: '💪' },
      { value: 'balanced', label: 'Balanced', emoji: '🎯' },
      { value: 'light and delicate', label: 'Light', emoji: '🌸' },
    ],
  },
] as const;

type Answers = Record<string, string>;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [tableId, setTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTableId(sessionStorage.getItem('taste_table'));
  }, []);

  const question = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;

  async function handleSelect(value: string) {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers, tableId }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      sessionStorage.setItem('taste_session', JSON.stringify(data));
      router.push('/taste/results');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="space-y-5">
          <div className="text-6xl animate-bounce">✨</div>
          <p className="text-xl font-semibold text-stone-700">Finding your perfect match…</p>
          <p className="text-stone-400 text-sm">Claude is reading your tastes</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8">
      {/* Progress */}
      <div className="w-full bg-stone-200 rounded-full h-1.5 mb-8">
        <div
          className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div>
          <p className="text-xs text-stone-400 mb-2 font-medium tracking-wide uppercase">
            {step + 1} / {QUESTIONS.length}
          </p>
          <h2 className="text-2xl font-bold text-stone-800">{question.question}</h2>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white border-2 border-stone-100 p-5 shadow-sm active:bg-amber-50 active:border-amber-300 transition-all"
            >
              <span className="text-4xl">{opt.emoji}</span>
              <span className="text-sm font-medium text-stone-700 text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
