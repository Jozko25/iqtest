'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackResultsViewed, trackInitiateCheckout } from '@/lib/pixel';

interface Results {
  sessionId: string;
  score: number;
  iqScore: number;
  percentile: number;
  email?: string;
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const stored = sessionStorage.getItem('iqResults');
    if (!stored) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(stored);
    setResults(parsed);
    trackResultsViewed(parsed.iqScore, parsed.percentile);
  }, [router]);

  const handleUnlock = async () => {
    if (!results) return;

    setIsLoading(true);
    trackInitiateCheckout(2.99);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: results.sessionId,
          email: results.email,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
    }
  };

  if (!results) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  const getCategory = (iq: number) => {
    if (iq >= 130) return 'Very Superior';
    if (iq >= 120) return 'Superior';
    if (iq >= 110) return 'High Average';
    if (iq >= 90) return 'Average';
    if (iq >= 80) return 'Low Average';
    return 'Below Average';
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-6">
      <div className="max-w-lg mx-auto w-full">
        {/* Canceled notice */}
        {canceled && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 text-center text-sm text-zinc-400">
            Payment canceled. Your results are still here.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold mb-1">Your Results</h1>
          <p className="text-sm text-zinc-500">Based on 20 questions</p>
        </div>

        {/* Score card - FREE */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-4">
          <div className="text-center">
            <div className="text-sm text-zinc-500 mb-1">IQ Score</div>
            <div className="text-6xl font-bold tracking-tight mb-2">{results.iqScore}</div>
            <div className="text-sm text-zinc-400">{getCategory(results.iqScore)}</div>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <div className="text-sm text-zinc-500 mb-1">Percentile</div>
            <div className="text-2xl font-semibold">{results.percentile}%</div>
            <div className="text-xs text-zinc-600 mt-1">
              You scored higher than {results.percentile}% of test takers
            </div>
          </div>
        </div>

        {/* Locked sections */}
        <div className="space-y-3 mb-6">
          {/* Detailed breakdown */}
          <div className="bg-zinc-900 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </div>
            </div>
            <div className="opacity-40">
              <div className="text-sm font-medium mb-3">Score Breakdown</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pattern Recognition</span>
                  <span>--/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Logical Reasoning</span>
                  <span>--/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Verbal Intelligence</span>
                  <span>--/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-zinc-900 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </div>
            </div>
            <div className="opacity-40">
              <div className="text-sm font-medium mb-3">Population Comparison</div>
              <div className="h-8 bg-zinc-800 rounded-full" />
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-zinc-900 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </div>
            </div>
            <div className="opacity-40">
              <div className="text-sm font-medium">Shareable Certificate</div>
              <div className="text-xs text-zinc-600">Download and share your results</div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-center mb-4">
            <div className="text-base font-medium mb-1">Unlock Full Report</div>
            <div className="text-sm text-zinc-500">
              Detailed breakdown, insights, and certificate
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl font-bold">$2.99</span>
            <span className="text-zinc-600 line-through text-sm">$9.99</span>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl btn-press hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              </span>
            ) : (
              'Unlock Now'
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant access
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
