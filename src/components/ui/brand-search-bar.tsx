import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/utils/constants/brand";

type BrandSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit: () => void;
  onOpenScanner?: () => void;
};

export function BrandSearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  onOpenScanner,
}: BrandSearchBarProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Buscar productos..."}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      {onOpenScanner ? (
        <TouchableOpacity style={styles.iconButton} onPress={onOpenScanner} activeOpacity={0.85}>
          <IconSymbol name="qrcode" size={22} color={Brand.colors.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    color: Brand.colors.text,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.colors.background,
  },
});
