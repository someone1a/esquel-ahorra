import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
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
import { useAuth } from "@/store/auth-context";
import { ProductCreate } from "@/types/products";

export default function CreateProductScreen() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [codigoBarra, setCodigoBarra] = useState("");
  const [precio, setPrecio] = useState("");
  const [localId, setLocalId] = useState<number | null>(null);
  const role = user?.rol?.toLowerCase();
  const canUseSupervisor = role === "supervisor" || role === "admin";
  
  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const queryClient = useQueryClient();

  const { data: locals, isLoading: isLoadingLocals } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(),
    enabled: canUseSupervisor,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductCreate) => productsService.createProduct(data),
    onSuccess: () => {
      Alert.alert("Éxito", "Producto creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo crear el producto");
    },
  });

  if (!canUseSupervisor) {
    return <Redirect href="/" />;
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setCodigoBarra(data);
    setShowScanner(false);
    setScanned(false);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permiso denegado", "Necesitamos permiso para usar la cámara.");
        return;
      }
    }
    setShowScanner(true);
  };

  const handleCreate = () => {
    if (!nombre || !codigoBarra || !precio || !localId) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    const data: ProductCreate = {
      nombre,
      codigo_barra: codigoBarra,
      precio: parseFloat(precio),
      local_id: localId,
    };

    createMutation.mutate(data);
  };

  return (
    <ThemedView safeArea style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText type="subtitle">Nuevo Producto</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nombre del Producto *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: Leche Entera 1L"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Código de Barras *</ThemedText>
          <View style={styles.barcodeInputContainer}>
            <TextInput
              style={[styles.input, styles.barcodeInput]}
              placeholder="Ej: 7791234567890"
              value={codigoBarra}
              onChangeText={setCodigoBarra}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
              <IconSymbol name="camera.fill" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Precio Inicial *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ej: 1250.50"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Supermercado *</ThemedText>
          {isLoadingLocals ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <View style={styles.localsGrid}>
              {locals?.map((local) => (
                <TouchableOpacity
                  key={local.id}
                  style={[
                    styles.localOption,
                    localId === local.id && styles.localOptionSelected,
                  ]}
                  onPress={() => setLocalId(local.id)}
                >
                  <ThemedText
                    style={[
                      styles.localOptionText,
                      localId === local.id && styles.localOptionTextSelected,
                    ]}
                  >
                    {local.nombre}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, createMutation.isPending && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={createMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {createMutation.isPending ? "Creando..." : "Crear Producto"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={styles.modalContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
            }}
          >
            <View style={styles.scannerOverlay}>
              <TouchableOpacity
                style={styles.closeScanner}
                onPress={() => setShowScanner(false)}
              >
                <IconSymbol name="xmark" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.scannerFrame} />
              <ThemedText style={styles.scannerText}>
                Escanea el código de barras
              </ThemedText>
            </View>
          </CameraView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
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
  barcodeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barcodeInput: {
    flex: 1,
  },
  scanButton: {
    backgroundColor: "#2563EB",
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  localsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  localOption: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  localOptionSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  localOptionText: {
    fontSize: 12,
    color: "#4B5563",
  },
  localOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#F59E0B",
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
  // Modal & Camera styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeScanner: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  scannerFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 12,
  },
  scannerText: {
    color: "#FFFFFF",
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
});
