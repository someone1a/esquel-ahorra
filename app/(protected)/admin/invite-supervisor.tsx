import { authService } from "@/services/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function InviteSupervisorScreen() {
  const [email, setEmail] = useState("");

  const inviteMutation = useMutation({
    mutationFn: authService.inviteSupervisor,
    onSuccess: () => {
      Alert.alert(
        "¡Éxito!",
        `Se ha enviado una invitación a ${email}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo enviar la invitación");
    },
  });

  const handleInvite = () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
      return;
    }

    inviteMutation.mutate(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>Invitar Supervisor</ThemedText>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person-add" size={64} color="#2563EB" />
            </View>
            
            <ThemedText style={styles.description}>
              Ingresá el correo electrónico de la persona que querés invitar como supervisora/or.
            </ThemedText>
            <ThemedText style={styles.info}>
              Se le enviará un email con un enlace para que pueda activar su cuenta y elegir una contraseña.
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Correo electrónico</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!inviteMutation.isPending}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (inviteMutation.isPending || !email) && styles.buttonDisabled,
              ]}
              onPress={handleInvite}
              disabled={inviteMutation.isPending || !email}
            >
              {inviteMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Enviar Invitación</Text>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 24,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#374151",
    marginBottom: 12,
    lineHeight: 24,
  },
  info: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
