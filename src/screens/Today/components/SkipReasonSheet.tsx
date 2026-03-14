import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  onClose: () => void;
  onSelect: (reason: string) => void;
  visible: boolean;
};

const SKIP_REASONS = ['Sick', 'Traveling', 'Busy day', 'Rest day', 'Other'];

function SkipReasonSheet({ onClose, onSelect, visible }: Props) {
  const { backgrounds, fonts, gutters, layout } = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={[layout.flex_1, layout.justifyEnd]}>
        <TouchableOpacity onPress={onClose} style={layout.flex_1} />
        <View
          style={[backgrounds.gray50, gutters.paddingHorizontal_24, gutters.paddingVertical_24]}
        >
          <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_16]}>
            Why are you skipping?
          </Text>
          {SKIP_REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              onPress={() => onSelect(reason)}
              style={gutters.paddingVertical_12}
              testID={`skip-reason-${reason.toLowerCase().replaceAll(' ', '-')}`}
            >
              <Text style={[fonts.size_16, fonts.gray800]}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default SkipReasonSheet;
