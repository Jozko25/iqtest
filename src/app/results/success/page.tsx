'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackPurchase } from '@/lib/pixel';
import { questions, getQuestionTypeLabel, QuestionType } from '@/lib/questions';
import confetti from 'canvas-confetti';
import Footer from '@/components/Footer';

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

interface DifficultyStats {
  easy: { correct: number; total: number };
  medium: { correct: number; total: number };
  hard: { correct: number; total: number };
}

// Insights for each cognitive category
const categoryInsights: Record<string, { strong: string; weak: string; tip: string }> = {
  pattern: {
    strong: "You excel at identifying patterns and sequences. This skill is linked to fluid intelligence and predicts success in fields like data science, music, and strategic planning.",
    weak: "Pattern recognition can be improved through puzzles, number sequences, and observing trends in everyday life.",
    tip: "Try Sudoku or sequence games to strengthen this ability."
  },
  logic: {
    strong: "Your logical reasoning is impressive. This indicates strong analytical thinking, valuable in law, programming, and scientific research.",
    weak: "Logical reasoning improves with practice in structured problem-solving and learning formal logic principles.",
    tip: "Practice syllogisms and 'if-then' reasoning exercises."
  },
  verbal: {
    strong: "You have excellent verbal intelligence. This correlates with communication skills, reading comprehension, and vocabulary mastery.",
    weak: "Verbal skills grow through reading diverse materials and learning new words daily.",
    tip: "Read for 20 minutes daily across different genres."
  },
  math: {
    strong: "Your mathematical ability is notable. This involves numerical reasoning and is essential for finance, engineering, and economics.",
    weak: "Mathematical thinking improves with regular practice and understanding underlying concepts.",
    tip: "Practice mental math and word problems regularly."
  },
  spatial: {
    strong: "You have strong spatial awareness. This is crucial for architecture, surgery, art, and navigation.",
    weak: "Spatial skills can be developed through 3D puzzles, building activities, and mental rotation exercises.",
    tip: "Try building models or playing spatial puzzle games."
  },
  memory: {
    strong: "Your working memory is excellent. This underlies learning ability, focus, and complex reasoning.",
    weak: "Memory improves with techniques like chunking, association, and regular mental challenges.",
    tip: "Use memory palace techniques and practice recall exercises."
  },
  visual: {
    strong: "You have strong visual processing abilities. This relates to artistic perception and visual learning.",
    weak: "Visual processing improves through art, observation exercises, and visual puzzles.",
    tip: "Practice sketching what you observe around you."
  }
};

