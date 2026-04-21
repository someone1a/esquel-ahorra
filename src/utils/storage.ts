import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting item in localStorage:", error);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("Error getting item from localStorage:", error);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing item from localStorage:", error);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
