import type { Goal } from '@/store/schemas';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  readonly goals: Goal[];
  readonly onSelect: (goal: Goal) => void;
  readonly selectedId: null | string;
};

function GoalSelector({ goals, onSelect, selectedId }: Props) {
  const { fonts, gutters } = useTheme();

  return (
    <View>
      <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_12]}>
        Which goal do you want to visualize?
      </Text>
      {goals.map(goal => (
        <TouchableOpacity
          key={goal.id}
          onPress={() => {
            onSelect(goal);
          }}
          style={[gutters.marginBottom_8, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
          testID={`goal-selector-${goal.id}`}
        >
          <Text style={[fonts.size_14, goal.id === selectedId ? fonts.gray800 : fonts.gray200, fonts.bold]}>
            {goal.statement}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default GoalSelector;
