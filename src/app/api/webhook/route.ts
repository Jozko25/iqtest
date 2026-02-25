import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const sessionId = checkoutSession.metadata?.sessionId;

        if (sessionId) {
          // Update session payment status
          await sql`
            UPDATE sessions
            SET payment_status = 'completed',
                payment_amount = ${checkoutSession.amount_total}
            WHERE id = ${sessionId}
          `;

          // Update payment record
          await sql`
            UPDATE payments
            SET status = 'completed',
                stripe_payment_intent_id = ${checkoutSession.payment_intent as string}
            WHERE stripe_checkout_session_id = ${checkoutSession.id}
          `;
        }
        break;
      }

      case 'checkout.session.expired': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        await sql`
          UPDATE payments
          SET status = 'expired'
          WHERE stripe_checkout_session_id = ${checkoutSession.id}
        `;
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
