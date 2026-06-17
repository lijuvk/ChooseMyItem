import { getDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

type Session = {
  id: string;
  tableId: string | null;
  answers: Record<string, string>;
  suggestions: Array<{ name: string; emoji: string; reason: string }>;
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

async function getSessions(): Promise<Session[]> {
  const snap = await getDb()
    .collection('sessions')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      tableId: d.tableId ?? null,
      answers: d.answers ?? {},
      suggestions: d.suggestions ?? [],
      rating: d.rating ?? null,
      comment: d.comment ?? null,
      createdAt:
        d.createdAt instanceof Timestamp
          ? d.createdAt.toDate().toISOString()
          : String(d.createdAt),
    };
  });
}

function fmt(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

function stars(n: number) {
  return '⭐'.repeat(n) + '☆'.repeat(5 - n);
}

export default async function DashboardPage() {
  const sessions = await getSessions();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = sessions.filter((s) => new Date(s.createdAt) >= todayStart).length;

  const rated = sessions.filter((s) => s.rating != null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length).toFixed(1)
      : '—';

  const itemCount: Record<string, number> = {};
  sessions.forEach((s) =>
    s.suggestions?.forEach((sg) => {
      itemCount[sg.name] = (itemCount[sg.name] ?? 0) + 1;
    })
  );
  const topItems = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-400 text-sm">Last {sessions.length} sessions</p>
        </div>
        <a
          href="/api/dashboard-logout"
          className="text-sm text-stone-400 hover:text-stone-600 underline"
        >
          Logout
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Today', value: todayCount, emoji: '📅' },
          { label: 'Total', value: sessions.length, emoji: '🔢' },
          { label: 'Avg Rating', value: rated.length ? `${avgRating} ⭐` : '—', emoji: '🌟' },
          { label: 'Reviews', value: rated.length, emoji: '💬' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
          >
            <p className="text-xs text-stone-400 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-stone-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top items */}
      {topItems.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-6">
          <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
            Most Suggested
          </h2>
          <div className="flex gap-2 flex-wrap">
            {topItems.map(([name, count]) => (
              <span
                key={name}
                className="rounded-full bg-amber-100 text-amber-800 text-sm px-3 py-1"
              >
                {name}{' '}
                <span className="font-semibold">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100">
          <h2 className="font-semibold text-stone-700">Recent Sessions</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 text-center text-stone-400">
            <p className="text-4xl mb-3">☕</p>
            <p>No sessions yet — share your QR code!</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {sessions.map((s) => (
              <div key={s.id} className="px-5 py-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-stone-400">{fmt(s.createdAt)}</span>
                      {s.tableId && (
                        <span className="rounded-full bg-stone-100 text-stone-500 px-2 py-0.5">
                          Table {s.tableId}
                        </span>
                      )}
                      {s.rating != null && (
                        <span className="text-amber-500 font-medium">{stars(s.rating)}</span>
                      )}
                    </div>

                    {/* Answers */}
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.values(s.answers).map((val, i) => (
                        <span
                          key={i}
                          className="text-xs bg-stone-100 text-stone-600 rounded-full px-2 py-0.5"
                        >
                          {val}
                        </span>
                      ))}
                    </div>

                    {/* Suggestions */}
                    <div className="flex gap-1.5 flex-wrap">
                      {s.suggestions.map((sg, i) => (
                        <span
                          key={i}
                          className="text-xs bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-medium"
                        >
                          {sg.emoji} {sg.name}
                        </span>
                      ))}
                    </div>

                    {/* Comment */}
                    {s.comment && (
                      <p className="text-sm text-stone-500 italic">"{s.comment}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
