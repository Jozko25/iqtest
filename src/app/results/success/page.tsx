'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackPurchase } from '@/lib/pixel';
import { questions, getQuestionTypeLabel } from '@/lib/questions';

interface Results {
  sessionId: string;
  score: number;
  iqScore: number;
  percentile: number;
  email?: string;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    correct: boolean;
    timeSpent: number;
  }>;
}

interface CategoryScore {
  type: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Results | null>(null);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stripeSessionId = searchParams.get('session_id');

  useEffect(() => {
    const stored = sessionStorage.getItem('iqResults');
    if (!stored) {
      router.push('/');
      return;
    }

    const parsed: Results = JSON.parse(stored);
    setResults(parsed);
    trackPurchase(2.99);

    const categories: Record<string, { correct: number; total: number }> = {};

    parsed.answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question) {
        if (!categories[question.type]) {
          categories[question.type] = { correct: 0, total: 0 };
        }
        categories[question.type].total++;
        if (answer.correct) {
          categories[question.type].correct++;
        }
      }
    });

    const scores: CategoryScore[] = Object.entries(categories).map(([type, data]) => ({
      type,
      label: getQuestionTypeLabel(type as 'pattern' | 'logic' | 'verbal' | 'math' | 'spatial'),
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    scores.sort((a, b) => b.percentage - a.percentage);
    setCategoryScores(scores);
  }, [router, searchParams]);

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

  const strongest = categoryScores[0];
  const weakest = categoryScores[categoryScores.length - 1];

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 safe-bottom">
      <div className="max-w-lg mx-auto w-full space-y-4">
        {/* Success header */}
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Full Report Unlocked</h1>
        </div>

        {/* Score card */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-sm text-zinc-500 mb-1">IQ Score</div>
            <div className="text-6xl font-bold tracking-tight mb-2">{results.iqScore}</div>
            <div className="text-sm text-zinc-400">{getCategory(results.iqScore)}</div>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <div className="text-sm text-zinc-500 mb-1">Percentile</div>
            <div className="text-2xl font-semibold">{results.percentile}%</div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="text-sm font-medium mb-4">Score Breakdown</div>
          <div className="space-y-3">
            {categoryScores.map((cat) => (
              <div key={cat.type}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-400">{cat.label}</span>
                  <span>{cat.correct}/{cat.total}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.percentage >= 80 ? 'bg-green-500' :
                      cat.percentage >= 60 ? 'bg-blue-500' :
                      cat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {strongest && weakest && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-green-500 mb-1">Strongest</div>
              <div className="text-sm font-medium">{strongest.label}</div>
              <div className="text-xs text-zinc-500">{strongest.percentage}%</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="text-xs text-orange-500 mb-1">Needs Work</div>
              <div className="text-sm font-medium">{weakest.label}</div>
              <div className="text-xs text-zinc-500">{weakest.percentage}%</div>
            </div>
          </div>
        )}

        {/* Distribution */}
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="text-sm font-medium mb-3">Population Distribution</div>
          <div className="relative h-10 bg-zinc-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-[15%] bg-red-500/20" />
              <div className="w-[20%] bg-orange-500/20" />
              <div className="w-[30%] bg-green-500/20" />
              <div className="w-[20%] bg-blue-500/20" />
              <div className="w-[15%] bg-purple-500/20" />
            </div>
            <div
              className="absolute top-1 bottom-1 w-0.5 bg-white rounded-full"
              style={{ left: `${Math.min(Math.max(((results.iqScore - 55) / 90) * 100, 2), 98)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5">
            <span>55</span>
            <span>85</span>
            <span>100</span>
            <span>115</span>
            <span>145</span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="text-sm font-medium mb-3">Test Statistics</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500">Questions</div>
              <div>{results.answers.length}/20</div>
            </div>
            <div>
              <div className="text-zinc-500">Correct</div>
              <div>{results.score}/20</div>
            </div>
            <div>
              <div className="text-zinc-500">Accuracy</div>
              <div>{Math.round((results.score / 20) * 100)}%</div>
            </div>
            <div>
              <div className="text-zinc-500">Avg Time</div>
              <div>{Math.round(results.answers.reduce((acc, a) => acc + a.timeSpent, 0) / results.answers.length)}s</div>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-4">Certificate</div>
          <div className="text-xs text-zinc-500 mb-1">This certifies that</div>
          <div className="font-medium mb-3">{results.email || 'Anonymous'}</div>
          <div className="text-xs text-zinc-500 mb-1">achieved an IQ score of</div>
          <div className="text-4xl font-bold mb-1">{results.iqScore}</div>
          <div className="text-sm text-zinc-400 mb-4">{getCategory(results.iqScore)}</div>
          <div className="text-[10px] text-zinc-600">
            IQ Score • {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Share */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              const text = `I scored ${results.iqScore} on an IQ test - top ${100 - results.percentile}%`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-3 bg-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Share on X
          </button>
          <button
            onClick={() => {
              const text = `I scored ${results.iqScore} on an IQ test!`;
              window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-3 bg-zinc-900 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Share on Facebook
          </button>
        </div>

        {/* Retake */}
        <button
          onClick={() => {
            sessionStorage.removeItem('iqResults');
            router.push('/');
          }}
          className="w-full py-3 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Take the test again
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
