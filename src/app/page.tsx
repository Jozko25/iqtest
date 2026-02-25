'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackViewContent } from '@/lib/pixel';

export default function Home() {
  const router = useRouter();
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    trackViewContent('Landing Page', 'IQ Test');
    // Simulate active users (47-89 range)
    setActiveUsers(Math.floor(Math.random() * 42) + 47);
  }, []);

  const handleStart = () => {
    router.push('/test');
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">IQ Score</div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {activeUsers} testing now
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-8">
        <div className="max-w-lg mx-auto w-full">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-[2.5rem] leading-[1.1] font-bold tracking-tight mb-4">
              Measure your
              <br />
              cognitive ability
            </h1>
            <p className="text-zinc-400 text-lg">
              A 20-question assessment based on pattern recognition, logic, and problem solving.
            </p>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-zinc-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold mb-0.5">20</div>
              <div className="text-xs text-zinc-500">Questions</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold mb-0.5">5 min</div>
              <div className="text-xs text-zinc-500">Average</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold mb-0.5">Free</div>
              <div className="text-xs text-zinc-500">Basic result</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStart}
            className="w-full bg-white text-black font-semibold text-base py-4 rounded-xl btn-press hover:bg-zinc-100 transition-colors"
          >
            Start Test
          </button>

          {/* Trust line */}
          <p className="text-center text-zinc-600 text-sm mt-4">
            No signup required • Results in 5 minutes
          </p>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="px-4 pb-6 safe-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              2.8M+ tests taken
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
