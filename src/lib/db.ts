import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      current_question INT DEFAULT 0,
      answers JSONB DEFAULT '[]',
      score INT,
      iq_score INT,
      percentile INT,
      email VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      payment_status VARCHAR(50) DEFAULT 'pending',
      payment_amount INT,
      completed_at TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT,
      utm_source VARCHAR(255),
      utm_medium VARCHAR(255),
      utm_campaign VARCHAR(255),
      utm_content VARCHAR(255)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id),
      stripe_payment_intent_id VARCHAR(255),
      stripe_checkout_session_id VARCHAR(255),
      amount INT,
      currency VARCHAR(10) DEFAULT 'usd',
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_stripe_customer ON sessions(stripe_customer_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(session_id)
  `;
}
