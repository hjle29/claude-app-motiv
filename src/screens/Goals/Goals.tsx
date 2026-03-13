import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Goals() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-goals"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Goals</Text>
      </View>
    </SafeScreen>
  );
}

export default Goals;
