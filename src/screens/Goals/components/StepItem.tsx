import { Pressable, Text, View } from 'react-native';

import type { Step } from '@/store/schemas';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 6;
const DELETE_COLOR = '#EF4444';
const TOGGLE_BORDER = 2;
const TOGGLE_GAP = 12;
const TOGGLE_SIZE = 24;

type Props = {
  onDelete: (stepId: string) => void;
  onEdit: (step: Step) => void;
  onLinkRoutines: (step: Step) => void;
  onToggleDone: (stepId: string) => void;
  step: Step;
};

function StepItem({ onDelete, onEdit, onLinkRoutines, onToggleDone, step }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();

  const routineLabel =
    step.linkedRoutineIds.length === 1 ? '1 routine' : `${step.linkedRoutineIds.length} routines`;

  return (
    <View
      style={[
        backgrounds.gray100,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_12,
        gutters.marginTop_8,
        { borderRadius: BORDER_RADIUS },
      ]}
    >
      <View style={[layout.row, layout.itemsCenter]}>
        <Pressable
          onPress={() => onToggleDone(step.id)}
          style={[
            {
              alignItems: 'center',
              backgroundColor: step.isDone ? colors.purple500 : 'transparent',
              borderColor: step.isDone ? colors.purple500 : colors.gray400,
              borderRadius: TOGGLE_SIZE / 2,
              borderWidth: TOGGLE_BORDER,
              height: TOGGLE_SIZE,
              justifyContent: 'center',
              marginRight: TOGGLE_GAP,
              width: TOGGLE_SIZE,
            },
          ]}
          testID={`step-toggle-${step.id}`}
        >
          {step.isDone && <Text style={[fonts.size_12, fonts.gray50]}>✓</Text>}
        </Pressable>
        <Text
          style={[
            layout.flex_1,
            fonts.size_14,
            step.isDone ? fonts.gray400 : fonts.gray800,
            step.isDone && { textDecorationLine: 'line-through' },
          ]}
        >
          {step.description}
        </Text>
      </View>

      <View style={[layout.row, gutters.marginTop_8, { paddingLeft: TOGGLE_SIZE + TOGGLE_GAP }]}>
        <Text style={[fonts.size_12, fonts.gray400]}>{step.deadline}</Text>
        {step.linkedRoutineIds.length > 0 && (
          <Text style={[fonts.size_12, fonts.gray400, gutters.marginLeft_12]}>{routineLabel}</Text>
        )}
      </View>

      <View style={[layout.row, gutters.marginTop_8, { paddingLeft: TOGGLE_SIZE + TOGGLE_GAP }]}>
        <Pressable
          onPress={() => onEdit(step)}
          style={gutters.marginRight_16}
          testID={`step-edit-${step.id}`}
        >
          <Text style={[fonts.size_12, fonts.gray400]}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => onLinkRoutines(step)}
          style={gutters.marginRight_16}
          testID={`step-link-routines-${step.id}`}
        >
          <Text style={[fonts.size_12, fonts.gray400]}>Routines</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(step.id)}
          testID={`step-delete-${step.id}`}
        >
          <Text style={[fonts.size_12, { color: DELETE_COLOR }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default StepItem;
