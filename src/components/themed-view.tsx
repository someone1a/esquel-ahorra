import { View, type ViewProps } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safeArea?: boolean;
  safeAreaEdges?: Edge[];
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  safeArea,
  safeAreaEdges,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (safeArea) {
    return (
      <SafeAreaView
        edges={safeAreaEdges ?? ['top', 'left', 'right']}
        style={[{ backgroundColor }, style]}
        {...otherProps}
      />
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
