# Goals Tab Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Goals tab — expandable goal cards with future self narratives, step management (add/edit/done toggle/delete), linked routine display, and archive/edit goal actions.

**Architecture:** The Goals screen renders a scrollable list of `GoalCard` components, each managing its own expansion state and calling `useSteps(goal.id)` internally. A `useGoals` hook at the screen level provides the goals list and mutation operations. Steps are persisted in a new `stepStore` (separate MMKV key). Both hooks use the same `forceUpdate` pattern as `useDailyPlan` (Plan 3) to re-read MMKV after mutations. All forms use `Modal` bottom sheets, same pattern as Plan 3.

**Tech Stack:** React Native 0.84, TypeScript, `react-native-mmkv` (via Plan 1 stores), `zod` v4

**Depends on:** Plan 1 (stores, schemas, navigation), Plan 2 (onboarding, goal data in MMKV), Plan 3 (theme sizes 8/10/14).

**Spec:** `docs/superpowers/specs/2026-03-12-life-motivation-app-design.md`

---

## File Structure

```
src/
├── store/
│   ├── schemas/
│   │   ├── goal.ts              # Modify: add archivedAt optional field
│   │   ├── goal.test.ts         # Modify: add archivedAt test cases
│   │   ├── step.ts              # Modify: add linkedRoutineIds field
│   │   └── step.test.ts         # Modify: add linkedRoutineIds default test
│   ├── stepStore.ts             # Create: CRUD for steps
│   ├── stepStore.test.ts        # Create
│   └── index.ts                 # Modify: export stepStore
├── hooks/
│   └── domain/
│       ├── goals/
│       │   ├── useGoals.ts      # Create: goal list + mutations (active only)
│       │   ├── useGoals.test.ts # Create
│       │   ├── useSteps.ts      # Create: steps for a goalId + mutations
│       │   └── useSteps.test.ts # Create
│       └── index.ts             # Modify: export goals hooks
└── screens/
    └── Goals/
        ├── Goals.tsx                        # Modify: full implementation
        └── components/
            ├── FutureSelfSection.tsx        # Create: 5yr/10yr narrative display
            ├── FutureSelfSection.test.tsx   # Create
            ├── StepFormSheet.tsx            # Create: add/edit step modal
            ├── StepFormSheet.test.tsx       # Create
            ├── LinkedRoutinesSheet.tsx      # Create: link/unlink routines to step
            ├── LinkedRoutinesSheet.test.tsx # Create
            ├── StepItem.tsx                 # Create: step row with toggle
            ├── StepItem.test.tsx            # Create
            ├── GoalFormSheet.tsx            # Create: add/edit goal modal
            ├── GoalFormSheet.test.tsx       # Create
            ├── GoalCard.tsx                 # Create: expandable goal card
            └── GoalCard.test.tsx            # Create
```

---

## Chunk 1: Store Updates

### Task 1: Add archivedAt to goal schema + update goalStore max check

**Files:**
- Modify: `src/store/schemas/goal.ts`
- Modify: `src/store/schemas/goal.test.ts`
- Modify: `src/store/goalStore.ts`
- Modify: `src/store/goalStore.test.ts`

> **Why:** Goals are archived (not deleted) so history is kept. The goalStore max-3 check must only count non-archived goals — archived ones no longer consume a slot.

> **Zod v4 note:** Use `z.iso.datetime()` — NOT `z.string().datetime()`.

- [ ] **Step 1: Add new test cases for the schema and goalStore**

Open `src/store/schemas/goal.test.ts` and append after the existing tests:

```typescript
it('parses a goal with archivedAt set', () => {
  const input = {
    archivedAt: '2026-03-12T00:00:00.000Z',
    category: 'Health',
    createdAt: '2026-03-12T00:00:00.000Z',
    id: 'goal-1',
    keywords: ['health'],
    statement: 'Goal 1',
  };
  expect(() => goalSchema.parse(input)).not.toThrow();
});

it('parses a goal without archivedAt and defaults to undefined', () => {
  const input = {
    category: 'Health',
    createdAt: '2026-03-12T00:00:00.000Z',
    id: 'goal-1',
    keywords: ['health'],
    statement: 'Goal 1',
  };
  const result = goalSchema.parse(input);
  expect(result.archivedAt).toBeUndefined();
});
```

Open `src/store/goalStore.test.ts` and append after the existing tests:

```typescript
it('does not count archived goals toward the maximum', () => {
  goalStore.saveGoal(makeGoal(1));
  goalStore.saveGoal(makeGoal(2));
  goalStore.saveGoal(makeGoal(3));
  // Archive goal-3 (upsert — no new slot consumed)
  goalStore.saveGoal({ ...makeGoal(3), archivedAt: '2026-03-12T00:00:00.000Z' });
  // Only 2 active goals, so adding goal-4 must succeed
  expect(() => goalStore.saveGoal(makeGoal(4))).not.toThrow();
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd MyApp && yarn test --testPathPattern="store/schemas/goal|store/goalStore"
```
Expected: FAIL — `archivedAt` not in schema; archived goal still counted toward max

- [ ] **Step 3: Update the goal schema**

Replace `src/store/schemas/goal.ts`:

```typescript
import * as z from 'zod';

export const goalSchema = z.object({
  archivedAt: z.iso.datetime().optional(),
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

export type FutureSelf = z.infer<typeof futureSelfSchema>;
export type Goal = z.infer<typeof goalSchema>;
```

- [ ] **Step 4: Update goalStore saveGoal to count only active goals**

In `src/store/goalStore.ts`, replace the `saveGoal` function body:

```typescript
function saveGoal(goal: Goal): void {
  const current = getGoals();
  const existingIndex = current.findIndex(g => g.id === goal.id);
  let updated: Goal[];
  if (existingIndex >= 0) {
    updated = current.map(g => (g.id === goal.id ? goal : g));
  } else {
    const activeCount = current.filter(g => !g.archivedAt).length;
    if (activeCount >= MAX_GOALS) {
      throw new Error(`Maximum of ${MAX_GOALS} goals allowed`);
    }
    updated = [...current, goal];
  }
  appStorage.set(GOALS_KEY, JSON.stringify(updated));
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern="store/schemas/goal|store/goalStore"
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd MyApp && git add src/store/schemas/goal.ts src/store/schemas/goal.test.ts src/store/goalStore.ts src/store/goalStore.test.ts
git commit -m "feat: add archivedAt to goal schema, fix max-goals to count only active"
```

---

### Task 2: Add linkedRoutineIds to step schema

**Files:**
- Modify: `src/store/schemas/step.ts`
- Modify: `src/store/schemas/step.test.ts`

- [ ] **Step 1: Add new test cases**

Open `src/store/schemas/step.test.ts` and append after the existing tests:

```typescript
it('defaults linkedRoutineIds to empty array when omitted', () => {
  const input = {
    deadline: '2027-06-01',
    description: 'Get IELTS 7.0',
    goalId: 'goal-1',
    id: 'step-1',
    isDone: false,
    keywords: ['english'],
  };
  const result = stepSchema.parse(input);
  expect(result.linkedRoutineIds).toEqual([]);
});

it('parses linkedRoutineIds when provided', () => {
  const input = {
    deadline: '2027-06-01',
    description: 'Get IELTS 7.0',
    goalId: 'goal-1',
    id: 'step-1',
    isDone: false,
    keywords: ['english'],
    linkedRoutineIds: ['routine-1', 'routine-2'],
  };
  const result = stepSchema.parse(input);
  expect(result.linkedRoutineIds).toEqual(['routine-1', 'routine-2']);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/step
```
Expected: FAIL — `linkedRoutineIds` not in schema

