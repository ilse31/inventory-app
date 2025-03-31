import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Invoice } from "@/types/inventory";
import { FileText, ChevronRight } from "lucide-react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { formatCurrency, formatDate } from "@/utils/helper";
import { colors, theme } from "@/constants/Colors";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress?: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FileText size={20} color={Colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.invoiceId}>{invoice.id}</Text>
          <Text style={styles.date}>{formatDate(invoice.date)}</Text>
        </View>
        <ChevronRight size={20} color={colors.text.tertiary} />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={styles.detailValue}>{invoice.items.length}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(invoice.totalAmount)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Profit</Text>
          <Text
            style={[
              styles.detailValue,
              invoice.profit > 0 ? styles.profit : styles.loss,
            ]}
          >
            {formatCurrency(invoice.profit)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.primary + "10", // 10% opacity
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.md,
  },
  details: {
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  profit: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
});
