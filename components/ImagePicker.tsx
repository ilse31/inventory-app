import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { colors, theme } from "@/constants/Colors";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";

interface ImagePickerProps {
  value?: string;
  onChange: (uri?: string) => void;
  label: string;
  error?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!",
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "This feature is not available on web");
      return;
    }

    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is needed to take photos",
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    onChange(undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: value }} style={styles.image} />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearImage}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={colors.text.light} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={pickImage}
            disabled={loading}
          >
            <ImageIcon size={24} color={colors.primary} />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          {Platform.OS !== "web" && (
            <TouchableOpacity
              style={styles.button}
              onPress={takePhoto}
              disabled={loading}
            >
              <Camera size={24} color={colors.primary} />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    borderStyle: "dashed",
    padding: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  buttonText: {
    marginTop: theme.spacing.xs,
    color: colors.text.secondary,
    fontSize: 14,
  },
  imageContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
  },
  clearButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.small,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
});
