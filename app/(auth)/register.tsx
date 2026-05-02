import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { Brand } from "@/utils/constants/brand";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{
    ref?: string | string[];
    rol?: string | string[];
  }>();

  const normalizeStringParam = (
    value: string | string[] | undefined
  ): string | undefined => {
    const raw = Array.isArray(value) ? value[0] : value;
    const trimmed = raw?.trim();
    if (!trimmed) return undefined;
    return trimmed;
  };

  const ref: string | undefined = normalizeStringParam(params.ref);
  const rawRolFromQuery = normalizeStringParam(params.rol)?.toLowerCase();
  const rolFromQuery: string | undefined =
    rawRolFromQuery && (rawRolFromQuery === "comprador" || rawRolFromQuery === "supervisor")
      ? rawRolFromQuery
      : undefined;

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRol] = useState("comprador");
  const { login } = useAuth();

  useEffect(() => {
    if (ref) setReferralCode(ref);
  }, [ref]);

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
    const effectiveRol = rolFromQuery ?? selectedRol;
    const normalizedReferralCode = referralCode.trim();

    if (!name || !lastname || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (effectiveRol === "supervisor" && !normalizedReferralCode) {
      Alert.alert(
        "Error",
        "Para registrarte como supervisor necesitás un código de invitación."
      );
      return;
    }

    const data: RegisterRequest = {
      name,
      lastname,
      email,
      password,
      confirm_password: confirmPassword,
      rol: effectiveRol,
      ...(normalizedReferralCode
        ? { referral_code: normalizedReferralCode }
        : {}),
    };
    registerMutation.mutate(data);
  };

  return (
    <ThemedView safeArea style={styles.container}>
      <ThemedText style={styles.title}>Registrarse</ThemedText>

      {rolFromQuery ? (
        <ThemedText style={styles.fixedInfo}>Rol: {rolFromQuery}</ThemedText>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={Brand.colors.muted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Apellido"
        placeholderTextColor={Brand.colors.muted}
        value={lastname}
        onChangeText={setLastname}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor={Brand.colors.muted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Código de invitación"
        placeholderTextColor={Brand.colors.muted}
        value={referralCode}
        onChangeText={setReferralCode}
        autoCapitalize="characters"
        editable={!ref}
      />

      {ref ? (
        <ThemedText style={styles.helperText}>
          Este código viene desde el link de invitación.
        </ThemedText>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={Brand.colors.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor={Brand.colors.muted}
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
  fixedInfo: {
    textAlign: "center",
    color: Brand.colors.text,
    marginBottom: 16,
  },
  helperText: {
    color: Brand.colors.muted,
    marginTop: -10,
    marginBottom: 16,
  },
  link: {
    textAlign: "center",
    color: Brand.colors.primary,
    textDecorationLine: "underline",
  },
});
