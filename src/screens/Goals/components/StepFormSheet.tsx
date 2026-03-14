import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import type { Step } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const INPUT_BORDER_WIDTH = 1;

type Props = {
  goalId: string;
  goalKeywords: string[];
  onClose: () => void;
  onSave: (step: Step) => void;
  step: Step | undefined;
  visible: boolean;
};

function StepFormSheet({ goalId, goalKeywords, onClose, onSave, step, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setDescription(step?.description ?? '');
      setDeadline(step?.deadline ?? '');
      setError('');
    }
  }, [visible, step]);

  function handleSave() {
    const trimmedDesc = description.trim();
    const trimmedDeadline = deadline.trim();
    if (!trimmedDesc) {
      setError('Description is required.');
      return;
    }
    if (!trimmedDeadline) {
      setError('Deadline is required (YYYY-MM-DD).');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDeadline)) {
      setError('Use format YYYY-MM-DD (e.g. 2026-06-01).');
      return;
    }
    setError('');
    const saved: Step = {
      deadline: trimmedDeadline,
      description: trimmedDesc,
      goalId,
      id: step?.id ?? Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      isDone: step?.isDone ?? false,
      keywords: step?.keywords ?? goalKeywords,
      linkedRoutineIds: step?.linkedRoutineIds ?? [],
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
          {step ? 'Edit Step' : 'Add Step'}
        </Text>
        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="What will you do?"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_16,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="step-form-description"
          value={description}
        />
        <TextInput
          onChangeText={setDeadline}
          placeholder="Deadline (YYYY-MM-DD)"
          placeholderTextColor={colors.gray400}
          style={[
            fonts.size_14,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.paddingVertical_8,
            { borderBottomWidth: INPUT_BORDER_WIDTH, borderColor: colors.gray200 },
          ]}
          testID="step-form-deadline"
          value={deadline}
        />
        {error ? (
          <Text style={[fonts.size_12, gutters.marginTop_8, { color: colors.red500 }]}>
            {error}
          </Text>
        ) : null}
        <View style={[layout.row, gutters.marginTop_24]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: 8 },
            ]}
            testID="step-form-cancel"
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
            testID="step-form-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default StepFormSheet;
