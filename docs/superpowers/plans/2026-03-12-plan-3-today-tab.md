# Today Tab Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Today tab — monthly calendar heatmap (date cells colored by daily completion %), daily routine list for the selected date, routine completion/skip tracking, and the Library contextual sheet for adding routines to a day.

**Architecture:** The Today screen is composed of a `MonthlyCalendar` (color-coded cells by completion %) and a `DailyRoutineList` (routines for the selected date). A `useDailyPlan` hook handles all data logic: computing which routines apply to a given date (scheduled + manually added), reading/writing completion logs, and calculating the daily completion rate. The Library sheet (`AddRoutineSheet`) allows picking from the routine library or creating a new routine on the fly. A `dailyOverride` store layer (added to `routineStore`) tracks manually pinned routines per date.

**Tech Stack:** React Native 0.84, TypeScript, `react-native-mmkv` (via Plan 1 stores), `zod` v4

**Depends on:** Plan 1 — stores, schemas, navigation. Plan 2 Task 0 — theme sizes 8/10/14 must be present.

**Spec:** `docs/superpowers/specs/2026-03-12-life-motivation-app-design.md`

---

## File Structure

```
src/
├── store/
│   └── routineStore.ts              # Add dailyOverride methods (Task 1)
├── hooks/
│   └── domain/
│       └── today/
│           ├── useDailyPlan.ts      # Core data hook
│           ├── useDailyPlan.test.ts
│           ├── useMonthlyRates.ts   # Monthly completion map for heatmap
│           └── useMonthlyRates.test.ts
├── screens/
│   └── Today/
│       ├── Today.tsx
│       ├── Today.test.tsx
│       └── components/
│           ├── MonthlyCalendar.tsx
│           ├── DailyRoutineList.tsx
│           ├── RoutineItem.tsx
│           ├── SkipReasonSheet.tsx
│           └── AddRoutineSheet.tsx
```

---

## Chunk 1: Daily Override Store & Hooks

### Task 1: Add daily override methods to routineStore

**Files:**
- Modify: `src/store/routineStore.ts`
- Modify: `src/store/routineStore.test.ts`

> A "daily override" is a manually pinned routine for a specific date — separate from the routine's schedule. Stored as `{ date → routineId[] }` in MMKV.

- [ ] **Step 1: Write the failing tests**

Append to `src/store/routineStore.test.ts`:

```typescript
describe('dailyOverride', () => {
  it('returns empty array when no overrides for a date', () => {
    expect(routineStore.getDailyOverrideIds('2026-03-12')).toEqual([]);
  });

  it('adds a routine id to a date override', () => {
    routineStore.addDailyOverride('2026-03-15', 'r-override-1');
    expect(routineStore.getDailyOverrideIds('2026-03-15')).toContain('r-override-1');
  });

  it('does not duplicate the same routine on the same date', () => {
    routineStore.addDailyOverride('2026-03-16', 'r-dup');
    routineStore.addDailyOverride('2026-03-16', 'r-dup');
    const ids = routineStore.getDailyOverrideIds('2026-03-16');
    expect(ids.filter(id => id === 'r-dup')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=store/routineStore
```
Expected: FAIL — `getDailyOverrideIds` and `addDailyOverride` not defined

- [ ] **Step 3: Add methods to routineStore**

In `src/store/routineStore.ts`, add before the `export` at the bottom:

```typescript
const DAILY_OVERRIDES_KEY = 'dailyOverrides';

function getDailyOverrideIds(date: string): string[] {
  const raw = appStorage.getString(DAILY_OVERRIDES_KEY);
  if (!raw) return [];
  try {
    const all = JSON.parse(raw) as Record<string, string[]>;
    return all[date] ?? [];
  } catch {
    return [];
  }
}

function addDailyOverride(date: string, routineId: string): void {
  const raw = appStorage.getString(DAILY_OVERRIDES_KEY);
  const all: Record<string, string[]> = raw
    ? (JSON.parse(raw) as Record<string, string[]>)
    : {};
  const existing = all[date] ?? [];
  if (existing.includes(routineId)) return;
  appStorage.set(DAILY_OVERRIDES_KEY, JSON.stringify({ ...all, [date]: [...existing, routineId] }));
}
```

