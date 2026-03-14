import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { DailyPlanRoutine } from '@/hooks/domain/today/useDailyPlan';

import AddRoutineSheet from './AddRoutineSheet';
import RoutineItem from './RoutineItem';

const MAX_DAILY_ROUTINES = 10;

type Props = {
  date: string;
  onAddRoutine: (routineId: string) => void;
  onComplete: (routineId: string) => void;
  onSkip: (routineId: string, reason: string) => void;
  routines: DailyPlanRoutine[];
};

function DailyRoutineList({ date, onAddRoutine, onComplete, onSkip, routines }: Props) {
  const { fonts, gutters } = useTheme();
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  const canAddMore = routines.length < MAX_DAILY_ROUTINES;
  const formattedDate = new Date(date).toLocaleDateString('default', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_8]}>{formattedDate}</Text>

      {routines.length === 0 && (
        <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_16]}>
          No routines for this day yet.
        </Text>
      )}

      {routines.map(routine => (
        <RoutineItem
          key={routine.id}
          onComplete={onComplete}
          onSkip={onSkip}
          routine={routine}
        />
      ))}

      {canAddMore && (
        <TouchableOpacity
          onPress={() => setAddSheetVisible(true)}
          style={gutters.paddingVertical_12}
          testID="add-routine-button"
        >
          <Text style={[fonts.size_14, fonts.gray400]}>+ Add routine</Text>
        </TouchableOpacity>
      )}

      <AddRoutineSheet
        date={date}
        onAdd={onAddRoutine}
        onClose={() => setAddSheetVisible(false)}
        visible={addSheetVisible}
      />
    </View>
  );
}

export default DailyRoutineList;
