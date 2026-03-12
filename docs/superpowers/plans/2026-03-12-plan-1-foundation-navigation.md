# Foundation & Navigation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up core data schemas, local storage layer, and navigation structure (onboarding stack + 3-tab main app) with placeholder screens.

**Architecture:** Linear onboarding wizard (stack navigator) gates access to the main app (bottom tab navigator: Today | Goals | Discover). All app data is persisted locally via a dedicated MMKV instance. Core entities are defined as Zod schemas to ensure runtime type safety throughout all future plans.

**Tech Stack:** React Native 0.84, TypeScript, `@react-navigation/stack` + `@react-navigation/bottom-tabs`, `react-native-mmkv`, `zod` v4

**Spec:** `docs/superpowers/specs/2026-03-12-life-motivation-app-design.md`

> **Note for Plan 2:** The `useOnboardingStatus` hook reads MMKV synchronously and is not reactive. The `initialRouteName` prop is only respected on mount. When the user finishes onboarding in Plan 2, **you must call `navigation.reset()`** to navigate to the main tabs — do not rely on the `isComplete` flag alone to trigger the transition.

---

## Chunk 1: Dependencies & Test Infrastructure

### Task 1: Install bottom-tabs + fix jest transform config

**Files:**
- Modify: `package.json`
- Modify: `jest.config.js`

- [ ] **Step 1: Install the package**

```bash
cd MyApp && yarn add @react-navigation/bottom-tabs
```

- [ ] **Step 2: Add `react-native-mmkv` to jest transformIgnorePatterns**

Edit `jest.config.js` — replace the `transformIgnorePatterns` line:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|ky|react-native-mmkv)',
],
```

- [ ] **Step 3: Verify**

```bash
cd MyApp && grep "bottom-tabs" package.json && grep "react-native-mmkv" jest.config.js
```
Expected: both lines appear

- [ ] **Step 4: Commit**

```bash
cd MyApp && git add package.json yarn.lock jest.config.js
git commit -m "feat: add bottom-tabs nav, fix mmkv jest transform"
```

---

## Chunk 2: Data Schemas

> **Zod v4 note:** This project uses `zod ^4.0.14`. Use `z.iso.datetime()` and `z.iso.date()` — NOT `z.string().datetime()` or `z.string().date()` (those were removed in Zod v4).

### Task 2: Goal schema

**Files:**
- Create: `src/store/schemas/goal.ts`
- Create: `src/store/schemas/goal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/schemas/goal.test.ts`:

```typescript
import { futureSelfSchema, goalSchema } from '@/store/schemas/goal';

describe('goalSchema', () => {
  it('parses a valid goal', () => {
    const input = {
      id: 'goal-1',
      category: 'Family',
      keywords: ['marriage', 'children'],
      statement: 'I want to build a happy family',
      createdAt: '2026-03-12T00:00:00.000Z',
    };
    expect(() => goalSchema.parse(input)).not.toThrow();
  });

  it('rejects a goal with no keywords', () => {
    const input = {
      id: 'goal-1',
      category: 'Family',
      keywords: [],
      statement: 'I want to build a happy family',
      createdAt: '2026-03-12T00:00:00.000Z',
    };
    expect(() => goalSchema.parse(input)).toThrow();
  });
});

