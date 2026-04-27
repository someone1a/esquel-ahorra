import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { BrandSearchBar } from "@/components/ui/brand-search-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { LocalProduct } from "@/types/products";
import { Brand } from "@/utils/constants/brand";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function StoreScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const localIdNumber = localId ? Number(localId) : NaN;

  const [query, setQuery] = useState("");

  const {
    data: localWithProducts,
    isLoading,
    isRefetching,
    refetch,
    error: productsError,
  } = useQuery({
    queryKey: ["local-with-products", localIdNumber],
    queryFn: () => productsService.getLocalWithProducts(localIdNumber),
    enabled: Number.isFinite(localIdNumber),
  });

  const productsForLocal = useMemo(() => {
    if (!Number.isFinite(localIdNumber)) return [];
    const q = normalize(query);

    return (localWithProducts?.productos ?? [])
      .filter((p) => {
        if (!q) return true;
        return (
          normalize(p.nombre).includes(q) ||
          p.id.toString().includes(q)
        );
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [localIdNumber, localWithProducts?.productos, query]);

  const renderProductItem = ({ item }: { item: LocalProduct }) => {
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          router.push({
            pathname: "/product-detail",
            params: { productId: item.id },
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.productInfo}>
          <ThemedText type="defaultSemiBold" style={styles.productName}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={styles.productBarcode}>
            ID: {item.id}
          </ThemedText>
        </View>

        <View style={styles.priceInfo}>
          <ThemedText style={styles.priceLabel}>Precio</ThemedText>
          <ThemedText style={styles.priceValue}>${item.precio.toLocaleString("es-AR")}</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (!Number.isFinite(localIdNumber)) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ThemedText style={styles.errorText}>Local inválido</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.link}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <ThemedText style={styles.loadingText}>Cargando productos...</ThemedText>
      </ThemedView>
    );
  }

  if (productsError) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ThemedText style={styles.errorText}>Error al cargar productos</ThemedText>
        <TouchableOpacity onPress={() => refetch()}>
          <ThemedText style={styles.link}>Reintentar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView safeArea style={styles.container}>
      <BrandHeader
        title={localWithProducts?.nombre ?? `Local #${localIdNumber}`}
        subtitle={`${localWithProducts?.direccion ?? "Esquel"} • ${productsForLocal.length} productos`}
        onBack={() => router.back()}
      >
        <BrandSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre o ID..."
          onSubmit={() => Keyboard.dismiss()}
        />
      </BrandHeader>

      <FlatList
        data={productsForLocal}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            No se encontraron productos para este local.
          </ThemedText>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Brand.colors.background,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Brand.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 16,
    color: Brand.colors.text,
  },
  productBarcode: {
    fontSize: 13,
    color: Brand.colors.muted,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: Brand.colors.muted,
  },
  priceValue: {
    fontSize: 16,
    color: Brand.colors.primary,
    fontWeight: "700",
  },
  noPrice: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Brand.colors.background,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: Brand.colors.muted,
    textAlign: "center",
  },
  errorText: {
    color: Brand.colors.danger,
    textAlign: "center",
    marginBottom: 10,
  },
  link: {
    color: Brand.colors.primary,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: Brand.colors.muted,
  },
});
