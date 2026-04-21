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
import { RegisterRequest } from "@/types/auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login } = useAuth();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      await login(data);
      router.replace("/");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Error al registrarse");
    },
  });

  const handleRegister = () => {
    if (!name || !lastname || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    const data: RegisterRequest = {
      name,
      lastname,
      email,
      password,
      confirm_password: confirmPassword,
      rol: "comprador",
    };
    registerMutation.mutate(data);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Registrarse</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={lastname}
        onChangeText={setLastname}
        autoCapitalize="words"
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[
          styles.button,
          registerMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleRegister}
        disabled={registerMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {registerMutation.isPending ? "Registrando..." : "Registrarse"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <ThemedText style={styles.link}>
          ¿Ya tienes una cuenta? Inicia sesión
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
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#2563EB",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#2563EB",
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
    color: "#2563EB",
    textDecorationLine: "underline",
  },
});
