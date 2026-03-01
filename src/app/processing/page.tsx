'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'California',
    text: 'Finally an IQ test that felt legitimate and challenging. The questions were diverse and really tested different aspects of intelligence.',
    score: 127,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  },
  {
    name: 'James K.',
    location: 'New York',
    text: 'I was skeptical at first, but the cognitive breakdown in my report was incredibly insightful. Worth every penny.',
    score: 118,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
  },
  {
    name: 'Emily R.',
    location: 'Texas',
    text: 'The questions got progressively harder which made it feel authentic. My results aligned with a professional test I took years ago.',
    score: 134,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
  },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(847293);

  useEffect(() => {
    const results = sessionStorage.getItem('iqResults');
    if (!results) {
      router.push('/');
      return;
    }

    setTimeout(() => setShowContent(true), 100);

    // Animate completed count
    const countInterval = setInterval(() => {
      setCompletedCount(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    // Rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 3000);

    // Navigate after processing
    const timeout = setTimeout(() => {
      router.push('/email');
    }, 4500);

    return () => {
      clearInterval(countInterval);
      clearInterval(progressInterval);
      clearInterval(testimonialInterval);
      clearTimeout(timeout);
    };
  }, [router]);

  const testimonial = testimonials[currentTestimonial];

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
        {/* Processing animation */}
        <div className={`text-center mb-8 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5 relative">
            <svg className="w-8 h-8 text-zinc-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-white">Analyzing Your Results</h1>
          <p className="text-zinc-500 text-sm">Calculating your cognitive profile...</p>
        </div>

        {/* Progress bar */}
        <div className={`mb-8 transition-all duration-500 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-zinc-600">{progress}% complete</p>
        </div>

        {/* Social proof stats */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-5 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" alt="" className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" alt="" className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces" alt="" className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover" />
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" alt="" className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces" alt="" className="w-7 h-7 rounded-full border-2 border-zinc-900 object-cover" />
            </div>
            <span className="text-xs text-zinc-500">+{completedCount.toLocaleString()}</span>
          </div>
          <p className="text-center text-sm text-zinc-400">
            people have completed this assessment
          </p>
        </div>

        {/* Testimonial card */}
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 transition-all duration-500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start gap-3 mb-3">
            <img src={testimonial.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">{testimonial.name}</p>
              <p className="text-xs text-zinc-600">{testimonial.location}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold text-white">{testimonial.score}</p>
              <p className="text-[10px] text-zinc-600">IQ Score</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>

          {/* Testimonial indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-zinc-800">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentTestimonial ? 'bg-zinc-400' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
