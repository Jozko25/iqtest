'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackLead } from '@/lib/pixel';

export default function EmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [iqScore, setIqScore] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const results = sessionStorage.getItem('iqResults');
    if (!results) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(results);
    setIqScore(parsed.iqScore);
    setPercentile(parsed.percentile);
    setSessionId(parsed.sessionId);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      if (sessionId) {
        await fetch('/api/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, email }),
        });
      }

      trackLead(email);

      const results = sessionStorage.getItem('iqResults');
      if (results) {
        const parsed = JSON.parse(results);
        parsed.email = email;
        sessionStorage.setItem('iqResults', JSON.stringify(parsed));

        // Send results email
        await fetch('/api/send-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            iqScore: parsed.iqScore,
            percentile: parsed.percentile,
            sessionId: parsed.sessionId,
          }),
        });
      }

      router.push('/results');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/results');
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Success indicator */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Test Complete</h1>
          <p className="text-zinc-400">Your results are ready</p>
        </div>

        {/* Score preview (blurred) */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-8 text-center">
          <div className="text-sm text-zinc-500 mb-2">Your IQ Score</div>
          <div className="text-5xl font-bold mb-2 blur-md select-none text-zinc-300">
            {iqScore || '---'}
          </div>
          <div className="text-sm text-zinc-500">
            Top {percentile ? 100 - percentile : '--'}% of test takers
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Where should we send your results?
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              autoFocus
              autoComplete="email"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold py-4 rounded-xl btn-press hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              'See My Results'
            )}
          </button>
        </form>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="mt-4 text-zinc-600 text-sm hover:text-zinc-400 transition-colors"
        >
          Skip for now
        </button>

        {/* Privacy note */}
        <p className="text-center text-zinc-700 text-xs mt-8">
          We won&apos;t spam you. Unsubscribe anytime.
        </p>
      </div>
    </main>
  );
}
