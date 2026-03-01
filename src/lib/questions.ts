export type QuestionType = 'pattern' | 'logic' | 'verbal' | 'math' | 'spatial' | 'memory' | 'visual';

export type AnswerType = 'multiple_choice' | 'sequence' | 'image_select' | 'true_false' | 'slider' | 'order' | 'multi_select';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  answerType: AnswerType;
  question: string;
  difficulty: number; // 1-5
  timeLimit: number; // seconds
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  answerType: 'multiple_choice';
  options: string[];
  correctAnswer: number;
}

export interface SequenceQuestion extends BaseQuestion {
  answerType: 'sequence';
  sequence: (string | number)[];
  missingIndex: number;
  options: (string | number)[];
  correctAnswer: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  answerType: 'true_false';
  statement: string;
  correctAnswer: boolean;
}

export interface SliderQuestion extends BaseQuestion {
  answerType: 'slider';
  min: number;
  max: number;
  step: number;
  correctAnswer: number;
  tolerance: number; // How close they need to be
}

export interface OrderQuestion extends BaseQuestion {
  answerType: 'order';
  items: string[];
  correctOrder: number[]; // Indices in correct order
}

export interface MultiSelectQuestion extends BaseQuestion {
  answerType: 'multi_select';
  options: string[];
  correctAnswers: number[];
  minSelections?: number;
  maxSelections?: number;
}

export type Question =
  | MultipleChoiceQuestion
  | SequenceQuestion
  | TrueFalseQuestion
  | SliderQuestion
  | OrderQuestion
  | MultiSelectQuestion;

// Engagement messages shown between questions (reduced frequency)
export const engagementMessages = [
  { threshold: 8, message: "You're doing better than 67% so far!", type: 'encouragement' },
  { threshold: 17, message: "Final stretch! Almost there", type: 'progress' },
  { threshold: 25, message: "Excellent focus. Finish strong.", type: 'progress' },
];

