/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '../constants/Colors';

export function useThemeColor() {
  // Force dark mode by not using useColorScheme()
  const theme = Colors.dark;
  
  return {
    theme,
    isDark: true // Always dark mode
  };
}
