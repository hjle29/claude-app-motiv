import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { FutureSelf, Goal } from '@/store/schemas';

import { goalStore } from '@/store/goalStore';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import { useGoals } from '@/hooks/domain/goals/useGoals';

import GoalCard from './components/GoalCard';
import GoalWizard from './components/GoalWizard';

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

  function handleGoalSave(goal: Goal, futureSelf?: FutureSelf) {
    if (editingGoal) {
      updateGoal(goal);
    } else {
      addGoal(goal);
    }
    if (futureSelf) {
      goalStore.saveFutureSelf(futureSelf);
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
          {goals.length < MAX_ACTIVE_GOALS ? (
            <Pressable onPress={openAddGoal} testID="goals-add-button">
              <Text style={[fonts.size_24, fonts.gray800]}>+</Text>
            </Pressable>
          ) : (
            <Text style={[fonts.size_12, fonts.gray400]}>Max 3 — archive one to add more</Text>
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

      <GoalWizard
        futureSelf={editingGoal ? futureSelfFor(editingGoal.id) : undefined}
        goal={editingGoal}
        onClose={() => setGoalFormVisible(false)}
        onSave={handleGoalSave}
        visible={goalFormVisible}
      />
    </SafeScreen>
  );
}

export default Goals;
