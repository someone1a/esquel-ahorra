import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { Product } from "@/types/products";

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(q || "");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(!!q);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      // Primera llamada: Intentar por código de barras
      let response;
      try {
        response = await productsService.searchProducts({ barcode: query });
      } catch {
        // Si falla la búsqueda por código, continuamos para intentar por nombre
        response = null;
      }

      // Segunda llamada: Si no se encontró nada por código de barras, intentar por nombre
      if (!response?.product && (!response?.products || response?.products.length === 0)) {
        response = await productsService.searchProducts({ name: query });
      }
      
      return response;
    },
    onSuccess: (data) => {
      setHasSearched(true);
      if (data.product) {
        setSearchResults([data.product]);
      } else if (data.products) {
        setSearchResults(data.products);
      } else {
        setSearchResults([]);
      }
    },
    onError: () => {
      alert("Error al realizar la búsqueda");
    },
  });

  const handleSearch = useCallback((queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;
    Keyboard.dismiss();
    searchMutation.mutate(query.trim());
  }, [searchQuery, searchMutation]);

  useEffect(() => {
     if (q && !hasSearched) {
       handleSearch(q);
     }
   }, [q, handleSearch, hasSearched]);

  const {
    data: locals,
    isLoading: isLoadingLocals,
    error: errorLocals,
  } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(),
  });

  const renderProductItem = ({ item }: { item: Product }) => {
    const minPrice = item.prices && item.prices.length > 0 
      ? Math.min(...item.prices.map(p => p.precio))
      : null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          router.push({
            pathname: "/product-detail",
            params: { productId: item.id },
          })
        }
      >
        <View style={styles.productInfo}>
          <ThemedText type="defaultSemiBold" style={styles.productName}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={styles.productBarcode}>
            Código: {item.codigo_barra}
          </ThemedText>
        </View>
        <View style={styles.priceInfo}>
          {minPrice !== null ? (
            <>
              <ThemedText style={styles.priceLabel}>Desde</ThemedText>
              <ThemedText style={styles.priceValue}>
                ${minPrice.toLocaleString("es-AR")}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.noPrice}>Sin precio</ThemedText>
          )}
          <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Explorar
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nombre o código de barras..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch()}
        />
        <TouchableOpacity 
          style={[styles.searchButton, searchMutation.isPending && styles.buttonDisabled]} 
          onPress={() => handleSearch()}
          disabled={searchMutation.isPending}
        >
          {searchMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <IconSymbol name="magnifyingglass" color="#FFFFFF" size={24} />
          )}
        </TouchableOpacity>
      </View>

      {hasSearched ? (
        <View style={styles.resultsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Resultados</ThemedText>
            <TouchableOpacity onPress={() => {
              setHasSearched(false);
              setSearchQuery("");
              setSearchResults([]);
            }}>
              <ThemedText style={styles.clearLink}>Limpiar</ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No se encontraron productos para &quot;{searchQuery}&quot;.
              </ThemedText>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : (
        <View style={styles.localsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Locales en Esquel
          </ThemedText>

          {isLoadingLocals ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : errorLocals ? (
            <ThemedText style={styles.errorText}>Error al cargar locales</ThemedText>
          ) : (
            <FlatList
              data={locals}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.localCard}
                  onPress={() => {
                    router.push({
                      pathname: "/store",
                      params: { localId: item.id },
                    });
                  }}
                >
                  <View>
                    <ThemedText type="defaultSemiBold" style={styles.localName}>{item.nombre}</ThemedText>
                    <ThemedText style={styles.localAddress}>{item.direccion}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <ThemedText>No se encontraron locales.</ThemedText>
              }
            />
          )}
        </View>
      )}
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
    marginBottom: 20,
  },
  title: {
    color: "#2563EB",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  resultsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  clearLink: {
    color: "#2563EB",
    fontSize: 14,
  },
  localsSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 20,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
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
    flexDirection: "row",
    gap: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  noPrice: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  localCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  localName: {
    fontSize: 16,
    color: "#111827",
  },
  localAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  errorText: {
    color: "#EF4444",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 20,
  },
});
