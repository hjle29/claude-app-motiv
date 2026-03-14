import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Goal } from '@/store/schemas';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import { useGoals } from '@/hooks/domain/goals/useGoals';

import GoalCard from './components/GoalCard';
import GoalFormSheet from './components/GoalFormSheet';

const EMPTY_STATE_MARGIN_TOP = 48;
const MAX_ACTIVE_GOALS = 3;

function Goals() {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  const { addGoal, archiveGoal, futureSelfFor, goals, updateGoal } = useGoals();

  const [goalFormVisible, setGoalFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  function openAddGoal() {
    setEditingGoal(undefined);
    setGoalFormVisible(true);
  }

  function openEditGoal(goal: Goal) {
    setEditingGoal(goal);
    setGoalFormVisible(true);
  }

  function handleGoalSave(goal: Goal) {
    if (editingGoal) {
      updateGoal(goal);
    } else {
      addGoal(goal);
    }
    setGoalFormVisible(false);
  }

  return (
    <SafeScreen>
      <View style={[layout.flex_1, backgrounds.gray50]} testID="screen-goals">
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.paddingHorizontal_24,
            gutters.paddingTop_24,
            gutters.paddingBottom_16,
          ]}
        >
          <Text style={[fonts.size_24, fonts.bold, fonts.gray800]}>My Goals</Text>
          {goals.length < MAX_ACTIVE_GOALS && (
            <Pressable onPress={openAddGoal} testID="goals-add-button">
              <Text style={[fonts.size_24, fonts.gray800]}>+</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingBottom_40]}
        >
          {goals.length === 0 ? (
            <Text
              style={[
                fonts.size_14,
                fonts.gray400,
                { marginTop: EMPTY_STATE_MARGIN_TOP, textAlign: 'center' },
              ]}
            >
              No goals yet.
            </Text>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                futureSelf={futureSelfFor(goal.id)}
                goal={goal}
                onArchive={archiveGoal}
                onEdit={openEditGoal}
              />
            ))
          )}
        </ScrollView>
      </View>

      <GoalFormSheet
        goal={editingGoal}
        onClose={() => setGoalFormVisible(false)}
        onSave={handleGoalSave}
        visible={goalFormVisible}
      />
    </SafeScreen>
  );
}

export default Goals;
