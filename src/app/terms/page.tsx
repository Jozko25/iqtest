'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#09090b] px-4 py-6 safe-bottom">
      <div className="max-w-md mx-auto w-full flex-1">
        <div className="pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="IQScore" className="w-8 h-8" width={32} height={32} />
            <span className="font-medium text-zinc-300 text-sm">IQScore<span className="text-zinc-500">.app</span></span>
          </Link>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-400">Back</Link>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-zinc-300 space-y-6">
          <h1 className="text-xl font-semibold text-white">Terms and Conditions</h1>
          <p className="text-xs text-zinc-500">Last updated: February 2025</p>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">1. Operator</h2>
            <p className="text-sm text-zinc-400">
              These Terms and Conditions (&quot;Terms&quot;) govern your use of the IQ Score assessment and related services (the &quot;Service&quot;) operated by <strong>Vivero s.r.o.</strong>, a limited liability company incorporated in the Czech Republic. By using the Service, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">2. Description of the Service</h2>
            <p className="text-sm text-zinc-400">
              The Service provides an online cognitive assessment that produces an estimated IQ score and related report. The assessment is for informational and entertainment purposes only. It is not a substitute for professional psychological or clinical evaluation and does not constitute medical or diagnostic advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">3. Eligibility and Account</h2>
            <p className="text-sm text-zinc-400">
              You must be at least 13 years of age to use the Service. By using the Service you represent that you meet this requirement. No account registration is required to take the assessment; you may provide an email address to receive your results. You are responsible for the accuracy of any information you provide.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">4. Payments and Refunds</h2>
            <p className="text-sm text-zinc-400">
              Access to the full report and certain features may require a one-time payment. Prices are displayed before payment. Payment is processed by a third-party payment provider (e.g. Stripe). By completing a purchase you agree to the payment terms shown at checkout. All fees are non-refundable unless otherwise required by applicable law or as stated in a separate refund policy. We reserve the right to change prices with notice where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">5. Intellectual Property</h2>
            <p className="text-sm text-zinc-400">
              The Service, including but not limited to its design, content, questions, scoring methodology, and software, is owned by Vivero s.r.o. or its licensors. You may not copy, modify, distribute, or create derivative works from the Service or any part of it without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">6. Disclaimers</h2>
            <p className="text-sm text-zinc-400">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE ASSESSMENT OR SCORES ARE ACCURATE, COMPLETE, OR SUITABLE FOR ANY PARTICULAR PURPOSE. RESULTS ARE ESTIMATES ONLY AND MAY VARY. WE ARE NOT LIABLE FOR ANY DECISIONS YOU MAKE BASED ON THE RESULTS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">7. Limitation of Liability</h2>
            <p className="text-sm text-zinc-400">
              To the maximum extent permitted by law, Vivero s.r.o. and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from your use of the Service. Our total liability for any claims related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">8. Governing Law and Disputes</h2>
            <p className="text-sm text-zinc-400">
              These Terms are governed by the laws of the Czech Republic. Any disputes shall be resolved in the courts of the Czech Republic. If any provision of these Terms is held invalid, the remaining provisions remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">9. Changes</h2>
            <p className="text-sm text-zinc-400">
              We may update these Terms from time to time. The &quot;Last updated&quot; date at the top will be revised when changes are made. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">10. Contact</h2>
            <p className="text-sm text-zinc-400">
              For questions about these Terms, contact Vivero s.r.o. at the contact details provided on the Service or in our Privacy Policy.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-400">Privacy Policy</Link>
          <span className="text-zinc-700">·</span>
          <Link href="/" className="underline underline-offset-2 hover:text-zinc-400">Home</Link>
        </div>
      </div>
    </main>
  );
}
