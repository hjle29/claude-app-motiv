# Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full onboarding wizard — Goal Setup (Q&A + free text), Future Self Visualization (optional), and Steps Setup (optional) — ending with a `navigation.reset()` into the main app.

**Architecture:** Three onboarding screens in sequence. GoalSetup is the only mandatory step (min 1 goal required to proceed). FutureSelf and StepsSetup are skippable. A shared `QAFlow` component (lives in `src/onboarding/components/`) handles the 3-round multiple-choice flow used in both GoalSetup and FutureSelf. Goal statements and future self narratives are generated from template functions using the user's Q&A answers. On completion, `navigation.reset()` navigates to `MainTabs`.

**Tech Stack:** React Native 0.84, TypeScript, `@react-navigation/stack`, `react-native-mmkv` (via Plan 1 stores), `zod` v4

**Depends on:** Plan 1 — Foundation & Navigation (stores, schemas, navigation paths must exist)

**Spec:** `docs/superpowers/specs/2026-03-12-life-motivation-app-design.md`

---

## File Structure

```
src/
├── onboarding/
│   ├── components/
│   │   └── QAFlow.tsx                     # Shared 3-round Q&A component
│   ├── data/
│   │   └── qaTree.ts                      # Q&A decision tree + future self rounds
│   ├── utils/
│   │   ├── generateGoal.ts
│   │   ├── generateGoal.test.ts
│   │   ├── generateFutureSelf.ts
│   │   └── generateFutureSelf.test.ts
│   └── index.ts
├── screens/
│   └── Onboarding/
│       ├── GoalSetup/
│       │   ├── GoalSetup.tsx
│       │   ├── GoalSetup.test.tsx
│       │   └── components/
│       │       ├── CategoryButtons.tsx
│       │       └── GoalCard.tsx
│       ├── FutureSelf/
│       │   ├── FutureSelf.tsx
│       │   ├── FutureSelf.test.tsx
│       │   └── components/
│       │       ├── GoalSelector.tsx
│       │       └── TimeframeSelector.tsx
│       └── StepsSetup/
│           ├── StepsSetup.tsx
│           ├── StepsSetup.test.tsx
│           └── components/
│               └── StepForm.tsx
└── theme/
    └── _config.ts                         # Add sizes 8, 10, 14 (Task 0)
```

---

## Chunk 0: Theme Config Extension

### Task 0: Add missing theme sizes

**Files:**
- Modify: `src/theme/_config.ts`

> Components in this plan need sizes 8, 10, and 14. The CLAUDE.md documents how to add sizes: add to the `sizes` array and all generators pick it up automatically.

- [ ] **Step 1: Add sizes**

In `src/theme/_config.ts`, update the `sizes` line:

```typescript
const sizes = [8, 10, 12, 14, 16, 24, 32, 40, 80] as const;
```

- [ ] **Step 2: Run type check**

```bash
cd MyApp && yarn lint:type-check
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd MyApp && git add src/theme/_config.ts
git commit -m "feat: add sizes 8, 10, 14 to theme config for onboarding components"
```

---

## Chunk 1: Q&A Data & Generation Utilities

### Task 1: Q&A tree data

**Files:**
- Create: `src/onboarding/data/qaTree.ts`

> No tests needed — this is static data. It will be exercised by the generator tests in Task 2.

- [ ] **Step 1: Create the Q&A tree**

Create `src/onboarding/data/qaTree.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/onboarding/data/qaTree.ts
git commit -m "feat: add onboarding Q&A tree data and future self rounds"
```

---

### Task 2: Goal statement generator

**Files:**
- Create: `src/onboarding/utils/generateGoal.ts`
- Create: `src/onboarding/utils/generateGoal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/onboarding/utils/generateGoal.test.ts`:

