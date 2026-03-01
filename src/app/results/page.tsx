'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackResultsViewed, trackInitiateCheckout } from '@/lib/pixel';
import { questions } from '@/lib/questions';
import Footer from '@/components/Footer';

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
  const [showContent, setShowContent] = useState(false);
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    // Check for session param first (from email link)
    const sessionId = searchParams.get('session');
    if (sessionId) {
      // Redirect to reveal page if coming from email link
      router.replace(`/results/reveal?session=${sessionId}`);
      return;
    }

    const stored = sessionStorage.getItem('iqResults');
    if (!stored) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(stored);
    setResults(parsed);
    trackResultsViewed(parsed.iqScore, parsed.percentile);

    setTimeout(() => setShowContent(true), 100);
  }, [router, searchParams]);

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
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </main>
    );
  }

  const getCategory = (iq: number) => {
    if (iq >= 130) return { label: 'Exceptional' };
    if (iq >= 120) return { label: 'Superior' };
    if (iq >= 110) return { label: 'Above Average' };
    if (iq >= 90) return { label: 'Average' };
    return { label: 'Below Average' };
  };

  const category = getCategory(results.iqScore);

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b] px-4 py-6 safe-bottom">
      {/* Brand header */}
      <div className="pb-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src="/logo.png" alt="IQScore" className="w-8 h-8" width={32} height={32} />
          <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full flex-1">
        {canceled && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 text-center">
            <p className="text-zinc-400 text-sm">Payment canceled. Your results are still here.</p>
          </div>
        )}

        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <p className="mb-1 text-xs text-zinc-500 uppercase tracking-wider">Your IQ Score</p>
            <div className="text-7xl font-bold text-white tracking-tighter mb-2">{results.iqScore}</div>
            <span className="inline-block px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300">
              {category.label}
            </span>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{results.percentile}%</p>
                  <p className="text-zinc-500 text-xs">Percentile</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">Top {100 - results.percentile}%</p>
                  <p className="text-zinc-500 text-xs">Of all test takers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mb-4 transition-all duration-500 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="mb-3 px-1 text-sm text-zinc-500">Your full report includes:</p>

          <div className="space-y-2">
            {[
              { title: 'Detailed Score Breakdown', desc: 'Performance in each category' },
              { title: 'Cognitive Strengths', desc: 'Your strongest mental abilities' },
              { title: 'Growth Areas', desc: 'Where to improve' },
              { title: 'Shareable Certificate', desc: 'Share or keep private' },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 flex items-center gap-3 opacity-50">
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{item.title}</p>
                  <p className="text-xs text-zinc-600">{item.desc}</p>
                </div>
                <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-gradient-to-b from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-xl p-6 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Session urgency */}
          <div className="flex justify-center mb-4">
            <span className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              Discount available during this session
            </span>
          </div>

          {/* Value anchoring */}
          <div className="text-center mb-4">
            <p className="text-xs text-zinc-500 mb-2">Full Cognitive Evaluation</p>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-zinc-600 line-through text-sm">$29</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">value</span>
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-xs text-zinc-500">Today:</span>
              <span className="text-4xl font-bold text-white">$2.99</span>
            </div>
            <p className="mt-2 text-xs text-emerald-400/80">You save $26.01 (90% off)</p>
          </div>

          {/* What's included summary */}
          <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">Score breakdown</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">Cognitive strengths</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">Growth areas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">Certificate</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="mb-3 w-full rounded-xl bg-white py-4 text-base font-semibold text-black transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              </span>
            ) : (
              'Unlock Full Report'
            )}
          </button>

          {/* Risk reversal */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mb-3">
            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>One-time payment</span>
            <span className="text-zinc-700">·</span>
            <span>Instant access</span>
            <span className="text-zinc-700">·</span>
            <span>7-day guarantee</span>
          </div>

          <p className="text-center text-[10px] text-zinc-600">
            Secure checkout powered by Stripe
          </p>
        </div>

        <div className={`mt-4 text-center transition-all duration-500 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-zinc-700 text-xs">
            Based on {questions.length} questions · Thousands of daily users
          </p>
        </div>

        <Footer />
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
