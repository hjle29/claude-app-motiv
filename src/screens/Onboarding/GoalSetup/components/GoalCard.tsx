import type { Goal } from '@/store/schemas';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  readonly goal: Goal;
  readonly onDelete: (id: string) => void;
};

function GoalCard({ goal, onDelete }: Props) {
  const { fonts, gutters, layout } = useTheme();

  return (
    <View
      style={[layout.row, layout.justifyBetween, layout.itemsCenter, gutters.marginBottom_12]}
      testID={`goal-card-${goal.id}`}
    >
      <View style={layout.flex_1}>
        <Text style={[fonts.size_16, fonts.gray800]}>{goal.statement}</Text>
        <Text style={[fonts.size_12, fonts.gray200]}>{goal.keywords.join(', ')}</Text>
      </View>
      <TouchableOpacity
        onPress={() => { onDelete(goal.id); }}
        testID={`goal-delete-${goal.id}`}
      >
        <Text style={[fonts.size_14, fonts.red500]}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

export default GoalCard;
