import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.MainTabs]: undefined;
  [Paths.OnboardingFutureSelf]: undefined;
  [Paths.OnboardingGoalSetup]: undefined;
  [Paths.OnboardingStepsSetup]: undefined;
  [Paths.Startup]: undefined;
};

export type MainTabParamList = {
  [Paths.Discover]: undefined;
  [Paths.Goals]: undefined;
  [Paths.Today]: undefined;
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type TabScreenProps<
  S extends keyof MainTabParamList = keyof MainTabParamList,
> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, S>,
  StackScreenProps<RootStackParamList>
>;
