// src/constants/goalWizard.ts

export const LIFE_AREAS = [
  'Health & Fitness',
  'Money & Finance',
  'Family',
  'Career & Work',
  'Love & Relationships',
  'Travel & Adventure',
  'Education & Learning',
  'Personal Growth',
  'Creativity & Hobbies',
  'Mindfulness & Wellbeing',
] as const;

export type LifeArea = (typeof LIFE_AREAS)[number];

// Category = life area name (Goal.category is z.string(), no migration needed)
export const LIFE_AREA_TO_CATEGORY: Record<string, string> = {
  'Health & Fitness':        'Health & Fitness',
  'Money & Finance':         'Money & Finance',
  'Family':                  'Family',
  'Career & Work':           'Career & Work',
  'Love & Relationships':    'Love & Relationships',
  'Travel & Adventure':      'Travel & Adventure',
  'Education & Learning':    'Education & Learning',
  'Personal Growth':         'Personal Growth',
  'Creativity & Hobbies':    'Creativity & Hobbies',
  'Mindfulness & Wellbeing': 'Mindfulness & Wellbeing',
};

export const SUB_AREA_L1_FALLBACKS: Record<string, string[]> = {
  'Health & Fitness':        ['Weight loss', 'Build strength', 'Sleep better', 'Exercise', 'Diet'],
  'Money & Finance':         ['Saving', 'Investing', 'Retirement', 'Debt', 'Income'],
  'Family':                  ['Parenting', 'Marriage', 'Having kids', 'Siblings', 'Home'],
  'Career & Work':           ['Promotion', 'New job', 'Skills', 'Business', 'Work-life balance'],
  'Love & Relationships':    ['Finding a partner', 'Improve relationship', 'Marriage', 'Communication', 'Intimacy'],
  'Travel & Adventure':      ['Solo travel', 'Family trip', 'Live abroad', 'Explore a country', 'Road trip'],
  'Education & Learning':    ['Degree', 'New skill', 'Language', 'Online course', 'Reading'],
  'Personal Growth':         ['Confidence', 'Habits', 'Self-discipline', 'Mindset', 'Identity'],
  'Creativity & Hobbies':    ['Music', 'Art', 'Writing', 'Photography', 'Cooking'],
  'Mindfulness & Wellbeing': ['Meditation', 'Stress', 'Anxiety', 'Gratitude', 'Balance'],
};
