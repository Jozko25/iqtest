import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const session = await sql`
      SELECT stripe_customer_id, email FROM sessions WHERE id = ${sessionId}
    `;

    if (session.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const customerEmail = email || session[0].email;

    if (session[0].stripe_customer_id) {
      stripeCustomerId = session[0].stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail || undefined,
        metadata: {
          sessionId,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to session
      await sql`
        UPDATE sessions SET stripe_customer_id = ${stripeCustomerId} WHERE id = ${sessionId}
      `;
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'IQ Test - Detailed Results',
              description: 'Get your complete IQ analysis, breakdown by category, and personalized insights',
            },
            unit_amount: 299, // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/results/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/results?canceled=true`,
      metadata: {
        sessionId,
      },
    });

    // Save checkout session to payments table
    await sql`
      INSERT INTO payments (session_id, stripe_checkout_session_id, amount, status)
      VALUES (${sessionId}, ${checkoutSession.id}, 299, 'pending')
    `;

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
