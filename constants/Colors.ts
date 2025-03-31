// Color palette for the app
export const colors = {
  primary: "#4A6FA5", // Main brand color (blue)
  secondary: "#9BC1BC", // Secondary color (teal)
  accent: "#F4A261", // Accent color (orange)
  success: "#6BCB77", // Success color (green)
  danger: "#E76F51", // Danger/error color (red)
  warning: "#FFD166", // Warning color (yellow)

  // Neutrals
  background: "#FFFFFF",
  card: "#F9F9F9",
  border: "#E1E1E1",

  // Text
  text: {
    primary: "#333333",
    secondary: "#666666",
    tertiary: "#999999",
    light: "#FFFFFF",
  },
};

// Theme configuration
export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5.46,
      elevation: 9,
    },
  },
};
