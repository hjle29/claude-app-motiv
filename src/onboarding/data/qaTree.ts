export type QAOption = {
  keyword: string;
  label: string;
};

export type QARound = {
  options: QAOption[];
  question: string;
};

export type CategoryQA = {
  keyword: string;
  label: string;
  rounds: [QARound, QARound, QARound];
};

export const qaTree: CategoryQA[] = [
  {
    keyword: 'family',
    label: 'Family',
    rounds: [
      {
        options: [
          { keyword: 'start-family', label: 'Starting a family' },
          { keyword: 'raise-children', label: 'Raising children' },
          { keyword: 'support-parents', label: 'Supporting parents' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What matters most to you about family?',
      },
      {
        options: [
          { keyword: 'marriage', label: 'Getting married' },
          { keyword: 'home', label: 'Building a home' },
          { keyword: 'financial-stability', label: 'Financial stability' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does that look like for you?',
      },
      {
        options: [
          { keyword: 'by-30', label: 'By age 30' },
          { keyword: 'by-35', label: 'By age 35' },
          { keyword: 'by-40', label: 'By age 40' },
          { keyword: 'no-rush', label: 'No specific timeline' },
        ],
        question: 'When would you like this to happen?',
      },
    ],
  },
  {
    keyword: 'health',
    label: 'Health',
    rounds: [
      {
        options: [
          { keyword: 'fitness', label: 'Physical fitness' },
          { keyword: 'mental-health', label: 'Mental wellbeing' },
          { keyword: 'diet', label: 'Healthy eating' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does a healthy life mean to you?',
      },
      {
        options: [
          { keyword: 'weight-loss', label: 'Lose weight' },
          { keyword: 'muscle', label: 'Build strength' },
          { keyword: 'endurance', label: 'Improve endurance' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What is your primary health goal?',
      },
      {
        options: [
          { keyword: '3-months', label: 'In 3 months' },
          { keyword: '6-months', label: 'In 6 months' },
          { keyword: '1-year', label: 'Within a year' },
          { keyword: 'lifestyle', label: 'Long-term lifestyle' },
        ],
        question: 'What is your target timeframe?',
      },
    ],
  },
  {
    keyword: 'money',
    label: 'Money',
    rounds: [
      {
        options: [
          { keyword: 'savings', label: 'Build savings' },
          { keyword: 'investment', label: 'Grow investments' },
          { keyword: 'debt-free', label: 'Become debt-free' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What is your financial priority?',
      },
      {
        options: [
          { keyword: 'emergency-fund', label: 'Emergency fund' },
          { keyword: 'retirement', label: 'Retirement fund' },
          { keyword: 'property', label: 'Buy property' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What would you like to achieve with money?',
      },
      {
        options: [
          { keyword: '10m', label: '10 million KRW' },
          { keyword: '50m', label: '50 million KRW' },
          { keyword: '100m', label: '100 million KRW' },
          { keyword: 'custom', label: 'My own target' },
        ],
        question: 'What is your target amount?',
      },
    ],
  },
  {
    keyword: 'career',
    label: 'Career',
    rounds: [
      {
        options: [
          { keyword: 'promotion', label: 'Get promoted' },
          { keyword: 'abroad', label: 'Work abroad' },
          { keyword: 'startup', label: 'Start my own business' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What is your career ambition?',
      },
      {
        options: [
          { keyword: 'skills', label: 'Learn new skills' },
          { keyword: 'network', label: 'Build my network' },
          { keyword: 'portfolio', label: 'Build a portfolio' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How do you plan to get there?',
      },
      {
        options: [
          { keyword: '1-year', label: 'Within 1 year' },
          { keyword: '3-years', label: 'Within 3 years' },
          { keyword: '5-years', label: 'Within 5 years' },
          { keyword: 'no-deadline', label: 'No set deadline' },
        ],
        question: 'What is your target timeframe?',
      },
    ],
  },
  {
    keyword: 'travel',
    label: 'Travel',
    rounds: [
      {
        options: [
          { keyword: 'world-tour', label: 'Travel the world' },
          { keyword: 'relocate', label: 'Live abroad' },
          { keyword: 'bucket-list', label: 'Visit bucket list places' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does travel mean to you?',
      },
      {
        options: [
          { keyword: 'europe', label: 'Europe' },
          { keyword: 'americas', label: 'Americas' },
          { keyword: 'asia', label: 'Asia' },
          { keyword: 'worldwide', label: 'All over the world' },
        ],
        question: 'Where would you like to go?',
      },
      {
        options: [
          { keyword: '1-year', label: 'Within 1 year' },
          { keyword: '3-years', label: 'Within 3 years' },
          { keyword: '5-years', label: 'Within 5 years' },
          { keyword: 'whenever', label: 'Whenever I can' },
        ],
        question: 'When do you want to make it happen?',
      },
    ],
  },
];

// Dedicated Q&A rounds for Future Self visualization — generic life questions
// NOT tied to any category so they work regardless of which goal is selected
export const futureSelfRounds: [QARound, QARound, QARound] = [
  {
    options: [
      { keyword: 'location', label: 'Where I live' },
      { keyword: 'relationships', label: 'My relationships' },
      { keyword: 'work', label: 'My work' },
      { keyword: 'lifestyle', label: 'My lifestyle' },
    ],
    question: 'What has changed most in your life?',
  },
  {
    options: [
      { keyword: 'peace', label: 'A sense of peace' },
      { keyword: 'achievement', label: 'A feeling of achievement' },
      { keyword: 'connection', label: 'Deep connections' },
      { keyword: 'freedom', label: 'Freedom and flexibility' },
    ],
    question: 'What does your daily life feel like?',
  },
  {
    options: [
      { keyword: 'proud', label: "I'm proud of the choices I made" },
      { keyword: 'grateful', label: "I'm grateful for the journey" },
      { keyword: 'inspired', label: 'I feel inspired every day' },
      { keyword: 'balanced', label: 'I finally feel balanced' },
    ],
    question: 'What would your future self say to you now?',
  },
];
