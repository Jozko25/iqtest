'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackResultsViewed, trackInitiateCheckout } from '@/lib/pixel';
import { questions } from '@/lib/questions';
import confetti from 'canvas-confetti';
import Footer from '@/components/Footer';

interface SessionData {
  id: string;
  score: number;
  iq_score: number;
  percentile: number;
  email: string;
  answers: string;
}

function RevealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [revealStage, setRevealStage] = useState<'loading' | 'preparing' | 'counting' | 'revealed'>('loading');
  const [displayedScore, setDisplayedScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session');

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#d4d4d8', '#a1a1aa', '#71717a', '#ffffff']
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#d4d4d8', '#a1a1aa', '#71717a', '#ffffff']
    });
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid link. Please use the link from your email.');
      setIsLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session?sessionId=${sessionId}`);
        if (!res.ok) {
          setError('Session not found. Please take the test again.');
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        setSessionData(data);
        setIsLoading(false);

        // Store in session storage for checkout flow
        const answers = data.answers ? JSON.parse(data.answers) : [];
        const safeIqScore = data.iq_score || 100;
        const safePercentile = data.percentile || 50;

        sessionStorage.setItem('iqResults', JSON.stringify({
          sessionId: data.id,
          score: data.score || 0,
          iqScore: safeIqScore,
          percentile: safePercentile,
          email: data.email,
          answers,
        }));

        trackResultsViewed(safeIqScore, safePercentile);

        // Smooth reveal animation sequence
        setTimeout(() => {
          setRevealStage('preparing');
        }, 400);

        setTimeout(() => {
          setRevealStage('counting');

          // Smooth counting animation
          const targetScore = safeIqScore;
          const duration = 2000;
          const startTime = Date.now();
          const startScore = Math.max(60, targetScore - 50);

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentScore = Math.round(startScore + (targetScore - startScore) * easeOutQuart);

            setDisplayedScore(currentScore);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Final reveal with confetti
              setTimeout(() => {
                setRevealStage('revealed');
                fireConfetti();
              }, 200);
            }
          };

          requestAnimationFrame(animate);
        }, 1200);
      } catch {
        setError('Failed to load results. Please try again.');
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, fireConfetti]);

  const handleUnlock = async () => {
    if (!sessionData) return;

    setCheckoutLoading(true);
    trackInitiateCheckout(2.99);

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.id,
          email: sessionData.email,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setCheckoutLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading your results...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-3">{error}</h1>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-100 transition-colors"
          >
            Take the Test
          </button>
        </div>
      </main>
    );
  }

  if (!sessionData) return null;

  const getCategory = (iq: number) => {
    if (iq >= 130) return { label: 'Exceptional' };
    if (iq >= 120) return { label: 'Superior' };
    if (iq >= 110) return { label: 'Above Average' };
    if (iq >= 90) return { label: 'Average' };
    return { label: 'Below Average' };
  };

  // Ensure we have valid numbers
  const iqScore = sessionData.iq_score || 100;
  const percentile = sessionData.percentile || 50;
  const category = getCategory(iqScore);

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
        {/* Main Score Card */}
        <div className={`relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900/90 border border-zinc-800 rounded-2xl p-8 mb-4 transition-all duration-700 ${revealStage !== 'loading' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Subtle animated background glow */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${revealStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center">
            {/* Pre-reveal state */}
            {revealStage === 'preparing' && (
              <div className="animate-pulse">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Calculating your score</p>
                <div className="flex justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Counting & Revealed states */}
            {(revealStage === 'counting' || revealStage === 'revealed') && (
              <>
                <p className={`text-xs text-zinc-500 uppercase tracking-widest mb-4 transition-all duration-500 ${revealStage === 'revealed' ? 'opacity-100' : 'opacity-60'}`}>
                  Your IQ Score
                </p>

                {/* The Score */}
                <div className={`relative transition-all duration-700 ${revealStage === 'revealed' ? 'scale-100' : 'scale-95'}`}>
                  <span
                    className={`text-8xl font-bold tracking-tight transition-all duration-500 ${
                      revealStage === 'revealed'
                        ? 'text-white'
                        : 'text-zinc-300'
                    }`}
                    style={{
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: revealStage === 'revealed' ? '0 0 60px rgba(255,255,255,0.15)' : 'none'
                    }}
                  >
                    {displayedScore}
                  </span>
                </div>

                {/* Category Badge - Blurred until unlocked */}
                <div className={`mt-4 transition-all duration-700 delay-300 ${revealStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-full">
                    <span className="text-sm text-zinc-400 blur-[4px] select-none">{category.label}</span>
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                {/* Main hook - Top X% */}
                <div className={`mt-8 pt-6 border-t border-zinc-800/50 transition-all duration-700 delay-500 ${revealStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <p className="text-2xl font-semibold text-white mb-1">
                    You're in the <span className="text-white">Top {100 - percentile}%</span>
                  </p>
                  <p className="text-sm text-zinc-500">of all test takers worldwide</p>
                </div>

                {/* Blurred details teaser */}
                <div className={`mt-6 grid grid-cols-2 gap-4 transition-all duration-700 delay-700 ${revealStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800/50">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-zinc-400 blur-[4px] select-none">{percentile}%</span>
                      <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-600">Exact Percentile</p>
                  </div>
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800/50">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-zinc-400 blur-[4px] select-none">{category.label}</span>
                      <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs text-zinc-600">IQ Classification</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`mb-4 transition-all duration-700 delay-200 ${revealStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="mb-3 px-1 text-sm text-zinc-500">Unlock your complete report:</p>

          <div className="space-y-2">
            {[
              { title: 'Detailed Score Breakdown', desc: 'Performance in each cognitive category', icon: '📊' },
              { title: 'Cognitive Strengths', desc: 'Your strongest mental abilities', icon: '🧠' },
              { title: 'Growth Areas', desc: 'Personalized improvement insights', icon: '📈' },
              { title: 'Shareable Certificate', desc: 'Official PDF for LinkedIn or print', icon: '🏆' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:bg-zinc-900 transition-colors"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-300">{item.title}</p>
                  <p className="text-xs text-zinc-600">{item.desc}</p>
                </div>
                <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-gradient-to-b from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-2xl p-6 transition-all duration-700 delay-300 ${revealStage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
                <span className="text-zinc-400">Exact percentile</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">IQ classification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-400">Cognitive breakdown</span>
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
            disabled={checkoutLoading}
            className="mb-3 w-full rounded-xl bg-white py-4 text-base font-semibold text-black transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50"
          >
            {checkoutLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              </span>
            ) : (
              'Unlock Complete Results'
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

        <div className={`mt-4 text-center transition-all duration-500 delay-300 ${revealStage === 'revealed' ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-zinc-700 text-xs">
            Based on {questions.length} questions · Thousands of daily users
          </p>
        </div>

        <Footer />
      </div>
    </main>
  );
}

export default function RevealPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading your results...</p>
        </div>
      </main>
    }>
      <RevealContent />
    </Suspense>
  );
}
