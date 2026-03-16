// src/services/suggestions.ts

import { instance } from './instance';

import { SUB_AREA_L1_FALLBACKS } from '@/constants/goalWizard';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can',
  'do', 'does', 'for', 'get', 'has', 'have', 'i', 'in', 'is', 'it', 'me',
  'more', 'my', 'not', 'of', 'on', 'or', 'our', 'some', 'that', 'the',
  'this', 'to', 'want', 'we', 'will', 'with',
]);

function extractKeywordsLocally(statement: string): string[] {
  return [...new Set(
    statement
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w)),
  )].slice(0, 5);
}

export async function generateKeywords(statement: string): Promise<string[]> {
  try {
    const response = await instance
      .post('ai/keywords', { json: { statement }, timeout: 5000 })
      .json<{ keywords: string[] }>();
    if (Array.isArray(response.keywords) && response.keywords.length > 0) {
      return response.keywords;
    }
    return extractKeywordsLocally(statement);
  } catch {
    return extractKeywordsLocally(statement);
  }
}

// POST ai/sub-areas  { lifeArea } → { subAreas: string[] }
export async function generateSubAreas(lifeArea: string): Promise<string[]> {
  try {
    const response = await instance
      .post('ai/sub-areas', { json: { lifeArea }, timeout: 5000 })
      .json<{ subAreas: string[] }>();
    if (Array.isArray(response.subAreas) && response.subAreas.length > 0) {
      return response.subAreas.slice(0, 5);
    }
    return SUB_AREA_L1_FALLBACKS[lifeArea] ?? [];
  } catch {
    return SUB_AREA_L1_FALLBACKS[lifeArea] ?? [];
  }
}

// POST ai/narrower-sub-areas  { lifeArea, subArea } → { subAreas: string[] }
export async function generateNarrowerSubAreas(
  lifeArea: string,
  subArea: string,
): Promise<string[]> {
  try {
    const response = await instance
      .post('ai/narrower-sub-areas', { json: { lifeArea, subArea }, timeout: 5000 })
      .json<{ subAreas: string[] }>();
    if (Array.isArray(response.subAreas) && response.subAreas.length > 0) {
      return response.subAreas.slice(0, 5);
    }
    return [];
  } catch {
    return [];
  }
}

// POST ai/goal-question  { lifeArea, subArea1, subArea2, questionNumber, previousAnswers }
//   → { question: string; options: string[] }
export async function generateGoalQuestion(context: {
  lifeArea: string;
  subArea1: string;
  subArea2: string;
  questionNumber: 1 | 2 | 3;
  previousAnswers: string[];
}): Promise<{ question: string; options: string[] }> {
  try {
    const response = await instance
      .post('ai/goal-question', { json: context, timeout: 5000 })
      .json<{ question: string; options: string[] }>();
    if (response.question && Array.isArray(response.options)) {
      return { options: response.options.slice(0, 4), question: response.question };
    }
    return { options: [], question: '' };
  } catch {
    return { options: [], question: '' };
  }
}

// POST ai/synthesize-goal  { lifeArea, subArea1, subArea2, answers } → { statement: string }
export async function synthesizeGoalStatement(context: {
  lifeArea: string;
  subArea1: string;
  subArea2: string;
  answers: string[];
}): Promise<string> {
  try {
    const response = await instance
      .post('ai/synthesize-goal', { json: context, timeout: 8000 })
      .json<{ statement: string }>();
    return response.statement ?? '';
  } catch {
    return '';
  }
}
