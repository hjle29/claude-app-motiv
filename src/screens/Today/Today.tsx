import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { useDailyPlan } from '@/hooks/domain/today/useDailyPlan';
import { useMonthlyRates } from '@/hooks/domain/today/useMonthlyRates';
import { toLocalDateString } from '@/hooks/domain/today/dateUtils';

import { SafeScreen } from '@/components/templates';

import DailyRoutineList from './components/DailyRoutineList';
import MonthlyCalendar from './components/MonthlyCalendar';

function Today() {
  const { fonts, gutters, layout } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()));
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const monthRates = useMonthlyRates(calYear, calMonth);
  const { addDailyOverride, markComplete, markSkipped, routines } = useDailyPlan(selectedDate);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  return (
    <SafeScreen>
      <ScrollView>
        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.paddingHorizontal_16,
            gutters.paddingVertical_16,
            gutters.marginBottom_8,
          ]}
        >
          <TouchableOpacity onPress={handlePrevMonth} testID="prev-month-button">
            <Text style={[fonts.size_16, fonts.gray800]}>{'<'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} testID="next-month-button">
            <Text style={[fonts.size_16, fonts.gray800]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <MonthlyCalendar
          month={calMonth}
          monthRates={monthRates}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
          year={calYear}
        />

        <View style={gutters.paddingVertical_16} />

        <DailyRoutineList
          date={selectedDate}
          onAddRoutine={addDailyOverride}
          onComplete={markComplete}
          onSkip={markSkipped}
          routines={routines}
        />
      </ScrollView>
    </SafeScreen>
  );
}

export default Today;
