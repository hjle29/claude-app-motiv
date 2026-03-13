import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/templates';

function Today() {
  const { fonts, layout } = useTheme();
  return (
    <SafeScreen>
      <View
        style={[layout.flex_1, layout.justifyCenter, layout.itemsCenter]}
        testID="screen-today"
      >
        <Text style={[fonts.size_24, fonts.gray800, fonts.bold]}>Today</Text>
      </View>
    </SafeScreen>
  );
}

export default Today;
