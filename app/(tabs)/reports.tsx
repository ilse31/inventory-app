import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share,
} from "lucide-react-native";
import { useInventoryStore } from "@/stores/inventory-store";
import { EmptyState } from "@/components/EmptyState";
import { colors, theme } from "@/constants/Colors";
import { formatCurrency } from "@/utils/helper";
import { ProfitChart } from "@/components/ProfitChart";

export default function ReportsScreen() {
  const { invoices, getMonthlyProfits, getTotalProfit } = useInventoryStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthlyProfits = getMonthlyProfits(selectedYear);
  const totalProfit = getTotalProfit();

  const handlePreviousYear = () => {
    setSelectedYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    const nextYear = selectedYear + 1;
    if (nextYear <= new Date().getFullYear()) {
      setSelectedYear(nextYear);
    }
  };

  if (invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Profit Reports" }} />
        <EmptyState type="reports" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Profit Reports" }} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Total Profit</Text>
            <Text style={styles.overviewValue}>
              {formatCurrency(totalProfit)}
            </Text>
            <Text style={styles.overviewSubtitle}>
              From {invoices.length} transactions
            </Text>
          </View>

          <View style={styles.yearSelector}>
            <TouchableOpacity
              onPress={handlePreviousYear}
              style={styles.yearButton}
            >
              <ChevronLeft size={20} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.yearText}>{selectedYear}</Text>

            <TouchableOpacity
              onPress={handleNextYear}
              style={[
                styles.yearButton,
                selectedYear >= new Date().getFullYear() &&
                  styles.disabledButton,
              ]}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight
                size={20}
                color={
                  selectedYear >= new Date().getFullYear()
                    ? colors.text.tertiary
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          <ProfitChart data={monthlyProfits} year={selectedYear} />

          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.reportAction}>
              <Download size={20} color={colors.primary} />
              <Text style={styles.reportActionText}>Export Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportAction}>
              <Share size={20} color={colors.primary} />
              <Text style={styles.reportActionText}>Share Report</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Monthly Breakdown</Text>

            {monthlyProfits.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.monthName}>
                  {new Date(selectedYear, item.month).toLocaleString(
                    "default",
                    { month: "long" },
                  )}
                </Text>
                <Text
                  style={[
                    styles.monthProfit,
                    item.profit > 0
                      ? styles.positiveProfit
                      : item.profit < 0
                        ? styles.negativeProfit
                        : {},
                  ]}
                >
                  {formatCurrency(item.profit)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  overviewCard: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.light,
    marginBottom: theme.spacing.xs,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.light,
    marginBottom: theme.spacing.xs,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.8,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  yearButton: {
    padding: theme.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginHorizontal: theme.spacing.md,
  },
  reportActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: theme.spacing.md,
  },
  reportAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  reportActionText: {
    marginLeft: theme.spacing.xs,
    color: colors.primary,
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthName: {
    fontSize: 16,
    color: colors.text.primary,
  },
  monthProfit: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  positiveProfit: {
    color: colors.success,
  },
  negativeProfit: {
    color: colors.danger,
  },
});
