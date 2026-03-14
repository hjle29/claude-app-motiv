import { instance } from './instance';

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

function reformatIntentLocally(intent: string): string[] {
  const trimmed = intent.trim();
  const upper = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const lower = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  return [
    upper,
    `Take consistent steps every day to achieve ${lower}`,
    `In 5 years I will look back, proud I achieved ${lower}`,
  ];
}

export async function generateGoalStatements(intent: string): Promise<string[]> {
  try {
    const response = await instance
      .post('ai/goal-statements', { json: { intent }, timeout: 5000 })
      .json<{ statements: string[] }>();
    if (Array.isArray(response.statements) && response.statements.length > 0) {
      return response.statements.slice(0, 3);
    }
    return reformatIntentLocally(intent);
  } catch {
    return reformatIntentLocally(intent);
  }
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
