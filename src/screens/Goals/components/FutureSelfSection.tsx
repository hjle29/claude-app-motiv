import { Text, View } from 'react-native';

import type { FutureSelf } from '@/store/schemas';

import { useTheme } from '@/theme';

type Props = {
  futureSelf: FutureSelf[];
};

function FutureSelfSection({ futureSelf }: Props) {
  const { fonts, gutters } = useTheme();

  const fiveYear = futureSelf.find(f => f.timeframe === '5yr');
  const tenYear = futureSelf.find(f => f.timeframe === '10yr');

  if (!fiveYear && !tenYear) {
    return (
      <Text style={[fonts.size_12, fonts.gray400, gutters.marginTop_8]}>
        No future self written yet.
      </Text>
    );
  }

  return (
    <View style={gutters.marginTop_8}>
      <Text style={[fonts.size_12, fonts.bold, fonts.gray400]}>5 years</Text>
      <Text style={[fonts.size_14, fonts.gray800, gutters.marginTop_8]}>
        {fiveYear ? fiveYear.narrative : 'Not written yet.'}
      </Text>
      <Text style={[fonts.size_12, fonts.bold, fonts.gray400, gutters.marginTop_16]}>
        10 years
      </Text>
      <Text style={[fonts.size_14, fonts.gray800, gutters.marginTop_8]}>
        {tenYear ? tenYear.narrative : 'Not written yet.'}
      </Text>
    </View>
  );
}

export default FutureSelfSection;
