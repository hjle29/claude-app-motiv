import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import type { Routine } from '@/store/schemas';
import { routineStore } from '@/store/routineStore';

type Props = {
  date: string;
  onAdd: (routineId: string) => void;
  onClose: () => void;
  visible: boolean;
};

function AddRoutineSheet({ date, onAdd, onClose, visible }: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const routines = routineStore.getRoutines();

  const resetAndClose = () => {
    setNewName('');
    setShowCreate(false);
    onClose();
  };

  const handlePickExisting = (routine: Routine) => {
    onAdd(routine.id);
    resetAndClose();
  };

  const handleCreateNew = () => {
    if (!newName.trim()) return;
    const routine: Routine = {
      id: `routine-${Date.now()}`,
      name: newName.trim(),
      schedule: { endDate: date, startDate: date, type: 'dateRange' },
      tags: [],
    };
    routineStore.saveRoutine(routine);
    onAdd(routine.id);
    resetAndClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={resetAndClose} transparent visible={visible}>
      <View style={[layout.flex_1, layout.justifyEnd]}>
        <TouchableOpacity onPress={resetAndClose} style={layout.flex_1} />
        <View
          style={[backgrounds.gray50, gutters.paddingHorizontal_24, gutters.paddingVertical_24]}
        >
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
            Add a routine
          </Text>

          {!showCreate ? (
            <>
              <ScrollView style={{ maxHeight: 300 }}>
                {routines.length === 0 && (
                  <Text style={[fonts.size_14, fonts.gray200, gutters.marginBottom_16]}>
                    No routines in your library yet.
                  </Text>
                )}
                {routines.map(routine => (
                  <TouchableOpacity
                    key={routine.id}
                    onPress={() => handlePickExisting(routine)}
                    style={gutters.paddingVertical_12}
                    testID={`library-routine-${routine.id}`}
                  >
                    <Text style={[fonts.size_16, fonts.gray800]}>{routine.name}</Text>
                    <Text style={[fonts.size_12, fonts.gray200]}>{routine.tags.join(', ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={gutters.paddingVertical_12}
                testID="create-new-routine-button"
              >
                <Text style={[fonts.size_14, fonts.purple500]}>+ Create new routine</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <TextInput
                autoFocus
                onChangeText={setNewName}
                placeholder="Routine name..."
                returnKeyType="done"
                style={[
                  fonts.size_16,
                  fonts.gray800,
                  gutters.paddingVertical_12,
                  gutters.marginBottom_16,
                ]}
                testID="new-routine-name-input"
                value={newName}
              />
              <TouchableOpacity onPress={handleCreateNew} testID="save-new-routine-button">
                <Text style={[fonts.size_16, fonts.gray800, fonts.bold]}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default AddRoutineSheet;
