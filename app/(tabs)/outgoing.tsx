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
  TextInput,
} from "react-native";
import { Stack } from "expo-router";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { ItemCard } from "@/components/ItemCard";
import { SearchBar } from "@/components/SearchBar";
import { Item } from "@/types/inventory";
import {
  DollarSign,
  Save,
  Search,
  X,
  Layers,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
} from "lucide-react-native";
import { colors, theme } from "@/constants/Colors";
import { useInventoryStore } from "@/stores/inventory-store";
import { formatCurrency } from "@/utils/helper";

// Type for cart item
interface CartItem {
  item: Item;
  quantity: number;
  sellingPrice: number;
}

export default function OutgoingScreen() {
  const { items, recordMultipleTransactions, getItemsByStatus } =
    useInventoryStore();

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  // Current item being edited
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState("1");
  const [currentSellingPrice, setCurrentSellingPrice] = useState("");
  const [itemModalVisible, setItemModalVisible] = useState(false);

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
            item.category.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, items, getItemsByStatus]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (cart.length === 0) {
      newErrors.cart = "Please add at least one item to the cart";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare transaction items
      const transactionItems = cart.map((cartItem) => ({
        id: cartItem.item.id,
        category: cartItem.item.category,
        description: cartItem.item.description,
        purchasePrice: cartItem.item.purchasePrice,
        sellingPrice: cartItem.sellingPrice,
        imageUri: cartItem.item.imageUri,
        quantity: cartItem.quantity,
      }));

      const { invoiceId } = recordMultipleTransactions(transactionItems, notes);

      // Reset form
      setCart([]);
      setNotes("");
      setErrors({});

      Alert.alert(
        "Success",
        `Items have been marked as sold. Invoice #${invoiceId} created.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error recording transaction:", error);
      Alert.alert("Error", "Failed to record outgoing items");
    } finally {
      setLoading(false);
    }
  };

  const openItemModal = (item: Item) => {
    setCurrentItem(item);

    // Check if item is already in cart
    const existingCartItem = cart.find(
      (cartItem) => cartItem.item.id === item.id
    );

    if (existingCartItem) {
      setCurrentQuantity(existingCartItem.quantity.toString());
      setCurrentSellingPrice(existingCartItem.sellingPrice.toString());
    } else {
      setCurrentQuantity("1");
      // Pre-fill selling price with a suggested value (e.g., 20% markup)
      const suggestedPrice = (item.purchasePrice * 1.2).toFixed(2);
      setCurrentSellingPrice(suggestedPrice);
    }

    setItemModalVisible(true);
    setModalVisible(false);
  };

  const addToCart = () => {
    if (!currentItem) return;

    // Validate inputs
    if (
      !currentSellingPrice.trim() ||
      isNaN(Number(currentSellingPrice)) ||
      Number(currentSellingPrice) <= 0
    ) {
      Alert.alert("Invalid Price", "Please enter a valid selling price");
      return;
    }

    if (
      !currentQuantity.trim() ||
      isNaN(Number(currentQuantity)) ||
      Number(currentQuantity) <= 0 ||
      !Number.isInteger(Number(currentQuantity))
    ) {
      Alert.alert(
        "Invalid Quantity",
        "Please enter a valid quantity (whole number)"
      );
      return;
    }

    if (Number(currentQuantity) > (currentItem.quantity || 0)) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${currentItem.quantity} available in stock`
      );
      return;
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.item.id === currentItem.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        item: currentItem,
        quantity: Number(currentQuantity),
        sellingPrice: Number(currentSellingPrice),
      };
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([
        ...cart,
        {
          item: currentItem,
          quantity: Number(currentQuantity),
          sellingPrice: Number(currentSellingPrice),
        },
      ]);
    }

    setItemModalVisible(false);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId));
  };

  const calculateTotalProfit = () => {
    return cart.reduce((total, cartItem) => {
      const itemProfit =
        (cartItem.sellingPrice - cartItem.item.purchasePrice) *
        cartItem.quantity;
      return total + itemProfit;
    }, 0);
  };

  const calculateTotalAmount = () => {
    return cart.reduce((total, cartItem) => {
      return total + cartItem.sellingPrice * cartItem.quantity;
    }, 0);
  };

  const renderItemInModal = ({ item }: { item: Item }) => (
    <View onTouchStart={() => openItemModal(item)}>
      <ItemCard item={item} compact />
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemContent}>
        <View style={styles.cartItemHeader}>
          <Text style={styles.cartItemTitle} numberOfLines={1}>
            {item.item.description}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromCart(item.item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.cartItemDetails}>
          <View style={styles.cartItemDetail}>
            <Text style={styles.cartItemLabel}>Quantity:</Text>
            <Text style={styles.cartItemValue}>{item.quantity}</Text>
          </View>

          <View style={styles.cartItemDetail}>
            <Text style={styles.cartItemLabel}>Price:</Text>
            <Text style={styles.cartItemValue}>
              {formatCurrency(item.sellingPrice)}
            </Text>
          </View>

          <View style={styles.cartItemDetail}>
            <Text style={styles.cartItemLabel}>Subtotal:</Text>
            <Text style={styles.cartItemValue}>
              {formatCurrency(item.sellingPrice * item.quantity)}
            </Text>
          </View>

          <View style={styles.cartItemDetail}>
            <Text style={styles.cartItemLabel}>Profit:</Text>
            <Text style={[styles.cartItemValue, styles.profitText]}>
              {formatCurrency(
                (item.sellingPrice - item.item.purchasePrice) * item.quantity
              )}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openItemModal(item.item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Record Outgoing Items" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Outgoing Items</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
              >
                <ShoppingCart size={16} color={colors.text.light} />
                <Text style={styles.addButtonText}>Add Items</Text>
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <ShoppingCart size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Add items to record a sale
                </Text>
                <Button
                  title='Add Items'
                  onPress={() => setModalVisible(true)}
                  variant='outline'
                  style={styles.emptyCartButton}
                />
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.cartItemSeparator} />
                  )}
                />

                <View style={styles.cartSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Items:</Text>
                    <Text style={styles.summaryValue}>{cart.length}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Quantity:</Text>
                    <Text style={styles.summaryValue}>
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(calculateTotalAmount())}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Profit:</Text>
                    <Text style={[styles.summaryValue, styles.profitText]}>
                      {formatCurrency(calculateTotalProfit())}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {errors.cart && <Text style={styles.errorText}>{errors.cart}</Text>}

            <FormInput
              label='Notes (Optional)'
              value={notes}
              onChangeText={setNotes}
              placeholder='Add any additional notes'
              multiline
              numberOfLines={3}
              textAlignVertical='top'
              style={styles.notesInput}
            />
          </View>

          <Button
            title='Record Sale'
            onPress={handleSubmit}
            loading={loading}
            icon={<Save size={18} color={colors.text.light} />}
            fullWidth
            style={styles.submitButton}
            disabled={cart.length === 0}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Item Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType='slide'
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
              placeholder='Search items...'
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

      {/* Item Detail Modal */}
      <Modal
        visible={itemModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Item Details</Text>
              <TouchableOpacity
                onPress={() => setItemModalVisible(false)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {currentItem && (
              <View style={styles.itemDetailContent}>
                <ItemCard item={currentItem} />

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const newQuantity = Math.max(
                          1,
                          Number(currentQuantity) - 1
                        );
                        setCurrentQuantity(newQuantity.toString());
                      }}
                    >
                      <Minus size={16} color={colors.text.primary} />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.quantityInput}
                      value={currentQuantity}
                      onChangeText={setCurrentQuantity}
                      keyboardType='numeric'
                    />

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const newQuantity = Math.min(
                          currentItem.quantity || 0,
                          Number(currentQuantity) + 1
                        );
                        setCurrentQuantity(newQuantity.toString());
                      }}
                    >
                      <Plus size={16} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.stockInfo}>
                  Available in stock:{" "}
                  <Text style={styles.stockCount}>{currentItem.quantity}</Text>
                </Text>

                <FormInput
                  label='Selling Price'
                  value={currentSellingPrice}
                  onChangeText={setCurrentSellingPrice}
                  placeholder='0.00'
                  keyboardType='numeric'
                  leftIcon={<Text style={styles.currencySymbol}>Rp</Text>}
                />

                <View style={styles.profitPreview}>
                  <Text style={styles.profitLabel}>Profit Preview:</Text>
                  <Text style={styles.profitValue}>
                    {currentSellingPrice && currentQuantity
                      ? formatCurrency(
                          (Number(currentSellingPrice) -
                            currentItem.purchasePrice) *
                            Number(currentQuantity)
                        )
                      : formatCurrency(0)}
                  </Text>
                </View>

                <Button
                  title='Add to Cart'
                  onPress={addToCart}
                  icon={<ShoppingCart size={18} color={colors.text.light} />}
                  fullWidth
                  style={styles.addToCartButton}
                />
              </View>
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
    backgroundColor: colors.background,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: colors.text.light,
    fontWeight: "500",
    marginLeft: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginLeft: 4,
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  emptyCartButton: {
    marginTop: theme.spacing.md,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  cartItemContent: {
    flex: 1,
  },
  cartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    flex: 1,
  },
  cartItemDetails: {
    gap: 2,
  },
  cartItemDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartItemLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cartItemValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  profitText: {
    color: colors.success,
  },
  editButton: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: colors.primary + "20",
    borderRadius: theme.borderRadius.sm,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: "500",
  },
  cartItemSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: theme.spacing.sm,
  },
  cartSummary: {
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    marginTop: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
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
  itemDetailContent: {
    padding: theme.spacing.xs,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: theme.spacing.md,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityInput: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.sm,
    textAlign: "center",
    marginHorizontal: theme.spacing.xs,
    fontSize: 16,
    color: colors.text.primary,
  },
  stockInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  stockCount: {
    fontWeight: "600",
    color: colors.primary,
  },
  profitPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
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
  addToCartButton: {
    marginTop: theme.spacing.md,
  },
  TextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
});
