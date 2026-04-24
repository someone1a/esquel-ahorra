import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function HomeScreen() {
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: locals,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(0, 50),
  });

  const handleSearch = async () => {
    if (!barcodeSearch || barcodeSearch.length < 3) return;
    
    setIsSearching(true);
    Keyboard.dismiss();
    
    try {
      // Primera llamada: Intentar por código de barras
      let response;
      try {
        response = await productsService.searchProducts({ barcode: barcodeSearch });
      } catch {
        // Si falla la búsqueda por código, continuamos para intentar por nombre
        response = null;
      }

      // Segunda llamada: Si no se encontró nada por código de barras, intentar por nombre
      if (!response?.product && (!response?.products || response?.products.length === 0)) {
        response = await productsService.searchProducts({ name: barcodeSearch });
      }

      if (response.product) {
        router.push({
          pathname: "/product-detail",
          params: { productId: response.product.id },
        });
        setBarcodeSearch("");
      } else if (response.products && response.products.length > 0) {
        // Si hay varios resultados, mandamos a la pantalla de búsqueda con los resultados
        router.push({
          pathname: "/search",
          params: { q: barcodeSearch },
        });
      } else {
        alert("Producto no encontrado");
      }
    } catch (err: any) {
      if (err.message === "Product not found" || err.message.includes("404")) {
        alert("Producto no encontrado. ¿Quieres registrarlo?");
      } else {
        alert("Error al buscar producto: " + err.message);
      }
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Cargando información...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Esquel AHORRA
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Tu aliado para cuidar el bolsillo
        </ThemedText>
      </View>

      <View style={styles.quickSearchCard}>
        <View style={styles.cardHeader}>
          <IconSymbol name="barcode.viewfinder" size={24} color="#2563EB" />
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Consulta Rápida
          </ThemedText>
        </View>
        
        <ThemedText style={styles.cardDescription}>
          Ingresa el código de barras para ver los precios actuales.
        </ThemedText>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Nombre o código de barras..."
            value={barcodeSearch}
            onChangeText={setBarcodeSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={[styles.searchButton, isSearching && styles.buttonDisabled]} 
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="magnifyingglass" color="#FFFFFF" size={22} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.scanShortcut}
          onPress={() => router.push("/scanner")}
        >
          <IconSymbol name="qrcode" size={20} color="#2563EB" />
          <ThemedText style={styles.scanShortcutText}>Usar cámara para escanear</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.localsSection}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Supermercados
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <ThemedText style={styles.seeAllLink}>Ver todos</ThemedText>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={locals?.slice(0, 5)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.localCard}
              onPress={() => alert(`Local: ${item.nombre}\nPróximamente verás sus productos.`)}
            >
              <View style={styles.localInfo}>
                <ThemedText type="defaultSemiBold" style={styles.localName}>
                  {item.nombre}
                </ThemedText>
                <ThemedText style={styles.localAddress}>
                  {item.direccion}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              No hay locales disponibles.
            </ThemedText>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: "#2563EB",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    marginTop: 2,
  },
  quickSearchCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: "#111827",
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
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
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  scanShortcut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 5,
  },
  scanShortcutText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  localsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  localCard: {
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
  localInfo: {
    flex: 1,
  },
  localName: {
    fontSize: 16,
    color: "#111827",
  },
  localAddress: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
});
