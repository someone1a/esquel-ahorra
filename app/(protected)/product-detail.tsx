import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { useShoppingList } from "@/store/shopping-list-context";
import { getPrimaryBarcode, Price } from "@/types/products";

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { addItem, isInList, removeItem } = useShoppingList();

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.getProduct(Number(productId)),
    enabled: !!productId,
  });

  const {
    data: locals,
    isLoading: isLoadingLocals,
  } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(0, 100),
  });

  const isLoading = isLoadingProduct || isLoadingLocals;

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </ThemedView>
    );
  }

  if (productError || !product) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>Error al cargar el producto</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.link}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Ordenar precios de menor a mayor
  const sortedPrices = product.prices
    ? [...product.prices].sort((a, b) => a.precio - b.precio)
    : [];

  const handleToggleListItem = (price: Price) => {
    if (isInList(product.id, price.local_id)) {
      removeItem(product.id, price.local_id);
    } else {
      addItem(product, price);
    }
  };

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#2563EB" />
        </TouchableOpacity>
        <ThemedText type="title">Detalle del Producto</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productMainInfo}>
          <ThemedText type="subtitle" style={styles.productName}>
            {product.nombre}
          </ThemedText>
          <ThemedText style={styles.productBarcode}>
            Código: {getPrimaryBarcode(product) ?? "Sin código"}
          </ThemedText>
        </View>

        <View style={styles.pricesSection}>
          <ThemedText style={styles.sectionTitle}>Comparativa de Precios</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Ordenado de menor a mayor</ThemedText>

          {sortedPrices.length > 0 ? (
            sortedPrices.map((price, index) => {
              const local = locals?.find((l) => l.id === price.local_id);
              const inList = isInList(product.id, price.local_id);
              
              return (
                <View 
                  key={price.id} 
                  style={[
                    styles.priceCard,
                    index === 0 && styles.bestPriceCard
                  ]}
                >
                  <View style={styles.priceCardHeader}>
                    <View style={styles.localInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.localName}>
                        {local?.nombre || `Local #${price.local_id}`}
                      </ThemedText>
                      <ThemedText style={styles.localAddress}>
                        {local?.direccion || "Esquel"}
                      </ThemedText>
                    </View>
                    <View style={styles.priceInfo}>
                      <ThemedText style={styles.priceValue}>
                        ${price.precio.toLocaleString("es-AR")}
                      </ThemedText>
                      {index === 0 && (
                        <View style={styles.bestPriceBadge}>
                          <ThemedText style={styles.bestPriceText}>El más barato</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.priceCardActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        inList ? styles.removeButton : styles.addButton
                      ]}
                      onPress={() => handleToggleListItem(price)}
                    >
                      <IconSymbol 
                        name={inList ? "cart.fill.badge.minus" : "cart.badge.plus"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <ThemedText style={styles.actionButtonText}>
                        {inList ? "Quitar de la lista" : "Agregar a la lista"}
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push({
                          pathname: "/edit-price",
                          params: { productId: product.id },
                        })
                      }
                    >
                      <IconSymbol name="pencil" size={18} color="#2563EB" />
                      <ThemedText style={styles.editButtonText}>Corregir</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No hay precios registrados para este producto.</ThemedText>
              <TouchableOpacity
                style={styles.firstPriceButton}
                onPress={() =>
                  router.push({
                    pathname: "/edit-price",
                    params: { productId: product.id },
                  })
                }
              >
                <ThemedText style={styles.firstPriceButtonText}>Agregar primer precio</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  productMainInfo: {
    marginBottom: 25,
  },
  productName: {
    fontSize: 24,
    color: "#ffffff",
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 14,
    color: "#6B7280",
  },
  pricesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 15,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bestPriceCard: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
  },
  priceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  localInfo: {
    flex: 1,
  },
  localName: {
    fontSize: 16,
    color: "#111827",
  },
  localAddress: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
  },
  bestPriceBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  bestPriceText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  priceCardActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButton: {
    backgroundColor: "#2563EB",
  },
  removeButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    gap: 6,
  },
  editButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 10,
  },
  link: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 15,
  },
  firstPriceButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  firstPriceButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
