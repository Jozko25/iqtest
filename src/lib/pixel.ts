// Meta Pixel tracking utilities

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Standard events
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Custom events
export const trackCustomEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};

// Specific event helpers
export const trackViewContent = (contentName: string, contentCategory?: string) => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
  });
};

export const trackLead = (email?: string) => {
  trackEvent('Lead', { content_name: 'email_capture' });
};

export const trackInitiateCheckout = (value: number, currency: string = 'USD') => {
  trackEvent('InitiateCheckout', {
    value,
    currency,
  });
};

export const trackPurchase = (value: number, currency: string = 'USD') => {
  trackEvent('Purchase', {
    value,
    currency,
  });
};

// Custom tracking for IQ test
export const trackTestStarted = () => {
  trackCustomEvent('TestStarted');
};

export const trackQuestionAnswered = (questionNumber: number, totalQuestions: number) => {
  trackCustomEvent('QuestionAnswered', {
    question_number: questionNumber,
    total_questions: totalQuestions,
    progress_percent: Math.round((questionNumber / totalQuestions) * 100),
  });
};

export const trackTestCompleted = (score: number, iqScore: number) => {
  trackCustomEvent('TestCompleted', {
    score,
    iq_score: iqScore,
  });
};

export const trackTimeExtended = (questionNumber: number) => {
  trackCustomEvent('TimeExtended', {
    question_number: questionNumber,
  });
};

export const trackResultsViewed = (iqScore: number, percentile: number) => {
  trackCustomEvent('ResultsViewed', {
    iq_score: iqScore,
    percentile,
  });
};
