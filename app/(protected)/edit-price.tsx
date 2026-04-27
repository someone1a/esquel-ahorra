import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { getPrimaryBarcode } from "@/types/products";

export default function EditPriceScreen() {
  const { productId, barcode } = useLocalSearchParams<{ productId?: string; barcode?: string }>();
  const queryClient = useQueryClient();
  const [newPrice, setNewPrice] = useState("");
  const [selectedLocalId, setSelectedLocalId] = useState<number | null>(null);

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => (productId ? productsService.getProduct(Number(productId)) : null),
    enabled: !!productId,
  });

  const {
    data: locals,
    isLoading: isLoadingLocals,
  } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(0, 100),
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, price, localId }: { id: number; price: number; localId: number }) =>
      productsService.updatePrice(id, price, localId),
    onSuccess: () => {
      Alert.alert("Éxito", "Precio actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "No se pudo actualizar el precio");
    },
  });

  useEffect(() => {
    if (product && product.prices && product.prices.length > 0) {
      // Por defecto sugerimos el primer precio que encontremos
      setNewPrice(product.prices[0].precio.toString());
      setSelectedLocalId(product.prices[0].local_id);
    } else if (locals && locals.length > 0) {
      setSelectedLocalId(locals[0].id);
    }
  }, [product, locals]);

  const handleUpdate = () => {
    if (!product || !newPrice || selectedLocalId === null) {
      Alert.alert("Error", "Asegúrate de seleccionar un local e ingresar un precio");
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum)) {
      Alert.alert("Error", "Ingresa un precio válido");
      return;
    }
    updatePriceMutation.mutate({ id: product.id, price: priceNum, localId: selectedLocalId });
  };

  const isLoading = isLoadingProduct || isLoadingLocals;

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </ThemedView>
    );
  }

  if (productError || (!product && productId)) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ThemedText style={styles.errorText}>Error al cargar el producto</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.link}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!product && barcode) {
    return (
      <ThemedView safeArea style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#2563EB" />
          </TouchableOpacity>
          <ThemedText type="title">Nuevo Producto</ThemedText>
        </View>
        <ThemedText style={styles.description}>
          El producto con código {barcode} no está registrado.
        </ThemedText>
        <ThemedText style={styles.info}>
          Funcionalidad de registro de nuevos productos próximamente.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView safeArea style={styles.center}>
        <ThemedText>Selecciona un producto para editar su precio.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safeArea style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#2563EB" />
          </TouchableOpacity>
          <ThemedText type="title">¿Este precio es incorrecto?</ThemedText>
        </View>

        <View style={styles.productInfo}>
          <ThemedText type="subtitle" style={styles.productName}>
            {product.nombre}
          </ThemedText>
          <ThemedText style={styles.productBarcode}>
            Código: {getPrimaryBarcode(product) ?? "Sin código"}
          </ThemedText>
          
          <ThemedText style={styles.pricesTitle}>Precios actuales:</ThemedText>
          {product.prices && product.prices.length > 0 ? (
            product.prices.map((p) => {
              const local = locals?.find(l => l.id === p.local_id);
              return (
                <View key={p.id} style={styles.priceItem}>
                  <ThemedText style={styles.localName}>
                    {local?.nombre || `Local #${p.local_id}`}:
                  </ThemedText>
                  <ThemedText style={styles.priceValue}>
                    ${p.precio.toLocaleString("es-AR")}
                  </ThemedText>
                </View>
              );
            })
          ) : (
            <ThemedText style={styles.noPrices}>Sin precios registrados</ThemedText>
          )}
        </View>

        <View style={styles.form}>
          <ThemedText style={styles.label}>¿En qué local lo viste?</ThemedText>
          <View style={styles.localsList}>
            {locals?.map((local) => (
              <TouchableOpacity
                key={local.id}
                style={[
                  styles.localOption,
                  selectedLocalId === local.id && styles.localOptionSelected,
                ]}
                onPress={() => setSelectedLocalId(local.id)}
              >
                <ThemedText
                  style={[
                    styles.localOptionText,
                    selectedLocalId === local.id && styles.localOptionTextSelected,
                  ]}
                >
                  {local.nombre}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.label}>Nuevo Precio:</ThemedText>
          <TextInput
            style={styles.input}
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <TouchableOpacity
            style={[
              styles.updateButton,
              (updatePriceMutation.isPending || selectedLocalId === null) && styles.buttonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={updatePriceMutation.isPending || selectedLocalId === null}
          >
            <ThemedText style={styles.updateButtonText}>
              {updatePriceMutation.isPending ? "Actualizando..." : "Ayúdanos corrigiéndolo"}
            </ThemedText>
          </TouchableOpacity>
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
  productInfo: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productName: {
    color: "#111827",
    marginBottom: 5,
  },
  productBarcode: {
    color: "#6B7280",
    marginBottom: 15,
  },
  pricesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  localName: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
  },
  noPrices: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  form: {
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  localsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 5,
  },
  localOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  localOptionSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  localOptionText: {
    fontSize: 14,
    color: "#4B5563",
  },
  localOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 15,
    fontSize: 20,
    backgroundColor: "#FFFFFF",
  },
  updateButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
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
  description: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