- [ ] **Step 3: Update the step schema**

Replace `src/store/schemas/step.ts`:

```typescript
import * as z from 'zod';

export const stepSchema = z.object({
  deadline: z.iso.date(),
  description: z.string(),
  goalId: z.string(),
  id: z.string(),
  isDone: z.boolean(),
  keywords: z.array(z.string()),
  linkedRoutineIds: z.array(z.string()).default([]),
});

export type Step = z.infer<typeof stepSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=store/schemas/step
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/schemas/step.ts src/store/schemas/step.test.ts
git commit -m "feat: add linkedRoutineIds to step schema with default []"
```

---

### Task 3: Create stepStore

**Files:**
- Create: `src/store/stepStore.ts`
- Create: `src/store/stepStore.test.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/stepStore.test.ts`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
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

import { stepStore } from '@/store/stepStore';

const makeStep = (id: string, goalId = 'goal-1') => ({
  deadline: '2027-06-01',
  description: `Step ${id}`,
  goalId,
  id,
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
});

describe('stepStore', () => {
  beforeEach(() => {
    stepStore.deleteStep('s-1');
    stepStore.deleteStep('s-2');
    stepStore.deleteStep('s-3');
  });

  it('returns empty array for unknown goalId', () => {
    expect(stepStore.getStepsByGoalId('goal-unknown')).toEqual([]);
  });

  it('saves and retrieves steps filtered by goalId', () => {
    stepStore.saveStep(makeStep('s-1', 'goal-1'));
    stepStore.saveStep(makeStep('s-2', 'goal-2'));
    const result = stepStore.getStepsByGoalId('goal-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s-1');
  });

  it('updates an existing step in place', () => {
    stepStore.saveStep(makeStep('s-1'));
    stepStore.saveStep({ ...makeStep('s-1'), description: 'Updated' });
    const steps = stepStore.getStepsByGoalId('goal-1');
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toBe('Updated');
  });

  it('deletes a step', () => {
    stepStore.saveStep(makeStep('s-1'));
    stepStore.deleteStep('s-1');
    expect(stepStore.getStepsByGoalId('goal-1')).toHaveLength(0);
  });

  it('saves and retrieves linkedRoutineIds', () => {
    stepStore.saveStep({ ...makeStep('s-1'), linkedRoutineIds: ['r-1', 'r-2'] });
    const steps = stepStore.getStepsByGoalId('goal-1');
    expect(steps[0].linkedRoutineIds).toEqual(['r-1', 'r-2']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/stepStore
```
Expected: FAIL — module not found

- [ ] **Step 3: Create stepStore**

Create `src/store/stepStore.ts`:

```typescript
import type { Step } from '@/store/schemas';

import { stepSchema } from '@/store/schemas';
import { appStorage } from '@/store/storage';

const STEPS_KEY = 'steps';

function getAllSteps(): Step[] {
  const raw = appStorage.getString(STEPS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as unknown[]).map(s => stepSchema.parse(s));
  } catch {
    return [];
  }
}

function getStepsByGoalId(goalId: string): Step[] {
  return getAllSteps().filter(s => s.goalId === goalId);
}

function saveStep(step: Step): void {
  const current = getAllSteps();
  const existingIndex = current.findIndex(s => s.id === step.id);
  const updated =
    existingIndex >= 0
      ? current.map(s => (s.id === step.id ? step : s))
      : [...current, step];
  appStorage.set(STEPS_KEY, JSON.stringify(updated));
}

function deleteStep(stepId: string): void {
  const updated = getAllSteps().filter(s => s.id !== stepId);
  appStorage.set(STEPS_KEY, JSON.stringify(updated));
}

export const stepStore = {
  deleteStep,
  getStepsByGoalId,
  saveStep,
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/stepStore
```
Expected: PASS

- [ ] **Step 5: Export from store index**

Open `src/store/index.ts` and add `export * from './stepStore';`. The final file:

```typescript
export * from './goalStore';
export * from './routineStore';
export * from './schemas';
export { appStorage } from './storage';
export * from './stepStore';
```

- [ ] **Step 6: Commit**

```bash
cd MyApp && git add src/store/stepStore.ts src/store/stepStore.test.ts src/store/index.ts
git commit -m "feat: add step store with MMKV persistence"
```

---

## Chunk 2: Hooks

### Task 4: useGoals hook

**Files:**
- Create: `src/hooks/domain/goals/useGoals.ts`
- Create: `src/hooks/domain/goals/useGoals.test.ts`

> **Pattern:** Reads MMKV synchronously on each render. Mutations call `forceUpdate` to trigger a re-render, which causes the hook body to re-run and return fresh data from the store — same pattern as `useDailyPlan` in Plan 3.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/domain/goals/useGoals.test.ts`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn(),
    getGoals: jest.fn(),
    saveGoal: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';

import { useGoals } from './useGoals';

const makeGoal = (id: string, archivedAt?: string) => ({
  archivedAt,
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id,
  keywords: ['health'],
  statement: `Goal ${id}`,
});

beforeEach(() => {
  jest.clearAllMocks();
  (goalStore.getFutureSelf as jest.Mock).mockReturnValue([]);
});

describe('useGoals', () => {
  it('returns empty list when no goals stored', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toEqual([]);
  });

  it('filters out archived goals from active list', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      makeGoal('g-1'),
      makeGoal('g-2', '2026-03-12T00:00:00.000Z'),
    ]);
    const { result } = renderHook(() => useGoals());
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].id).toBe('g-1');
  });

  it('addGoal calls saveGoal on the store', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.addGoal(makeGoal('g-1'));
    });
    expect(goalStore.saveGoal).toHaveBeenCalledWith(makeGoal('g-1'));
  });

  it('updateGoal calls saveGoal on the store', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([makeGoal('g-1')]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.updateGoal({ ...makeGoal('g-1'), statement: 'Updated' });
    });
    expect(goalStore.saveGoal).toHaveBeenCalledWith(
      expect.objectContaining({ statement: 'Updated' }),
    );
  });

  it('archiveGoal saves goal with archivedAt set', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([makeGoal('g-1')]);
    const { result } = renderHook(() => useGoals());
    act(() => {
      result.current.archiveGoal('g-1');
    });
    const saved = (goalStore.saveGoal as jest.Mock).mock.calls[0][0];
    expect(saved.id).toBe('g-1');
    expect(saved.archivedAt).toBeDefined();
  });

  it('futureSelfFor delegates to goalStore.getFutureSelf', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([]);
    (goalStore.getFutureSelf as jest.Mock).mockReturnValue([
      { goalId: 'g-1', narrative: 'I am living my dream.', timeframe: '5yr' },
    ]);
    const { result } = renderHook(() => useGoals());
    const narratives = result.current.futureSelfFor('g-1');
    expect(narratives).toHaveLength(1);
    expect(narratives[0].timeframe).toBe('5yr');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/goals/useGoals
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the hook**

Create `src/hooks/domain/goals/useGoals.ts`:

```typescript
import { useCallback, useState } from 'react';

import type { FutureSelf, Goal } from '@/store/schemas';

import { goalStore } from '@/store/goalStore';

function useGoals() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const allGoals = goalStore.getGoals();
  const goals = allGoals.filter(g => !g.archivedAt);

  const addGoal = useCallback(
    (goal: Goal) => {
      goalStore.saveGoal(goal);
      refresh();
    },
    [refresh],
  );

  const updateGoal = useCallback(
    (goal: Goal) => {
      goalStore.saveGoal(goal);
      refresh();
    },
    [refresh],
  );

  const archiveGoal = useCallback(
    (goalId: string) => {
      const goal = goalStore.getGoals().find(g => g.id === goalId);
      if (!goal) return;
      goalStore.saveGoal({ ...goal, archivedAt: new Date().toISOString() });
      refresh();
    },
    [refresh],
  );

  const futureSelfFor = useCallback((goalId: string): FutureSelf[] => {
    return goalStore.getFutureSelf(goalId);
  }, []);

  return { addGoal, archiveGoal, futureSelfFor, goals, updateGoal };
}

export { useGoals };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=domain/goals/useGoals
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/hooks/domain/goals/useGoals.ts src/hooks/domain/goals/useGoals.test.ts
git commit -m "feat: add useGoals hook"
```

---

### Task 5: useSteps hook

**Files:**
- Create: `src/hooks/domain/goals/useSteps.ts`
- Create: `src/hooks/domain/goals/useSteps.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/domain/goals/useSteps.test.ts`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/stepStore', () => ({
  stepStore: {
    deleteStep: jest.fn(),
    getStepsByGoalId: jest.fn(),
    saveStep: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react-native';

import { stepStore } from '@/store/stepStore';

import { useSteps } from './useSteps';

const makeStep = (id: string) => ({
  deadline: '2027-06-01',
  description: `Step ${id}`,
  goalId: 'goal-1',
  id,
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
});

beforeEach(() => {
  jest.clearAllMocks();
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
});

describe('useSteps', () => {
  it('returns empty steps for unknown goalId', () => {
    const { result } = renderHook(() => useSteps('goal-unknown'));
    expect(result.current.steps).toEqual([]);
  });

  it('returns steps for the given goalId', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([makeStep('s-1')]);
    const { result } = renderHook(() => useSteps('goal-1'));
    expect(result.current.steps).toHaveLength(1);
  });

  it('addStep calls saveStep on the store', () => {
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.addStep(makeStep('s-1'));
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith(makeStep('s-1'));
  });

  it('deleteStep calls deleteStep on the store', () => {
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.deleteStep('s-1');
    });
    expect(stepStore.deleteStep).toHaveBeenCalledWith('s-1');
  });

  it('toggleDone flips isDone and saves the updated step', () => {
    const step = makeStep('s-1');
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([step]);
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.toggleDone('s-1');
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith({ ...step, isDone: true });
  });

  it('completedCount counts steps with isDone true', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([
      { ...makeStep('s-1'), isDone: true },
      { ...makeStep('s-2'), isDone: false },
    ]);
    const { result } = renderHook(() => useSteps('goal-1'));
    expect(result.current.completedCount).toBe(1);
  });

  it('updateStep calls saveStep with the updated step', () => {
    const step = makeStep('s-1');
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([step]);
    const { result } = renderHook(() => useSteps('goal-1'));
    act(() => {
      result.current.updateStep({ ...step, linkedRoutineIds: ['r-1'] });
    });
    expect(stepStore.saveStep).toHaveBeenCalledWith(
      expect.objectContaining({ linkedRoutineIds: ['r-1'] }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/goals/useSteps
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the hook**

Create `src/hooks/domain/goals/useSteps.ts`:

```typescript
import { useCallback, useState } from 'react';

import type { Step } from '@/store/schemas';

import { stepStore } from '@/store/stepStore';

function useSteps(goalId: string) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const steps = stepStore.getStepsByGoalId(goalId);
  const completedCount = steps.filter(s => s.isDone).length;

  const addStep = useCallback(
    (step: Step) => {
      stepStore.saveStep(step);
      refresh();
    },
    [refresh],
  );

  const updateStep = useCallback(
    (step: Step) => {
      stepStore.saveStep(step);
      refresh();
    },
    [refresh],
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      stepStore.deleteStep(stepId);
      refresh();
    },
    [refresh],
  );

  const toggleDone = useCallback(
    (stepId: string) => {
      const step = stepStore.getStepsByGoalId(goalId).find(s => s.id === stepId);
      if (!step) return;
      stepStore.saveStep({ ...step, isDone: !step.isDone });
      refresh();
    },
    [goalId, refresh],
  );

  return { addStep, completedCount, deleteStep, steps, toggleDone, updateStep };
}

export { useSteps };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=domain/goals/useSteps
```
Expected: PASS

- [ ] **Step 5: Export from domain index**

Open `src/hooks/domain/index.ts`. Replace with:

```typescript
export * from './goals/useGoals';
export * from './goals/useSteps';
export * from './onboarding/useOnboardingStatus';
export * from './user';
```

- [ ] **Step 6: Run type check**

```bash
cd MyApp && yarn lint:type-check
```
Expected: PASS (or only pre-existing errors)

- [ ] **Step 7: Commit**

```bash
cd MyApp && git add src/hooks/domain/goals/useSteps.ts src/hooks/domain/goals/useSteps.test.ts src/hooks/domain/index.ts
git commit -m "feat: add useSteps hook and export goals hooks from domain index"
```

---

## Chunk 3: Goals UI Components

> **Theme reminder:** Available sizes: `[8, 10, 12, 14, 16, 24, 32, 40, 80]`. Use `gutters.marginTop_N`, `gutters.paddingHorizontal_N`, `fonts.size_N`, `fonts.gray800`, `backgrounds.gray100`, etc. Named constants (e.g., `const BORDER_RADIUS = 8`) are allowed in component files for values with no theme equivalent.

### Task 6: FutureSelfSection

**Files:**
- Create: `src/screens/Goals/components/FutureSelfSection.tsx`
- Create: `src/screens/Goals/components/FutureSelfSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/FutureSelfSection.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react-native';

import FutureSelfSection from './FutureSelfSection';

const bothNarratives = [
  { goalId: 'g-1', narrative: 'I am 35 and thriving.', timeframe: '5yr' as const },
  { goalId: 'g-1', narrative: 'I am 40 and fulfilled.', timeframe: '10yr' as const },
];

describe('FutureSelfSection', () => {
  it('renders both 5yr and 10yr narratives', () => {
    render(<FutureSelfSection futureSelf={bothNarratives} />);
    expect(screen.getByText('5 years')).toBeTruthy();
    expect(screen.getByText('I am 35 and thriving.')).toBeTruthy();
    expect(screen.getByText('10 years')).toBeTruthy();
    expect(screen.getByText('I am 40 and fulfilled.')).toBeTruthy();
  });

  it('renders placeholder when no narratives exist', () => {
    render(<FutureSelfSection futureSelf={[]} />);
    expect(screen.getByText('No future self written yet.')).toBeTruthy();
  });

  it('shows placeholder for missing 10yr when only 5yr exists', () => {
    render(<FutureSelfSection futureSelf={[bothNarratives[0]]} />);
    expect(screen.getByText('I am 35 and thriving.')).toBeTruthy();
    expect(screen.getByText('Not written yet.')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/FutureSelfSection
```
Expected: FAIL — module not found

- [ ] **Step 3: Create FutureSelfSection**

Create `src/screens/Goals/components/FutureSelfSection.tsx`:

```typescript
import { Text, View } from 'react-native';

import type { FutureSelf } from '@/store/schemas';

import { useTheme } from '@/theme';

type Props = {
  futureSelf: FutureSelf[];
};

function FutureSelfSection({ futureSelf }: Props) {
  const { fonts, gutters } = useTheme();

  const fiveYear = futureSelf.find(f => f.timeframe === '5yr');
  const tenYear = futureSelf.find(f => f.timeframe === '10yr');

  if (!fiveYear && !tenYear) {
    return (
      <Text style={[fonts.size_12, fonts.gray400, gutters.marginTop_8]}>
        No future self written yet.
      </Text>
    );
  }

  return (
    <View style={gutters.marginTop_8}>
      <Text style={[fonts.size_12, fonts.bold, fonts.gray600]}>5 years</Text>
      <Text style={[fonts.size_14, fonts.gray800, gutters.marginTop_8]}>
        {fiveYear ? fiveYear.narrative : 'Not written yet.'}
      </Text>
      <Text style={[fonts.size_12, fonts.bold, fonts.gray600, gutters.marginTop_16]}>
        10 years
      </Text>
      <Text style={[fonts.size_14, fonts.gray800, gutters.marginTop_8]}>
        {tenYear ? tenYear.narrative : 'Not written yet.'}
      </Text>
    </View>
  );
}

export default FutureSelfSection;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/FutureSelfSection
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/FutureSelfSection.tsx src/screens/Goals/components/FutureSelfSection.test.tsx
git commit -m "feat: add FutureSelfSection component"
```

---

### Task 7: StepFormSheet

**Files:**
- Create: `src/screens/Goals/components/StepFormSheet.tsx`
- Create: `src/screens/Goals/components/StepFormSheet.test.tsx`

> **Purpose:** Modal bottom sheet for adding or editing a step. Fields: description (required), deadline as YYYY-MM-DD text (required). Keywords are pre-populated from the parent goal's keywords — the user cannot edit them here (they inherit from the goal).

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/StepFormSheet.test.tsx`:

```typescript
import { fireEvent, render, screen } from '@testing-library/react-native';

import StepFormSheet from './StepFormSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const existingStep = {
  deadline: '2027-06-01',
  description: 'Study daily',
  goalId: 'goal-1',
  id: 'step-1',
  isDone: false,
  keywords: ['health'],
  linkedRoutineIds: [] as string[],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StepFormSheet', () => {
  it('renders empty form for a new step', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={undefined}
        visible
      />,
    );
    expect(screen.getByTestId('step-form-description')).toBeTruthy();
    expect(screen.getByTestId('step-form-deadline')).toBeTruthy();
  });

  it('pre-fills form when editing an existing step', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={existingStep}
        visible
      />,
    );
    expect(screen.getByDisplayValue('Study daily')).toBeTruthy();
    expect(screen.getByDisplayValue('2027-06-01')).toBeTruthy();
  });

  it('calls onSave with step data when both fields are filled', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={undefined}
        visible
      />,
    );
    fireEvent.changeText(screen.getByTestId('step-form-description'), 'New step');
    fireEvent.changeText(screen.getByTestId('step-form-deadline'), '2027-01-01');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        deadline: '2027-01-01',
        description: 'New step',
        goalId: 'goal-1',
        keywords: ['health'],
      }),
    );
  });

  it('does not call onSave when description is empty', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={undefined}
        visible
      />,
    );
    fireEvent.changeText(screen.getByTestId('step-form-deadline'), '2027-01-01');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not call onSave when deadline is empty', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={undefined}
        visible
      />,
    );
    fireEvent.changeText(screen.getByTestId('step-form-description'), 'New step');
    fireEvent.press(screen.getByTestId('step-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    render(
      <StepFormSheet
        goalId="goal-1"
        goalKeywords={['health']}
        onClose={onClose}
        onSave={onSave}
        step={undefined}
        visible
      />,
    );
    fireEvent.press(screen.getByTestId('step-form-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/StepFormSheet
```
Expected: FAIL — module not found

- [ ] **Step 3: Create StepFormSheet**

Create `src/screens/Goals/components/StepFormSheet.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import type { Step } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const INPUT_BORDER_WIDTH = 1;

type Props = {
  goalId: string;
  goalKeywords: string[];
  onClose: () => void;
  onSave: (step: Step) => void;
  step: Step | undefined;
  visible: boolean;
};

function StepFormSheet({ goalId, goalKeywords, onClose, onSave, step, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (visible) {
      setDescription(step?.description ?? '');
      setDeadline(step?.deadline ?? '');
    }
  }, [visible, step]);

  function handleSave() {
    const trimmedDesc = description.trim();
    const trimmedDeadline = deadline.trim();
    if (!trimmedDesc || !trimmedDeadline) return;
    const saved: Step = {
      deadline: trimmedDeadline,
      description: trimmedDesc,
      goalId,
      id: step?.id ?? Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      isDone: step?.isDone ?? false,
      keywords: step?.keywords ?? goalKeywords,
      linkedRoutineIds: step?.linkedRoutineIds ?? [],
    };
    onSave(saved);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
          {step ? 'Edit Step' : 'Add Step'}
        </Text>
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="What will you do?"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_16,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="step-form-description"
          value={description}
        />
        <TextInput
          onChangeText={setDeadline}
          placeholder="Deadline (YYYY-MM-DD)"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="step-form-deadline"
          value={deadline}
        />
        <View style={[layout.row, gutters.marginTop_24]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: 8 },
            ]}
            testID="step-form-cancel"
          >
            <Text style={[fonts.size_14, fonts.gray600]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS },
            ]}
            testID="step-form-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default StepFormSheet;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/StepFormSheet
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/StepFormSheet.tsx src/screens/Goals/components/StepFormSheet.test.tsx
git commit -m "feat: add StepFormSheet component"
```

---

### Task 8: LinkedRoutinesSheet

**Files:**
- Create: `src/screens/Goals/components/LinkedRoutinesSheet.tsx`
- Create: `src/screens/Goals/components/LinkedRoutinesSheet.test.tsx`

> **Purpose:** Modal that shows all routines from the library as a checkable list. Pre-checks routines already in `linkedRoutineIds`. On save, calls `onSave` with the updated list of IDs.

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/LinkedRoutinesSheet.test.tsx`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getRoutines: jest.fn(),
  },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';

