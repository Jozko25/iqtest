'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackViewContent } from '@/lib/pixel';
import { questions } from '@/lib/questions';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentScores, setRecentScores] = useState<{ score: number; time: string; country: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);

  useEffect(() => {
    trackViewContent('Landing Page', 'IQ Test');
    setActiveUsers(Math.floor(Math.random() * 62) + 127);

    const scores = [112, 118, 124, 108, 135, 121, 116, 128, 109, 131, 119, 126];
    const times = ['just now', '1 min ago', '2 min ago', '3 min ago'];
    const countries = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹'];

    const generated = Array.from({ length: 4 }, () => ({
      score: scores[Math.floor(Math.random() * scores.length)],
      time: times[Math.floor(Math.random() * times.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
    }));
    setRecentScores(generated);

    requestAnimationFrame(() => {
      setMounted(true);
    });

    const interval = setInterval(() => {
      setCurrentNotification(prev => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    router.push('/test');
  };

  const currentScore = recentScores[currentNotification];

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b]">
      <header className="px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className={`flex items-center gap-2 ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
            <div className="w-16 h-16 rounded flex items-center justify-center bg-transparent">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-14 h-14"
                width={52}
                height={52}
              />
            </div>
            <span className="font-medium text-zinc-200 text-sm">IQ Score</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs text-zinc-500 ${mounted ? 'animate-reveal animation-delay-100' : 'opacity-0'}`}>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-subtle-pulse"></span>
            {activeUsers} online
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-4 pb-8">
        <div className="max-w-md mx-auto w-full">
          <div className={`text-center mb-8 ${mounted ? 'animate-reveal-up animation-delay-100' : 'opacity-0'}`}>
            <h1 className="text-3xl font-semibold leading-snug tracking-tight text-white mb-3">
              Cognitive score,<br />
              measured in minutes.
            </h1>
            <p className="text-zinc-500 text-base">
              Complete a focused assessment and get your calibrated IQ estimate.
            </p>
          </div>

          {currentScore && (
            <div className={`mb-6 ${mounted ? 'animate-scale-reveal animation-delay-200' : 'opacity-0'}`}>
              <div
                key={currentNotification}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg animate-slideInNotification"
              >
                <span className="text-lg">{currentScore.country}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm text-zinc-300">
                    Scored <span className="text-white font-medium">{currentScore.score}</span>
                  </p>
                  <p className="text-xs text-zinc-600">{currentScore.time}</p>
                </div>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-3 gap-2 mb-6 ${mounted ? 'animate-scale-reveal animation-delay-300' : 'opacity-0'}`}>
            {[
              { value: String(questions.length), label: 'Questions' },
              { value: '5-7 min', label: 'Duration' },
              { value: 'Free', label: 'To start' },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                <div className="text-base font-semibold text-white">{item.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div className={`${mounted ? 'animate-reveal-up animation-delay-400' : 'opacity-0'}`}>
            <button
              onClick={handleStart}
              className="w-full bg-white text-black font-semibold py-4 rounded-lg text-base transition-all active:scale-[0.98] hover:bg-zinc-100 mb-3"
            >
              Start Assessment
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
              <span>No signup</span>
              <span className="text-zinc-800">·</span>
              <span>Instant results</span>
              <span className="text-zinc-800">·</span>
              <span>Data-driven</span>
            </div>
          </div>

          <div className={`mt-8 ${mounted ? 'animate-reveal animation-delay-500' : 'opacity-0'}`}>
            <p className="mb-3 text-center text-xs text-zinc-600 uppercase tracking-wider">Areas tested</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Logic', 'Pattern', 'Memory', 'Verbal', 'Spatial'].map((name) => (
                <span key={name} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social proof with real faces */}
      <div className={`px-4 pb-4 ${mounted ? 'animate-reveal animation-delay-500' : 'opacity-0'}`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="" className="w-8 h-8 rounded-full border-2 border-[#09090b] object-cover" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" alt="" className="w-8 h-8 rounded-full border-2 border-[#09090b] object-cover" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces" alt="" className="w-8 h-8 rounded-full border-2 border-[#09090b] object-cover" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="" className="w-8 h-8 rounded-full border-2 border-[#09090b] object-cover" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces" alt="" className="w-8 h-8 rounded-full border-2 border-[#09090b] object-cover" />
            </div>
            <p className="ml-3 text-sm text-zinc-400">
              <span className="text-white font-medium">2,847</span> took the test today
            </p>
          </div>
        </div>
      </div>

      <div className={`px-4 pb-6 safe-bottom ${mounted ? 'animate-reveal animation-delay-600' : 'opacity-0'}`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-6 mb-3">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">2.8M+</p>
              <p className="text-xs text-zinc-600">Tests taken</p>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="text-center">
              <p className="text-lg font-semibold text-white">4.8</p>
              <p className="text-xs text-zinc-600">Rating</p>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="text-center">
              <p className="text-lg font-semibold text-white">97%</p>
              <p className="text-xs text-zinc-600">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
