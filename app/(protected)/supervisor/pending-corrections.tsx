import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { useAuth } from "@/store/auth-context";
import { PriceCorrection } from "@/types/products";
import { Brand } from "@/utils/constants/brand";

export default function PendingCorrectionsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.rol?.toLowerCase();
  const canUseSupervisor = role === "supervisor" || role === "admin";

  const { data: corrections, isLoading, refetch } = useQuery({
    queryKey: ["pending-corrections"],
    queryFn: productsService.getPendingCorrections,
    enabled: canUseSupervisor,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => productsService.approveCorrection(id),
    onSuccess: () => {
      Alert.alert("Éxito", "Corrección aprobada correctamente");
      queryClient.invalidateQueries({ queryKey: ["pending-corrections"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo aprobar la corrección");
    },
  });

  if (!canUseSupervisor) {
    return <Redirect href="/" />;
  }

  const handleApprove = (id: number) => {
    Alert.alert(
      "Aprobar Corrección",
      "¿Estás seguro de que quieres aprobar este cambio de precio?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aprobar", onPress: () => approveMutation.mutate(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: PriceCorrection }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold">ID: {item.product_id}</ThemedText>
        <ThemedText style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </ThemedText>
      </View>

      <View style={styles.pricesRow}>
        <View style={styles.priceCol}>
          <ThemedText style={styles.priceLabel}>Precio Anterior</ThemedText>
          <ThemedText style={styles.oldPrice}>${item.old_price}</ThemedText>
        </View>
        <IconSymbol name="arrow.right" size={20} color="#9CA3AF" />
        <View style={styles.priceCol}>
          <ThemedText style={styles.priceLabel}>Precio Nuevo</ThemedText>
          <ThemedText style={styles.newPrice}>${item.new_price}</ThemedText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => handleApprove(item.id)}
        disabled={approveMutation.isPending}
      >
        <ThemedText style={styles.approveButtonText}>
          {approveMutation.isPending ? "Aprobando..." : "Aprobar Cambio"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView safeArea style={styles.container}>
      <BrandHeader title="Correcciones pendientes" subtitle="Revisá y aprobá cambios de precios" onBack={() => router.back()} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={corrections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <ThemedText style={{ color: Brand.colors.muted }}>No hay correcciones pendientes</ThemedText>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  list: {
    padding: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: Brand.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: Brand.colors.muted,
  },
  pricesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Brand.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  priceCol: {
    alignItems: "center",
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: Brand.colors.muted,
    marginBottom: 4,
  },
  oldPrice: {
    fontSize: 18,
    color: Brand.colors.danger,
    textDecorationLine: "line-through",
  },
  newPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
  approveButton: {
    backgroundColor: Brand.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color:"#000000",
    paddingTop: 50,
  },
});
