'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  questions,
  calculateIQ,
  getEngagementMessage,
  Question,
  MultipleChoiceQuestion,
  SequenceQuestion,
  TrueFalseQuestion,
  SliderQuestion,
  OrderQuestion,
  MultiSelectQuestion,
  getQuestionTypeLabel
} from '@/lib/questions';
import { trackTestStarted, trackQuestionAnswered, trackTestCompleted, trackTimeExtended } from '@/lib/pixel';

interface Answer {
  questionId: number;
  selectedAnswer: number | number[] | boolean;
  correct: boolean;
  timeSpent: number;
}

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(questions[0].timeLimit);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [extendedThisQuestion, setExtendedThisQuestion] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [orderItems, setOrderItems] = useState<number[]>([]);
  const [multiSelectItems, setMultiSelectItems] = useState<number[]>([]);
  const [showEngagement, setShowEngagement] = useState<{ message: string; type: string } | null>(null);
  const [engagementDismissing, setEngagementDismissing] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const showProgressBar = currentIndex >= 3;

  // Initialize order items when question changes
  useEffect(() => {
    if (currentQuestion.answerType === 'order') {
      const orderQ = currentQuestion as OrderQuestion;
      setOrderItems(orderQ.items.map((_, i) => i));
    }
    if (currentQuestion.answerType === 'slider') {
      const sliderQ = currentQuestion as SliderQuestion;
      setSliderValue(Math.round((sliderQ.min + sliderQ.max) / 2));
    }
    if (currentQuestion.answerType === 'multi_select') {
      setMultiSelectItems([]);
    }
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    const createSession = async () => {
      try {
        const utm = {
          utm_source: searchParams.get('utm_source'),
          utm_medium: searchParams.get('utm_medium'),
          utm_campaign: searchParams.get('utm_campaign'),
          utm_content: searchParams.get('utm_content'),
        };

        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(utm),
        });

        const data = await res.json();
        setSessionId(data.sessionId);
        trackTestStarted();
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    createSession();
  }, [searchParams]);

  useEffect(() => {
    if (isTransitioning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 6 && !showExtendButton && !extendedThisQuestion) {
          setShowExtendButton(true);
        }
        if (prev <= 1) {
          handleAnswer(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isTransitioning, showExtendButton, extendedThisQuestion, showEngagement]);

  const handleExtendTime = () => {
    if (extendedThisQuestion) return;
    setTimeLeft((prev) => prev + 30);
    setShowExtendButton(false);
    setExtendedThisQuestion(true);
    trackTimeExtended(currentIndex + 1);
  };

  const checkAnswer = useCallback((answer: number | number[] | boolean | null): boolean => {
    if (answer === null) return false;

    switch (currentQuestion.answerType) {
      case 'multiple_choice':
      case 'sequence':
        return answer === (currentQuestion as MultipleChoiceQuestion | SequenceQuestion).correctAnswer;
      case 'true_false':
        return answer === (currentQuestion as TrueFalseQuestion).correctAnswer;
      case 'slider': {
        const sliderQ = currentQuestion as SliderQuestion;
        const numAnswer = answer as number;
        return Math.abs(numAnswer - sliderQ.correctAnswer) <= sliderQ.tolerance;
      }
      case 'order': {
        const orderQ = currentQuestion as OrderQuestion;
        const orderAnswer = answer as number[];
        return JSON.stringify(orderAnswer) === JSON.stringify(orderQ.correctOrder);
      }
      case 'multi_select': {
        const multiQ = currentQuestion as MultiSelectQuestion;
        const selected = [...(answer as number[])].sort((a, b) => a - b);
        const correct = [...multiQ.correctAnswers].sort((a, b) => a - b);
        return JSON.stringify(selected) === JSON.stringify(correct);
      }
      default:
        return false;
    }
  }, [currentQuestion]);

  const handleAnswer = useCallback(async (answer: number | number[] | boolean | null, timedOut = false) => {
    if (isTransitioning || (selectedAnswer !== null && !timedOut)) return;

    const finalAnswer = timedOut ? null : answer;
    setSelectedAnswer(finalAnswer);
    setIsTransitioning(true);

    const timeSpent = ((Date.now() - startTime) / 1000);
    const correct = checkAnswer(finalAnswer);

    // Update streak
    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: finalAnswer ?? -1,
      correct,
      timeSpent,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    trackQuestionAnswered(currentIndex + 1, questions.length);

    if (sessionId) {
      try {
        await fetch('/api/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            currentQuestion: currentIndex + 1,
            answers: newAnswers,
          }),
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }

    // Check for engagement message
    const engagement = getEngagementMessage(currentIndex + 1);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        // Test complete
        const correctCount = newAnswers.filter((a) => a.correct).length;
        const { iq, percentile } = calculateIQ(correctCount, questions.length);

        trackTestCompleted(correctCount, iq);

        if (sessionId) {
          fetch('/api/session', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              score: correctCount,
              iqScore: iq,
              percentile,
              completed: true,
            }),
          });
        }

        sessionStorage.setItem('iqResults', JSON.stringify({
          sessionId,
          score: correctCount,
          iqScore: iq,
          percentile,
          answers: newAnswers,
        }));

        router.push('/processing');
      } else {
        // Show engagement as full-page step if applicable
        if (engagement) {
          setShowEngagement(engagement);
          setIsTransitioning(false);
          // Don't auto-advance - user must click continue
        } else {
          moveToNextQuestion();
        }
      }
    }, 400);

    function moveToNextQuestion() {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentIndex + 1]?.timeLimit || 30);
      setShowExtendButton(false);
      setExtendedThisQuestion(false);
      setStartTime(Date.now());
      setIsTransitioning(false);
    }
  }, [currentIndex, currentQuestion, answers, sessionId, isTransitioning, selectedAnswer, router, startTime, checkAnswer]);

  const handleOrderDrag = (fromIndex: number, toIndex: number) => {
    const newOrder = [...orderItems];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setOrderItems(newOrder);
  };

  const handleMultiSelectToggle = (index: number) => {
    if (isTransitioning) return;
    setMultiSelectItems((prev) => {
      const exists = prev.includes(index);
      if (exists) return prev.filter((item) => item !== index);

      const maxSelections = (currentQuestion as MultiSelectQuestion).maxSelections;
      if (maxSelections && prev.length >= maxSelections) {
        return prev;
      }
      return [...prev, index];
    });
  };

  const isLowTime = timeLeft <= 5;
  const timerProgress = (timeLeft / currentQuestion.timeLimit) * 100;

  const handleEngagementContinue = () => {
    setEngagementDismissing(true);
    setTimeout(() => {
      setShowEngagement(null);
      setEngagementDismissing(false);
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(questions[currentIndex + 1]?.timeLimit || 30);
      setShowExtendButton(false);
      setExtendedThisQuestion(false);
      setStartTime(Date.now());
    }, 300);
  };

  // Engagement full-page step
  const renderEngagementPage = () => {
    if (!showEngagement) return null;
    return (
      <main className="min-h-screen flex flex-col bg-[#09090b]">
        {/* Brand header */}
        <div className="px-4 pt-4 pb-2">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
            <img src="/logo.png" alt="IQScore" className="w-8 h-8" width={32} height={32} />
            <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
          </div>
        </div>

        <div className={`flex-1 flex flex-col items-center justify-center px-4 transition-all duration-300 ${engagementDismissing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <p className="text-2xl font-semibold text-white mb-3">{showEngagement.message}</p>

            <p className="text-zinc-500 text-sm mb-8">
              {currentIndex + 1} of {questions.length} questions completed
            </p>

            <div className="w-full bg-zinc-800 rounded-full h-2 mb-8">
              <div
                className="bg-zinc-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <button
              onClick={handleEngagementContinue}
              className="w-full py-4 bg-white text-black font-semibold rounded-xl text-base active:scale-[0.98] transition-transform"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    );
  };

  // Render different question types
  const renderQuestionContent = () => {
    switch (currentQuestion.answerType) {
      case 'multiple_choice': {
        const q = currentQuestion as MultipleChoiceQuestion;
        return (
          <div className="space-y-3">
            {q.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === q.correctAnswer;

              let bgClass = 'bg-zinc-900/80 border-zinc-800 active:scale-[0.98]';
              if (isSelected) {
                bgClass = isCorrect
                  ? 'bg-green-500/20 border-green-500/50 scale-[0.98]'
                  : 'bg-red-500/20 border-red-500/50 scale-[0.98]';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isTransitioning}
                  className={`w-full p-4 rounded-2xl text-left border-2 transition-all duration-200 ${bgClass} ${isTransitioning ? 'pointer-events-none' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-base font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      case 'sequence': {
        const q = currentQuestion as SequenceQuestion;
        return (
          <div className="space-y-6">
            {/* Sequence display */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {q.sequence.map((item, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold ${
                    item === '?'
                      ? 'border-2 border-dashed border-zinc-600 bg-zinc-800/50 text-zinc-400'
                      : 'bg-zinc-800 text-white'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === q.correctAnswer;

                let bgClass = 'bg-zinc-900/80 border-zinc-800 active:scale-[0.98]';
                if (isSelected) {
                  bgClass = isCorrect
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-red-500/20 border-red-500/50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isTransitioning}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 ${bgClass}`}
                  >
                    <span className="text-2xl font-bold">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'true_false': {
        const q = currentQuestion as TrueFalseQuestion;
        return (
          <div className="space-y-6">
            {/* Statement */}
            <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
              <p className="text-lg leading-relaxed text-zinc-200">{q.statement}</p>
            </div>

            {/* True/False buttons */}
            <div className="grid grid-cols-2 gap-4">
              {[true, false].map((value) => {
                const isSelected = selectedAnswer === value;
                const isCorrect = value === q.correctAnswer;

                let bgClass = value
                  ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                  : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600';

                if (isSelected) {
                  bgClass = isCorrect
                    ? 'bg-green-500/30 border-green-500'
                    : 'bg-red-500/30 border-red-500';
                }

                return (
                  <button
                    key={String(value)}
                    onClick={() => handleAnswer(value)}
                    disabled={isTransitioning}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 ${bgClass}`}
                  >
                    <div className="text-4xl mb-2">{value ? '✓' : '✗'}</div>
                    <span className="text-lg font-bold">{value ? 'TRUE' : 'FALSE'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'slider': {
        const q = currentQuestion as SliderQuestion;
        return (
          <div className="space-y-8">
            {/* Current value display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{sliderValue}</div>
              <p className="text-zinc-500 text-sm">Slide to select your answer</p>
            </div>

            {/* Slider */}
            <div className="px-4">
              <input
                type="range"
                min={q.min}
                max={q.max}
                step={q.step}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-3 bg-zinc-800 rounded-full appearance-none cursor-pointer slider-thumb"
                disabled={isTransitioning}
              />
              <div className="flex justify-between text-sm text-zinc-600 mt-2">
                <span>{q.min}</span>
                <span>{q.max}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={() => handleAnswer(sliderValue)}
              disabled={isTransitioning}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl text-lg active:scale-[0.98] transition-transform"
            >
              Lock In Answer
            </button>
          </div>
        );
      }

      case 'order': {
        const q = currentQuestion as OrderQuestion;
        return (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 text-center mb-4">Tap items to reorder</p>

            {/* Draggable items */}
            <div className="space-y-2">
              {orderItems.map((itemIndex, position) => (
                <div
                  key={itemIndex}
                  className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4"
                >
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">
                    {position + 1}
                  </span>
                  <span className="flex-1 font-medium">{q.items[itemIndex]}</span>
                  <div className="flex gap-1">
                    {position > 0 && (
                      <button
                        onClick={() => handleOrderDrag(position, position - 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
                      >
                        ↑
                      </button>
                    )}
                    {position < orderItems.length - 1 && (
                      <button
                        onClick={() => handleOrderDrag(position, position + 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={() => handleAnswer(orderItems)}
              disabled={isTransitioning}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl text-lg active:scale-[0.98] transition-transform mt-4"
            >
              Confirm Order
            </button>
          </div>
        );
      }

      case 'multi_select': {
        const q = currentQuestion as MultiSelectQuestion;
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
              Select all answers that apply.
            </div>
            <div className="space-y-3">
              {q.options.map((option, index) => {
                const isPicked = multiSelectItems.includes(index);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiSelectToggle(index)}
                    disabled={isTransitioning}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      isPicked
                        ? 'border-zinc-500 bg-zinc-800'
                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded border ${isPicked ? 'border-zinc-400 bg-zinc-500' : 'border-zinc-600'}`} />
                      <span className="font-medium text-zinc-100">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleAnswer(multiSelectItems)}
              disabled={isTransitioning || multiSelectItems.length === 0}
              className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Selection
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Show engagement page if active
  if (showEngagement) {
    return renderEngagementPage();
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b]">
      {/* Brand header */}
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <img
            src="/logo.png"
            alt="IQScore"
            className="w-8 h-8"
            width={32}
            height={32}
          />
          <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
        </div>
      </div>
      <header className="px-4 pb-2 pt-2">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white">{currentIndex + 1}</span>
              <span className="text-zinc-600 text-sm">/ {questions.length}</span>
            </div>

            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#27272a" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke={isLowTime ? '#ef4444' : '#a1a1aa'}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${timerProgress * 1.257} 126`}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${isLowTime ? 'text-red-400 timer-warning' : 'text-zinc-300'}`}>
                {timeLeft}
              </span>
            </div>
          </div>

          {showProgressBar && (
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {streak >= 2 && (
            <div className="mt-2 flex items-center justify-center gap-1 text-zinc-400 text-sm font-medium">
              <span>{streak} in a row</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {getQuestionTypeLabel(currentQuestion.type)}
              </span>
              {currentQuestion.difficulty >= 4 && (
                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">Hard</span>
              )}
            </div>
            <h2 className="text-lg font-medium leading-relaxed text-white">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="flex-1">
            {renderQuestionContent()}
          </div>

          {showExtendButton && !extendedThisQuestion && (
            <button
              onClick={handleExtendTime}
              className="mt-4 w-full py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
            >
              Need more time? <span className="text-zinc-300 font-medium">+30s</span>
            </button>
          )}

          {/* DEV: Skip to end */}
          <button
            onClick={async () => {
              const fakeAnswers = questions.map((q, i) => ({
                questionId: q.id,
                selectedAnswer: 0,
                correct: i % 2 === 0,
                timeSpent: 5,
              }));
              const correctCount = fakeAnswers.filter(a => a.correct).length;
              const { iq, percentile } = calculateIQ(correctCount, questions.length);

              // Use existing sessionId or create one
              let sid = sessionId;
              if (!sid) {
                const res = await fetch('/api/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({}),
                });
                const data = await res.json();
                sid = data.sessionId;
              }

              // Save to database
              await fetch('/api/session', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: sid,
                  score: correctCount,
                  iqScore: iq,
                  percentile,
                  answers: fakeAnswers,
                  completed: true,
                }),
              });

              sessionStorage.setItem('iqResults', JSON.stringify({
                sessionId: sid,
                score: correctCount,
                iqScore: iq,
                percentile,
                answers: fakeAnswers,
              }));
              router.push('/processing');
            }}
            className="mt-2 w-full py-2 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400 hover:bg-red-900/30 transition-colors"
          >
            DEV: Skip to end
          </button>
        </div>
      </div>
    </main>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading test...</p>
        </div>
      </main>
    }>
      <TestContent />
    </Suspense>
  );
}
