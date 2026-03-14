import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FutureSelf, Goal, Step } from '@/store/schemas';

import { useTheme } from '@/theme';

import { useSteps } from '@/hooks/domain/goals/useSteps';

import FutureSelfSection from './FutureSelfSection';
import LinkedRoutinesSheet from './LinkedRoutinesSheet';
import StepFormSheet from './StepFormSheet';
import StepItem from './StepItem';

const ACTIONS_GAP = 12;
const BORDER_RADIUS = 12;
const BORDER_WIDTH = 1;
const CHIP_GAP = 6;
const CHIP_ROW_TOP = 6;
const CHIP_VERTICAL_GAP = 4;
const KEYWORD_RADIUS = 12;

type Props = {
  futureSelf: FutureSelf[];
  goal: Goal;
  onArchive: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
};

function GoalCard({ futureSelf, goal, onArchive, onEdit }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const { addStep, completedCount, deleteStep, steps, toggleDone, updateStep } = useSteps(
    goal.id,
  );

  const [expanded, setExpanded] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | undefined>();
  const [stepFormVisible, setStepFormVisible] = useState(false);
  const [linkingStep, setLinkingStep] = useState<Step | undefined>();
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);

  function openAddStep() {
    setEditingStep(undefined);
    setStepFormVisible(true);
  }

  function openEditStep(step: Step) {
    setEditingStep(step);
    setStepFormVisible(true);
  }

  function handleStepSave(step: Step) {
    if (editingStep) {
      updateStep(step);
    } else {
      addStep(step);
    }
    setStepFormVisible(false);
  }

  function openLinkRoutines(step: Step) {
    setLinkingStep(step);
    setLinkSheetVisible(true);
  }

  function handleLinkSave(ids: string[]) {
    if (!linkingStep) return;
    updateStep({ ...linkingStep, linkedRoutineIds: ids });
    setLinkSheetVisible(false);
  }

  return (
    <View
      style={[
        backgrounds.gray50,
        gutters.marginTop_16,
        gutters.paddingHorizontal_16,
        gutters.paddingVertical_16,
        { borderColor: colors.gray200, borderRadius: BORDER_RADIUS, borderWidth: BORDER_WIDTH },
      ]}
    >
      <Pressable
        onPress={() => setExpanded(e => !e)}
        testID={`goal-card-header-${goal.id}`}
      >
        <View style={[layout.row, layout.justifyBetween, layout.itemsCenter]}>
          <Text style={[layout.flex_1, fonts.size_16, fonts.bold, fonts.gray800]}>
            {goal.statement}
          </Text>
          <Text style={[fonts.size_16, fonts.gray400, gutters.marginLeft_8]}>
            {expanded ? '▾' : '▸'}
          </Text>
        </View>

        <View style={[layout.row, { flexWrap: 'wrap', marginTop: CHIP_ROW_TOP }]}>
          {goal.keywords.map(kw => (
            <View
              key={kw}
              style={[
                gutters.paddingHorizontal_8,
                gutters.paddingVertical_8,
                {
                  backgroundColor: colors.purple100,
                  borderRadius: KEYWORD_RADIUS,
                  marginRight: CHIP_GAP,
                  marginTop: CHIP_VERTICAL_GAP,
                },
              ]}
            >
              <Text style={[fonts.size_10, { color: colors.purple500 }]}>{kw}</Text>
            </View>
          ))}
        </View>

        <Text style={[fonts.size_12, fonts.gray400, { marginTop: CHIP_ROW_TOP }]}>
          {completedCount} / {steps.length} steps
        </Text>
      </Pressable>

      {expanded && (
        <View style={gutters.marginTop_16}>
          <View style={[layout.row, { marginBottom: ACTIONS_GAP }]}>
            <Pressable
              onPress={() => onEdit(goal)}
              style={gutters.marginRight_16}
              testID={`goal-card-edit-${goal.id}`}
            >
              <Text style={[fonts.size_12, fonts.gray400]}>Edit Goal</Text>
            </Pressable>
            <Pressable
              onPress={() => onArchive(goal.id)}
              testID={`goal-card-archive-${goal.id}`}
            >
              <Text style={[fonts.size_12, fonts.gray400]}>Archive</Text>
            </Pressable>
          </View>

          <FutureSelfSection futureSelf={futureSelf} />

          {steps.length > 0 && (
            <View style={gutters.marginTop_16}>
              <Text style={[fonts.size_14, fonts.bold, fonts.gray800]}>Steps</Text>
              {steps.map(step => (
                <StepItem
                  key={step.id}
                  onDelete={deleteStep}
                  onEdit={openEditStep}
                  onLinkRoutines={openLinkRoutines}
                  onToggleDone={toggleDone}
                  step={step}
                />
              ))}
            </View>
          )}

          <Pressable
            onPress={openAddStep}
            style={[gutters.marginTop_12, { alignSelf: 'flex-start' }]}
            testID={`goal-card-add-step-${goal.id}`}
          >
            <Text style={[fonts.size_14, { color: colors.purple500 }]}>+ Add Step</Text>
          </Pressable>
        </View>
      )}

      <StepFormSheet
        goalId={goal.id}
        goalKeywords={goal.keywords}
        onClose={() => setStepFormVisible(false)}
        onSave={handleStepSave}
        step={editingStep}
        visible={stepFormVisible}
      />
      <LinkedRoutinesSheet
        linkedRoutineIds={linkingStep?.linkedRoutineIds ?? []}
        onClose={() => setLinkSheetVisible(false)}
        onSave={handleLinkSave}
        visible={linkSheetVisible}
      />
    </View>
  );
}

export default GoalCard;
