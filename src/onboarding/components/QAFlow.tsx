import type { QARound } from '@/onboarding/data/qaTree';

import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  readonly onComplete: (answers: string[], keywords: string[]) => void;
  readonly rounds: QARound[];
};

function QAFlow({ onComplete, rounds }: Props) {
  const { fonts, gutters } = useTheme();
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const round = rounds[currentRound];

  const handleSelect = (label: string, keyword: string, terminal?: boolean) => {
    const newAnswers = [...selectedAnswers, label];
    const newKeywords = [...selectedKeywords, keyword];

    const isLastRound = currentRound >= rounds.length - 1;

    if (terminal || isLastRound) {
      onComplete(newAnswers, newKeywords);
    } else {
      setSelectedAnswers(newAnswers);
      setSelectedKeywords(newKeywords);
      setCurrentRound(previous => previous + 1);
    }
  };

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
        {round.question}
      </Text>
      {round.options.map(option => (
        <TouchableOpacity
          key={option.keyword}
          onPress={() => { handleSelect(option.label, option.keyword, option.terminal); }}
          style={[gutters.marginBottom_12, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
          testID={`qa-option-${option.keyword}`}
        >
          <Text style={[fonts.size_16, fonts.gray800]}>{option.label}</Text>
        </TouchableOpacity>
      ))}
      <Text style={[fonts.size_12, fonts.gray200, gutters.marginTop_12]}>
        Step {currentRound + 1} of {rounds.length}
      </Text>
    </View>
  );
}

export default QAFlow;
