import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation/types';

import { useOnboardingStatus } from '@/hooks';
import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Example, FutureSelf, GoalSetup, Startup, StepsSetup } from '@/screens';

import MainTabs from './MainTabs';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();
  const { isComplete } = useOnboardingStatus();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={isComplete ? Paths.MainTabs : Paths.OnboardingGoalSetup}
          key={variant}
          screenOptions={{ headerShown: false }}
        >
          {isComplete ? (
            <Stack.Screen component={MainTabs} name={Paths.MainTabs} />
          ) : (
            <>
              <Stack.Screen component={GoalSetup} name={Paths.OnboardingGoalSetup} />
              <Stack.Screen component={FutureSelf} name={Paths.OnboardingFutureSelf} />
              <Stack.Screen component={StepsSetup} name={Paths.OnboardingStepsSetup} />
              <Stack.Screen component={MainTabs} name={Paths.MainTabs} />
            </>
          )}
          <Stack.Screen component={Example} name={Paths.Example} />
          <Stack.Screen component={Startup} name={Paths.Startup} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
