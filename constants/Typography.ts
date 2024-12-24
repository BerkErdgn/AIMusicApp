/**
 * Typography constants for the app
 * Defines text styles including font sizes, line heights, letter spacing, and font weights
 */

export const Typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.4,
    fontWeight: '700', // Bold
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
    fontWeight: '400', // Regular/Body
  },
  bodyBold: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    fontWeight: '700', // Bold
  },
  bodySemibold: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    fontWeight: '600', // Semibold
  },
  bodyRegular: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.4,
    fontWeight: '400', // Regular
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: -0.4,
    fontWeight: '600', // Semibold
  }
} as const;

// Helper type for accessing typography styles
export type TypographyStyle = keyof typeof Typography; 