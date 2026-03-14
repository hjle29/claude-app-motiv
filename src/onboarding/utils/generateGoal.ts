const templates: Record<string, (answers: string[]) => string> = {
  // New categories
  'Career & Work': (answers: string[]) => {
    const ambition = answers[0] || 'Advance my career';
    const method = answers[1] || 'skill development';
    return answers.length >= 3
      ? `${ambition} by focusing on ${method.toLowerCase()} — ${answers[2]?.toLowerCase()}.`
      : `${ambition} through ${method.toLowerCase()}.`;
  },
  'Creativity & Hobbies': (answers: string[]) => {
    const area = answers[0] || 'a creative pursuit';
    const goal = answers[1] || 'express myself creatively';
    return `Pursue ${area.toLowerCase()} and ${goal.toLowerCase()}.`;
  },
  'Education & Learning': (answers: string[]) => {
    const subject = answers[0] || 'something new';
    const reason = answers[1] || 'grow as a person';
    return `Learn ${subject.toLowerCase()} — ${reason.toLowerCase()}.`;
  },
  Finance: (answers: string[]) => {
    const priority = answers[0] || 'Achieve financial security';
    const goal = answers[1] || 'grow my savings';
    return answers.length >= 3
      ? `${priority} — ${goal.toLowerCase()} by ${answers[2]?.toLowerCase()}.`
      : `${priority} — ${goal.toLowerCase()}.`;
  },
  'Health & Fitness': (answers: string[]) => {
    const focus = answers[0] || 'better health';
    const goal = answers[1] || focus;
    return answers.length >= 3
      ? `Achieve ${goal.toLowerCase()} through consistent effort — ${answers[2]?.toLowerCase()}.`
      : `Achieve ${goal.toLowerCase()} through consistent effort.`;
  },
  'Mental Wellness': (answers: string[]) => {
    const focus = answers[0] || 'mental wellbeing';
    const method = answers[1] || 'mindful daily practices';
    return `Prioritize ${focus.toLowerCase()} through ${method.toLowerCase()}.`;
  },
  'Personal Growth': (answers: string[]) => {
    const meaning = answers[0] || 'become a better version of myself';
    const habit = answers[1] || 'building positive habits';
    return `${meaning} by ${habit.toLowerCase()}.`;
  },
  Relationships: (answers: string[]) => {
    const focus = answers[0] || 'Build meaningful relationships';
    const improvement = answers[1] || 'investing more time and care';
    return `${focus} through ${improvement.toLowerCase()}.`;
  },
  'Social Impact': (answers: string[]) => {
    const cause = answers[0] || 'make a difference';
    const action = answers[1] || 'taking consistent action';
    return `Contribute to ${cause.toLowerCase()} by ${action.toLowerCase()}.`;
  },
  'Travel & Adventure': (answers: string[]) => {
    const dream = answers[0] || 'See the world';
    const destination = answers[1] || 'new places';
    return answers.length >= 3
      ? `${dream} — explore ${destination.toLowerCase()} ${answers[2]?.toLowerCase()}.`
      : `${dream} — explore ${destination.toLowerCase()}.`;
  },

  // Legacy categories (backward compat for stored goals)
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
