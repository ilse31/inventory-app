import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Stack } from "expo-router";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { Item } from "@/types/inventory";
import { DollarSign, Save, Search, X } from "lucide-react-native";
import { useInventoryStore } from "@/stores/inventory-store";
import { colors, theme } from "@/constants/Colors";

export default function OutgoingScreen() {
  const { items, recordTransaction, getItemsByStatus } = useInventoryStore();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  // Get only items that are in stock
  useEffect(() => {
    const inStockItems = getItemsByStatus("in");
    if (searchQuery.trim() === "") {
      setFilteredItems(inStockItems);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        inStockItems.filter(
          (item) =>
            item.description.toLowerCase().includes(query) ||
            item.code.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query),
        ),
      );
    }
  }, [searchQuery, items, getItemsByStatus]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedItem) {
      newErrors.item = "Please select an item";
    }

    if (!sellingPrice.trim()) {
      newErrors.sellingPrice = "Selling price is required";
    } else if (isNaN(Number(sellingPrice)) || Number(sellingPrice) <= 0) {
      newErrors.sellingPrice = "Enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { invoiceId } = recordTransaction(
        "out",
        {
          id: selectedItem!.id,
          category: selectedItem!.category,
          description: selectedItem!.description,
          purchasePrice: selectedItem!.purchasePrice,
          sellingPrice: Number(sellingPrice),
          imageUri: selectedItem!.imageUri,
        },
        1, // Quantity
        notes,
      );

      // Reset form
      setSelectedItem(null);
      setSellingPrice("");
      setNotes("");
      setErrors({});

      Alert.alert(
        "Success",
        `Item has been marked as sold. Invoice #${invoiceId} created.`,
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error recording transaction:", error);
      Alert.alert("Error", "Failed to record outgoing item");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: Item) => {
    console.log("handleSelectItem called with item:", item); // Tambahkan log untuk debugging
    setSelectedItem(item);
    setModalVisible(false);

    // Pre-fill selling price with a suggested value (e.g., 20% markup)
    const suggestedPrice = (item.purchasePrice * 1.2).toFixed(2);
    setSellingPrice(suggestedPrice);
  };

  const renderItemInModal = ({ item }: { item: Item }) => {
    console.log("Rendering item in modal:", item); // Tambahkan log untuk debugging
    return (
      <Pressable
        onPress={() => {
          console.log("Item clicked:", item); // Tambahkan log untuk memastikan klik terdeteksi
          handleSelectItem(item);
        }}
      >
        <ItemCard item={item} compact />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Record Outgoing Item" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Outgoing Item Details</Text>

            <View style={styles.itemSelector}>
              <Text style={styles.label}>Select Item</Text>

              {selectedItem ? (
                <View style={styles.selectedItemContainer}>
                  <ItemCard item={selectedItem} compact />
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  title="Select Item from Inventory"
                  onPress={() => setModalVisible(true)}
                  variant="outline"
                  icon={<Search size={18} color={colors.primary} />}
                  fullWidth
                />
              )}

              {errors.item && (
                <Text style={styles.errorText}>{errors.item}</Text>
              )}
            </View>

            <FormInput
              label="Selling Price"
              value={sellingPrice}
              onChangeText={setSellingPrice}
              placeholder="0.00"
              keyboardType="numeric"
              error={errors.sellingPrice}
              leftIcon={<DollarSign size={16} color={colors.text.secondary} />}
            />

            {selectedItem && (
              <View style={styles.profitPreview}>
                <Text style={styles.profitLabel}>Profit Preview:</Text>
                <Text style={styles.profitValue}>
                  {selectedItem && sellingPrice
                    ? `$${(
                        Number(sellingPrice) - selectedItem.purchasePrice
                      ).toFixed(2)}`
                    : "$0.00"}
                </Text>
              </View>
            )}

            <FormInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>

          <Button
            title="Record Sale"
            onPress={handleSubmit}
            loading={loading}
            icon={<Save size={18} color={colors.text.light} />}
            fullWidth
            style={styles.submitButton}
            disabled={!selectedItem}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Item Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Item</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search items..."
            />

            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items in stock</Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                renderItem={renderItemInModal}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  formSection: {
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  itemSelector: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  selectedItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  changeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  changeButtonText: {
    color: colors.primary,
    fontWeight: "500",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  profitPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  profitLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  profitValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  modalList: {
    paddingBottom: theme.spacing.xl,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.xs,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
});
