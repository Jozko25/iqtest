export interface Question {
  id: number;
  type: 'pattern' | 'logic' | 'verbal' | 'math' | 'spatial';
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: number; // 1-5
  timeLimit: number; // seconds
}

export const questions: Question[] = [
  // Easy warmup (1-3) - Build confidence
  {
    id: 1,
    type: 'pattern',
    question: 'What comes next? 2, 4, 6, 8, __',
    options: ['9', '10', '12', '14'],
    correctAnswer: 1,
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 2,
    type: 'verbal',
    question: 'Which word does NOT belong?',
    options: ['Apple', 'Banana', 'Carrot', 'Orange'],
    correctAnswer: 2,
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 3,
    type: 'logic',
    question: 'If all roses are flowers, and some flowers fade quickly, which is true?',
    options: [
      'All roses fade quickly',
      'Some roses may fade quickly',
      'No roses fade quickly',
      'Roses are not flowers'
    ],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 30,
  },

  // Medium (4-10) - Core engagement
  {
    id: 4,
    type: 'pattern',
    question: 'What comes next? 1, 1, 2, 3, 5, 8, __',
    options: ['11', '12', '13', '15'],
    correctAnswer: 2,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 5,
    type: 'spatial',
    question: 'If you fold a square paper in half diagonally, what shape do you get?',
    options: ['Rectangle', 'Triangle', 'Pentagon', 'Trapezoid'],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 6,
    type: 'math',
    question: 'A shirt costs $20 after a 20% discount. What was the original price?',
    options: ['$24', '$25', '$26', '$28'],
    correctAnswer: 1,
    difficulty: 3,
    timeLimit: 35,
  },
  {
    id: 7,
    type: 'logic',
    question: 'Tom is taller than Jim. Jim is taller than Sam. Who is the shortest?',
    options: ['Tom', 'Jim', 'Sam', 'Cannot determine'],
    correctAnswer: 2,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 8,
    type: 'verbal',
    question: 'DOCTOR is to PATIENT as TEACHER is to:',
    options: ['School', 'Student', 'Education', 'Classroom'],
    correctAnswer: 1,
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 9,
    type: 'pattern',
    question: 'What comes next? 3, 6, 11, 18, 27, __',
    options: ['36', '38', '39', '42'],
    correctAnswer: 1,
    difficulty: 3,
    timeLimit: 35,
  },
  {
    id: 10,
    type: 'logic',
    question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
    options: ['1 minute', '5 minutes', '20 minutes', '100 minutes'],
    correctAnswer: 1,
    difficulty: 4,
    timeLimit: 45,
  },

  // Harder (11-16) - Challenge zone
  {
    id: 11,
    type: 'pattern',
    question: 'What comes next? 2, 6, 12, 20, 30, __',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    difficulty: 3,
    timeLimit: 35,
  },
  {
    id: 12,
    type: 'spatial',
    question: 'A cube has 6 faces. How many edges does it have?',
    options: ['8', '10', '12', '14'],
    correctAnswer: 2,
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 13,
    type: 'verbal',
    question: 'Find the odd one out:',
    options: ['Whale', 'Shark', 'Dolphin', 'Seal'],
    correctAnswer: 1,
    difficulty: 3,
    timeLimit: 25,
  },
  {
    id: 14,
    type: 'math',
    question: 'If 3x + 7 = 22, what is x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 15,
    type: 'logic',
    question: 'In a race, you overtake the person in 2nd place. What position are you in now?',
    options: ['1st', '2nd', '3rd', '4th'],
    correctAnswer: 1,
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 16,
    type: 'pattern',
    question: 'What comes next? 1, 4, 9, 16, 25, __',
    options: ['30', '34', '36', '49'],
    correctAnswer: 2,
    difficulty: 3,
    timeLimit: 30,
  },

  // Difficult (17-20) - Elite filter
  {
    id: 17,
    type: 'logic',
    question: 'A farmer has 17 sheep. All but 9 run away. How many sheep does he have left?',
    options: ['8', '9', '17', '0'],
    correctAnswer: 1,
    difficulty: 4,
    timeLimit: 30,
  },
  {
    id: 18,
    type: 'math',
    question: 'What is 15% of 15% of 1000?',
    options: ['15', '22.5', '30', '225'],
    correctAnswer: 1,
    difficulty: 4,
    timeLimit: 40,
  },
  {
    id: 19,
    type: 'pattern',
    question: 'What comes next? 1, 2, 6, 24, 120, __',
    options: ['240', '480', '620', '720'],
    correctAnswer: 3,
    difficulty: 5,
    timeLimit: 45,
  },
  {
    id: 20,
    type: 'logic',
    question: 'Two fathers and two sons go fishing. They each catch one fish. They bring home 3 fish. How is this possible?',
    options: [
      'One fish escaped',
      'They are grandfather, father, and son',
      'They threw one back',
      'This is impossible'
    ],
    correctAnswer: 1,
    difficulty: 5,
    timeLimit: 45,
  },
];

export function calculateIQ(correctAnswers: number, totalQuestions: number): { iq: number; percentile: number } {
  // IQ calculation based on percentage correct, scaled to standard IQ distribution
  // Mean = 100, SD = 15
  const percentage = correctAnswers / totalQuestions;

  // Map percentage to IQ range (roughly 70-145)
  // Using a curve that makes most people land 95-115
  let iq: number;

  if (percentage >= 0.95) {
    iq = 135 + Math.floor(Math.random() * 10); // 135-145
  } else if (percentage >= 0.85) {
    iq = 125 + Math.floor((percentage - 0.85) * 100); // 125-135
  } else if (percentage >= 0.70) {
    iq = 110 + Math.floor((percentage - 0.70) * 100); // 110-125
  } else if (percentage >= 0.50) {
    iq = 95 + Math.floor((percentage - 0.50) * 75); // 95-110
  } else if (percentage >= 0.30) {
    iq = 85 + Math.floor((percentage - 0.30) * 50); // 85-95
  } else {
    iq = 70 + Math.floor(percentage * 50); // 70-85
  }

  // Add small random variance for realism
  iq += Math.floor(Math.random() * 5) - 2;

  // Calculate percentile from IQ
  // Using standard normal distribution approximation
  const z = (iq - 100) / 15;
  let percentile: number;

  if (z >= 2) percentile = 98;
  else if (z >= 1.5) percentile = 93;
  else if (z >= 1) percentile = 84;
  else if (z >= 0.5) percentile = 69;
  else if (z >= 0) percentile = 50;
  else if (z >= -0.5) percentile = 31;
  else if (z >= -1) percentile = 16;
  else if (z >= -1.5) percentile = 7;
  else percentile = 2;

  // Add variance to percentile
  percentile += Math.floor(Math.random() * 5) - 2;
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
