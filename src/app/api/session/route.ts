import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sessionId = uuidv4();

    // Get UTM parameters and user info
    const { utm_source, utm_medium, utm_campaign, utm_content } = body;

    // Get IP and user agent from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await sql`
      INSERT INTO sessions (id, ip_address, user_agent, utm_source, utm_medium, utm_campaign, utm_content)
      VALUES (${sessionId}, ${ip}, ${userAgent}, ${utm_source || null}, ${utm_medium || null}, ${utm_campaign || null}, ${utm_content || null})
    `;

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, currentQuestion, answers, score, iqScore, percentile, email, completed } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: Record<string, unknown> = { sessionId };

    if (currentQuestion !== undefined) {
      updates.push('current_question = ${currentQuestion}');
      values.currentQuestion = currentQuestion;
    }

    if (answers !== undefined) {
      updates.push('answers = ${answers}');
      values.answers = JSON.stringify(answers);
    }

    if (score !== undefined) {
      updates.push('score = ${score}');
      values.score = score;
    }

    if (iqScore !== undefined) {
      updates.push('iq_score = ${iqScore}');
      values.iqScore = iqScore;
    }

    if (percentile !== undefined) {
      updates.push('percentile = ${percentile}');
      values.percentile = percentile;
    }

    if (email !== undefined) {
      updates.push('email = ${email}');
      values.email = email;
    }

    if (completed) {
      updates.push('completed_at = NOW()');
    }

    updates.push('updated_at = NOW()');

    await sql`
      UPDATE sessions
      SET current_question = ${currentQuestion ?? null},
          answers = ${answers ? JSON.stringify(answers) : null},
          score = ${score ?? null},
          iq_score = ${iqScore ?? null},
          percentile = ${percentile ?? null},
          email = ${email ?? null},
          completed_at = ${completed ? new Date() : null},
          updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
