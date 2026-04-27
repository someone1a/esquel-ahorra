import { Redirect, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/store/auth-context";
import { Brand } from "@/utils/constants/brand";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  
  const role = user?.rol?.toLowerCase();
  const canUseSupervisor = role === "supervisor" || role === "admin";

  if (!canUseSupervisor) {
    return <Redirect href="/" />;
  }

  const menuItems = [
    {
      title: "Correcciones Pendientes",
      description: "Revisar y aprobar cambios de precios",
      icon: "checkmark.shield.fill",
      route: "/supervisor/pending-corrections",
      color: Brand.colors.primary,
    },
    {
      title: "Crear Local",
      description: "Agregar un nuevo supermercado",
      icon: "mappin.and.ellipse",
      route: "/supervisor/create-local",
      color: Brand.colors.primary,
    },
    {
      title: "Crear Producto",
      description: "Agregar un nuevo producto al sistema",
      icon: "plus.circle.fill",
      route: "/supervisor/create-product",
      color: Brand.colors.primary,
    },
  ];

  return (
    <ThemedView safeArea style={styles.container}>
      <BrandHeader title="Panel de supervisor" subtitle="Gestiona los datos de Esquel Ahorra" />

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
              <IconSymbol name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.menuText}>
              <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.menuDescription}>
                {item.description}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.colors.muted,
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    marginBottom: 2,
    color: Brand.colors.text,
  },
  menuDescription: {
    fontSize: 13,
    color: Brand.colors.muted,
  },
});