// IQ score descriptions and facts
function getScoreInsights(iq: number) {
  if (iq >= 130) return {
    rarity: "2.1%",
    description: "Very Superior Intelligence",
    fact: "Scores like yours are found in research scientists, successful entrepreneurs, and thought leaders.",
    careers: ["Research Scientist", "Surgeon", "Software Architect", "Executive Leadership"],
    famousRange: "Einstein, Hawking, and other renowned thinkers scored in similar ranges."
  };
  if (iq >= 120) return {
    rarity: "6.4%",
    description: "Superior Intelligence",
    fact: "This level of cognitive ability is common among graduate-level professionals.",
    careers: ["Engineer", "Physician", "Attorney", "Data Scientist"],
    famousRange: "Many successful professionals and academics score in this range."
  };
  if (iq >= 110) return {
    rarity: "16%",
    description: "High Average Intelligence",
    fact: "You process information faster than most people you encounter daily.",
    careers: ["Manager", "Accountant", "Teacher", "Analyst"],
    famousRange: "This is a common range for college-educated professionals."
  };
  if (iq >= 90) return {
    rarity: "50%",
    description: "Average Intelligence",
    fact: "Average IQ encompasses a wide range of successful people across all fields.",
    careers: ["Various professional roles", "Skilled trades", "Business ownership"],
    famousRange: "Many successful people across all walks of life score in this range."
  };
  return {
    rarity: "84%+",
    description: "Below Average",
    fact: "IQ is just one measure - emotional intelligence, creativity, and persistence matter too.",
    careers: ["Various roles based on interests and skills"],
    famousRange: "Success comes from many forms of intelligence working together."
  };
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Results | null>(null);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [difficultyStats, setDifficultyStats] = useState<DifficultyStats | null>(null);
  const [speedStats, setSpeedStats] = useState<{ fast: number; medium: number; slow: number; avgTime: number } | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [animatedIQ, setAnimatedIQ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const stripeSessionId = searchParams.get('session_id');

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#d4d4d8', '#a1a1aa', '#71717a', '#ffffff'];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());

    setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors });
    }, 300);
  }, []);

  const processResults = useCallback((data: Results) => {
    setResults(data);
    trackPurchase(2.99);

    setTimeout(() => {
      setShowScore(true);
      fireConfetti();

      const targetIQ = data.iqScore;
      const duration = 1500;
      const startTime = Date.now();
      const startIQ = Math.max(70, targetIQ - 40);

      const animateNumber = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedIQ(Math.round(startIQ + (targetIQ - startIQ) * easeOut));
        if (progress < 1) requestAnimationFrame(animateNumber);
      };
      animateNumber();
    }, 500);

    const categories: Record<string, { correct: number; total: number }> = {};
    const difficulty: DifficultyStats = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };
    let fastAnswers = 0;
    let mediumAnswers = 0;
    let slowAnswers = 0;
    let totalTime = 0;

    if (data.answers && Array.isArray(data.answers)) {
      data.answers.forEach((answer) => {
        const question = questions.find((q) => q.id === answer.questionId);
        if (question) {
          // Category scores
          if (!categories[question.type]) {
            categories[question.type] = { correct: 0, total: 0 };
          }
          categories[question.type].total++;
          if (answer.correct) categories[question.type].correct++;

          // Difficulty analysis
          if (question.difficulty <= 2) {
            difficulty.easy.total++;
            if (answer.correct) difficulty.easy.correct++;
          } else if (question.difficulty <= 3) {
            difficulty.medium.total++;
            if (answer.correct) difficulty.medium.correct++;
          } else {
            difficulty.hard.total++;
            if (answer.correct) difficulty.hard.correct++;
          }

          // Speed analysis
          const timeSpent = answer.timeSpent || 0;
          totalTime += timeSpent;
          const timeRatio = timeSpent / question.timeLimit;
          if (timeRatio < 0.4) fastAnswers++;
          else if (timeRatio < 0.7) mediumAnswers++;
          else slowAnswers++;
        }
      });
    }

    setDifficultyStats(difficulty);
    setSpeedStats({
      fast: fastAnswers,
      medium: mediumAnswers,
      slow: slowAnswers,
      avgTime: data.answers?.length ? Math.round(totalTime / data.answers.length) : 0
    });

    const scores: CategoryScore[] = Object.entries(categories).map(([type, data]) => ({
      type,
      label: getQuestionTypeLabel(type as QuestionType),
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    scores.sort((a, b) => b.percentage - a.percentage);
    setCategoryScores(scores);
    setIsLoading(false);
  }, [fireConfetti]);

  useEffect(() => {
    const loadResults = async () => {
      // First try session storage
      const stored = sessionStorage.getItem('iqResults');
      if (stored) {
        try {
          const parsed: Results = JSON.parse(stored);
          if (parsed.iqScore && parsed.percentile) {
            processResults(parsed);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored results:', e);
        }
      }

      // If no session storage, try to fetch from database using Stripe session ID
      if (stripeSessionId) {
        try {
          const res = await fetch(`/api/session-by-stripe?stripe_session_id=${stripeSessionId}`);
          if (res.ok) {
            const data = await res.json();
            // Save to session storage for future use
            sessionStorage.setItem('iqResults', JSON.stringify(data));
            processResults(data);
            return;
          }
        } catch (e) {
          console.error('Error fetching session from Stripe:', e);
        }
      }

      // If all else fails, redirect to home
      router.push('/');
    };

    loadResults();
  }, [router, stripeSessionId, processResults]);

  if (isLoading || !results) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Loading your report...</p>
        </div>
      </main>
    );
  }

  const getCategory = (iq: number) => {
    if (iq >= 130) return { label: 'Very Superior' };
    if (iq >= 120) return { label: 'Superior' };
    if (iq >= 110) return { label: 'High Average' };
    if (iq >= 90) return { label: 'Average' };
    if (iq >= 80) return { label: 'Low Average' };
    return { label: 'Below Average' };
  };

  const category = getCategory(results.iqScore);
  const strongest = categoryScores[0];
  const weakest = categoryScores[categoryScores.length - 1];
  const scoreInsights = getScoreInsights(results.iqScore);

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b] px-4 py-6 safe-bottom">
      {/* Brand header */}
      <div className="pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <img src="/logo.png" alt="IQScore" className="w-8 h-8" width={32} height={32} />
          <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full space-y-4">
        {/* Score Card */}
        <div className={`transition-all duration-700 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-2xl p-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Premium Report Unlocked
              </div>

              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Your IQ Score</p>
              <div className="text-8xl font-bold tracking-tighter text-white mb-3">
                {animatedIQ}
              </div>

              <span className="inline-block px-4 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-300">
                {category.label}
              </span>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-white">{results.percentile}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Percentile</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">Top {100 - results.percentile}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Of Test Takers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">{scoreInsights.rarity}</div>
                    <div className="text-xs text-zinc-500 mt-1">Population</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Insight Card */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-100 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200 mb-1">What This Means</p>
              <p className="text-sm text-zinc-500 leading-relaxed">{scoreInsights.fact}</p>
            </div>
          </div>
        </div>

        {/* Cognitive Profile with Expandable Insights */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-200 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Cognitive Profile</span>
            <span className="text-xs text-zinc-600">{results.score}/{questions.length} correct</span>
          </div>
          <div className="space-y-4">
            {categoryScores.map((cat, index) => {
              const insight = categoryInsights[cat.type];
              const isExpanded = expandedSection === cat.type;
              const isStrong = cat.percentage >= 70;

              return (
                <div key={cat.type}>
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : cat.type)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-400 flex items-center gap-2">
                        {cat.label}
                        <svg className={`w-3 h-3 text-zinc-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                      <span className={`${cat.percentage >= 80 ? 'text-emerald-400' : cat.percentage >= 60 ? 'text-zinc-400' : 'text-amber-400'}`}>
                        {cat.correct}/{cat.total} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${cat.percentage >= 80 ? 'bg-emerald-500' : cat.percentage >= 60 ? 'bg-zinc-500' : 'bg-amber-500'}`}
                        style={{
                          width: showScore ? `${cat.percentage}%` : '0%',
                          transitionDelay: `${400 + index * 100}ms`
                        }}
                      />
                    </div>
                  </button>

                  {isExpanded && insight && (
                    <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                        {isStrong ? insight.strong : insight.weak}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                        {insight.tip}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        {strongest && weakest && (
          <div className={`grid grid-cols-2 gap-3 transition-all duration-700 delay-300 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-emerald-500/10 to-zinc-900 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <p className="text-xs text-emerald-400">Top Strength</p>
              </div>
              <p className="text-sm font-medium text-zinc-200">{strongest.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{strongest.percentage}%</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-zinc-900 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-amber-400">Growth Area</p>
              </div>
              <p className="text-sm font-medium text-zinc-200">{weakest.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{weakest.percentage}%</p>
            </div>
          </div>
        )}

        {/* Difficulty Performance */}
        {difficultyStats && (
          <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-400 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-sm font-medium text-zinc-300 mb-4">Performance by Difficulty</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Easy', data: difficultyStats.easy, color: 'emerald' },
                { label: 'Medium', data: difficultyStats.medium, color: 'yellow' },
                { label: 'Hard', data: difficultyStats.hard, color: 'red' },
              ].map(({ label, data, color }) => (
                <div key={label} className="text-center">
                  <div className={`text-xl font-bold ${data.total > 0 ? (data.correct / data.total >= 0.7 ? 'text-emerald-400' : data.correct / data.total >= 0.4 ? 'text-zinc-300' : 'text-red-400') : 'text-zinc-600'}`}>
                    {data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0}%
                  </div>
                  <div className="text-xs text-zinc-500">{label}</div>
                  <div className="text-[10px] text-zinc-600">{data.correct}/{data.total}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 text-center">
                {difficultyStats.hard.correct >= difficultyStats.hard.total * 0.6
                  ? "Impressive performance on hard questions - a sign of advanced problem-solving ability."
                  : difficultyStats.easy.correct >= difficultyStats.easy.total * 0.8
                  ? "Strong foundation on fundamentals. Practice harder problems to level up."
                  : "Focus on mastering the basics first before tackling harder challenges."}
              </p>
            </div>
          </div>
        )}

        {/* Speed Analysis */}
        {speedStats && (
          <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-500 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-sm font-medium text-zinc-300 mb-4">Response Speed Analysis</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${(speedStats.fast / (results.answers?.length || 1)) * 100}%` }}
                />
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000"
                  style={{ width: `${(speedStats.medium / (results.answers?.length || 1)) * 100}%` }}
                />
                <div
                  className="h-full bg-red-500 transition-all duration-1000"
                  style={{ width: `${(speedStats.slow / (results.answers?.length || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                <span className="text-zinc-400">Fast ({speedStats.fast})</span>
              </div>
              <div>
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                <span className="text-zinc-400">Medium ({speedStats.medium})</span>
              </div>
              <div>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                <span className="text-zinc-400">Careful ({speedStats.slow})</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-3">
              Average response time: <span className="text-zinc-300 font-medium">{speedStats.avgTime}s</span> per question
            </p>
          </div>
        )}

        {/* Bell Curve */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-600 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm font-medium text-zinc-300 mb-1">Population Distribution</p>
          <p className="text-xs text-zinc-500 mb-4">Where you stand among all test takers</p>
          <svg viewBox="0 0 400 100" className="w-full h-20">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(63, 63, 70, 0.5)" />
                <stop offset="100%" stopColor="rgba(63, 63, 70, 0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M 0 100 Q 50 100 100 80 Q 150 40 200 10 Q 250 40 300 80 Q 350 100 400 100"
              fill="url(#curveGradient)"
              stroke="#3f3f46"
              strokeWidth="1.5"
            />
            {/* Your position marker */}
            <line
              x1={Math.min(Math.max(((results.iqScore - 55) / 90) * 400, 10), 390)}
              y1="0"
              x2={Math.min(Math.max(((results.iqScore - 55) / 90) * 400, 10), 390)}
              y2="100"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            <circle
              cx={Math.min(Math.max(((results.iqScore - 55) / 90) * 400, 10), 390)}
              cy={(() => {
                const x = (results.iqScore - 55) / 90;
                return 100 - 90 * Math.exp(-Math.pow((x - 0.5) * 3, 2));
              })()}
              r="8"
              fill="#fff"
              stroke="#09090b"
              strokeWidth="2"
            />
          </svg>
          <div className="flex justify-between text-[10px] text-zinc-600 mt-2 px-1">
            <span>55</span><span>70</span><span>85</span><span>100</span><span>115</span><span>130</span><span>145</span>
          </div>
        </div>

        {/* Career Insights */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-700 delay-700 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <p className="text-sm font-medium text-zinc-300">Common Career Fields</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scoreInsights.careers.map((career, i) => (
              <span key={i} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400">
                {career}
              </span>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-3">{scoreInsights.famousRange}</p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-4 gap-2 transition-all duration-700 delay-800 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { label: 'Questions', value: String(questions.length) },
            { label: 'Correct', value: (results.score ?? 0).toString() },
            { label: 'Accuracy', value: `${Math.round(((results.score ?? 0) / questions.length) * 100)}%` },
            { label: 'Avg Time', value: results.answers?.length ? `${Math.round(results.answers.reduce((acc, a) => acc + (a.timeSpent || 0), 0) / results.answers.length)}s` : '-' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-base font-semibold text-white">{stat.value}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Certificate */}
        <div className={`bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center transition-all duration-700 delay-900 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block mb-4 p-3 bg-zinc-800/50 rounded-full">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4">Certificate of Cognitive Assessment</p>
          <p className="text-xs text-zinc-500 mb-1">This certifies that</p>
          <p className="text-lg font-medium text-white mb-4">{results.email || 'Anonymous'}</p>
          <p className="text-xs text-zinc-500 mb-2">has demonstrated cognitive ability with a score of</p>
          <p className="text-5xl font-bold text-white mb-2">{results.iqScore}</p>
          <span className="inline-block px-4 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-300 mb-4">
            {category.label}
          </span>
          <p className="text-xs text-zinc-500 mb-4">Ranking in the top {100 - results.percentile}% of all test takers</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600">
            <span>IQScore.app</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* ORDER BUMP - PDF Certificate Upsell */}
        <div className={`bg-gradient-to-r from-indigo-500/10 via-zinc-900 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5 transition-all duration-700 delay-950 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">High-Resolution PDF Certificate</p>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Popular</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Print-ready 300 DPI certificate with holographic seal. Perfect for framing or LinkedIn.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">$1.99</span>
                  <span className="text-xs text-zinc-600 line-through">$4.99</span>
                </div>
                <button
                  onClick={() => {
                    // For now, show coming soon - this would link to a Stripe payment
                    alert('PDF Certificate feature coming soon! Your results have been saved.');
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Share */}
        <div className={`flex gap-3 transition-all duration-700 delay-1000 ${showScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={() => {
              const text = `I scored ${results.iqScore} on an IQ test — top ${100 - results.percentile}%! Take the test: iqscore.app`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm text-zinc-300 transition-colors border border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </button>
          <button
            onClick={() => {
              const text = `I scored ${results.iqScore} on an IQ test!`;
              window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm text-zinc-300 transition-colors border border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Share
          </button>
        </div>

        <button
          onClick={() => {
            sessionStorage.removeItem('iqResults');
            router.push('/');
          }}
          className="w-full py-3 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Take the test again
        </button>

        <Footer />
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
