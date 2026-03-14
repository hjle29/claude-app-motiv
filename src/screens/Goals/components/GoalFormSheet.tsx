import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import type { Goal } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const INPUT_BORDER_WIDTH = 1;
const CATEGORIES = ['Family', 'Health', 'Money', 'Career', 'Travel', 'Others'] as const;

type Category = (typeof CATEGORIES)[number];

type Props = {
  goal: Goal | undefined;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  visible: boolean;
};

function GoalFormSheet({ goal, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [statement, setStatement] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [category, setCategory] = useState<Category>('Others');

  useEffect(() => {
    if (visible) {
      setStatement(goal?.statement ?? '');
      setKeywordsText(goal?.keywords.join(', ') ?? '');
      setCategory((goal?.category as Category | undefined) ?? 'Others');
    }
  }, [visible, goal]);

  function handleSave() {
    const trimmedStatement = statement.trim();
    const keywords = keywordsText
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    if (!trimmedStatement || keywords.length === 0) return;
    const saved: Goal = {
      archivedAt: goal?.archivedAt,
      category,
      createdAt: goal?.createdAt ?? new Date().toISOString(),
      id: goal?.id ?? Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      keywords,
      statement: trimmedStatement,
    };
    onSave(saved);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View
        style={[
          backgrounds.gray50,
          gutters.paddingHorizontal_24,
          gutters.paddingTop_24,
          gutters.paddingBottom_40,
          { position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
          {goal ? 'Edit Goal' : 'Add Goal'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={gutters.marginTop_16}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                gutters.paddingHorizontal_12,
                gutters.paddingVertical_8,
                {
                  backgroundColor: category === cat ? colors.purple500 : colors.gray200,
                  borderRadius: BORDER_RADIUS,
                  marginRight: 8,
                },
              ]}
              testID={`goal-category-${cat}`}
            >
              <Text
                style={[
                  fonts.size_12,
                  { color: category === cat ? colors.gray50 : colors.gray800 },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          multiline
          onChangeText={setStatement}
          placeholder="Describe your goal"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_16,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="goal-form-statement"
          value={statement}
        />

        <TextInput
          onChangeText={setKeywordsText}
          placeholder="Keywords (comma separated)"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="goal-form-keywords"
          value={keywordsText}
        />

        <View style={[layout.row, gutters.marginTop_24]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: 8 },
            ]}
            testID="goal-form-cancel"
          >
            <Text style={[fonts.size_14, fonts.gray400]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={[
              layout.flex_1,
              backgrounds.purple500,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS },
            ]}
            testID="goal-form-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default GoalFormSheet;
