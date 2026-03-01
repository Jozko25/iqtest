'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-xl font-semibold text-white">Privacy Policy</h1>
          <p className="text-xs text-zinc-500">Last updated: February 2025</p>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">1. Data Controller</h2>
            <p className="text-sm text-zinc-400">
              The data controller responsible for your personal data in connection with the IQ Score service is <strong>Vivero s.r.o.</strong>, a limited liability company incorporated in the Czech Republic. This Privacy Policy explains how we collect, use, and protect your information when you use our website and assessment.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">2. Information We Collect</h2>
            <p className="text-sm text-zinc-400 mb-2">We may collect:</p>
            <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1">
              <li><strong>Assessment data:</strong> Your answers, response times, and derived scores (IQ estimate, percentile).</li>
              <li><strong>Contact data:</strong> Email address, if you choose to receive your results by email.</li>
              <li><strong>Payment data:</strong> Payment is processed by a third-party provider (e.g. Stripe). We do not store your full card number; we may store a reference to the transaction and customer identifier for order fulfillment and support.</li>
              <li><strong>Technical data:</strong> IP address, device type, browser, and similar technical information for security and operation of the service.</li>
              <li><strong>Cookies and similar technologies:</strong> We may use cookies and similar technologies for analytics, security, and to remember your preferences, as described below.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">3. How We Use Your Information</h2>
            <p className="text-sm text-zinc-400">
              We use your information to: provide the assessment and deliver your results; send your results to your email if requested; process payments and provide the purchased report; improve and secure the service; comply with legal obligations; and, where you have consented or we have a legitimate interest, for analytics and marketing (e.g. Meta Pixel). We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">4. Legal Basis (GDPR)</h2>
            <p className="text-sm text-zinc-400">
              If you are in the European Economic Area or the UK, we process your data on the basis of: (a) contract — to provide the service and process payments; (b) consent — where you have given consent (e.g. marketing); (c) legitimate interests — to improve and secure the service, and for analytics; (d) legal obligation — where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">5. Data Retention</h2>
            <p className="text-sm text-zinc-400">
              We retain assessment and session data for as long as needed to provide the service and fulfill orders, and for a reasonable period for support and legal compliance. Payment-related records may be retained as required by tax and accounting laws. You may request deletion of your data as set out in your rights below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">6. Your Rights</h2>
            <p className="text-sm text-zinc-400">
              Depending on your location, you may have the right to: access your personal data; correct or update it; request deletion; restrict or object to certain processing; data portability; and withdraw consent where processing is based on consent. You may also have the right to lodge a complaint with a supervisory authority. To exercise these rights, contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">7. Sharing and Transfers</h2>
            <p className="text-sm text-zinc-400">
              We may share data with: payment processors (e.g. Stripe) to process payments; email and hosting providers to operate the service; and analytics or advertising partners (e.g. Meta) where you have consented or we have a legitimate interest. Some of these partners may be outside your country. We ensure appropriate safeguards (e.g. standard contractual clauses) where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">8. Cookies and Tracking</h2>
            <p className="text-sm text-zinc-400">
              We use cookies and similar technologies for essential operation, security, and to remember your session. We may also use analytics and advertising cookies (e.g. Meta Pixel) to measure usage and deliver relevant content. You can control cookies through your browser settings. Blocking certain cookies may affect how the service works.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">9. Security</h2>
            <p className="text-sm text-zinc-400">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or alteration. No method of transmission over the Internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">10. Children</h2>
            <p className="text-sm text-zinc-400">
              The service is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe we have collected such data, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">11. Changes</h2>
            <p className="text-sm text-zinc-400">
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will be revised when changes are made. We encourage you to review this policy periodically. Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white mt-6 mb-2">12. Contact</h2>
            <p className="text-sm text-zinc-400">
              For privacy-related questions, to exercise your rights, or to contact the data controller, please reach out to Vivero s.r.o. using the contact details provided on the service (e.g. on the website or in the app).
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-400">Terms and Conditions</Link>
          <span className="text-zinc-700">·</span>
          <Link href="/" className="underline underline-offset-2 hover:text-zinc-400">Home</Link>
        </div>
      </div>
    </main>
  );
}
