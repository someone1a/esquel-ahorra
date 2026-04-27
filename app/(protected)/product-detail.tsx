import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { useShoppingList } from "@/store/shopping-list-context";
import { getPrimaryBarcode, Price } from "@/types/products";
import { Brand } from "@/utils/constants/brand";
import { storage } from "@/utils/storage";

const FEATURED_PRODUCT_KEY = "home.featuredProductId";

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

  useEffect(() => {
    const id = product ? String(product.id) : null;
    if (!id) return;
    storage.setItem(FEATURED_PRODUCT_KEY, id);
  }, [product]);

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
        <ActivityIndicator size="large" color={Brand.colors.primary} />
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
      <BrandHeader
        title="Compará precios"
        subtitle="Mismo producto, diferentes precios"
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.productMainInfo}>
          <ThemedText type="subtitle" style={styles.productName}>
            {product.nombre}
          </ThemedText>
          <ThemedText style={styles.productBarcode}>
            Código: {getPrimaryBarcode(product) ?? "Sin código"}
          </ThemedText>
        </View>

        <View style={styles.pricesSection}>
          <ThemedText style={styles.sectionTitle}>Comparativa de precios</ThemedText>
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
                      <IconSymbol name="pencil" size={18} color={Brand.colors.primary} />
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
        <View style={{ height: 24 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  productMainInfo: {
    marginBottom: 25,
  },
  productName: {
    fontSize: 24,
    color: Brand.colors.text,
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 14,
    color: Brand.colors.muted,
  },
  pricesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Brand.colors.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Brand.colors.muted,
    marginBottom: 15,
  },
  priceCard: {
    backgroundColor: Brand.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bestPriceCard: {
    borderColor: Brand.colors.primary,
    borderWidth: 2,
    backgroundColor: `${Brand.colors.primary}14`,
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
    color: Brand.colors.text,
  },
  localAddress: {
    fontSize: 12,
    color: Brand.colors.muted,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
  bestPriceBadge: {
    backgroundColor: Brand.colors.primary,
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
    backgroundColor: Brand.colors.primary,
  },
  removeButton: {
    backgroundColor: Brand.colors.danger,
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
    borderColor: Brand.colors.primary,
    gap: 6,
  },
  editButtonText: {
    color: Brand.colors.primary,
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
    color: Brand.colors.danger,
    marginBottom: 10,
  },
  link: {
    color: Brand.colors.primary,
    textDecorationLine: "underline",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: Brand.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderStyle: "dashed",
  },
  emptyText: {
    color: Brand.colors.muted,
    textAlign: "center",
    marginBottom: 15,
  },
  firstPriceButton: {
    backgroundColor: Brand.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  firstPriceButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
