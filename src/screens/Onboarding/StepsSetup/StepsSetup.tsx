import type { Step } from '@/store/schemas';

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import { goalStore } from '@/store/goalStore';

import StepForm from './components/StepForm';

function StepsSetup() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingStepsSetup>['navigation']>();

  const goals = goalStore.getGoals();
  const [stepsByGoal, setStepsByGoal] = useState<Record<string, Step[]>>({});

  const handleAddStep = (goalId: string, step: Step) => {
    setStepsByGoal(previous => ({
      ...previous,
      [goalId]: [...(previous[goalId] ?? []), step],
    }));
  };

  const handleFinish = () => {
    // Steps are held in local state for now — Plan 4 (Goals tab) will add persistence
    navigation.reset({
      index: 0,
      routes: [{ name: Paths.MainTabs }],
    });
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          Break it down into steps
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Add milestones for each goal. You can do this later too.
        </Text>

        {goals.map(goal => (
          <View key={goal.id} style={gutters.marginBottom_32}>
            <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
              {goal.statement}
            </Text>
            {(stepsByGoal[goal.id] ?? []).map(step => (
              <Text key={step.id} style={[fonts.size_14, fonts.gray200, gutters.marginBottom_8]}>
                • {step.description}
              </Text>
            ))}
            <StepForm
              goalId={goal.id}
              goalKeywords={goal.keywords}
              onAdd={step => { handleAddStep(goal.id, step); }}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleFinish}
          style={[gutters.marginTop_16, gutters.paddingVertical_16]}
          testID="finish-button"
        >
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>
            Start my journey →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default StepsSetup;
