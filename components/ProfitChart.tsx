import { colors, theme } from "@/constants/Colors";
import { formatCurrency } from "@/utils/helper";
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Platform } from "react-native";

interface ChartData {
  month: number;
  profit: number;
}

interface ProfitChartProps {
  data: ChartData[];
  year: number;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const screenWidth = Dimensions.get("window").width;

export const ProfitChart: React.FC<ProfitChartProps> = ({ data, year }) => {
  // Find the maximum profit value for scaling
  const maxProfit = Math.max(...data.map((item) => item.profit), 1);

  // Calculate the total profit for the year
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profit Overview {year}</Text>
        <Text style={styles.totalProfit}>{formatCurrency(totalProfit)}</Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          // Calculate the height percentage based on the profit value
          const heightPercentage = (item.profit / maxProfit) * 100;

          // Determine the bar color based on profit value
          const barColor =
            item.profit > 0
              ? colors.success
              : item.profit < 0
                ? colors.danger
                : colors.border;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text
                  style={[
                    styles.barValue,
                    item.profit > 0
                      ? styles.positiveValue
                      : item.profit < 0
                        ? styles.negativeValue
                        : {},
                  ]}
                >
                  {formatCurrency(item.profit)}
                </Text>
              </View>

              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercentage, 1)}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>

              <Text style={styles.monthLabel}>{MONTHS[item.month]}</Text>
            </View>
          );
        })}
      </View>
    </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  totalProfit: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  chartContainer: {
    flexDirection: "row",
    height: 200,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: theme.spacing.lg,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barLabelContainer: {
    position: "absolute",
    top: -20,
    width: "100%",
    alignItems: "center",
  },
  barValue: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.secondary,
    ...Platform.select({
      web: {
        transform: [{ rotate: "-45deg" }],
      },
      default: {},
    }),
  },
  positiveValue: {
    color: colors.success,
  },
  negativeValue: {
    color: colors.danger,
  },
  barWrapper: {
    width: "60%",
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: theme.borderRadius.sm,
    borderTopRightRadius: theme.borderRadius.sm,
  },
  monthLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});
