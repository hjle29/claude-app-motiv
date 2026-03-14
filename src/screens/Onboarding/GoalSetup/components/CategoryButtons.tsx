import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { qaTree } from '@/onboarding/data/qaTree';

type Props = {
  readonly onSelect: (categoryLabel: string, categoryKeyword: string) => void;
};

const OTHERS = { keyword: 'others', label: 'Others' };

function CategoryButtons({ onSelect }: Props) {
  const { fonts, gutters, layout } = useTheme();
  const categories = [...qaTree.map(c => ({ keyword: c.keyword, label: c.label })), OTHERS];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[layout.row, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.keyword}
            onPress={() => { onSelect(cat.label, cat.keyword); }}
            style={[gutters.marginRight_12, gutters.paddingHorizontal_16, gutters.paddingVertical_8]}
            testID={`category-${cat.keyword}`}
          >
            <Text style={[fonts.size_14, fonts.gray800]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default CategoryButtons;
