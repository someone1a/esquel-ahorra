import { Redirect, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/store/auth-context";

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
      color: "#2563EB",
    },
    {
      title: "Crear Local",
      description: "Agregar un nuevo supermercado",
      icon: "mappin.and.ellipse",
      route: "/supervisor/create-local",
      color: "#10B981",
    },
    {
      title: "Crear Producto",
      description: "Agregar un nuevo producto al sistema",
      icon: "plus.circle.fill",
      route: "/supervisor/create-product",
      color: "#F59E0B",
    },
  ];

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Panel de Supervisor</ThemedText>
        <ThemedText style={styles.subtitle}>
          Gestiona los datos de Esquel Ahorra
        </ThemedText>
      </View>

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
    paddingTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    color: "#000000",
  },
  menuDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
});
