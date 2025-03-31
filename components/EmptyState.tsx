import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, theme } from "@/constants/Colors";
import { Button } from "./Button";
import {
  Package,
  FileBarChart,
  ShoppingCart,
  History,
} from "lucide-react-native";

type EmptyStateType = "items" | "transactions" | "reports" | "history";

interface EmptyStateProps {
  type: EmptyStateType;
  onActionPress?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onActionPress,
  actionLabel,
}) => {
  const getContent = () => {
    switch (type) {
      case "items":
        return {
          icon: <Package size={64} color={colors.primary} />,
          title: "No Items Yet",
          description: "Start by adding items to your inventory",
          defaultActionLabel: "Add Item",
        };
      case "transactions":
        return {
          icon: <ShoppingCart size={64} color={colors.primary} />,
          title: "No Transactions",
          description: "Record incoming or outgoing items to see transactions",
          defaultActionLabel: "Record Transaction",
        };
      case "reports":
        return {
          icon: <FileBarChart size={64} color={colors.primary} />,
          title: "No Reports Available",
          description: "Complete transactions to generate reports",
          defaultActionLabel: "View Transactions",
        };
      case "history":
        return {
          icon: <History size={64} color={colors.primary} />,
          title: "No History Yet",
          description: "Your transaction history will appear here",
          defaultActionLabel: "Record Transaction",
        };
      default:
        return {
          icon: <Package size={64} color={colors.primary} />,
          title: "Nothing to Show",
          description: "Start by adding some data",
          defaultActionLabel: "Get Started",
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{content.icon}</View>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>

      {onActionPress && (
        <Button
          title={actionLabel || content.defaultActionLabel}
          onPress={onActionPress}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  button: {
    minWidth: 150,
  },
});
