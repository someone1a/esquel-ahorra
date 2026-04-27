import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
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
import { getPrimaryBarcode, Product } from "@/types/products";
import { Brand } from "@/utils/constants/brand";

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
            Código: {getPrimaryBarcode(item) ?? "Sin código"}
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
      <BrandHeader
        title="Buscar"
        subtitle="Encontrá el mejor precio en Esquel"
        right={
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push("/scanner")}
            activeOpacity={0.85}
          >
            <IconSymbol name="qrcode" size={22} color={Brand.colors.white} />
          </TouchableOpacity>
        }
      >
        <BrandSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Nombre o código de barras..."
          onSubmit={() => handleSearch()}
        />
      </BrandHeader>

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
            <ActivityIndicator size="small" color={Brand.colors.primary} />
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
    paddingHorizontal: 20,
    backgroundColor: Brand.colors.background,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
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
    color: Brand.colors.primary,
    fontSize: 14,
  },
  localsSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 20,
    color: "#000000",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: Brand.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
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
    flexDirection: "row",
    gap: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: Brand.colors.muted,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Brand.colors.primary,
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
    backgroundColor: Brand.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  localName: {
    fontSize: 16,
    color: Brand.colors.text,
  },
  localAddress: {
    fontSize: 14,
    color: Brand.colors.muted,
    marginTop: 4,
  },
  errorText: {
    color: Brand.colors.danger,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: Brand.colors.muted,
  },
  listContent: {
    paddingBottom: 20,
  },
});
