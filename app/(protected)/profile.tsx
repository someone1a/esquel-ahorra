import { router } from "expo-router";
import React from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { useAuth } from "@/store/auth-context";
import { Brand } from "@/utils/constants/brand";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmed =
        typeof globalThis.confirm === "function"
          ? globalThis.confirm("¿Estás seguro de que quieres cerrar sesión?")
          : true;
      if (!confirmed) return;
      await logout();
      router.replace("/welcome");
      return;
    }

    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          if (Platform.OS !== "web") {
            router.replace("/welcome");
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ThemedView safeArea style={styles.container}>
        <ThemedText>Cargando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safeArea style={styles.container}>
      <BrandHeader title="Perfil" subtitle="Tu cuenta en Esquel Ahorra" />

      <View style={styles.infoContainer}>
        <ThemedText style={styles.label}>Nombre:</ThemedText>
        <ThemedText style={styles.value}>{user.name} {user.lastname}</ThemedText>

        <ThemedText style={styles.label}>Correo electrónico:</ThemedText>
        <ThemedText style={styles.value}>{user.email}</ThemedText>

        <ThemedText style={styles.label}>Rol:</ThemedText>
        <ThemedText style={styles.value}>{user.rol}</ThemedText>

        <ThemedText style={styles.label}>Puntos:</ThemedText>
        <ThemedText style={styles.value}>{user.points}</ThemedText>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  infoContainer: {
    backgroundColor: Brand.colors.card,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Brand.colors.text,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Brand.colors.muted,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: Brand.colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
