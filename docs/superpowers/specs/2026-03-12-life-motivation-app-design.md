# Life Motivation App — Design Spec
_Date: 2026-03-12_

## Overview

A React Native mobile app that helps users define their dream life, break it into actionable steps and daily routines, and stay motivated through consistent small progress. The philosophy: celebrate what you did, never punish what you didn't.

---

## Core Philosophy

- Motivation comes from **visible small progress**, not distant end goals
- **No streak mechanics** — skipping a day is not a failure
- Users can **skip routines with a reason** (sick, traveling, busy) — skips don't count as failures
- Onboarding is lightweight — only 1 life goal is mandatory to get started

---

## Architecture

**Approach**: Linear onboarding wizard → tab-based main app

**3 Main Tabs**: Today | Goals | Discover

**Library**: Contextual sheet/modal — accessible when adding routines to a day or a step, not a standalone tab

---

## 1. Onboarding Flow

### Step 1: Life Goal Setup

- Input box for free-text goal entry
- Suggestion buttons below input: `Family` `Health` `Money` `Career` `Travel` `Others`
- Tapping a category → **3-round multiple choice Q&A flow** to narrow down and define the goal
  - Each round offers multiple choice options that progressively narrow (e.g., Family → `Children` `Marriage` `Parents` `Others`)
  - After 3 rounds, app generates a goal statement from the choices
- Tapping `Others` or the input directly → free text entry
- **Minimum 1 goal, maximum 3**
- Each goal is auto-tagged with **keywords** derived from category + Q&A answers

### Step 2: Future Self Visualization (Optional)

- User picks which goal(s) to write a future self vision for
- Same 3-round Q&A flow, framed as *"What does your life look like in 5/10 years?"*
- App generates a **first-person narrative** written as the future self speaking to the present self
  - e.g., *"I'm 38, living in Vancouver, working as a senior engineer, married with one kid..."*
- Done separately for **5-year** and **10-year** views

### Step 3: Steps & Routines (Optional)

- For each goal, user can define **steps** (milestones toward the goal), each with:
  - Description
  - Target deadline
  - Keywords (inherited from parent goal)
- For each step, user can define **daily routines**
- Steps and routines are optional during onboarding — can be added later
- **Max 10 routines per day** across all steps

---

## 2. Main App — 3 Tabs

### Today Tab

- **Monthly calendar** at the top
  - Each date cell is **color-coded by daily completion %** (light → dark as % increases)
  - This serves as both the heatmap and the daily gauge — no separate gauge widget
- Tapping a date shows that day's routine list below
- **Routine list** for selected date:
  - Auto-populated from scheduled routines (date range or weekday schedule)
  - User can manually pick from their library for that day
  - User can add a brand new routine on the fly
  - Each routine has a checkbox to mark complete
  - Each routine can be **skipped with a reason** (sick / traveling / busy day / other)
- **Max 10 routines per day**

### Goals Tab

- List of life goals with keywords
- Tap a goal to expand:
  - Future self narrative (5-year and 10-year)
  - List of steps under the goal
    - Each step: description, deadline, done/not done toggle
    - Routines linked to that step
- Add / edit / archive goals, steps from here

### Goals Tab — Progress & Stats

- Per-goal stats visible inside each goal: steps completed, history
- Monthly progress already visible via Today tab calendar

### Routine Library (Contextual Sheet)

- Accessible via "Add routine" button in Today tab or inside a step in Goals tab
- Personal pool of all user routines, each with:
  - **Name**
  - **Schedule**: date range (start → end date) OR specific weekdays (e.g., Mon/Wed/Fri)
  - **Tags**: user-defined keywords
- **Pre-curated routine catalog** organized by keywords — users can browse by category and add to their library
- User can also create a new routine on the fly from this sheet

---

## 3. Discover Tab

- Content feed personalized by **goal keywords**
- Content types:
  - Real news articles related to goal keywords
  - Job postings (for career-related goals)
  - Short motivational tips/insights (Type A lessons)
  - Structured mini-lessons — short articles or exercises (Type B lessons)
- **Fallback**: when no external content is found for keywords, show lessons
- Content is always available — no empty screen

---

## 4. Notifications

Motivational and contextual — never punishing:

- *"2 more routines to finish today!"* — daily completion nudge
- *"You completed a step toward [Goal]!"* — step milestone celebration
- *"You've been consistent 5 days this week!"* — consistency encouragement
- *"New article related to your [Goal]"* — content discovery nudge

No streak-based notifications. Missing a day triggers no negative notification.

---

## 5. Data Model (Conceptual)

```
User
├── Goals (1–3)
│   ├── keywords: string[]
│   ├── FutureSelf (5yr, 10yr) — optional
│   └── Steps (optional)
│       ├── deadline: Date
│       ├── keywords: string[]
│       ├── isDone: boolean
│       └── linked routines: RoutineId[]
│
└── RoutineLibrary
    └── Routines
        ├── name: string
        ├── tags: string[]
        ├── schedule: DateRange | Weekdays[]
        └── dailyLogs[]
            ├── date: Date
            ├── status: completed | skipped | pending
            └── skipReason?: string

DailyPlan (per date)
├── routines: Routine[] (max 10)
└── completionRate: number (completed / total, skipped excluded)

CuratedRoutineCatalog
└── routines organized by keyword/category
```

---

## 6. Key Constraints & Rules

| Rule | Detail |
|------|--------|
| Min life goals | 1 |
| Max life goals | 3 |
| Max routines per day | 10 |
| Steps mandatory | No |
| Daily routines mandatory | No |
| Streak mechanic | None |
| Skip handling | Skipped routines excluded from daily % calculation |
| Progress gauge | Calendar cell color only (no separate widget) |
| Content fallback | Always show lessons if no external content |

---

## 7. Screens Summary

| Screen | Purpose |
|--------|---------|
| Onboarding — Goal Setup | Define 1–3 life goals via Q&A or free text |
| Onboarding — Future Self | Write 5yr/10yr future self narrative |
| Onboarding — Steps/Routines | Optionally add steps and routines |
| Today | Daily routine list + calendar heatmap |
| Goals | View/edit goals, future self, steps + per-goal stats |
| Discover | Personalized content feed + lessons |
| Library Sheet (contextual) | Add/browse routines from Today or Goals tab |
