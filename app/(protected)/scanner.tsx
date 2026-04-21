import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { productsService } from "@/services/products";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <ThemedView />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          Necesitamos tu permiso para usar la cámara
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Otorgar Permiso</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const product = await productsService.getProductByBarcode(data);
      if (product) {
        router.push({
          pathname: "/product-detail",
          params: { productId: product.id },
        });
      } else {
        Alert.alert(
          "Producto no encontrado",
          `¿Deseas registrar el producto con código ${data}?`,
          [
            { text: "Cancelar", onPress: () => setScanned(false) },
            {
              text: "Registrar",
              onPress: () => {
                // Navegar a crear producto (aún no implementado, pero podríamos ir a edit-price con el barcode)
                router.push({
                  pathname: "/edit-price",
                  params: { barcode: data },
                });
                setScanned(false);
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        "Error",
        "No se pudo buscar el producto. Verifica tu conexión.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedCenter}></View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}>
            <ThemedText style={styles.instructionText}>
              Escanea el código de barras del producto
            </ThemedText>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  focusedContainer: {
    flex: 2,
    flexDirection: "row",
  },
  focusedCenter: {
    flex: 6,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 10,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});
