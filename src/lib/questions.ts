export interface Question {
  id: number;
  type: 'pattern' | 'logic' | 'verbal' | 'math' | 'spatial';
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  difficulty: number; // 1-5
  timeLimit: number; // seconds
}

export const questions: Question[] = [
  // --- WARMUP (1-4): Engages the user, establishes the formats ---
  {
    id: 1,
    type: 'pattern',
    question: 'What comes next? 2, 3, 5, 9, 17, __',
    options: ['25', '32', '33', '35'],
    correctAnswer: 2, // 33 (Differences are powers of 2: +1, +2, +4, +8, +16)
    difficulty: 2,
    timeLimit: 30,
  },
  {
    id: 2,
    type: 'verbal',
    question: 'EPHEMERAL is to FLEETING as PERENNIAL is to:',
    options: ['Plant', 'Enduring', 'Seasonal', 'Beautiful'],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 3,
    type: 'math',
    question: 'A bat and a ball cost $1.10 in total. The bat costs exactly $1.00 more than the ball. How much does the ball cost?',
    options: ['$0.10', '$0.05', '$0.15', '$1.00'],
    correctAnswer: 1, // $0.05
    difficulty: 2,
    timeLimit: 30,
  },
  {
    id: 4,
    type: 'spatial',
    question: 'If you fold a perfectly square piece of paper in half horizontally, then in half vertically, and punch one hole through the center of the resulting square, how many holes will the paper have when completely unfolded?',
    options: ['1', '2', '4', '8'],
    correctAnswer: 2, // 4
    difficulty: 2,
    timeLimit: 25,
  },

  // --- MEDIUM (5-12): Requires focused thought and scratchpad logic ---
  {
    id: 5,
    type: 'logic',
    question: 'If no A are B, and all B are C, which of the following MUST be true?',
    options: [
      'No A are C',
      'Some C are not A',
      'All C are B',
      'Some A are C'
    ],
    correctAnswer: 1, 
    difficulty: 3,
    timeLimit: 40,
  },
  {
    id: 6,
    type: 'pattern',
    question: 'What comes next? 1, 2, 6, 15, 31, __',
    options: ['45', '56', '62', '64'],
    correctAnswer: 1, // 56 (Differences are squares: +1, +4, +9, +16, +25)
    difficulty: 3,
    timeLimit: 35,
  },
  {
    id: 7,
    type: 'verbal',
    question: 'Rearrange the letters "CIFAIPC" to form a word. What category does this word belong to?',
    options: ['An Animal', 'A City', 'An Ocean', 'A Country'],
    correctAnswer: 2, // Ocean (PACIFIC)
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 8,
    type: 'logic',
    question: 'Five runners finish a race. Alex finishes before Ben but behind Chris. David finishes before Eric but behind Ben. Who finished in third place?',
    options: ['Alex', 'Ben', 'Chris', 'David'],
    correctAnswer: 1, // Order: Chris, Alex, Ben, David, Eric
    difficulty: 3,
    timeLimit: 45,
  },
  {
    id: 9,
    type: 'math',
    question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
    options: ['1 minute', '5 minutes', '20 minutes', '100 minutes'],
    correctAnswer: 1, // 5 minutes (each machine makes 1 widget in 5 minutes)
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 10,
    type: 'spatial',
    question: 'Imagine a 3x3x3 solid cube made of 27 smaller blocks. If you paint the entire outside of the large cube blue, how many of the smaller blocks will have exactly ONE side painted blue?',
    options: ['4', '6', '8', '12'],
    correctAnswer: 1, // 6 (The center block on each of the 6 faces)
    difficulty: 4,
    timeLimit: 45,
  },
  {
    id: 11,
    type: 'pattern',
    question: 'What comes next? Z, X, U, Q, __',
    options: ['M', 'L', 'K', 'J'],
    correctAnswer: 1, // L (Skip 1 letter, then 2, then 3, then 4)
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 12,
    type: 'verbal',
    question: 'Which word does NOT belong with the others?',
    options: ['Benevolent', 'Magnanimous', 'Altruistic', 'Solipsistic'],
    correctAnswer: 3, // Solipsistic (Self-centered, others are generous)
    difficulty: 4,
    timeLimit: 25,
  },

  // --- HARD (13-17): The separator questions for higher percentiles ---
  {
    id: 13,
    type: 'math',
    question: 'A water lily doubles in size every day. It takes 48 days for the lily to completely cover a pond. How long did it take for the lily to cover exactly half the pond?',
    options: ['24 days', '47 days', '12 days', '46 days'],
    correctAnswer: 1, // 47 days
    difficulty: 4,
    timeLimit: 30,
  },
  {
    id: 14,
    type: 'logic',
    question: 'You are looking at a photograph of a man. You have no brothers or sisters. The father of the man in the photograph is your father\'s son. Who is in the photograph?',
    options: ['Your father', 'Yourself', 'Your son', 'Your nephew'],
    correctAnswer: 2, // Your son ("your father's son" is you, so the man's father is you)
    difficulty: 4,
    timeLimit: 50,
  },
  {
    id: 15,
    type: 'pattern',
    question: 'What comes next? 3, 4, 8, 17, 33, 58, __',
    options: ['88', '92', '94', '102'],
    correctAnswer: 2, // 94 (Differences: 1, 4, 9, 16, 25, 36)
    difficulty: 4,
    timeLimit: 45,
  },
  {
    id: 16,
    type: 'math',
    question: 'Let $x$ and $y$ be positive integers. If $x^2 - y^2 = 13$, what is the value of $x$?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2, // 7. Factors of 13 are 13 and 1. (x-y)(x+y) = 13. x+y=13, x-y=1. 2x=14, x=7.
    difficulty: 4,
    timeLimit: 60,
  },
  {
    id: 17,
    type: 'spatial',
    question: 'An analog clock displays the time as exactly 3:15. What is the angle in degrees between the hour hand and the minute hand?',
    options: ['0°', '7.5°', '15°', '22.5°'],
    correctAnswer: 1, // 7.5° (Minute hand is at 90°, hour hand has moved 1/4 of the way between 3 and 4: 90° + 7.5°)
    difficulty: 5,
    timeLimit: 60,
  },

  // --- ELITE (18-20): High cognitive load, strict time limits ---
  {
    id: 18,
    type: 'logic',
    question: 'You have 12 seemingly identical coins. One is counterfeit and weighs slightly more or less than the others. Using a balance scale, what is the absolute minimum number of weighings required to guarantee you find the fake coin?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1, // 3 weighings
    difficulty: 5,
    timeLimit: 45, // Time limit is strict here so they can't physically map out the whole tree
  },
  {
    id: 19,
    type: 'pattern',
    question: 'Find the missing number in the sequence: 10, 9, 60, 90, 70, 66, __',
    options: ['96', '10', '12', '14'],
    correctAnswer: 0, // 96 (Ten(3), Nine(4), Sixty(5), Ninety(6), Seventy(7), Sixty-six(8), Ninety-six(9 letters))
    difficulty: 5,
    timeLimit: 60,
  },
  {
    id: 20,
    type: 'math',
    question: 'A train leaves New York for Boston traveling at 60 mph. At the exact same time, a train leaves Boston for New York traveling at 80 mph. The distance between the cities is 280 miles. When the trains meet, which one is closer to Boston?',
    options: ['The train from New York', 'The train from Boston', 'They are at the same distance', 'Cannot be determined'],
    correctAnswer: 2, // When they meet, they are at the exact same location.
    difficulty: 5,
    timeLimit: 30, // Tricking them into doing complex math instead of realizing the semantic trick
  },
];

export function calculateIQ(correctAnswers: number, totalQuestions: number): { iq: number; percentile: number } {
  // Deterministic calculation for SaaS reliability
  const percentage = correctAnswers / totalQuestions;

  // Base IQ mapping (70 to 140 range)
  const iq = Math.round(70 + (percentage * 70)); 

  // Calculate standard score (z-score) based on Mean 100, SD 15
  const z = (iq - 100) / 15;

  // Approximate the Standard Normal CDF to get an accurate percentile
  const percentileDec = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI)));
  let percentile = Math.round(percentileDec * 100);
  
  // Floor/ceiling bounds
  percentile = Math.max(1, Math.min(99, percentile));

  return { iq, percentile };
}

export function getQuestionTypeLabel(type: Question['type']): string {
  const labels = {
    pattern: 'Pattern Recognition',
    logic: 'Logical Reasoning',
    verbal: 'Verbal Intelligence',
    math: 'Mathematical Ability',
    spatial: 'Spatial Awareness',
  };
  return labels[type];
}