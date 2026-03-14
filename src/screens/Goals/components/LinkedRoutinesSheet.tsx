import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { routineStore } from '@/store/routineStore';

import { useTheme } from '@/theme';

const BORDER_RADIUS = 8;
const BUTTON_GAP = 8;
const CHECKBOX_BORDER = 2;
const CHECKBOX_GAP = 12;
const CHECKBOX_RADIUS = 4;
const CHECKBOX_SIZE = 20;
const ROW_BORDER_WIDTH = 1;

type Props = {
  linkedRoutineIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  visible: boolean;
};

function LinkedRoutinesSheet({ linkedRoutineIds, onClose, onSave, visible }: Props) {
  const { backgrounds, colors, fonts, gutters, layout } = useTheme();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelected([...linkedRoutineIds]);
    }
  }, [visible, linkedRoutineIds]);

  const routines = routineStore.getRoutines();

  function toggleRoutine(routineId: string) {
    setSelected(prev =>
      prev.includes(routineId) ? prev.filter(id => id !== routineId) : [...prev, routineId],
    );
  }

  function handleSave() {
    onSave(selected);
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
          { maxHeight: '60%', position: 'absolute', bottom: 0, left: 0, right: 0 },
        ]}
      >
        <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>Link Routines</Text>
        <ScrollView style={gutters.marginTop_16}>
          {routines.map(routine => {
            const isChecked = selected.includes(routine.id);
            return (
              <Pressable
                key={routine.id}
                onPress={() => toggleRoutine(routine.id)}
                style={[
                  layout.row,
                  layout.itemsCenter,
                  gutters.paddingVertical_12,
                  { borderBottomWidth: ROW_BORDER_WIDTH, borderColor: colors.gray100 },
                ]}
                testID={`routine-check-${routine.id}`}
              >
                <View
                  style={{
                    backgroundColor: isChecked ? colors.purple500 : 'transparent',
                    borderColor: isChecked ? colors.purple500 : colors.gray400,
                    borderRadius: CHECKBOX_RADIUS,
                    borderWidth: CHECKBOX_BORDER,
                    height: CHECKBOX_SIZE,
                    marginRight: CHECKBOX_GAP,
                    width: CHECKBOX_SIZE,
                  }}
                />
                <Text style={[fonts.size_14, fonts.gray800]}>{routine.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={[layout.row, gutters.marginTop_16]}>
          <Pressable
            onPress={onClose}
            style={[
              layout.flex_1,
              backgrounds.gray100,
              gutters.paddingVertical_12,
              { alignItems: 'center', borderRadius: BORDER_RADIUS, marginRight: BUTTON_GAP },
            ]}
            testID="linked-routines-cancel"
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
            testID="linked-routines-save"
          >
            <Text style={[fonts.size_14, fonts.bold, fonts.gray50]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default LinkedRoutinesSheet;