Add `addDailyOverride` and `getDailyOverrideIds` to the `routineStore` export object.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=store/routineStore
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/store/routineStore.ts src/store/routineStore.test.ts
git commit -m "feat: add dailyOverride methods to routineStore"
```

---

### Task 2: Schedule matching utility

> Extracted as a pure function shared by both `useDailyPlan` and `useMonthlyRates` to avoid duplication.

**Files:**
- Create: `src/hooks/domain/today/scheduleUtils.ts`
- Create: `src/hooks/domain/today/scheduleUtils.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/domain/today/scheduleUtils.test.ts`:

```typescript
import { isRoutineScheduledOnDate } from './scheduleUtils';

const weekdayRoutine = {
  id: 'r-1',
  name: 'Study',
  schedule: { days: ['Mon', 'Wed', 'Fri'] as const, type: 'weekdays' as const },
  tags: [],
};

const rangeRoutine = {
  id: 'r-2',
  name: 'Run',
  schedule: { endDate: '2026-12-31', startDate: '2026-01-01', type: 'dateRange' as const },
  tags: [],
};

describe('isRoutineScheduledOnDate', () => {
  it('matches a weekday routine on a matching day (Monday)', () => {
    expect(isRoutineScheduledOnDate(weekdayRoutine, '2026-03-09')).toBe(true); // Monday
  });

  it('does not match a weekday routine on a non-matching day (Tuesday)', () => {
    expect(isRoutineScheduledOnDate(weekdayRoutine, '2026-03-10')).toBe(false); // Tuesday
  });

  it('matches a dateRange routine when within range', () => {
    expect(isRoutineScheduledOnDate(rangeRoutine, '2026-06-15')).toBe(true);
  });

  it('does not match a dateRange routine outside range', () => {
    expect(isRoutineScheduledOnDate(rangeRoutine, '2025-12-31')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/scheduleUtils
```
Expected: FAIL — module not found

- [ ] **Step 3: Create scheduleUtils**

Create `src/hooks/domain/today/scheduleUtils.ts`:

```typescript
import type { Routine } from '@/store/schemas';

type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

const DAY_MAP: Record<number, Weekday> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

export function isRoutineScheduledOnDate(routine: Routine, date: string): boolean {
  const { schedule } = routine;
  if (schedule.type === 'dateRange') {
    return date >= schedule.startDate && date <= schedule.endDate;
  }
  const dayIndex = new Date(date).getDay();
  return (schedule.days as string[]).includes(DAY_MAP[dayIndex]);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/scheduleUtils
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/hooks/domain/today/scheduleUtils.ts src/hooks/domain/today/scheduleUtils.test.ts
git commit -m "feat: add schedule matching utility"
```

---

### Task 3: Local date utility

**Files:**
- Create: `src/hooks/domain/today/dateUtils.ts`
- Create: `src/hooks/domain/today/dateUtils.test.ts`

> `new Date().toISOString()` returns UTC time which gives the wrong date for users in negative UTC offsets. Always use local date construction.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/domain/today/dateUtils.test.ts`:

```typescript
import { toLocalDateString } from './dateUtils';

describe('toLocalDateString', () => {
  it('formats a date as YYYY-MM-DD using local time', () => {
    const date = new Date(2026, 2, 9); // March 9, 2026 local time
    expect(toLocalDateString(date)).toBe('2026-03-09');
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5); // January 5
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/dateUtils
```
Expected: FAIL

- [ ] **Step 3: Create dateUtils**

Create `src/hooks/domain/today/dateUtils.ts`:

```typescript
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/dateUtils
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/hooks/domain/today/dateUtils.ts src/hooks/domain/today/dateUtils.test.ts
git commit -m "feat: add local date string utility"
```

---

### Task 4: useDailyPlan hook

**Files:**
- Create: `src/hooks/domain/today/useDailyPlan.ts`
- Create: `src/hooks/domain/today/useDailyPlan.test.ts`

> **Completion rate formula:** `completed / (total - skipped)`. If all skipped or no routines: rate = 0.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/domain/today/useDailyPlan.test.ts`:

```typescript
// jest.mock must appear before all imports
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    addDailyOverride: jest.fn(),
    getDailyLogs: jest.fn().mockReturnValue([]),
    getDailyOverrideIds: jest.fn().mockReturnValue([]),
    getRoutines: jest.fn().mockReturnValue([]),
    saveDailyLog: jest.fn(),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';

import { useDailyPlan } from './useDailyPlan';

const monday = '2026-03-09';

const weekdayRoutine = {
  id: 'r-weekday',
  name: 'Study English',
  schedule: { days: ['Mon', 'Wed', 'Fri'] as const, type: 'weekdays' as const },
  tags: ['english'],
};

const dateRangeRoutine = {
  id: 'r-range',
  name: 'Morning run',
  schedule: { endDate: '2026-12-31', startDate: '2026-01-01', type: 'dateRange' as const },
  tags: ['health'],
};

describe('useDailyPlan — routines', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty routines when none scheduled', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines).toHaveLength(0);
  });

  it('includes a weekday routine on a matching day', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines.map(r => r.id)).toContain('r-weekday');
  });

  it('excludes a weekday routine on a non-matching day', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan('2026-03-10')); // Tuesday
    expect(result.current.routines.map(r => r.id)).not.toContain('r-weekday');
  });

  it('includes a dateRange routine when date is within range', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([dateRangeRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.routines.map(r => r.id)).toContain('r-range');
  });
});

