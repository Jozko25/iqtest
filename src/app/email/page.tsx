'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackLead } from '@/lib/pixel';
import { questions } from '@/lib/questions';
import Footer from '@/components/Footer';

const recentReveals = [
  { name: 'Michael T.', country: '🇺🇸', time: '2 min ago' },
  { name: 'Emma S.', country: '🇬🇧', time: '3 min ago' },
  { name: 'Lucas M.', country: '🇩🇪', time: '5 min ago' },
  { name: 'Sofia R.', country: '🇪🇸', time: '6 min ago' },
  { name: 'James W.', country: '🇦🇺', time: '8 min ago' },
  { name: 'Anna K.', country: '🇫🇷', time: '9 min ago' },
];

export default function EmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [iqScore, setIqScore] = useState<number>(0);
  const [percentile, setPercentile] = useState<number>(0);
  const [showContent, setShowContent] = useState(false);
  const [revealCount, setRevealCount] = useState(847);
  const [currentReveal, setCurrentReveal] = useState(0);

  useEffect(() => {
    const results = sessionStorage.getItem('iqResults');
    if (!results) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(results);
    setSessionId(parsed.sessionId);
    setIqScore(parsed.iqScore || 100);
    setPercentile(parsed.percentile || 50);

    setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Rotate recent reveals
    const revealInterval = setInterval(() => {
      setCurrentReveal(prev => (prev + 1) % recentReveals.length);
    }, 3000);

    // Increment reveal count occasionally
    const countInterval = setInterval(() => {
      setRevealCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);

    return () => {
      clearInterval(revealInterval);
      clearInterval(countInterval);
    };
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

        await fetch('/api/send-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            sessionId: parsed.sessionId,
          }),
        });
      }

      // Clear session storage so user can't see results without email link
      sessionStorage.removeItem('iqResults');

      router.push('/email/sent');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b] px-4 py-6">
      {/* Brand header */}
      <div className="pb-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src="/logo.png" alt="IQScore" className="w-8 h-8" width={32} height={32} />
          <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        <div className={`text-center mb-6 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-white">Assessment Complete</h1>
          <p className="text-zinc-500 text-sm">{questions.length} questions answered</p>
        </div>

        <div className={`bg-gradient-to-b from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-5 transition-all duration-500 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Your IQ Score</p>

            {/* Blurred score with lock overlay */}
            <div className="relative inline-block mb-4">
              <span className="text-7xl font-bold text-white blur-md select-none">{iqScore}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/90 border border-zinc-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-lg font-semibold text-white mb-1">Your IQ Score is Ready</p>
            <p className="text-sm text-zinc-500 mb-4">Enter your email to reveal your results</p>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-xl font-semibold text-white blur-sm select-none">{iqScore}</p>
                <p className="text-xs text-zinc-600">IQ Score</p>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div className="text-center">
                <p className="text-xl font-semibold text-white blur-sm select-none">Top {100 - percentile}%</p>
                <p className="text-xs text-zinc-600">Percentile</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-4 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Where should we send your results?
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-base text-white placeholder-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              autoFocus
              autoComplete="email"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            {/* Micro social proof */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex -space-x-1">
                <span className="text-sm">🇺🇸</span>
                <span className="text-sm">🇬🇧</span>
                <span className="text-sm">🇩🇪</span>
                <span className="text-sm">🇫🇷</span>
                <span className="text-sm">🇪🇸</span>
              </div>
              <p className="text-xs text-zinc-500">
                <span className="text-zinc-300 font-medium">{revealCount}</span> people revealed their score in the last hour
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-white py-4 text-base font-semibold text-black transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              </span>
            ) : (
              'Reveal My IQ Score'
            )}
          </button>

          {/* Future benefit */}
          <p className="text-center text-xs text-zinc-500">
            Get your <span className="text-zinc-300">detailed breakdown</span> + <span className="text-zinc-300">shareable certificate</span> instantly
          </p>
        </form>

        {/* Rotating recent reveals */}
        <div className={`mt-5 transition-all duration-500 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
            <div key={currentReveal} className="flex items-center justify-center gap-2 animate-fadeIn">
              <span className="text-base">{recentReveals[currentReveal].country}</span>
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-300">{recentReveals[currentReveal].name}</span> revealed their score
                <span className="text-zinc-600"> · {recentReveals[currentReveal].time}</span>
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-4 flex items-center justify-center gap-5 text-xs text-zinc-600 transition-all duration-500 delay-400 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <span className="text-zinc-800">·</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span>No spam</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
