export type CategoryQA = {
  keyword: string;
  label: string;
  rounds: QARound[];
};

export type QAOption = {
  keyword: string;
  label: string;
  terminal?: boolean;
};

export type QARound = {
  options: QAOption[];
  question: string;
};

export const qaTree: CategoryQA[] = [
  {
    keyword: 'health',
    label: 'Health & Fitness',
    rounds: [
      {
        options: [
          { keyword: 'fitness', label: 'Physical fitness' },
          { keyword: 'mental-health', label: 'Mental wellbeing', terminal: true },
          { keyword: 'diet', label: 'Healthy eating' },
          { keyword: 'sleep', label: 'Sleep & recovery', terminal: true },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your main health focus?",
      },
      {
        options: [
          { keyword: 'weight-loss', label: 'Lose weight' },
          { keyword: 'muscle', label: 'Build muscle' },
          { keyword: 'marathon', label: 'Run a marathon', terminal: true },
          { keyword: 'flexibility', label: 'Improve flexibility' },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your fitness goal?",
      },
      {
        options: [
          { keyword: 'gym', label: 'Join a gym' },
          { keyword: 'trainer', label: 'Work with a trainer', terminal: true },
          { keyword: 'online', label: 'Follow an online program' },
          { keyword: 'home', label: 'Build a home routine' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How do you want to get there?',
      },
      {
        options: [
          { keyword: '3-months', label: 'In 3 months' },
          { keyword: '6-months', label: 'In 6 months' },
          { keyword: '1-year', label: 'Within a year' },
          { keyword: 'lifestyle', label: 'Long-term lifestyle change', terminal: true },
        ],
        question: "What's your timeline?",
      },
    ],
  },
  {
    keyword: 'mental',
    label: 'Mental Wellness',
    rounds: [
      {
        options: [
          { keyword: 'stress', label: 'Reducing stress & anxiety', terminal: true },
          { keyword: 'confidence', label: 'Building confidence' },
          { keyword: 'joy', label: 'Finding more joy & meaning' },
          { keyword: 'focus', label: 'Improving focus' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does mental wellness mean to you?',
      },
      {
        options: [
          { keyword: 'meditation', label: 'Daily meditation', terminal: true },
          { keyword: 'therapy', label: 'Therapy or counseling', terminal: true },
          { keyword: 'journaling', label: 'Journaling habit' },
          { keyword: 'balance', label: 'Better work-life balance' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What would help most?',
      },
      {
        options: [
          { keyword: 'this-week', label: 'Start this week', terminal: true },
          { keyword: '3-months', label: 'Within 3 months' },
          { keyword: '6-months', label: 'Within 6 months' },
          { keyword: 'lifelong', label: "It's a lifelong practice", terminal: true },
        ],
        question: "What's your timeline?",
      },
    ],
  },
  {
    keyword: 'career',
    label: 'Career & Work',
    rounds: [
      {
        options: [
          { keyword: 'promotion', label: 'Get promoted' },
          { keyword: 'switch', label: 'Switch industries' },
          { keyword: 'startup', label: 'Start my own business', terminal: true },
          { keyword: 'remote', label: 'Work remotely or abroad' },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your career ambition?",
      },
      {
        options: [
          { keyword: 'skills', label: 'Learn new skills' },
          { keyword: 'network', label: 'Build my network' },
          { keyword: 'certification', label: 'Get a certification', terminal: true },
          { keyword: 'mentor', label: 'Find a mentor' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What will move you forward?',
      },
      {
        options: [
          { keyword: 'leadership', label: 'Leadership role' },
          { keyword: 'creative', label: 'Creative work' },
          { keyword: 'technical', label: 'Technical expertise' },
          { keyword: 'entrepreneur', label: 'Entrepreneurship', terminal: true },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What kind of work do you want?',
      },
      {
        options: [
          { keyword: '1-year', label: 'Within 1 year' },
          { keyword: '3-years', label: 'Within 3 years' },
          { keyword: '5-years', label: 'Within 5 years' },
          { keyword: 'no-deadline', label: 'No set deadline' },
        ],
        question: 'When do you want to achieve this?',
      },
    ],
  },
  {
    keyword: 'finance',
    label: 'Finance',
    rounds: [
      {
        options: [
          { keyword: 'emergency-fund', label: 'Build an emergency fund', terminal: true },
          { keyword: 'debt-free', label: 'Pay off debt', terminal: true },
          { keyword: 'investment', label: 'Grow investments' },
          { keyword: 'big-purchase', label: 'Save for a big purchase' },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your financial priority?",
      },
      {
        options: [
          { keyword: '3-months-expenses', label: '3 months of expenses' },
          { keyword: 'home', label: 'Buy a home' },
          { keyword: 'retirement', label: 'Retirement fund' },
          { keyword: 'fire', label: 'Financial independence', terminal: true },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your savings goal?",
      },
      {
        options: [
          { keyword: 'cut-expenses', label: 'Cut expenses' },
          { keyword: 'increase-income', label: 'Increase income' },
          { keyword: 'invest', label: 'Invest consistently', terminal: true },
          { keyword: 'learn-finance', label: 'Learn about personal finance' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How will you get there?',
      },
      {
        options: [
          { keyword: '1-year', label: 'Within 1 year' },
          { keyword: '3-years', label: 'Within 3 years' },
          { keyword: '5-years', label: 'Within 5 years' },
          { keyword: '10-years', label: '10+ years' },
        ],
        question: "What's your target timeframe?",
      },
    ],
  },
  {
    keyword: 'relationships',
    label: 'Relationships',
    rounds: [
      {
        options: [
          { keyword: 'partnership', label: 'Building a committed partnership' },
          { keyword: 'friendships', label: 'Deepening friendships' },
          { keyword: 'family', label: 'Reconnecting with family' },
          { keyword: 'social', label: 'Expanding my social circle' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What matters most in your relationships?',
      },
      {
        options: [
          { keyword: 'quality-time', label: 'More quality time together', terminal: true },
          { keyword: 'communication', label: 'Better communication' },
          { keyword: 'boundaries', label: 'Setting healthy boundaries', terminal: true },
          { keyword: 'meet-people', label: 'Meeting new people' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What would make your relationships better?',
      },
      {
        options: [
          { keyword: 'busy', label: 'Busy schedule' },
          { keyword: 'past-hurts', label: 'Past hurts' },
          { keyword: 'distance', label: 'Living far from loved ones' },
          { keyword: 'anxiety', label: 'Social anxiety' },
          { keyword: 'nothing', label: "Nothing — I just want to grow" },
        ],
        question: "What's holding you back?",
      },
      {
        options: [
          { keyword: 'this-month', label: 'This month', terminal: true },
          { keyword: '6-months', label: 'Within 6 months' },
          { keyword: '1-year', label: 'Within a year' },
          { keyword: 'ongoing', label: "It's ongoing" },
        ],
        question: 'When do you want to see a change?',
      },
    ],
  },
  {
    keyword: 'learning',
    label: 'Education & Learning',
    rounds: [
      {
        options: [
          { keyword: 'language', label: 'A new language', terminal: true },
          { keyword: 'technical', label: 'A technical skill (coding, design, etc.)' },
          { keyword: 'degree', label: 'A professional degree or certification' },
          { keyword: 'creative-skill', label: 'Creative skills (music, writing, art)' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What do you want to learn?',
      },
      {
        options: [
          { keyword: 'career', label: 'For my career' },
          { keyword: 'personal', label: 'For personal growth' },
          { keyword: 'fun', label: 'For fun and curiosity', terminal: true },
          { keyword: 'help-others', label: 'To help others' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'Why do you want to learn this?',
      },
      {
        options: [
          { keyword: 'online-course', label: 'Online courses' },
          { keyword: 'university', label: 'University or school' },
          { keyword: 'self-study', label: 'Self-study', terminal: true },
          { keyword: 'bootcamp', label: 'Bootcamp or intensive program', terminal: true },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How will you learn?',
      },
      {
        options: [
          { keyword: 'certified', label: 'Get certified or qualified' },
          { keyword: 'portfolio', label: 'Build a project or portfolio', terminal: true },
          { keyword: 'conversational', label: 'Reach conversational level' },
          { keyword: 'basics', label: 'Master the basics' },
        ],
        question: "What's your goal?",
      },
    ],
  },
  {
    keyword: 'travel',
    label: 'Travel & Adventure',
    rounds: [
      {
        options: [
          { keyword: 'world', label: 'Seeing the world' },
          { keyword: 'relocate', label: 'Living abroad long-term', terminal: true },
          { keyword: 'culture', label: 'Cultural immersion' },
          { keyword: 'adventure', label: 'Adventure and nature' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does travel mean to you?',
      },
      {
        options: [
          { keyword: 'europe', label: 'Europe' },
          { keyword: 'east-asia', label: 'East Asia' },
          { keyword: 'americas', label: 'Americas' },
          { keyword: 'southeast-asia', label: 'Southeast Asia' },
          { keyword: 'everywhere', label: 'Everywhere', terminal: true },
        ],
        question: 'Where do you want to go?',
      },
      {
        options: [
          { keyword: 'solo', label: 'Solo backpacking', terminal: true },
          { keyword: 'cultural', label: 'Cultural deep-dives' },
          { keyword: 'road-trip', label: 'Road trips' },
          { keyword: 'luxury', label: 'Luxury travel' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What kind of travel?',
      },
      {
        options: [
          { keyword: '6-months', label: 'Within 6 months', terminal: true },
          { keyword: '1-year', label: 'Within 1 year' },
          { keyword: '3-years', label: 'Within 3 years' },
          { keyword: 'whenever', label: 'Whenever I can afford it' },
        ],
        question: 'When do you want to make it happen?',
      },
    ],
  },
  {
    keyword: 'creativity',
    label: 'Creativity & Hobbies',
    rounds: [
      {
        options: [
          { keyword: 'music', label: 'Music (playing or producing)' },
          { keyword: 'art', label: 'Visual art or design' },
          { keyword: 'writing', label: 'Writing or storytelling' },
          { keyword: 'photo-video', label: 'Photography or video' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What creative area excites you?',
      },
      {
        options: [
          { keyword: 'release', label: 'Release a song or album', terminal: true },
          { keyword: 'portfolio', label: 'Build a portfolio' },
          { keyword: 'project', label: 'Finish a personal project', terminal: true },
          { keyword: 'fundamentals', label: 'Learn the fundamentals' },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your creative goal?",
      },
      {
        options: [
          { keyword: 'fun', label: 'Just for fun', terminal: true },
          { keyword: 'semi-pro', label: 'Semi-professional' },
          { keyword: 'main-career', label: 'Make it my main career' },
          { keyword: 'side-income', label: 'Build a side income' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How serious do you want to get?',
      },
      {
        options: [
          { keyword: 'this-year', label: 'This year' },
          { keyword: '2-years', label: 'Within 2 years' },
          { keyword: 'ongoing', label: "It's an ongoing practice", terminal: true },
          { keyword: 'whenever', label: 'Whenever inspiration hits', terminal: true },
        ],
        question: "What's your timeline?",
      },
    ],
  },
  {
    keyword: 'growth',
    label: 'Personal Growth',
    rounds: [
      {
        options: [
          { keyword: 'habits', label: 'Building better habits' },
          { keyword: 'fears', label: 'Overcoming fears' },
          { keyword: 'purpose', label: 'Finding my purpose', terminal: true },
          { keyword: 'mindset', label: 'Improving my mindset' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What does personal growth mean to you?',
      },
      {
        options: [
          { keyword: 'morning-routine', label: 'Morning routine', terminal: true },
          { keyword: 'exercise', label: 'Daily exercise' },
          { keyword: 'reading', label: 'Reading or learning daily' },
          { keyword: 'mindfulness', label: 'Mindfulness or meditation' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What habit do you want to build?',
      },
      {
        options: [
          { keyword: 'consistency', label: 'Staying consistent' },
          { keyword: 'self-doubt', label: 'Self-doubt' },
          { keyword: 'time', label: 'Lack of time' },
          { keyword: 'start', label: 'Knowing where to start' },
          { keyword: 'others', label: 'Others' },
        ],
        question: "What's your biggest challenge?",
      },
      {
        options: [
          { keyword: 'feel-different', label: 'I feel different inside', terminal: true },
          { keyword: 'consistent-habit', label: "I've built a consistent habit" },
          { keyword: 'others-notice', label: 'Others notice a change' },
          { keyword: 'milestone', label: 'I hit a specific milestone' },
        ],
        question: 'How will you measure success?',
      },
    ],
  },
  {
    keyword: 'impact',
    label: 'Social Impact',
    rounds: [
      {
        options: [
          { keyword: 'environment', label: 'Environmental sustainability' },
          { keyword: 'education', label: 'Education for underserved communities', terminal: true },
          { keyword: 'mental-health', label: 'Mental health awareness' },
          { keyword: 'inequality', label: 'Economic inequality' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'What cause matters most to you?',
      },
      {
        options: [
          { keyword: 'volunteer', label: 'Volunteer regularly', terminal: true },
          { keyword: 'nonprofit', label: 'Start or join a non-profit', terminal: true },
          { keyword: 'donate', label: 'Donate consistently' },
          { keyword: 'awareness', label: 'Raise awareness online' },
          { keyword: 'others', label: 'Others' },
        ],
        question: 'How do you want to make an impact?',
      },
      {
        options: [
          { keyword: 'start-now', label: 'I want to start now', terminal: true },
          { keyword: '6-months', label: 'Within 6 months' },
          { keyword: '1-year', label: 'Within a year' },
          { keyword: 'figuring-out', label: "I'm still figuring it out" },
        ],
        question: "What's your timeline for action?",
      },
      {
        options: [
          { keyword: 'local', label: 'My local community' },
          { keyword: 'national', label: 'My country' },
          { keyword: 'global', label: 'Global reach' },
          { keyword: 'whatever', label: 'Whatever I can do' },
        ],
        question: 'What scale of impact do you envision?',
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
