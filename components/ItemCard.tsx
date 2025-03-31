import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Item } from "@/types/inventory";
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
} from "lucide-react-native";
import { formatCurrency, formatDate } from "@/utils/helper";
import { colors, theme } from "@/constants/Colors";
import { getCategoryLabel } from "@/constants/Category";

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  compact?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  compact = false,
}) => {
  const statusIcon =
    item.status === "in" ? (
      <ArrowDownLeft size={18} color={colors.success} />
    ) : (
      <ArrowUpRight size={18} color={colors.accent} />
    );

  const profit =
    item.sellingPrice && item.purchasePrice
      ? item.sellingPrice - item.purchasePrice
      : null;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.container, styles.compactContainer]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              style={styles.compactImage}
            />
          ) : (
            <Package size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.stockInfo}>
            <Layers size={14} color={colors.text.secondary} />
            <Text style={styles.stockText}>{item.quantity} in stock</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>{statusIcon}</View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{item.code}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "in" ? styles.inBadge : styles.outBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.content}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Package size={32} color={colors.primary} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>

          <View style={styles.stockContainer}>
            <Layers size={16} color={colors.text.secondary} />
            <Text style={styles.stockValue}>{item.quantity} in stock</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Purchase:</Text>
            <Text style={styles.price}>
              {formatCurrency(item.purchasePrice)}
            </Text>
          </View>

          {item.sellingPrice && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Selling:</Text>
              <Text style={styles.price}>
                {formatCurrency(item.sellingPrice)}
              </Text>
            </View>
          )}

          {profit !== null && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Profit:</Text>
              <Text
                style={[styles.price, profit > 0 ? styles.profit : styles.loss]}
              >
                {formatCurrency(profit)}
              </Text>
            </View>
          )}
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
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  code: {
    fontWeight: "600",
    color: colors.text.primary,
    fontSize: 14,
  },
  date: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  inBadge: {
    backgroundColor: colors.success + "20", // 20% opacity
  },
  outBadge: {
    backgroundColor: colors.accent + "20", // 20% opacity
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.primary,
  },
  content: {
    flexDirection: "row",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.card,
  },
  compactImage: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  stockValue: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  price: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  compactContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  statusContainer: {
    marginLeft: theme.spacing.sm,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  stockText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
});