export const questions: Question[] = [
  // --- WARMUP (1-5): Engages the user, establishes the formats ---
  {
    id: 1,
    type: 'pattern',
    answerType: 'sequence',
    question: 'Complete the sequence:',
    sequence: [2, 4, 8, 16, '?'],
    missingIndex: 4,
    options: [24, 32, 30, 28],
    correctAnswer: 1, // 32 (doubles each time)
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 2,
    type: 'logic',
    answerType: 'true_false',
    question: 'True or False?',
    statement: 'If all roses are flowers, and some flowers fade quickly, then some roses definitely fade quickly.',
    correctAnswer: false, // Invalid syllogism
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 3,
    type: 'math',
    answerType: 'multiple_choice',
    question: 'A bat and a ball cost $1.10 in total. The bat costs exactly $1.00 more than the ball. How much does the ball cost?',
    options: ['$0.10', '$0.05', '$0.15', '$0.01'],
    correctAnswer: 1, // $0.05
    difficulty: 2,
    timeLimit: 30,
  },
  {
    id: 4,
    type: 'verbal',
    answerType: 'multiple_choice',
    question: 'FAST is to SLOW as LIGHT is to:',
    options: ['Dark', 'Heavy', 'Bright', 'Quick'],
    correctAnswer: 1, // Heavy (opposites)
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 5,
    type: 'spatial',
    answerType: 'slider',
    question: 'A square paper is folded in half twice, then a hole is punched through. How many holes when unfolded?',
    min: 1,
    max: 8,
    step: 1,
    correctAnswer: 4,
    tolerance: 0,
    difficulty: 2,
    timeLimit: 25,
  },

  // --- EASY-MEDIUM (6-10) ---
  {
    id: 6,
    type: 'pattern',
    answerType: 'sequence',
    question: 'What comes next?',
    sequence: [1, 1, 2, 3, 5, 8, '?'],
    missingIndex: 6,
    options: [11, 12, 13, 15],
    correctAnswer: 2, // 13 (Fibonacci)
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 7,
    type: 'verbal',
    answerType: 'multiple_choice',
    question: 'Rearrange "CIFAIPC" to form a word. What category does it belong to?',
    options: ['Animal', 'City', 'Ocean', 'Country'],
    correctAnswer: 2, // Ocean (PACIFIC)
    difficulty: 3,
    timeLimit: 35,
  },
  {
    id: 8,
    type: 'logic',
    answerType: 'order',
    question: 'Put in order from FASTEST to SLOWEST:',
    items: ['Cheetah', 'Human', 'Turtle', 'Horse'],
    correctOrder: [0, 3, 1, 2], // Cheetah, Horse, Human, Turtle
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 9,
    type: 'math',
    answerType: 'slider',
    question: 'If 5 machines make 5 widgets in 5 minutes, how many minutes for 100 machines to make 100 widgets?',
    min: 1,
    max: 100,
    step: 1,
    correctAnswer: 5, // 5 minutes (each machine makes 1 widget in 5 min)
    tolerance: 0,
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 10,
    type: 'pattern',
    answerType: 'sequence',
    question: 'Complete the pattern:',
    sequence: ['Z', 'Y', 'X', 'W', '?'],
    missingIndex: 4,
    options: ['U', 'V', 'T', 'S'],
    correctAnswer: 1, // V (reverse alphabet)
    difficulty: 1,
    timeLimit: 15,
  },

  // --- MEDIUM (11-15) ---
  {
    id: 11,
    type: 'logic',
    answerType: 'multiple_choice',
    question: 'If no A are B, and all B are C, which MUST be true?',
    options: ['No A are C', 'Some C are not A', 'All C are B', 'Some A are C'],
    correctAnswer: 1, // Some C are not A
    difficulty: 3,
    timeLimit: 40,
  },
  {
    id: 12,
    type: 'verbal',
    answerType: 'multiple_choice',
    question: 'Which word does NOT belong?',
    options: ['Benevolent', 'Magnanimous', 'Altruistic', 'Solipsistic'],
    correctAnswer: 3, // Solipsistic (self-centered, others are generous)
    difficulty: 4,
    timeLimit: 25,
  },
  {
    id: 13,
    type: 'math',
    answerType: 'true_false',
    question: 'True or False?',
    statement: 'If you have 3 quarters, 4 dimes, and 4 pennies, you have $1.19 and cannot make exact change for a dollar.',
    correctAnswer: true,
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 14,
    type: 'spatial',
    answerType: 'slider',
    question: 'A 3x3x3 cube is painted blue on all sides. How many small cubes have exactly ONE face painted?',
    min: 0,
    max: 27,
    step: 1,
    correctAnswer: 6, // Center of each face
    tolerance: 0,
    difficulty: 4,
    timeLimit: 45,
  },
  {
    id: 15,
    type: 'pattern',
    answerType: 'sequence',
    question: 'Find the pattern:',
    sequence: [2, 3, 5, 9, 17, '?'],
    missingIndex: 5,
    options: [31, 33, 35, 37],
    correctAnswer: 1, // 33 (differences double: +1, +2, +4, +8, +16)
    difficulty: 3,
    timeLimit: 35,
  },

  // --- HARD (16-20) ---
  {
    id: 16,
    type: 'logic',
    answerType: 'multiple_choice',
    question: 'Alex is before Ben but behind Chris. David is before Eric but behind Ben. Who is 3rd?',
    options: ['Alex', 'Ben', 'Chris', 'David'],
    correctAnswer: 1, // Ben (Order: Chris, Alex, Ben, David, Eric)
    difficulty: 4,
    timeLimit: 45,
  },
  {
    id: 17,
    type: 'math',
    answerType: 'multiple_choice',
    question: 'A lily doubles in size daily. It takes 48 days to cover a pond. How many days to cover HALF?',
    options: ['24', '47', '12', '46'],
    correctAnswer: 1, // 47 days
    difficulty: 4,
    timeLimit: 30,
  },
  {
    id: 18,
    type: 'logic',
    answerType: 'true_false',
    question: 'True or False?',
    statement: 'Looking at a photo: "This man\'s father is my father\'s son" (you have no siblings). The photo shows your son.',
    correctAnswer: true, // "My father's son" = you, so "this man's father" = you
    difficulty: 4,
    timeLimit: 45,
  },
  {
    id: 19,
    type: 'spatial',
    answerType: 'slider',
    question: 'At 3:15, what\'s the angle between clock hands? (in degrees)',
    min: 0,
    max: 90,
    step: 0.5,
    correctAnswer: 7.5,
    tolerance: 1,
    difficulty: 5,
    timeLimit: 45,
  },
  {
    id: 20,
    type: 'pattern',
    answerType: 'sequence',
    question: 'What comes next?',
    sequence: [1, 2, 6, 15, 31, '?'],
    missingIndex: 5,
    options: [52, 56, 63, 65],
    correctAnswer: 1, // 56 (differences are squares: +1, +4, +9, +16, +25)
    difficulty: 4,
    timeLimit: 40,
  },

  // --- ELITE (21-25) ---
  {
    id: 21,
    type: 'logic',
    answerType: 'slider',
    question: '12 coins, one is fake (lighter or heavier). Minimum weighings to GUARANTEE finding it?',
    min: 1,
    max: 6,
    step: 1,
    correctAnswer: 3,
    tolerance: 0,
    difficulty: 5,
    timeLimit: 40,
  },
  {
    id: 22,
    type: 'verbal',
    answerType: 'order',
    question: 'Arrange these words to form a logical sentence:',
    items: ['always', 'not', 'is', 'silence', 'golden'],
    correctOrder: [3, 2, 1, 0, 4], // "Silence is not always golden"
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 23,
    type: 'math',
    answerType: 'multiple_choice',
    question: 'If x² - y² = 13 and x, y are positive integers, what is x?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2, // 7 (x+y=13, x-y=1 → x=7)
    difficulty: 5,
    timeLimit: 50,
  },
  {
    id: 24,
    type: 'pattern',
    answerType: 'multiple_choice',
    question: '10, 9, 60, 90, 70, 66, __. Hint: Think letters.',
    options: ['96', '10', '12', '80'],
    correctAnswer: 0, // 96 (number of letters: ten=3, nine=4, sixty=5... ninety-six=9)
    difficulty: 5,
    timeLimit: 60,
  },
  {
    id: 25,
    type: 'logic',
    answerType: 'multiple_choice',
    question: 'Two trains head toward each other: 60mph and 80mph, 280 miles apart. When they meet, which is closer to Boston?',
    options: ['60mph train', '80mph train', 'Same distance', 'Need more info'],
    correctAnswer: 2, // Same - they're at the same point!
    difficulty: 5,
    timeLimit: 30,
  },
  {
    id: 26,
    type: 'memory',
    answerType: 'multi_select',
    question: 'Select all items that are planets:',
    options: ['Venus', 'Saturn', 'Sirius', 'Neptune', 'Polaris'],
    correctAnswers: [0, 1, 3],
    minSelections: 2,
    maxSelections: 3,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 27,
    type: 'visual',
    answerType: 'sequence',
    question: 'Complete the shape sequence:',
    sequence: ['▲', '▲▲', '▲▲▲', '?'],
    missingIndex: 3,
    options: ['▲▲', '▲▲▲▲', '▲▲▲▲▲', '▲'],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 28,
    type: 'logic',
    answerType: 'multi_select',
    question: 'From the statements "All coders are learners" and "Some learners are mentors", which can be true? Select all that apply.',
    options: [
      'Some coders are mentors',
      'No coders are mentors',
      'All mentors are coders',
      'Some mentors are learners',
    ],
    correctAnswers: [0, 1, 3],
    minSelections: 1,
    maxSelections: 3,
    difficulty: 4,
    timeLimit: 40,
  },
  {
    id: 29,
    type: 'math',
    answerType: 'slider',
    question: 'What is the median of 4, 7, 9, 10, 11, 15?',
    min: 4,
    max: 15,
    step: 0.5,
    correctAnswer: 9.5,
    tolerance: 0,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 30,
    type: 'verbal',
    answerType: 'multiple_choice',
    question: 'Choose the best synonym for "meticulous":',
    options: ['Careless', 'Precise', 'Loud', 'Flexible'],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 20,
  },
];

