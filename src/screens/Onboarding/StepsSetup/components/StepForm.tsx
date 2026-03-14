import type { Step } from '@/store/schemas';

import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  readonly goalId: string;
  readonly goalKeywords: string[];
  readonly onAdd: (step: Step) => void;
};

function StepForm({ goalId, goalKeywords, onAdd }: Props) {
  const { fonts, gutters } = useTheme();
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = () => {
    if (!description.trim()) return;
    const DAYS_IN_YEAR = 365;
    const HOURS_IN_DAY = 24;
    const MINUTES_IN_HOUR = 60;
    const SECONDS_IN_MINUTE = 60;
    const MS_IN_SECOND = 1000;
    const ONE_YEAR_MS = DAYS_IN_YEAR * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND;
    const oneYearFromNow = new Date(Date.now() + ONE_YEAR_MS)
      .toISOString()
      .split('T')[0];
    const step: Step = {
      deadline: deadline || oneYearFromNow,
      description: description.trim(),
      goalId,
      id: `step-${Date.now()}`,
      isDone: false,
      keywords: goalKeywords,
    };
    onAdd(step);
    setDescription('');
    setDeadline('');
  };

  return (
    <View style={gutters.marginBottom_16}>
      <TextInput
        onChangeText={setDescription}
        placeholder="Describe this milestone..."
        returnKeyType="next"
        style={[fonts.size_14, fonts.gray800, gutters.paddingHorizontal_12, gutters.paddingVertical_10, gutters.marginBottom_8]}
        testID="step-description-input"
        value={description}
      />
      <TextInput
        onChangeText={setDeadline}
        placeholder="Target date (YYYY-MM-DD)"
        returnKeyType="done"
        style={[fonts.size_14, fonts.gray800, gutters.paddingHorizontal_12, gutters.paddingVertical_10, gutters.marginBottom_8]}
        testID="step-deadline-input"
        value={deadline}
      />
      <TouchableOpacity onPress={handleAdd} testID="add-step-button">
        <Text style={[fonts.size_14, fonts.gray800]}>+ Add Step</Text>
      </TouchableOpacity>
    </View>
  );
}

export default StepForm;
