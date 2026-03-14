import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  readonly onSelect: (timeframe: Timeframe) => void;
  readonly selected: null | Timeframe;
};

type Timeframe = '10yr' | '5yr';

function TimeframeSelector({ onSelect, selected }: Props) {
  const { fonts, gutters, layout } = useTheme();
  const options: Timeframe[] = ['5yr', '10yr'];

  return (
    <View style={[layout.row, gutters.marginBottom_24]}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          onPress={() => {
            onSelect(option);
          }}
          style={[gutters.marginRight_12, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}
          testID={`timeframe-${option}`}
        >
          <Text style={[fonts.size_14, option === selected ? fonts.gray800 : fonts.gray200, fonts.bold]}>
            {option === '5yr' ? '5 Years' : '10 Years'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default TimeframeSelector;
