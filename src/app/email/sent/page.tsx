'use client';

import { useEffect, useState } from 'react';
import Footer from '@/components/Footer';

export default function EmailSentPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

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
        <div className={`text-center transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-3">Check Your Email</h1>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            We&apos;ve sent a link to view your IQ score.<br />
            Click the link in the email to see your results.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">What to expect</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">1.</span>
                <span>Open the email from IQ Score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">2.</span>
                <span>Click the link to reveal your IQ score</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">3.</span>
                <span>Unlock your full cognitive report</span>
              </li>
            </ul>
          </div>

          <p className="mt-8 text-xs text-zinc-600">
            Didn&apos;t receive the email? Check your spam folder.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
