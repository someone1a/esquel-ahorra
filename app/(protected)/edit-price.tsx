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
import { BrandHeader } from "@/components/ui/brand-header";
import { productsService } from "@/services/products";
import { getPrimaryBarcode } from "@/types/products";
import { Brand } from "@/utils/constants/brand";

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
        <ActivityIndicator size="large" color={Brand.colors.primary} />
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
        <BrandHeader title="Nuevo producto" subtitle="Todavía no está registrado" onBack={() => router.back()} />
        <View style={styles.content}>
          <ThemedText style={styles.description}>
          El producto con código {barcode} no está registrado.
          </ThemedText>
          <ThemedText style={styles.info}>
          Funcionalidad de registro de nuevos productos próximamente.
          </ThemedText>
        </View>
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
      <BrandHeader title="¿Este precio es incorrecto?" subtitle="Ayudanos a mantener los precios actualizados" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

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
  productInfo: {
    backgroundColor: Brand.colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  productName: {
    color: Brand.colors.text,
    marginBottom: 5,
  },
  productBarcode: {
    color: Brand.colors.muted,
    marginBottom: 15,
  },
  pricesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.colors.text,
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
    color: Brand.colors.muted,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Brand.colors.primary,
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
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.background,
  },
  localOptionSelected: {
    backgroundColor: Brand.colors.primary,
    borderColor: Brand.colors.primary,
  },
  localOptionText: {
    fontSize: 14,
    color: Brand.colors.muted,
  },
  localOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 20,
    backgroundColor: Brand.colors.card,
  },
  updateButton: {
    backgroundColor: Brand.colors.primary,
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
    color: Brand.colors.danger,
    marginBottom: 10,
  },
  link: {
    color: Brand.colors.primary,
    textDecorationLine: "underline",
  },
  description: {
    fontSize: 16,
    color: Brand.colors.text,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: Brand.colors.muted,
    fontStyle: "italic",
  },
});