describe('futureSelfSchema', () => {
  it('parses a valid future self entry', () => {
    const input = {
      goalId: 'goal-1',
      timeframe: '5yr',
      narrative: "I'm 35, married with two kids living in Jeju.",
    };
    expect(() => futureSelfSchema.parse(input)).not.toThrow();
  });

  it('rejects an invalid timeframe', () => {
    const input = {
      goalId: 'goal-1',
      timeframe: '3yr',
      narrative: 'Some narrative',
    };
    expect(() => futureSelfSchema.parse(input)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/goal
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the schema**

Create `src/store/schemas/goal.ts`:

```typescript
import * as z from 'zod';

export const goalSchema = z.object({
  category: z.string(),
  createdAt: z.iso.datetime(),
  id: z.string(),
  keywords: z.array(z.string()).min(1),
  statement: z.string(),
});

export const futureSelfSchema = z.object({
  goalId: z.string(),
  narrative: z.string(),
  timeframe: z.enum(['5yr', '10yr']),
});

export type Goal = z.infer<typeof goalSchema>;
export type FutureSelf = z.infer<typeof futureSelfSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/goal
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/schemas/goal.ts src/store/schemas/goal.test.ts
git commit -m "feat: add goal and futureSelf zod schemas"
```

---

### Task 3: Step schema

**Files:**
- Create: `src/store/schemas/step.ts`
- Create: `src/store/schemas/step.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/schemas/step.test.ts`:

```typescript
import { stepSchema } from '@/store/schemas/step';

describe('stepSchema', () => {
  it('parses a valid step', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: false,
      keywords: ['english', 'ielts'],
    };
    expect(() => stepSchema.parse(input)).not.toThrow();
  });

  it('parses a completed step', () => {
    const input = {
      deadline: '2027-06-01',
      description: 'Get IELTS 7.0',
      goalId: 'goal-1',
      id: 'step-1',
      isDone: true,
      keywords: ['english'],
    };
    const result = stepSchema.parse(input);
    expect(result.isDone).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/step
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the schema**

Create `src/store/schemas/step.ts`:

```typescript
import * as z from 'zod';

export const stepSchema = z.object({
  deadline: z.iso.date(),
  description: z.string(),
  goalId: z.string(),
  id: z.string(),
  isDone: z.boolean(),
  keywords: z.array(z.string()),
});

export type Step = z.infer<typeof stepSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/step
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/schemas/step.ts src/store/schemas/step.test.ts
git commit -m "feat: add step zod schema"
```

---

### Task 4: Routine & DailyLog schemas

**Files:**
- Create: `src/store/schemas/routine.ts`
- Create: `src/store/schemas/routine.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/schemas/routine.test.ts`:

```typescript
import { dailyLogSchema, routineSchema } from '@/store/schemas/routine';

describe('routineSchema', () => {
  it('parses a routine with weekday schedule', () => {
    const input = {
      id: 'routine-1',
      name: 'Study English 30 min',
      schedule: { days: ['Mon', 'Wed', 'Fri'], type: 'weekdays' },
      tags: ['english', 'learning'],
    };
    expect(() => routineSchema.parse(input)).not.toThrow();
  });

  it('parses a routine with date range schedule', () => {
    const input = {
      id: 'routine-2',
      name: 'Morning run',
      schedule: { endDate: '2026-06-30', startDate: '2026-04-01', type: 'dateRange' },
      tags: ['health'],
    };
    expect(() => routineSchema.parse(input)).not.toThrow();
  });

  it('rejects an invalid schedule type', () => {
    const input = {
      id: 'routine-3',
      name: 'Bad routine',
      schedule: { type: 'monthly' },
      tags: [],
    };
    expect(() => routineSchema.parse(input)).toThrow();
  });
});

describe('dailyLogSchema', () => {
  it('parses a completed log', () => {
    const input = {
      date: '2026-03-12',
      routineId: 'routine-1',
      status: 'completed',
    };
    expect(() => dailyLogSchema.parse(input)).not.toThrow();
  });

  it('parses a skipped log with reason', () => {
    const input = {
      date: '2026-03-12',
      routineId: 'routine-1',
      skipReason: 'sick',
      status: 'skipped',
    };
    expect(() => dailyLogSchema.parse(input)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/routine
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the schema**

Create `src/store/schemas/routine.ts`:

```typescript
import * as z from 'zod';

const weekday = z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const weekdaysSchedule = z.object({
  days: z.array(weekday).min(1),
  type: z.literal('weekdays'),
});

const dateRangeSchedule = z.object({
  endDate: z.iso.date(),
  startDate: z.iso.date(),
  type: z.literal('dateRange'),
});

export const routineSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.discriminatedUnion('type', [weekdaysSchedule, dateRangeSchedule]),
  tags: z.array(z.string()),
});

export const dailyLogSchema = z.object({
  date: z.iso.date(),
  routineId: z.string(),
  skipReason: z.string().optional(),
  status: z.enum(['completed', 'skipped', 'pending']),
});

export type DailyLog = z.infer<typeof dailyLogSchema>;
export type Routine = z.infer<typeof routineSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/routine
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/schemas/routine.ts src/store/schemas/routine.test.ts
git commit -m "feat: add routine and dailyLog zod schemas"
```

---

### Task 5: Schema index

**Files:**
- Create: `src/store/schemas/index.ts`

- [ ] **Step 1: Create the index**

Create `src/store/schemas/index.ts`:

```typescript
export * from './goal';
export * from './routine';
export * from './step';
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/store/schemas/index.ts
git commit -m "feat: add store schemas index"
```

---

## Chunk 3: Storage Layer

### Task 6: App data MMKV instance

**Files:**
- Create: `src/store/storage.ts`

- [ ] **Step 1: Create the storage instance**

Create `src/store/storage.ts`:

```typescript
import { createMMKV } from 'react-native-mmkv';

// Separate instance from the theme storage in App.tsx
export const appStorage = createMMKV({ id: 'app-data' });
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/store/storage.ts
git commit -m "feat: add dedicated app data MMKV instance"
```

---

### Task 7: Goal store

**Files:**
- Create: `src/store/goalStore.ts`
- Create: `src/store/goalStore.test.ts`

> **Testing note:** `jest.mock(...)` calls are hoisted by Babel above `import` statements. Always write `jest.mock(...)` before `import` statements in source — do not let your editor auto-sort them below imports, as this breaks the hoisting assumption.

- [ ] **Step 1: Write the failing test**

Create `src/store/goalStore.test.ts`:

```typescript
// jest.mock must appear before imports — Babel hoists it, but keep it first in source
jest.mock('@/store/storage', () => {
  const store: Record<string, string> = {};
  return {
    appStorage: {
      delete: (key: string) => { delete store[key]; },
      getString: (key: string) => store[key] ?? undefined,
      set: (key: string, value: string) => { store[key] = value; },
    },
  };
});

import { goalStore } from '@/store/goalStore';

const makeGoal = (n: number) => ({
  category: 'Health',
  createdAt: new Date().toISOString(),
  id: `goal-${n}`,
  keywords: ['health'],
  statement: `Goal ${n}`,
});

describe('goalStore', () => {
  beforeEach(() => {
    goalStore.deleteGoal('goal-1');
    goalStore.deleteGoal('goal-2');
    goalStore.deleteGoal('goal-3');
    goalStore.deleteGoal('goal-4');
  });

  it('returns empty array when no goals stored', () => {
    expect(goalStore.getGoals()).toEqual([]);
  });

  it('saves and retrieves a goal', () => {
    goalStore.saveGoal(makeGoal(1));
    expect(goalStore.getGoals()).toHaveLength(1);
    expect(goalStore.getGoals()[0].id).toBe('goal-1');
  });

  it('updates an existing goal in place', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.saveGoal({ ...makeGoal(1), statement: 'Updated' });
    expect(goalStore.getGoals()).toHaveLength(1);
    expect(goalStore.getGoals()[0].statement).toBe('Updated');
  });

  it('enforces maximum of 3 goals', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.saveGoal(makeGoal(2));
    goalStore.saveGoal(makeGoal(3));
    expect(() => goalStore.saveGoal(makeGoal(4))).toThrow('Maximum of 3 goals allowed');
  });

  it('deletes a goal', () => {
    goalStore.saveGoal(makeGoal(1));
    goalStore.deleteGoal('goal-1');
    expect(goalStore.getGoals()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/goalStore
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the goal store**

Create `src/store/goalStore.ts`:

```typescript
import type { FutureSelf, Goal } from '@/store/schemas';

import { futureSelfSchema, goalSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const FUTURE_SELVES_KEY = 'futureSelf';
const GOALS_KEY = 'goals';
const MAX_GOALS = 3;

function getGoals(): Goal[] {
  const raw = appStorage.getString(GOALS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).map(g => goalSchema.parse(g));
  } catch {
    return [];
  }
}

function saveGoal(goal: Goal): void {
  const current = getGoals();
  const existingIndex = current.findIndex(g => g.id === goal.id);
  let updated: Goal[];
  if (existingIndex >= 0) {
    updated = current.map(g => (g.id === goal.id ? goal : g));
  } else {
    if (current.length >= MAX_GOALS) {
      throw new Error(`Maximum of ${MAX_GOALS} goals allowed`);
    }
    updated = [...current, goal];
  }
  appStorage.set(GOALS_KEY, JSON.stringify(updated));
}

function deleteGoal(goalId: string): void {
  const updated = getGoals().filter(g => g.id !== goalId);
  appStorage.set(GOALS_KEY, JSON.stringify(updated));
}

function getFutureSelf(goalId: string): FutureSelf[] {
  const raw = appStorage.getString(FUTURE_SELVES_KEY);
  if (!raw) return [];
  try {
    const all = (JSON.parse(raw) as unknown[]).map(f => futureSelfSchema.parse(f));
    return all.filter(f => f.goalId === goalId);
  } catch {
    return [];
  }
}

function saveFutureSelf(entry: FutureSelf): void {
  const raw = appStorage.getString(FUTURE_SELVES_KEY);
  const all: FutureSelf[] = raw
    ? (JSON.parse(raw) as unknown[]).map(f => futureSelfSchema.parse(f))
    : [];
  const existingIndex = all.findIndex(
    f => f.goalId === entry.goalId && f.timeframe === entry.timeframe,
  );
  const updated =
    existingIndex >= 0
      ? all.map((f, i) => (i === existingIndex ? entry : f))
      : [...all, entry];
  appStorage.set(FUTURE_SELVES_KEY, JSON.stringify(updated));
}

export const goalStore = {
  deleteGoal,
  getFutureSelf,
  getGoals,
  saveFutureSelf,
  saveGoal,
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/goalStore
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/goalStore.ts src/store/goalStore.test.ts
git commit -m "feat: add goal store with MMKV persistence"
```

---

### Task 8: Routine store

**Files:**
- Create: `src/store/routineStore.ts`
- Create: `src/store/routineStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/routineStore.test.ts`:

```typescript
jest.mock('@/store/storage', () => {
  const store: Record<string, string> = {};
  return {
    appStorage: {
      getString: (key: string) => store[key] ?? undefined,
      set: (key: string, value: string) => { store[key] = value; },
    },
  };
});

import { routineStore } from '@/store/routineStore';

const makeRoutine = (id: string) => ({
  id,
  name: 'Study English',
  schedule: { days: ['Mon' as const, 'Wed' as const], type: 'weekdays' as const },
  tags: ['english'],
});

describe('routineStore', () => {
  it('returns empty array when no routines stored', () => {
    expect(routineStore.getRoutines()).toEqual([]);
  });

  it('saves and retrieves a routine', () => {
    routineStore.saveRoutine(makeRoutine('r-1'));
    expect(routineStore.getRoutines()).toHaveLength(1);
  });

  it('deletes a routine', () => {
    routineStore.saveRoutine(makeRoutine('r-2'));
    routineStore.deleteRoutine('r-2');
    const remaining = routineStore.getRoutines().filter(r => r.id === 'r-2');
    expect(remaining).toHaveLength(0);
  });

  it('saves and retrieves a daily log for a specific date', () => {
    routineStore.saveDailyLog({
      date: '2026-03-12',
      routineId: 'r-1',
      status: 'completed',
    });
    const logs = routineStore.getDailyLogs('2026-03-12');
    expect(logs).toHaveLength(1);
    expect(logs[0].status).toBe('completed');
  });

  it('saves a skipped log with reason', () => {
    routineStore.saveDailyLog({
      date: '2026-03-13',
      routineId: 'r-1',
      skipReason: 'sick',
      status: 'skipped',
    });
    const logs = routineStore.getDailyLogs('2026-03-13');
    expect(logs[0].skipReason).toBe('sick');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/routineStore
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the routine store**

Create `src/store/routineStore.ts`:

```typescript
import type { DailyLog, Routine } from '@/store/schemas';

import { dailyLogSchema, routineSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const DAILY_LOGS_KEY = 'dailyLogs';
const ROUTINES_KEY = 'routines';

function getRoutines(): Routine[] {
  const raw = appStorage.getString(ROUTINES_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).map(r => routineSchema.parse(r));
  } catch {
    return [];
  }
}

function saveRoutine(routine: Routine): void {
  const current = getRoutines();
  const existingIndex = current.findIndex(r => r.id === routine.id);
  const updated =
    existingIndex >= 0
      ? current.map(r => (r.id === routine.id ? routine : r))
      : [...current, routine];
  appStorage.set(ROUTINES_KEY, JSON.stringify(updated));
}

function deleteRoutine(routineId: string): void {
  const updated = getRoutines().filter(r => r.id !== routineId);
  appStorage.set(ROUTINES_KEY, JSON.stringify(updated));
}

function getDailyLogs(date: string): DailyLog[] {
  const raw = appStorage.getString(DAILY_LOGS_KEY);
  if (!raw) return [];
  try {
    const all = (JSON.parse(raw) as unknown[]).map(l => dailyLogSchema.parse(l));
    return all.filter(l => l.date === date);
  } catch {
    return [];
  }
}

function saveDailyLog(log: DailyLog): void {
  const raw = appStorage.getString(DAILY_LOGS_KEY);
  const all: DailyLog[] = raw
    ? (JSON.parse(raw) as unknown[]).map(l => dailyLogSchema.parse(l))
    : [];
  const existingIndex = all.findIndex(
    l => l.routineId === log.routineId && l.date === log.date,
  );
  const updated =
    existingIndex >= 0
      ? all.map((l, i) => (i === existingIndex ? log : l))
      : [...all, log];
  appStorage.set(DAILY_LOGS_KEY, JSON.stringify(updated));
}

export const routineStore = {
  deleteRoutine,
  getDailyLogs,
  getRoutines,
  saveDailyLog,
  saveRoutine,
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/routineStore
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/routineStore.ts src/store/routineStore.test.ts
git commit -m "feat: add routine store with MMKV persistence"
```

---

### Task 9: Store index

**Files:**
- Create: `src/store/index.ts`

> **Note:** This barrel exports runtime store objects and Zod types from the same path. Consumers that only need types should import directly from `@/store/schemas` to avoid importing runtime code.

- [ ] **Step 1: Create the index**

Create `src/store/index.ts`:

```typescript
export * from './goalStore';
export * from './routineStore';
export * from './schemas';
export { appStorage } from './storage';
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/store/index.ts
git commit -m "feat: add store index"
```

---

## Chunk 4: Navigation & Placeholder Screens

### Task 10: Add new paths

**Files:**
- Modify: `src/navigation/paths.ts`
- Modify: `src/navigation/types.ts`

- [ ] **Step 1: Update paths**

Replace `src/navigation/paths.ts` with:

```typescript
export const enum Paths {
  // Legacy (keep for now)
  Example = 'example',
  Startup = 'startup',

  // Onboarding
  OnboardingGoalSetup = 'onboarding_goal_setup',
  OnboardingFutureSelf = 'onboarding_future_self',
  OnboardingStepsSetup = 'onboarding_steps_setup',

  // Root stack entry for main tab navigator
  MainTabs = 'main_tabs',

  // Main tabs (used inside tab navigator only)
  Today = 'today',
  Goals = 'goals',
  Discover = 'discover',
}
```

- [ ] **Step 2: Update types**

Replace `src/navigation/types.ts` with:

```typescript
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.MainTabs]: undefined;
  [Paths.OnboardingFutureSelf]: undefined;
  [Paths.OnboardingGoalSetup]: undefined;
  [Paths.OnboardingStepsSetup]: undefined;
  [Paths.Startup]: undefined;
};

export type MainTabParamList = {
  [Paths.Discover]: undefined;
  [Paths.Goals]: undefined;
  [Paths.Today]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type TabScreenProps<
  S extends keyof MainTabParamList = keyof MainTabParamList,
> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, S>,
  StackScreenProps<RootStackParamList>
>;
```

- [ ] **Step 3: Run type check**

```bash
cd MyApp && yarn lint:type-check
```
Expected: PASS (or only pre-existing errors)

- [ ] **Step 4: Commit**

```bash
cd MyApp && git add src/navigation/paths.ts src/navigation/types.ts
git commit -m "feat: add onboarding and main tab navigation paths"
```

---

### Task 11: Placeholder screens

**Files:**
- Create: `src/screens/Onboarding/GoalSetup/GoalSetup.tsx`
- Create: `src/screens/Onboarding/FutureSelf/FutureSelf.tsx`
- Create: `src/screens/Onboarding/StepsSetup/StepsSetup.tsx`
- Create: `src/screens/Today/Today.tsx`
- Create: `src/screens/Goals/Goals.tsx`
- Create: `src/screens/Discover/Discover.tsx`
- Modify: `src/screens/index.ts`

- [ ] **Step 1: Create GoalSetup placeholder**

Create `src/screens/Onboarding/GoalSetup/GoalSetup.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function GoalSetup() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-goal-setup"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Goal Setup</Text>
      </View>
    </SafeScreen>
  );
}

export default GoalSetup;
```

- [ ] **Step 2: Create FutureSelf placeholder**

Create `src/screens/Onboarding/FutureSelf/FutureSelf.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function FutureSelf() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-future-self"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Future Self</Text>
      </View>
    </SafeScreen>
  );
}

export default FutureSelf;
```

- [ ] **Step 3: Create StepsSetup placeholder**

Create `src/screens/Onboarding/StepsSetup/StepsSetup.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function StepsSetup() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-steps-setup"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Steps Setup</Text>
      </View>
    </SafeScreen>
  );
}

export default StepsSetup;
```

- [ ] **Step 4: Create Today placeholder**

Create `src/screens/Today/Today.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Today() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-today"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Today</Text>
      </View>
    </SafeScreen>
  );
}

export default Today;
```

- [ ] **Step 5: Create Goals placeholder**

Create `src/screens/Goals/Goals.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Goals() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-goals"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Goals</Text>
      </View>
    </SafeScreen>
  );
}

export default Goals;
```

- [ ] **Step 6: Create Discover placeholder**

Create `src/screens/Discover/Discover.tsx`:

```typescript
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Discover() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-discover"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Discover</Text>
      </View>
    </SafeScreen>
  );
}

export default Discover;
```

- [ ] **Step 7: Update screens index**

Replace `src/screens/index.ts` with:

```typescript
export { default as Discover } from './Discover/Discover';
export { default as Example } from './Example/Example';
export { default as FutureSelf } from './Onboarding/FutureSelf/FutureSelf';
export { default as Goals } from './Goals/Goals';
export { default as GoalSetup } from './Onboarding/GoalSetup/GoalSetup';
export { default as StepsSetup } from './Onboarding/StepsSetup/StepsSetup';
export { default as Startup } from './Startup/Startup';
export { default as Today } from './Today/Today';
```

- [ ] **Step 8: Run type check**

```bash
cd MyApp && yarn lint:type-check
```
Expected: PASS

- [ ] **Step 9: Commit**

```bash
cd MyApp && git add src/screens/
git commit -m "feat: add placeholder screens for all routes"
```

---

### Task 12: Onboarding completion hook

**Files:**
- Create: `src/hooks/domain/onboarding/useOnboardingStatus.ts`
- Create: `src/hooks/domain/onboarding/useOnboardingStatus.test.ts`
- Modify: `src/hooks/domain/index.ts`
- Modify: `src/hooks/index.ts`

> **Important:** This hook reads MMKV synchronously. It does NOT reactively update when goals change. Plan 2 must call `navigation.reset()` after saving the first goal to navigate to the main tabs — do not rely on a re-render of `ApplicationNavigator` to trigger the transition.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/domain/onboarding/useOnboardingStatus.test.ts`:

```typescript
// jest.mock must appear before imports (Babel hoists it, but keep it first in source)
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getGoals: jest.fn(),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';

import { useOnboardingStatus } from './useOnboardingStatus';

describe('useOnboardingStatus', () => {
  it('returns isComplete false when no goals exist', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current.isComplete).toBe(false);
  });

  it('returns isComplete true when at least one goal exists', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      {
        category: 'Family',
        createdAt: new Date().toISOString(),
        id: 'goal-1',
        keywords: ['marriage'],
        statement: 'Happy family',
      },
    ]);
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current.isComplete).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/onboarding/useOnboardingStatus
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the hook**

Create `src/hooks/domain/onboarding/useOnboardingStatus.ts`:

```typescript
import { goalStore } from '@/store/goalStore';

function useOnboardingStatus() {
  const goals = goalStore.getGoals();
  return { isComplete: goals.length > 0 };
}

export { useOnboardingStatus };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=domain/onboarding/useOnboardingStatus
```
Expected: PASS

- [ ] **Step 5: Export from domain index**

Add to `src/hooks/domain/index.ts`:

```typescript
export * from './onboarding/useOnboardingStatus';
export * from './user';
```

- [ ] **Step 6: Export from hooks index**

Ensure `src/hooks/index.ts` exports from domain:

```typescript
export * from './domain';
export * from './language';
```

- [ ] **Step 7: Commit**

```bash
cd MyApp && git add src/hooks/domain/onboarding/ src/hooks/domain/index.ts src/hooks/index.ts
git commit -m "feat: add useOnboardingStatus hook"
```

---

### Task 13: Wire up Application navigator

**Files:**
- Modify: `src/navigation/Application.tsx`
- Create: `src/navigation/MainTabs.tsx`

- [ ] **Step 1: Create MainTabs navigator**

Create `src/navigation/MainTabs.tsx`:

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Paths } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';

import { Discover, Goals, Today } from '@/screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen component={Today} name={Paths.Today} />
      <Tab.Screen component={Goals} name={Paths.Goals} />
      <Tab.Screen component={Discover} name={Paths.Discover} />
    </Tab.Navigator>
  );
}

export default MainTabs;
```

- [ ] **Step 2: Update ApplicationNavigator**

Replace `src/navigation/Application.tsx` with:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useOnboardingStatus } from '@/hooks';
import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Example, GoalSetup, FutureSelf, Startup, StepsSetup } from '@/screens';

import MainTabs from './MainTabs';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();
  const { isComplete } = useOnboardingStatus();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          key={variant}
          initialRouteName={isComplete ? Paths.MainTabs : Paths.OnboardingGoalSetup}
          screenOptions={{ headerShown: false }}
        >
          {isComplete ? (
            <Stack.Screen component={MainTabs} name={Paths.MainTabs} />
          ) : (
            <>
              <Stack.Screen component={GoalSetup} name={Paths.OnboardingGoalSetup} />
              <Stack.Screen component={FutureSelf} name={Paths.OnboardingFutureSelf} />
              <Stack.Screen component={StepsSetup} name={Paths.OnboardingStepsSetup} />
              <Stack.Screen component={MainTabs} name={Paths.MainTabs} />
            </>
          )}
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={Startup} name={Paths.Startup} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
```

- [ ] **Step 3: Run type check**

```bash
cd MyApp && yarn lint:type-check
```
Expected: PASS

- [ ] **Step 4: Run all tests**

```bash
cd MyApp && yarn test
```
Expected: All tests pass

- [ ] **Step 5: Run lint**

```bash
cd MyApp && yarn lint
```
Expected: No errors

- [ ] **Step 6: Commit**

```bash
cd MyApp && git add src/navigation/
git commit -m "feat: wire up onboarding gate and main tab navigator"
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

- [ ] **Smoke test on device/simulator** — App launches, routes to GoalSetup (first run) or Today tab (returning user with goals saved)

---

## What This Plan Delivers

| Deliverable | Location |
|-------------|---------|
| Core Zod schemas | `src/store/schemas/` |
| MMKV storage layer | `src/store/` |
| Goal + routine persistence | `src/store/goalStore.ts`, `src/store/routineStore.ts` |
| Onboarding gate hook | `src/hooks/domain/onboarding/useOnboardingStatus.ts` |
| Tab navigation (Today/Goals/Discover) | `src/navigation/MainTabs.tsx` |
| Root stack + onboarding gate | `src/navigation/Application.tsx` |
| All placeholder screens | `src/screens/` |

**Next plan:** Plan 2 — Onboarding Flow (goal Q&A, future self visualization, steps setup). Remember: call `navigation.reset({ index: 0, routes: [{ name: Paths.MainTabs }] })` at the end of onboarding to transition to the main app.
