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
