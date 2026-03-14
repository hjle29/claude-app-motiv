import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { DailyPlanRoutine } from '@/hooks/domain/today/useDailyPlan';

import SkipReasonSheet from './SkipReasonSheet';

type Props = {
  onComplete: (routineId: string) => void;
  onSkip: (routineId: string, reason: string) => void;
  routine: DailyPlanRoutine;
};

function RoutineItem({ onComplete, onSkip, routine }: Props) {
  const { colors, fonts, gutters, layout } = useTheme();
  const [skipSheetVisible, setSkipSheetVisible] = useState(false);

  const isCompleted = routine.log?.status === 'completed';
  const isSkipped = routine.log?.status === 'skipped';
  const isDone = isCompleted || isSkipped;

  return (
    <>
      <View
        style={[layout.row, layout.itemsCenter, layout.justifyBetween, gutters.paddingVertical_12]}
        testID={`routine-item-${routine.id}`}
      >
        <TouchableOpacity
          disabled={isDone}
          onPress={() => onComplete(routine.id)}
          style={[layout.row, layout.itemsCenter, layout.flex_1]}
          testID={`routine-check-${routine.id}`}
        >
          <View
            style={{
              backgroundColor: isCompleted ? colors.purple500 : 'transparent',
              borderColor: isCompleted ? colors.purple500 : colors.gray200,
              borderRadius: 4,
              borderWidth: 2,
              height: 20,
              marginRight: 12,
              width: 20,
            }}
          />
          <Text
            style={[fonts.size_16, isCompleted || isSkipped ? fonts.gray200 : fonts.gray800]}
          >
            {routine.name}
            {isSkipped ? ` (skipped: ${routine.log?.skipReason ?? ''})` : ''}
          </Text>
        </TouchableOpacity>

        {!isDone && (
          <TouchableOpacity
            onPress={() => setSkipSheetVisible(true)}
            testID={`routine-skip-${routine.id}`}
          >
            <Text style={[fonts.size_14, fonts.gray200]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <SkipReasonSheet
        onClose={() => setSkipSheetVisible(false)}
        onSelect={reason => {
          setSkipSheetVisible(false);
          onSkip(routine.id, reason);
        }}
        visible={skipSheetVisible}
      />
    </>
  );
}

export default RoutineItem;
