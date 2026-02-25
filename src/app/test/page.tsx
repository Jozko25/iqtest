'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { questions, calculateIQ } from '@/lib/questions';
import { trackTestStarted, trackQuestionAnswered, trackTestCompleted, trackTimeExtended } from '@/lib/pixel';

interface Answer {
  questionId: number;
  selectedAnswer: number;
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [extendedThisQuestion, setExtendedThisQuestion] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isTransitioning, showExtendButton, extendedThisQuestion]);

  const handleExtendTime = () => {
    if (extendedThisQuestion) return;
    setTimeLeft((prev) => prev + 30);
    setShowExtendButton(false);
    setExtendedThisQuestion(true);
    trackTimeExtended(currentIndex + 1);
  };

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (isTransitioning || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setIsTransitioning(true);

    const timeSpent = ((Date.now() - startTime) / 1000);
    const correct = answerIndex === currentQuestion.correctAnswer;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
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

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
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

        router.push('/email');
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(questions[currentIndex + 1].timeLimit);
        setShowExtendButton(false);
        setExtendedThisQuestion(false);
        setStartTime(Date.now());
        setIsTransitioning(false);
      }
    }, 250);
  }, [currentIndex, currentQuestion, answers, sessionId, isTransitioning, selectedAnswer, router, startTime]);

  const isLowTime = timeLeft <= 5;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            {currentIndex + 1} <span className="text-zinc-600">/ {questions.length}</span>
          </div>
          <div className={`font-mono text-sm tabular-nums ${isLowTime ? 'text-red-400 timer-warning' : 'text-zinc-400'}`}>
            {timeLeft}s
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white progress-fill rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 py-6">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {/* Question text */}
          <div className="mb-8">
            <span className="text-xs text-zinc-500 uppercase tracking-wider mb-3 block">
              {currentQuestion.type.replace('_', ' ')}
            </span>
            <h2 className="text-xl font-medium leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;

              let bgClass = 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700';
              if (isSelected) {
                bgClass = isCorrect
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-red-500/10 border-red-500/50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isTransitioning}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-150 ${bgClass} ${isTransitioning ? 'pointer-events-none' : 'btn-press'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-[15px]">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Extend time */}
          {showExtendButton && !extendedThisQuestion && (
            <button
              onClick={handleExtendTime}
              className="mt-6 w-full py-3 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Need more time? <span className="text-white">+30 seconds</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </main>
    }>
      <TestContent />
    </Suspense>
  );
}