import LinkedRoutinesSheet from './LinkedRoutinesSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const routines = [
  {
    id: 'r-1',
    name: 'Morning run',
    schedule: { days: ['Mon' as const], type: 'weekdays' as const },
    tags: ['health'],
  },
  {
    id: 'r-2',
    name: 'Study 30 min',
    schedule: { days: ['Tue' as const], type: 'weekdays' as const },
    tags: ['learning'],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (routineStore.getRoutines as jest.Mock).mockReturnValue(routines);
});

describe('LinkedRoutinesSheet', () => {
  it('renders all routines from the library', () => {
    render(
      <LinkedRoutinesSheet
        linkedRoutineIds={[]}
        onClose={onClose}
        onSave={onSave}
        visible
      />,
    );
    expect(screen.getByText('Morning run')).toBeTruthy();
    expect(screen.getByText('Study 30 min')).toBeTruthy();
  });

  it('calls onSave with selected routine IDs', () => {
    render(
      <LinkedRoutinesSheet
        linkedRoutineIds={[]}
        onClose={onClose}
        onSave={onSave}
        visible
      />,
    );
    fireEvent.press(screen.getByTestId('routine-check-r-1'));
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-1']);
  });

  it('pre-checks already linked routines', () => {
    render(
      <LinkedRoutinesSheet
        linkedRoutineIds={['r-2']}
        onClose={onClose}
        onSave={onSave}
        visible
      />,
    );
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-2']);
  });

  it('allows unchecking an already-linked routine', () => {
    render(
      <LinkedRoutinesSheet
        linkedRoutineIds={['r-1', 'r-2']}
        onClose={onClose}
        onSave={onSave}
        visible
      />,
    );
    fireEvent.press(screen.getByTestId('routine-check-r-1'));
    fireEvent.press(screen.getByTestId('linked-routines-save'));
    expect(onSave).toHaveBeenCalledWith(['r-2']);
  });

  it('calls onClose when cancelled', () => {
    render(
      <LinkedRoutinesSheet
        linkedRoutineIds={[]}
        onClose={onClose}
        onSave={onSave}
        visible
      />,
    );
    fireEvent.press(screen.getByTestId('linked-routines-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/LinkedRoutinesSheet
```
Expected: FAIL — module not found

- [ ] **Step 3: Create LinkedRoutinesSheet**

Create `src/screens/Goals/components/LinkedRoutinesSheet.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { routineStore } from '@/store/routineStore';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const BUTTON_GAP = 8;
const CHECKBOX_BORDER = 2;
const CHECKBOX_GAP = 12;
const CHECKBOX_RADIUS = 4;
const CHECKBOX_SIZE = 20;
const ROW_BORDER_WIDTH = 1;

type Props = {
  linkedRoutineIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  visible: boolean;
};

function LinkedRoutinesSheet({ linkedRoutineIds, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelected([...linkedRoutineIds]);
    }
  }, [visible, linkedRoutineIds]);

  const routines = routineStore.getRoutines();

  function toggleRoutine(routineId: string) {
    setSelected(prev =>
      prev.includes(routineId) ? prev.filter(id => id !== routineId) : [...prev, routineId],
    );
  }

  function handleSave() {
    onSave(selected);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { maxHeight: '60%', position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>Link Routines</Text>
        <ScrollView style={gutters.marginTop_16}>
          {routines.map(routine => {
            const isChecked = selected.includes(routine.id);
            return (
              <Pressable
                key={routine.id}
                onPress={() => toggleRoutine(routine.id)}
                style={[
                  layout.row,
                  layout.itemsCenter,
                  gutters.paddingVertical_12,
                  { borderBottomWidth: ROW_BORDER_WIDTH, borderColor: colors.gray100 },
                ]}
                testID={`routine-check-${routine.id}`}
              >
                <View
                  style={{
                    backgroundColor: isChecked ? colors.purple500 : 'transparent',
                    borderColor: isChecked ? colors.purple500 : colors.gray400,
                    borderRadius: CHECKBOX_RADIUS,
                    borderWidth: CHECKBOX_BORDER,
                    height: CHECKBOX_SIZE,
                    marginRight: CHECKBOX_GAP,
                    width: CHECKBOX_SIZE,
                  }}
                />
                <Text style={[fonts.size_14, fonts.gray800]}>{routine.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={[layout.row, gutters.marginTop_16]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: BUTTON_GAP },
            ]}
            testID="linked-routines-cancel"
          >
            <Text style={[fonts.size_14, fonts.gray600]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS },
            ]}
            testID="linked-routines-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default LinkedRoutinesSheet;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/LinkedRoutinesSheet
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/LinkedRoutinesSheet.tsx src/screens/Goals/components/LinkedRoutinesSheet.test.tsx
git commit -m "feat: add LinkedRoutinesSheet component"
```

---

### Task 9: StepItem

**Files:**
- Create: `src/screens/Goals/components/StepItem.tsx`
- Create: `src/screens/Goals/components/StepItem.test.tsx`

> **Purpose:** A single step row showing description, deadline, linked routine count, a done toggle, and Edit/Delete/Link-Routines action buttons.

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/StepItem.test.tsx`:

```typescript
import { fireEvent, render, screen } from '@testing-library/react-native';

import StepItem from './StepItem';

const step = {
  deadline: '2027-06-01',
  description: 'Study English daily',
  goalId: 'goal-1',
  id: 'step-1',
  isDone: false,
  keywords: ['english'],
  linkedRoutineIds: ['r-1', 'r-2'],
};

const onToggleDone = jest.fn();
const onEdit = jest.fn();
const onDelete = jest.fn();
const onLinkRoutines = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StepItem', () => {
  it('renders description and deadline', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    expect(screen.getByText('Study English daily')).toBeTruthy();
    expect(screen.getByText('2027-06-01')).toBeTruthy();
  });

  it('shows linked routine count', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    expect(screen.getByText('2 routines')).toBeTruthy();
  });

  it('calls onToggleDone when toggle is pressed', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    fireEvent.press(screen.getByTestId('step-toggle-step-1'));
    expect(onToggleDone).toHaveBeenCalledWith('step-1');
  });

  it('calls onEdit when edit is pressed', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    fireEvent.press(screen.getByTestId('step-edit-step-1'));
    expect(onEdit).toHaveBeenCalledWith(step);
  });

  it('calls onDelete when delete is pressed', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    fireEvent.press(screen.getByTestId('step-delete-step-1'));
    expect(onDelete).toHaveBeenCalledWith('step-1');
  });

  it('calls onLinkRoutines when link button is pressed', () => {
    render(
      <StepItem
        onDelete={onDelete}
        onEdit={onEdit}
        onLinkRoutines={onLinkRoutines}
        onToggleDone={onToggleDone}
        step={step}
      />,
    );
    fireEvent.press(screen.getByTestId('step-link-routines-step-1'));
    expect(onLinkRoutines).toHaveBeenCalledWith(step);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/StepItem
```
Expected: FAIL — module not found

- [ ] **Step 3: Create StepItem**

Create `src/screens/Goals/components/StepItem.tsx`:

```typescript
import { Pressable, Text, View } from 'react-native';

import type { Step } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 6;
const DELETE_COLOR = '#EF4444';
const TOGGLE_BORDER = 2;
const TOGGLE_GAP = 12;
const TOGGLE_SIZE = 24;

type Props = {
  onDelete: (stepId: string) => void;
  onEdit: (step: Step) => void;
  onLinkRoutines: (step: Step) => void;
  onToggleDone: (stepId: string) => void;
  step: Step;
};

function StepItem({ onDelete, onEdit, onLinkRoutines, onToggleDone, step }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const routineLabel =
    step.linkedRoutineIds.length === 1 ? '1 routine' : `${step.linkedRoutineIds.length} routines`;

  return (
    <View
      style={[
        backgrounds.gray100,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_12,
        gutters.marginTop_8,
        { borderRadius: BORDER_RADIUS },
      ]}
    >
      {/* Top row: toggle + description */}
      <View style={[layout.row, layout.itemsCenter]}>
        <Pressable
          onPress={() => onToggleDone(step.id)}
          style={[
            {
              alignItems: 'center',
              backgroundColor: step.isDone ? colors.purple500 : 'transparent',
              borderColor: step.isDone ? colors.purple500 : colors.gray400,
              borderRadius: TOGGLE_SIZE / 2,
              borderWidth: TOGGLE_BORDER,
              height: TOGGLE_SIZE,
              justifyContent: 'center',
              marginRight: TOGGLE_GAP,
              width: TOGGLE_SIZE,
            },
          ]}
          testID={`step-toggle-${step.id}`}
        >
          {step.isDone && <Text style={[fonts.size_12, fonts.gray50]}>✓</Text>}
        </Pressable>
        <Text
          style={[
            layout.flex_1,
            fonts.size_14,
            step.isDone ? fonts.gray400 : fonts.gray800,
            step.isDone && { textDecorationLine: 'line-through' },
          ]}
        >
          {step.description}
        </Text>
      </View>

      {/* Deadline + routine count */}
      <View style={[layout.row, gutters.marginTop_8, { paddingLeft: TOGGLE_SIZE + TOGGLE_GAP }]}>
        <Text style={[fonts.size_12, fonts.gray400]}>{step.deadline}</Text>
        {step.linkedRoutineIds.length > 0 && (
          <Text style={[fonts.size_12, fonts.gray400, gutters.marginLeft_12]}>{routineLabel}</Text>
        )}
      </View>

      {/* Action row */}
      <View style={[layout.row, gutters.marginTop_8, { paddingLeft: TOGGLE_SIZE + TOGGLE_GAP }]}>
        <Pressable
          onPress={() => onEdit(step)}
          style={gutters.marginRight_16}
          testID={`step-edit-${step.id}`}
        >
          <Text style={[fonts.size_12, fonts.gray600]}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => onLinkRoutines(step)}
          style={gutters.marginRight_16}
          testID={`step-link-routines-${step.id}`}
        >
          <Text style={[fonts.size_12, fonts.gray600]}>Routines</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(step.id)}
          testID={`step-delete-${step.id}`}
        >
          <Text style={[fonts.size_12, { color: DELETE_COLOR }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default StepItem;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/StepItem
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/StepItem.tsx src/screens/Goals/components/StepItem.test.tsx
git commit -m "feat: add StepItem component"
```

---

### Task 10: GoalFormSheet

**Files:**
- Create: `src/screens/Goals/components/GoalFormSheet.tsx`
- Create: `src/screens/Goals/components/GoalFormSheet.test.tsx`

> **Purpose:** Modal bottom sheet for adding or editing a goal. Fields: statement (required), category picker (required), keywords as comma-separated text (required, at least one). Used both for the "Add Goal" button and the "Edit" action on an existing goal card.

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/GoalFormSheet.test.tsx`:

```typescript
import { fireEvent, render, screen } from '@testing-library/react-native';

import GoalFormSheet from './GoalFormSheet';

const onSave = jest.fn();
const onClose = jest.fn();

const existingGoal = {
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id: 'goal-1',
  keywords: ['fitness', 'wellness'],
  statement: 'Get healthy',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GoalFormSheet', () => {
  it('renders empty form for new goal', () => {
    render(
      <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />,
    );
    expect(screen.getByTestId('goal-form-statement')).toBeTruthy();
    expect(screen.getByTestId('goal-form-keywords')).toBeTruthy();
  });

  it('pre-fills form when editing existing goal', () => {
    render(
      <GoalFormSheet goal={existingGoal} onClose={onClose} onSave={onSave} visible />,
    );
    expect(screen.getByDisplayValue('Get healthy')).toBeTruthy();
    expect(screen.getByDisplayValue('fitness, wellness')).toBeTruthy();
  });

  it('calls onSave with goal data when all fields filled', () => {
    render(
      <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />,
    );
    fireEvent.press(screen.getByTestId('goal-category-Family'));
    fireEvent.changeText(screen.getByTestId('goal-form-statement'), 'My goal');
    fireEvent.changeText(screen.getByTestId('goal-form-keywords'), 'family, love');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Family',
        keywords: ['family', 'love'],
        statement: 'My goal',
      }),
    );
  });

  it('does not call onSave when statement is empty', () => {
    render(
      <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />,
    );
    fireEvent.press(screen.getByTestId('goal-category-Health'));
    fireEvent.changeText(screen.getByTestId('goal-form-keywords'), 'health');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not call onSave when keywords are empty', () => {
    render(
      <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />,
    );
    fireEvent.press(screen.getByTestId('goal-category-Health'));
    fireEvent.changeText(screen.getByTestId('goal-form-statement'), 'My goal');
    fireEvent.press(screen.getByTestId('goal-form-save'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancelled', () => {
    render(
      <GoalFormSheet goal={undefined} onClose={onClose} onSave={onSave} visible />,
    );
    fireEvent.press(screen.getByTestId('goal-form-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/GoalFormSheet
```
Expected: FAIL — module not found

- [ ] **Step 3: Create GoalFormSheet**

Create `src/screens/Goals/components/GoalFormSheet.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { Goal } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const INPUT_BORDER_WIDTH = 1;
const CATEGORIES = ['Family', 'Health', 'Money', 'Career', 'Travel', 'Others'] as const;

type Category = (typeof CATEGORIES)[number];

type Props = {
  goal: Goal | undefined;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  visible: boolean;
};

function GoalFormSheet({ goal, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [statement, setStatement] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [category, setCategory] = useState<Category>('Others');

  useEffect(() => {
    if (visible) {
      setStatement(goal?.statement ?? '');
      setKeywordsText(goal?.keywords.join(', ') ?? '');
      setCategory((goal?.category as Category | undefined) ?? 'Others');
    }
  }, [visible, goal]);

  function handleSave() {
    const trimmedStatement = statement.trim();
    const keywords = keywordsText
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    if (!trimmedStatement || keywords.length === 0) return;
    const saved: Goal = {
      archivedAt: goal?.archivedAt,
      category,
      createdAt: goal?.createdAt ?? new Date().toISOString(),
      id: goal?.id ?? Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      keywords,
      statement: trimmedStatement,
    };
    onSave(saved);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
          {goal ? 'Edit Goal' : 'Add Goal'}
        </Text>

        {/* Category picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={gutters.marginTop_16}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                gutters.paddingHorizontal_12,
                gutters.paddingVertical_8,
                {
                  borderRadius: BORDER_RADIUS,
                  marginRight: 8,
                  backgroundColor: category === cat ? colors.purple500 : colors.gray200,
                },
              ]}
              testID={`goal-category-${cat}`}
            >
              <Text
                style={[
                  fonts.size_12,
                  { color: category === cat ? colors.gray50 : colors.gray800 },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          multiline
          onChangeText={setStatement}
          placeholder="Describe your goal"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_16,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="goal-form-statement"
          value={statement}
        />

        <TextInput
          onChangeText={setKeywordsText}
          placeholder="Keywords (comma separated)"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="goal-form-keywords"
          value={keywordsText}
        />

        <View style={[layout.row, gutters.marginTop_24]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: 8 },
            ]}
            testID="goal-form-cancel"
          >
            <Text style={[fonts.size_14, fonts.gray600]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS },
            ]}
            testID="goal-form-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default GoalFormSheet;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/GoalFormSheet
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/GoalFormSheet.tsx src/screens/Goals/components/GoalFormSheet.test.tsx
git commit -m "feat: add GoalFormSheet component"
```

---

### Task 11: GoalCard

**Files:**
- Create: `src/screens/Goals/components/GoalCard.tsx`
- Create: `src/screens/Goals/components/GoalCard.test.tsx`

> **Purpose:** Expandable card for a single goal. Collapsed: shows statement + keywords + step completion stats + expand chevron. Expanded: shows FutureSelfSection, list of StepItems, "Add Step" button, Edit and Archive actions. Manages its own `useSteps` hook and sheet visibility state.

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/components/GoalCard.test.tsx`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/stepStore', () => ({
  stepStore: {
    deleteStep: jest.fn(),
    getStepsByGoalId: jest.fn(),
    saveStep: jest.fn(),
  },
}));
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getRoutines: jest.fn(),
  },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';
import { stepStore } from '@/store/stepStore';

import GoalCard from './GoalCard';

const goal = {
  category: 'Health',
  createdAt: '2026-03-12T00:00:00.000Z',
  id: 'goal-1',
  keywords: ['fitness'],
  statement: 'Get fit and healthy',
};

const futureSelf = [
  { goalId: 'goal-1', narrative: 'I am fit.', timeframe: '5yr' as const },
];

const onEdit = jest.fn();
const onArchive = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
  (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
});

describe('GoalCard', () => {
  it('renders goal statement', () => {
    render(
      <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />,
    );
    expect(screen.getByText('Get fit and healthy')).toBeTruthy();
  });

  it('is collapsed by default and expands on tap', () => {
    render(
      <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />,
    );
    expect(screen.queryByText('I am fit.')).toBeNull();
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    expect(screen.getByText('I am fit.')).toBeTruthy();
  });

  it('shows step count in header', () => {
    (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([
      {
        deadline: '2027-01-01',
        description: 'Step A',
        goalId: 'goal-1',
        id: 's-1',
        isDone: true,
        keywords: [],
        linkedRoutineIds: [],
      },
      {
        deadline: '2027-01-01',
        description: 'Step B',
        goalId: 'goal-1',
        id: 's-2',
        isDone: false,
        keywords: [],
        linkedRoutineIds: [],
      },
    ]);
    render(
      <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />,
    );
    expect(screen.getByText('1 / 2 steps')).toBeTruthy();
  });

  it('calls onEdit when Edit is pressed (expanded)', () => {
    render(
      <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />,
    );
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    fireEvent.press(screen.getByTestId('goal-card-edit-goal-1'));
    expect(onEdit).toHaveBeenCalledWith(goal);
  });

  it('calls onArchive when Archive is pressed (expanded)', () => {
    render(
      <GoalCard futureSelf={futureSelf} goal={goal} onArchive={onArchive} onEdit={onEdit} />,
    );
    fireEvent.press(screen.getByTestId('goal-card-header-goal-1'));
    fireEvent.press(screen.getByTestId('goal-card-archive-goal-1'));
    expect(onArchive).toHaveBeenCalledWith('goal-1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/GoalCard
```
Expected: FAIL — module not found

- [ ] **Step 3: Create GoalCard**

Create `src/screens/Goals/components/GoalCard.tsx`:

```typescript
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FutureSelf, Goal, Step } from '@/store/schemas';

import { useTheme } from '@/theme';

import { useSteps } from '@/hooks/domain/goals/useSteps';

import FutureSelfSection from './FutureSelfSection';
import LinkedRoutinesSheet from './LinkedRoutinesSheet';
import StepFormSheet from './StepFormSheet';
import StepItem from './StepItem';

const ACTIONS_GAP = 12;
const BORDER_RADIUS = 12;
const BORDER_WIDTH = 1;
const CHIP_GAP = 6;
const CHIP_ROW_TOP = 6;
const CHIP_VERTICAL_GAP = 4;
const KEYWORD_RADIUS = 12;

type Props = {
  futureSelf: FutureSelf[];
  goal: Goal;
  onArchive: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
};

function GoalCard({ futureSelf, goal, onArchive, onEdit }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const { addStep, completedCount, deleteStep, steps, toggleDone, updateStep } = useSteps(
    goal.id,
  );

  const [expanded, setExpanded] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | undefined>();
  const [stepFormVisible, setStepFormVisible] = useState(false);
  const [linkingStep, setLinkingStep] = useState<Step | undefined>();
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);

  function openAddStep() {
    setEditingStep(undefined);
    setStepFormVisible(true);
  }

  function openEditStep(step: Step) {
    setEditingStep(step);
    setStepFormVisible(true);
  }

  function handleStepSave(step: Step) {
    if (editingStep) {
      updateStep(step);
    } else {
      addStep(step);
    }
    setStepFormVisible(false);
  }

  function openLinkRoutines(step: Step) {
    setLinkingStep(step);
    setLinkSheetVisible(true);
  }

  function handleLinkSave(ids: string[]) {
    if (!linkingStep) return;
    updateStep({ ...linkingStep, linkedRoutineIds: ids });
    setLinkSheetVisible(false);
  }

  return (
    <View
      style={[
        backgrounds.gray50,
        gutters.marginTop_16,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_16,
        { borderRadius: BORDER_RADIUS, borderWidth: BORDER_WIDTH, borderColor: colors.gray200 },
      ]}
    >
      {/* Header — always visible */}
      <Pressable
        onPress={() => setExpanded(e => !e)}
        testID={`goal-card-header-${goal.id}`}
      >
        <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
          <Text style={[layout.flex_1, fonts.size_16, fonts.bold, fonts.gray800]}>
            {goal.statement}
          </Text>
          <Text style={[fonts.size_16, fonts.gray400, gutters.marginLeft_8]}>
            {expanded ? '▾' : '▸'}
          </Text>
        </View>

        {/* Keywords */}
        <View style={[layout.row, { flexWrap: 'wrap', marginTop: CHIP_ROW_TOP }]}>
          {goal.keywords.map(kw => (
            <View
              key={kw}
              style={[
                gutters.paddingHorizontal_8,
                gutters.paddingVertical_8,
                {
                  backgroundColor: colors.purple100,
                  borderRadius: KEYWORD_RADIUS,
                  marginRight: CHIP_GAP,
                  marginTop: CHIP_VERTICAL_GAP,
                },
              ]}
            >
              <Text style={[fonts.size_10, { color: colors.purple500 }]}>{kw}</Text>
            </View>
          ))}
        </View>

        {/* Step completion stat */}
        <Text style={[fonts.size_12, fonts.gray400, { marginTop: CHIP_ROW_TOP }]}>
          {completedCount} / {steps.length} steps
        </Text>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <View style={gutters.marginTop_16}>
          {/* Actions */}
          <View style={[layout.row, { marginBottom: ACTIONS_GAP }]}>
            <Pressable
              onPress={() => onEdit(goal)}
              style={gutters.marginRight_16}
              testID={`goal-card-edit-${goal.id}`}
            >
              <Text style={[fonts.size_12, fonts.gray600]}>Edit Goal</Text>
            </Pressable>
            <Pressable
              onPress={() => onArchive(goal.id)}
              testID={`goal-card-archive-${goal.id}`}
            >
              <Text style={[fonts.size_12, fonts.gray400]}>Archive</Text>
            </Pressable>
          </View>

          {/* Future self */}
          <FutureSelfSection futureSelf={futureSelf} />

          {/* Steps */}
          {steps.length > 0 && (
            <View style={gutters.marginTop_16}>
              <Text style={[fonts.size_14, fonts.bold, fonts.gray800]}>Steps</Text>
              {steps.map(step => (
                <StepItem
                  key={step.id}
                  onDelete={deleteStep}
                  onEdit={openEditStep}
                  onLinkRoutines={openLinkRoutines}
                  onToggleDone={toggleDone}
                  step={step}
                />
              ))}
            </View>
          )}

          {/* Add step */}
          <Pressable
            onPress={openAddStep}
            style={[gutters.marginTop_12, { alignSelf: 'flex-start' }]}
            testID={`goal-card-add-step-${goal.id}`}
          >
            <Text style={[fonts.size_14, { color: colors.purple500 }]}>+ Add Step</Text>
          </Pressable>
        </View>
      )}

      {/* Sheets */}
      <StepFormSheet
        goalId={goal.id}
        goalKeywords={goal.keywords}
        onClose={() => setStepFormVisible(false)}
        onSave={handleStepSave}
        step={editingStep}
        visible={stepFormVisible}
      />
      <LinkedRoutinesSheet
        linkedRoutineIds={linkingStep?.linkedRoutineIds ?? []}
        onClose={() => setLinkSheetVisible(false)}
        onSave={handleLinkSave}
        visible={linkSheetVisible}
      />
    </View>
  );
}

export default GoalCard;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=Goals/components/GoalCard
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Goals/components/GoalCard.tsx src/screens/Goals/components/GoalCard.test.tsx
git commit -m "feat: add GoalCard expandable component"
```

---

## Chunk 4: Goals Screen

### Task 12: Goals.tsx — full implementation

**Files:**
- Modify: `src/screens/Goals/Goals.tsx`

> **Replaces** the placeholder screen created in Plan 1. No navigation needed — all interactions are in-screen via `GoalCard` and `GoalFormSheet`.

- [ ] **Step 1: Write the failing test**

Create `src/screens/Goals/Goals.test.tsx`:

```typescript
// jest.mock must appear before imports — Babel hoists it, keep it first in source
jest.mock('@/store/goalStore', () => ({
  goalStore: {
    getFutureSelf: jest.fn(),
    getGoals: jest.fn(),
    saveGoal: jest.fn(),
  },
}));
jest.mock('@/store/stepStore', () => ({
  stepStore: {
    deleteStep: jest.fn(),
    getStepsByGoalId: jest.fn(),
    saveStep: jest.fn(),
  },
}));
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getRoutines: jest.fn(),
  },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { goalStore } from '@/store/goalStore';
import { routineStore } from '@/store/routineStore';
import { stepStore } from '@/store/stepStore';

import Goals from './Goals';

beforeEach(() => {
  jest.clearAllMocks();
  (goalStore.getGoals as jest.Mock).mockReturnValue([]);
  (goalStore.getFutureSelf as jest.Mock).mockReturnValue([]);
  (stepStore.getStepsByGoalId as jest.Mock).mockReturnValue([]);
  (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
});

describe('Goals screen', () => {
  it('renders with testID', () => {
    render(<Goals />);
    expect(screen.getByTestId('screen-goals')).toBeTruthy();
  });

  it('shows empty state when no goals', () => {
    render(<Goals />);
    expect(screen.getByText('No goals yet.')).toBeTruthy();
  });

  it('renders a GoalCard for each active goal', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      {
        category: 'Health',
        createdAt: '2026-03-12T00:00:00.000Z',
        id: 'g-1',
        keywords: ['health'],
        statement: 'Get fit',
      },
    ]);
    render(<Goals />);
    expect(screen.getByText('Get fit')).toBeTruthy();
  });

  it('shows Add Goal button when fewer than 3 active goals', () => {
    render(<Goals />);
    expect(screen.getByTestId('goals-add-button')).toBeTruthy();
  });

  it('hides Add Goal button when 3 active goals exist', () => {
    (goalStore.getGoals as jest.Mock).mockReturnValue([
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-1', keywords: ['a'], statement: 'Goal 1' },
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-2', keywords: ['b'], statement: 'Goal 2' },
      { category: 'Health', createdAt: '2026-03-12T00:00:00.000Z', id: 'g-3', keywords: ['c'], statement: 'Goal 3' },
    ]);
    render(<Goals />);
    expect(screen.queryByTestId('goals-add-button')).toBeNull();
  });

  it('opens GoalFormSheet when Add Goal is pressed', () => {
    render(<Goals />);
    fireEvent.press(screen.getByTestId('goals-add-button'));
    expect(screen.getByTestId('goal-form-statement')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=screens/Goals/Goals
```
Expected: FAIL — screen renders placeholder, not real implementation

- [ ] **Step 3: Implement Goals.tsx**

Replace `src/screens/Goals/Goals.tsx`:

```typescript
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Goal } from '@/store/schemas';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import { useGoals } from '@/hooks/domain/goals/useGoals';

import GoalCard from './components/GoalCard';
import GoalFormSheet from './components/GoalFormSheet';

const EMPTY_STATE_MARGIN_TOP = 48;
const MAX_ACTIVE_GOALS = 3;

function Goals() {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  const { addGoal, archiveGoal, futureSelfFor, goals, updateGoal } = useGoals();

  const [goalFormVisible, setGoalFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  function openAddGoal() {
    setEditingGoal(undefined);
    setGoalFormVisible(true);
  }

  function openEditGoal(goal: Goal) {
    setEditingGoal(goal);
    setGoalFormVisible(true);
  }

  function handleGoalSave(goal: Goal) {
    if (editingGoal) {
      updateGoal(goal);
    } else {
      addGoal(goal);
    }
    setGoalFormVisible(false);
  }

  return (
    <SafeScreen>
      <View style={[layout.flex_1, backgrounds.gray50]} testID="screen-goals">
        {/* Header */}
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.paddingHorizontal_24,
            gutters.paddingTop_24,
            gutters.paddingBottom_16,
          ]}
        >
          <Text style={[fonts.size_24, fonts.bold, fonts.gray800]}>My Goals</Text>
          {goals.length < MAX_ACTIVE_GOALS && (
            <Pressable onPress={openAddGoal} testID="goals-add-button">
              <Text style={[fonts.size_24, fonts.gray800]}>+</Text>
            </Pressable>
          )}
        </View>

        {/* Goal list */}
        <ScrollView
          contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingBottom_40]}
        >
          {goals.length === 0 ? (
            <Text style={[fonts.size_14, fonts.gray400, { textAlign: 'center', marginTop: EMPTY_STATE_MARGIN_TOP }]}>
              No goals yet.
            </Text>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                futureSelf={futureSelfFor(goal.id)}
                goal={goal}
                onArchive={archiveGoal}
                onEdit={openEditGoal}
              />
            ))
          )}
        </ScrollView>
      </View>

      <GoalFormSheet
        goal={editingGoal}
        onClose={() => setGoalFormVisible(false)}
        onSave={handleGoalSave}
        visible={goalFormVisible}
      />
    </SafeScreen>
  );
}

export default Goals;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd MyApp && yarn test --testPathPattern=screens/Goals/Goals
```
Expected: PASS

- [ ] **Step 5: Run the full test suite**

```bash
cd MyApp && yarn test
```
Expected: All tests pass

- [ ] **Step 6: Run lint**

```bash
cd MyApp && yarn lint
```
Expected: No errors

- [ ] **Step 7: Commit**

```bash
cd MyApp && git add src/screens/Goals/Goals.tsx src/screens/Goals/Goals.test.tsx
git commit -m "feat: implement Goals tab — expandable cards, steps, linked routines, archive"
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

- [ ] **Smoke test on device/simulator** — Launch app, complete onboarding, navigate to Goals tab. Verify: goals appear, cards expand, steps can be added/toggled/deleted, routines can be linked, goals can be archived.

---

## What This Plan Delivers

| Deliverable | Location |
|-------------|---------|
| `archivedAt` on goal schema | `src/store/schemas/goal.ts` |
| `linkedRoutineIds` on step schema | `src/store/schemas/step.ts` |
| Step CRUD store | `src/store/stepStore.ts` |
| `useGoals` hook | `src/hooks/domain/goals/useGoals.ts` |
| `useSteps` hook | `src/hooks/domain/goals/useSteps.ts` |
| `FutureSelfSection` | `src/screens/Goals/components/FutureSelfSection.tsx` |
| `StepFormSheet` | `src/screens/Goals/components/StepFormSheet.tsx` |
| `LinkedRoutinesSheet` | `src/screens/Goals/components/LinkedRoutinesSheet.tsx` |
| `StepItem` | `src/screens/Goals/components/StepItem.tsx` |
| `GoalFormSheet` | `src/screens/Goals/components/GoalFormSheet.tsx` |
| `GoalCard` | `src/screens/Goals/components/GoalCard.tsx` |
| Full Goals screen | `src/screens/Goals/Goals.tsx` |

**Next plan:** Plan 5 — Discover Tab (personalized content feed by goal keywords, news articles, lessons fallback).
