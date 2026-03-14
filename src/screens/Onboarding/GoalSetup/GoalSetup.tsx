import type { Goal } from '@/store/schemas';

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import type { RootScreenProps } from '@/navigation/types';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

import QAFlow from '@/onboarding/components/QAFlow';
import { qaTree } from '@/onboarding/data/qaTree';
import { extractKeywords, generateGoalStatement } from '@/onboarding/utils/generateGoal';
import { goalStore } from '@/store/goalStore';

import CategoryButtons from './components/CategoryButtons';
import GoalCard from './components/GoalCard';

const MAX_GOALS = 3;
type Mode = 'freetext' | 'idle' | 'qa';

function GoalSetup() {
  const { fonts, gutters } = useTheme();
  const navigation = useNavigation<RootScreenProps<typeof Paths.OnboardingGoalSetup>['navigation']>();

  const [goals, setGoals] = useState<Goal[]>(() => goalStore.getGoals());
  const [mode, setMode] = useState<Mode>('idle');
  const [activeCategory, setActiveCategory] = useState<{ keyword: string; label: string } | undefined>(undefined);
  const [freeText, setFreeText] = useState('');

  const handleCategorySelect = (label: string, keyword: string) => {
    if (keyword === 'others') {
      setMode('freetext');
      return;
    }
    setActiveCategory({ keyword, label });
    setMode('qa');
  };

  const handleQAComplete = (answers: string[], answerKeywords: string[]) => {
    if (!activeCategory) return;
    const statement = generateGoalStatement(activeCategory.label, answers);
    const keywords = extractKeywords(activeCategory.keyword, answerKeywords);
    persistGoal(statement, keywords, activeCategory.label);
    setMode('idle');
    setActiveCategory(undefined);
  };

  const handleFreeTextSubmit = () => {
    if (!freeText.trim()) return;
    persistGoal(freeText.trim(), ['custom'], 'Others');
    setFreeText('');
    setMode('idle');
  };

  const persistGoal = (statement: string, keywords: string[], category: string) => {
    const goal: Goal = {
      category,
      createdAt: new Date().toISOString(),
      id: `goal-${Date.now()}`,
      keywords,
      statement,
    };
    goalStore.saveGoal(goal);
    setGoals(goalStore.getGoals());
  };

  const handleDelete = (id: string) => {
    goalStore.deleteGoal(id);
    setGoals(goalStore.getGoals());
  };

  const handleContinue = () => {
    navigation.navigate(Paths.OnboardingFutureSelf);
  };

  const activeQATree = activeCategory
    ? qaTree.find(c => c.keyword === activeCategory.keyword)
    : undefined;

  const canAddMore = goals.length < MAX_GOALS;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={[gutters.paddingHorizontal_16, gutters.paddingVertical_24]}>
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold, gutters.marginBottom_8]}>
          What are your life goals?
        </Text>
        <Text style={[fonts.size_16, fonts.gray200, gutters.marginBottom_24]}>
          Add up to 3 goals that matter most to you.
        </Text>

        {goals.map(goal => (
          <GoalCard goal={goal} key={goal.id} onDelete={handleDelete} />
        ))}

        {canAddMore && mode === 'idle' ? <>
            <TextInput
              onChangeText={setFreeText}
              onSubmitEditing={handleFreeTextSubmit}
              placeholder="Type your goal here..."
              returnKeyType="done"
              style={[fonts.size_16, fonts.gray800, gutters.paddingHorizontal_16, gutters.paddingVertical_12, gutters.marginBottom_16]}
              testID="goal-text-input"
              value={freeText}
            />
            <CategoryButtons onSelect={handleCategorySelect} />
          </> : undefined}

        {mode === 'qa' && activeQATree ? <QAFlow onComplete={handleQAComplete} rounds={activeQATree.rounds} /> : undefined}

        {mode === 'freetext' && (
          <View>
            <TextInput
              autoFocus
              onChangeText={setFreeText}
              onSubmitEditing={handleFreeTextSubmit}
              placeholder="Describe your goal..."
              returnKeyType="done"
              style={[fonts.size_16, fonts.gray800, gutters.paddingHorizontal_16, gutters.paddingVertical_12]}
              testID="goal-freetext-input"
              value={freeText}
            />
          </View>
        )}

        <TouchableOpacity
          disabled={goals.length === 0}
          onPress={handleContinue}
          style={[gutters.marginTop_32, gutters.paddingVertical_16]}
          testID="continue-button"
        >
          <Text style={[fonts.size_16, fonts.bold, goals.length === 0 ? fonts.gray200 : fonts.gray800]}>
            Continue →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

export default GoalSetup;
