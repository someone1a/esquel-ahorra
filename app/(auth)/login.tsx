import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authService } from "@/services/auth";
import { useAuth } from "@/store/auth-context";
import { LoginRequest } from "@/types/auth";
import { Brand } from "@/utils/constants/brand";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      await login(data);
      router.replace("/");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Error al iniciar sesión");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const data: LoginRequest = { email, password };
    loginMutation.mutate(data);
  };

  return (
    <ThemedView safeArea style={styles.container}>
      <ThemedText style={styles.title}>Iniciar Sesión</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[
          styles.button,
          loginMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {loginMutation.isPending ? "Iniciando sesión..." : "Ingresar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <ThemedText style={styles.link}>
          ¿No tienes una cuenta? Regístrate
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: Brand.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: Brand.colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.colors.border,
    color: "#000000",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Brand.colors.card,
  },
  button: {
    backgroundColor: Brand.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: Brand.colors.primary,
    textDecorationLine: "underline",
  },
});
