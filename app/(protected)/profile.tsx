import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/store/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/welcome");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cargando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Perfil</ThemedText>

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
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#2563EB",
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
