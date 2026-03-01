import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);

function getCategory(iq: number): string {
  if (iq >= 130) return 'Exceptional';
  if (iq >= 120) return 'Superior';
  if (iq >= 110) return 'Above Average';
  if (iq >= 90) return 'Average';
  return 'Below Average';
}

function generateEmailHtml(resultsUrl: string, iqScore: number, percentile: number) {
  const category = getCategory(iqScore);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #fafafa; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="margin-bottom: 16px;">
        <span style="font-size: 20px; font-weight: 600; color: #fafafa;">IQ Score</span>
        <span style="font-size: 14px; color: #52525b;">.app</span>
      </div>
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #fafafa; letter-spacing: -0.5px;">
        Your Results Are Ready
      </h1>
      <p style="font-size: 14px; color: #71717a; margin: 0;">
        Based on 30 cognitive assessment questions
      </p>
    </div>

    <!-- Blurred Score Card -->
    <div style="background: linear-gradient(145deg, #18181b 0%, #1f1f23 100%); border-radius: 20px; padding: 40px 32px; text-align: center; margin-bottom: 24px; border: 1px solid #27272a;">
      <p style="font-size: 11px; color: #52525b; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 20px 0;">Your IQ Score</p>

      <!-- Hidden Score with Lock -->
      <table style="margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="text-align: center;">
            <div style="display: inline-block; background: linear-gradient(135deg, #27272a 0%, #18181b 100%); border-radius: 16px; padding: 20px 32px; border: 1px solid #3f3f46;">
              <div style="font-size: 56px; font-weight: 800; color: #3f3f46; letter-spacing: 8px; font-family: monospace;">
                ? ? ?
              </div>
            </div>
          </td>
        </tr>
      </table>

      <div style="margin-top: 16px;">
        <span style="display: inline-block; background: #27272a; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center;">
          <span style="font-size: 18px;">&#128274;</span>
        </span>
      </div>

      <!-- Category Badge (Hidden) -->
      <div style="margin-top: 16px;">
        <span style="display: inline-block; padding: 8px 24px; background-color: #27272a; border-radius: 20px; font-size: 14px; color: #52525b; border: 1px solid #3f3f46;">
          &#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;
        </span>
      </div>

      <!-- Teaser Text -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #27272a;">
        <p style="font-size: 20px; font-weight: 600; color: #fafafa; margin: 0 0 4px 0;">
          Your score is ready to reveal
        </p>
        <p style="font-size: 14px; color: #71717a; margin: 0;">
          Click below to see how you compare to millions of others
        </p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${resultsUrl}" style="display: inline-block; background: linear-gradient(135deg, #fafafa 0%, #e4e4e7 100%); color: #0a0a0b; padding: 18px 48px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(255,255,255,0.1);">
        Reveal My Score
      </a>
      <p style="font-size: 12px; color: #52525b; margin: 12px 0 0 0;">
        Click to see your full results
      </p>
    </div>

    <!-- What's Included -->
    <div style="background-color: #18181b; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #27272a;">
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px; color: #fafafa;">
        What you'll discover:
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 24px;">
            <span style="color: #22c55e; font-size: 14px;">&#10003;</span>
          </td>
          <td style="padding: 8px 0; font-size: 14px; color: #a1a1aa;">
            Your exact IQ score with percentile ranking
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 24px;">
            <span style="color: #22c55e; font-size: 14px;">&#10003;</span>
          </td>
          <td style="padding: 8px 0; font-size: 14px; color: #a1a1aa;">
            How you compare to millions of others
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 24px;">
            <span style="color: #22c55e; font-size: 14px;">&#10003;</span>
          </td>
          <td style="padding: 8px 0; font-size: 14px; color: #a1a1aa;">
            Option to unlock detailed cognitive breakdown
          </td>
        </tr>
      </table>
    </div>

    <!-- Social Proof -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block;">
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" alt="" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0a0a0b; margin-right: -8px; object-fit: cover;" />
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" alt="" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0a0a0b; margin-right: -8px; object-fit: cover;" />
        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces" alt="" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0a0a0b; margin-right: -8px; object-fit: cover;" />
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" alt="" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #0a0a0b; object-fit: cover;" />
      </div>
      <p style="font-size: 13px; color: #71717a; margin: 12px 0 0 0;">
        Join <span style="color: #fafafa; font-weight: 500;">2.8M+</span> people who've tested their IQ
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #52525b; padding-top: 24px; border-top: 1px solid #27272a;">
      <p style="margin: 0 0 8px 0; color: #71717a;">
        IQ Score - Cognitive Assessment Platform
      </p>
      <p style="margin: 0; font-size: 11px;">
        You're receiving this because you completed our assessment.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json();

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the session data to get the actual IQ score
    const sql = neon(process.env.DATABASE_URL!);
    const sessions = await sql`
      SELECT iq_score, percentile FROM sessions WHERE id = ${sessionId}
    `;

    const session = sessions[0];
    const iqScore = session?.iq_score || 100;
    const percentile = session?.percentile || 50;

    const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/results/reveal?session=${sessionId}`;
    console.log('resultsUrl', resultsUrl);

    const { data, error } = await resend.emails.send({
      from: 'IQ Score <results@iqscore.app>',
      to: [email],
      subject: `Your IQ Score is Ready - Click to Reveal`,
      html: generateEmailHtml(resultsUrl, iqScore, percentile),
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
