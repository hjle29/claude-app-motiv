import type { Goal } from '@/store/schemas';

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import QAFlow from '@/onboarding/components/QAFlow';
import { futureSelfRounds } from '@/onboarding/data/qaTree';
import { generateFutureSelfNarrative } from '@/onboarding/utils/generateFutureSelf';
import { goalStore } from '@/store/goalStore';

import GoalSelector from './components/GoalSelector';
import TimeframeSelector from './components/TimeframeSelector';

type Timeframe = '10yr' | '5yr';

function FutureSelf() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingFutureSelf>['navigation']>();

  const goals = goalStore.getGoals();
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe | undefined>(undefined);
  const [showQA, setShowQA] = useState(false);

  const handleSkip = () => {
    navigation.navigate(Paths.OnboardingStepsSetup);
  };

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowQA(false);
  };

  const handleTimeframeSelect = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    if (selectedGoal) setShowQA(true);
  };

  const handleQAComplete = (answers: string[]) => {
    if (!selectedGoal || !selectedTimeframe) return;
    const narrative = generateFutureSelfNarrative({
      answers,
      goalStatement: selectedGoal.statement,
      timeframe: selectedTimeframe,
    });
    goalStore.saveFutureSelf({
      goalId: selectedGoal.id,
      narrative,
      timeframe: selectedTimeframe,
    });
    setShowQA(false);
    setSelectedGoal(undefined);
    setSelectedTimeframe(undefined);
    // Navigate forward after saving — user can add more or proceed
    navigation.navigate(Paths.OnboardingStepsSetup);
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          Imagine your future self
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Describe what your life looks like in 5 or 10 years. This step is optional.
        </Text>

        {!showQA && (
          <>
            <GoalSelector
              goals={goals}
              onSelect={handleGoalSelect}
              selectedId={selectedGoal?.id ?? undefined}
            />
            {selectedGoal ? <TimeframeSelector
                onSelect={handleTimeframeSelect}
                selected={selectedTimeframe}
              /> : undefined}
          </>
        )}

        {showQA ? <View testID="future-self-qa">
            <QAFlow onComplete={handleQAComplete} rounds={futureSelfRounds} />
          </View> : undefined}

        <TouchableOpacity
          onPress={handleSkip}
          style={[gutters.marginTop_32, gutters.paddingVertical_16]}
          testID="skip-button"
        >
          <Text style={[fonts.size_14, fonts.gray200]}>Skip for now →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default FutureSelf;
