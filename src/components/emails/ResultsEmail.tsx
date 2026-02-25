import * as React from 'react';

interface ResultsEmailProps {
  iqScore: number;
  percentile: number;
  resultsUrl: string;
}

export function ResultsEmail({ iqScore, percentile, resultsUrl }: ResultsEmailProps) {
  const getCategory = (iq: number) => {
    if (iq >= 130) return 'Very Superior';
    if (iq >= 120) return 'Superior';
    if (iq >= 110) return 'High Average';
    if (iq >= 90) return 'Average';
    if (iq >= 80) return 'Low Average';
    return 'Below Average';
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#0a0a0b',
      color: '#fafafa',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 8px 0',
          color: '#fafafa'
        }}>
          Your IQ Test Results
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#71717a',
          margin: 0
        }}>
          Based on 20 cognitive assessment questions
        </p>
      </div>

      <div style={{
        backgroundColor: '#18181b',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '8px' }}>
          IQ Score
        </div>
        <div style={{
          fontSize: '64px',
          fontWeight: '700',
          letterSpacing: '-2px',
          color: '#fafafa',
          marginBottom: '8px'
        }}>
          {iqScore}
        </div>
        <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
          {getCategory(iqScore)}
        </div>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#71717a', marginBottom: '4px' }}>
            Percentile
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa' }}>
            {percentile}%
          </div>
          <div style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            You scored higher than {percentile}% of test takers
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <a
          href={resultsUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#fafafa',
            color: '#0a0a0b',
            padding: '14px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          View Full Results
        </a>
      </div>

      <div style={{
        backgroundColor: '#18181b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#fafafa' }}>
          Unlock Your Full Report
        </div>
        <ul style={{
          margin: 0,
          padding: '0 0 0 20px',
          fontSize: '13px',
          color: '#a1a1aa',
          lineHeight: '1.8'
        }}>
          <li>Detailed score breakdown by category</li>
          <li>Strengths and areas for improvement</li>
          <li>Population comparison chart</li>
          <li>Shareable certificate</li>
        </ul>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#52525b',
        paddingTop: '24px',
        borderTop: '1px solid #27272a'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          IQ Score - Cognitive Assessment
        </p>
        <p style={{ margin: 0 }}>
          You received this email because you completed our IQ test.
        </p>
      </div>
    </div>
  );
}
