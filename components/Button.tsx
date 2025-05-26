// Button.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { colors, theme } from "@/constants/Colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

// --- Style Factories ---

const createButtonStyle = ({
  size,
  variant,
  disabled,
  fullWidth,
  style,
}: {
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
  fullWidth: boolean;
  style?: StyleProp<ViewStyle>;
}): StyleProp<ViewStyle> => {
  const base: ViewStyle = {
    ...styles.button,
    ...(styles[`${size}Button`] as ViewStyle),
    ...(styles[`${variant}Button`] as ViewStyle),
  };

  if (disabled) {
    Object.assign(base, styles.disabledButton);
  }

  if (fullWidth) {
    base.width = "100%";
  }

  return [base, style];
};

const createTextStyle = ({
  size,
  variant,
  disabled,
  textStyle,
}: {
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
  textStyle?: StyleProp<TextStyle>;
}): StyleProp<TextStyle> => {
  const base: TextStyle[] = [
    { fontWeight: "600", textAlign: "center" },
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
  ];

  if (disabled) base.push(styles.disabledText as TextStyle);
  if (textStyle) base.push(textStyle as TextStyle);

  return base;
};

// --- Main Component ---

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = createButtonStyle({
    size,
    variant,
    disabled,
    fullWidth,
    style,
  });
  const titleStyle = createTextStyle({ size, variant, disabled, textStyle });

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={
            variant === "outline" || variant === "ghost"
              ? colors.primary
              : colors.text.light
          }
        />
      ) : (
        <>
          {icon}
          <Text style={titleStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  // Sizes
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  mediumButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  largeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  smallText: { fontSize: 12 },
  mediumText: { fontSize: 14 },
  largeText: { fontSize: 16 },

  // Variants
  primaryButton: { backgroundColor: colors.primary },
  secondaryButton: { backgroundColor: colors.secondary },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghostButton: { backgroundColor: "transparent" },
  dangerButton: { backgroundColor: colors.danger },

  primaryText: { color: colors.text.light },
  secondaryText: { color: colors.text.light },
  outlineText: { color: colors.primary },
  ghostText: { color: colors.primary },
  dangerText: { color: colors.text.light },

  // Disabled
  disabledButton: { opacity: 0.5 },
  disabledText: { opacity: 0.7 },
});
