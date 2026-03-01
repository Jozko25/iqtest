import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get('stripe_session_id');

    if (!stripeSessionId) {
      return NextResponse.json({ error: 'Stripe session ID required' }, { status: 400 });
    }

    // Get the Stripe checkout session to get our session ID
    const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId);

    if (!checkoutSession.metadata?.sessionId) {
      return NextResponse.json({ error: 'Session not found in checkout metadata' }, { status: 404 });
    }

    const sessionId = checkoutSession.metadata.sessionId;

    // Fetch the session from our database
    const result = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = result[0];

    return NextResponse.json({
      sessionId: session.id,
      score: session.score,
      iqScore: session.iq_score,
      percentile: session.percentile,
      email: session.email,
      answers: session.answers ? JSON.parse(session.answers) : [],
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