describe('useDailyPlan — completion rate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calculates completion rate correctly', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine, dateRangeRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'completed' },
      { date: monday, routineId: 'r-range', status: 'pending' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    // 1 completed, 0 skipped, 2 total → 1/2 = 0.5
    expect(result.current.completionRate).toBe(0.5);
  });

  it('excludes skipped routines from denominator', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine, dateRangeRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'completed' },
      { date: monday, routineId: 'r-range', status: 'skipped', skipReason: 'sick' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    // 1 completed, 1 skipped, 2 total → 1/(2-1) = 1.0
    expect(result.current.completionRate).toBe(1);
  });

  it('returns 0 when all routines are skipped', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    (routineStore.getDailyLogs as jest.Mock).mockReturnValue([
      { date: monday, routineId: 'r-weekday', status: 'skipped', skipReason: 'sick' },
    ]);
    const { result } = renderHook(() => useDailyPlan(monday));
    expect(result.current.completionRate).toBe(0);
  });
});

describe('useDailyPlan — mutations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('markComplete calls saveDailyLog with completed status', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    result.current.markComplete('r-weekday');
    expect(routineStore.saveDailyLog).toHaveBeenCalledWith({
      date: monday,
      routineId: 'r-weekday',
      status: 'completed',
    });
  });

  it('markSkipped calls saveDailyLog with skipped status and reason', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([weekdayRoutine]);
    const { result } = renderHook(() => useDailyPlan(monday));
    result.current.markSkipped('r-weekday', 'Sick');
    expect(routineStore.saveDailyLog).toHaveBeenCalledWith({
      date: monday,
      routineId: 'r-weekday',
      skipReason: 'Sick',
      status: 'skipped',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/useDailyPlan
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the hook**

Create `src/hooks/domain/today/useDailyPlan.ts`:

```typescript
import { useCallback, useState } from 'react';

import type { DailyLog, Routine } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

import { isRoutineScheduledOnDate } from './scheduleUtils';

export type DailyPlanRoutine = Routine & { log: DailyLog | null };

type DailyPlan = {
  addDailyOverride: (routineId: string) => void;
  completionRate: number;
  markComplete: (routineId: string) => void;
  markSkipped: (routineId: string, reason: string) => void;
  routines: DailyPlanRoutine[];
};

function calculateCompletionRate(routines: DailyPlanRoutine[]): number {
  if (routines.length === 0) return 0;
  const skipped = routines.filter(r => r.log?.status === 'skipped').length;
  const completed = routines.filter(r => r.log?.status === 'completed').length;
  const denominator = routines.length - skipped;
  if (denominator === 0) return 0;
  return completed / denominator;
}

function useDailyPlan(date: string): DailyPlan {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const allRoutines = routineStore.getRoutines();
  const overrideIds = routineStore.getDailyOverrideIds(date);
  const logs = routineStore.getDailyLogs(date);

  const scheduled = allRoutines.filter(r => isRoutineScheduledOnDate(r, date));
  const overrides = allRoutines.filter(
    r => overrideIds.includes(r.id) && !scheduled.some(s => s.id === r.id),
  );

  const routines: DailyPlanRoutine[] = [...scheduled, ...overrides].map(r => ({
    ...r,
    log: logs.find(l => l.routineId === r.id) ?? null,
  }));

  const completionRate = calculateCompletionRate(routines);

  const markComplete = useCallback((routineId: string) => {
    routineStore.saveDailyLog({ date, routineId, status: 'completed' });
    refresh();
  }, [date, refresh]);

  const markSkipped = useCallback((routineId: string, reason: string) => {
    routineStore.saveDailyLog({ date, routineId, skipReason: reason, status: 'skipped' });
    refresh();
  }, [date, refresh]);

  const addDailyOverride = useCallback((routineId: string) => {
    routineStore.addDailyOverride(date, routineId);
    refresh();
  }, [date, refresh]);

  return { addDailyOverride, completionRate, markComplete, markSkipped, routines };
}

export { useDailyPlan };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/useDailyPlan
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/hooks/domain/today/useDailyPlan.ts src/hooks/domain/today/useDailyPlan.test.ts
git commit -m "feat: add useDailyPlan hook"
```

---

### Task 5: useMonthlyRates hook

**Files:**
- Create: `src/hooks/domain/today/useMonthlyRates.ts`
- Create: `src/hooks/domain/today/useMonthlyRates.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/domain/today/useMonthlyRates.test.ts`:

```typescript
// jest.mock must appear before all imports
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    getDailyLogs: jest.fn().mockReturnValue([]),
    getDailyOverrideIds: jest.fn().mockReturnValue([]),
    getRoutines: jest.fn().mockReturnValue([]),
  },
}));

import { renderHook } from '@testing-library/react-native';

import { routineStore } from '@/store/routineStore';

import { useMonthlyRates } from './useMonthlyRates';

describe('useMonthlyRates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a rate for every day of the month', () => {
    const { result } = renderHook(() => useMonthlyRates(2026, 2)); // March 2026 (month=2)
    const keys = Object.keys(result.current);
    expect(keys).toHaveLength(31);
    expect(keys[0]).toBe('2026-03-01');
    expect(keys[30]).toBe('2026-03-31');
  });

  it('returns 0 for all days when no routines', () => {
    (routineStore.getRoutines as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useMonthlyRates(2026, 2));
    Object.values(result.current).forEach(rate => expect(rate).toBe(0));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/useMonthlyRates
```
Expected: FAIL

- [ ] **Step 3: Create the hook**

Create `src/hooks/domain/today/useMonthlyRates.ts`:

```typescript
import type { DailyLog } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

import { isRoutineScheduledOnDate } from './scheduleUtils';

function calcRate(routineIds: string[], logs: DailyLog[]): number {
  if (routineIds.length === 0) return 0;
  const relevant = logs.filter(l => routineIds.includes(l.routineId));
  const skipped = relevant.filter(l => l.status === 'skipped').length;
  const completed = relevant.filter(l => l.status === 'completed').length;
  const denominator = routineIds.length - skipped;
  if (denominator === 0) return 0;
  return completed / denominator;
}

// month is 0-indexed (0=Jan, 2=Mar)
function useMonthlyRates(year: number, month: number): Record<string, number> {
  const allRoutines = routineStore.getRoutines();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rates: Record<string, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const scheduled = allRoutines.filter(r => isRoutineScheduledOnDate(r, date));
    const overrideIds = routineStore.getDailyOverrideIds(date);
    const overrides = allRoutines.filter(
      r => overrideIds.includes(r.id) && !scheduled.some(s => s.id === r.id),
    );
    const allIds = [...scheduled, ...overrides].map(r => r.id);
    const logs = routineStore.getDailyLogs(date);
    rates[date] = calcRate(allIds, logs);
  }

  return rates;
}

export { useMonthlyRates };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=domain/today/useMonthlyRates
```
Expected: PASS

- [ ] **Step 5: Export from domain index**

Replace `src/hooks/domain/index.ts`:

```typescript
export * from './onboarding/useOnboardingStatus';
export * from './today/useDailyPlan';
export * from './today/useMonthlyRates';
export { useUser } from './user/useUser';
```

- [ ] **Step 6: Commit**

```bash
cd MyApp && git add src/hooks/domain/today/useMonthlyRates.ts src/hooks/domain/today/useMonthlyRates.test.ts src/hooks/domain/index.ts
git commit -m "feat: add useMonthlyRates hook for calendar heatmap"
```

---

## Chunk 2: Calendar Component

### Task 6: MonthlyCalendar component

**Files:**
- Create: `src/screens/Today/components/MonthlyCalendar.tsx`

> **Heatmap color scale** (uses purple family tokens — no grays):
> - 0%: `colors.gray50` (empty)
> - 1–33%: `colors.purple100` (light purple)
> - 34–66%: `colors.purple100` (medium — approximate, no intermediate token)
> - 67–99%: `colors.purple500` at reduced visual weight — use border highlight
> - 100%: `colors.purple500` (full)
>
> In practice with the available tokens: 0 → gray50, >0 and <1 → purple100, =1 → purple500.
> The border on the selected date uses `colors.purple500`.

- [ ] **Step 1: Create MonthlyCalendar**

Create `src/screens/Today/components/MonthlyCalendar.tsx`:

```typescript
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  month: number; // 0-indexed
  monthRates: Record<string, number>;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  year: number;
};

function MonthlyCalendar({ month, monthRates, onSelectDate, selectedDate, year }: Props) {
  const { colors, fonts, gutters, layout } = useTheme();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthLabel = new Date(year, month, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_12]}>
        {monthLabel}
      </Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[layout.row, gutters.marginBottom_8]}>
          {row.map((day, colIndex) => {
            if (!day) {
              return <View key={colIndex} style={{ flex: 1, height: 32 }} />;
            }
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rate = monthRates[date] ?? 0;
            const bgColor = rate === 0 ? colors.gray50 : rate < 1 ? colors.purple100 : colors.purple500;
            const isSelected = date === selectedDate;

            return (
              <TouchableOpacity
                key={colIndex}
                onPress={() => onSelectDate(date)}
                style={[
                  layout.justifyCenter,
                  layout.itemsCenter,
                  {
                    backgroundColor: bgColor,
                    borderColor: isSelected ? colors.purple500 : 'transparent',
                    borderRadius: 6,
                    borderWidth: 2,
                    flex: 1,
                    height: 32,
                    marginHorizontal: 2,
                  },
                ]}
                testID={`calendar-day-${date}`}
              >
                <Text style={[fonts.size_12, rate === 1 ? fonts.gray50 : fonts.gray800]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default MonthlyCalendar;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Today/components/MonthlyCalendar.tsx
git commit -m "feat: add MonthlyCalendar component with completion heatmap"
```

---

## Chunk 3: Routine List Components

### Task 7: SkipReasonSheet component

**Files:**
- Create: `src/screens/Today/components/SkipReasonSheet.tsx`

- [ ] **Step 1: Create SkipReasonSheet**

Create `src/screens/Today/components/SkipReasonSheet.tsx`:

```typescript
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  onClose: () => void;
  onSelect: (reason: string) => void;
  visible: boolean;
};

const SKIP_REASONS = ['Sick', 'Traveling', 'Busy day', 'Rest day', 'Other'];

function SkipReasonSheet({ onClose, onSelect, visible }: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, layout.justifyEnd]}>
        <TouchableOpacity onPress={onClose} style={layout.flex_1} />
        <View style={[backgrounds.gray50, gutters.paddingHorizontal_24, gutters.paddingVertical_24]}>
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
            Why are you skipping?
          </Text>
          {SKIP_REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              onPress={() => onSelect(reason)}
              style={gutters.paddingVertical_12}
              testID={`skip-reason-${reason.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Text style={[fonts.size_16, fonts.gray800]}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default SkipReasonSheet;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Today/components/SkipReasonSheet.tsx
git commit -m "feat: add SkipReasonSheet component"
```

---

### Task 8: RoutineItem component

**Files:**
- Create: `src/screens/Today/components/RoutineItem.tsx`

- [ ] **Step 1: Create RoutineItem**

Create `src/screens/Today/components/RoutineItem.tsx`:

```typescript
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { DailyPlanRoutine } from '@/hooks/domain/today/useDailyPlan';

import SkipReasonSheet from './SkipReasonSheet';

type Props = {
  onComplete: (routineId: string) => void;
  onSkip: (routineId: string, reason: string) => void;
  routine: DailyPlanRoutine;
};

function RoutineItem({ onComplete, onSkip, routine }: Props) {
  const { colors, fonts, gutters, layout } = useTheme();
  const [skipSheetVisible, setSkipSheetVisible] = useState(false);

  const isCompleted = routine.log?.status === 'completed';
  const isSkipped = routine.log?.status === 'skipped';
  const isDone = isCompleted || isSkipped;

  return (
    <>
      <View
        style={[layout.row, layout.itemsCenter, layout.justifyBetween, gutters.paddingVertical_12]}
        testID={`routine-item-${routine.id}`}
      >
        <TouchableOpacity
          disabled={isDone}
          onPress={() => onComplete(routine.id)}
          style={[layout.row, layout.itemsCenter, layout.flex_1]}
          testID={`routine-check-${routine.id}`}
        >
          <View
            style={{
              backgroundColor: isCompleted ? colors.purple500 : 'transparent',
              borderColor: isCompleted ? colors.purple500 : colors.gray200,
              borderRadius: 4,
              borderWidth: 2,
              height: 20,
              marginRight: 12,
              width: 20,
            }}
          />
          <Text
            style={[
              fonts.size_16,
              isCompleted || isSkipped ? fonts.gray200 : fonts.gray800,
            ]}
          >
            {routine.name}
            {isSkipped ? ` (skipped: ${routine.log?.skipReason ?? ''})` : ''}
          </Text>
        </TouchableOpacity>

        {!isDone && (
          <TouchableOpacity
            onPress={() => setSkipSheetVisible(true)}
            testID={`routine-skip-${routine.id}`}
          >
            <Text style={[fonts.size_14, fonts.gray200]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <SkipReasonSheet
        onClose={() => setSkipSheetVisible(false)}
        onSelect={reason => {
          setSkipSheetVisible(false);
          onSkip(routine.id, reason);
        }}
        visible={skipSheetVisible}
      />
    </>
  );
}

export default RoutineItem;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Today/components/RoutineItem.tsx
git commit -m "feat: add RoutineItem with completion checkbox and skip"
```

---

### Task 9: AddRoutineSheet component

**Files:**
- Create: `src/screens/Today/components/AddRoutineSheet.tsx`

> State is reset on every close (both success and dismiss) so the sheet always opens fresh.
> `onAdd` is the sole signal to close — `AddRoutineSheet` calls `onClose` internally, so `DailyRoutineList` only passes `onAdd` and `onClose` without duplicating the close call.

- [ ] **Step 1: Create AddRoutineSheet**

Create `src/screens/Today/components/AddRoutineSheet.tsx`:

```typescript
import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { Routine } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

type Props = {
  date: string;
  onAdd: (routineId: string) => void;
  onClose: () => void;
  visible: boolean;
};

function AddRoutineSheet({ date, onAdd, onClose, visible }: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const routines = routineStore.getRoutines();

  const resetAndClose = () => {
    setNewName('');
    setShowCreate(false);
    onClose();
  };

  const handlePickExisting = (routine: Routine) => {
    onAdd(routine.id);
    resetAndClose();
  };

  const handleCreateNew = () => {
    if (!newName.trim()) return;
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      name: newName.trim(),
      schedule: { endDate: date, startDate: date, type: 'dateRange' },
      tags: [],
    };
    routineStore.saveRoutine(routine);
    onAdd(routine.id);
    resetAndClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={resetAndClose} transparent visible={visible}>
      <View style={[layout.flex_1, layout.justifyEnd]}>
        <TouchableOpacity onPress={resetAndClose} style={layout.flex_1} />
        <View style={[backgrounds.gray50, gutters.paddingHorizontal_24, gutters.paddingVertical_24]}>
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
            Add a routine
          </Text>

          {!showCreate ? (
            <>
              <ScrollView style={{ maxHeight: 300 }}>
                {routines.length === 0 && (
                  <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_16]}>
                    No routines in your library yet.
                  </Text>
                )}
                {routines.map(routine => (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => handlePickExisting(routine)}
                    style={gutters.paddingVertical_12}
                    testID={`library-routine-${routine.id}`}
                  >
                    <Text style={[fonts.size_16, fonts.gray800]}>{routine.name}</Text>
                    <Text style={[fonts.size_12, fonts.gray200]}>{routine.tags.join(', ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={gutters.paddingVertical_12}
                testID="create-new-routine-button"
              >
                <Text style={[fonts.size_14, fonts.purple500]}>+ Create new routine</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <TextInput
                autoFocus
                onChangeText={setNewName}
                placeholder="Routine name..."
                returnKeyType="done"
                style={[fonts.size_16, fonts.gray800, gutters.paddingVertical_12, gutters.marginBottom_16]}
                testID="new-routine-name-input"
                value={newName}
              />
              <TouchableOpacity onPress={handleCreateNew} testID="save-new-routine-button">
                <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default AddRoutineSheet;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Today/components/AddRoutineSheet.tsx
git commit -m "feat: add AddRoutineSheet (library contextual sheet)"
```

---

### Task 10: DailyRoutineList component

**Files:**
- Create: `src/screens/Today/components/DailyRoutineList.tsx`

- [ ] **Step 1: Create DailyRoutineList**

Create `src/screens/Today/components/DailyRoutineList.tsx`:

```typescript
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { DailyPlanRoutine } from '@/hooks/domain/today/useDailyPlan';

import AddRoutineSheet from './AddRoutineSheet';
import RoutineItem from './RoutineItem';

const MAX_DAILY_ROUTINES = 10;

type Props = {
  date: string;
  onAddRoutine: (routineId: string) => void;
  onComplete: (routineId: string) => void;
  onSkip: (routineId: string, reason: string) => void;
  routines: DailyPlanRoutine[];
};

function DailyRoutineList({ date, onAddRoutine, onComplete, onSkip, routines }: Props) {
  const { fonts, gutters } = useTheme();
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  const canAddMore = routines.length < MAX_DAILY_ROUTINES;
  const formattedDate = new Date(date).toLocaleDateString('default', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_8]}>{formattedDate}</Text>

      {routines.length === 0 && (
        <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_16]}>
          No routines for this day yet.
        </Text>
      )}

      {routines.map(routine => (
        <RoutineItem
          key={routine.id}
          onComplete={onComplete}
          onSkip={onSkip}
          routine={routine}
        />
      ))}

      {canAddMore && (
        <TouchableOpacity
          onPress={() => setAddSheetVisible(true)}
          style={gutters.paddingVertical_12}
          testID="add-routine-button"
        >
          <Text style={[fonts.size_14, fonts.gray400]}>+ Add routine</Text>
        </TouchableOpacity>
      )}

      <AddRoutineSheet
        date={date}
        onAdd={onAddRoutine}
        onClose={() => setAddSheetVisible(false)}
        visible={addSheetVisible}
      />
    </View>
  );
}

export default DailyRoutineList;
```

- [ ] **Step 2: Commit**

```bash
cd MyApp && git add src/screens/Today/components/DailyRoutineList.tsx
git commit -m "feat: add DailyRoutineList component"
```

---

## Chunk 4: Today Screen

### Task 11: Today screen

**Files:**
- Modify: `src/screens/Today/Today.tsx`
- Create: `src/screens/Today/Today.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/screens/Today/Today.test.tsx`:

```typescript
// jest.mock must appear before all imports
jest.mock('@/store/routineStore', () => ({
  routineStore: {
    addDailyOverride: jest.fn(),
    getDailyLogs: jest.fn().mockReturnValue([]),
    getDailyOverrideIds: jest.fn().mockReturnValue([]),
    getRoutines: jest.fn().mockReturnValue([]),
    saveDailyLog: jest.fn(),
  },
}));

import { render, screen } from '@testing-library/react-native';

import TestAppWrapper from '@/tests/TestAppWrapper';

import Today from './Today';

function renderToday() {
  return render(
    <TestAppWrapper>
      <Today />
    </TestAppWrapper>,
  );
}

describe('Today', () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders today's date cell in the calendar", () => {
    renderToday();
    const today = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    expect(screen.getByTestId(`calendar-day-${today}`)).toBeTruthy();
  });

  it('renders add routine button when no routines', () => {
    renderToday();
    expect(screen.getByTestId('add-routine-button')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd MyApp && yarn test --testPathPattern=Today/Today
```
Expected: FAIL

- [ ] **Step 3: Implement Today screen**

Replace `src/screens/Today/Today.tsx`:

```typescript
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { useDailyPlan } from '@/hooks/domain/today/useDailyPlan';
import { useMonthlyRates } from '@/hooks/domain/today/useMonthlyRates';
import { toLocalDateString } from '@/hooks/domain/today/dateUtils';

import { SafeScreen } from '@/components/templates';

import DailyRoutineList from './components/DailyRoutineList';
import MonthlyCalendar from './components/MonthlyCalendar';

function Today() {
  const { fonts, gutters, layout } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const monthRates = useMonthlyRates(calYear, calMonth);
  const { addDailyOverride, markComplete, markSkipped, routines } = useDailyPlan(selectedDate);

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else { setCalMonth(m => m - 1); }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else { setCalMonth(m => m + 1); }
  };

  return (
    <SafeScreen>
      <ScrollView>
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.paddingHorizontal_16,
            gutters.paddingVertical_16,
            gutters.marginBottom_8,
          ]}
        >
          <TouchableOpacity onPress={handlePrevMonth} testID="prev-month-button">
            <Text style={[fonts.size_16, fonts.gray800]}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} testID="next-month-button">
            <Text style={[fonts.size_16, fonts.gray800]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <MonthlyCalendar
          month={calMonth}
          monthRates={monthRates}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
          year={calYear}
        />

        <View style={gutters.paddingVertical_16} />

        <DailyRoutineList
          date={selectedDate}
          onAddRoutine={addDailyOverride}
          onComplete={markComplete}
          onSkip={markSkipped}
          routines={routines}
        />
      </ScrollView>
    </SafeScreen>
  );
}

export default Today;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd MyApp && yarn test --testPathPattern=Today/Today
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd MyApp && git add src/screens/Today/
git commit -m "feat: implement Today screen with calendar heatmap and daily routines"
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

- [ ] **Smoke test:**
  1. Open Today tab → monthly calendar renders, today's date selected
  2. Tap a different date → routine list updates for that date
  3. Tap `< >` → calendar navigates to prev/next month
  4. Tap "+ Add routine" → library sheet opens
  5. Tap "+ Create new routine" → name input appears
  6. Type a name and save → routine appears in the list
  7. Tap checkbox → routine marked complete, cell darkens
  8. Tap "Skip" → reason sheet opens, select reason → routine marked skipped

---

## What This Plan Delivers

| Deliverable | Location |
|-------------|---------|
| Daily override store methods | `src/store/routineStore.ts` |
| Schedule matching utility | `src/hooks/domain/today/scheduleUtils.ts` |
| Local date utility | `src/hooks/domain/today/dateUtils.ts` |
| useDailyPlan hook | `src/hooks/domain/today/useDailyPlan.ts` |
| useMonthlyRates hook | `src/hooks/domain/today/useMonthlyRates.ts` |
| MonthlyCalendar component | `src/screens/Today/components/MonthlyCalendar.tsx` |
| SkipReasonSheet + RoutineItem | `src/screens/Today/components/` |
| AddRoutineSheet (Library) | `src/screens/Today/components/AddRoutineSheet.tsx` |
| DailyRoutineList | `src/screens/Today/components/DailyRoutineList.tsx` |
| Today screen | `src/screens/Today/Today.tsx` |

**Next plan:** Plan 4 — Goals Tab (goal list, steps management, future self narratives, per-goal stats)
