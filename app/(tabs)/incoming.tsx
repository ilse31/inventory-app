import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from "react-native";
import { Stack } from "expo-router";

import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ImagePicker } from "@/components/ImagePicker";
import { ItemCategory } from "@/types/inventory";
import { DollarSign, Save } from "lucide-react-native";
import { colors, theme } from "@/constants/Colors";
import { useInventoryStore } from "@/stores/inventory-store";

export default function IncomingScreen() {
  const { recordTransaction } = useInventoryStore();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("electronics");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!purchasePrice.trim()) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0) {
      newErrors.purchasePrice = "Enter a valid price";
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
          category,
          description,
          purchasePrice: Number(purchasePrice),
          // imageUri,
        },
        1, // Quantity
        notes,
      );

      // Reset form
      setDescription("");
      setCategory("electronics");
      setPurchasePrice("");
      setImageUri(undefined);
      setNotes("");
      setErrors({});

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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Add Incoming Item" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Item Details</Text>

            <FormInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter item description"
              error={errors.description}
            />

            <CategoryPicker
              label="Category"
              value={category}
              onChange={setCategory}
              error={errors.category}
            />

            <FormInput
              label="Purchase Price"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              placeholder="0.00"
              keyboardType="numeric"
              error={errors.purchasePrice}
              leftIcon={<DollarSign size={16} color={colors.text.secondary} />}
            />

            {/* <ImagePicker
              label='Item Image (Optional)'
              value={imageUri}
              onChange={setImageUri}
              error={errors.imageUri}
            /> */}

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
            title="Save Item"
            onPress={handleSubmit}
            loading={loading}
            icon={<Save size={18} color={colors.text.light} />}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
