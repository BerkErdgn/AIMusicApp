/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};


export const SystemColors = {
  // Primary Colors
  primaryColor1: '#F76CC6',
  primaryColor1_30: 'rgba(247, 108, 198, 0.3)',
  primaryColor2: '#5426D7',
  
  // Linear Gradients (you'll need to use these with a gradient component)
  linearGradient: ['#F76CC6', '#5426D7'],
  linearGradient_30: ['rgba(247, 108, 198, 0.3)', 'rgba(84, 38, 215, 0.3)'],
  
  // System Colors
  black: '#000000',
  dark: '#231E27',
  white: '#FFFFFF',
  white_85: 'rgba(255, 255, 255, 0.85)',
  white_70: 'rgba(255, 255, 255, 0.70)',
  white_50: 'rgba(255, 255, 255, 0.50)',
  gray: '#838283',
}
