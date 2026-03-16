import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

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
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = (screenWidth - 32) / 7; // 32 = paddingHorizontal_16 * 2

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

  const paddedLength = Math.ceil(cells.length / 7) * 7;
  const paddedCells: (number | null)[] = [
    ...cells,
    ...Array.from({ length: paddedLength - cells.length }, () => null),
  ];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    rows.push(paddedCells.slice(i, i + 7));
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
              return <View key={colIndex} style={{ width: cellWidth, height: 32 }} />;
            }
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const rate = monthRates[date] ?? 0;
            const bgColor = rate === 0
              ? colors.gray50
              : colors.purple500 + Math.round((0.15 + rate * 0.85) * 255).toString(16).padStart(2, '0');
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
                    height: 32,
                    width: cellWidth,
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
