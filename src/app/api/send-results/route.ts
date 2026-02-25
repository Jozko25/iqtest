import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getCategory(iq: number) {
  if (iq >= 130) return 'Very Superior';
  if (iq >= 120) return 'Superior';
  if (iq >= 110) return 'High Average';
  if (iq >= 90) return 'Average';
  if (iq >= 80) return 'Low Average';
  return 'Below Average';
}

function generateEmailHtml(iqScore: number, percentile: number, resultsUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #fafafa; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: #fafafa;">
        Your IQ Test Results
      </h1>
      <p style="font-size: 14px; color: #71717a; margin: 0;">
        Based on 20 cognitive assessment questions
      </p>
    </div>

    <div style="background-color: #18181b; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 14px; color: #71717a; margin-bottom: 8px;">
        IQ Score
      </div>
      <div style="font-size: 64px; font-weight: 700; letter-spacing: -2px; color: #fafafa; margin-bottom: 8px;">
        ${iqScore}
      </div>
      <div style="font-size: 14px; color: #a1a1aa;">
        ${getCategory(iqScore)}
      </div>

      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #27272a;">
        <div style="font-size: 14px; color: #71717a; margin-bottom: 4px;">
          Percentile
        </div>
        <div style="font-size: 24px; font-weight: 600; color: #fafafa;">
          ${percentile}%
        </div>
        <div style="font-size: 12px; color: #52525b; margin-top: 4px;">
          You scored higher than ${percentile}% of test takers
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${resultsUrl}" style="display: inline-block; background-color: #fafafa; color: #0a0a0b; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Full Results
      </a>
    </div>

    <div style="background-color: #18181b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px; color: #fafafa;">
        Unlock Your Full Report
      </div>
      <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #a1a1aa; line-height: 1.8;">
        <li>Detailed score breakdown by category</li>
        <li>Strengths and areas for improvement</li>
        <li>Population comparison chart</li>
        <li>Shareable certificate</li>
      </ul>
    </div>

    <div style="text-align: center; font-size: 12px; color: #52525b; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="margin: 0 0 8px 0;">
        IQ Score - Cognitive Assessment
      </p>
      <p style="margin: 0;">
        You received this email because you completed our IQ test.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, iqScore, percentile, sessionId } = await request.json();

    if (!email || !iqScore) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/results?session=${sessionId}`;

    const { data, error } = await resend.emails.send({
      from: 'IQ Score <results@iqscore.app>',
      to: [email],
      subject: `Your IQ Score: ${iqScore}`,
      html: generateEmailHtml(iqScore, percentile, resultsUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
