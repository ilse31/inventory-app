import { ItemCategory } from "@/types/inventory";

export const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food & Beverages" },
  { value: "office", label: "Office Supplies" },
  { value: "other", label: "Other" },
];

export const getCategoryLabel = (category: ItemCategory): string => {
  return CATEGORIES.find((c) => c.value === category)?.label || "Unknown";
};
