const templates: Record<string, (answers: string[]) => string> = {
  Career: (answers: string[]) => {
    const ambition = answers[0] || 'Advance my career';
    const method = answers[1] || 'skill development';
    const timeline = answers[2] || 'within a few years';
    return `${ambition} by focusing on ${method.toLowerCase()} — ${timeline.toLowerCase()}.`;
  },
  Family: (answers: string[]) => {
    const focus = answers[0] || 'Build a happy family';
    const detail = answers[1] || 'creating a loving home';
    const timeline = answers[2] || '';
    return `${focus} — ${detail.toLowerCase()} ${timeline.toLowerCase()}.`.trim();
  },
  Health: (answers: string[]) => {
    const focus = answers[0] || 'better health';
    const goal = answers[1] || focus;
    const timeline = answers[2] || 'as a long-term lifestyle';
    return `Achieve ${goal.toLowerCase()} through consistent effort — ${timeline.toLowerCase()}.`;
  },
  Money: (answers: string[]) => {
    const priority = answers[0] || 'Achieve financial security';
    const goal = answers[1] || 'grow my savings';
    const target = answers[2] || 'a meaningful amount';
    return `${priority} — ${goal.toLowerCase()} with a target of ${target.toLowerCase()}.`;
  },
  Travel: (answers: string[]) => {
    const dream = answers[0] || 'See the world';
    const destination = answers[1] || 'new places';
    const timeline = answers[2] || 'whenever I can';
    return `${dream} — explore ${destination.toLowerCase()} ${timeline.toLowerCase()}.`;
  },
};

export function extractKeywords(category: string, answerKeywords: string[]): string[] {
  const all = [category.toLowerCase(), ...answerKeywords.map(k => k.toLowerCase())];
  return [...new Set(all)];
}

export function generateGoalStatement(category: string, answers: string[]): string {
  const template = (templates as Record<string, ((a: string[]) => string) | undefined>)[category];
  return template ? template(answers) : answers.filter(Boolean).join(', ');
}