```typescript
import { extractKeywords, generateGoalStatement } from '@/onboarding/utils/generateGoal';

describe('generateGoalStatement', () => {
  it('generates a statement for a family path', () => {
    const result = generateGoalStatement('Family', ['Starting a family', 'Getting married', 'By age 35']);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(10);
  });

  it('generates a statement for a career path', () => {
    const result = generateGoalStatement('Career', ['Work abroad', 'Learn new skills', 'Within 3 years']);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it('handles Others category with free answers', () => {
    const result = generateGoalStatement('Others', ['Be happy', 'Live simply', 'Always']);
    expect(result).toBeTruthy();
  });
});

describe('extractKeywords', () => {
  it('extracts keywords from category and answer keywords', () => {
    const keywords = extractKeywords('Family', ['family', 'marriage', 'by-35']);
    expect(keywords).toContain('family');
    expect(keywords).toContain('marriage');
  });

  it('deduplicates keywords', () => {
    const keywords = extractKeywords('Family', ['family', 'family', 'marriage']);
    expect(keywords.filter(k => k === 'family')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=onboarding/utils/generateGoal
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the generator**

Create `src/onboarding/utils/generateGoal.ts`:

```typescript
const templates: Record<string, (answers: string[]) => string> = {
  Career: ([ambition, method, timeline]) =>
    `${ambition ?? 'Advance my career'} by focusing on ${(method ?? 'skill development').toLowerCase()} — ${(timeline ?? 'within a few years').toLowerCase()}.`,
  Family: ([focus, detail, timeline]) =>
    `${focus ?? 'Build a happy family'} — ${(detail ?? 'creating a loving home').toLowerCase()} ${(timeline ?? '').toLowerCase()}.`.trim(),
  Health: ([focus, goal, timeline]) =>
    `Achieve ${(goal ?? focus ?? 'better health').toLowerCase()} through consistent effort — ${(timeline ?? 'as a long-term lifestyle').toLowerCase()}.`,
  Money: ([priority, goal, target]) =>
    `${priority ?? 'Achieve financial security'} — ${(goal ?? 'grow my savings').toLowerCase()} with a target of ${(target ?? 'a meaningful amount').toLowerCase()}.`,
  Travel: ([dream, destination, timeline]) =>
    `${dream ?? 'See the world'} — explore ${(destination ?? 'new places').toLowerCase()} ${(timeline ?? 'whenever I can').toLowerCase()}.`,
};

export function generateGoalStatement(category: string, answers: string[]): string {
  const template = templates[category];
  if (template) return template(answers);
  return answers.filter(Boolean).join(', ');
}

