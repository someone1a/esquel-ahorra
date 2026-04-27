import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { getPrimaryBarcode, Product } from "@/types/products";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const colorScheme = useColorScheme() ?? "light";

  const minPrice = product.prices && product.prices.length > 0
    ? Math.min(...product.prices.map(p => p.precio))
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1F2937" },
      ]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {product.nombre}
        </ThemedText>
        <ThemedText style={styles.barcode}>
          Código: {getPrimaryBarcode(product) ?? "Sin código"}
        </ThemedText>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.priceLabel}>
            {minPrice !== null ? "Desde:" : "Precio:"}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.priceValue}>
            {minPrice !== null ? `$${minPrice.toLocaleString("es-AR")}` : "Sin registrar"}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    gap: 4,
  },
  name: {
    fontSize: 18,
    color: "#2563EB",
  },
  barcode: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#374151",
  },
  priceValue: {
    color: "#059669",
  },
});
