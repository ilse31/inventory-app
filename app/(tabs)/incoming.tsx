import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack } from "expo-router";

import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ImagePicker } from "@/components/ImagePicker";
import { ItemCategory, Item } from "@/types/inventory";
import { Plus, Layers, Save } from "lucide-react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { useInventoryStore } from "@/stores/inventory-store";
import { colors, theme } from "@/constants/Colors";
import { formatDate } from "@/utils/helper";

export default function IncomingScreen() {
  const { recordTransaction, getItemsByStatus, getTotalStock } =
    useInventoryStore();

  const [formState, setFormState] = useState({
    description: "",
    category: "electronics" as ItemCategory,
    purchasePrice: "",
    quantity: "1",
    imageUri: undefined as string | undefined,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Get only incoming items
  const incomingItems = getItemsByStatus("in");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formState.purchasePrice.trim()) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (
      isNaN(Number(formState.purchasePrice)) ||
      Number(formState.purchasePrice) <= 0
    ) {
      newErrors.purchasePrice = "Enter a valid price";
    }

    if (!formState.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (
      isNaN(Number(formState.quantity)) ||
      Number(formState.quantity) <= 0 ||
      !Number.isInteger(Number(formState.quantity))
    ) {
      newErrors.quantity = "Enter a valid quantity (whole number)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      recordTransaction(
        "in",
        {
          category: formState.category,
          description: formState.description,
          purchasePrice: Number(formState.purchasePrice),
          quantity: Number(formState.quantity),
          imageUri: formState.imageUri,
        },
        formState.notes
      );

      // Reset form
      setFormState({
        description: "",
        category: "electronics",
        purchasePrice: "",
        quantity: "1",
        imageUri: undefined,
        notes: "",
      });
      setErrors({});
      setBottomSheetVisible(false);

      Alert.alert("Success", "Item has been added to inventory", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error recording transaction:", error);
      Alert.alert("Error", "Failed to add item to inventory");
    } finally {
      setLoading(false);
    }
  };

  const openBottomSheet = () => {
    // Reset form when opening
    setFormState({
      description: "",
      category: "electronics",
      purchasePrice: "",
      quantity: "1",
      imageUri: undefined,
      notes: "",
    });
    setErrors({});
    setBottomSheetVisible(true);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <ItemCard item={item} onPress={() => {}} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Incoming Items",
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={openBottomSheet}
            >
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{incomingItems.length}</Text>
            <Text style={styles.statLabel}>In Stock Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTotalStock()}</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {incomingItems.length > 0
                ? formatDate(
                    incomingItems[incomingItems.length - 1].createdAt,
                    "MMM dd"
                  )
                : "-"}
            </Text>
            <Text style={styles.statLabel}>Latest Entry</Text>
          </View>
        </View>

        {incomingItems.length === 0 ? (
          <EmptyState
            type='items'
            actionLabel='Add Item'
            onActionPress={openBottomSheet}
          />
        ) : (
          <FlatList
            data={incomingItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <Button
          title='Add Item'
          onPress={openBottomSheet}
          icon={<Plus size={20} color={colors.text.light} />}
          style={styles.fab}
        />
      </View>

      {/* Bottom Sheet Form */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        height='90%'
      >
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Add Incoming Item</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FormInput
            label='Description'
            value={formState.description}
            onChangeText={(text) =>
              setFormState((prev) => ({ ...prev, description: text }))
            }
            placeholder='Enter item description'
            error={errors.description}
          />

          <CategoryPicker
            label='Category'
            value={formState.category}
            onChange={(value) =>
              setFormState((prev) => ({ ...prev, category: value }))
            }
            error={errors.category}
          />

          <FormInput
            label='Purchase Price'
            value={formState.purchasePrice}
            onChangeText={(text) =>
              setFormState((prev) => ({ ...prev, purchasePrice: text }))
            }
            placeholder='0.00'
            keyboardType='numeric'
            error={errors.purchasePrice}
            leftIcon={<Text style={styles.currencySymbol}>Rp</Text>}
          />

          <FormInput
            label='Quantity'
            value={formState.quantity}
            onChangeText={(text) =>
              setFormState((prev) => ({ ...prev, quantity: text }))
            }
            placeholder='1'
            keyboardType='numeric'
            error={errors.quantity}
            leftIcon={<Layers size={16} color={colors.text.secondary} />}
          />

          <ImagePicker
            label='Item Image (Optional)'
            value={formState.imageUri}
            onChange={(uri) =>
              setFormState((prev) => ({ ...prev, imageUri: uri }))
            }
          />

          <FormInput
            label='Notes (Optional)'
            value={formState.notes}
            onChangeText={(text) =>
              setFormState((prev) => ({ ...prev, notes: text }))
            }
            placeholder='Add any additional notes'
            multiline
            numberOfLines={3}
            textAlignVertical='top'
            style={styles.notesInput}
          />

          <Button
            title='Save Item'
            onPress={handleSubmit}
            loading={loading}
            icon={<Save size={18} color={colors.text.light} />}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  fabContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  fab: {
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
  },
  addButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  bottomSheetHeader: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: theme.spacing.md,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginLeft: 4,
  },
});
