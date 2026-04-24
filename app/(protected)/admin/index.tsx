import { router, Redirect } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/store/auth-context";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Safety check for role
  if (user?.rol?.toLowerCase() !== "admin") {
    return <Redirect href="/" />;
  }

  const menuItems = [
    {
      title: "Invitar Supervisor",
      description: "Enviar invitación por email a un nuevo supervisor",
      icon: "person.badge.plus",
      route: "/admin/invite-supervisor",
      color: "#2563EB",
    },
    {
      title: "Gestionar Usuarios",
      description: "Ver y editar roles de usuarios",
      icon: "person.fill",
      route: "/admin/manage-users", // Placeholder for future feature
      color: "#10B981",
    },
  ];

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Panel de Administrador</ThemedText>
        <ThemedText style={styles.subtitle}>
          Control total de Esquel Ahorra
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
  },
  menuDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
});
