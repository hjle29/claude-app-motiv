import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Paths } from '@/navigation/paths';
import type { MainTabParamList } from '@/navigation/types';

import { Discover, Goals, Today } from '@/screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen component={Today} name={Paths.Today} />
      <Tab.Screen component={Goals} name={Paths.Goals} />
      <Tab.Screen component={Discover} name={Paths.Discover} />
    </Tab.Navigator>
  );
}

export default MainTabs;
