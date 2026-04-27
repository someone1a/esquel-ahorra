import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
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
import { BrandHeader } from "@/components/ui/brand-header";
import { productsService } from "@/services/products";
import { useAuth } from "@/store/auth-context";
import { LocalCreate } from "@/types/products";
import { Brand } from "@/utils/constants/brand";

export default function CreateLocalScreen() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  
  const queryClient = useQueryClient();
  const role = user?.rol?.toLowerCase();
  const canUseSupervisor = role === "supervisor" || role === "admin";

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

  if (!canUseSupervisor) {
    return <Redirect href="/" />;
  }

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
    <ThemedView safeArea style={styles.container}>
      <BrandHeader title="Nuevo supermercado" subtitle="Agregá un local para comparar precios" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
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
    backgroundColor: Brand.colors.background,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: Brand.colors.text,
  },
  input: {
    backgroundColor: Brand.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    fontSize: 16,
    color: Brand.colors.text,
  },
  button: {
    backgroundColor: Brand.colors.primary,
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