export function extractKeywords(category: string, answerKeywords: string[]): string[] {
  const all = [category.toLowerCase(), ...answerKeywords.map(k => k.toLowerCase())];
  return [...new Set(all)];
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=onboarding/utils/generateGoal
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/onboarding/utils/generateGoal.ts src/onboarding/utils/generateGoal.test.ts
git commit -m "feat: add goal statement generator"
```

---

### Task 3: Future self narrative generator

**Files:**
- Create: `src/onboarding/utils/generateFutureSelf.ts`
- Create: `src/onboarding/utils/generateFutureSelf.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/onboarding/utils/generateFutureSelf.test.ts`:

```typescript
import { generateFutureSelfNarrative } from '@/onboarding/utils/generateFutureSelf';

describe('generateFutureSelfNarrative', () => {
  it('generates a 5yr narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['Where I live', 'A sense of peace', "I'm proud of the choices I made"],
      goalStatement: 'Build a happy family',
      timeframe: '5yr',
    });
    expect(result).toBeTruthy();
    expect(result).toContain('5 years');
  });

  it('generates a 10yr narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['My work', 'A feeling of achievement', 'I feel inspired every day'],
      goalStatement: 'Work abroad in tech',
      timeframe: '10yr',
    });
    expect(result).toContain('10 years');
  });

  it('includes the goal statement in the narrative', () => {
    const result = generateFutureSelfNarrative({
      answers: ['My lifestyle', 'Freedom and flexibility', 'I finally feel balanced'],
      goalStatement: 'Start a business',
      timeframe: '5yr',
    });
    expect(result).toContain('Start a business');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=onboarding/utils/generateFutureSelf
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the generator**

Create `src/onboarding/utils/generateFutureSelf.ts`:

```typescript
type FutureSelfInput = {
  answers: string[];
  goalStatement: string;
  timeframe: '5yr' | '10yr';
};

export function generateFutureSelfNarrative({
  answers,
  goalStatement,
  timeframe,
}: FutureSelfInput): string {
  const years = timeframe === '5yr' ? '5 years' : '10 years';
  const details = answers.filter(Boolean).join('. ');
  return `In ${years}, I look back and I'm proud of where I am. My goal was to "${goalStatement}" — and I made it happen. ${details}. Life feels different now, in the best way possible.`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=onboarding/utils/generateFutureSelf
```
Expected: PASS

- [ ] **Step 5: Create onboarding index**

Create `src/onboarding/index.ts`:

```typescript
export * from './data/qaTree';
export * from './utils/generateFutureSelf';
export * from './utils/generateGoal';
```

- [ ] **Step 6: Commit**

```bash
cd MyApp && git add src/onboarding/utils/generateFutureSelf.ts src/onboarding/utils/generateFutureSelf.test.ts src/onboarding/index.ts
git commit -m "feat: add future self narrative generator"
```

---

### Task 4: Shared QAFlow component

**Files:**
- Create: `src/onboarding/components/QAFlow.tsx`

> Lives in `src/onboarding/components/` (not inside a screen folder) so both GoalSetup and FutureSelf can import it via `@/onboarding/components/QAFlow` without cross-sibling relative paths.

- [ ] **Step 1: Create QAFlow**

Create `src/onboarding/components/QAFlow.tsx`:

```typescript
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { QARound } from '@/onboarding/data/qaTree';

type Props = {
  onComplete: (answers: string[], keywords: string[]) => void;
  rounds: [QARound, QARound, QARound];
};

function QAFlow({ onComplete, rounds }: Props) {
  const { fonts, gutters } = useTheme();
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const round = rounds[currentRound];

  const handleSelect = (label: string, keyword: string) => {
    const newAnswers = [...selectedAnswers, label];
    const newKeywords = [...selectedKeywords, keyword];

    if (currentRound < 2) {
      setSelectedAnswers(newAnswers);
      setSelectedKeywords(newKeywords);
      setCurrentRound(prev => prev + 1);
    } else {
      onComplete(newAnswers, newKeywords);
    }
  };

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
        {round.question}
      </Text>
      {round.options.map(option => (
        <TouchableOpacity
          key={option.keyword}
          onPress={() => handleSelect(option.label, option.keyword)}
          style={[gutters.marginBottom_12, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
          testID={`qa-option-${option.keyword}`}
        >
          <Text style={[fonts.size_16, fonts.gray800]}>{option.label}</Text>
        </TouchableOpacity>
      ))}
      <Text style={[fonts.size_12, fonts.gray200, gutters.marginTop_12]}>
        Step {currentRound + 1} of 3
      </Text>
    </View>
  );
}

export default QAFlow;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/onboarding/components/QAFlow.tsx
git commit -m "feat: add shared QAFlow component"
```

---

## Chunk 2: GoalSetup Screen

### Task 5: CategoryButtons component

**Files:**
- Create: `src/screens/Onboarding/GoalSetup/components/CategoryButtons.tsx`

- [ ] **Step 1: Create CategoryButtons**

Create `src/screens/Onboarding/GoalSetup/components/CategoryButtons.tsx`:

```typescript
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { qaTree } from '@/onboarding/data/qaTree';

type Props = {
  onSelect: (categoryLabel: string, categoryKeyword: string) => void;
};

const OTHERS = { keyword: 'others', label: 'Others' };

function CategoryButtons({ onSelect }: Props) {
  const { fonts, gutters, layout } = useTheme();
  const categories = [...qaTree.map(c => ({ keyword: c.keyword, label: c.label })), OTHERS];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[layout.row, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.keyword}
            onPress={() => onSelect(cat.label, cat.keyword)}
            style={[gutters.marginRight_12, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}
            testID={`category-${cat.keyword}`}
          >
            <Text style={[fonts.size_14, fonts.gray800]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default CategoryButtons;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/GoalSetup/components/CategoryButtons.tsx
git commit -m "feat: add CategoryButtons component"
```

---

### Task 6: GoalCard component

**Files:**
- Create: `src/screens/Onboarding/GoalSetup/components/GoalCard.tsx`

- [ ] **Step 1: Create GoalCard**

Create `src/screens/Onboarding/GoalSetup/components/GoalCard.tsx`:

```typescript
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { Goal } from '@/store/schemas';

type Props = {
  goal: Goal;
  onDelete: (id: string) => void;
};

function GoalCard({ goal, onDelete }: Props) {
  const { fonts, gutters, layout } = useTheme();

  return (
    <View
      style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.marginBottom_12]}
      testID={`goal-card-${goal.id}`}
    >
      <View style={layout.flex_1}>
        <Text style={[fonts.size_16, fonts.gray800]}>{goal.statement}</Text>
        <Text style={[fonts.size_12, fonts.gray200]}>{goal.keywords.join(', ')}</Text>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(goal.id)}
        testID={`goal-delete-${goal.id}`}
      >
        <Text style={[fonts.size_14, fonts.red500]}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

export default GoalCard;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/GoalSetup/components/GoalCard.tsx
git commit -m "feat: add GoalCard component"
```

---

### Task 7: GoalSetup screen

**Files:**
- Modify: `src/screens/Onboarding/GoalSetup/GoalSetup.tsx`
- Create: `src/screens/Onboarding/GoalSetup/GoalSetup.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/Onboarding/GoalSetup/GoalSetup.test.tsx`:

```typescript
// jest.mock must appear before all imports (Babel hoists at runtime, but keep first in source)
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    deleteGoal: jest.fn(),
    getGoals: jest.fn().mockReturnValue([]),
    saveGoal: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import GoalSetup from './GoalSetup';

const mockNavigate = jest.fn();
const mockReset = jest.fn();

function renderGoalSetup() {
  return render(
    <TestAppWrapper>
      <GoalSetup />
    </TestAppWrapper>,
  );
}

describe('GoalSetup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the goal input and category buttons', () => {
    renderGoalSetup();
    expect(screen.getByTestId('goal-text-input')).toBeTruthy();
    expect(screen.getByTestId('category-family')).toBeTruthy();
    expect(screen.getByTestId('category-health')).toBeTruthy();
  });

  it('tapping a category shows the Q&A flow', () => {
    renderGoalSetup();
    fireEvent.press(screen.getByTestId('category-family'));
    expect(screen.getByText('What matters most to you about family?')).toBeTruthy();
  });

  it('Continue button is disabled with no goals', () => {
    renderGoalSetup();
    expect(screen.getByTestId('continue-button')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=GoalSetup/GoalSetup
```
Expected: FAIL — placeholder screen doesn't have the required elements

- [ ] **Step 3: Implement GoalSetup screen**

Replace `src/screens/Onboarding/GoalSetup/GoalSetup.tsx`:

```typescript
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import type { Goal } from '@/store/schemas';
import { goalStore } from '@/store/goalStore';

import { qaTree } from '@/onboarding/data/qaTree';
import QAFlow from '@/onboarding/components/QAFlow';
import { extractKeywords, generateGoalStatement } from '@/onboarding/utils/generateGoal';

import { SafeScreen } from '@/components/templates';

import CategoryButtons from './components/CategoryButtons';
import GoalCard from './components/GoalCard';

const MAX_GOALS = 3;
type Mode = 'freetext' | 'idle' | 'qa';

function GoalSetup() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingGoalSetup>['navigation']>();

  const [goals, setGoals] = useState<Goal[]>(() => goalStore.getGoals());
  const [mode, setMode] = useState<Mode>('idle');
  const [activeCategory, setActiveCategory] = useState<{ keyword: string; label: string } | null>(null);
  const [freeText, setFreeText] = useState('');

  const handleCategorySelect = (label: string, keyword: string) => {
    if (keyword === 'others') {
      setMode('freetext');
      return;
    }
    setActiveCategory({ keyword, label });
    setMode('qa');
  };

  const handleQAComplete = (answers: string[], answerKeywords: string[]) => {
    if (!activeCategory) return;
    const statement = generateGoalStatement(activeCategory.label, answers);
    const keywords = extractKeywords(activeCategory.keyword, answerKeywords);
    persistGoal(statement, keywords, activeCategory.label);
    setMode('idle');
    setActiveCategory(null);
  };

  const handleFreeTextSubmit = () => {
    if (!freeText.trim()) return;
    persistGoal(freeText.trim(), ['custom'], 'Others');
    setFreeText('');
    setMode('idle');
  };

  const persistGoal = (statement: string, keywords: string[], category: string) => {
    const goal: Goal = {
      category,
      createdAt: new Date().toISOString(),
      id: `goal-${Date.now()}`,
      keywords,
      statement,
    };
    goalStore.saveGoal(goal);
    setGoals(goalStore.getGoals());
  };

  const handleDelete = (id: string) => {
    goalStore.deleteGoal(id);
    setGoals(goalStore.getGoals());
  };

  const handleContinue = () => {
    navigation.navigate(Paths.OnboardingFutureSelf);
  };

  const activeQATree = activeCategory
    ? qaTree.find(c => c.keyword === activeCategory.keyword)
    : null;

  const canAddMore = goals.length < MAX_GOALS;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          What are your life goals?
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Add up to 3 goals that matter most to you.
        </Text>

        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
        ))}

        {canAddMore && mode === 'idle' && (
          <>
            <TextInput
              onChangeText={setFreeText}
              onSubmitEditing={handleFreeTextSubmit}
              placeholder="Type your goal here..."
              returnKeyType="done"
              style={[fonts.size_16, fonts.gray800, gutters.paddingHorizontal_16, gutters.paddingVertical_12, gutters.marginBottom_16]}
              testID="goal-text-input"
              value={freeText}
            />
            <CategoryButtons onSelect={handleCategorySelect} />
          </>
        )}

        {mode === 'qa' && activeQATree && (
          <QAFlow onComplete={handleQAComplete} rounds={activeQATree.rounds} />
        )}

        {mode === 'freetext' && (
          <View>
            <TextInput
              autoFocus
              onChangeText={setFreeText}
              onSubmitEditing={handleFreeTextSubmit}
              placeholder="Describe your goal..."
              returnKeyType="done"
              style={[fonts.size_16, fonts.gray800, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
              testID="goal-freetext-input"
              value={freeText}
            />
          </View>
        )}

        <TouchableOpacity
          disabled={goals.length === 0}
          onPress={handleContinue}
          style={[gutters.marginTop_32, gutters.paddingVertical_16]}
          testID="continue-button"
        >
          <Text style={[fonts.size_16, fonts.bold, goals.length === 0 ? fonts.gray200 : fonts.gray800]}>
            Continue →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default GoalSetup;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=GoalSetup/GoalSetup
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/GoalSetup/
git commit -m "feat: implement GoalSetup screen with Q&A flow"
```

---

## Chunk 3: FutureSelf Screen

### Task 8: GoalSelector and TimeframeSelector components

**Files:**
- Create: `src/screens/Onboarding/FutureSelf/components/GoalSelector.tsx`
- Create: `src/screens/Onboarding/FutureSelf/components/TimeframeSelector.tsx`

- [ ] **Step 1: Create GoalSelector**

Create `src/screens/Onboarding/FutureSelf/components/GoalSelector.tsx`:

```typescript
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { Goal } from '@/store/schemas';

type Props = {
  goals: Goal[];
  onSelect: (goal: Goal) => void;
  selectedId: string | null;
};

function GoalSelector({ goals, onSelect, selectedId }: Props) {
  const { fonts, gutters } = useTheme();

  return (
    <View>
      <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_12]}>
        Which goal do you want to visualize?
      </Text>
      {goals.map(goal => (
        <TouchableOpacity
          key={goal.id}
          onPress={() => onSelect(goal)}
          style={[gutters.marginBottom_8, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
          testID={`goal-selector-${goal.id}`}
        >
          <Text style={[fonts.size_14, goal.id === selectedId ? fonts.gray800 : fonts.gray200, fonts.bold]}>
            {goal.statement}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default GoalSelector;
```

- [ ] **Step 2: Create TimeframeSelector**

Create `src/screens/Onboarding/FutureSelf/components/TimeframeSelector.tsx`:

```typescript
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Timeframe = '10yr' | '5yr';

type Props = {
  onSelect: (timeframe: Timeframe) => void;
  selected: Timeframe | null;
};

function TimeframeSelector({ onSelect, selected }: Props) {
  const { fonts, gutters, layout } = useTheme();
  const options: Timeframe[] = ['5yr', '10yr'];

  return (
    <View style={[layout.row, gutters.marginBottom_24]}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          style={[gutters.marginRight_12, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}
          testID={`timeframe-${option}`}
        >
          <Text style={[fonts.size_14, option === selected ? fonts.gray800 : fonts.gray200, fonts.bold]}>
            {option === '5yr' ? '5 Years' : '10 Years'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default TimeframeSelector;
```

- [ ] **Step 3: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/FutureSelf/components/
git commit -m "feat: add GoalSelector and TimeframeSelector components"
```

---

### Task 9: FutureSelf screen

**Files:**
- Modify: `src/screens/Onboarding/FutureSelf/FutureSelf.tsx`
- Create: `src/screens/Onboarding/FutureSelf/FutureSelf.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/Onboarding/FutureSelf/FutureSelf.test.tsx`:

```typescript
// jest.mock must appear before all imports
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn().mockReturnValue([]),
    getGoals: jest.fn().mockReturnValue([
      {
        category: 'Career',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['career', 'abroad'],
        statement: 'Work abroad in tech',
      },
    ]),
    saveFutureSelf: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import FutureSelf from './FutureSelf';

const mockNavigate = jest.fn();

function renderFutureSelf() {
  return render(
    <TestAppWrapper>
      <FutureSelf />
    </TestAppWrapper>,
  );
}

describe('FutureSelf', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders goal selector and skip button', () => {
    renderFutureSelf();
    expect(screen.getByTestId('goal-selector-goal-1')).toBeTruthy();
    expect(screen.getByTestId('skip-button')).toBeTruthy();
  });

  it('tapping skip navigates to StepsSetup', () => {
    renderFutureSelf();
    fireEvent.press(screen.getByTestId('skip-button'));
    expect(mockNavigate).toHaveBeenCalledWith('onboarding_steps_setup');
  });

  it('selecting a goal and timeframe shows Q&A flow', () => {
    renderFutureSelf();
    fireEvent.press(screen.getByTestId('goal-selector-goal-1'));
    fireEvent.press(screen.getByTestId('timeframe-5yr'));
    expect(screen.getByTestId('future-self-qa')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=FutureSelf/FutureSelf
```
Expected: FAIL

- [ ] **Step 3: Implement FutureSelf screen**

Replace `src/screens/Onboarding/FutureSelf/FutureSelf.tsx`:

```typescript
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import type { Goal } from '@/store/schemas';
import { goalStore } from '@/store/goalStore';

import { futureSelfRounds } from '@/onboarding/data/qaTree';
import QAFlow from '@/onboarding/components/QAFlow';
import { generateFutureSelfNarrative } from '@/onboarding/utils/generateFutureSelf';

import { SafeScreen } from '@/components/templates';

import GoalSelector from './components/GoalSelector';
import TimeframeSelector from './components/TimeframeSelector';

type Timeframe = '10yr' | '5yr';

function FutureSelf() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingFutureSelf>['navigation']>();

  const goals = goalStore.getGoals();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe | null>(null);
  const [showQA, setShowQA] = useState(false);

  const handleSkip = () => {
    navigation.navigate(Paths.OnboardingStepsSetup);
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowQA(false);
  };

  const handleTimeframeSelect = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    if (selectedGoal) setShowQA(true);
  };

  const handleQAComplete = (answers: string[]) => {
    if (!selectedGoal || !selectedTimeframe) return;
    const narrative = generateFutureSelfNarrative({
      answers,
      goalStatement: selectedGoal.statement,
      timeframe: selectedTimeframe,
    });
    goalStore.saveFutureSelf({
      goalId: selectedGoal.id,
      narrative,
      timeframe: selectedTimeframe,
    });
    setShowQA(false);
    setSelectedGoal(null);
    setSelectedTimeframe(null);
    // Navigate forward after saving — user can add more or proceed
    navigation.navigate(Paths.OnboardingStepsSetup);
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          Imagine your future self
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Describe what your life looks like in 5 or 10 years. This step is optional.
        </Text>

        {!showQA && (
          <>
            <GoalSelector
              goals={goals}
              onSelect={handleGoalSelect}
              selectedId={selectedGoal?.id ?? null}
            />
            {selectedGoal && (
              <TimeframeSelector
                onSelect={handleTimeframeSelect}
                selected={selectedTimeframe}
              />
            )}
          </>
        )}

        {showQA && (
          <View testID="future-self-qa">
            <QAFlow onComplete={handleQAComplete} rounds={futureSelfRounds} />
          </View>
        )}

        <TouchableOpacity
          onPress={handleSkip}
          style={[gutters.marginTop_32, gutters.paddingVertical_16]}
          testID="skip-button"
        >
          <Text style={[fonts.size_14, fonts.gray200]}>Skip for now →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default FutureSelf;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=FutureSelf/FutureSelf
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/FutureSelf/
git commit -m "feat: implement FutureSelf screen"
```

---

## Chunk 4: StepsSetup Screen & Onboarding Completion

### Task 10: StepForm component

**Files:**
- Create: `src/screens/Onboarding/StepsSetup/components/StepForm.tsx`

- [ ] **Step 1: Create StepForm**

Create `src/screens/Onboarding/StepsSetup/components/StepForm.tsx`:

```typescript
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { Step } from '@/store/schemas';

type Props = {
  goalId: string;
  goalKeywords: string[];
  onAdd: (step: Step) => void;
};

function StepForm({ goalId, goalKeywords, onAdd }: Props) {
  const { fonts, gutters } = useTheme();
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const step: Step = {
      deadline: deadline || oneYearFromNow,
      description: description.trim(),
      goalId,
      id: `step-${Date.now()}`,
      isDone: false,
      keywords: goalKeywords,
    };
    onAdd(step);
    setDescription('');
    setDeadline('');
  };

  return (
    <View style={gutters.marginBottom_16}>
      <TextInput
        onChangeText={setDescription}
        placeholder="Describe this milestone..."
        returnKeyType="next"
        style={[fonts.size_14, fonts.gray800, gutters.paddingHorizontal_12, gutters.paddingVertical_10, gutters.marginBottom_8]}
        testID="step-description-input"
        value={description}
      />
      <TextInput
        onChangeText={setDeadline}
        placeholder="Target date (YYYY-MM-DD)"
        returnKeyType="done"
        style={[fonts.size_14, fonts.gray800, gutters.paddingHorizontal_12, gutters.paddingVertical_10, gutters.marginBottom_8]}
        testID="step-deadline-input"
        value={deadline}
      />
      <TouchableOpacity onPress={handleAdd} testID="add-step-button">
        <Text style={[fonts.size_14, fonts.gray800]}>+ Add Step</Text>
      </TouchableOpacity>
    </View>
  );
}

export default StepForm;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/StepsSetup/components/StepForm.tsx
git commit -m "feat: add StepForm component"
```

---

### Task 11: StepsSetup screen + onboarding completion

**Files:**
- Modify: `src/screens/Onboarding/StepsSetup/StepsSetup.tsx`
- Create: `src/screens/Onboarding/StepsSetup/StepsSetup.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/Onboarding/StepsSetup/StepsSetup.test.tsx`:

```typescript
// jest.mock must appear before all imports
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getGoals: jest.fn().mockReturnValue([
      {
        category: 'Career',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['career'],
        statement: 'Work abroad',
      },
    ]),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ reset: mockReset }),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import StepsSetup from './StepsSetup';

const mockReset = jest.fn();

function renderStepsSetup() {
  return render(
    <TestAppWrapper>
      <StepsSetup />
    </TestAppWrapper>,
  );
}

describe('StepsSetup', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders goals and finish button', () => {
    renderStepsSetup();
    expect(screen.getByText('Work abroad')).toBeTruthy();
    expect(screen.getByTestId('finish-button')).toBeTruthy();
  });

  it('tapping Finish calls navigation.reset to MainTabs', () => {
    renderStepsSetup();
    fireEvent.press(screen.getByTestId('finish-button'));
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'main_tabs' }],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=StepsSetup/StepsSetup
```
Expected: FAIL

- [ ] **Step 3: Implement StepsSetup screen**

Replace `src/screens/Onboarding/StepsSetup/StepsSetup.tsx`:

```typescript
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';

import type { Step } from '@/store/schemas';
import { goalStore } from '@/store/goalStore';

import { SafeScreen } from '@/components/templates';

import StepForm from './components/StepForm';

function StepsSetup() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingStepsSetup>['navigation']>();

  const goals = goalStore.getGoals();
  const [stepsByGoal, setStepsByGoal] = useState<Record<string, Step[]>>({});

  const handleAddStep = (goalId: string, step: Step) => {
    setStepsByGoal(prev => ({
      ...prev,
      [goalId]: [...(prev[goalId] ?? []), step],
    }));
  };

  const handleFinish = () => {
    // Steps are held in local state for now — Plan 4 (Goals tab) will add persistence
    navigation.reset({
      index: 0,
      routes: [{ name: Paths.MainTabs }],
    });
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          Break it down into steps
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Add milestones for each goal. You can do this later too.
        </Text>

        {goals.map(goal => (
          <View key={goal.id} style={gutters.marginBottom_32}>
            <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
              {goal.statement}
            </Text>
            {(stepsByGoal[goal.id] ?? []).map(step => (
              <Text key={step.id} style={[fonts.size_14, fonts.gray200, gutters.marginBottom_8]}>
                • {step.description}
              </Text>
            ))}
            <StepForm
              goalId={goal.id}
              goalKeywords={goal.keywords}
              onAdd={step => handleAddStep(goal.id, step)}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleFinish}
          style={[gutters.marginTop_16, gutters.paddingVertical_16]}
          testID="finish-button"
        >
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
            Start my journey →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default StepsSetup;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=StepsSetup/StepsSetup
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Onboarding/StepsSetup/
git commit -m "feat: implement StepsSetup screen with navigation.reset to main app"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
cd MyApp && yarn test
```
Expected: All tests pass

- [ ] **Run full lint**

```bash
cd MyApp && yarn lint
```
Expected: No errors

- [ ] **Smoke test — first-time user flow:**
  1. Launch app → GoalSetup screen
  2. Tap a category → Q&A flow (3 rounds)
  3. Complete Q&A → goal card appears, Continue button enabled
  4. Tap Continue → FutureSelf screen
  5. Tap Skip → StepsSetup screen
  6. Tap "Start my journey" → Today tab

- [ ] **Smoke test — returning user:**
  1. Launch app → Today tab (onboarding already complete)

---

## What This Plan Delivers

| Deliverable | Location |
|-------------|---------|
| Q&A tree + future self rounds | `src/onboarding/data/qaTree.ts` |
| Shared QAFlow component | `src/onboarding/components/QAFlow.tsx` |
| Goal statement generator | `src/onboarding/utils/generateGoal.ts` |
| Future self narrative generator | `src/onboarding/utils/generateFutureSelf.ts` |
| GoalSetup screen | `src/screens/Onboarding/GoalSetup/` |
| FutureSelf screen | `src/screens/Onboarding/FutureSelf/` |
| StepsSetup screen | `src/screens/Onboarding/StepsSetup/` |
| Onboarding → main app transition | `navigation.reset()` in StepsSetup |

**Next plan:** Plan 3 — Today Tab (calendar heatmap, daily routine list, completion/skip tracking)
