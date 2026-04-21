import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, Redirect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { LocalCreate } from "@/types/products";
import { useAuth } from "@/store/auth-context";

export default function CreateLocalScreen() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  
  const queryClient = useQueryClient();

  if (user?.rol?.toLowerCase() !== "supervisor") {
    return <Redirect href="/" />;
  }

  const createMutation = useMutation({
    mutationFn: (data: LocalCreate) => productsService.createLocal(data),
    onSuccess: () => {
      Alert.alert("Éxito", "Local creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["locals"] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo crear el local");
    },
  });

  const handleCreate = () => {
    if (!nombre || !direccion) {
      Alert.alert("Error", "Por favor completa el nombre y la dirección");
      return;
    }

    const data: LocalCreate = {
      nombre,
      direccion,
      telefono: telefono || null,
    };

    createMutation.mutate(data);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText type="subtitle">Nuevo Supermercado</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nombre del Local *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: La Anónima - Centro"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Dirección *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Alvear 123"
            value={direccion}
            onChangeText={setDireccion}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Teléfono (Opcional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2945 451234"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, createMutation.isPending && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={createMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {createMutation.isPending ? "Creando..." : "Crear Local"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
