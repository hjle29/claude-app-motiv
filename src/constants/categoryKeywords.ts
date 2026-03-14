export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Career:  ['work', 'job', 'career', 'business', 'skill', 'promotion', 'project'],
  Family:  ['family', 'parents', 'kids', 'children', 'home', 'siblings', 'parent'],
  Health:  ['health', 'gym', 'run', 'sleep', 'eat', 'workout', 'fitness', 'diet', 'exercise'],
  Money:   ['money', 'save', 'budget', 'salary', 'invest', 'finance', 'retire', 'income', 'financial', 'wealth'],
  Travel:  ['travel', 'trip', 'vacation', 'explore', 'abroad', 'journey', 'visit'],
};

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  let best = 'Others';
  let bestCount = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const count = keywords.filter(kw => lower.includes(kw)).length;
    if (count > bestCount) {
      bestCount = count;
      best = category;
    }
  }
  return best;
}
