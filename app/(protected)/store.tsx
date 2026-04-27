import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { LocalProduct } from "@/types/products";

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
        <ActivityIndicator size="large" color="#2563EB" />
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#2563EB" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <ThemedText type="title" style={styles.title}>
            {localWithProducts?.nombre ?? `Local #${localIdNumber}`}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {localWithProducts?.direccion ?? "Esquel"} • {productsForLocal.length} productos
          </ThemedText>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ID..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <IconSymbol name="magnifyingglass" color="#FFFFFF" size={22} />
        </TouchableOpacity>
      </View>

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
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#000000",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  searchButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  listContent: {
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 16,
    color: "#111827",
  },
  productBarcode: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    color: "#059669",
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
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 10,
  },
  link: {
    color: "#2563EB",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});