export function calculateIQ(correctAnswers: number, totalQuestions: number): { iq: number; percentile: number } {
  const percentage = correctAnswers / totalQuestions;

  // More nuanced IQ mapping (70 to 145 range)
  let iq: number;
  if (percentage >= 0.96) iq = 145;
  else if (percentage >= 0.92) iq = 140;
  else if (percentage >= 0.88) iq = 135;
  else if (percentage >= 0.84) iq = 130;
  else if (percentage >= 0.80) iq = 125;
  else if (percentage >= 0.72) iq = 120;
  else if (percentage >= 0.64) iq = 115;
  else if (percentage >= 0.56) iq = 110;
  else if (percentage >= 0.48) iq = 105;
  else if (percentage >= 0.40) iq = 100;
  else if (percentage >= 0.32) iq = 95;
  else if (percentage >= 0.24) iq = 90;
  else if (percentage >= 0.16) iq = 85;
  else if (percentage >= 0.08) iq = 80;
  else iq = 75;

  // Calculate percentile from z-score
  const z = (iq - 100) / 15;
  const percentileDec = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI)));
  let percentile = Math.round(percentileDec * 100);
  percentile = Math.max(1, Math.min(99, percentile));

  return { iq, percentile };
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    pattern: 'Pattern Recognition',
    logic: 'Logical Reasoning',
    verbal: 'Verbal Intelligence',
    math: 'Mathematical Ability',
    spatial: 'Spatial Awareness',
    memory: 'Working Memory',
    visual: 'Visual Processing',
  };
  return labels[type];
}

export function getEngagementMessage(questionIndex: number): { message: string; type: string } | null {
  const msg = engagementMessages.find(m => m.threshold === questionIndex + 1);
  return msg ? { message: msg.message, type: msg.type } : null;
}
