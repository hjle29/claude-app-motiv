import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = {
  month: number; // 0-indexed
  monthRates: Record<string, number>;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  year: number;
};

function MonthlyCalendar({ month, monthRates, onSelectDate, selectedDate, year }: Props) {
  const { colors, fonts, gutters, layout } = useTheme();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthLabel = new Date(year, month, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={gutters.paddingHorizontal_16}>
      <Text style={[fonts.size_16, fonts.gray800, fonts.bold, gutters.marginBottom_12]}>
        {monthLabel}
      </Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[layout.row, gutters.marginBottom_8]}>
          {row.map((day, colIndex) => {
            if (!day) {
              return <View key={colIndex} style={{ flex: 1, height: 32 }} />;
            }
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rate = monthRates[date] ?? 0;
            const bgColor =
              rate === 0 ? colors.gray50 : rate < 1 ? colors.purple100 : colors.purple500;
            const isSelected = date === selectedDate;

            return (
              <TouchableOpacity
                key={colIndex}
                onPress={() => onSelectDate(date)}
                style={[
                  layout.justifyCenter,
                  layout.itemsCenter,
                  {
                    backgroundColor: bgColor,
                    borderColor: isSelected ? colors.purple500 : 'transparent',
                    borderRadius: 6,
                    borderWidth: 2,
                    flex: 1,
                    height: 32,
                    marginHorizontal: 2,
                  },
                ]}
                testID={`calendar-day-${date}`}
              >
                <Text style={[fonts.size_12, rate === 1 ? fonts.gray50 : fonts.gray800]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default MonthlyCalendar;
